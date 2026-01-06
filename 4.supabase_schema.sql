-- ============================================================
-- TCI 그룹 분석 서비스 - Supabase 데이터베이스 스키마
-- Version 2.0 | 2026-01-06
-- ============================================================
-- 사용법: Supabase Dashboard > SQL Editor에서 실행
-- ============================================================

-- ============================================================
-- 1. 확장 기능 활성화
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";


-- ============================================================
-- 2. 사용자 테이블 (users)
-- ============================================================
-- Supabase Auth와 연동되는 사용자 프로필 테이블
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  organization TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- RLS(Row Level Security) 활성화
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 데이터만 조회/수정 가능
CREATE POLICY "Users can view own profile" 
  ON public.users FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
  ON public.users FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" 
  ON public.users FOR INSERT 
  WITH CHECK (auth.uid() = id);


-- ============================================================
-- 3. 그룹 테이블 (groups)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.groups (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_groups_user_id ON public.groups(user_id);
CREATE INDEX IF NOT EXISTS idx_groups_created_at ON public.groups(created_at DESC);

-- RLS 활성화
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;

-- 정책: 사용자는 자신의 그룹만 CRUD 가능
CREATE POLICY "Users can view own groups" 
  ON public.groups FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own groups" 
  ON public.groups FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own groups" 
  ON public.groups FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own groups" 
  ON public.groups FOR DELETE 
  USING (auth.uid() = user_id);


-- ============================================================
-- 4. 참가자(멤버) 테이블 (members)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.members (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  group_id UUID NOT NULL REFERENCES public.groups(id) ON DELETE CASCADE,
  
  -- 기본 정보
  name TEXT NOT NULL,
  gender TEXT CHECK (gender IN ('남', '여')),
  age INTEGER,
  
  -- 상위지표 원점수 (Raw Score)
  ns INTEGER,  -- 자극추구
  ha INTEGER,  -- 위험회피
  rd INTEGER,  -- 사회적민감성
  ps INTEGER,  -- 인내력
  sd INTEGER,  -- 자율성
  co INTEGER,  -- 연대감
  st INTEGER,  -- 자기초월
  
  -- 상위지표 T점수
  ns_t INTEGER,
  ha_t INTEGER,
  rd_t INTEGER,
  ps_t INTEGER,
  sd_t INTEGER,
  co_t INTEGER,
  st_t INTEGER,
  
  -- 상위지표 백분위 (Percentile)
  ns_p INTEGER,
  ha_p INTEGER,
  rd_p INTEGER,
  ps_p INTEGER,
  sd_p INTEGER,
  co_p INTEGER,
  st_p INTEGER,
  
  -- 자율성+연대감 합산 (SC)
  sc INTEGER,       -- 원점수
  sc_t INTEGER,     -- T점수
  sc_p INTEGER,     -- 백분위
  
  -- 하위지표 원점수: 자극추구(NS)
  ns1 INTEGER,  -- 탐색적 흥분
  ns2 INTEGER,  -- 충동성
  ns3 INTEGER,  -- 사치/낭비
  ns4 INTEGER,  -- 무질서
  
  -- 하위지표 원점수: 위험회피(HA)
  ha1 INTEGER,  -- 예기불안
  ha2 INTEGER,  -- 불확실성에 대한 두려움
  ha3 INTEGER,  -- 낯선 사람에 대한 수줍음
  ha4 INTEGER,  -- 쉽게 피로해짐
  
  -- 하위지표 원점수: 사회적민감성(RD)
  rd1 INTEGER,  -- 정서적 감수성
  rd2 INTEGER,  -- 정서적 개방성
  rd3 INTEGER,  -- 친밀감
  rd4 INTEGER,  -- 의존
  
  -- 하위지표 원점수: 인내력(PS)
  ps1 INTEGER,  -- 근면
  ps2 INTEGER,  -- 끈기
  ps3 INTEGER,  -- 성취에 대한 야망
  ps4 INTEGER,  -- 완벽주의
  
  -- 하위지표 원점수: 자율성(SD)
  sd1 INTEGER,  -- 책임감
  sd2 INTEGER,  -- 목적의식
  sd3 INTEGER,  -- 유능감
  sd4 INTEGER,  -- 자기수용
  sd5 INTEGER,  -- 자기일치
  
  -- 하위지표 원점수: 연대감(CO)
  co1 INTEGER,  -- 타인수용
  co2 INTEGER,  -- 공감
  co3 INTEGER,  -- 이타성
  co4 INTEGER,  -- 관대함
  co5 INTEGER,  -- 공평
  
  -- 하위지표 원점수: 자기초월(ST)
  st1 INTEGER,  -- 창조적 자기망각
  st2 INTEGER,  -- 우주만물과의 일체감
  st3 INTEGER,  -- 영성 수용
  
  -- 자동 계산 필드: 유형 코드
  temperament_type TEXT,  -- 기질유형 코드 (예: 'HML', 'LHH')
  character_type TEXT,    -- 성격유형 코드 (예: 'HHL', 'LLH')
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_members_group_id ON public.members(group_id);
CREATE INDEX IF NOT EXISTS idx_members_temperament_type ON public.members(temperament_type);
CREATE INDEX IF NOT EXISTS idx_members_character_type ON public.members(character_type);

-- RLS 활성화
ALTER TABLE public.members ENABLE ROW LEVEL SECURITY;

-- 정책: 그룹 소유자만 멤버 CRUD 가능
CREATE POLICY "Users can view members of own groups" 
  ON public.members FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = members.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert members to own groups" 
  ON public.members FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = members.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update members of own groups" 
  ON public.members FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = members.group_id 
      AND groups.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete members of own groups" 
  ON public.members FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.groups 
      WHERE groups.id = members.group_id 
      AND groups.user_id = auth.uid()
    )
  );


