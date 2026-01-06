/**
 * TCI 해석 데이터
 * 출처: TCI 검사 자동결과판 2022 (이재란 박사 제공)
 */

// ============================================================
// 1. 기질 27유형 해석 (NS × HA × RD)
// ============================================================
export const TEMPERAMENT_TYPES = {
  MMM: {
    code: 'MMM',
    name: '균형잡힌',
    description: '다양한 상황에서 융통성 있고 탄력 있게 대처할 수 있는 잠재력을 지님. 새로운 자극을 흥미를 가지고 탐색하지만, 쉽게 흥분하거나 성급하게 몰입하지는 않는다. 반복적인 일상도 잘 참아낼 수 있으며, 자신에게 가장 유익하고 적응적인 행동을 선택한다. 위험이 예상되면 일시적으로 걱정하기도 하지만 그 정도가 지나치지는 않는다. 감정의 기복이 적으며, 평온한 감정 상태를 유지할 수 있다.',
    strengths: '융통성, 적응력, 감정 안정성, 균형잡힌 대인관계',
    weaknesses: '뚜렷한 개성이 부족해 보일 수 있음',
    coachingTips: '균형을 유지하면서 자신만의 강점 영역을 더 개발하도록 격려'
  },
  HMM: {
    code: 'HMM',
    name: '높은 자극추구',
    description: '새롭거나 낯선 자극에 남다른 호기심을 가지고 적극적으로 탐색한다. 스릴 넘치는 모험이나 짜릿하게 흥분되는 경험을 즐긴다. 순간적인 본능이나 직관적인 육감에 따라 행동하는 열정적인 사람이다. 흥미와 관심의 범위가 넓고, 변화가 많은 일에 도전하는 것을 좋아한다.',
    strengths: '새로운 것 탐색, 열정, 빠른 실행력, 사교성',
    weaknesses: '부주의하고 즉흥적이며 충동적이라는 인상. 산만하고 무모하게 비춰짐. 단조로운 일에 쉽게 지루함',
    coachingTips: '열정을 인정하되, 중요한 결정 전 잠시 멈추고 생각하는 습관 개발'
  },
  LMM: {
    code: 'LMM',
    name: '낮은 자극추구',
    description: '어떤 결정을 내리고 행동으로 옮기기 전에 충분한 시간을 가지고 심사숙고한다. 자신에게 익숙하고 편안한 것을 선택하며, 신중하고 체계적이며 계획적이다. 매사를 신중하게 생각하며 세부적인 것들까지도 거듭해서 분석하기 때문에 실수가 적다.',
    strengths: '신중함, 분석력, 실수 적음, 꾸준함, 깊은 관계 형성',
    weaknesses: '고지식하고 융통성 없음. 순발력 부족. 재미없고 열정 부족해 보임',
    coachingTips: '안정성을 강점으로 인정하되, 가끔은 계획에 없던 새로운 시도를 해보도록 격려'
  },
  MHM: {
    code: 'MHM',
    name: '높은 위험회피',
    description: '잠재적으로 위험할 수 있는 일에 철저히 대비하는 사려 깊은 사람. 어떤 일을 성급하게 추진하지 않으며, 다양한 가능성과 위험부담을 고려하여 주의 깊게 선택한다. 실수가 적고, 남들로부터 믿음직스럽다는 평가를 받는다.',
    strengths: '철저한 대비, 신중한 판단, 예의바름, 신뢰성',
    weaknesses: '걱정이 많고 소심하며 매사를 너무 부정적으로만 생각. 자신감 부족',
    coachingTips: '걱정의 긍정적 측면(준비성)을 인정하되, 걱정과 현실을 구분하는 연습'
  },
  MLM: {
    code: 'MLM',
    name: '낮은 위험회피',
    description: '위험이 예상되는 상황에서도 별로 위축되거나 불안해하지 않는다. 익숙하지 않은 일을 할 때에도 자신감 있고 침착하게 행동하는 낙관적인 사람. 어려움이나 곤란이 예상되는 경우에도 크게 동요하지 않고 긍정적으로 생각한다.',
    strengths: '자신감, 낙관성, 대담함, 스트레스 저항력, 주도성',
    weaknesses: '겁이 없고 조심성이 부족. 지나친 낙관으로 무신경해 보임',
    coachingTips: '낙관성을 강점으로 인정하되, 중요한 결정에서는 리스크 점검 습관화'
  },
  MMH: {
    code: 'MMH',
    name: '높은 사회적민감성',
    description: '감수성이 풍부하고 인간관계에 민감하여 주변 사람들의 마음을 잘 헤아린다. 슬픈 영화를 보거나 어려움을 당하는 사람들을 보면 마음 아파한다. 타인과 친밀한 감정 교류를 원하며 사회적 관계를 통해서 만족감을 얻는다.',
    strengths: '공감력, 감수성, 따뜻함, 관계 중시',
    weaknesses: '인간관계에 집착하거나 의존. 사람들의 평가에 예민함. 거절하지 못함',
    coachingTips: '공감 능력을 강점으로 인정하되, 자기 경계 설정 연습'
  },
  MML: {
    code: 'MML',
    name: '낮은 사회적민감성',
    description: '감상적인 것에 휘둘리지 않고, 감정의 동요나 기복이 적다. 자신의 독립적인 판단과 결정에 따라 행동하는 실리적이고 소신 있는 사람. 주변 사람들의 평가나 인정에 크게 연연하지 않으면서 자신의 판단에 따라 꾸준히 일을 밀고 나간다.',
    strengths: '독립성, 객관성, 소신, 감정 안정성',
    weaknesses: '차갑고 냉정하며 무심하다는 인상. 남의 마음을 잘 헤아리지 못함',
    coachingTips: '독립성을 강점으로 인정하되, 중요한 관계에서는 감정 표현 연습'
  },
  HLM: {
    code: 'HLM',
    name: '외향적인-충동적인',
    description: '새로운 상황에 처하거나 낯선 사람을 대할 때에 망설임 없이 다가가서 적극적으로 탐색하는 대담하고 외향적인 사람. 위험을 무릅쓰는 행동을 즐기며, 스릴 넘치는 일에서 만족감을 느낀다.',
    strengths: '대담함, 외향성, 도전정신, 솔직함, 사교성',
    weaknesses: '충동적이고 조심성 부족. 성급하고 실수가 많음. 참을성 부족',
    coachingTips: '에너지와 추진력을 인정하되, 중요한 결정 전 "하루 대기" 규칙 적용'
  },
  LHM: {
    code: 'LHM',
    name: '내향적인-경직된',
    description: '안전하고 평온한 상태를 유지하는 것을 선호하는 조심성이 많은 사람. 매사에 다양한 가능성을 고려하고 세심한 주의를 기울인다. 정해진 규칙과 질서를 따르고, 새로운 일보다는 익숙한 일을 처리하는데 능숙하다.',
    strengths: '신중함, 규칙 준수, 인내심, 예의바름, 깊은 관계',
    weaknesses: '겁이 많고 융통성 부족. 소극적이고 수동적',
    coachingTips: '안정성을 강점으로 인정하되, 안전한 환경에서 작은 도전 시도 격려'
  },
  LLM: {
    code: 'LLM',
    name: '유쾌한',
    description: '낯선 상황에서도 동요하거나 당황하지 않고 차분하며 낙천적인 사람. 매사에 낙관적인 기대를 가지고 있어서 별다른 걱정이나 근심 없이 살아간다.',
    strengths: '낙천성, 차분함, 조직화, 자기주장',
    weaknesses: '조심성 부족하고 완고함. 지나친 낙천으로 실수 범하기 쉬움',
    coachingTips: '긍정성을 강점으로 인정하되, 중요한 일에서는 체크리스트 활용'
  },
  HHM: {
    code: 'HHM',
    name: '신경질적인',
    description: '자극적이고 모험적인 일에 더 흥미를 보이긴 하지만, 섣부른 판단을 하거나 무모하게 일을 밀어붙이는 경우는 별로 없다. 장차 일어날 수 있는 여러 가능성을 까다롭게 고려해서 결정하는 경향이 있다.',
    strengths: '신중한 모험, 다각적 고려, 감정 절제',
    weaknesses: '우유부단하며 걱정이나 갈등이 많음. 마음이 자주 변함',
    coachingTips: '신중함을 인정하되, 결정 마감 시한을 정해 우유부단함 극복'
  },
  LMH: {
    code: 'LMH',
    name: '전통적인-신뢰로운',
    description: '신중하고 주도면밀하며 양심적인 사람으로 즉흥적으로 행동하는 일은 거의 없다. 인간관계에서 자신의 감정을 솔직하게 잘 드러내는 정직하고 소박한 사람. 다른 사람의 마음을 잘 헤아리고 배려하며, 정이 많고 믿음직스럽다.',
    strengths: '양심적, 정직, 배려심, 신뢰성',
    weaknesses: '순발력 부족하고 관습적. 보수적이고 권위적으로 비춰질 수 있음',
    coachingTips: '신뢰성을 강점으로 인정하되, 자기 의견 표현 연습'
  },
  HML: {
    code: 'HML',
    name: '독립적인-자유주의적인',
    description: '진취적이고 순발력이 있으며, 자기 주장과 입장이 분명한 독립적인 사람. 다른 사람의 평가보다는 자신의 판단에 우선 순위를 두고 소신껏 행동한다. 흥미와 관심의 범위가 넓고, 가능성에 도전하는 것을 즐긴다.',
    strengths: '진취성, 순발력, 소신, 독립성, 도전정신',
    weaknesses: '자기중심적이고 기회주의적 인상. 타인의 입장이나 감정 이해 부족',
    coachingTips: '독립성을 강점으로 인정하되, 중요한 관계에서 상대방 관점 경청 연습'
  },
  HMH: {
    code: 'HMH',
    name: '관심을 끌기 원하는',
    description: '자신의 경험이나 느낌을 겉으로 표현하는 것을 좋아하며, 감수성이 풍부하고 열정이 있는 사람. 사교적이고 외향적이며, 낯선 사람들과의 관계에서도 주도적으로 행동한다.',
    strengths: '표현력, 감수성, 열정, 사교성, 상상력',
    weaknesses: '변덕스럽고 예민하여 자기 중심적. 감정적이고 정서적으로 불안정',
    coachingTips: '표현력을 강점으로 인정하되, 상대방의 반응에 덜 의존하는 자기 확신 개발'
  },
  LML: {
    code: 'LML',
    name: '사생활 추구',
    description: '사람들과 어울림이나 대외적인 활동이 적고, 사적인 생활을 추구하는 조용하고 겸손한 사람. 혼자 있어도 별로 외로움을 타지 않고 자기 나름의 편안함과 만족스러움을 찾아낸다.',
    strengths: '자기충족, 깊은 관계, 감정 안정, 차분함, 절제',
    weaknesses: '쉽게 다가가기 어렵고 열정 부족 인상. 새로운 사람 사귀는데 시간 오래 걸림',
    coachingTips: '내면의 풍요를 인정하되, 중요한 사람에게는 감정 표현 연습'
  },
  MHH: {
    code: 'MHH',
    name: '회피적인-의존적인',
    description: '원만한 인간관계를 중요시하고, 남을 먼저 배려하는 조심성 있고 공손한 사람. 자기 주장을 강하게 내세우지 않으며, 자신의 감정과 욕구를 직접적으로 드러내지 않는다.',
    strengths: '배려심, 공손함, 세심함, 실수 적음',
    weaknesses: '소심하고 예민하며 위축됨. 평가와 인정에 민감',
    coachingTips: '배려심을 강점으로 인정하되, 자기 의견을 정중하게 표현하는 연습'
  },
  MLL: {
    code: 'MLL',
    name: '반항적인',
    description: '세상 일을 어렵게 보지 않고 낙관적으로 생각하며, 사람을 대할 때 자신감 있고 당당한 태도를 보이는 분명한 사람. 한번 결정한 일은 쉽게 번복하지 않는다.',
    strengths: '낙관성, 자신감, 일관성, 독립성',
    weaknesses: '냉정하고 고집스러움. 타인의 기분이나 입장 배려 부족',
    coachingTips: '소신을 강점으로 인정하되, 협업 상황에서 타인 의견 경청 연습'
  },
  MLH: {
    code: 'MLH',
    name: '친화적인-사교적인',
    description: '낯선 사람을 위해 위험을 무릅쓰는 행동을 할 정도로 대담하고 인정이 많은 사람. 어려움이나 곤란이 예상되는 상황에서도 하던 일을 침착하게 지속한다.',
    strengths: '대담함, 인정, 침착함, 주도성, 동정심',
    weaknesses: '무모하고 저돌적이며 남을 너무 잘 믿음. 세심한 계획 부족',
    coachingTips: '따뜻함을 강점으로 인정하되, 도움 주기 전 상황 객관적 분석 연습'
  },
  MHL: {
    code: 'MHL',
    name: '냉담한-거리두는',
    description: '다양한 가능성을 고려하면서 조심스럽게 판단한 뒤에 행동하는 신중한 사람. 남들이 흔히 간과하는 문제점들까지도 미리 챙겨서 대처할 준비를 하기 때문에 실수가 적다.',
    strengths: '신중함, 실수 적음, 자기 보호, 현실적',
    weaknesses: '겁이 많고 소심하며 냉정함. 친밀한 관계 폭 좁음',
    coachingTips: '신중함을 강점으로 인정하되, 신뢰할 수 있는 사람에게 마음 열기 연습'
  },
  HLL: {
    code: 'HLL',
    name: '모험적인',
    nameAlt: '반사회성 경향',
    description: '흥미와 관심의 범위가 넓고 활동적이며, 모험적이고 대담하며, 자기 주장이 강한 독립적인 사람. 새로운 가능성에 도전하는 것을 즐긴다.',
    strengths: '활동성, 모험심, 대담함, 독립성, 추진력',
    weaknesses: '충동적이고 공격적이며 무심하고 냉정함. 타인 감정 고려 못함',
    coachingTips: '추진력을 강점으로 인정하되, 행동 전 타인에게 미칠 영향 생각하기',
    personalityDisorderTendency: '반사회성(Antisocial)'
  },
  HLH: {
    code: 'HLH',
    name: '열정적인',
    nameAlt: '연극성 경향',
    description: '사람들과 어울림을 즐기고, 무리 속에서 인정받고 사랑 받는 것을 좋아한다. 사교적이고 감정이 풍부한 매력적인 사람.',
    strengths: '사교성, 매력, 표현력, 분위기 메이커, 낙관성',
    weaknesses: '감정 기복이 심하고 정서적으로 불안정. 관계 피상적',
    coachingTips: '표현력을 강점으로 인정하되, 깊이 있는 관계 형성에 시간 투자',
    personalityDisorderTendency: '연극성(Histrionic)'
  },
  HHH: {
    code: 'HHH',
    name: '예민한',
    nameAlt: '자기애성 경향',
    description: '감수성이 풍부하여 다양한 감정을 섬세하게 느끼면서도 원만한 인간관계를 위해 직접적으로 감정을 표현하는 일은 별로 없는 신중하고 민감한 사람.',
    strengths: '감수성, 섬세함, 빈틈없음, 예의바름, 경청',
    weaknesses: '근심이 많고 비관적이며 평가에 민감. 우유부단',
    coachingTips: '섬세함을 강점으로 인정하되, 완벽하지 않아도 괜찮다는 자기 수용 연습',
    personalityDisorderTendency: '자기애성(Narcissistic)'
  },
  HHL: {
    code: 'HHL',
    name: '폭발적인',
    nameAlt: '경계선 경향',
    description: '풍부한 감수성과 순발력을 지니고 있는 열정적이고 자유분방한 사람. 상황 변화에 따른 감정 변화의 폭이 큰 편이며, 자신의 감정을 강하게 표현한다.',
    strengths: '감수성, 순발력, 열정, 분명한 호불호, 담대함',
    weaknesses: '충동적이고 감정 조절 불안정. 인간관계 갈등 잦음',
    coachingTips: '열정을 강점으로 인정하되, 감정이 격할 때 일단 멈추고 호흡하기 연습',
    personalityDisorderTendency: '경계선(Borderline)'
  },
  LHL: {
    code: 'LHL',
    name: '조직적인',
    nameAlt: '강박성 경향',
    description: '작고 사소한 일도 소홀히 여기지 않고 꼼꼼히 챙기며, 정해진 원칙과 기준을 잘 따르는 엄격하고 조심성 많은 사람.',
    strengths: '꼼꼼함, 원칙 준수, 완벽 추구, 끈기, 절제',
    weaknesses: '융통성 부족하고 경직됨. 지나친 완벽주의',
    coachingTips: '꼼꼼함을 강점으로 인정하되, "충분히 좋음"의 기준 설정 연습',
    personalityDisorderTendency: '강박성(Obsessional)'
  },
  LLL: {
    code: 'LLL',
    name: '독립적인',
    nameAlt: '조현성 경향',
    description: '어려움에 부딪혀도 쉽게 동요하지 않고 침착함을 유지하고, 매사를 스스로 판단하고 소신있게 행동하는 독립적인 사람.',
    strengths: '침착함, 독립성, 소신, 창의성, 몰입력',
    weaknesses: '주변 사람들에게 무관심하고 잘 어울리지 않음. 냉담',
    coachingTips: '독창성을 강점으로 인정하되, 최소한의 사회적 연결 유지의 중요성 인식',
    personalityDisorderTendency: '조현성(Schizoid)'
  },
  LLH: {
    code: 'LLH',
    name: '신뢰로운',
    nameAlt: '안정된',
    description: '어려운 일을 당해도 좌절하지 않고 꿋꿋하고 담대하게 일을 해결해 나간다. 여러 사람들과 온화하고 긍정적인 관계를 형성하며 믿음직한 면모를 지닌 사람.',
    strengths: '회복탄력성, 온화함, 배려심, 침착함, 낙천성, 신뢰성',
    weaknesses: '전통이나 원칙 강조로 권위적 태도 보이기도 함',
    coachingTips: '안정감을 강점으로 인정하되, 비판에 대한 내성 기르기'
  },
  LHH: {
    code: 'LHH',
    name: '조심스러운',
    nameAlt: '회피성 경향',
    description: '어떤 결정을 내리기 전에 오랜 시간을 두고 충분한 정보를 수집하면서 여러 모로 생각하는 신중한 사람. 공손하고 양심적이며, 다른 사람의 입장과 감정을 충분히 배려한다.',
    strengths: '신중함, 정보 수집력, 공손함, 양심적, 배려심',
    weaknesses: '겁이 많고 자신감 부족하며 남에게 의지함. 거절에 대한 두려움',
    coachingTips: '신중함을 강점으로 인정하되, 작은 결정부터 스스로 내리는 연습',
    personalityDisorderTendency: '회피성(Avoidant)'
  }
};


