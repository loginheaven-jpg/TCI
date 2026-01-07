// ========================================
// TCI 용어 정의 (최종 확정)
// ========================================

export const scaleLabels = {
  NS: '탐색성',
  HA: '신중성',
  RD: '관계 민감성',
  PS: '실행 관성력',
  SD: '자기 주도성',
  CO: '관계 협력성',
  ST: '초월 지향성'
};

export const engLabels = {
  NS: 'Novelty Seeking',
  HA: 'Harm Avoidance',
  RD: 'Reward Dependence',
  PS: 'Persistence',
  SD: 'Self-Directedness',
  CO: 'Cooperativeness',
  ST: 'Self-Transcendence'
};

export const subScaleLabels = {
  NS1: '안정 추구 ↔ 탐색적 흥분',
  NS2: '숙고성 ↔ 즉흥성',
  NS3: '절제 ↔ 향유',
  NS4: '체계성 ↔ 유연성',
  HA1: '미래위험 센서',
  HA2: '불확실성 수용성 ↔ 경계성',
  HA3: '사회적 개방성 ↔ 신중함',
  HA4: '활력 ↔ 에너지 관리',
  RD1: '정서 민감성',
  RD2: '정서 표현 절제 ↔ 개방',
  RD3: '독립적 관계 ↔ 밀착적 관계',
  RD4: '자립지향 ↔ 협력지향',
  PS1: '여유 있는 실행 ↔ 꾸준한 실행',
  PS2: '유연함 ↔ 지속력',
  PS3: '현재 만족 ↔ 성취 지향',
  PS4: '유연 기준 ↔ 높은 기준',
  SD1: '상황 요인 중시 ↔ 개인 책임',
  SD2: '단기 목표 ↔ 장기 목표',
  SD3: '자기 겸양심 ↔ 자기효능감',
  SD4: '개선지향 ↔ 자기수용',
  SD5: '상황 적응성 ↔ 가치 일치성',
  CO1: '타인수용',
  CO2: '공감/존중',
  CO3: '이타성',
  CO4: '관대함',
  CO5: '공평',
  ST1: '자기인식 ↔ 창조적 몰입',
  ST2: '현실 집중 ↔ 연결감 지향',
  ST3: '현실중심 ↔ 초월지향'
};

// ========================================
// 규준 데이터 (평균 M, 표준편차 SD)
// ========================================

export const norms = {
  NS1: { m: 9.5, sd: 3.2 },
  NS2: { m: 7.0, sd: 3.3 },
  NS3: { m: 6.0, sd: 3.2 },
  NS4: { m: 5.2, sd: 3.2 },
  HA1: { m: 7.8, sd: 4.1 },
  HA2: { m: 9.9, sd: 3.0 },
  HA3: { m: 8.7, sd: 3.6 },
  HA4: { m: 8.7, sd: 3.4 },
  RD1: { m: 11.1, sd: 2.9 },
  RD2: { m: 10.5, sd: 3.0 },
  RD3: { m: 11.6, sd: 3.3 },
  RD4: { m: 9.4, sd: 2.6 },
  PS1: { m: 12.7, sd: 3.0 },
  PS2: { m: 10.7, sd: 3.0 },
  PS3: { m: 10.4, sd: 3.7 },
  PS4: { m: 9.9, sd: 3.5 },
  SD1: { m: 12.7, sd: 2.9 },
  SD2: { m: 11.6, sd: 3.1 },
  SD3: { m: 6.8, sd: 1.9 },
  SD4: { m: 4.2, sd: 1.7 },
  SD5: { m: 12.5, sd: 3.2 },
  CO1: { m: 12.6, sd: 2.8 },
  CO2: { m: 9.6, sd: 2.5 },
  CO3: { m: 9.9, sd: 2.5 },
  CO4: { m: 8.9, sd: 2.6 },
  CO5: { m: 15.1, sd: 2.5 },
  ST1: { m: 9.1, sd: 4.0 },
  ST2: { m: 7.4, sd: 4.1 },
  ST3: { m: 9.2, sd: 5.4 }
};