-- ============================================================
-- 5. 해석 데이터 테이블 (interpretations)
-- ============================================================
-- 기질/성격 유형별 해석 텍스트 저장
CREATE TABLE IF NOT EXISTS public.interpretations (
  id SERIAL PRIMARY KEY,
  category TEXT NOT NULL,  -- 'temperament', 'character', 'scale', 'interaction'
  type_code TEXT NOT NULL, -- 'HML', 'NS-높음', 'NS-HA-HH' 등
  type_name TEXT,          -- 유형명 (예: '독립적인-자유주의적인')
  type_name_alt TEXT,      -- 대안 유형명 (예: 성격장애 경향성명)
  description TEXT NOT NULL,
  strengths TEXT,
  weaknesses TEXT,
  coaching_tips TEXT,
  personality_disorder_tendency TEXT,
  keywords TEXT,           -- 키워드 (쉼표 구분)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- 복합 유니크 제약
  UNIQUE(category, type_code)
);

-- 인덱스
CREATE INDEX IF NOT EXISTS idx_interpretations_category ON public.interpretations(category);
CREATE INDEX IF NOT EXISTS idx_interpretations_type_code ON public.interpretations(type_code);

-- RLS 활성화 (읽기 전용으로 모든 인증된 사용자에게 공개)
ALTER TABLE public.interpretations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read interpretations" 
  ON public.interpretations FOR SELECT 
  TO authenticated
  USING (true);


-- ============================================================
-- 6. 트리거 함수: updated_at 자동 갱신
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- users 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- groups 테이블에 트리거 적용
DROP TRIGGER IF EXISTS update_groups_updated_at ON public.groups;
CREATE TRIGGER update_groups_updated_at
  BEFORE UPDATE ON public.groups
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- 7. 트리거 함수: 유형 코드 자동 계산
-- ============================================================
CREATE OR REPLACE FUNCTION calculate_type_codes()
RETURNS TRIGGER AS $$
DECLARE
  ns_level TEXT;
  ha_level TEXT;
  rd_level TEXT;
  sd_level TEXT;
  co_level TEXT;
  st_level TEXT;
