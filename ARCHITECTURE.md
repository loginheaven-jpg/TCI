# TCI 그룹분석 시스템 아키텍처

> **최종 업데이트**: 2026-03-17
> **버전**: 2.0.0
> **배포**: Vercel (정적 SPA)
> **저장소**: https://github.com/loginheaven-jpg/TCI

---

## 1. 프로젝트 개요

**TCI(Temperament and Character Inventory) 기질 및 성격검사 분석 플랫폼**

CSV로 업로드된 TCI 검사 결과(백분위)를 기반으로 개인진단, 그룹분석, 커플분석을 제공하는 React SPA 웹 애플리케이션.

### 핵심 철학
- **긍정 심리학 관점**: 모든 기질과 성격을 강점으로 해석 (예: 높은 HA → "세심한 준비성")
- **코칭 지향**: 진단이 아닌 성장 방향 제시
- **관계 보완 관점**: 차이를 결함이 아닌 보완 자원으로 해석

---

## 2. 기술 스택

| 구분 | 기술 | 버전 |
|------|------|------|
| **프레임워크** | React | 18.2 |
| **빌드** | Vite | 5.x |
| **스타일** | Tailwind CSS | 3.4 |
| **차트** | Recharts (레이더/산점도), 커스텀 SVG (덤벨 도트) | 2.10 |
| **CSV 파싱** | PapaParse | 5.4 |
| **PDF 생성** | @react-pdf/renderer | 4.3 |
| **DB** | Supabase (PostgreSQL) | 2.89 |
| **AI 분석** | 외부 AI Gateway (Railway) → Claude API | - |
| **배포** | Vercel | - |

### 환경변수

| 변수명 | 용도 |
|--------|------|
| `VITE_SUPABASE_URL` | Supabase 프로젝트 URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase 익명 키 |
| `VITE_AI_GATEWAY_URL` | AI Gateway 엔드포인트 (기본: `https://ai-gateway20251125.up.railway.app`) |

---

## 3. 디렉터리 구조

```
TCI/
├── src/
│   ├── main.jsx                    # 엔트리포인트
│   ├── index.css                   # Tailwind 기본 스타일
│   ├── App.jsx                     # 메인 앱 (라우팅, 상태관리, CRUD) ─ 2,871줄
│   ├── supabaseClient.js           # Supabase 클라이언트 초기화
│   ├── components/
│   │   ├── CoupleAnalysisPage.jsx  # 커플분석 4탭 UI + AI 분석 ─ 795줄
│   │   ├── CouplePDFReport.jsx     # 커플 PDF 6페이지 레이아웃 ─ 542줄
│   │   ├── PDFReport.jsx           # 개인/그룹 PDF 3페이지 레이아웃 ─ 747줄
│   │   └── SettingsPage.jsx        # 지표 설정 (상위/하위/규준) ─ 539줄
│   └── data/
│       ├── interpretations.js      # 기질/성격 해석 데이터 ─ 905줄
│       └── coupleInterpretations.js # 커플 역동/소통 해석 ─ 547줄
├── src_backup/                     # 이전 버전 백업 (사용 안 함)
├── dist/                           # 빌드 결과물 (Vercel 배포)
├── package.json
├── vite.config.js                  # 포트 5173, sourcemap 활성
├── tailwind.config.js
└── CLAUDE.md                       # AI 작업 원칙
```

---

## 4. 페이지 라우팅

`App.jsx`의 `page` state 기반 조건부 렌더링 (React Router 미사용).

```
page 값           → 렌더링 컴포넌트          설명
─────────────────────────────────────────────────────
'list'            → App 내부 (그룹 목록)      메인 대시보드, 그룹 카드 목록
'create'          → App 내부 (생성 폼)        그룹 생성 또는 개인진단 (isIndividualMode로 분기)
'edit'            → App 내부 (수정 폼)        그룹명/멤버명 수정
'analysis'        → <AnalysisPage />          그룹/개인 분석 대시보드
'couple-create'   → App 내부 (커플 설정)      커플분석 데이터 입력 (CSV/기존선택)
'couple-analysis' → <CoupleAnalysisPage />    커플분석 4탭 결과
'settings'        → <SettingsPage />          해석 지표 커스터마이징
```