// ========================================
// 하위지표 그룹 정의
// ========================================

export const subScaleGroups = {
  NS: ['NS1', 'NS2', 'NS3', 'NS4'],
  HA: ['HA1', 'HA2', 'HA3', 'HA4'],
  RD: ['RD1', 'RD2', 'RD3', 'RD4'],
  PS: ['PS1', 'PS2', 'PS3', 'PS4'],
  SD: ['SD1', 'SD2', 'SD3', 'SD4', 'SD5'],
  CO: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
  ST: ['ST1', 'ST2', 'ST3']
};

export const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
export const characterScales = ['SD', 'CO', 'ST'];

// ========================================
// 5열 구조 장단점 데이터
// ========================================

export const scaleTraits = {
  NS1: {
    lowAdv: ['차분하고 안정적', '기존 가치 인식'],
    lowDis: ['익숙함에 안주'],
    highAdv: ['탐색적, 혁신적', '변화에 잘 적응'],
    highDis: ['싫증 잘 내는', '흥분추구']
  },
  NS2: {
    lowAdv: ['숙고하고 집중', '안정적 감정관리'],
    lowDis: ['지나친 숙고로 실기'],
    highAdv: ['과감한 결단', '기분파'],
    highDis: ['감정변화가 극적', '성급한 결정']
  },
  NS3: {
    lowAdv: ['검소하고 절약', '리소스 관리 우수'],
    lowDis: ['인색한'],
    highAdv: ['리소스 향유', '풍성한 삶'],
    highDis: ['리소스 관리 난조', '소진 가능성']
  },
  NS4: {
    lowAdv: ['질서정연', '준법', '조직 만족'],
    lowDis: ['답답하고 경직된', '융통성 없는'],
    highAdv: ['자유분방', '주변을 즐겁게'],
    highDis: ['분노 폭발', '법규칙 무시']
  },
  HA1: {
    lowAdv: ['낙관적', '자신감'],
    lowDis: ['대책 없는'],
    highAdv: ['재난예측', '위험대비'],
    highDis: ['비관적 관점', '걱정 근심']
  },
  HA2: {
    lowAdv: ['침착함', '대담함'],
    lowDis: ['문제 간과'],
    highAdv: ['상황적 위험 대응', '안전 지향'],
    highDis: ['긴장 불안', '위험 회피']
  },
  HA3: {
    lowAdv: ['새로운 사람 잘 사귀는'],
    lowDis: ['사기당할 우려'],
    highAdv: ['사람위험 대비', '신중한 대인관계'],
    highDis: ['지나친 경계심', '사교성 부족']
  },
  HA4: {
    lowAdv: ['활력이 높음', '잘 회복하는'],
    lowDis: ['오버 드라이브', '체력 과신'],
    highAdv: ['큰 병 예방', '체력관리'],
    highDis: ['활력이 낮은 느낌', '잘 지치는 느낌']
  },
  RD1: {
    lowAdv: ['강인하고 현실적', '감정 중립성', '객관적 태도'],
    lowDis: ['무관심하고 차가운', '감정적 유대감 부족'],
    highAdv: ['타인 감정을 잘 읽고 공감', '동정심, 이해심'],
    highDis: ['타인 감정의 소용돌이에 빠질 우려']
  },
  RD2: {
    lowAdv: ['신비감과 권위', '적정한 거리감'],
    lowDis: ['속을 모를 사람', '마음을 열지 않는'],
    highAdv: ['마음 열고 다가감', '교류와 사귐'],
    highDis: ['다른 사람의 폐쇄성에 상처받음']
  },
  RD3: {
    lowAdv: ['독립적인', '스스로 충전되는', '거부를 잘 견디는'],
    lowDis: ['외골수', '사회접촉에서 소진'],
    highAdv: ['친밀한', '사회접촉에서 충전'],
    highDis: ['외로움에 취약한', '타인 반응에 민감']
  },
  RD4: {
    lowAdv: ['초연히 자존함', '주관이 뚜렷한'],
    lowDis: ['눈치없는'],
    highAdv: ['눈치빠르게 상대 필요 파악', '배려와 협력'],
    highDis: ['칭찬과 비판에 과민', '의존적인']
  },
  PS1: {
    lowAdv: ['신중함', '철저한 준비'],
    lowDis: ['착수 지연', '미루거나 꾸물댐'],
    highAdv: ['책임감', '성실함'],
    highDis: ['조급함', '보상에 쉬 매혹되는']
  },
  PS2: {
    lowAdv: ['탄력적인', '변화에 잘 대응'],
    lowDis: ['게으름', '포기함'],
    highAdv: ['꾸준함', '근면성'],
    highDis: ['완고한', '변화의 결단을 피함']
  },
  PS3: {
    lowAdv: ['자족하는', '협력적인'],
    lowDis: ['목표가 없어서 능력보다 덜 성취'],
    highAdv: ['도전하는', '야심찬'],
    highDis: ['과한 경쟁심', '권력욕', '과한 희생']
  },
  PS4: {
    lowAdv: ['실용적인', '현실적인'],
    lowDis: ['목표가 낮아서 능력보다 덜 성취'],
    highAdv: ['목표가 높은', '성취품질이 높은'],
    highDis: ['무리한 기준을 고수']
  },
  SD1: {
    lowAdv: ['유연한 책임 귀인'],
    lowDis: ['남탓하는', '책임 전가하는'],
    highAdv: ['책임지는', '신뢰로운'],
    highDis: ['과도한 자기 비난']
  },
  SD2: {
    lowAdv: ['현재상황과 욕구충족 중심'],
    lowDis: ['목적, 의미 탐색중인'],
    highAdv: ['장기적 목표와 가치 지향', '욕구만족 지연'],
    highDis: ['지나친 미래 지향']
  },
  SD3: {
    lowAdv: ['겸손한'],
    lowDis: ['무능감', '타인 의존'],
    highAdv: ['심리적 자원 풍부', '문제해결력', '도전의식'],
    highDis: ['자만심']
  },
  SD4: {
    lowAdv: ['훈련과 노력을 통한 한계 돌파'],
    lowDis: ['힘겹게 분투중인', '타인 모습을 꿈꾸는'],
    highAdv: ['자신의 단점과 한계 인정', '가장없이 본인을 드러냄'],
    highDis: ['변화 동기 부족']
  },
  SD5: {
    lowAdv: ['상황에 유연하게 적응'],
    lowDis: ['유혹에 굴복', '마음따로 몸따로'],
    highAdv: ['자신의 가치에 부합하는 행동', '좋은 습관'],
    highDis: ['경직된 원칙주의']
  },
  CO1: {
    lowAdv: ['비판적 사고'],
    lowDis: ['자신과 다른 가치 수용않음', '자기 중심적'],
    highAdv: ['타인의 가치와 목표 존중', '관대하고 우호적'],
    highDis: ['무비판적 수용']
  },
  CO2: {
    lowAdv: ['객관적 판단'],
    lowDis: ['타인 감정에 대한 배려 부족'],
    highAdv: ['역지사지', '타인 감정 존중'],
    highDis: ['감정적 소진']
  },
  CO3: {
    lowAdv: ['자기 보호'],
    lowDis: ['이기적', '자신을 돋보이고 싶어함'],
    highAdv: ['이타적', '격려와 위로', '팀웍 선호'],
    highDis: ['자기 희생']
  },
  CO4: {
    lowAdv: ['정의감'],
    lowDis: ['복수의 화신'],
    highAdv: ['동정심과 자비심', '용서하고 관대함'],
    highDis: ['지나친 관용']
  },
  CO5: {
    lowAdv: ['실용적 판단'],
    lowDis: ['기회주의적', '편파적'],
    highAdv: ['윤리적 원칙과 양심 통합', '일관되고 공정함'],
    highDis: ['융통성 부족']
  },
  ST1: {
    lowAdv: ['늘 깨어 있는', '감동에 빠지지 않는'],
    lowDis: ['무미건조'],
    highAdv: ['자기경계를 초월', '몰입', '창조적, 독창적'],
    highDis: ['현실감각 저하']
  },
  ST2: {
    lowAdv: ['개인주의', '현실 집중'],
    lowDis: ['자연을 도구로 봄'],
    highAdv: ['개인을 초월한 연결감', '이상주의'],
    highDis: ['비현실적 기대']
  },
  ST3: {
    lowAdv: ['유물론, 경험주의'],
    lowDis: ['설명할 수 없는 상황 대처 곤란'],
    highAdv: ['초감각적 영적 세계에 대한 믿음', '회복력 높음'],
    highDis: ['맹신']
  }
};