// ============================================================
// 2. 성격 27유형 해석 (SD × CO × ST)
// ============================================================
export const CHARACTER_TYPES = {
  MMM: {
    code: 'MMM',
    name: '중간',
    description: '대체로 책임감 있고 자신감 있는 태도를 유지하지만 현실적이고 즉각적인 만족을 위해 장기적인 목표를 미루거나 포기하는 경우가 있을 수 있다. 스트레스가 가중되면 위축되고 의존적인 모습을 보일 수 있다.',
    strengths: '책임감, 자신감, 공감력',
    weaknesses: '즉각적 만족 추구, 스트레스 시 위축',
    coachingTips: '장기 목표와 단기 욕구의 균형 맞추기 연습'
  },
  HMM: {
    code: 'HMM',
    name: '높은 자율성',
    description: '자신이 하고자 하는 일을 자유롭게 선택하고, 자신의 태도나 행동이 자신의 선택에 따른 것임을 인정하고 그 책임을 수용한다. 삶에 대한 목적 의식이 강하고 목표 지향적이다.',
    strengths: '자기결정권, 목적의식, 효율성, 유능함, 주도성',
    weaknesses: '타인을 공감하고 배려하는 측면 상대적으로 부족',
    coachingTips: '자율성을 유지하면서 타인과의 협력 스킬 개발'
  },
  LMM: {
    code: 'LMM',
    name: '낮은 자율성',
    description: '자신의 태도나 행동에 대한 책임을 받아들이지 않고, 자신에게 일어난 일을 주변의 탓으로 돌리고 원망하는 경향이 있다. 삶에 대한 목적 의식이 부족하다.',
    strengths: '다른 사람을 공감하고 배려하는 마음',
    weaknesses: '책임 회피, 원망 경향, 목적의식 부족, 자존감 낮음',
    coachingTips: '작은 성공 경험 축적으로 자기 효능감 향상'
  },
  MHM: {
    code: 'MHM',
    name: '높은 연대감',
    description: '타인에게 관대하고 우호적이다. 자신과 다른 가치를 가진 사람도 있는 그대로 수용하려고 노력한다. 정직하고 양심적이며 다른 사람을 일관되게 공정한 방식으로 대한다.',
    strengths: '관대함, 우호성, 수용력, 협력, 양심적, 공정함',
    weaknesses: '자율성 발달 부족 시 대인관계에서 순종적',
    coachingTips: '타인을 돕는 것과 자기 돌봄의 균형 맞추기'
  },
  MLM: {
    code: 'MLM',
    name: '낮은 연대감',
    description: '타인에 대한 관대함이 부족해서 자신과 다른 가치를 가진 사람을 잘 받아들이지 못하고 비판적인 경향을 보인다.',
    strengths: '독립적 업무 수행',
    weaknesses: '관대함 부족, 비판적, 공감 부족, 기회주의적',
    coachingTips: '타인의 관점에서 생각해보는 연습'
  },
  MMH: {
    code: 'MMH',
    name: '높은 자기초월',
    description: '한 개인으로서의 자신의 중요성을 과대평가하지 않는 겸손한 사람. 이 세상을 더 나은 곳으로 만들기 위해 개인적 희생을 기꺼이 감수한다.',
    strengths: '겸손, 헌신, 수용력, 초연함',
    weaknesses: '현실감 부족한 이상주의자로 인식될 수 있음',
    coachingTips: '이상과 현실의 균형 맞추기'
  },
  MML: {
    code: 'MML',
    name: '낮은 자기초월',
    description: '한 개인으로서의 자신을 중요하게 생각하고 자긍심이 높은 사람. 합리성과 객관성을 중시하고 물질적인 것에 더 높은 가치를 부여한다.',
    strengths: '자긍심, 합리성, 객관성 중시',
    weaknesses: '통제욕 강함, 상상력 부족, 불확실성 수용 어려움',
    coachingTips: '통제할 수 없는 것을 받아들이는 연습'
  },
  HHM: {
    code: 'HHM',
    name: '성숙한',
    description: '자신을 이해하고 수용할 뿐만 아니라 타인에 대한 이해와 수용의 마음을 가진 성숙한 사람. 문제해결이나 적응의 효율성이 높은 편.',
    strengths: '자기이해, 타인수용, 균형, 효율성, 책임감, 동정심',
    weaknesses: '특별히 두드러지는 약점 없음',
    coachingTips: '현재의 성숙함을 유지하면서 지속적인 성장 추구'
  },
  LLM: {
    code: 'LLM',
    name: '미성숙한',
    description: '자신을 있는 그대로 잘 수용하지 못하며, 다른 사람의 모습 또한 있는 그대로 잘 받아들이지 못한다. 자기 확신이나 목표가 불분명하다.',
    strengths: '변화 욕구가 있음',
    weaknesses: '자기수용 부족, 타인수용 부족, 목표 불분명, 위축',
    coachingTips: '있는 그대로의 자신을 수용하는 연습'
  },
  HLM: {
    code: 'HLM',
    name: '약자를 괴롭히는',
    description: '자신의 목적 의식이나 목표 지향성은 뚜렷하지만 타인을 공감하고 배려하는 측면이 부족하다. 활동적이고 정력적이나 경쟁적이고 지배적인 인상을 줄 수 있다.',
    strengths: '목적의식, 목표지향성, 활동성, 추진력',
    weaknesses: '공감 부족, 배려 부족, 경쟁적, 지배적',
    coachingTips: '성공과 함께 관계의 중요성 인식. 경청과 공감 연습'
  },
  LHM: {
    code: 'LHM',
    name: '복종적인',
    description: '다른 사람에게 도움이 되고 싶어하고 동정심이 많으면서도 자신의 목표가 분명하지 않아서 대인관계에서 복종적이고 순종적인 행동 패턴을 보이기 쉽다.',
    strengths: '도움 주고 싶어함, 동정심, 관대함',
    weaknesses: '목표 불분명, 복종적, 의존적, 자기주장 부족',
    coachingTips: '자기 욕구 인식하기. 작은 것부터 자기 주장 연습'
  },
  HMH: {
    code: 'HMH',
    name: '독창적인',
    description: '독창적이고 창의성이 풍부하며, 무리 중에 섞여 있더라도 두드러지는 비범함을 지니고 있다. 삶에 있어서 자신의 장단기 목표를 분명하게 설정하고 이를 일관되게 추구한다.',
    strengths: '독창성, 창의성, 비범함, 목표 일관성, 자기수용',
    weaknesses: '특별히 두드러지는 약점 없음',
    coachingTips: '창의성을 발휘할 수 있는 환경 조성'
  },
  LML: {
    code: 'LML',
    name: '모방하는',
    description: '상상력과 창의력이 부족하고 대부분의 사람들이 하는 대로 주류를 따라가는 편이다. 비일관적이고 수동적인 모습을 보일 수 있다.',
    strengths: '주류 따르기, 상황 적응',
    weaknesses: '상상력 부족, 창의력 부족, 수동적, 소유욕',
    coachingTips: '자기만의 관심사 발견하기'
  },
  HML: {
    code: 'HML',
    name: '논리적인',
    description: '자발적으로 자신의 목표를 설정하고 이를 일관되게 추진해나간다. 합리성과 효율성을 중요시하며, 논리적이고 조직화된 방식으로 문제를 해결한다.',
    strengths: '목표 설정, 일관성, 책임감, 합리성, 효율성, 자기조절',
    weaknesses: '통제욕 강함, 불확실성 수용 어려움',
    coachingTips: '통제할 수 없는 것을 받아들이는 연습. 유연성 개발'
  },
  LMH: {
    code: 'LMH',
    name: '비논리적인',
    description: '상상력이 풍부하지만 이를 추구하기 위한 현실적인 방법을 제대로 찾지 못하여 혼란된 모습을 보일 수 있다.',
    strengths: '상상력, 범우주적 관심',
    weaknesses: '현실적 방법 부족, 혼란, 책임감 부족, 비논리적 사고',
    coachingTips: '상상력을 현실로 연결하는 구체적 계획 수립 연습'
  },
  MHH: {
    code: 'MHH',
    name: '사려깊고 친절한',
    description: '다정다감하며, 동정심이 많고, 따뜻한 마음을 지니고 있다. 다른 사람들을 돕고 싶어하고, 타인과 깊은 연대감을 느낀다.',
    strengths: '다정다감, 동정심, 따뜻함, 헌신, 유연성',
    weaknesses: '자기-타인 경계 모호, 자기 돌봄 소홀 가능성',
    coachingTips: '타인을 돕는 것과 자기 돌봄의 균형'
  },
  MLL: {
    code: 'MLL',
    name: '이기적인',
    description: '타인에 대한 이해와 배려가 부족하여 자신에게 이익이 되는 방식으로 이기적으로 행동할 가능성이 높다.',
    strengths: '자기 이익 추구',
    weaknesses: '배려 부족, 이기적, 관대함 부족, 냉담, 융통성 부족',
    coachingTips: '타인의 입장에서 생각해보기. 작은 것부터 나누는 연습'
  },
  MHL: {
    code: 'MHL',
    name: '타인을 신뢰하는',
    description: '다른 사람을 잘 신뢰하는 편이며, 동정심이 많고, 솔직하고 공정하다. 협조를 잘 하는 편이다.',
    strengths: '신뢰, 동정심, 이해력, 솔직함, 공정함, 협조',
    weaknesses: '창의성 부족, 보수적',
    coachingTips: '신뢰를 유지하면서 새로운 시도도 해보기'
  },
  MLH: {
    code: 'MLH',
    name: '타인을 의심하는',
    description: '다른 사람을 잘 믿지 못하며, 자기 자신을 다른 사람과 비교하거나 질투를 느끼기 쉽다.',
    strengths: '독특한 시선, 통찰력, 명민함',
    weaknesses: '불신, 비교, 질투, 타인 관심 부족',
    coachingTips: '타인에 대한 신뢰 형성 연습'
  },
  LLL: {
    code: 'LLL',
    name: '풀이죽은/우울성',
    description: '자기중심적이고 미성숙하며, 감정의 기복이 심하다. 부정적인 감정에 압도되기 쉽다. 우울감이나 무력감을 잘 느끼고, 우울증에 취약하다.',
    strengths: '특별히 두드러지는 강점 발견 필요',
    weaknesses: '자기중심적, 미성숙, 감정기복, 부정적 사고, 우울',
    coachingTips: '전문적 상담 권장. 작은 긍정적 경험 쌓기',
    personalityDisorderTendency: '우울성(Melancholic)'
  },
  LLH: {
    code: 'LLH',
    name: '비조직화된/조현형',
    description: '말이나 생각이 체계적이거나 논리적이지 못하고, 상상과 공상이 많다. 신비주의적이거나 마술적인 사고를 보이는 경우가 있다.',
    strengths: '상상력, 독특한 사고',
    weaknesses: '비체계적, 비논리적, 마술적 사고, 불신, 친밀감 부족',
    coachingTips: '전문적 상담 권장. 현실 검증력 향상',
    personalityDisorderTendency: '조현형(Schizotypal)'
  },
  LHL: {
    code: 'LHL',
    name: '의존적인',
    description: '따뜻하고 협조적이며, 순종적이고 의존적이며, 다른 사람을 잘 믿는 경향이 있다. 다른 사람의 사소한 거절이나 비판 등에 쉽게 상처를 입는다.',
    strengths: '따뜻함, 협조적, 신뢰',
    weaknesses: '순종적, 의존적, 거절에 취약, 수치심',
    coachingTips: '자기 효능감 향상. 거절에 대한 내성 기르기',
    personalityDisorderTendency: '의존성 경향'
  },
  HLL: {
    code: 'HLL',
    name: '독재적인',
    description: '목적 의식이 분명하고 목표 지향성이 뚜렷하여 자신의 행동을 효율적으로 통제한다. 자기 중심적이고 권위적인 특성을 보인다.',
    strengths: '목적의식, 목표지향성, 효율성, 논리성, 자기통제력',
    weaknesses: '자기중심적, 권위적, 공격적, 관대함 부족, 분노',
    coachingTips: '분노 조절 연습. 타인에 대한 공감과 인내 개발',
    personalityDisorderTendency: '자기애성/반사회성 경향'
  },
  HHH: {
    code: 'HHH',
    name: '창조적인',
    description: '창조적이고 수용적이며 사려 깊고 성숙한 모습을 보인다. 대체로 긍정적인 감정을 자주 느끼고, 개인적인 욕구를 넘어서서 보다 의미 있는 목표와 가치를 추구한다.',
    strengths: '창조성, 수용성, 사려깊음, 성숙함, 긍정성, 겸손, 자기실현',
    weaknesses: '특별히 두드러지는 약점 없음',
    coachingTips: '현재의 성숙함을 유지하면서 지속적인 성장과 나눔 추구'
  },
  HHL: {
    code: 'HHL',
    name: '조직화된',
    description: '매사에 합리적이며 남에게 신뢰를 준다. 자기 목표가 분명하고 책임 의식이 뚜렷할 뿐 아니라 다른 사람의 감정을 공감하고 배려하는 성향도 높다.',
    strengths: '합리성, 신뢰성, 목표의식, 책임감, 공감, 배려, 효율성',
    weaknesses: '물질적 가치 중시, 창조성 부족',
    coachingTips: '물질적 가치와 정신적 가치의 균형'
  },
  HLH: {
    code: 'HLH',
    name: '광신적인/편집성',
    description: '자기 목표 의식은 분명하지만 다른 사람을 쉽게 믿지 못하여 안정적이고 신뢰로운 관계를 형성하는 데 어려움을 겪을 수 있다.',
    strengths: '목표의식, 독특한 취향',
    weaknesses: '불신, 관계 형성 어려움, 비난, 원망',
    coachingTips: '타인에 대한 신뢰 형성 연습. 비난 대신 문제 해결 중심 사고',
    personalityDisorderTendency: '편집성(Paranoid)'
  },
  LHH: {
    code: 'LHH',
    name: '기분이 변하는/순환성',
    description: '타인에게 따뜻하고 공감적이며 사려 깊은 모습을 보이지만, 거절 당하는 것에 예민하고 상처를 받기 쉽다. 기분 변화의 폭이 크고 잦은 편이다.',
    strengths: '따뜻함, 공감, 사려깊음',
    weaknesses: '거절에 예민, 상처받기 쉬움, 기분기복, 일관성 부족',
    coachingTips: '기분 조절 기법 학습. 거절에 대한 내성 기르기',
    personalityDisorderTendency: '순환성(Cyclothymic)'
  }
};


