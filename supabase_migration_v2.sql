-- ============================================================
-- TCI 멀티유저 시스템 마이그레이션 V2
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================================

-- ============================================================
-- 0. 사전 준비: users 테이블이 없으면 생성
-- ============================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 1. users 테이블 컬럼 추가
-- ============================================================
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT
  DEFAULT 'client'
  CHECK (role IN ('admin', 'counselor', 'client'));

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS gender TEXT
  CHECK (gender IN ('남', '여'));

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS birth_year INTEGER;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.users ADD COLUMN IF NOT EXISTS join_path TEXT;

-- organization 컬럼 제거 (있을 경우)
ALTER TABLE public.users DROP COLUMN IF EXISTS organization;

-- ============================================================
-- 1-2. groups 테이블에 user_id 컬럼 추가 (없을 경우)
-- ============================================================
ALTER TABLE public.groups ADD COLUMN IF NOT EXISTS user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_groups_user_id ON public.groups(user_id);

-- ============================================================
-- 2. members 테이블에 client_user_id 추가
-- ============================================================
ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS client_user_id UUID
  REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_members_client_user_id
  ON public.members(client_user_id);

-- ============================================================
-- 3. 역할 판별 보조 함수 (RLS 순환 참조 방지용)
-- ============================================================
CREATE OR REPLACE FUNCTION public.get_my_role()
RETURNS TEXT AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 4. handle_new_user 트리거 업데이트
--    - 회원가입 시 메타데이터(name, gender, birth_year, phone, join_path) 저장
--    - role은 기본 'client'
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name, role, gender, birth_year, phone, join_path)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    'client',
    NEW.raw_user_meta_data->>'gender',
    (NEW.raw_user_meta_data->>'birth_year')::INTEGER,
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'join_path'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 5. RLS 활성화
-- ============================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 6. 기존 RLS 정책 모두 삭제
-- ============================================================
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "users_select" ON public.users;
DROP POLICY IF EXISTS "users_insert_self" ON public.users;
DROP POLICY IF EXISTS "users_update_self" ON public.users;
DROP POLICY IF EXISTS "users_admin_update" ON public.users;

DROP POLICY IF EXISTS "Users can view own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can create own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can update own groups" ON public.groups;
DROP POLICY IF EXISTS "Users can delete own groups" ON public.groups;
DROP POLICY IF EXISTS "groups_all" ON public.groups;

DROP POLICY IF EXISTS "Users can view members of own groups" ON public.members;
DROP POLICY IF EXISTS "Users can insert members to own groups" ON public.members;
DROP POLICY IF EXISTS "Users can update members of own groups" ON public.members;
DROP POLICY IF EXISTS "Users can delete members of own groups" ON public.members;
DROP POLICY IF EXISTS "members_counselor_admin" ON public.members;
DROP POLICY IF EXISTS "members_client_self" ON public.members;

-- ============================================================
-- 7. users 테이블 RLS 정책
--    - 인증된 사용자 전체 조회 (내부 도구 특성상)
--    - 본인만 UPDATE
--    - 어드민은 모든 UPDATE (역할 변경 포함)
-- ============================================================
CREATE POLICY "users_select_authenticated"
  ON public.users FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "users_insert_self"
  ON public.users FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_update_self"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "users_admin_update_all"
  ON public.users FOR UPDATE
  USING (public.get_my_role() = 'admin');

-- ============================================================
-- 8. groups 테이블 RLS 정책
--    - 상담자: 본인 groups (user_id = auth.uid())
--    - 어드민: 전체
-- ============================================================
CREATE POLICY "groups_counselor_own"
  ON public.groups FOR ALL
  USING (
    auth.uid() = user_id OR public.get_my_role() = 'admin'
  )
  WITH CHECK (
    auth.uid() = user_id OR public.get_my_role() = 'admin'
  );

-- ============================================================
-- 9. members 테이블 RLS 정책
--    - 상담자/어드민: 본인 group 소속 멤버 CRUD
--    - 내담자: client_user_id = auth.uid() 인 행만 SELECT
-- ============================================================
CREATE POLICY "members_counselor_admin"
  ON public.members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.groups g
      WHERE g.id = members.group_id
      AND (g.user_id = auth.uid() OR public.get_my_role() = 'admin')
    )
  );

CREATE POLICY "members_client_self"
  ON public.members FOR SELECT
  USING (client_user_id = auth.uid());

-- ============================================================
-- 10. groups.user_id NULL 허용으로 변경 (기존 데이터 호환)
-- ============================================================
ALTER TABLE public.groups ALTER COLUMN user_id DROP NOT NULL;

-- ============================================================
-- 11. 기존 데이터 처리 (어드민 계정 생성 후 실행)
-- ============================================================
-- 아래 단계를 순서대로 진행:
--
-- [1단계] Supabase Dashboard > Authentication > Users 에서 어드민 계정 생성
--         (이메일/비밀번호 방식)
--
-- [2단계] 생성된 어드민의 UUID 확인 후 role 업데이트:
--   UPDATE public.users SET role = 'admin' WHERE email = 'your@email.com';
--
-- [3단계] 기존 groups를 어드민에게 귀속 (user_id가 NULL인 경우):
--   UPDATE public.groups
--     SET user_id = (SELECT id FROM public.users WHERE role = 'admin' LIMIT 1)
--   WHERE user_id IS NULL;

-- ============================================================
-- 완료
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TCI 멀티유저 마이그레이션 V2 완료';
  RAISE NOTICE '========================================';
  RAISE NOTICE '변경 사항:';
  RAISE NOTICE '  - users: role, gender, birth_year, phone, join_path 추가';
  RAISE NOTICE '  - members: client_user_id 추가';
  RAISE NOTICE '  - RLS 정책: 역할 기반 접근 제어 적용';
  RAISE NOTICE '  - 트리거: handle_new_user 업데이트';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '다음 단계: 어드민 계정 생성 후 위 11번 주석 실행';
  RAISE NOTICE '========================================';
END $$;