// ========================================
// 색상 팔레트
// ========================================

export const colors = {
  temperament: '#3B82F6',
  character: '#10B981',
  members: [
    '#60A5FA', '#F97316', '#A78BFA', '#10B981', '#F472B6',
    '#FBBF24', '#22D3EE', '#A3E635', '#EF4444', '#818CF8'
  ],
  levelHigh: '#3B82F6',
  levelMid: '#9CA3AF',
  levelLow: '#F97316'
};

// ========================================
// 유틸리티 함수
// ========================================

export const getLevel = (percentile) => {
  if (percentile >= 70) return 'H';
  if (percentile <= 30) return 'L';
  return 'M';
};

export const getLevelByTScore = (tScore) => {
  if (tScore < 45) return 'L';
  if (tScore <= 55) return 'M';
  return 'H';
};

export const getLevelColor = (level) => ({
  H: 'bg-blue-500',
  M: 'bg-gray-400',
  L: 'bg-orange-400'
}[level] || 'bg-gray-400');

export const getLevelTextColor = (level) => ({
  H: 'text-blue-600',
  M: 'text-gray-600',
  L: 'text-orange-500'
}[level] || 'text-gray-600');

export const getName = (person) => person.name || person['이름'] || '이름없음';
export const getGender = (person) => person.gender || person['성별'] || '';
export const getAge = (person) => person.age || person['연령'] || '';