// ============================================================
// 3. 기질 상호작용 해석
// ============================================================
export const TEMPERAMENT_INTERACTIONS = {
  'NS-HA': {
    title: '자극추구 × 위험회피 상호작용',
    subtitle: '행동 활성화 시스템(BAS) vs 행동 억제 시스템(BIS)',
    combinations: {
      'HH': {
        code: 'NH',
        name: '접근-회피 갈등형',
        description: '새로운 자극에 이끌리면서도 동시에 두려움을 느끼는 접근-회피 갈등을 경험한다. 신경증적 경향이 있으며 만성적인 좌절감을 느끼기 쉽다.',
        coachingTips: '충동과 걱정 사이의 균형 찾기'
      },
      'LL': {
        code: 'nh',
        name: '명랑-안정형',
        description: '명랑하고 태평하며 자신감이 있다. 부정적인 감정으로부터 상대적으로 자유롭다. 침착하고 안정적인 모습을 보인다.',
        coachingTips: '안정성을 유지하면서 적절한 도전 기회 찾기'
      },
      'HL': {
        code: 'Nh',
        name: '충동-외향형',
        description: '충동적이고 외향적이며 공격적인 경향이 있다. 흥분과 위험을 추구하며, 두려움 없이 새로운 것에 뛰어든다.',
        coachingTips: '행동 전 결과 예측 연습'
      },
      'LH': {
        code: 'nH',
        name: '내향-안전형',
        description: '내향적이고 안전을 지향한다. 새로운 자극보다는 익숙한 것을 선호하며, 위험을 피하려는 경향이 강하다.',
        coachingTips: '안전한 환경에서 작은 도전 시도'
      }
    }
  },
  'NS-RD': {
    title: '자극추구 × 사회적민감성 상호작용',
    subtitle: '사회적 행동 양식',
    combinations: {
      'HH': {
        code: 'NR',
        name: '사교-표현형',
        description: '사교적이고 감정 표현이 풍부하다. 남들의 주목을 끄는 행동을 즐기며, 자신의 감정을 적극적으로 드러낸다.',
        coachingTips: '표현력을 강점으로 활용하되, 타인의 반응에 덜 의존하기'
      },
      'LL': {
        code: 'nr',
        name: '독립-조용형',
        description: '관계보다 개인생활을 중시하고, 무리 속에서 잘 드러나지 않는다. 독립적으로 활동하는 것을 선호한다.',
        coachingTips: '필요한 관계는 유지하면서 개인 공간 확보하기'
      },
      'HL': {
        code: 'Nr',
        name: '기회-피상형',
        description: '기회주의적이고 비관습적인 면이 있다. 관계의 깊이가 부족하고, 진실성이 부족하다는 평가를 받기도 한다.',
        coachingTips: '관계의 깊이 개발. 진정성 있는 소통 연습'
      },
      'LH': {
        code: 'nR',
        name: '전통-진솔형',
        description: '보수적이고 전통적이며 양심적이다. 감정 표현이 진솔하고, 관계에서 신뢰를 중시한다.',
        coachingTips: '전통을 존중하면서 새로운 시도도 열린 마음으로'
      }
    }
  },
  'HA-RD': {
    title: '위험회피 × 사회적민감성 상호작용',
    subtitle: '대인관계 패턴',
    combinations: {
      'HH': {
        code: 'HR',
        name: '수동-의존형',
        description: '수동적이고 회피적이며 복종적이고 의존적인 경향이 있다. 갈등을 피하려 하고, 타인의 의견에 쉽게 동조한다.',
        coachingTips: '자기 의견 표현 연습. 건강한 자기주장 개발'
      },
      'LL': {
        code: 'hr',
        name: '독립-직선형',
        description: '관계를 두려워하지는 않지만 관심도 적다. 직선적으로 의사를 표현하며, 때로는 반항적으로 비칠 수 있다.',
        coachingTips: '필요한 관계에서는 부드러운 소통 연습'
      },
      'HL': {
        code: 'Hr',
        name: '회피-고립형',
        description: '회피와 고립을 선택하는 경향이 있다. 사회적 상황을 두려워하면서도 관계에 대한 관심이 낮다.',
        coachingTips: '안전한 환경에서 사회적 연결 시도'
      },
      'LH': {
        code: 'hR',
        name: '친화-사교형',
        description: '친화적이고 사교적이며 대인 영향력이 크다. 사람들과의 관계에서 두려움이 적고, 따뜻하게 다가간다.',
        coachingTips: '친화력을 강점으로 활용하면서 자기 시간도 확보'
      }
    }
  }
};


