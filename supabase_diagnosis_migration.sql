-- ============================================================
-- TCI 진단 신청 테이블 마이그레이션
-- 실행: Supabase Dashboard > SQL Editor
-- ============================================================

CREATE TABLE IF NOT EXISTS public.diagnosis_applications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  phone TEXT,
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'paid', 'link_sent', 'completed', 'cancelled')),
  admin_note TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_diagnosis_applications_user_id
  ON public.diagnosis_applications(user_id);

CREATE INDEX IF NOT EXISTS idx_diagnosis_applications_status
  ON public.diagnosis_applications(status);

-- RLS 활성화
ALTER TABLE public.diagnosis_applications ENABLE ROW LEVEL SECURITY;

-- 기존 정책 초기화
DROP POLICY IF EXISTS "apps_select" ON public.diagnosis_applications;
DROP POLICY IF EXISTS "apps_insert_self" ON public.diagnosis_applications;
DROP POLICY IF EXISTS "apps_update_admin" ON public.diagnosis_applications;

-- 본인 또는 어드민/상담자: 조회
CREATE POLICY "apps_select"
  ON public.diagnosis_applications FOR SELECT
  USING (user_id = auth.uid() OR public.get_my_role() IN ('admin', 'counselor'));

-- 본인만: 신청 등록
CREATE POLICY "apps_insert_self"
  ON public.diagnosis_applications FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- 어드민/상담자만: 상태·메모 수정
CREATE POLICY "apps_update_admin"
  ON public.diagnosis_applications FOR UPDATE
  USING (public.get_my_role() IN ('admin', 'counselor'));

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION public.update_diagnosis_application_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_diagnosis_application_timestamp ON public.diagnosis_applications;
CREATE TRIGGER set_diagnosis_application_timestamp
  BEFORE UPDATE ON public.diagnosis_applications
  FOR EACH ROW EXECUTE FUNCTION public.update_diagnosis_application_timestamp();

DO $$
BEGIN
  RAISE NOTICE '진단 신청 테이블(diagnosis_applications) 마이그레이션 완료';
END $$;