// T점수/백분위 필드명 매핑
export const fieldMapping = {
  // T점수
  ns_t: ['ns_t', 'NST', 'NS_T'],
  ha_t: ['ha_t', 'HAT', 'HA_T'],
  rd_t: ['rd_t', 'RDT', 'RD_T'],
  ps_t: ['ps_t', 'PST', 'PS_T'],
  sd_t: ['sd_t', 'SDT', 'SD_T'],
  co_t: ['co_t', 'COT', 'CO_T'],
  st_t: ['st_t', 'STT', 'ST_T'],
  // 백분위
  ns_p: ['ns_p', 'NSP', 'NS_P', 'NS'],
  ha_p: ['ha_p', 'HAP', 'HA_P', 'HA'],
  rd_p: ['rd_p', 'RDP', 'RD_P', 'RD'],
  ps_p: ['ps_p', 'PSP', 'PS_P', 'PS'],
  sd_p: ['sd_p', 'SDP', 'SD_P', 'SD'],
  co_p: ['co_p', 'COP', 'CO_P', 'CO'],
  st_p: ['st_p', 'STP', 'ST_P', 'ST']
};

export const getFieldValue = (member, fieldKey) => {
  const possibleKeys = fieldMapping[fieldKey] || [fieldKey];
  for (const key of possibleKeys) {
    if (member[key] !== undefined) return member[key];
  }
  return null;
};