---

## 5. 상태 관리 (App.jsx)

React Router 없이 `useState`로 전체 상태를 관리.

### 5.1 핵심 State 변수 (24개)

| 카테고리 | 변수명 | 타입 | 설명 |
|---------|--------|------|------|
| **페이지** | `page` | string | 현재 활성 페이지 |
| **데이터** | `groups` | array | DB에서 로드한 전체 그룹+멤버 |
| | `selectedGroup` | object | 분석 대상 그룹 |
| | `loading` | boolean | 초기 데이터 로드 상태 |
| **그룹 CRUD** | `newGroup` | {name, desc} | 생성 폼 데이터 |
| | `editingGroup` | object\|null | 수정 중인 그룹 |
| | `uploadedData` | array\|null | CSV 파싱 결과 |
| | `nameMapping` | array | 이름 익명화 매핑 |
| | `showNameMappingModal` | boolean | 이름 매칭 모달 |
| **개인진단** | `isIndividualMode` | boolean | 개인진단 모드 플래그 |
| | `individualSelectMode` | 'upload'\|'select' | CSV 업로드 vs 기존 멤버 선택 |
| | `individualSelectedMember` | object\|null | 선택된 기존 검사자 |
| **커플분석** | `couplePersonA` | object\|null | Person A 데이터 |
| | `couplePersonB` | object\|null | Person B 데이터 |
| | `coupleRelType` | string | 관계유형 (COUPLE/PARENT_CHILD/FRIENDS/COLLEAGUES) |
| | `coupleSelectMode` | 'upload'\|'select' | 입력 방식 |
| **설정** | `customMainScaleTraits` | object\|null | 커스텀 상위척도 해석 |
| | `customScaleTraits` | object\|null | 커스텀 하위척도 해석 |
| | `customNorms` | object\|null | 커스텀 규준 데이터 |
| **분석 뷰** | `selectedPersons` | Set | 선택된 멤버 (복수 선택) |
| | `mainTab` | string | 기질/성격 탭 |
| | `subTab` | string | 세부 척도 탭 |
| | `viewMode` | string | group/individual/scatter 뷰 |
| | `compareScales` | array[2] | 산점도 비교 축 |

### 5.2 주요 함수

| 함수명 | 위치 | 역할 |
|--------|------|------|
| `loadGroups()` | ~610 | Supabase에서 groups+members 로드 → state 세팅 |
| `handleCreateGroup()` | ~678 | 그룹 + 멤버 Supabase 저장 |
| `handleFileUpload(e)` | ~738 | CSV 파싱 (EUC-KR/UTF-8 자동감지), 이름 익명화 |
| `handleCoupleFileUpload(e, target)` | ~846 | 커플용 CSV 파싱 (A/B 구분) |
| `anonymizeName(name)` | ~85 | 한글 성명 → 성+초성영문 변환 |
| `handleDeleteGroup(id)` | ~907 | 그룹+멤버 삭제 (cascade) |

---

## 6. 데이터베이스 스키마 (Supabase)

### 6.1 groups 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 자동 생성 |
| `name` | text | 그룹명 또는 개인명 |
| `description` | text | 설명 (선택) |
| `created_at` | timestamptz | 생성일시 |