BEGIN
  -- T점수 기반 레벨 계산 함수
  -- < 45: L, 45-55: M, > 55: H
  
  -- 기질 유형 계산 (NS, HA, RD)
  IF NEW.ns_t IS NOT NULL THEN
    IF NEW.ns_t < 45 THEN ns_level := 'L';
    ELSIF NEW.ns_t <= 55 THEN ns_level := 'M';
    ELSE ns_level := 'H';
    END IF;
  ELSE
    ns_level := 'M';
  END IF;
  
  IF NEW.ha_t IS NOT NULL THEN
    IF NEW.ha_t < 45 THEN ha_level := 'L';
    ELSIF NEW.ha_t <= 55 THEN ha_level := 'M';
    ELSE ha_level := 'H';
    END IF;
  ELSE
    ha_level := 'M';
  END IF;
  
  IF NEW.rd_t IS NOT NULL THEN
    IF NEW.rd_t < 45 THEN rd_level := 'L';
    ELSIF NEW.rd_t <= 55 THEN rd_level := 'M';
    ELSE rd_level := 'H';
    END IF;
  ELSE
    rd_level := 'M';
  END IF;
  
  NEW.temperament_type := ns_level || ha_level || rd_level;
  
  -- 성격 유형 계산 (SD, CO, ST)
  IF NEW.sd_t IS NOT NULL THEN
    IF NEW.sd_t < 45 THEN sd_level := 'L';
    ELSIF NEW.sd_t <= 55 THEN sd_level := 'M';
    ELSE sd_level := 'H';
    END IF;
  ELSE
    sd_level := 'M';
  END IF;
  
  IF NEW.co_t IS NOT NULL THEN
    IF NEW.co_t < 45 THEN co_level := 'L';
    ELSIF NEW.co_t <= 55 THEN co_level := 'M';
    ELSE co_level := 'H';
    END IF;
  ELSE
    co_level := 'M';
  END IF;
  
  IF NEW.st_t IS NOT NULL THEN
    IF NEW.st_t < 45 THEN st_level := 'L';
    ELSIF NEW.st_t <= 55 THEN st_level := 'M';
    ELSE st_level := 'H';
    END IF;
  ELSE
    st_level := 'M';
  END IF;
  
  NEW.character_type := sd_level || co_level || st_level;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- members 테이블에 트리거 적용
DROP TRIGGER IF EXISTS calculate_member_type_codes ON public.members;
CREATE TRIGGER calculate_member_type_codes
  BEFORE INSERT OR UPDATE ON public.members
  FOR EACH ROW
  EXECUTE FUNCTION calculate_type_codes();


-- ============================================================
-- 8. 뷰: 그룹별 통계
-- ============================================================
CREATE OR REPLACE VIEW public.group_statistics AS
SELECT 
  g.id AS group_id,
  g.name AS group_name,
  g.user_id,
  COUNT(m.id) AS member_count,
  ROUND(AVG(m.ns_t), 1) AS avg_ns_t,
  ROUND(AVG(m.ha_t), 1) AS avg_ha_t,
  ROUND(AVG(m.rd_t), 1) AS avg_rd_t,
  ROUND(AVG(m.ps_t), 1) AS avg_ps_t,
  ROUND(AVG(m.sd_t), 1) AS avg_sd_t,
  ROUND(AVG(m.co_t), 1) AS avg_co_t,
  ROUND(AVG(m.st_t), 1) AS avg_st_t,
  g.created_at,
  g.updated_at
FROM public.groups g
LEFT JOIN public.members m ON g.id = m.group_id
GROUP BY g.id, g.name, g.user_id, g.created_at, g.updated_at;


-- ============================================================
-- 9. 뷰: 유형별 분포
-- ============================================================
CREATE OR REPLACE VIEW public.type_distribution AS
SELECT 
  g.id AS group_id,
  g.name AS group_name,
  m.temperament_type,
  m.character_type,
  COUNT(*) AS count
FROM public.groups g
JOIN public.members m ON g.id = m.group_id
GROUP BY g.id, g.name, m.temperament_type, m.character_type
ORDER BY g.id, count DESC;