// ========================================
// 추가 내보내기 (컴포넌트 호환용)
// ========================================

// 한글 라벨 (기존 scaleLabels의 alias)
export const SCALE_LABELS_KO = scaleLabels;

// 영문 라벨 (기존 engLabels의 alias)
export const SCALE_LABELS = engLabels;

// 척도별 색상
export const SCALE_COLORS = {
  NS: '#3B82F6', // blue
  HA: '#F59E0B', // amber
  RD: '#F43F5E', // rose
  PS: '#8B5CF6', // violet
  SD: '#10B981', // emerald
  CO: '#0EA5E9', // sky
  ST: '#A855F7', // purple
};

// 척도 특성 요약 (높음/낮음)
export const SCALE_TRAITS = {
  NS: {
    low: '안정적이고 신중하며 기존 방식을 선호합니다.',
    high: '새로운 경험과 자극을 추구하며 변화를 즐깁니다.',
  },
  HA: {
    low: '대담하고 낙관적이며 위험을 감수합니다.',
    high: '신중하고 걱정이 많으며 안전을 중시합니다.',
  },
  RD: {
    low: '독립적이고 감정에 덜 좌우됩니다.',
    high: '타인의 감정에 민감하고 관계를 중시합니다.',
  },
  PS: {
    low: '유연하고 상황에 따라 적응합니다.',
    high: '끈기 있고 목표를 향해 꾸준히 노력합니다.',
  },
  SD: {
    low: '외부 환경에 영향을 많이 받습니다.',
    high: '자율적이고 목표 지향적이며 책임감이 강합니다.',
  },
  CO: {
    low: '독립적 판단을 중시하고 비판적입니다.',
    high: '타인을 배려하고 협력적이며 관대합니다.',
  },
  ST: {
    low: '현실적이고 경험에 기반한 판단을 합니다.',
    high: '영적, 초월적 가치를 중시하며 몰입을 잘 합니다.',
  },
};

// 하위척도 라벨 (기존 subScaleLabels의 대문자 버전)
export const SUBSCALE_LABELS = subScaleLabels;

// 하위척도 설명
export const SUBSCALE_DESCRIPTIONS = {
  NS1: '새로운 것에 대한 흥분과 탐색 성향',
  NS2: '생각 없이 행동하는 즉흥성',
  NS3: '보상과 쾌락을 향유하는 성향',
  NS4: '규칙과 질서에 대한 유연성',
  HA1: '미래 위험에 대한 걱정과 예측',
  HA2: '불확실한 상황에서의 긴장',
  HA3: '낯선 사람에 대한 경계심',
  HA4: '쉽게 지치고 회복이 느린 정도',
  RD1: '타인의 감정을 읽고 공감하는 능력',
  RD2: '감정을 개방적으로 표현하는 정도',
  RD3: '친밀한 관계에 대한 욕구',
  RD4: '타인의 인정과 지지에 대한 의존성',
  PS1: '일을 시작하고 착수하는 성향',
  PS2: '어려움에도 꾸준히 지속하는 능력',
  PS3: '성취와 야망에 대한 동기',
  PS4: '높은 기준과 완벽주의 성향',
  SD1: '자신의 행동에 대한 책임감',
  SD2: '장기적 목표와 방향성',
  SD3: '자기 능력에 대한 믿음',
  SD4: '있는 그대로의 자신을 수용',
  SD5: '가치관과 행동의 일치',
  CO1: '다양한 가치관에 대한 수용',
  CO2: '타인의 감정에 대한 공감',
  CO3: '타인을 돕고자 하는 이타심',
  CO4: '실수를 용서하는 관대함',
  CO5: '공정하고 윤리적인 판단',
  ST1: '창조적 몰입과 자기초월',
  ST2: '자연 및 우주와의 연결감',
  ST3: '영적, 초월적 세계에 대한 믿음',
};