// ============================================================
// 4. 성격장애 경향성 맵
// ============================================================
export const PERSONALITY_DISORDER_MAP = {
  HHL: { tendency: '경계선(Borderline)', risk: 'high' },
  HLL: { tendency: '반사회성(Antisocial)', risk: 'high' },
  LHH: { tendency: '회피성(Avoidant)', risk: 'high' },
  HLH: { tendency: '연극성(Histrionic)', risk: 'moderate' },
  LHL: { tendency: '강박성(Obsessional)', risk: 'moderate' },
  HHH: { tendency: '자기애성(Narcissistic)', risk: 'moderate' },
  LLL: { tendency: '조현성(Schizoid)', risk: 'moderate' },
  LLH: { tendency: '안정된(Staid)', risk: 'low' }
};


// ============================================================
// 5. 유틸리티 함수
// ============================================================

export const getTScoreLevel = (tScore) => {
  if (tScore < 45) return 'L';
  if (tScore <= 55) return 'M';
  return 'H';
};

export const getPercentileLevel = (percentile) => {
  if (percentile < 30) return 'L';
  if (percentile <= 70) return 'M';
  return 'H';
};

export const calculateTemperamentType = (member) => {
  const ns = getTScoreLevel(member.ns_t || member.NST);
  const ha = getTScoreLevel(member.ha_t || member.HAT);
  const rd = getTScoreLevel(member.rd_t || member.RDT);
  return `${ns}${ha}${rd}`;
};

