import React, { useState, useRef } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import Papa from 'papaparse';
import {
  TEMPERAMENT_TYPES,
  CHARACTER_TYPES,
  TEMPERAMENT_INTERACTIONS,
  getTScoreLevel,
  checkPersonalityDisorderTendency
} from './data/interpretations';

// ========================================
// 3D 바 컴포넌트 (CSS 그라데이션 효과)
// ========================================
const Custom3DBar = (props) => {
  const { x, y, width, height, fill } = props;
  if (!height || height <= 0) return null;

  const sideWidth = Math.min(width * 0.15, 8);
  const topHeight = Math.min(6, height * 0.1);

  // 색상 조절 함수
  const adjustColor = (color, amount) => {
    const hex = color.replace('#', '');
    const r = Math.max(0, Math.min(255, parseInt(hex.slice(0, 2), 16) + amount));
    const g = Math.max(0, Math.min(255, parseInt(hex.slice(2, 4), 16) + amount));
    const b = Math.max(0, Math.min(255, parseInt(hex.slice(4, 6), 16) + amount));
    return `rgb(${r},${g},${b})`;
  };

  const gradientId = `grad3d-${fill?.replace('#', '')}-${Math.random().toString(36).substr(2, 9)}`;
  const lighterColor = adjustColor(fill || '#3B82F6', 40);
  const darkerColor = adjustColor(fill || '#3B82F6', -50);
  const sideColor = adjustColor(fill || '#3B82F6', -30);

  return (
    <g>
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={lighterColor} />
          <stop offset="50%" stopColor={fill} />
          <stop offset="100%" stopColor={darkerColor} />
        </linearGradient>
      </defs>
      {/* 메인 바 (그라데이션) */}
      <rect x={x} y={y} width={width - sideWidth} height={height} fill={`url(#${gradientId})`} rx={3} ry={3} />
      {/* 오른쪽 사이드 (어두운 면) */}
      <rect x={x + width - sideWidth} y={y + topHeight} width={sideWidth} height={height - topHeight} fill={sideColor} />
      {/* 상단 하이라이트 */}
      <rect x={x} y={y} width={width - sideWidth} height={topHeight} fill={lighterColor} rx={3} ry={0} />
      {/* 상단 사이드 코너 */}
      <polygon points={`${x + width - sideWidth},${y} ${x + width},${y + topHeight} ${x + width - sideWidth},${y + topHeight}`} fill={adjustColor(fill || '#3B82F6', 20)} />
    </g>
  );
};

// ========================================
// 용어 정의 (최종 확정)
// ========================================
const scaleLabels = {
  NS: '탐색성', HA: '신중성', RD: '관계 민감성', PS: '실행 관성력',
  SD: '자기 주도성', CO: '관계 협력성', ST: '초월 지향성'
};

const engLabels = {
  NS: 'Novelty Seeking', HA: 'Harm Avoidance', RD: 'Reward Dependence', PS: 'Persistence',
  SD: 'Self-Directedness', CO: 'Cooperativeness', ST: 'Self-Transcendence'
};

const subScaleLabels = {
  NS1: '안정 추구 ↔ 탐색적 흥분', NS2: '숙고성 ↔ 즉흥성', NS3: '절제 ↔ 향유', NS4: '체계성 ↔ 유연성',
  HA1: '미래위험 센서', HA2: '불확실성 수용성 ↔ 경계성', HA3: '사회적 개방성 ↔ 신중함', HA4: '활력 ↔ 에너지 관리',
  RD1: '정서 민감성', RD2: '정서 표현 절제 ↔ 개방', RD3: '독립적 관계 ↔ 밀착적 관계', RD4: '자립지향 ↔ 협력지향',
  PS1: '여유 있는 실행 ↔ 꾸준한 실행', PS2: '유연함 ↔ 지속력', PS3: '현재 만족 ↔ 성취 지향', PS4: '유연 기준 ↔ 높은 기준',
  SD1: '상황 요인 중시 ↔ 개인 책임', SD2: '단기 목표 ↔ 장기 목표', SD3: '자기 겸양심 ↔ 자기효능감', SD4: '개선지향 ↔ 자기수용', SD5: '상황 적응성 ↔ 가치 일치성',
  CO1: '타인수용', CO2: '공감/존중', CO3: '이타성', CO4: '관대함', CO5: '공평',
  ST1: '자기인식 ↔ 창조적 몰입', ST2: '현실 집중 ↔ 연결감 지향', ST3: '현실중심 ↔ 초월지향'
};