### 6.2 members 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| `id` | UUID (PK) | 자동 생성 |
| `group_id` | UUID (FK → groups.id) | 소속 그룹 |
| `name` | text | 표시 이름 (익명화) |
| `original_name` | text | 원본 이름 |
| `gender` | text | 성별 (M/F) |
| `age` | integer | 나이 |
| **상위척도 (백분위 0-100)** | | |
| `ns` | integer | 자극추구 (Novelty Seeking) |
| `ha` | integer | 위험회피 (Harm Avoidance) |
| `rd` | integer | 사회적 민감성 (Reward Dependence) |
| `ps` | integer | 인내력 (Persistence) |
| `sd` | integer | 자율성 (Self-Directedness) |
| `co` | integer | 협력성 (Cooperativeness) |
| `st` | integer | 자기초월 (Self-Transcendence) |
| **하위척도 (23개, 원점수)** | | |
| `ns1`~`ns4` | integer | NS 하위 4개 |
| `ha1`~`ha4` | integer | HA 하위 4개 |
| `rd1`~`rd4` | integer | RD 하위 4개 |
| `ps1`~`ps4` | integer | PS 하위 4개 |
| `sd1`~`sd5` | integer | SD 하위 5개 |
| `co1`~`co5` | integer | CO 하위 5개 |
| `st1`~`st3` | integer | ST 하위 3개 |

---

## 7. TCI 척도 체계

### 7.1 상위척도 7개

| 코드 | 한글명 | 영문명 | 하위척도 수 | 분류 |
|------|--------|--------|------------|------|
| NS | 자극추구 | Novelty Seeking | 4 (NS1~NS4) | 기질 |
| HA | 위험회피 | Harm Avoidance | 4 (HA1~HA4) | 기질 |
| RD | 사회적 민감성 | Reward Dependence | 4 (RD1~RD4) | 기질 |
| PS | 인내력 | Persistence | 4 (PS1~PS4) | 기질 |
| SD | 자율성 | Self-Directedness | 5 (SD1~SD5) | 성격 |
| CO | 협력성 | Cooperativeness | 5 (CO1~CO5) | 성격 |
| ST | 자기초월 | Self-Transcendence | 3 (ST1~ST3) | 성격 |

### 7.2 5단계 레벨 시스템

```
백분위 ≥ 81  →  VH (Very High)
61 ~ 80      →  H  (High)
41 ~ 60      →  M  (Medium)
21 ~ 40      →  L  (Low)
≤ 20         →  VL (Very Low)
```

### 7.3 기질/성격 유형 분류

- **기질유형**: NS × HA × RD 3척도 조합 → 27가지 (예: HMM = "높은 자극추구형")
- **성격유형**: SD × CO × ST 3척도 조합 → 27가지 (예: HHM = "자율적 협력가")
- 각 유형별 `name`, `description`, `strengths`, `weaknesses`, `coachingTips` 제공

---

## 8. 주요 컴포넌트 상세

### 8.1 AnalysisPage (App.jsx 내부, ~1,507행)

그룹/개인 분석 대시보드. `group.members`를 기반으로 시각화.

| 뷰 모드 | 설명 |
|---------|------|
| **group** | 전체 멤버 바 차트 비교 |
| **individual** | 선택 멤버 개인 리포트 (기질유형, 성격유형, 상호작용, 코칭가이드) |
| **scatter** | 2개 척도 산점도 (X/Y 축 선택) |

**개인 리포트 구성:**
1. 상위 7척도 바 차트
2. 기질유형 (27유형 중 매칭) + 성격유형
3. 기질 상호작용 분석 (NS×HA, NS×RD, HA×RD)
4. 하위척도 상세 (접힘/펼침)
5. 코칭 가이드

### 8.2 CoupleAnalysisPage.jsx (795줄)

커플/관계 분석 전용 페이지. `personA`, `personB` props 기반.

**4개 탭:**