-- ============================================================
-- 10. 함수: 신규 사용자 프로필 자동 생성
-- ============================================================
-- Supabase Auth 회원가입 시 자동으로 users 테이블에 프로필 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Auth 트리거 (이미 존재하면 무시)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 11. 초기 해석 데이터 시딩 (샘플)
-- ============================================================
-- 전체 해석 데이터는 tci_interpretations.js에서 가져와 삽입
-- 여기서는 샘플 몇 개만 삽입

INSERT INTO public.interpretations (category, type_code, type_name, description, strengths, weaknesses, coaching_tips) 
VALUES 
  ('temperament', 'MMM', '균형잡힌', 
   '다양한 상황에서 융통성 있고 탄력 있게 대처할 수 있는 잠재력을 지님. 새로운 자극을 흥미를 가지고 탐색하지만, 쉽게 흥분하거나 성급하게 몰입하지는 않는다.', 
   '융통성, 적응력, 감정 안정성, 균형잡힌 대인관계', 
   '뚜렷한 개성이 부족해 보일 수 있음', 
   '균형을 유지하면서 자신만의 강점 영역을 더 개발하도록 격려'),
   
  ('temperament', 'HML', '독립적인-자유주의적인', 
   '진취적이고 순발력이 있으며, 자기 주장과 입장이 분명한 독립적인 사람. 다른 사람의 평가보다는 자신의 판단에 우선 순위를 두고 소신껏 행동한다.', 
   '진취성, 순발력, 소신, 독립성, 도전정신', 
   '자기중심적이고 기회주의적 인상. 타인의 입장이나 감정 이해 부족', 
   '독립성을 강점으로 인정하되, 중요한 관계에서 상대방 관점 경청 연습'),
   
  ('character', 'HHH', '창조적인', 
   '창조적이고 수용적이며 사려 깊고 성숙한 모습을 보인다. 대체로 긍정적인 감정을 자주 느끼고, 개인적인 욕구를 넘어서서 보다 의미 있는 목표와 가치를 추구하려는 동기가 높다.', 
   '창조성, 수용성, 사려깊음, 성숙함, 긍정성, 겸손, 자기실현, 낙관성', 
   '특별히 두드러지는 약점 없음', 
   '현재의 성숙함을 유지하면서 지속적인 성장과 나눔 추구'),
   
  ('character', 'LLL', '풀이죽은/우울성', 
   '자기중심적이고 미성숙하며, 감정의 기복이 심하다. "인생은 힘든 세상과의 고달픈 싸움"이라고 생각하는 경향이 있다. 우울감이나 무력감을 잘 느끼고, 우울증에 취약하다.', 
   '특별히 두드러지는 강점 발견 필요', 
   '자기중심적, 미성숙, 감정기복, 부정적 사고, 수치심, 불행감, 분노, 미움, 우울, 무력감', 
   '전문적 상담 권장. 작은 긍정적 경험 쌓기. 인지 재구성 연습')
   
ON CONFLICT (category, type_code) DO UPDATE 
SET 
  type_name = EXCLUDED.type_name,
  description = EXCLUDED.description,
  strengths = EXCLUDED.strengths,
  weaknesses = EXCLUDED.weaknesses,
  coaching_tips = EXCLUDED.coaching_tips;


-- ============================================================
-- 완료 메시지
-- ============================================================
DO $$
BEGIN
  RAISE NOTICE '========================================';
  RAISE NOTICE 'TCI 데이터베이스 스키마 생성 완료!';
  RAISE NOTICE '========================================';
  RAISE NOTICE '생성된 테이블:';
  RAISE NOTICE '  - users (사용자 프로필)';
  RAISE NOTICE '  - groups (그룹)';
  RAISE NOTICE '  - members (참가자/TCI 데이터)';
  RAISE NOTICE '  - interpretations (해석 데이터)';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE '생성된 뷰:';
  RAISE NOTICE '  - group_statistics (그룹별 통계)';
  RAISE NOTICE '  - type_distribution (유형별 분포)';
  RAISE NOTICE '----------------------------------------';
  RAISE NOTICE 'RLS 정책 적용됨: 모든 테이블';
  RAISE NOTICE '자동 트리거: updated_at, 유형코드 계산, 신규사용자 프로필';
  RAISE NOTICE '========================================';
END $$;