export const calculateCharacterType = (member) => {
  const sd = getTScoreLevel(member.sd_t || member.SDT);
  const co = getTScoreLevel(member.co_t || member.COT);
  const st = getTScoreLevel(member.st_t || member.STT);
  return `${sd}${co}${st}`;
};

export const checkPersonalityDisorderTendency = (sd_p, co_p) => {
  if ((sd_p < 30 && co_p < 30) || (sd_p + co_p) < 30) {
    return {
      warning: true,
      severity: 'high',
      message: '자율성(SD)과 연대감(CO)의 백분위 점수가 모두 30점 미만이거나 합산 점수가 30점 미만입니다. 전문적인 상담이 권장됩니다.'
    };
  }
  if (sd_p < 30 || co_p < 30) {
    return {
      warning: true,
      severity: 'moderate',
      message: `${sd_p < 30 ? '자율성(SD)' : '연대감(CO)'}의 백분위 점수가 30점 미만입니다.`
    };
  }
  return { warning: false, severity: 'none', message: null };
};

export const getTemperamentInterpretation = (typeCode) => {
  return TEMPERAMENT_TYPES[typeCode] || null;
};

export const getCharacterInterpretation = (typeCode) => {
  return CHARACTER_TYPES[typeCode] || null;
};

export const getInteractionInterpretation = (interactionType, combination) => {
  const interaction = TEMPERAMENT_INTERACTIONS[interactionType];
  if (!interaction) return null;
  return interaction.combinations[combination] || null;
};

export default {
  TEMPERAMENT_TYPES,
  CHARACTER_TYPES,
  TEMPERAMENT_INTERACTIONS,
  PERSONALITY_DISORDER_MAP,
  getTScoreLevel,
  getPercentileLevel,
  calculateTemperamentType,
  calculateCharacterType,
  checkPersonalityDisorderTendency,
  getTemperamentInterpretation,
  getCharacterInterpretation,
  getInteractionInterpretation
};