| 탭 | 함수명 | 핵심 내용 |
|----|--------|----------|
| **관계 요약** | `renderOverview()` | 핵심 역동, 레이더 차트, 덤벨 도트 차트(기질), 성격 성숙도 바, AI 심층 분석 |
| **기질 비교** | `renderTemperament()` | 4척도 개별 선택 → 시너지/갈등/상호이해/추천 |
| **성격 분석** | `renderCharacter()` | SD·CO 조합분석, 회복탄력성 지표 |
| **소통 가이드** | `renderCommunication()` | 쌍방향 칭찬/요청법, 갈등 해결 4단계, 성장 로드맵 |

**분석 로직:**
```javascript
// 각 척도별 분석 객체 생성
analysis[s] = {
  scoreA, scoreB,           // 백분위 점수
  levelA, levelB,           // 5단계 (VH/H/M/L/VL)
  gap,                      // 절대 차이
  gapCategory,              // 'similar'(≤10) | 'moderate'(11~25) | 'contrast'(26+)
  combinationKey            // "H-M" 형식 → TEMPERAMENT_DYNAMICS에서 해석 검색
};
```

**차트 시각화:**
- **덤벨 도트 차트** (SVG): 0~100 캡슐형 트랙 위에 두 점(A: #60A5FA, B: #F97316) 배치, 연결선으로 차이 시각화
  - 차이 구간 색상: 초록(유사) / 노랑(보통) / 빨강(대비)
  - 양 끝 특성 방향 라벨 (예: `← 안정·신중` / `모험·혁신 →`)
  - 점수 가까울 때 라벨 위/아래 자동 분리
- **레이더 차트** (Recharts): 7척도 비교 오버레이
- **성격 성숙도 바**: SD/CO/ST 세로 바 차트

**AI 심층 분석:**
- 엔드포인트: `${AI_GATEWAY_URL}/api/ai/chat`
- 시스템 프롬프트: TCI 핵심 철학 30줄 (긍정 해석, 관계 강점 중심)
- 응답 파싱: `## 핵심 역동`, `## 관계 강점`, `## 활용 전략`, `## 실천 제안` 4섹션
- 마크다운 렌더링 (볼드, 리스트 등 HTML 변환)

### 8.3 PDFReport.jsx (747줄)

`@react-pdf/renderer` 기반 개인/그룹 PDF 생성.

| 리포트 타입 | 페이지 수 | 내용 |
|------------|----------|------|
| `full` | 3 | 상위지표 + 기질/성격유형 + 하위지표 전체 + 코칭가이드 |
| `indicators` | 2 | 상위지표 요약 + 하위지표 테이블 |

**하위척도 백분위 변환:**
```javascript
// 원점수 → Z-score → 백분위
const pct = Math.round(((value - norm.m) / norm.sd + 3) / 6 * 100);
```

### 8.4 CouplePDFReport.jsx (542줄)

커플 전용 6페이지 PDF.

| 페이지 | 내용 |
|--------|------|
| 1 | 커버 + 핵심 역동 + 7척도 비교 테이블 + 강점/성장포인트 |
| 2~3 | 기질 역동 상세 (NS, HA, RD, PS) |
| 4 | 성격 성숙도 (SD, CO) + 회복탄력성 |
| 5 | 소통 가이드 + 갈등 해결 4단계 |
| 6 | 성장 로드맵 + 마무리 메시지 |

### 8.5 SettingsPage.jsx (539줄)

해석 데이터 커스터마이징. 3개 탭.

| 탭 | 편집 대상 | 항목 수 |
|----|----------|---------|
| **상위척도** | mainScaleTraits | 7개 (NS~ST) |
| **하위척도** | scaleTraits | 23개 (NS1~ST3) |
| **규준** | norms | 23개 × {평균, 표준편차} |

- JSON 가져오기/내보내기 지원
- 초기화 시 기본 해석 데이터로 복원

---

## 9. 해석 데이터 구조 (data/)

### 9.1 interpretations.js (905줄)

| Export | 설명 |
|--------|------|
| `TEMPERAMENT_TYPES` (27개) | 기질유형 (NS×HA×RD 조합): name, description, strengths, weaknesses, coachingTips |
| `CHARACTER_TYPES` (27개) | 성격유형 (SD×CO×ST 조합): 동일 구조 |
| `mainScaleTraits` | 상위 7척도 해석: highPersona/lowPersona, highAdv/lowAdv, highDis/lowDis |
| `scaleTraits` | 하위 23척도 해석: name, description, lowLabel/highLabel, lowAdv/highAdv |
| `norms` | 하위척도 규준: 각 {m (평균), sd (표준편차)} |
| `TEMPERAMENT_INTERACTIONS` | 기질 척도간 상호작용 (NS×HA, NS×RD, HA×RD) |
| `PERSONALITY_DISORDER_MAP` | 기질유형별 성격장애 경향성 (참고용) |

### 9.2 coupleInterpretations.js (547줄)

| Export | 설명 |
|--------|------|
| `RELATIONSHIP_TYPES` | 4가지 관계유형: COUPLE, PARENT_CHILD, FRIENDS, COLLEAGUES |
| `TEMPERAMENT_DYNAMICS` | 기질 역동: 4척도 × 9조합(VH~VL 매핑 → H/M/L 3단계 조합) = 36개 |
| `CHARACTER_INTERACTIONS` | 성격 역동: SD, CO × 9조합 = 18개 |
| `COMMUNICATION_RULES` | 소통 규칙: praise/request × 4척도 × 3레벨 = 24개 |
| `CONFLICT_RESOLUTION_STEPS` | 갈등 해결 4단계 템플릿 |
| `GROWTH_ROADMAP` | 6주 성장 과제 |

**헬퍼 함수:**

| 함수명 | 입력 → 출력 |
|--------|------------|
| `getCoupleLevel(score)` | 백분위 → 5단계 (VH/H/M/L/VL) |
| `toInterpretLevel(level)` | 5단계 → 3단계 (High/Medium/Low) |
| `getGapCategory(a, b)` | 두 점수 → similar/moderate/contrast |
| `getCombinationKey(lA, lB)` | 두 레벨 → "H-M" 키 |
| `getLevelLabel(level)` | 레벨 → 한글 ("매우 높음" 등) |
| `getLevelColor5(level)` | 레벨 → Tailwind 색상 클래스 |
| `getGapColor(category)` | 차이 카테고리 → {bg, text} 클래스 |

---

## 10. 데이터 흐름

### 10.1 개인진단 (CSV 업로드)

```
[CSV 파일] → handleFileUpload() → PapaParse
  → 컬럼 매핑 (name, NS~ST, NS1~ST3)
  → anonymizeName() → nameMapping 생성
  → 이름 매칭 모달 확인
  → handleCreateGroup()
    → Supabase groups INSERT
    → Supabase members INSERT
    → setGroups() 로컬 상태 업데이트
    → setPage('list')
```

### 10.2 개인진단 (기존 검사자 선택)

```
[그룹별 드롭다운] → individualSelectedMember 설정
  → 7척도 프리뷰 표시
  → "진단 시작" 클릭
    → 가상 1인 그룹 생성 (DB 저장 없음)
    → setSelectedGroup(virtualGroup)
    → setPage('analysis')
```

### 10.3 커플분석

```
[CSV 업로드 또는 기존 멤버 선택]
  → couplePersonA, couplePersonB 설정
  → "분석 시작" 클릭
    → setPage('couple-analysis')
    → <CoupleAnalysisPage personA={...} personB={...} />
      → analyzeCouple(): 각 척도별 analysis 객체 생성
      → 4개 탭 렌더링
```

### 10.4 AI 심층 분석

```
"AI 심층 분석 시작" 버튼 클릭
  → POST ${AI_GATEWAY_URL}/api/ai/chat
    → body: { messages: [system, user], model: 'claude-sonnet-4-20250514' }
  → 응답 마크다운 → 4섹션 파싱
  → 섹션별 카드 렌더링 (핵심 역동/관계 강점/활용 전략/실천 제안)
```

---

## 11. 이름 익명화 시스템

```javascript
anonymizeName("김려원")
  → 성(김) + 초성추출(ㄹ→Y, ㅇ→W) → "김YW"
  → 실제 표시: "김YW"
  → original_name: "김려원" (별도 저장)
```

**초성 → 영문 매핑:**
```
ㄱ→G, ㄴ→N, ㄷ→D, ㄹ→R, ㅁ→M, ㅂ→B, ㅅ→S, ㅇ→W, ㅈ→J,
ㅊ→C, ㅋ→K, ㅌ→T, ㅍ→P, ㅎ→H, ㄲ→GG, ㄸ→DD, ㅃ→BB, ㅆ→SS, ㅉ→JJ
```

---

## 12. PDF 생성 시스템

### 폰트
- NotoSansKR (Google Fonts, jsDelivr CDN)
- Regular + Bold 두 가중치

### 개인 PDF 색상 체계
- 헤더: #2563EB (Blue-600)
- 레벨 색상: VH(#DC2626) / H(#EA580C) / M(#CA8A04) / L(#16A34A) / VL(#2563EB)

### 커플 PDF 색상 체계
- 헤더: #9F1239 (Rose-800)
- Person A: #3B82F6 / Person B: #F97316
- 시너지 박스: 초록 / 갈등 박스: 빨강 / 상호이해: 파랑+주황

---

## 13. 차트 시각화 목록

| 차트 | 위치 | 기술 | 용도 |
|------|------|------|------|
| 바 차트 | AnalysisPage (group 뷰) | 커스텀 CSS | 멤버별 척도 비교 |
| 레이더 차트 | AnalysisPage, CoupleAnalysisPage | Recharts | 7척도 프로필 오버레이 |
| 산점도 | AnalysisPage (scatter 뷰) | Recharts | 2척도 멤버 분포 |
| **덤벨 도트** | CoupleAnalysisPage (관계 요약) | 커스텀 SVG | 기질 비교 (점+연결선+차이 하이라이트) |
| 성격 성숙도 바 | CoupleAnalysisPage (관계 요약) | 커스텀 CSS | SD/CO/ST 세로 바 |

### 덤벨 도트 차트 상세

```
SVG viewBox: 0 0 560 (rowH×4 + 24)
트랙 영역: x=90 ~ x=478 (388px, 0~100 매핑)
도트 반지름: 9px, 흰색 테두리 2.5px
A 색상: #60A5FA (파랑) + drop-shadow 글로우
B 색상: #F97316 (주황) + drop-shadow 글로우
차이 하이라이트: 유사(#dcfce7) / 보통(#fef9c3) / 대비(#fee2e2)
양 끝 특성 라벨: fontSize 8, #d1d5db
점수 근접 시(28px 미만): 위/아래 자동 분리
```

---

## 14. 관계 유형 시스템

| 키 | 라벨 | 아이콘 | 톤 차이 |
|----|------|--------|---------|
| `COUPLE` | 커플/부부 | 💑 | 친밀감, 애정 표현 중심 |
| `PARENT_CHILD` | 부모-자녀 | 👨‍👧 | 양육, 발달 단계 고려 |
| `FRIENDS` | 친구 | 🤝 | 동등한 관계, 공유 활동 |
| `COLLEAGUES` | 동료/팀 | 💼 | 업무 효율, 역할 분담 |

---

## 15. 향후 개선 고려사항

- [ ] App.jsx 분리 (현재 2,871줄 → 페이지별 컴포넌트 분리)
- [ ] React Router 도입 (URL 기반 라우팅)
- [ ] 코드 스플리팅 (현재 번들 2.5MB)
- [ ] 인증/권한 시스템 (현재 공개 접근)
- [ ] 개인진단 AI 분석 확장 (현재 커플분석에만 적용)