// 5열 구조 장단점 데이터
const scaleTraits = {
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

// 규준 데이터
const norms = {
  NS1: { m: 9.5, sd: 3.2 }, NS2: { m: 7.0, sd: 3.3 }, NS3: { m: 6.0, sd: 3.2 }, NS4: { m: 5.2, sd: 3.2 },
  HA1: { m: 7.8, sd: 4.1 }, HA2: { m: 9.9, sd: 3.0 }, HA3: { m: 8.7, sd: 3.6 }, HA4: { m: 8.7, sd: 3.4 },
  RD1: { m: 11.1, sd: 2.9 }, RD2: { m: 10.5, sd: 3.0 }, RD3: { m: 11.6, sd: 3.3 }, RD4: { m: 9.4, sd: 2.6 },
  PS1: { m: 12.7, sd: 3.0 }, PS2: { m: 10.7, sd: 3.0 }, PS3: { m: 10.4, sd: 3.7 }, PS4: { m: 9.9, sd: 3.5 },
  SD1: { m: 12.7, sd: 2.9 }, SD2: { m: 11.6, sd: 3.1 }, SD3: { m: 6.8, sd: 1.9 }, SD4: { m: 4.2, sd: 1.7 }, SD5: { m: 12.5, sd: 3.2 },
  CO1: { m: 12.6, sd: 2.8 }, CO2: { m: 9.6, sd: 2.5 }, CO3: { m: 9.9, sd: 2.5 }, CO4: { m: 8.9, sd: 2.6 }, CO5: { m: 15.1, sd: 2.5 },
  ST1: { m: 9.1, sd: 4.0 }, ST2: { m: 7.4, sd: 4.1 }, ST3: { m: 9.2, sd: 5.4 }
};

// 색상 팔레트
const memberColors = ['#60A5FA', '#F97316', '#A78BFA', '#10B981', '#F472B6', '#FBBF24', '#22D3EE', '#A3E635', '#EF4444', '#818CF8'];
const temperamentColor = '#3B82F6';
const characterColor = '#10B981';

// 하위지표 그룹
const subScaleGroups = {
  NS: ['NS1', 'NS2', 'NS3', 'NS4'],
  HA: ['HA1', 'HA2', 'HA3', 'HA4'],
  RD: ['RD1', 'RD2', 'RD3', 'RD4'],
  PS: ['PS1', 'PS2', 'PS3', 'PS4'],
  SD: ['SD1', 'SD2', 'SD3', 'SD4', 'SD5'],
  CO: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
  ST: ['ST1', 'ST2', 'ST3']
};

// 상위 척도 강점/약점 특성 (풍부한 설명)
const mainScaleTraits = {
  NS: {
    lowAdv: ['차분하고 안정적인', '숙고하는/집중하는', '검소하고 절약하는', '차분하고 질서정연한'],
    lowDis: ['익숙함을 고수하는', '관습적인', '인색한', '무뚝뚝한'],
    highAdv: ['활발히 탐색하는', '새로운 것에 개방적인', '가진 것을 십분 즐기는', '자유롭고 혁신적인'],
    highDis: ['충동적인/흥분하는', '중독에 취약한', '낭비하는', '분노조절이 잘 안 되는']
  },
  HA: {
    lowAdv: ['낙관적인/자신감 있는', '침착하고 대담한', '사교적으로 잘 어하는', '활력이 넘치는'],
    lowDis: ['위험대책이 없는', '문제를 간과하는', '쉽게 사람을 믿는', '과로하는'],
    highAdv: ['잘 대비하는', '안전을 중시하는', '신중하게 접근하는', '몸을 잘 관리하는'],
    highDis: ['염려하고 걱정하는', '위축되고 억제되는', '낯선 사람 경계하는', '쉽게 지치는']
  },
  RD: {
    lowAdv: ['강인하고 현실적인', '타인 영향을 덜 받고 객관적인', '스스로 충전되는', '독립적인, 주관이 뚜렷한'],
    lowDis: ['둔감하고 무관심한', '차갑고 냉정한', '사회접촉에서 소진되는', '외골수적이고 눈치가 없는'],
    highAdv: ['동정심/이해심 많은', '친밀하게 다가가는', '마음을 열고 다불어 사는', '눈치가 빠른'],
    highDis: ['기분이 쉽게 변하는', '마음이 여린', '의존적인', '거절/모욕에 민감한']
  },
  PS: {
    lowAdv: ['전략적이고 융통성있는', '현재에 만족하는', '변화에 잘 대응하는', '실용적인'],
    lowDis: ['미루는', '쉽게 포기하는', '야망이 없는', '능력보다 작게 성취하는'],
    highAdv: ['책임감있는', '심지가 굳고 꾸준한', '야심적인, 도전하는', '성취수준이 높은'],
    highDis: ['완고한', '변화의 결단을 미루는', '무리한 기준을 고수하는', '자신에게 혹독한']
  },
  SD: {
    lowAdv: ['상황에 유연한', '겸손한', '훈련으로 성장하려는', '상황 적응적인'],
    lowDis: ['남탓하는', '목적/의미 탐색중인', '무능감/타인 의존', '유혹에 굴복하는'],
    highAdv: ['책임지는/신뢰로운', '장기목표와 가치 지향', '자기효능감/도전의식', '가치에 부합하는 행동'],
    highDis: ['과도한 자기 비난', '지나친 미래 지향', '자만심', '경직된 원칙주의']
  },
  CO: {
    lowAdv: ['비판적 사고', '객관적 판단', '자기 보호', '정의감'],
    lowDis: ['자기중심적', '타인 배려 부족', '이기적', '복수심/편파적'],
    highAdv: ['타인 가치 존중/관대', '역지사지/공감', '이타적/팀웍 선호', '용서하고 공정함'],
    highDis: ['무비판적 수용', '감정적 소진', '자기 희생', '지나친 관용']
  },
  ST: {
    lowAdv: ['늘 깨어 있는', '개인주의/현실 집중', '유물론/경험주의', '실용적인'],
    lowDis: ['무미건조한', '자연을 도구로 봄', '설명 불가 상황 대처 곤란', '영적 관심 부족'],
    highAdv: ['자기초월/창조적 몰입', '개인초월 연결감', '초감각적 영적 믿음', '회복력 높음'],
    highDis: ['현실감각 저하', '비현실적 기대', '맹신', '현실 도피적']
  }
};

// 샘플 데이터
const sampleData = [
  { id: 1, name: '박영의', gender: 'F', age: 58, NS: 78, HA: 1, RD: 34, PS: 84, SD: 98, CO: 77, ST: 27, NS1: 15, NS2: 6, NS3: 6, NS4: 8, HA1: 3, HA2: 5, HA3: 2, HA4: 2, RD1: 15, RD2: 10, RD3: 9, RD4: 6, PS1: 14, PS2: 14, PS3: 14, PS4: 12, SD1: 17, SD2: 17, SD3: 9, SD4: 8, SD5: 17, CO1: 12, CO2: 12, CO3: 15, CO4: 8, CO5: 16, ST1: 9, ST2: 3, ST3: 7 },
  { id: 2, name: '김순희', gender: 'F', age: 69, NS: 51, HA: 9, RD: 71, PS: 31, SD: 93, CO: 93, ST: 90, NS1: 10, NS2: 8, NS3: 5, NS4: 5, HA1: 1, HA2: 10, HA3: 5, HA4: 6, RD1: 13, RD2: 13, RD3: 14, RD4: 7, PS1: 14, PS2: 10, PS3: 6, PS4: 9, SD1: 16, SD2: 16, SD3: 9, SD4: 5, SD5: 17, CO1: 18, CO2: 11, CO3: 11, CO4: 12, CO5: 17, ST1: 4, ST2: 14, ST3: 23 },
  { id: 3, name: '장은지', gender: 'F', age: 39, NS: 43, HA: 82, RD: 4, PS: 55, SD: 56, CO: 52, ST: 94, NS1: 11, NS2: 3, NS3: 4, NS4: 8, HA1: 13, HA2: 14, HA3: 13, HA4: 5, RD1: 11, RD2: 7, RD3: 3, RD4: 7, PS1: 5, PS2: 12, PS3: 13, PS4: 15, SD1: 13, SD2: 11, SD3: 7, SD4: 5, SD5: 14, CO1: 12, CO2: 11, CO3: 11, CO4: 8, CO5: 15, ST1: 14, ST2: 11, ST3: 20 },
  { id: 4, name: '전희정', gender: 'F', age: 53, NS: 83, HA: 19, RD: 78, PS: 90, SD: 73, CO: 98, ST: 85, NS1: 15, NS2: 7, NS3: 12, NS4: 3, HA1: 7, HA2: 6, HA3: 5, HA4: 9, RD1: 19, RD2: 13, RD3: 8, RD4: 9, PS1: 17, PS2: 11, PS3: 15, PS4: 14, SD1: 9, SD2: 15, SD3: 9, SD4: 4, SD5: 17, CO1: 13, CO2: 15, CO3: 15, CO4: 12, CO5: 19, ST1: 10, ST2: 9, ST3: 19 },
  { id: 5, name: '김진경', gender: 'F', age: 34, NS: 43, HA: 17, RD: 30, PS: 88, SD: 95, CO: 38, ST: 21, NS1: 13, NS2: 6, NS3: 2, NS4: 5, HA1: 6, HA2: 4, HA3: 5, HA4: 11, RD1: 10, RD2: 11, RD3: 11, RD4: 7, PS1: 13, PS2: 17, PS3: 16, PS4: 10, SD1: 19, SD2: 15, SD3: 11, SD4: 4, SD5: 16, CO1: 14, CO2: 10, CO3: 10, CO4: 6, CO5: 14, ST1: 2, ST2: 4, ST3: 11 },
  { id: 6, name: '박미희', gender: 'F', age: 41, NS: 96, HA: 66, RD: 74, PS: 13, SD: 3, CO: 22, ST: 9, NS1: 13, NS2: 14, NS3: 11, NS4: 9, HA1: 15, HA2: 8, HA3: 7, HA4: 10, RD1: 6, RD2: 16, RD3: 16, RD4: 10, PS1: 9, PS2: 7, PS3: 7, PS4: 10, SD1: 9, SD2: 6, SD3: 4, SD4: 2, SD5: 8, CO1: 8, CO2: 7, CO3: 10, CO4: 6, CO5: 19, ST1: 2, ST2: 0, ST3: 9 },
  { id: 7, name: '박경혜', gender: 'F', age: 52, NS: 90, HA: 3, RD: 22, PS: 95, SD: 100, CO: 61, ST: 98, NS1: 16, NS2: 14, NS3: 10, NS4: 1, HA1: 3, HA2: 3, HA3: 7, HA4: 3, RD1: 11, RD2: 12, RD3: 10, RD4: 4, PS1: 16, PS2: 15, PS3: 16, PS4: 13, SD1: 18, SD2: 18, SD3: 10, SD4: 8, SD5: 19, CO1: 14, CO2: 12, CO3: 10, CO4: 6, CO5: 17, ST1: 18, ST2: 14, ST3: 19 },
  { id: 8, name: '윤여진', gender: 'F', age: 41, NS: 17, HA: 56, RD: 15, PS: 95, SD: 98, CO: 52, ST: 90, NS1: 6, NS2: 4, NS3: 5, NS4: 4, HA1: 8, HA2: 10, HA3: 7, HA4: 12, RD1: 9, RD2: 10, RD3: 8, RD4: 8, PS1: 15, PS2: 14, PS3: 15, PS4: 16, SD1: 17, SD2: 17, SD3: 9, SD4: 6, SD5: 19, CO1: 13, CO2: 13, CO3: 9, CO4: 9, CO5: 13, ST1: 10, ST2: 14, ST3: 17 },
  { id: 9, name: '김지연', gender: 'F', age: 58, NS: 36, HA: 89, RD: 84, PS: 13, SD: 5, CO: 74, ST: 56, NS1: 6, NS2: 9, NS3: 4, NS4: 5, HA1: 12, HA2: 11, HA3: 10, HA4: 15, RD1: 11, RD2: 12, RD3: 14, RD4: 14, PS1: 7, PS2: 7, PS3: 10, PS4: 9, SD1: 7, SD2: 10, SD3: 3, SD4: 2, SD5: 10, CO1: 15, CO2: 9, CO3: 12, CO4: 10, CO5: 16, ST1: 4, ST2: 9, ST3: 14 },
  { id: 10, name: '김은진', gender: 'F', age: 34, NS: 87, HA: 33, RD: 96, PS: 66, SD: 69, CO: 89, ST: 53, NS1: 16, NS2: 9, NS3: 9, NS4: 5, HA1: 2, HA2: 8, HA3: 8, HA4: 13, RD1: 13, RD2: 17, RD3: 17, RD4: 11, PS1: 15, PS2: 12, PS3: 11, PS4: 10, SD1: 14, SD2: 14, SD3: 10, SD4: 4, SD5: 11, CO1: 11, CO2: 13, CO3: 13, CO4: 12, CO5: 18, ST1: 5, ST2: 6, ST3: 15 }
];

// ========================================
// 메인 앱 컴포넌트
// ========================================
export default function App() {
  const [page, setPage] = useState('list');
  const [groups, setGroups] = useState([
    { id: 1, name: 'ACC전문코치반 2501기', desc: '전문코치 양성과정 1기', members: sampleData, createdAt: '2026-01-06' }
  ]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', desc: '' });
  const [uploadedData, setUploadedData] = useState(null);

  const handleCreateGroup = () => {
    if (!newGroup.name || !uploadedData) return;
    const group = {
      id: Date.now(),
      name: newGroup.name,
      desc: newGroup.desc,
      members: uploadedData,
      createdAt: new Date().toISOString().split('T')[0]
    };
    setGroups([...groups, group]);
    setNewGroup({ name: '', desc: '' });
    setUploadedData(null);
    setPage('list');
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // 먼저 EUC-KR로 시도, 실패하면 UTF-8로 시도
    const tryParse = (encoding) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            if (results.errors.length > 0) {
              console.warn('CSV 파싱 경고:', results.errors);
            }

            const data = results.data.map((row, idx) => {
              const obj = { id: idx + 1 };

              // 이름 필드 처리 (다양한 컬럼명 지원)
              obj.name = row.name || row['이름'] || row['Name'] || row['NAME'] || '';

              // 성별, 나이
              obj.gender = row.gender || row['성별'] || row['Gender'] || '';
              obj.age = parseInt(row.age || row['연령'] || row['나이'] || row['Age'] || 0) || null;

              // 상위 척도 (백분위)
              ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'].forEach(scale => {
                const val = row[scale] || row[scale.toLowerCase()] || 0;
                obj[scale] = parseFloat(val) || 0;
              });

              // 하위 척도 (원점수)
              const subScales = [
                'NS1', 'NS2', 'NS3', 'NS4',
                'HA1', 'HA2', 'HA3', 'HA4',
                'RD1', 'RD2', 'RD3', 'RD4',
                'PS1', 'PS2', 'PS3', 'PS4',
                'SD1', 'SD2', 'SD3', 'SD4', 'SD5',
                'CO1', 'CO2', 'CO3', 'CO4', 'CO5',
                'ST1', 'ST2', 'ST3'
              ];
              subScales.forEach(scale => {
                const val = row[scale] || row[scale.toLowerCase()] || 0;
                obj[scale] = parseFloat(val) || 0;
              });

              return obj;
            }).filter(row => row.name); // 이름이 있는 행만 유지

            if (data.length > 0) {
              setUploadedData(data);
            } else if (encoding === 'euc-kr') {
              // EUC-KR에서 데이터가 없으면 UTF-8로 재시도
              tryParse('utf-8');
            } else {
              alert('CSV 파일에서 데이터를 읽을 수 없습니다. 파일 형식을 확인해주세요.');
            }
          },
          error: (error) => {
            console.error('CSV 파싱 오류:', error);
            if (encoding === 'euc-kr') {
              tryParse('utf-8');
            } else {
              alert('CSV 파일을 읽는 중 오류가 발생했습니다.');
            }
          }
        });
      };
      reader.onerror = () => {
        if (encoding === 'euc-kr') {
          tryParse('utf-8');
        }
      };
      reader.readAsText(file, encoding);
    };

    // EUC-KR로 먼저 시도 (한글 엑셀 CSV의 기본 인코딩)
    tryParse('euc-kr');
  };

  const handleDeleteGroup = (id) => {
    if (confirm('이 그룹을 삭제하시겠습니까?')) {
      setGroups(groups.filter(g => g.id !== id));
    }
  };

  // 그룹 리스트 페이지
  if (page === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">TCI 그룹 분석</h1>
              <p className="text-gray-500 mt-1">기질 및 성격검사 그룹 분석 서비스</p>
            </div>
            <button onClick={() => setPage('create')}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2">
              <span className="text-xl">+</span> 새 그룹 만들기
            </button>
          </div>

          {groups.length === 0 ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
              <div className="text-6xl mb-4">📊</div>
              <p className="text-gray-400 text-lg">아직 생성된 그룹이 없습니다.</p>
              <p className="text-gray-300 mt-1">'새 그룹 만들기'를 클릭하여 시작하세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {groups.map(g => (
                <div key={g.id} 
                  className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all cursor-pointer group"
                  onClick={() => { setSelectedGroup(g); setPage('analysis'); }}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <span className="text-2xl text-white">📁</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{g.name}</h3>
                        <p className="text-sm text-gray-500">{g.desc || '설명 없음'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{g.members.length}명</span>
                          <span className="text-xs text-gray-400">{g.createdAt} 생성</span>
                        </div>
                      </div>
                    </div>
                    <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                      className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition opacity-0 group-hover:opacity-100">
                      삭제
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // 그룹 생성 페이지
  if (page === 'create') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setPage('list')} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2 font-medium">
            ← 목록으로 돌아가기
          </button>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">새 그룹 만들기</h2>
            <p className="text-gray-500 mb-8">CSV 파일을 업로드하여 그룹을 생성하세요.</p>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">그룹명 *</label>
                <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="예: ACC전문코치반 2501기" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">설명 (선택)</label>
                <input type="text" value={newGroup.desc} onChange={(e) => setNewGroup({...newGroup, desc: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder="예: 전문코치 양성과정 1기" />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">CSV 파일 업로드 *</label>
                <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-blue-400 transition cursor-pointer">
                  <input type="file" accept=".csv" onChange={handleFileUpload}
                    className="w-full opacity-0 absolute" style={{ height: '100px', marginTop: '-20px' }} />
                  <div className="text-4xl mb-2">📄</div>
                  <p className="text-gray-600 font-medium">클릭하여 CSV 파일 선택</p>
                  <p className="text-xs text-gray-400 mt-1">또는 파일을 여기에 드래그하세요</p>
                </div>
                <p className="text-xs text-gray-400 mt-2">필수 컬럼: name, NS, HA, RD, PS, SD, CO, ST 및 하위지표</p>
              </div>

              {uploadedData && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600 text-lg">✓</span>
                    <span className="text-green-700 font-semibold">{uploadedData.length}명 데이터 로드 완료</span>
                  </div>
                  <p className="text-green-600 text-sm">
                    {uploadedData.slice(0, 5).map(d => d.name || d['이름']).join(', ')}
                    {uploadedData.length > 5 && ` 외 ${uploadedData.length - 5}명`}
                  </p>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setPage('list')}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                  취소
                </button>
                <button onClick={handleCreateGroup}
                  disabled={!newGroup.name || !uploadedData}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-blue-500/25 disabled:shadow-none">
                  그룹 생성
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (page === 'analysis' && selectedGroup) {
    return <AnalysisPage group={selectedGroup} onBack={() => setPage('list')} />;
  }

  return null;
}

// ========================================
// 분석 페이지 컴포넌트
// ========================================
function AnalysisPage({ group, onBack }) {
  // ★ 복수 선택을 위해 Set으로 변경
  const [selectedPersons, setSelectedPersons] = useState(new Set());
  const [mainTab, setMainTab] = useState('temperament');
  const [subTab, setSubTab] = useState('all');
  const [viewMode, setViewMode] = useState('group');
  const [compareScales, setCompareScales] = useState(['NS', 'HA']); // 산점도 비교 지표 (2개 선택)
  const reportRef = useRef(null);

  const rawData = group.members;
  const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
  const characterScales = ['SD', 'CO', 'ST'];
  const currentScales = mainTab === 'temperament' ? temperamentScales : characterScales;
  const mainColor = mainTab === 'temperament' ? temperamentColor : characterColor;

  const getName = (p) => p.name || p['이름'] || '이름없음';
  const getGender = (p) => p.gender || p['성별'] || '';
  const getAge = (p) => p.age || p['연령'] || '';

  // ★ 토글 선택 함수
  const togglePerson = (name) => {
    setSelectedPersons(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  // ★ 전체 해제
  const clearSelection = () => {
    setSelectedPersons(new Set());
  };

  // ★ 선택 여부 확인 (아무도 선택 안 됐으면 전체 표시)
  const isSelected = (name) => {
    if (selectedPersons.size === 0) return true;
    return selectedPersons.has(name);
  };

  // ★ 비교지표 토글 (2개만 선택 가능)
  const toggleCompareScale = (scale) => {
    setCompareScales(prev => {
      if (prev.includes(scale)) {
        // 이미 선택된 경우 제거 (최소 1개는 유지)
        if (prev.length > 1) {
          return prev.filter(s => s !== scale);
        }
        return prev;
      } else {
        // 새로 선택 - 2개 초과 시 첫번째 것 제거
        if (prev.length >= 2) {
          return [...prev.slice(1), scale];
        }
        return [...prev, scale];
      }
    });
  };

  // 거미줄 차트 데이터
  const radarData = currentScales.map(s => ({
    scale: `${scaleLabels[s]}(${s})`,
    fullMark: 100,
    ...Object.fromEntries(rawData.map(p => [getName(p), p[s]]))
  }));

  // PDF 다운로드 (개인 리포트용 - 단일 선택 시만)
  const [pdfLoading, setPdfLoading] = useState(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current || selectedPersons.size !== 1) return;

    const selectedName = Array.from(selectedPersons)[0];
    setPdfLoading(true);

    try {
      // html2pdf 동적 로드
      const html2pdf = (await import('html2pdf.js')).default;

      const element = reportRef.current;
      const opt = {
        margin: [10, 10, 10, 10],
        filename: `TCI_${selectedName}_리포트.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          logging: false
        },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
      };

      await html2pdf().set(opt).from(element).save();
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
  };

  // 거미줄 차트 + 산점도 차트
  const renderRadarChart = () => {
    // 선택된 2개 지표로 산점도 데이터 생성
    const [scaleX, scaleY] = compareScales.length >= 2 ? compareScales : ['NS', 'HA'];
    const scatterData = rawData.map((p, i) => ({
      name: getName(p),
      x: p[scaleX] - 50, // 50을 기준으로 -50 ~ +50 범위로 변환
      y: p[scaleY] - 50,
      rawX: p[scaleX],
      rawY: p[scaleY],
      colorIdx: i,
      selected: isSelected(getName(p))
    }));

    return (
      <div className="flex gap-4 pr-2 h-full">
        {/* 좌측: 거미줄 차트 */}
        <div className="w-1/2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col">
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <h3 className="text-base font-bold text-gray-800">
              {mainTab === 'temperament' ? '기질' : '성격'} 프로파일
            </h3>
            {selectedPersons.size > 0 && (
              <span className="text-sm text-blue-600 font-medium">
                {selectedPersons.size}명 선택됨
              </span>
            )}
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData} outerRadius="85%" margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                <PolarGrid stroke="#e5e7eb" />
                <PolarAngleAxis dataKey="scale" tick={{ fontSize: 13, fill: '#374151', fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} tickCount={6} />
                {rawData.map((p, i) => (
                  <Radar key={getName(p)} name={getName(p)} dataKey={getName(p)}
                    stroke={memberColors[i % memberColors.length]}
                    fill={memberColors[i % memberColors.length]}
                    fillOpacity={isSelected(getName(p)) ? 0.15 : 0.02}
                    strokeWidth={isSelected(getName(p)) ? 2.5 : 0.5}
                    strokeOpacity={isSelected(getName(p)) ? 1 : 0.1}
                  />
                ))}
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 우측: 산점도 차트 */}
        <div className="w-1/2 bg-white rounded-2xl p-3 shadow-sm border border-gray-100 flex flex-col">
          {/* 비교지표 선택 버튼 */}
          <div className="flex items-center justify-between mb-2 flex-shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500 font-medium">비교지표</span>
              <div className="flex gap-1">
                {temperamentScales.map(scale => (
                  <button
                    key={scale}
                    onClick={() => toggleCompareScale(scale)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      compareScales.includes(scale)
                        ? 'bg-blue-600 text-white shadow-md'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {scale}
                  </button>
                ))}
              </div>
            </div>
            <span className="text-xs text-gray-400">
              {compareScales.length < 2 ? '2개 선택 필요' : `${scaleX} × ${scaleY}`}
            </span>
          </div>

          {/* 산점도 타이틀 */}
          <div className="flex items-center justify-between mb-1 flex-shrink-0">
            <h3 className="text-base font-bold text-gray-800">
              {scaleX} × {scaleY} 분포
            </h3>
            <span className="text-xs text-gray-500">{scaleLabels[scaleX]} × {scaleLabels[scaleY]}</span>
          </div>

          {compareScales.length >= 2 ? (
            <div className="flex-1 min-h-0">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 30, right: 30, bottom: 30, left: 30 }}>
                  {/* 격자선 */}
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  {/* X축 (숨김 - 데이터 매핑용) */}
                  <XAxis
                    type="number"
                    dataKey="x"
                    domain={[-50, 50]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  {/* Y축 (숨김 - 데이터 매핑용) */}
                  <YAxis
                    type="number"
                    dataKey="y"
                    domain={[-50, 50]}
                    axisLine={false}
                    tickLine={false}
                    tick={false}
                  />
                  {/* 십자가 중심축 - X축 (가로선) */}
                  <ReferenceLine
                    y={0}
                    stroke="#6B7280"
                    strokeWidth={1.5}
                    label={{ value: `${scaleX} (${scaleLabels[scaleX]})`, position: 'right', fontSize: 11, fill: '#374151' }}
                  />
                  {/* 십자가 중심축 - Y축 (세로선) */}
                  <ReferenceLine
                    x={0}
                    stroke="#6B7280"
                    strokeWidth={1.5}
                    label={{ value: `${scaleY} (${scaleLabels[scaleY]})`, position: 'top', fontSize: 11, fill: '#374151' }}
                  />
                  {/* X축 눈금 표시 */}
                  <ReferenceLine x={-50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '0', position: 'bottom', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine x={-25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '25', position: 'bottom', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine x={0} stroke="#6B7280" label={{ value: '50', position: 'bottom', fontSize: 10, fill: '#374151', fontWeight: 600 }} />
                  <ReferenceLine x={25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '75', position: 'bottom', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine x={50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '100', position: 'bottom', fontSize: 10, fill: '#6B7280' }} />
                  {/* Y축 눈금 표시 */}
                  <ReferenceLine y={-50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '0', position: 'left', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine y={-25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '25', position: 'left', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine y={0} stroke="#6B7280" label={{ value: '50', position: 'left', fontSize: 10, fill: '#374151', fontWeight: 600 }} />
                  <ReferenceLine y={25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '75', position: 'left', fontSize: 10, fill: '#6B7280' }} />
                  <ReferenceLine y={50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '100', position: 'left', fontSize: 10, fill: '#6B7280' }} />
                  <ZAxis range={[100, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                    formatter={(value, name, props) => {
                      if (name === 'x') return [`${props.payload.rawX}%`, scaleLabels[scaleX]];
                      if (name === 'y') return [`${props.payload.rawY}%`, scaleLabels[scaleY]];
                      return [value, name];
                    }}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.name || ''}
                  />
                  <Scatter
                    name="참가자"
                    data={scatterData}
                    shape={(props) => {
                      const { cx, cy, payload } = props;
                      const color = memberColors[payload.colorIdx % memberColors.length];
                      const opacity = payload.selected ? 1 : 0.2;
                      return (
                        <g>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={payload.selected ? 10 : 6}
                            fill={color}
                            fillOpacity={opacity}
                            stroke={color}
                            strokeWidth={payload.selected ? 2 : 1}
                            strokeOpacity={opacity}
                          />
                          {payload.selected && (
                            <text
                              x={cx}
                              y={cy - 14}
                              textAnchor="middle"
                              fontSize={10}
                              fill="#374151"
                              fontWeight="600"
                            >
                              {payload.name}
                            </text>
                          )}
                        </g>
                      );
                    }}
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50 rounded-xl">
              <p className="text-gray-400 text-sm">비교지표를 2개 선택하세요</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 개별 지표 상세
  const renderScaleDetail = (scale) => {
    const subCodes = subScaleGroups[scale];
    const mainData = rawData.map(p => ({ name: getName(p), value: p[scale] }));

    return (
      <div className="flex gap-4 h-full">
        {/* 좌측: 상위지표 세로 막대 */}
        <div className="w-[45%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-4 py-3 border-b flex-shrink-0">
            <h3 className="text-lg font-bold text-gray-800">{scaleLabels[scale]}</h3>
            <p className="text-xs text-gray-500">{engLabels[scale]}</p>
          </div>
          <div className="flex-1 min-h-0 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mainData} margin={{ top: 10, right: 5, left: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fontWeight: 500 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip formatter={(v) => [`${v}%`, '백분위']} contentStyle={{ borderRadius: 8 }} />
                <ReferenceLine y={30} stroke="#93C5FD" strokeDasharray="4 4" strokeWidth={2} />
                <ReferenceLine y={70} stroke="#93C5FD" strokeDasharray="4 4" strokeWidth={2} />
                <Bar dataKey="value" fill={mainColor} shape={<Custom3DBar />}>
                  {mainData.map((entry, i) => (
                    <Cell key={i}
                      fill={isSelected(entry.name) ? memberColors[i % memberColors.length] : '#D1D5DB'}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* 강점/약점 테이블 - 새로운 레이아웃 */}
          {mainScaleTraits[scale] && (
            <div className="px-3 pb-3 flex-shrink-0">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr>
                    <th className="p-1.5 text-gray-500 font-medium text-left w-16"></th>
                    <th className="p-1.5 text-green-600 font-bold text-left">✓ bright side</th>
                    <th className="p-1.5 text-orange-500 font-bold text-left">✗ dark side</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-blue-50">
                    <td className="p-1.5 font-bold text-blue-600">높을 때</td>
                    <td className="p-1.5 text-gray-700">{mainScaleTraits[scale].highAdv.join(', ')}</td>
                    <td className="p-1.5 text-gray-700">{mainScaleTraits[scale].highDis.join(', ')}</td>
                  </tr>
                  <tr className="bg-orange-50">
                    <td className="p-1.5 font-bold text-orange-600">낮을 때</td>
                    <td className="p-1.5 text-gray-700">{mainScaleTraits[scale].lowAdv.join(', ')}</td>
                    <td className="p-1.5 text-gray-700">{mainScaleTraits[scale].lowDis.join(', ')}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* 우측: 하위지표 가로 막대 */}
        <div className="w-[55%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-4 border-b flex-shrink-0">
            <h3 className="font-bold text-gray-800">{scale} 하위지표</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="space-y-5">
              {subCodes.map(code => {
                const norm = norms[code];
                const labelParts = subScaleLabels[code].split(' ↔ ');
                const lowLabel = labelParts[0] || subScaleLabels[code];
                const highLabel = labelParts[1] || '';
                return (
                  <div key={code} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-sm text-gray-700 font-semibold">{lowLabel}</span>
                      <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm">{code}</span>
                      <span className="text-sm text-gray-700 font-semibold">{highLabel}</span>
                    </div>
                    <div className="space-y-2">
                      {rawData.map((p, idx) => {
                        const val = p[code] || 0;
                        const width = (val / 20) * 100;
                        const selected = isSelected(getName(p));
                        return (
                          <div key={getName(p)} className="flex items-center gap-3">
                            <span className={`w-16 text-xs font-medium truncate transition ${selected ? 'text-gray-700' : 'text-gray-300'}`}>
                              {getName(p)}
                            </span>
                            <div className="flex-1 h-5 bg-gray-200 rounded-full relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                                style={{ left: `${(norm.m / 20) * 100}%` }}></div>
                              <div className={`h-full rounded-full transition-all duration-300 ${selected ? '' : 'opacity-20'}`}
                                style={{ width: `${Math.min(width, 100)}%`, backgroundColor: memberColors[idx % memberColors.length] }}>
                              </div>
                            </div>
                            <span className={`w-6 text-xs text-right font-bold transition ${selected ? 'text-gray-700' : 'text-gray-300'}`}>
                              {val}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">평균 M={norm.m}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 개인 리포트 (단일 선택 시만 표시)
  const renderIndividualReport = () => {
    if (selectedPersons.size === 0) {
      return (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="text-6xl mb-4">👤</div>
          <p className="text-gray-400 text-lg">좌측 참가자 목록에서 이름을 선택하세요</p>
          <p className="text-gray-300 mt-1">복수 선택 시 비교 보기가 가능합니다</p>
        </div>
      );
    }

    if (selectedPersons.size > 1) {
      return (
        <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-xl font-bold text-gray-800 mb-6">선택된 참가자 비교 ({selectedPersons.size}명)</h3>
          <div className="grid grid-cols-2 gap-4">
            {Array.from(selectedPersons).map(name => {
              const person = rawData.find(p => getName(p) === name);
              const colorIdx = rawData.findIndex(p => getName(p) === name);
              if (!person) return null;
              return (
                <div key={name} className="border rounded-xl p-4" style={{ borderColor: memberColors[colorIdx % memberColors.length] }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: memberColors[colorIdx % memberColors.length] }}>
                      {name.charAt(0)}
                    </div>
                    <div>
                      <div className="font-bold text-gray-800">{name}</div>
                      <div className="text-xs text-gray-500">{getGender(person) === 'F' ? '여' : '남'} / {getAge(person)}세</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-2 text-center">
                    {[...temperamentScales, ...characterScales].map(s => (
                      <div key={s} className="bg-gray-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500">{s}</div>
                        <div className="font-bold text-gray-800">{person[s]}%</div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    }

    // 단일 선택 - 상세 리포트
    const selectedName = Array.from(selectedPersons)[0];
    const person = rawData.find(p => getName(p) === selectedName);
    const colorIdx = rawData.findIndex(p => getName(p) === selectedName);
    if (!person) return null;

    const allScales = [...temperamentScales, ...characterScales];
    const getLevel = (value) => value >= 70 ? 'H' : value <= 30 ? 'L' : 'M';
    const getLevelColor = (level) => level === 'H' ? 'bg-blue-500' : level === 'L' ? 'bg-orange-400' : 'bg-gray-400';

    return (
      <div ref={reportRef} className="space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 220px)' }}>
        {/* 헤더 */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-700 text-white rounded-2xl p-8 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold backdrop-blur">
                {getName(person).charAt(0)}
              </div>
              <div>
                <h2 className="text-3xl font-bold">{getName(person)}</h2>
                <p className="text-blue-200 mt-1">{getGender(person) === 'F' ? '여성' : '남성'} / {getAge(person)}세</p>
                <p className="text-blue-300 text-sm mt-2">TCI 기질 및 성격검사 결과 리포트</p>
              </div>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={pdfLoading}
              className={`px-6 py-3 bg-white/20 rounded-xl hover:bg-white/30 transition text-sm font-medium backdrop-blur flex items-center gap-2 ${pdfLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {pdfLoading ? (
                <>
                  <span className="animate-spin">⏳</span> PDF 생성 중...
                </>
              ) : (
                <>📄 PDF 다운로드</>
              )}
            </button>
          </div>
        </div>

        {/* 상위지표 요약 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-5 text-lg">상위지표 요약</h3>
          <div className="grid grid-cols-7 gap-3">
            {allScales.map(s => {
              const val = person[s];
              const level = getLevel(val);
              const isTemp = temperamentScales.includes(s);
              return (
                <div key={s} className={`text-center p-4 rounded-xl ${isTemp ? 'bg-blue-50' : 'bg-green-50'}`}>
                  <div className="text-xs text-gray-500 font-medium">{scaleLabels[s]}</div>
                  <div className="text-2xl font-bold mt-2" style={{ color: isTemp ? temperamentColor : characterColor }}>
                    {val}%
                  </div>
                  <div className={`inline-block mt-2 px-2 py-0.5 rounded text-white text-xs font-medium ${getLevelColor(level)}`}>
                    {level}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 성숙도 경고 (SD/CO < 30일 때만 표시) */}
        {(() => {
          const maturityCheck = checkPersonalityDisorderTendency(person.SD, person.CO);
          if (!maturityCheck.warning) return null;

          const isHigh = maturityCheck.severity === 'high';
          return (
            <div className={`rounded-2xl p-6 shadow-sm border-2 ${isHigh ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isHigh ? 'bg-red-100' : 'bg-amber-100'}`}>
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className={`font-bold text-lg mb-2 ${isHigh ? 'text-red-700' : 'text-amber-700'}`}>
                    성격 성숙도 주의
                  </h3>
                  <p className={`text-sm ${isHigh ? 'text-red-600' : 'text-amber-600'}`}>
                    {maturityCheck.message}
                  </p>
                  {isHigh && (
                    <p className="text-sm text-red-500 mt-2">
                      전문적인 상담이 권장됩니다.
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* 기질 유형 분석 */}
        {(() => {
          const nsLevel = getTScoreLevel(person.NS);
          const haLevel = getTScoreLevel(person.HA);
          const rdLevel = getTScoreLevel(person.RD);
          const tempTypeCode = `${nsLevel}${haLevel}${rdLevel}`;
          const tempType = TEMPERAMENT_TYPES[tempTypeCode];

          if (!tempType) return null;

          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🧬</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">기질 유형 분석</h3>
                  <p className="text-sm text-gray-500">NS × HA × RD 조합</p>
                </div>
                <div className="ml-auto">
                  <span className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl font-bold text-lg">
                    {tempTypeCode}
                  </span>
                </div>
              </div>

              <div className="bg-blue-50 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <span className="font-bold text-blue-800 text-lg">{tempType.name}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{tempType.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold text-green-700">강점</span>
                  </div>
                  <p className="text-sm text-gray-600">{tempType.strengths}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600">!</span>
                    <span className="font-semibold text-orange-700">주의점</span>
                  </div>
                  <p className="text-sm text-gray-600">{tempType.weaknesses}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 성격 유형 분석 */}
        {(() => {
          const sdLevel = getTScoreLevel(person.SD);
          const coLevel = getTScoreLevel(person.CO);
          const stLevel = getTScoreLevel(person.ST);
          const charTypeCode = `${sdLevel}${coLevel}${stLevel}`;
          const charType = CHARACTER_TYPES[charTypeCode];

          if (!charType) return null;

          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🎭</span>
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 text-lg">성격 유형 분석</h3>
                  <p className="text-sm text-gray-500">SD × CO × ST 조합</p>
                </div>
                <div className="ml-auto">
                  <span className="px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-bold text-lg">
                    {charTypeCode}
                  </span>
                </div>
              </div>

              <div className="bg-emerald-50 rounded-xl p-5 mb-4">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">💡</span>
                  <span className="font-bold text-emerald-800 text-lg">{charType.name}</span>
                </div>
                <p className="text-gray-700 text-sm leading-relaxed">{charType.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-green-600">✓</span>
                    <span className="font-semibold text-green-700">강점</span>
                  </div>
                  <p className="text-sm text-gray-600">{charType.strengths}</p>
                </div>
                <div className="bg-orange-50 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-orange-600">!</span>
                    <span className="font-semibold text-orange-700">주의점</span>
                  </div>
                  <p className="text-sm text-gray-600">{charType.weaknesses}</p>
                </div>
              </div>
            </div>
          );
        })()}

        {/* 기질 상호작용 분석 */}
        {(() => {
          const nsLevel = getTScoreLevel(person.NS);
          const haLevel = getTScoreLevel(person.HA);
          const rdLevel = getTScoreLevel(person.RD);

          const interactions = [
            { key: 'NS_HA', code: `${nsLevel}${haLevel}`, label: 'NS × HA', desc: '탐색성과 신중성의 상호작용' },
            { key: 'NS_RD', code: `${nsLevel}${rdLevel}`, label: 'NS × RD', desc: '탐색성과 관계민감성의 상호작용' },
            { key: 'HA_RD', code: `${haLevel}${rdLevel}`, label: 'HA × RD', desc: '신중성과 관계민감성의 상호작용' }
          ];

          return (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">🔗</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">기질 상호작용 분석</h3>
              </div>

              <div className="space-y-4">
                {interactions.map(({ key, code, label, desc }) => {
                  const interactionData = TEMPERAMENT_INTERACTIONS[key]?.[code];
                  if (!interactionData) return null;

                  return (
                    <div key={key} className="bg-purple-50 rounded-xl p-4">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 bg-purple-200 text-purple-700 rounded-lg font-bold text-sm">
                          {label}: {code}
                        </span>
                        <span className="text-sm text-gray-500">{desc}</span>
                      </div>
                      <p className="text-sm text-gray-700">{interactionData.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}

        {/* 하위지표 5열 테이블 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <h3 className="font-bold text-gray-800 mb-5 text-lg">하위지표 상세 분석</h3>

          {Object.entries(subScaleGroups).map(([group, codes]) => {
            const isTemp = temperamentScales.includes(group);
            return (
              <div key={group} className="mb-8">
                <div className={`flex items-center gap-2 mb-4 pb-2 border-b-2 ${isTemp ? 'border-blue-200' : 'border-green-200'}`}>
                  <span className={`w-3 h-3 rounded-full ${isTemp ? 'bg-blue-500' : 'bg-green-500'}`}></span>
                  <span className={`font-bold ${isTemp ? 'text-blue-600' : 'text-green-600'}`}>{group}</span>
                  <span className="text-gray-600">{scaleLabels[group]}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50">
                        <th className="p-3 text-left text-orange-500 font-semibold w-[18%] rounded-tl-lg">불리한 점 (↓)</th>
                        <th className="p-3 text-left text-blue-500 font-semibold w-[18%]">유리한 점 (↓)</th>
                        <th className="p-3 text-center font-semibold w-[28%]">척도</th>
                        <th className="p-3 text-left text-blue-500 font-semibold w-[18%]">유리한 점 (↑)</th>
                        <th className="p-3 text-left text-orange-500 font-semibold w-[18%] rounded-tr-lg">불리한 점 (↑)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {codes.map(code => {
                        const val = person[code] || 0;
                        const norm = norms[code];
                        const pct = Math.round(((val - norm.m) / norm.sd + 3) / 6 * 100);
                        const level = pct >= 70 ? 'H' : pct <= 30 ? 'L' : 'M';
                        const traits = scaleTraits[code] || { lowAdv: [], lowDis: [], highAdv: [], highDis: [] };
                        
                        return (
                          <tr key={code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className="p-3 text-gray-400 align-top text-xs">
                              {traits.lowDis.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className="p-3 text-gray-600 align-top text-xs">
                              {traits.lowAdv.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className="p-3 text-center">
                              <div className="font-bold text-gray-700">{code}</div>
                              <div className="text-xs text-gray-500 mt-1">{subScaleLabels[code]}</div>
                              <div className="mt-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold ${getLevelColor(level)}`}>
                                  {val} ({level})
                                </span>
                              </div>
                            </td>
                            <td className="p-3 text-gray-600 align-top text-xs">
                              {traits.highAdv.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className="p-3 text-gray-400 align-top text-xs">
                              {traits.highDis.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>

        {/* 코칭 가이드 */}
        {(() => {
          const nsLevel = getTScoreLevel(person.NS);
          const haLevel = getTScoreLevel(person.HA);
          const rdLevel = getTScoreLevel(person.RD);
          const sdLevel = getTScoreLevel(person.SD);
          const coLevel = getTScoreLevel(person.CO);
          const stLevel = getTScoreLevel(person.ST);

          const tempTypeCode = `${nsLevel}${haLevel}${rdLevel}`;
          const charTypeCode = `${sdLevel}${coLevel}${stLevel}`;
          const tempType = TEMPERAMENT_TYPES[tempTypeCode];
          const charType = CHARACTER_TYPES[charTypeCode];

          const tips = [];
          if (tempType?.coachingTips) tips.push({ type: '기질', tip: tempType.coachingTips });
          if (charType?.coachingTips) tips.push({ type: '성격', tip: charType.coachingTips });

          if (tips.length === 0) return null;

          return (
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                  <span className="text-white text-lg">📋</span>
                </div>
                <h3 className="font-bold text-gray-800 text-lg">종합 코칭 가이드</h3>
              </div>

              <div className="space-y-4">
                {tips.map(({ type, tip }, idx) => (
                  <div key={idx} className="bg-white rounded-xl p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        type === '기질' ? 'bg-blue-100 text-blue-700' : 'bg-emerald-100 text-emerald-700'
                      }`}>
                        {type} 코칭
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 p-4 bg-white/50 rounded-xl">
                <p className="text-xs text-gray-500 leading-relaxed">
                  💡 <strong>코칭 팁:</strong> 위 가이드를 참고하여 개인의 강점을 살리고
                  약점을 보완하는 방향으로 코칭을 진행하세요. 각 유형의 특성을 이해하고
                  수용하는 것이 효과적인 코칭의 첫걸음입니다.
                </p>
              </div>
            </div>
          );
        })()}

        {/* 푸터 */}
        <div className="text-center text-sm text-gray-400 py-6">
          TCI 그룹 분석 서비스 · 생성일: {new Date().toLocaleDateString('ko-KR')}
        </div>
      </div>
    );
  };

  // 탭 목록
  const getSubTabs = () => {
    const scales = mainTab === 'temperament' ? temperamentScales : characterScales;
    return [
      { key: 'all', label: '전체' },
      ...scales.map(s => ({ key: s, label: `${scaleLabels[s]}(${s})` }))
    ];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      {/* 헤더 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-4 p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1 text-sm">
            ← 목록
          </button>
          <div className="w-px h-5 bg-gray-200"></div>
          <h1 className="text-lg font-bold text-gray-800">{group.name}</h1>
          {viewMode === 'group' && (
            <>
              <div className="w-px h-5 bg-gray-200"></div>
              <div className="flex gap-1">
                <button onClick={() => { setMainTab('temperament'); setSubTab('all'); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mainTab === 'temperament' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  기질
                </button>
                <button onClick={() => { setMainTab('character'); setSubTab('all'); }}
                  className={`px-4 py-1.5 rounded-lg text-sm font-bold transition ${mainTab === 'character' ? 'bg-green-600 text-white shadow-md shadow-green-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                  성격
                </button>
              </div>
            </>
          )}
          <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{rawData.length}명</span>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setViewMode('group')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === 'group' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            그룹 차트
          </button>
          <button onClick={() => setViewMode('individual')}
            className={`px-4 py-1.5 rounded-lg text-sm font-medium transition ${viewMode === 'individual' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
            개인 리포트
          </button>
        </div>
      </div>

      <div className="flex gap-4 h-[calc(100vh-140px)]">
        {/* 참가자 목록 */}
        <div className="w-44 bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex-shrink-0 overflow-y-auto">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xs font-bold text-gray-500 uppercase">참가자</h3>
            {selectedPersons.size > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{selectedPersons.size}</span>
            )}
          </div>
          <div className="space-y-1">
            {rawData.map((p, i) => {
              const name = getName(p);
              const selected = selectedPersons.has(name);
              return (
                <button key={i} onClick={() => togglePerson(name)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl text-sm transition flex items-center gap-2 ${
                    selected ? 'bg-blue-50 text-blue-700 font-medium ring-2 ring-blue-200' : 'hover:bg-gray-50 text-gray-600'}`}>
                  <span className="w-3 h-3 rounded-full flex-shrink-0 ring-2 ring-white shadow" 
                    style={{ backgroundColor: memberColors[i % memberColors.length] }}></span>
                  <span className="truncate">{name}</span>
                  {selected && <span className="ml-auto text-blue-500">✓</span>}
                </button>
              );
            })}
          </div>
          {selectedPersons.size > 0 && (
            <button onClick={clearSelection}
              className="w-full mt-4 px-3 py-2 text-xs text-gray-500 border border-gray-200 rounded-xl hover:bg-gray-50 transition font-medium">
              선택 해제 ({selectedPersons.size})
            </button>
          )}
        </div>

        {/* 메인 콘텐츠 */}
        <div className="flex-1 flex flex-col min-h-0">
          {viewMode === 'group' ? (
            <>
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-3 inline-flex gap-1 flex-shrink-0">
                {getSubTabs().map(tab => (
                  <button key={tab.key} onClick={() => setSubTab(tab.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      subTab === tab.key
                        ? (mainTab === 'temperament' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')
                        : 'text-gray-500 hover:bg-gray-100'}`}>
                    {tab.label}
                  </button>
                ))}
              </div>
              <div className="flex-1 min-h-0">{subTab === 'all' ? renderRadarChart() : renderScaleDetail(subTab)}</div>
            </>
          ) : (
            renderIndividualReport()
          )}
        </div>
      </div>
    </div>
  );
}
