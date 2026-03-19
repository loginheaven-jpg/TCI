import React, { useState, useRef, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ReferenceLine, Cell, ScatterChart, Scatter, ZAxis } from 'recharts';
import Papa from 'papaparse';
import { supabase } from './supabaseClient';
import { pdf } from '@react-pdf/renderer';
import PDFReport from './components/PDFReport';
import SettingsPage from './components/SettingsPage';
import CoupleAnalysisPage from './components/CoupleAnalysisPage';
import LoginPage from './components/LoginPage';
import ClientView from './components/ClientView';
import UserManagementPage from './components/UserManagementPage';
import { RELATIONSHIP_TYPES } from './data/coupleInterpretations';
import {
  TEMPERAMENT_TYPES,
  CHARACTER_TYPES,
  TEMPERAMENT_INTERACTIONS,
  getTScoreLevel,
  checkCharacterGrowthNeeds
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
// 이름 익명화 함수 (한글 초성 → 영문)
// ========================================
const CHOSUNG_LIST = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'];
const JUNGSUNG_LIST = ['ㅏ','ㅐ','ㅑ','ㅒ','ㅓ','ㅔ','ㅕ','ㅖ','ㅗ','ㅘ','ㅙ','ㅚ','ㅛ','ㅜ','ㅝ','ㅞ','ㅟ','ㅠ','ㅡ','ㅢ','ㅣ'];

const CHOSUNG_MAP = {
  'ㄱ': 'G', 'ㄲ': 'K', 'ㄴ': 'N', 'ㄷ': 'D', 'ㄸ': 'T',
  'ㄹ': 'R', 'ㅁ': 'M', 'ㅂ': 'B', 'ㅃ': 'P', 'ㅅ': 'S',
  'ㅆ': 'S', 'ㅇ': '', 'ㅈ': 'J', 'ㅉ': 'J', 'ㅊ': 'C',
  'ㅋ': 'K', 'ㅌ': 'T', 'ㅍ': 'P', 'ㅎ': 'H'
};

// ㅇ(이응)인 경우 중성(모음)의 영문 표기 첫 글자 사용
const JUNGSUNG_MAP = {
  'ㅏ': 'A', 'ㅐ': 'AE', 'ㅑ': 'Y', 'ㅒ': 'Y', 'ㅓ': 'E',
  'ㅔ': 'E', 'ㅕ': 'Y', 'ㅖ': 'Y', 'ㅗ': 'O', 'ㅘ': 'W',
  'ㅙ': 'W', 'ㅚ': 'O', 'ㅛ': 'Y', 'ㅜ': 'U', 'ㅝ': 'W',
  'ㅞ': 'W', 'ㅟ': 'W', 'ㅠ': 'Y', 'ㅡ': 'E', 'ㅢ': 'E', 'ㅣ': 'I'
};

// 한글 음절에서 영문 이니셜 추출
const getInitial = (char) => {
  const code = char.charCodeAt(0) - 0xAC00;
  if (code < 0 || code > 11171) return char; // 한글 아님

  const chosungIdx = Math.floor(code / 588);
  const jungsungIdx = Math.floor((code % 588) / 28);
  const chosung = CHOSUNG_LIST[chosungIdx];
  const jungsung = JUNGSUNG_LIST[jungsungIdx];

  // ㅇ(이응)이면 중성의 영문 표기 첫 글자 사용
  if (chosung === 'ㅇ') {
    const vowelInitial = JUNGSUNG_MAP[jungsung] || 'O';
    return vowelInitial.charAt(0); // 첫 글자만
  }
  return CHOSUNG_MAP[chosung] || char;
};

// 이름 익명화: 성 + 이름 이니셜
const anonymizeName = (name) => {
  if (!name || name.length < 2) return name;
  const surname = name.charAt(0);
  const givenName = name.slice(1);
  const initials = [...givenName].map(getInitial).join('');
  return surname + initials;
};

// ========================================
// 용어 정의 (최종 확정)
// ========================================
const scaleLabels = {
  NS: '탐색성', HA: '불확실성 센서', RD: '관계 민감성', PS: '실행 일관성',
  SD: '자율성', CO: '협력성', ST: '자기초월'
};

const engLabels = {
  NS: 'Novelty Seeking', HA: 'Harm Avoidance', RD: 'Reward Dependence', PS: 'Persistence',
  SD: 'Self-Directedness', CO: 'Cooperativeness', ST: 'Self-Transcendence'
};

const subScaleLabels = {
  // 기질 하위척도 (TCI-coaching-guide 기준)
  NS1: '신박성', NS2: '실행성', NS3: '소비성', NS4: '비정형성',
  HA1: '미래 불확실성', HA2: '상황 불확실성', HA3: '대인 불확실성', HA4: '에너지 불확실성',
  RD1: '정서적 공감', RD2: '정서적 개방', RD3: '애착관계', RD4: '정서적 지지',
  PS1: '시작지향성', PS2: '유지지향성', PS3: '목표지향성', PS4: '완벽지향성',
  // 성격 하위척도
  SD1: '책임감', SD2: '목적의식', SD3: '유능감', SD4: '자기수용', SD5: '일치된 천성',
  CO1: '타인수용', CO2: '공감', CO3: '이타성', CO4: '관대함', CO5: '공평',
  ST1: '창조적 자기망각', ST2: '일체감', ST3: '영성 수용'
};

// 5열 구조 장단점 데이터 (TCI-coaching-guide 기준으로 확장)
const scaleTraits = {
  // ========== NS (탐색성) 하위척도 ==========
  NS1: {
    name: '신박성',
    lowLabel: '현재의 가치',
    highLabel: '새로운 것의 가치',
    description: '미지의 세계를 탐구하려는 긍정적 동기와 에너지',
    coreDescription: '이미 가진 것을 지키는 힘과 미지의 세계를 탐구하려는 동기 사이의 균형',
    lowAdv: ['차분하고 안정적', '기존 가치 인식'],
    lowDis: ['익숙함에 안주'],
    highAdv: ['탐색적, 혁신적', '변화에 잘 적응'],
    highDis: ['싫증 잘 내는', '흥분추구']
  },
  NS2: {
    name: '실행성',
    lowLabel: '숙고',
    highLabel: '시도',
    description: '긴 생각보다 빠른 행동을 통해 배우는 직관적 접근',
    coreDescription: '충분히 생각한 뒤 움직이는 스타일 vs 행동하면서 배우는 스타일',
    lowAdv: ['숙고하고 집중', '안정적 감정관리'],
    lowDis: ['지나친 숙고로 실기'],
    highAdv: ['과감한 결단', '기분파'],
    highDis: ['감정변화가 극적', '성급한 결정']
  },
  NS3: {
    name: '소비성',
    lowLabel: '절제',
    highLabel: '향유',
    description: '에너지와 자원을 아낌없이 투자하고 향유하는 태도',
    coreDescription: '자원과 에너지를 계획적으로 절약 vs 아낌없이 투자하고 즐기는 태도',
    lowAdv: ['검소하고 절약', '리소스 관리 우수'],
    lowDis: ['인색한'],
    highAdv: ['리소스 향유', '풍성한 삶'],
    highDis: ['리소스 관리 난조', '소진 가능성']
  },
  NS4: {
    name: '비정형성',
    lowLabel: '체계적',
    highLabel: '유연성',
    description: '규칙에 얽매이지 않고 상황에 유연하게 대처하는 자유로움',
    coreDescription: '정해진 규칙과 절차를 선호 vs 상황에 따라 유연하게 형식을 깨는 자유로움',
    lowAdv: ['질서정연', '준법', '조직 만족'],
    lowDis: ['답답하고 경직된', '융통성 없는'],
    highAdv: ['자유분방', '주변을 즐겁게'],
    highDis: ['분노 폭발', '법규칙 무시']
  },
  // ========== HA (불확실성 센서) 하위척도 ==========
  HA1: {
    name: '미래 불확실성',
    lowLabel: '낙관적',
    highLabel: '대비하는',
    description: '발생 가능한 리스크를 미리 시뮬레이션하고 준비하는 능력',
    coreDescription: '발생 가능한 리스크를 미리 시뮬레이션하고 준비하는 능력',
    lowAdv: ['낙관적', '자신감'],
    lowDis: ['대책 없는'],
    highAdv: ['재난예측', '위험대비'],
    highDis: ['비관적 관점', '걱정 근심']
  },
  HA2: {
    name: '상황 불확실성',
    lowLabel: '대담한',
    highLabel: '신중한',
    description: '명확한 구조와 정보를 통해 안정성을 확보하려는 신중함',
    coreDescription: '명확한 구조와 정보를 통해 안정성을 확보하려는 신중함',
    lowAdv: ['침착함', '대담함'],
    lowDis: ['문제 간과'],
    highAdv: ['상황적 위험 대응', '안전 지향'],
    highDis: ['긴장 불안', '위험 회피']
  },
  HA3: {
    name: '대인 불확실성',
    lowLabel: '개방적',
    highLabel: '신중한',
    description: '낯선 관계에 조심스럽게 접근하여 깊은 신뢰를 쌓는 태도',
    coreDescription: '낯선 관계에 조심스럽게 접근하여 깊은 신뢰를 쌓는 태도',
    lowAdv: ['새로운 사람 잘 사귀는'],
    lowDis: ['사기당할 우려'],
    highAdv: ['사람위험 대비', '신중한 대인관계'],
    highDis: ['지나친 경계심', '사교성 부족']
  },
  HA4: {
    name: '에너지 불확실성',
    lowLabel: '활력 넘치는',
    highLabel: '관리하는',
    description: '회복과 휴식의 필요성을 민감하게 감지하는 신호 체계',
    coreDescription: '회복과 휴식의 필요성을 민감하게 감지하는 신호 체계',
    lowAdv: ['활력이 높음', '잘 회복하는'],
    lowDis: ['오버 드라이브', '체력 과신'],
    highAdv: ['큰 병 예방', '체력관리'],
    highDis: ['활력이 낮은 느낌', '잘 지치는 느낌']
  },
  // ========== RD (관계 민감성) 하위척도 ==========
  RD1: {
    name: '정서적 공감',
    lowLabel: '이성적',
    highLabel: '공감하는',
    description: '타인의 감정을 깊이 느끼고 공명하는 정서적 능력',
    coreDescription: '타인의 감정을 깊이 느끼고 공명하는 정서적 능력',
    lowAdv: ['강인하고 현실적', '감정 중립성', '객관적 태도'],
    lowDis: ['무관심하고 차가운', '감정적 유대감 부족'],
    highAdv: ['타인 감정을 잘 읽고 공감', '동정심, 이해심'],
    highDis: ['타인 감정의 소용돌이에 빠질 우려']
  },
  RD2: {
    name: '정서적 개방',
    lowLabel: '절제된',
    highLabel: '개방적',
    description: '자신의 감정을 솔직하게 표현하고 마음을 여는 사교성',
    coreDescription: '자신의 감정을 솔직하게 표현하고 마음을 여는 사교성',
    lowAdv: ['신비감과 권위', '적정한 거리감'],
    lowDis: ['속을 모를 사람', '마음을 열지 않는'],
    highAdv: ['마음 열고 다가감', '교류와 사귐'],
    highDis: ['다른 사람의 폐쇄성에 상처받음']
  },
  RD3: {
    name: '애착관계',
    lowLabel: '독립지향',
    highLabel: '밀착적',
    description: '타인과 깊이 연결되고자 하는 관계 지향적 동기',
    coreDescription: '타인과 깊이 연결되고자 하는 관계 지향적 동기',
    lowAdv: ['독립적인', '스스로 충전되는', '거부를 잘 견디는'],
    lowDis: ['외골수', '사회접촉에서 소진'],
    highAdv: ['친밀한', '사회접촉에서 충전'],
    highDis: ['외로움에 취약한', '타인 반응에 민감']
  },
  RD4: {
    name: '정서적 지지',
    lowLabel: '자존지향',
    highLabel: '협력지향',
    description: '홀로 서기보다 함께 협력할 때 시너지를 내는 협동적 성향',
    coreDescription: '홀로 서기보다 함께 협력할 때 시너지를 내는 협동적 성향',
    lowAdv: ['초연히 자존함', '주관이 뚜렷한'],
    lowDis: ['눈치없는'],
    highAdv: ['눈치빠르게 상대 필요 파악', '배려와 협력'],
    highDis: ['칭찬과 비판에 과민', '의존적인']
  },
  // ========== PS (실행 일관성) 하위척도 ==========
  PS1: {
    name: '착수완수지향성',
    lowLabel: '신중한',
    highLabel: '적극적',
    description: '어려움이 있어도 기꺼이 과업에 착수하는 태도',
    coreDescription: '어려움이 있어도 기꺼이 과업에 착수하는 태도',
    lowAdv: ['신중함', '철저한 준비'],
    lowDis: ['착수 지연', '미루거나 꾸물댐'],
    highAdv: ['책임감', '성실함'],
    highDis: ['조급함', '보상에 쉬 매혹되는']
  },
  PS2: {
    name: '유지지향성',
    lowLabel: '유연한',
    highLabel: '끈기있는',
    description: '피로와 좌절에도 굴하지 않고 끝까지 완주하는 힘',
    coreDescription: '피로와 좌절에도 굴하지 않고 끝까지 완주하는 힘',
    lowAdv: ['탄력적인', '변화에 잘 대응'],
    lowDis: ['게으름', '포기함'],
    highAdv: ['꾸준함', '근면성'],
    highDis: ['완고한', '변화의 결단을 피함']
  },
  PS3: {
    name: '목표지향성',
    lowLabel: '자족하는',
    highLabel: '야심찬',
    description: '높은 기준을 설정하고 최선을 다하려는 향상심',
    coreDescription: '높은 기준을 설정하고 최선을 다하려는 향상심',
    lowAdv: ['자족하는', '협력적인'],
    lowDis: ['목표가 없어서 능력보다 덜 성취'],
    highAdv: ['도전하는', '야심찬'],
    highDis: ['과한 경쟁심', '권력욕', '과한 희생']
  },
  PS4: {
    name: '완벽지향성',
    lowLabel: '실용적',
    highLabel: '완벽추구',
    description: '작은 디테일도 놓치지 않고 완성도를 높이려는 장인 정신',
    coreDescription: '작은 디테일도 놓치지 않고 완성도를 높이려는 장인 정신',
    lowAdv: ['실용적인', '현실적인'],
    lowDis: ['목표가 낮아서 능력보다 덜 성취'],
    highAdv: ['목표가 높은', '성취품질이 높은'],
    highDis: ['무리한 기준을 고수']
  },
  // ========== SD (자율성) 하위척도 ==========
  SD1: {
    name: '책임감',
    lowLabel: '상황 요인 중시',
    highLabel: '개인 책임 중시',
    description: '자신의 선택과 결과의 주인이 되는 태도',
    coreDescription: '자신의 선택과 결과의 주인이 되는 태도',
    lowAdv: ['유연한 책임 귀인'],
    lowDis: ['남탓하는', '책임 전가하는'],
    highAdv: ['책임지는', '신뢰로운'],
    highDis: ['과도한 자기 비난']
  },
  SD2: {
    name: '목적의식',
    lowLabel: '단기 목표 지향',
    highLabel: '장기 목표 지향',
    description: '삶의 의미와 장기적 목표를 명확히 하는 힘',
    coreDescription: '삶의 의미와 장기적 목표를 명확히 하는 힘',
    lowAdv: ['현재상황과 욕구충족 중심'],
    lowDis: ['목적, 의미 탐색중인'],
    highAdv: ['장기적 목표와 가치 지향', '욕구만족 지연'],
    highDis: ['지나친 미래 지향']
  },
  SD3: {
    name: '유능감',
    lowLabel: '자기 겸양심',
    highLabel: '자기효능감',
    description: '문제를 해결하고 장애물을 넘을 수 있다는 믿음',
    coreDescription: '문제를 해결하고 장애물을 넘을 수 있다는 믿음',
    lowAdv: ['겸손한'],
    lowDis: ['무능감', '타인 의존'],
    highAdv: ['심리적 자원 풍부', '문제해결력', '도전의식'],
    highDis: ['자만심']
  },
  SD4: {
    name: '자기수용',
    lowLabel: '개선지향',
    highLabel: '자기 존중',
    description: '있는 그대로의 자신(장단점 포함)을 긍정하는 태도',
    coreDescription: '있는 그대로의 자신(장단점 포함)을 긍정하는 태도',
    lowAdv: ['훈련과 노력을 통한 한계 돌파'],
    lowDis: ['힘겹게 분투중인', '타인 모습을 꿈꾸는'],
    highAdv: ['자신의 단점과 한계 인정', '가장없이 본인을 드러냄'],
    highDis: ['변화 동기 부족']
  },
  SD5: {
    name: '자기 일치',
    lowLabel: '상황 적응적',
    highLabel: '가치 일치적',
    description: '긍정적 행동이 노력 없이도 자연스럽게 체화된 상태',
    coreDescription: '자신의 기준과 행동의 일치성에 대한 믿음',
    lowAdv: ['상황에 유연하게 적응'],
    lowDis: ['유혹에 굴복', '마음따로 몸따로'],
    highAdv: ['자신의 가치에 부합하는 행동', '좋은 습관'],
    highDis: ['경직된 원칙주의']
  },
  // ========== CO (협력성) 하위척도 ==========
  CO1: {
    name: '타인수용',
    lowLabel: '비판적',
    highLabel: '수용적',
    description: '나와 다른 타인을 있는 그대로 받아들이는 포용력',
    coreDescription: '나와 다른 타인을 있는 그대로 받아들이는 의지',
    lowAdv: ['비판적 사고'],
    lowDis: ['자신과 다른 가치 수용않음', '자기 중심적'],
    highAdv: ['타인의 가치와 목표 존중', '관대하고 우호적'],
    highDis: ['무비판적 수용']
  },
  CO2: {
    name: '공감',
    lowLabel: '객관적',
    highLabel: '공감하는',
    description: '타인의 고통과 기쁨을 내 것처럼 느끼는 능력',
    coreDescription: '타인의 고통과 기쁨을 내 것처럼 받아들이는 의지',
    lowAdv: ['객관적 판단'],
    lowDis: ['타인 감정에 대한 배려 부족'],
    highAdv: ['역지사지', '타인 감정 존중'],
    highDis: ['감정적 소진']
  },
  CO3: {
    name: '이타성',
    lowLabel: '자기 보호적',
    highLabel: '헌신적',
    description: '타인의 이익을 위해 기꺼이 돕는 봉사 정신',
    coreDescription: '타인의 이익을 위해 기꺼이 돕우려는 의지',
    lowAdv: ['자기 보호'],
    lowDis: ['이기적', '자신을 돋보이고 싶어함'],
    highAdv: ['이타적', '격려와 위로', '팀웍 선호'],
    highDis: ['자기 희생']
  },
  CO4: {
    name: '관대함',
    lowLabel: '정의 지향',
    highLabel: '자비 지향',
    description: '타인의 실수나 허물을 너그럽게 감싸는 마음',
    coreDescription: '타인의 실수나 허물을 너그럽게 감싸는 마음',
    lowAdv: ['정의감'],
    lowDis: ['복수의 화신'],
    highAdv: ['동정심과 자비심', '용서하고 관대함'],
    highDis: ['지나친 관용']
  },
  CO5: {
    name: '공평',
    lowLabel: '실용적',
    highLabel: '원칙적',
    description: '편파적이지 않고 공정하게 대하려는 정의감',
    coreDescription: '편파적이지 않고 공정하게 대하려는 정의감',
    lowAdv: ['실용적 판단'],
    lowDis: ['기회주의적', '편파적'],
    highAdv: ['윤리적 원칙과 양심 통합', '일관되고 공정함'],
    highDis: ['융통성 부족']
  },
  // ========== ST (자기초월) 하위척도 ==========
  ST1: {
    name: '창조적 몰입',
    lowLabel: '현실 집중',
    highLabel: '몰입',
    description: '시공간을 잊을 정도로 무언가에 깊이 빠져드는 경험',
    coreDescription: '시공간을 잊을 정도로 무언가에 깊이 빠져드는 경험',
    lowAdv: ['늘 깨어 있는', '감동에 빠지지 않는'],
    lowDis: ['무미건조'],
    highAdv: ['자기경계를 초월', '몰입', '창조적, 독창적'],
    highDis: ['현실감각 저하']
  },
  ST2: {
    name: '일체감',
    lowLabel: '개인주의',
    highLabel: '연결감',
    description: '자연, 우주, 타인과 내가 연결되어 있음을 느끼는 감각',
    coreDescription: '자연, 우주, 타인과 내가 연결되어 있음을 느끼는 감각',
    lowAdv: ['개인주의', '현실 집중'],
    lowDis: ['자연을 도구로 봄'],
    highAdv: ['개인을 초월한 연결감', '이상주의'],
    highDis: ['비현실적 기대']
  },
  ST3: {
    name: '영성 수용',
    lowLabel: '현실중심',
    highLabel: '초월지향',
    description: '물질 너머의 의미와 보이지 않는 가치를 믿고 따르는 태도',
    coreDescription: '물질 너머의 의미와 보이지 않는 가치를 믿고 따르는 태도',
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

// 상위 척도 강점/약점 특성 (풍부한 설명 + 페르소나)
const mainScaleTraits = {
  NS: {
    description: '도파민 시스템과 연관되어 새로운 자극, 보상 신호, 처벌의 회피 등에 대해 행동이 활성화되는 경향으로, 행동의 "시동"을 거는 혁신적 에너지.',
    highPersona: '탐험가(Explorer)',
    highPersonaDesc: '[혁신과 열정] 새로운 변화를 주도하고, 에너지가 넘치며, 낯선 도전을 즐기는 힘.',
    lowPersona: '보존가(Preserver)',
    lowPersonaDesc: '[절제와 안정] 규칙과 절차를 존중하고, 반복적인 일상을 평온하게 유지하며, 신중하게 자원을 관리하는 힘.',
    lowAdv: ['차분하고 안정적인', '숙고하는/집중하는', '검소하고 절약하는', '차분하고 질서정연한'],
    lowDis: ['익숙함을 고수하는', '관습적인', '인색한', '무뚝뚝한'],
    highAdv: ['활발히 탐색하는', '새로운 것에 개방적인', '가진 것을 십분 즐기는', '자유롭고 혁신적인'],
    highDis: ['충동적인/흥분하는', '중독에 취약한', '낭비하는', '분노조절이 잘 안 되는']
  },
  HA: {
    description: '세로토닌 시스템과 연관되어 위험, 불확실성, 낯섦에 대한 억제적 반응을 통해 안전을 확보하려는 보호 메커니즘.',
    highPersona: '수호자(Sentinel)',
    highPersonaDesc: '[대비와 전략] 잠재적 위험을 미리 감지하여 치밀하게 대비하고, 돌다리도 두들겨 보는 신중함.',
    lowPersona: '도전자(Challenger)',
    lowPersonaDesc: '[낙관과 용기] 불확실한 상황에서도 긍정적인 면을 보고, 실패를 두려워하지 않고 과감하게 뛰어드는 대담함.',
    lowAdv: ['낙관적인/자신감 있는', '침착하고 대담한', '사교적으로 잘 어울리는', '활력이 넘치는'],
    lowDis: ['위험대책이 없는', '문제를 간과하는', '쉽게 사람을 믿는', '과로하는'],
    highAdv: ['잘 대비하는', '안전을 중시하는', '신중하게 접근하는', '몸을 잘 관리하는'],
    highDis: ['염려하고 걱정하는', '위축되고 억제되는', '낯선 사람 경계하는', '쉽게 지치는']
  },
  RD: {
    description: '노르에피네프린 시스템과 연관되어 사회적 보상과 관계에 민감하게 반응하며 정서적 유대를 형성하는 경향.',
    highPersona: '연결자(Connector)',
    highPersonaDesc: '[공감과 유대] 타인의 감정에 깊이 공명하고, 따뜻한 관계를 맺으며 조직의 결속력을 다지는 능력.',
    lowPersona: '분석가(Independent)',
    lowPersonaDesc: '[이성과 독립] 감정에 휩쓸리지 않고 객관적 사실에 근거하여 판단하며, 혼자서도 독립적으로 과업을 수행하는 능력.',
    lowAdv: ['강인하고 현실적인', '타인 영향을 덜 받고 객관적인', '스스로 충전되는', '독립적인, 주관이 뚜렷한'],
    lowDis: ['둔감하고 무관심한', '차갑고 냉정한', '사회접촉에서 소진되는', '외골수적이고 눈치가 없는'],
    highAdv: ['동정심/이해심 많은', '친밀하게 다가가는', '마음을 열고 더불어 사는', '눈치가 빠른'],
    highDis: ['기분이 쉽게 변하는', '마음이 여린', '의존적인', '거절/모욕에 민감한']
  },
  PS: {
    description: '부분적 강화에도 불구하고 한번 시작한 행동을 끝까지 유지하려는 의지와 끈기.',
    highPersona: '성취가(Achiever)',
    highPersonaDesc: '[몰입과 끈기] 보상이 없어도 목표를 향해 끝까지 매달려 기어이 결과를 만들어내는 집념.',
    lowPersona: '적응가(Adapter)',
    lowPersonaDesc: '[유연과 전환] 상황이 바뀌면 빠르게 태세를 전환하고, 효율이 없는 일은 과감히 멈추는 유연한 대처 능력.',
    lowAdv: ['전략적이고 융통성있는', '현재에 만족하는', '변화에 잘 대응하는', '실용적인'],
    lowDis: ['미루는', '쉽게 포기하는', '야망이 없는', '능력보다 작게 성취하는'],
    highAdv: ['책임감있는', '심지가 굳고 꾸준한', '야심적인, 도전하는', '성취수준이 높은'],
    highDis: ['완고한', '변화의 결단을 미루는', '무리한 기준을 고수하는', '자신에게 혹독한']
  },
  SD: {
    description: '자신의 선택과 행동에 책임을 지고, 목표를 향해 주체적으로 삶을 이끌어가는 성숙한 자기 경영 능력.',
    lowAdv: ['상황에 유연한', '겸손한', '훈련으로 성장하려는', '상황 적응적인'],
    lowDis: ['남탓하는', '목적/의미 탐색중인', '무능감/타인 의존', '유혹에 굴복하는'],
    highAdv: ['책임지는/신뢰로운', '장기목표와 가치 지향', '자기효능감/도전의식', '가치에 부합하는 행동'],
    highDis: ['과도한 자기 비난', '지나친 미래 지향', '자만심', '경직된 원칙주의']
  },
  CO: {
    description: '타인을 존중하고 공감하며, 이타적으로 협력하여 더불어 성장하는 사회적 성숙성.',
    lowAdv: ['비판적 사고', '객관적 판단', '자기 보호', '정의감'],
    lowDis: ['자기중심적', '타인 배려 부족', '이기적', '복수심/편파적'],
    highAdv: ['타인 가치 존중/관대', '역지사지/공감', '이타적/팀웍 선호', '용서하고 공정함'],
    highDis: ['무비판적 수용', '감정적 소진', '자기 희생', '지나친 관용']
  },
  ST: {
    description: '개인의 경계를 넘어 더 큰 전체와 연결되고, 삶의 의미와 영성을 추구하는 통찰력.',
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
  // ── 인증 State ──
  const [authUser, setAuthUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  const [page, setPage] = useState('list');
  const [groups, setGroups] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [newGroup, setNewGroup] = useState({ name: '', desc: '' });
  const [uploadedData, setUploadedData] = useState(null);
  const [loading, setLoading] = useState(true);

  // 이름 매칭 관련 state
  const [nameMapping, setNameMapping] = useState([]); // [{originalName, displayName, isDuplicate}, ...]
  const [showNameMappingModal, setShowNameMappingModal] = useState(false);
  const [editingGroup, setEditingGroup] = useState(null); // 수정 중인 그룹
  const [isIndividualMode, setIsIndividualMode] = useState(false); // 개인진단 모드
  const [individualSelectMode, setIndividualSelectMode] = useState('upload'); // 'upload' or 'select'
  const [individualSelectedMember, setIndividualSelectedMember] = useState(null); // 기존 멤버 선택

  // 커플분석 관련 state
  const [couplePersonA, setCouplePersonA] = useState(null); // Person A 데이터
  const [couplePersonB, setCouplePersonB] = useState(null); // Person B 데이터
  const [coupleRelType, setCoupleRelType] = useState('COUPLE'); // 관계 유형
  const [coupleSelectMode, setCoupleSelectMode] = useState('upload'); // 'upload' or 'select'

  // 지표 설정 관련 state (커스텀 데이터가 있으면 하드코딩 대신 사용)
  const [customMainScaleTraits, setCustomMainScaleTraits] = useState(null);
  const [customScaleTraits, setCustomScaleTraits] = useState(null);
  const [customNorms, setCustomNorms] = useState(null);

  // 실제 사용할 데이터 (커스텀 값이 있으면 우선 사용)
  const activeMainScaleTraits = customMainScaleTraits || mainScaleTraits;
  const activeScaleTraits = customScaleTraits || scaleTraits;
  const activeNorms = customNorms || norms;

  // 업로드 후 인라인 연결 state
  const [linkingAfterUpload, setLinkingAfterUpload] = useState(null); // { groupId, groupName, members: [{id, name, gender, age}] }
  const [clientUsers, setClientUsers] = useState([]); // role='client' 사용자 목록
  const [linkAssignments, setLinkAssignments] = useState({}); // { memberId: clientUserId }

  // 상담자 본인 연결 멤버 레코드
  const [myMemberRecord, setMyMemberRecord] = useState(null); // { member, group }

  // ── 인증: 유저 프로필 로드 ──
  const loadUserProfile = async (userId) => {
    const { data } = await supabase.from('users').select('*').eq('id', userId).single();
    setUserProfile(data);
    setAuthLoading(false);
  };

  // ── 인증: 로그아웃 ──
  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setAuthUser(null);
    setUserProfile(null);
    setGroups([]);
    setPage('list');
  };

  // ── 내담자 사용자 목록 로드 ──
  const loadClientUsers = async () => {
    const { data } = await supabase
      .from('users')
      .select('id, name, email')
      .eq('role', 'client')
      .order('name');
    setClientUsers(data || []);
    return data || [];
  };

  // ── 인증: 초기화 useEffect ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user.id);
      else setAuthLoading(false);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuthUser(session?.user ?? null);
      if (session?.user) loadUserProfile(session.user.id);
      else { setUserProfile(null); setAuthLoading(false); }
    });
    return () => subscription.unsubscribe();
  }, []);

  // Supabase에서 그룹 데이터 로드
  const loadGroups = async (profile) => {
    const activeProfile = profile || userProfile;
    try {
      setLoading(true);

      // 그룹 목록 가져오기 (counselor: 본인 그룹, admin: 전체)
      let query = supabase.from('groups').select('*').order('created_at', { ascending: false });
      if (activeProfile?.role === 'counselor') {
        query = query.eq('user_id', authUser?.id || '');
      }
      const { data: groupsData, error: groupsError } = await query;

      if (groupsError) throw groupsError;

      // 각 그룹의 멤버 가져오기
      const groupsWithMembers = await Promise.all(
        (groupsData || []).map(async (group) => {
          const { data: membersData, error: membersError } = await supabase
            .from('members')
            .select('*')
            .eq('group_id', group.id);

          if (membersError) {
            console.error('멤버 로드 오류:', membersError);
            return null;
          }

          // DB 컬럼명을 앱에서 사용하는 형식으로 변환
          const members = (membersData || []).map((m, idx) => ({
            id: idx + 1,
            dbId: m.id, // DB UUID (UserManagementPage 연결에 사용)
            client_user_id: m.client_user_id, // 연결된 내담자 계정
            name: m.name,
            originalName: m.original_name || m.name, // 원본 이름 (없으면 name 사용)
            gender: m.gender,
            age: m.age,
            NS: m.ns, HA: m.ha, RD: m.rd, PS: m.ps,
            SD: m.sd, CO: m.co, ST: m.st,
            NS1: m.ns1, NS2: m.ns2, NS3: m.ns3, NS4: m.ns4,
            HA1: m.ha1, HA2: m.ha2, HA3: m.ha3, HA4: m.ha4,
            RD1: m.rd1, RD2: m.rd2, RD3: m.rd3, RD4: m.rd4,
            PS1: m.ps1, PS2: m.ps2, PS3: m.ps3, PS4: m.ps4,
            SD1: m.sd1, SD2: m.sd2, SD3: m.sd3, SD4: m.sd4, SD5: m.sd5,
            CO1: m.co1, CO2: m.co2, CO3: m.co3, CO4: m.co4, CO5: m.co5,
            ST1: m.st1, ST2: m.st2, ST3: m.st3
          }));

          return {
            id: group.id,
            name: group.name,
            desc: group.description || '',
            members: members,
            createdAt: group.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
          };
        })
      );

      const validGroups = groupsWithMembers.filter(g => g !== null);
      setGroups(validGroups);

      // 상담자 본인의 연결된 멤버 레코드 탐색
      let foundMember = null;
      let foundGroup = null;
      const currentAuthId = authUser?.id;
      if (currentAuthId) {
        for (const g of validGroups) {
          for (const m of g.members) {
            if (m.client_user_id === currentAuthId) {
              foundMember = m;
              foundGroup = g;
              break;
            }
          }
          if (foundMember) break;
        }
      }
      setMyMemberRecord(foundMember ? { member: foundMember, group: foundGroup } : null);
    } catch (error) {
      console.error('그룹 로드 오류:', error);
    } finally {
      setLoading(false);
    }
  };

  // 인증 완료 후 데이터 로드
  useEffect(() => {
    if (userProfile) loadGroups(userProfile);
  }, [userProfile]);

  const handleCreateGroup = async () => {
    if (!newGroup.name || !uploadedData) return;

    try {
      // 1. 그룹 생성
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .insert({
          name: newGroup.name,
          description: newGroup.desc,
          user_id: authUser?.id || null
        })
        .select()
        .single();

      if (groupError) throw groupError;

      // 2. 멤버 데이터 삽입 (original_name 포함)
      const membersToInsert = uploadedData.map(m => ({
        group_id: groupData.id,
        name: m.name,
        original_name: m.originalName || m.name, // 원본 이름 저장
        gender: m.gender || null,
        age: m.age || null,
        ns: m.NS, ha: m.HA, rd: m.RD, ps: m.PS,
        sd: m.SD, co: m.CO, st: m.ST,
        ns1: m.NS1, ns2: m.NS2, ns3: m.NS3, ns4: m.NS4,
        ha1: m.HA1, ha2: m.HA2, ha3: m.HA3, ha4: m.HA4,
        rd1: m.RD1, rd2: m.RD2, rd3: m.RD3, rd4: m.RD4,
        ps1: m.PS1, ps2: m.PS2, ps3: m.PS3, ps4: m.PS4,
        sd1: m.SD1, sd2: m.SD2, sd3: m.SD3, sd4: m.SD4, sd5: m.SD5,
        co1: m.CO1, co2: m.CO2, co3: m.CO3, co4: m.CO4, co5: m.CO5,
        st1: m.ST1, st2: m.ST2, st3: m.ST3
      }));

      const { data: insertedMembers, error: membersError } = await supabase
        .from('members')
        .insert(membersToInsert)
        .select('id, name, gender, age');

      if (membersError) throw membersError;

      // 3. 로컬 상태 업데이트
      const newGroupObj = {
        id: groupData.id,
        name: groupData.name,
        desc: groupData.description || '',
        members: uploadedData,
        createdAt: groupData.created_at?.split('T')[0] || new Date().toISOString().split('T')[0]
      };

      setGroups([newGroupObj, ...groups]);
      setNewGroup({ name: '', desc: '' });
      setUploadedData(null);
      setNameMapping([]); // 이름 매핑 초기화

      // 4. 업로드 후 인라인 연결 단계로 이동 (내담자 계정 연결)
      const clients = await loadClientUsers();
      if (clients.length > 0) {
        setLinkAssignments({});
        setLinkingAfterUpload({
          groupId: groupData.id,
          groupName: groupData.name,
          members: insertedMembers || []
        });
        setPage('link-after-upload');
      } else {
        setPage('list');
      }
    } catch (error) {
      console.error('그룹 생성 오류:', error);
      alert('그룹 생성 중 오류가 발생했습니다: ' + error.message);
    }
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

              // 이름 필드 처리 (다양한 컬럼명 지원) - 원본 이름 저장
              const originalName = row.name || row['이름'] || row['Name'] || row['NAME'] || '';
              obj.originalName = originalName;
              obj.name = originalName; // 나중에 매핑 테이블에서 익명화된 이름으로 대체

              // 성별, 나이
              obj.gender = row.gender || row['성별'] || row['Gender'] || '';
              obj.age = parseInt(row.age || row['연령'] || row['나이'] || row['Age'] || 0) || null;

              // 상위 척도 (백분위) - CSV의 NSP, HAP 등에서 읽음
              ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'].forEach(scale => {
                // 백분위 점수 컬럼명: NSP, HAP, RDP, PSP, SDP, COP, STP
                const percentileKey = scale + 'P';
                const val = row[percentileKey] || row[percentileKey.toLowerCase()] ||
                            row[scale] || row[scale.toLowerCase()] || 0;
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

              // 이름 매핑 테이블 생성
              const mapping = data.map(d => ({
                originalName: d.originalName,
                displayName: anonymizeName(d.originalName),
                isDuplicate: false
              }));

              // 동명이인 감지
              const displayNameCounts = {};
              mapping.forEach(m => {
                displayNameCounts[m.displayName] = (displayNameCounts[m.displayName] || 0) + 1;
              });
              mapping.forEach(m => {
                m.isDuplicate = displayNameCounts[m.displayName] > 1;
              });

              setNameMapping(mapping);
              setShowNameMappingModal(true);
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

  // 커플분석 CSV 파싱 (1명용)
  const handleCoupleFileUpload = (e, target) => {
    const file = e.target.files[0];
    if (!file) return;

    const tryParse = (encoding) => {
      const reader = new FileReader();
      reader.onload = (evt) => {
        const text = evt.target.result;
        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const data = results.data.map((row, idx) => {
              const obj = { id: idx + 1 };
              const originalName = row.name || row['이름'] || row['Name'] || row['NAME'] || '';
              obj.originalName = originalName;
              obj.name = originalName;
              obj.gender = row.gender || row['성별'] || row['Gender'] || '';
              obj.age = parseInt(row.age || row['연령'] || row['나이'] || row['Age'] || 0) || null;
              ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'].forEach(scale => {
                const percentileKey = scale + 'P';
                const val = row[percentileKey] || row[percentileKey.toLowerCase()] ||
                            row[scale] || row[scale.toLowerCase()] || 0;
                obj[scale] = parseFloat(val) || 0;
              });
              const subScales = [
                'NS1', 'NS2', 'NS3', 'NS4', 'HA1', 'HA2', 'HA3', 'HA4',
                'RD1', 'RD2', 'RD3', 'RD4', 'PS1', 'PS2', 'PS3', 'PS4',
                'SD1', 'SD2', 'SD3', 'SD4', 'SD5', 'CO1', 'CO2', 'CO3', 'CO4', 'CO5',
                'ST1', 'ST2', 'ST3'
              ];
              subScales.forEach(scale => {
                const val = row[scale] || row[scale.toLowerCase()] || 0;
                obj[scale] = parseFloat(val) || 0;
              });
              return obj;
            }).filter(row => row.name);

            if (data.length > 0) {
              const person = data[0]; // 첫 번째 사람만 사용
              if (target === 'A') setCouplePersonA(person);
              else setCouplePersonB(person);
            } else if (encoding === 'euc-kr') {
              tryParse('utf-8');
            } else {
              alert('CSV 파일에서 데이터를 읽을 수 없습니다.');
            }
          },
          error: () => {
            if (encoding === 'euc-kr') tryParse('utf-8');
            else alert('CSV 파일을 읽는 중 오류가 발생했습니다.');
          }
        });
      };
      reader.onerror = () => { if (encoding === 'euc-kr') tryParse('utf-8'); };
      reader.readAsText(file, encoding);
    };
    tryParse('euc-kr');
  };

  const handleDeleteGroup = async (id) => {
    if (confirm('이 그룹을 삭제하시겠습니까?')) {
      try {
        // 1. 먼저 멤버 삭제 (외래키 제약)
        const { error: membersError } = await supabase
          .from('members')
          .delete()
          .eq('group_id', id);

        if (membersError) throw membersError;

        // 2. 그룹 삭제
        const { error: groupError } = await supabase
          .from('groups')
          .delete()
          .eq('id', id);

        if (groupError) throw groupError;

        // 3. 로컬 상태 업데이트
        setGroups(groups.filter(g => g.id !== id));
      } catch (error) {
        console.error('그룹 삭제 오류:', error);
        alert('그룹 삭제 중 오류가 발생했습니다: ' + error.message);
      }
    }
  };

  // ── 인증 기반 렌더링 ──
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-teal-600 rounded-2xl mb-4 shadow-lg">
            <span className="text-white text-2xl font-bold">TCI</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!authUser) {
    return <LoginPage />;
  }

  if (userProfile?.role === 'client') {
    return (
      <ClientView
        user={authUser}
        userProfile={userProfile}
        onSignOut={handleSignOut}
        norms={activeNorms}
        mainScaleTraits={activeMainScaleTraits}
        scaleTraits={activeScaleTraits}
      />
    );
  }

  // 사용자 관리 페이지 (어드민/상담자)
  if (page === 'users') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-4 mb-6">
            <button onClick={() => setPage('list')} className="text-slate-500 hover:text-slate-700 font-medium flex items-center gap-1 text-sm">
              ← 목록
            </button>
          </div>
          <UserManagementPage userProfile={userProfile} groups={groups} />
        </div>
      </div>
    );
  }

  // 업로드 후 인라인 연결 페이지
  if (page === 'link-after-upload' && linkingAfterUpload) {
    const handleLinkSave = async () => {
      const updates = Object.entries(linkAssignments).filter(([, v]) => v);
      await Promise.all(
        updates.map(([memberId, clientUserId]) =>
          supabase.from('members').update({ client_user_id: clientUserId }).eq('id', memberId)
        )
      );
      setLinkingAfterUpload(null);
      await loadGroups(userProfile);
      setPage('list');
    };

    const handleLinkSkip = () => {
      setLinkingAfterUpload(null);
      loadGroups(userProfile);
      setPage('list');
    };

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-800">내담자 계정 연결</h2>
                <p className="text-sm text-gray-500">{linkingAfterUpload.groupName}</p>
              </div>
            </div>
            <p className="text-sm text-gray-500 mb-6">
              업로드된 검사 데이터를 내담자 계정과 연결하면 내담자가 본인 결과를 조회할 수 있습니다. (선택사항)
            </p>

            <div className="space-y-3 mb-6">
              {linkingAfterUpload.members.map(member => (
                <div key={member.id} className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-800 text-sm">{member.name}</p>
                    {(member.gender || member.age) && (
                      <p className="text-xs text-gray-400">
                        {member.gender && member.gender} {member.age && `${member.age}세`}
                      </p>
                    )}
                  </div>
                  <select
                    value={linkAssignments[member.id] || ''}
                    onChange={e => setLinkAssignments(prev => ({ ...prev, [member.id]: e.target.value || null }))}
                    className="text-sm border border-slate-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-teal-500 min-w-[180px]"
                  >
                    <option value="">— 연결 안 함 —</option>
                    {clientUsers.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleLinkSkip}
                className="flex-1 py-2.5 border border-slate-300 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 transition"
              >
                건너뛰기
              </button>
              <button
                onClick={handleLinkSave}
                className="flex-1 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-sm font-semibold transition"
              >
                저장하고 완료
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 그룹 리스트 페이지
  if (page === 'list') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-4xl mx-auto">
          {/* 헤더: 타이틀 + 유저 정보 + 버튼 */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">TCI 그룹 분석</h1>
              <p className="text-gray-500 mt-1">기질 및 성격검사 그룹 분석 서비스</p>
            </div>
            <div className="flex flex-col items-end gap-3">
              {/* 유저 정보 + 로그아웃 */}
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  userProfile?.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-teal-100 text-teal-700'
                }`}>
                  {userProfile?.role === 'admin' ? '어드민' : '상담자'}
                </span>
                <span className="text-sm text-gray-600">{userProfile?.name || authUser?.email}</span>
                <button onClick={handleSignOut}
                  className="text-xs text-gray-400 hover:text-gray-600 border border-gray-200 rounded-lg px-2 py-1 hover:bg-gray-50">
                  로그아웃
                </button>
              </div>
              {/* 액션 버튼 */}
              <div className="flex gap-2">
                {(userProfile?.role === 'admin' || userProfile?.role === 'counselor') && (
                  <button onClick={() => setPage('users')}
                    className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl font-medium hover:bg-purple-100 transition-all flex items-center gap-1.5 text-sm border border-purple-200">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    사용자 관리
                  </button>
                )}
                <button onClick={() => setPage('settings')}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-all flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  지표 설정
                </button>
                {myMemberRecord && (
                  <button
                    onClick={() => {
                      const virtualGroup = {
                        ...myMemberRecord.group,
                        name: myMemberRecord.member.name,
                        members: [myMemberRecord.member]
                      };
                      setSelectedGroup(virtualGroup);
                      setPage('analysis');
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-medium hover:from-teal-600 hover:to-teal-700 transition-all shadow-lg shadow-teal-500/25 flex items-center gap-1.5 text-sm">
                    <span>🪞</span> 내 결과 보기
                  </button>
                )}
                <button onClick={() => { setIsIndividualMode(true); setIndividualSelectMode('upload'); setIndividualSelectedMember(null); setUploadedData(null); setNewGroup({ name: '', desc: '' }); setPage('create'); }}
                  className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 transition-all shadow-lg shadow-emerald-500/25 flex items-center gap-1.5 text-sm">
                  <span>👤</span> 개인진단
                </button>
                <button onClick={() => { setCouplePersonA(null); setCouplePersonB(null); setCoupleRelType('COUPLE'); setCoupleSelectMode('upload'); setPage('couple-create'); }}
                  className="px-4 py-2 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 transition-all shadow-lg shadow-rose-500/25 flex items-center gap-1.5 text-sm">
                  <span>💑</span> 커플분석
                </button>
                <button onClick={() => { setIsIndividualMode(false); setPage('create'); }}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/25 flex items-center gap-1.5 text-sm">
                  <span>+</span> 새 그룹 만들기
                </button>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm">
              <div className="text-5xl mb-4 animate-spin">⏳</div>
              <p className="text-gray-400 text-lg">데이터를 불러오는 중...</p>
            </div>
          ) : groups.length === 0 ? (
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
                      <div className={`w-14 h-14 bg-gradient-to-br ${g.members.length === 1 ? 'from-emerald-500 to-emerald-600 shadow-emerald-500/30' : 'from-blue-500 to-blue-600 shadow-blue-500/30'} rounded-xl flex items-center justify-center shadow-lg`}>
                        <span className="text-2xl text-white">{g.members.length === 1 ? '👤' : '📁'}</span>
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-lg group-hover:text-blue-600 transition">{g.name}</h3>
                        <p className="text-sm text-gray-500">{g.desc || '설명 없음'}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {g.members.length === 1 ? (
                            <span className="text-xs bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-medium">개인</span>
                          ) : (
                            <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">{g.members.length}명</span>
                          )}
                          <span className="text-xs text-gray-400">{g.createdAt} 생성</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition">
                      <button onClick={(e) => { e.stopPropagation(); setEditingGroup(g); setPage('edit'); }}
                        className="px-4 py-2 text-sm text-blue-500 border border-blue-200 rounded-lg hover:bg-blue-50 transition">
                        수정
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); handleDeleteGroup(g.id); }}
                        className="px-4 py-2 text-sm text-red-500 border border-red-200 rounded-lg hover:bg-red-50 transition">
                        삭제
                      </button>
                    </div>
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
            <h2 className="text-2xl font-bold text-gray-800 mb-2">{isIndividualMode ? '개인 진단' : '새 그룹 만들기'}</h2>
            <p className="text-gray-500 mb-6">{isIndividualMode ? '개인 TCI 진단을 시작합니다.' : 'CSV 파일을 업로드하여 그룹을 생성하세요.'}</p>

            {/* 개인진단 모드: 입력 방식 선택 탭 */}
            {isIndividualMode && (
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">데이터 입력 방식</label>
                <div className="flex gap-2">
                  <button onClick={() => { setIndividualSelectMode('upload'); setIndividualSelectedMember(null); }}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${individualSelectMode === 'upload' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-xl mb-1">📄</div>
                    <div className="text-xs font-medium text-gray-700">CSV 업로드</div>
                  </button>
                  <button onClick={() => { setIndividualSelectMode('select'); setUploadedData(null); setNewGroup({ name: '', desc: '' }); }}
                    disabled={groups.flatMap(g => g.members).length === 0}
                    className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${individualSelectMode === 'select' ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 hover:border-gray-300'} ${groups.flatMap(g => g.members).length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                    <div className="text-xl mb-1">👥</div>
                    <div className="text-xs font-medium text-gray-700">기존 검사자 선택</div>
                  </button>
                </div>
              </div>
            )}

            {/* CSV 업로드 모드 (그룹생성 또는 개인진단-upload) */}
            {(!isIndividualMode || individualSelectMode === 'upload') && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{isIndividualMode ? '이름 *' : '그룹명 *'}</label>
                <input type="text" value={newGroup.name} onChange={(e) => setNewGroup({...newGroup, name: e.target.value})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                  placeholder={isIndividualMode ? '예: 홍길동' : '예: ACC전문코치반 2501기'} />
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

              {uploadedData && nameMapping.length > 0 && (
                <div className={`bg-gradient-to-r ${isIndividualMode && uploadedData.length > 1 ? 'from-red-50 to-orange-50 border-red-200' : 'from-green-50 to-emerald-50 border-green-200'} border rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`${isIndividualMode && uploadedData.length > 1 ? 'text-red-600' : 'text-green-600'} text-lg`}>{isIndividualMode && uploadedData.length > 1 ? '⚠' : '✓'}</span>
                    <span className={`${isIndividualMode && uploadedData.length > 1 ? 'text-red-700' : 'text-green-700'} font-semibold`}>{uploadedData.length}명 데이터 로드 완료</span>
                  </div>
                  {isIndividualMode && uploadedData.length > 1 && (
                    <p className="text-red-600 text-sm font-medium mb-2">개인진단은 1명만 가능합니다. 1명의 데이터만 포함된 CSV를 업로드해주세요.</p>
                  )}
                  <p className={`${isIndividualMode && uploadedData.length > 1 ? 'text-red-500' : 'text-green-600'} text-sm`}>
                    {nameMapping.slice(0, 5).map(m => m.displayName).join(', ')}
                    {nameMapping.length > 5 && ` 외 ${nameMapping.length - 5}명`}
                  </p>
                  <button onClick={() => setShowNameMappingModal(true)}
                    className="mt-2 text-blue-600 text-sm font-medium hover:text-blue-800">
                    이름 매칭 확인/수정 →
                  </button>
                </div>
              )}

              <div className="flex gap-4 pt-4">
                <button onClick={() => setPage('list')}
                  className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                  취소
                </button>
                <button onClick={handleCreateGroup}
                  disabled={!newGroup.name || !uploadedData || (isIndividualMode && uploadedData && uploadedData.length > 1)}
                  className={`flex-1 px-6 py-3 bg-gradient-to-r ${isIndividualMode ? 'from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-emerald-500/25' : 'from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-blue-500/25'} text-white rounded-xl font-medium disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg disabled:shadow-none`}>
                  {isIndividualMode ? '진단 시작' : '그룹 생성'}
                </button>
              </div>
            </div>
            )}

            {/* 개인진단 - 기존 검사자 선택 모드 */}
            {isIndividualMode && individualSelectMode === 'select' && (
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3">검사자 선택</label>
                  <div className="border-2 rounded-xl p-4 border-emerald-200 bg-emerald-50/30">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center text-sm font-bold">👤</span>
                      <span className="font-semibold text-gray-700">
                        {individualSelectedMember ? individualSelectedMember.name : '검사자를 선택하세요'}
                      </span>
                      {individualSelectedMember && <span className="text-green-500 text-sm">✓ 선택됨</span>}
                    </div>
                    <select
                      onChange={(e) => {
                        const [gIdx, mIdx] = e.target.value.split('-').map(Number);
                        if (!isNaN(gIdx) && !isNaN(mIdx)) {
                          const member = groups[gIdx]?.members[mIdx];
                          if (member) setIndividualSelectedMember({ ...member, groupName: groups[gIdx].name, groupId: groups[gIdx].id, groupIndex: gIdx });
                        }
                      }}
                      className="w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      defaultValue=""
                    >
                      <option value="" disabled>멤버를 선택하세요</option>
                      {groups.map((g, gIdx) => (
                        <optgroup key={gIdx} label={g.name}>
                          {g.members.map((m, mIdx) => (
                            <option key={`${gIdx}-${mIdx}`} value={`${gIdx}-${mIdx}`}>{m.name} ({m.originalName || m.name})</option>
                          ))}
                        </optgroup>
                      ))}
                    </select>
                  </div>
                </div>

                {/* 선택된 검사자 프리뷰 */}
                {individualSelectedMember && (
                  <div className="bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-green-600 text-lg">✓</span>
                      <span className="text-green-700 font-semibold">{individualSelectedMember.name}</span>
                      <span className="text-gray-400 text-sm">({individualSelectedMember.groupName})</span>
                    </div>
                    <div className="grid grid-cols-7 gap-2">
                      {['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'].map(s => (
                        <div key={s} className="text-center bg-white rounded-lg py-1.5 border border-emerald-100">
                          <div className="text-[10px] text-gray-400">{s}</div>
                          <div className="text-sm font-bold text-gray-700">{individualSelectedMember[s] || 0}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pt-4">
                  <button onClick={() => setPage('list')}
                    className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                    취소
                  </button>
                  <button
                    onClick={() => {
                      if (!individualSelectedMember) return;
                      // 해당 멤버가 속한 그룹을 찾아서 analysis 페이지로 이동
                      const group = groups[individualSelectedMember.groupIndex];
                      if (group) {
                        // 1명짜리 가상 그룹 생성 (해당 멤버만 포함)
                        const virtualGroup = {
                          ...group,
                          name: individualSelectedMember.name,
                          members: [individualSelectedMember]
                        };
                        setSelectedGroup(virtualGroup);
                        setPage('analysis');
                      }
                    }}
                    disabled={!individualSelectedMember}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-medium hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-emerald-500/25 disabled:shadow-none"
                  >
                    진단 시작
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* 이름 매칭 모달 */}
        {showNameMappingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl">
              <div className="p-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-800">이름 매칭 확인</h3>
                <p className="text-gray-500 text-sm mt-1">원본 이름이 익명화된 표시 이름으로 변환됩니다. 필요시 수정하세요.</p>
              </div>

              <div className="p-6 overflow-y-auto" style={{ maxHeight: '50vh' }}>
                {/* 동명이인 경고 */}
                {nameMapping.some(m => m.isDuplicate) && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-4">
                    <div className="flex items-center gap-2 text-amber-700 font-medium">
                      <span>⚠️</span>
                      <span>동명이인 감지</span>
                    </div>
                    <p className="text-amber-600 text-sm mt-1">
                      {(() => {
                        const duplicates = {};
                        nameMapping.forEach(m => {
                          if (m.isDuplicate) {
                            duplicates[m.displayName] = (duplicates[m.displayName] || 0) + 1;
                          }
                        });
                        return Object.entries(duplicates).map(([name, count]) => `${name} (${count}명)`).join(', ');
                      })()}
                      - 구분을 위해 표시 이름을 수정해주세요.
                    </p>
                  </div>
                )}

                {/* 매핑 테이블 */}
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 border-b">
                      <th className="pb-2 font-medium">#</th>
                      <th className="pb-2 font-medium">원본 이름</th>
                      <th className="pb-2 font-medium">표시 이름</th>
                      <th className="pb-2 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {nameMapping.map((m, idx) => (
                      <tr key={idx} className={`border-b border-gray-50 ${m.isDuplicate ? 'bg-amber-50' : ''}`}>
                        <td className="py-2 text-gray-400 text-sm">{idx + 1}</td>
                        <td className="py-2 text-gray-700">{m.originalName}</td>
                        <td className="py-2">
                          <input
                            type="text"
                            value={m.displayName}
                            onChange={(e) => {
                              const newMapping = [...nameMapping];
                              newMapping[idx].displayName = e.target.value;
                              // 동명이인 재검사
                              const counts = {};
                              newMapping.forEach(m => {
                                counts[m.displayName] = (counts[m.displayName] || 0) + 1;
                              });
                              newMapping.forEach(m => {
                                m.isDuplicate = counts[m.displayName] > 1;
                              });
                              setNameMapping(newMapping);
                            }}
                            className={`px-2 py-1 border rounded-lg text-sm w-32 ${m.isDuplicate ? 'border-amber-400 bg-amber-50' : 'border-gray-200'}`}
                          />
                        </td>
                        <td className="py-2">
                          {m.isDuplicate && <span className="text-amber-500">⚠️</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="p-6 border-t border-gray-100 flex gap-4">
                <button onClick={() => setShowNameMappingModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50">
                  취소
                </button>
                <button onClick={() => {
                  // 매핑된 이름을 uploadedData에 적용
                  const updatedData = uploadedData.map((d, idx) => ({
                    ...d,
                    name: nameMapping[idx].displayName
                  }));
                  setUploadedData(updatedData);
                  setShowNameMappingModal(false);
                }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700">
                  확인
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // 그룹 수정 페이지
  if (page === 'edit' && editingGroup) {
    const editNameMapping = editingGroup.members.map(m => ({
      originalName: m.originalName || m.original_name || m.name,
      displayName: m.name,
      isDuplicate: false
    }));

    // 동명이인 체크
    const displayNameCounts = {};
    editNameMapping.forEach(m => {
      displayNameCounts[m.displayName] = (displayNameCounts[m.displayName] || 0) + 1;
    });
    editNameMapping.forEach(m => {
      m.isDuplicate = displayNameCounts[m.displayName] > 1;
    });

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-3xl mx-auto">
          <button onClick={() => { setEditingGroup(null); setPage('list'); }}
            className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2 font-medium">
            ← 목록으로 돌아가기
          </button>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">그룹 수정</h2>
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-600 mb-2">그룹명</label>
              <input
                type="text"
                value={editingGroup.name}
                onChange={(e) => setEditingGroup({ ...editingGroup, name: e.target.value })}
                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                placeholder="그룹명을 입력하세요"
              />
            </div>

            {/* 이름 매칭 테이블 */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-700 mb-3">이름 매칭 테이블</h3>
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr className="text-left text-sm text-gray-500">
                      <th className="px-4 py-3 font-medium">#</th>
                      <th className="px-4 py-3 font-medium">원본 이름</th>
                      <th className="px-4 py-3 font-medium">표시 이름</th>
                      <th className="px-4 py-3 font-medium w-8"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {editingGroup.members.map((m, idx) => (
                      <tr key={idx} className={`border-t border-gray-100 ${editNameMapping[idx]?.isDuplicate ? 'bg-amber-50' : ''}`}>
                        <td className="px-4 py-3 text-gray-400 text-sm">{idx + 1}</td>
                        <td className="px-4 py-3 text-gray-700">{m.originalName || m.original_name || m.name}</td>
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            defaultValue={m.name}
                            onChange={(e) => {
                              const newMembers = [...editingGroup.members];
                              newMembers[idx] = { ...newMembers[idx], name: e.target.value };
                              setEditingGroup({ ...editingGroup, members: newMembers });
                            }}
                            className={`px-2 py-1 border rounded-lg text-sm w-32 ${editNameMapping[idx]?.isDuplicate ? 'border-amber-400' : 'border-gray-200'}`}
                          />
                        </td>
                        <td className="px-4 py-3">
                          {editNameMapping[idx]?.isDuplicate && <span className="text-amber-500">⚠️</span>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex gap-4">
              <button onClick={() => { setEditingGroup(null); setPage('list'); }}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                취소
              </button>
              <button onClick={async () => {
                try {
                  // DB에서 그룹명 업데이트
                  const { error: groupError } = await supabase
                    .from('groups')
                    .update({ name: editingGroup.name })
                    .eq('id', editingGroup.id);

                  if (groupError) console.error('그룹명 업데이트 오류:', groupError);

                  // DB에서 멤버 이름 업데이트
                  for (const m of editingGroup.members) {
                    const { error } = await supabase
                      .from('members')
                      .update({ name: m.name })
                      .eq('group_id', editingGroup.id)
                      .eq('original_name', m.originalName || m.original_name || m.name);

                    if (error) console.error('멤버 업데이트 오류:', error);
                  }

                  // 로컬 상태 업데이트
                  setGroups(groups.map(g => g.id === editingGroup.id ? editingGroup : g));
                  setEditingGroup(null);
                  setPage('list');
                  alert('그룹이 수정되었습니다.');
                } catch (error) {
                  console.error('그룹 수정 오류:', error);
                  alert('그룹 수정 중 오류가 발생했습니다.');
                }
              }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/25">
                저장
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 커플분석 생성 페이지
  if (page === 'couple-create') {
    // 기존 그룹의 모든 멤버 목록 (선택 모드용)
    const allMembers = groups.flatMap(g => g.members.map(m => ({ ...m, groupName: g.name, groupId: g.id })));

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
        <div className="max-w-2xl mx-auto">
          <button onClick={() => setPage('list')} className="text-gray-500 hover:text-gray-700 mb-6 flex items-center gap-2 font-medium">
            ← 목록으로 돌아가기
          </button>
          <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">💑 커플분석</h2>
            <p className="text-gray-500 mb-6">두 사람의 기질/성격을 비교 분석합니다.</p>

            {/* 관계 유형 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">관계 유형</label>
              <div className="grid grid-cols-4 gap-2">
                {Object.entries(RELATIONSHIP_TYPES).map(([key, rt]) => (
                  <button key={key} onClick={() => setCoupleRelType(key)}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${coupleRelType === key ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                    <div className="text-2xl mb-1">{rt.icon}</div>
                    <div className="text-xs font-medium text-gray-700">{rt.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* 데이터 입력 방식 선택 */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">데이터 입력 방식</label>
              <div className="flex gap-2">
                <button onClick={() => setCoupleSelectMode('upload')}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${coupleSelectMode === 'upload' ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'}`}>
                  <div className="text-xl mb-1">📄</div>
                  <div className="text-xs font-medium text-gray-700">CSV 업로드</div>
                </button>
                <button onClick={() => setCoupleSelectMode('select')}
                  disabled={allMembers.length === 0}
                  className={`flex-1 p-3 rounded-xl border-2 text-center transition-all ${coupleSelectMode === 'select' ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'} ${allMembers.length === 0 ? 'opacity-40 cursor-not-allowed' : ''}`}>
                  <div className="text-xl mb-1">👥</div>
                  <div className="text-xs font-medium text-gray-700">기존 멤버 선택</div>
                </button>
              </div>
            </div>

            {/* CSV 업로드 모드 */}
            {coupleSelectMode === 'upload' && (
              <div className="space-y-4">
                {/* Person A */}
                <div className="border-2 rounded-xl p-4 border-blue-200 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">A</span>
                    <span className="font-semibold text-gray-700">
                      {couplePersonA ? couplePersonA.name || couplePersonA.originalName : 'Person A'}
                    </span>
                    {couplePersonA && <span className="text-green-500 text-sm">✓ 로드 완료</span>}
                  </div>
                  <div className="relative border-2 border-dashed border-blue-200 rounded-lg p-4 text-center hover:border-blue-400 transition cursor-pointer">
                    <input type="file" accept=".csv" onChange={(e) => handleCoupleFileUpload(e, 'A')}
                      className="w-full opacity-0 absolute inset-0 cursor-pointer" />
                    <p className="text-sm text-gray-500">{couplePersonA ? '다시 업로드' : 'CSV 파일 선택'}</p>
                  </div>
                </div>

                {/* Person B */}
                <div className="border-2 rounded-xl p-4 border-orange-200 bg-orange-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">B</span>
                    <span className="font-semibold text-gray-700">
                      {couplePersonB ? couplePersonB.name || couplePersonB.originalName : 'Person B'}
                    </span>
                    {couplePersonB && <span className="text-green-500 text-sm">✓ 로드 완료</span>}
                  </div>
                  <div className="relative border-2 border-dashed border-orange-200 rounded-lg p-4 text-center hover:border-orange-400 transition cursor-pointer">
                    <input type="file" accept=".csv" onChange={(e) => handleCoupleFileUpload(e, 'B')}
                      className="w-full opacity-0 absolute inset-0 cursor-pointer" />
                    <p className="text-sm text-gray-500">{couplePersonB ? '다시 업로드' : 'CSV 파일 선택'}</p>
                  </div>
                </div>
              </div>
            )}

            {/* 기존 멤버 선택 모드 */}
            {coupleSelectMode === 'select' && (
              <div className="space-y-4">
                {/* Person A 선택 */}
                <div className="border-2 rounded-xl p-4 border-blue-200 bg-blue-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">A</span>
                    <span className="font-semibold text-gray-700">Person A 선택</span>
                  </div>
                  <select onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    if (!isNaN(idx)) setCouplePersonA(allMembers[idx]);
                  }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" defaultValue="">
                    <option value="" disabled>멤버를 선택하세요</option>
                    {allMembers.map((m, idx) => (
                      <option key={idx} value={idx}>{m.name} ({m.groupName})</option>
                    ))}
                  </select>
                </div>

                {/* Person B 선택 */}
                <div className="border-2 rounded-xl p-4 border-orange-200 bg-orange-50/30">
                  <div className="flex items-center gap-2 mb-3">
                    <span className="w-7 h-7 rounded-full bg-orange-500 text-white flex items-center justify-center text-sm font-bold">B</span>
                    <span className="font-semibold text-gray-700">Person B 선택</span>
                  </div>
                  <select onChange={(e) => {
                    const idx = parseInt(e.target.value);
                    if (!isNaN(idx)) setCouplePersonB(allMembers[idx]);
                  }} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm" defaultValue="">
                    <option value="" disabled>멤버를 선택하세요</option>
                    {allMembers.map((m, idx) => (
                      <option key={idx} value={idx}>{m.name} ({m.groupName})</option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* 분석 시작 버튼 */}
            <div className="flex gap-4 pt-6">
              <button onClick={() => setPage('list')}
                className="flex-1 px-6 py-3 border border-gray-200 rounded-xl text-gray-600 font-medium hover:bg-gray-50 transition">
                취소
              </button>
              <button
                onClick={() => setPage('couple-analysis')}
                disabled={!couplePersonA || !couplePersonB}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-rose-500 to-rose-600 text-white rounded-xl font-medium hover:from-rose-600 hover:to-rose-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed transition shadow-lg shadow-rose-500/25 disabled:shadow-none">
                분석 시작
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 커플분석 결과 페이지
  if (page === 'couple-analysis' && couplePersonA && couplePersonB) {
    return (
      <CoupleAnalysisPage
        personA={couplePersonA}
        personB={couplePersonB}
        relationshipType={coupleRelType}
        onBack={() => setPage('couple-create')}
        mainScaleTraits={activeMainScaleTraits}
      />
    );
  }

  // 설정 페이지
  if (page === 'settings') {
    return (
      <SettingsPage
        mainScaleTraits={activeMainScaleTraits}
        scaleTraits={activeScaleTraits}
        norms={activeNorms}
        onUpdateMainScaleTraits={setCustomMainScaleTraits}
        onUpdateScaleTraits={setCustomScaleTraits}
        onUpdateNorms={setCustomNorms}
        onBack={() => setPage('list')}
      />
    );
  }

  if (page === 'analysis' && selectedGroup) {
    return (
      <AnalysisPage
        group={selectedGroup}
        onBack={() => setPage('list')}
        mainScaleTraits={activeMainScaleTraits}
        scaleTraits={activeScaleTraits}
        norms={activeNorms}
      />
    );
  }

  return null;
}

// ========================================
// 분석 페이지 컴포넌트
// ========================================
function AnalysisPage({ group, onBack, mainScaleTraits, scaleTraits, norms }) {
  // ★ 복수 선택을 위해 Set으로 변경
  const [selectedPersons, setSelectedPersons] = useState(new Set());
  const [mainTab, setMainTab] = useState('temperament');
  const [subTab, setSubTab] = useState('all');
  const [viewMode, setViewMode] = useState('group');
  const [compareScales, setCompareScales] = useState(['NS', 'HA']); // 산점도 비교 지표 (2개 선택)
  const [expandedSubScales, setExpandedSubScales] = useState(new Set()); // 하위지표 특성 펼침 상태
  const [allSubScalesExpanded, setAllSubScalesExpanded] = useState(false); // 전체 펼치기

  // 개인 AI 코칭 분석
  const [individualAiAnalysis, setIndividualAiAnalysis] = useState(null);
  const [individualAiLoading, setIndividualAiLoading] = useState(false);
  const [individualAiError, setIndividualAiError] = useState(null);

  const AI_GATEWAY_URL = import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-gateway20251125.up.railway.app';

  // 멤버 선택 변경 시 AI 분석 초기화
  React.useEffect(() => {
    setIndividualAiAnalysis(null);
    setIndividualAiError(null);
  }, [selectedPersons]);

  // 메인탭 변경 시 비교지표 초기화
  React.useEffect(() => {
    if (mainTab === 'temperament') {
      setCompareScales(['NS', 'HA']);
    } else {
      setCompareScales(['SD', 'CO']);
    }
  }, [mainTab]);
  const reportRef = useRef(null);

  // 레벨 판정 함수 (renderScaleDetail + renderIndividualReport 공용)
  const getLevel = (value) => value >= 81 ? 'VH' : value >= 61 ? 'H' : value >= 41 ? 'M' : value >= 21 ? 'L' : 'VL';
  const getLevelColor = (level) => ({ VH: 'bg-indigo-600', H: 'bg-blue-500', M: 'bg-gray-400', L: 'bg-orange-400', VL: 'bg-red-500' }[level] || 'bg-gray-400');

  const rawData = group.members;
  const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
  const characterScales = ['SD', 'CO', 'ST'];
  const currentScales = mainTab === 'temperament' ? temperamentScales : characterScales;
  const mainColor = mainTab === 'temperament' ? temperamentColor : characterColor;

  const getName = (p) => p.name || p['이름'] || '이름없음';
  const getGender = (p) => p.gender || p['성별'] || '';
  const getAge = (p) => p.age || p['연령'] || '';

  // ===== 개인 AI 코칭 분석 =====
  const INDIVIDUAL_TCI_SYSTEM_PROMPT = `당신은 TCI(기질 및 성격 검사) 전문 코칭 컨설턴트입니다.
한 사람의 TCI 점수를 바탕으로 개인 코칭 가이드를 제공합니다.

## 핵심 철학 (반드시 준수)
- 기질(NS, HA, RD, PS)은 선천적 특성이므로 우열이나 좋고 나쁨이 없습니다.
- 기질은 바꾸는 것이 아니라 활용하는 것입니다. "이 기질을 어떻게 쓸 것인가"에 집중하세요.
- 모든 기질 점수에는 긍정적 측면이 있습니다. 높든 낮든 그 자체로 고유한 강점입니다.
- 성격(SD, CO, ST)은 기질과 달리 의지적 노력으로 성장 가능한 영역입니다. 성장 방향을 긍정적으로 제안하세요.
- 부정적 평가, 문제점 나열, 결함 지적은 절대 금지합니다. 내담자의 기를 꺾지 마세요.

## TCI 척도 해석 기준
- NS(탐색성): 낮으면 안정감·신중함의 힘, 높으면 모험정신·혁신의 힘
- HA(불확실성 센서): 낮으면 대담·낙관의 힘, 높으면 세심·준비성의 힘
- RD(관계 민감성): 낮으면 독립성·자율의 힘, 높으면 공감력·연결의 힘
- PS(실행 일관성): 낮으면 유연성·적응의 힘, 높으면 끈기·완수의 힘
- SD(자율성): 자기조절과 책임감. 성장 가능한 성격 영역
- CO(협력성): 공감과 배려. 성장 가능한 성격 영역
- ST(자기초월): 영적 수용과 직관. 성장 가능한 성격 영역

점수 범위: 0-100 (백분위). 50이 평균.

## 응답 형식 (반드시 아래 4개 섹션 ## 헤더로 구분하여 작성)
## 기질 활용 전략
(이 사람의 기질 조합이 만들어내는 고유한 강점 패턴. 구체적 점수를 언급하며, 이 기질을 어떤 상황에서 어떻게 활용하면 좋은지 제안. 2~3가지)

## 성격 성장 방향
(SD, CO, ST 점수를 바탕으로 성장 가능한 영역과 구체적 방향 제시. 낮은 점수도 "성장 여지"로 표현. 2~3가지)

## 코칭 포인트
(코치가 이 사람과 대화할 때 활용할 수 있는 핵심 질문이나 접근 전략. 기질 특성을 고려한 맞춤형 코칭 방향. 2~3가지)

## 실천 제안
(오늘부터 시작할 수 있는 구체적이고 긍정적인 행동 2~3가지)

## 주의사항
- 반드시 구체적 점수를 언급하며 해석할 것
- 이름을 사용할 것
- 따뜻하고 격려하는 전문가 톤
- 각 섹션 2~4줄 이내로 간결하게
- "문제", "결함", "부족", "못하는" 같은 부정 표현 대신 "성장 여지", "발전 가능성", "활용" 등 사용`;

  const fetchIndividualAiAnalysis = async (person) => {
    setIndividualAiLoading(true);
    setIndividualAiError(null);
    try {
      const scores = [...temperamentScales, ...characterScales]
        .map(s => `${s}=${person[s]}`)
        .join(', ');

      const nsLevel = getTScoreLevel(person.NS);
      const haLevel = getTScoreLevel(person.HA);
      const rdLevel = getTScoreLevel(person.RD);
      const sdLevel = getTScoreLevel(person.SD);
      const coLevel = getTScoreLevel(person.CO);
      const stLevel = getTScoreLevel(person.ST);
      const tempTypeCode = `${nsLevel}${haLevel}${rdLevel}`;
      const charTypeCode = `${sdLevel}${coLevel}${stLevel}`;

      const prompt = `[이름] ${getName(person)}
[성별/나이] ${getGender(person) === 'F' ? '여성' : '남성'} / ${getAge(person)}세
[점수] ${scores}
[기질유형] ${tempTypeCode} (${TEMPERAMENT_TYPES[tempTypeCode]?.name || '알 수 없음'})
[성격유형] ${charTypeCode} (${CHARACTER_TYPES[charTypeCode]?.name || '알 수 없음'})

이 사람의 TCI 결과를 바탕으로 개인 코칭 가이드를 작성해주세요.`;

      const response = await fetch(`${AI_GATEWAY_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'claude-sonnet',
          messages: [{ role: 'user', content: prompt }],
          system_prompt: INDIVIDUAL_TCI_SYSTEM_PROMPT,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error(`API 오류 (${response.status})`);
      const data = await response.json();
      setIndividualAiAnalysis(data.content);
    } catch (err) {
      setIndividualAiError(err.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setIndividualAiLoading(false);
    }
  };

  const parseIndividualAiSections = (text) => {
    if (!text) return [];
    const sectionMap = {
      '기질 활용 전략': { icon: '🧬', bg: 'bg-blue-50', border: 'border-blue-200', title: 'text-blue-700', body: 'text-blue-900' },
      '성격 성장 방향': { icon: '🌱', bg: 'bg-emerald-50', border: 'border-emerald-200', title: 'text-emerald-700', body: 'text-emerald-900' },
      '코칭 포인트': { icon: '🎯', bg: 'bg-purple-50', border: 'border-purple-200', title: 'text-purple-700', body: 'text-purple-900' },
      '실천 제안': { icon: '✅', bg: 'bg-amber-50', border: 'border-amber-200', title: 'text-amber-700', body: 'text-amber-900' }
    };
    const sections = [];
    const regex = /##\s*(.+)/g;
    let match;
    const matches = [];
    while ((match = regex.exec(text)) !== null) {
      matches.push({ key: match[1].trim(), index: match.index });
    }
    for (let i = 0; i < matches.length; i++) {
      const start = matches[i].index + matches[i].key.length + 3;
      const end = i < matches.length - 1 ? matches[i + 1].index : text.length;
      const content = text.slice(start, end).trim();
      const style = sectionMap[matches[i].key] || { icon: '📌', bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700', body: 'text-gray-800' };
      if (content) {
        sections.push({ key: matches[i].key, ...style, content });
      }
    }
    if (sections.length === 0) {
      sections.push({ key: 'AI 분석', icon: '🤖', bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700', body: 'text-gray-800', content: text });
    }
    return sections;
  };

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

  // ★ 전체 선택
  const selectAll = () => {
    const allNames = rawData.map(p => getName(p));
    setSelectedPersons(new Set(allNames));
  };

  // ★ 전체 선택 여부 확인
  const isAllSelected = rawData.length > 0 && selectedPersons.size === rawData.length;

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

  // PDF 다운로드 (개인 리포트용)
  const [pdfLoading, setPdfLoading] = useState(false);
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [batchPdfProgress, setBatchPdfProgress] = useState({ current: 0, total: 0, name: '' });

  // 단일 PDF 생성 함수
  const generatePDF = async (person, reportType = 'full') => {
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

    const interactionsData = [
      { key: 'NS-HA', code: `${nsLevel}${haLevel}`, label: 'NS × HA', data: TEMPERAMENT_INTERACTIONS['NS-HA']?.combinations?.[`${nsLevel}${haLevel}`] },
      { key: 'NS-RD', code: `${nsLevel}${rdLevel}`, label: 'NS × RD', data: TEMPERAMENT_INTERACTIONS['NS-RD']?.combinations?.[`${nsLevel}${rdLevel}`] },
      { key: 'HA-RD', code: `${haLevel}${rdLevel}`, label: 'HA × RD', data: TEMPERAMENT_INTERACTIONS['HA-RD']?.combinations?.[`${haLevel}${rdLevel}`] }
    ];

    const tips = [];
    if (tempType?.coachingTips) tips.push({ type: '기질', tip: tempType.coachingTips });
    if (charType?.coachingTips) tips.push({ type: '성격', tip: charType.coachingTips });

    const blob = await pdf(
      <PDFReport
        person={person}
        tempType={tempType}
        charType={charType}
        tempTypeCode={tempTypeCode}
        charTypeCode={charTypeCode}
        scaleTraits={scaleTraits}
        mainScaleTraits={mainScaleTraits}
        interactions={interactionsData}
        coachingTips={tips}
        reportType={reportType}
      />
    ).toBlob();

    return blob;
  };

  // 단일 PDF 다운로드
  const handleDownloadPDF = async (reportType = 'full') => {
    if (selectedPersons.size !== 1) return;
    setShowPdfModal(false);

    const selectedName = Array.from(selectedPersons)[0];
    const person = rawData.find(p => getName(p) === selectedName);
    if (!person) return;

    setPdfLoading(true);

    try {
      const blob = await generatePDF(person, reportType);
      const suffix = reportType === 'indicators' ? '지표' : '전체';
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TCI_${selectedName}_${suffix}리포트.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setPdfLoading(false);
    }
  };

  // 복수 선택 일괄 PDF 다운로드
  const handleBatchDownloadPDF = async (reportType = 'full') => {
    if (selectedPersons.size < 1) return;
    setShowPdfModal(false);

    const selectedNames = Array.from(selectedPersons);
    const total = selectedNames.length;

    setPdfLoading(true);
    setBatchPdfProgress({ current: 0, total, name: '' });

    try {
      for (let i = 0; i < selectedNames.length; i++) {
        const name = selectedNames[i];
        const person = rawData.find(p => getName(p) === name);
        if (!person) continue;

        setBatchPdfProgress({ current: i + 1, total, name });

        const blob = await generatePDF(person, reportType);
        const suffix = reportType === 'indicators' ? '지표' : '전체';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `TCI_${name}_${suffix}리포트.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // 브라우저가 다운로드 처리할 시간 확보
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    } catch (error) {
      console.error('PDF 일괄 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다: ' + error.message);
    } finally {
      setPdfLoading(false);
      setBatchPdfProgress({ current: 0, total: 0, name: '' });
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
                <PolarAngleAxis dataKey="scale" tick={{ fontSize: 16, fill: '#374151', fontWeight: 600 }} />
                <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 13 }} tickCount={6} />
                {rawData.map((p, i) => (
                  <Radar key={getName(p)} name={getName(p)} dataKey={getName(p)}
                    stroke={memberColors[i % memberColors.length]}
                    fill={memberColors[i % memberColors.length]}
                    fillOpacity={isSelected(getName(p)) ? 0.15 : 0.02}
                    strokeWidth={isSelected(getName(p)) ? 2.5 : 0.5}
                    strokeOpacity={isSelected(getName(p)) ? 1 : 0.1}
                  />
                ))}
                <Tooltip contentStyle={{ fontSize: 15, borderRadius: 8 }} />
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
                {currentScales.map(scale => (
                  <button
                    key={scale}
                    onClick={() => toggleCompareScale(scale)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg transition ${
                      compareScales.includes(scale)
                        ? (mainTab === 'temperament' ? 'bg-blue-600' : 'bg-emerald-600') + ' text-white shadow-md'
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
                <ScatterChart margin={{ top: 40, right: 80, bottom: 45, left: 45 }}>
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
                    label={{ value: `${scaleX} (${scaleLabels[scaleX]})`, position: 'right', fontSize: 14, fill: '#374151' }}
                  />
                  {/* 십자가 중심축 - Y축 (세로선) */}
                  <ReferenceLine
                    x={0}
                    stroke="#6B7280"
                    strokeWidth={1.5}
                    label={{ value: `${scaleY} (${scaleLabels[scaleY]})`, position: 'top', fontSize: 14, fill: '#374151' }}
                  />
                  {/* X축 눈금 표시 */}
                  <ReferenceLine x={-50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '0', position: 'bottom', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine x={-25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '25', position: 'bottom', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine x={0} stroke="#6B7280" label={{ value: '50', position: 'bottom', fontSize: 13, fill: '#374151', fontWeight: 600 }} />
                  <ReferenceLine x={25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '75', position: 'bottom', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine x={50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '100', position: 'bottom', fontSize: 13, fill: '#6B7280' }} />
                  {/* Y축 눈금 표시 */}
                  <ReferenceLine y={-50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '0', position: 'left', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine y={-25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '25', position: 'left', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine y={0} stroke="#6B7280" label={{ value: '50', position: 'left', fontSize: 13, fill: '#374151', fontWeight: 600 }} />
                  <ReferenceLine y={25} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '75', position: 'left', fontSize: 13, fill: '#6B7280' }} />
                  <ReferenceLine y={50} stroke="#d1d5db" strokeDasharray="3 3" label={{ value: '100', position: 'left', fontSize: 13, fill: '#6B7280' }} />
                  <ZAxis range={[100, 100]} />
                  <Tooltip
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ fontSize: 15, borderRadius: 8 }}
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
        <div className="w-[35%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          {/* 헤더 + 강점/약점 카드 (차트 위로 이동) */}
          <div className="flex-shrink-0">
            {/* 헤더: 기질=파랑, 성격=녹색 */}
            <div className={`px-4 py-3 ${
              ['NS', 'HA', 'RD', 'PS'].includes(scale)
                ? 'bg-gradient-to-r from-blue-700 to-blue-800'
                : 'bg-gradient-to-r from-emerald-700 to-emerald-800'
            }`}>
              <h3 className="text-lg font-bold text-white">{scaleLabels[scale]}</h3>
              <p className={`text-xs ${['NS', 'HA', 'RD', 'PS'].includes(scale) ? 'text-blue-200' : 'text-emerald-200'}`}>{engLabels[scale]}</p>
              {mainScaleTraits[scale]?.description && (
                <p className="text-xs text-white/80 mt-1 leading-relaxed">{mainScaleTraits[scale].description}</p>
              )}
            </div>
            {/* 강점/약점 카드 - 확대된 레이아웃 */}
            {mainScaleTraits[scale] && (
              <div className="grid grid-cols-2 gap-0 border-b border-gray-200">
                {/* 낮을 때 (왼쪽) */}
                <div className="bg-gradient-to-b from-orange-50 to-orange-100/50 p-4 border-r border-gray-200">
                  {mainScaleTraits[scale].lowPersona && (
                    <div className="mb-3 pb-2 border-b border-orange-200">
                      <div className="font-bold text-orange-800 text-sm">{mainScaleTraits[scale].lowPersona}</div>
                      <div className="text-xs text-orange-600 mt-0.5 leading-relaxed">{mainScaleTraits[scale].lowPersonaDesc}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📉</span>
                    <span className="font-bold text-orange-700 text-sm">낮을 때</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-gray-700 leading-relaxed font-medium">{mainScaleTraits[scale].lowAdv.join(', ')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold text-xs mt-0.5">✗</span>
                      <span className="text-xs text-gray-500 leading-relaxed">{mainScaleTraits[scale].lowDis.join(', ')}</span>
                    </div>
                  </div>
                </div>
                {/* 높을 때 (오른쪽) */}
                <div className="bg-gradient-to-b from-blue-50 to-blue-100/50 p-4">
                  {mainScaleTraits[scale].highPersona && (
                    <div className="mb-3 pb-2 border-b border-blue-200">
                      <div className="font-bold text-blue-800 text-sm">{mainScaleTraits[scale].highPersona}</div>
                      <div className="text-xs text-blue-600 mt-0.5 leading-relaxed">{mainScaleTraits[scale].highPersonaDesc}</div>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">📈</span>
                    <span className="font-bold text-blue-700 text-sm">높을 때</span>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-start gap-2">
                      <span className="text-green-500 font-bold text-xs mt-0.5">✓</span>
                      <span className="text-xs text-gray-700 leading-relaxed font-medium">{mainScaleTraits[scale].highAdv.join(', ')}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-red-400 font-bold text-xs mt-0.5">✗</span>
                      <span className="text-xs text-gray-500 leading-relaxed">{mainScaleTraits[scale].highDis.join(', ')}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* 차트 영역 */}
          <div className="flex-1 min-h-0 p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mainData} margin={{ top: 10, right: 5, left: 5, bottom: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 14, fontWeight: 500 }} angle={-45} textAnchor="end" interval={0} />
                <YAxis domain={[0, 100]} tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v) => [`${v}%`, '백분위']} contentStyle={{ borderRadius: 8, fontSize: 15 }} />
                <ReferenceLine y={30} stroke="#F97316" strokeDasharray="4 4" strokeWidth={2} label={{ value: '30%', position: 'right', fontSize: 13, fill: '#F97316' }} />
                <ReferenceLine y={70} stroke="#3B82F6" strokeDasharray="4 4" strokeWidth={2} label={{ value: '70%', position: 'right', fontSize: 13, fill: '#3B82F6' }} />
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
        </div>

        {/* 우측: 하위지표 가로 막대 */}
        <div className="w-[65%] bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-5 py-3 border-b flex-shrink-0 flex items-center justify-between">
            <h3 className="font-bold text-gray-800">{scale} 하위지표</h3>
            <button
              onClick={() => {
                if (allSubScalesExpanded) {
                  setExpandedSubScales(new Set());
                  setAllSubScalesExpanded(false);
                } else {
                  setExpandedSubScales(new Set(subCodes));
                  setAllSubScalesExpanded(true);
                }
              }}
              className="text-xs px-3 py-1.5 rounded-full border border-gray-300 text-gray-500 hover:bg-gray-200 transition font-medium"
            >
              {allSubScalesExpanded ? '전체 접기' : '전체 펼치기'}
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 min-h-0">
            <div className="space-y-5">
              {subCodes.map(code => {
                const norm = norms[code];
                const traits = scaleTraits[code] || {};
                const lowLabel = traits.lowLabel || subScaleLabels[code];
                const highLabel = traits.highLabel || '';
                const scaleName = traits.name || code;
                const isExpanded = expandedSubScales.has(code);
                return (
                  <div key={code} className="bg-gray-50 rounded-xl p-4">
                    <div
                      className="flex justify-between items-center mb-2 cursor-pointer select-none"
                      onClick={() => {
                        setExpandedSubScales(prev => {
                          const next = new Set(prev);
                          if (next.has(code)) { next.delete(code); } else { next.add(code); }
                          return next;
                        });
                      }}
                    >
                      <span className="text-xs text-gray-500">{lowLabel}</span>
                      <span className="text-sm font-bold text-gray-700 bg-white px-3 py-1 rounded-full shadow-sm flex items-center gap-1">
                        {code} ({scaleName})
                        <span className="text-gray-400 text-xs ml-1">{isExpanded ? '▲' : '▼'}</span>
                      </span>
                      <span className="text-xs text-gray-500">{highLabel}</span>
                    </div>
                    {traits.coreDescription && (
                      <div className="text-xs text-blue-500 text-center mb-3">{traits.coreDescription}</div>
                    )}
                    <div className="space-y-2.5">
                      {rawData.map((p, idx) => {
                        const val = p[code] || 0;
                        const selected = isSelected(getName(p));
                        const isTemperament = ['NS', 'HA', 'RD', 'PS'].includes(scale);
                        // 백분위 계산 → 레벨 판정
                        const pct = Math.round(((val - norm.m) / norm.sd + 3) / 6 * 100);
                        const clampedPct = Math.max(0, Math.min(100, pct));
                        const level = getLevel(clampedPct);

                        // Diverging bar chart for temperament (centered at mean)
                        if (isTemperament) {
                          const deviation = val - norm.m;
                          const maxDev = 10; // 최대 편차 (좌우 각각)
                          const barWidth = Math.min(Math.abs(deviation) / maxDev * 50, 50);
                          const isPositive = deviation >= 0;

                          return (
                            <div key={getName(p)} className="flex items-center gap-2">
                              <span className={`w-14 text-xs font-medium truncate transition ${selected ? 'text-gray-700' : 'text-gray-300'}`}>
                                {getName(p)}
                              </span>
                              <div className="flex-1 h-6 bg-gray-100 rounded relative overflow-hidden">
                                {/* 중앙선 (평균) */}
                                <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10 left-1/2 transform -translate-x-1/2"></div>
                                {/* Diverging bar */}
                                <div
                                  className={`absolute top-0.5 bottom-0.5 rounded transition-all duration-300 ${selected ? '' : 'opacity-20'}`}
                                  style={{
                                    width: `${barWidth}%`,
                                    backgroundColor: memberColors[idx % memberColors.length],
                                    left: isPositive ? '50%' : `${50 - barWidth}%`,
                                  }}
                                />
                              </div>
                              <span className={`w-8 text-xs text-right font-bold transition ${selected ? (deviation >= 0 ? 'text-blue-600' : 'text-orange-500') : 'text-gray-300'}`}>
                                {deviation >= 0 ? '+' : ''}{deviation.toFixed(1)}
                              </span>
                              <span className={`w-7 text-center text-xs font-bold text-white rounded px-1 py-0.5 transition ${selected ? getLevelColor(level) : 'bg-gray-300'}`}>
                                {level}
                              </span>
                            </div>
                          );
                        }

                        // Regular bar for character scales
                        const width = (val / 20) * 100;
                        return (
                          <div key={getName(p)} className="flex items-center gap-2">
                            <span className={`w-14 text-xs font-medium truncate transition ${selected ? 'text-gray-700' : 'text-gray-300'}`}>
                              {getName(p)}
                            </span>
                            <div className="flex-1 h-6 bg-gray-200 rounded-full relative overflow-hidden">
                              <div className="absolute top-0 bottom-0 w-0.5 bg-gray-400 z-10"
                                style={{ left: `${(norm.m / 20) * 100}%` }}></div>
                              <div className={`h-full rounded-full transition-all duration-300 ${selected ? '' : 'opacity-20'}`}
                                style={{ width: `${Math.min(width, 100)}%`, backgroundColor: memberColors[idx % memberColors.length] }}>
                              </div>
                            </div>
                            <span className={`w-6 text-xs text-right font-bold transition ${selected ? 'text-gray-700' : 'text-gray-300'}`}>
                              {val}
                            </span>
                            <span className={`w-7 text-center text-xs font-bold text-white rounded px-1 py-0.5 transition ${selected ? getLevelColor(level) : 'bg-gray-300'}`}>
                              {level}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="text-xs text-gray-400 mt-2 text-center">
                      {['NS', 'HA', 'RD', 'PS'].includes(scale) ? `평균 M=${norm.m} (편차 표시)` : `평균 M=${norm.m}`}
                    </div>
                    {/* 접이식 특성 영역 */}
                    {isExpanded && (traits.lowAdv || traits.highAdv) && (() => {
                      // 선택된 참가자의 평균 레벨로 강조 방향 결정
                      const selectedPersons_ = rawData.filter(p => isSelected(getName(p)));
                      let highlightSide = 'none'; // 'low', 'high', 'none'
                      if (selectedPersons_.length > 0) {
                        const avgPct = selectedPersons_.reduce((sum, p) => {
                          const v = p[code] || 0;
                          const pc = Math.round(((v - norm.m) / norm.sd + 3) / 6 * 100);
                          return sum + Math.max(0, Math.min(100, pc));
                        }, 0) / selectedPersons_.length;
                        highlightSide = avgPct <= 40 ? 'low' : avgPct >= 61 ? 'high' : 'none';
                      }
                      return (
                        <div className="mt-3 pt-3 border-t border-gray-200">
                          <div className="grid grid-cols-2 gap-3">
                            {/* 낮을 때 (우측정렬) */}
                            <div className={`rounded-lg p-3 transition text-right ${highlightSide === 'low' ? 'bg-orange-50 ring-1 ring-orange-200' : 'bg-gray-100 opacity-60'}`}>
                              <div className="text-xs font-bold text-orange-600 mb-2">↓ 낮을 때</div>
                              {traits.lowAdv && (
                                <div className="mb-1.5">
                                  {(Array.isArray(traits.lowAdv) ? traits.lowAdv : traits.lowAdv.split(',')).map((item, i) => (
                                    <div key={i} className="text-xs text-green-700 leading-relaxed">{typeof item === 'string' ? item.trim() : item} ✓</div>
                                  ))}
                                </div>
                              )}
                              {traits.lowDis && (
                                <div>
                                  {(Array.isArray(traits.lowDis) ? traits.lowDis : traits.lowDis.split(',')).map((item, i) => (
                                    <div key={i} className="text-xs text-red-500 leading-relaxed">{typeof item === 'string' ? item.trim() : item} ✗</div>
                                  ))}
                                </div>
                              )}
                            </div>
                            {/* 높을 때 */}
                            <div className={`rounded-lg p-3 transition ${highlightSide === 'high' ? 'bg-blue-50 ring-1 ring-blue-200' : 'bg-gray-100 opacity-60'}`}>
                              <div className="text-xs font-bold text-blue-600 mb-2">↑ 높을 때</div>
                              {traits.highAdv && (
                                <div className="mb-1.5">
                                  {(Array.isArray(traits.highAdv) ? traits.highAdv : traits.highAdv.split(',')).map((item, i) => (
                                    <div key={i} className="text-xs text-green-700 leading-relaxed">✓ {typeof item === 'string' ? item.trim() : item}</div>
                                  ))}
                                </div>
                              )}
                              {traits.highDis && (
                                <div>
                                  {(Array.isArray(traits.highDis) ? traits.highDis : traits.highDis.split(',')).map((item, i) => (
                                    <div key={i} className="text-xs text-red-500 leading-relaxed">✗ {typeof item === 'string' ? item.trim() : item}</div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })()}
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
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-gray-800">선택된 참가자 비교 ({selectedPersons.size}명)</h3>
            <button
              onClick={() => setShowPdfModal(true)}
              disabled={pdfLoading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition text-sm font-medium flex items-center gap-2 ${pdfLoading ? 'opacity-50 cursor-wait' : ''}`}
            >
              {pdfLoading ? (
                <>
                  <span className="animate-spin">⏳</span>
                  {batchPdfProgress.total > 0 ? `${batchPdfProgress.current}/${batchPdfProgress.total}` : 'PDF 생성 중...'}
                </>
              ) : (
                <>📄 PDF 일괄 다운로드</>
              )}
            </button>
          </div>
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

    // PDF 렌더링을 위해 변수 미리 계산 (IIFE 대신)
    const nsLevel = getTScoreLevel(person.NS);
    const haLevel = getTScoreLevel(person.HA);
    const rdLevel = getTScoreLevel(person.RD);
    const sdLevel = getTScoreLevel(person.SD);
    const coLevel = getTScoreLevel(person.CO);
    const stLevel = getTScoreLevel(person.ST);

    const tempTypeCode = `${nsLevel}${haLevel}${rdLevel}`;
    const tempType = TEMPERAMENT_TYPES[tempTypeCode];
    const charTypeCode = `${sdLevel}${coLevel}${stLevel}`;
    const charType = CHARACTER_TYPES[charTypeCode];

    const maturityCheck = checkCharacterGrowthNeeds(person.SD, person.CO);

    const interactions = [
      { key: 'NS-HA', code: `${nsLevel}${haLevel}`, label: 'NS × HA', desc: '탐색성과 불확실성 센서의 상호작용' },
      { key: 'NS-RD', code: `${nsLevel}${rdLevel}`, label: 'NS × RD', desc: '탐색성과 관계 민감성의 상호작용' },
      { key: 'HA-RD', code: `${haLevel}${rdLevel}`, label: 'HA × RD', desc: '불확실성 센서와 관계 민감성의 상호작용' }
    ];

    const coachingTips = [];
    if (tempType?.coachingTips) coachingTips.push({ type: '기질', tip: tempType.coachingTips });
    if (charType?.coachingTips) coachingTips.push({ type: '성격', tip: charType.coachingTips });

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
              onClick={() => setShowPdfModal(true)}
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
        {maturityCheck.warning && (
          <div className={`rounded-2xl p-6 shadow-sm border-2 ${maturityCheck.severity === 'high' ? 'bg-red-50 border-red-300' : 'bg-amber-50 border-amber-300'}`}>
            <div className="flex items-start gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${maturityCheck.severity === 'high' ? 'bg-red-100' : 'bg-amber-100'}`}>
                <span className="text-2xl">⚠️</span>
              </div>
              <div>
                <h3 className={`font-bold text-lg mb-2 ${maturityCheck.severity === 'high' ? 'text-red-700' : 'text-amber-700'}`}>
                  성격 성장 포인트
                </h3>
                <p className={`text-sm ${maturityCheck.severity === 'high' ? 'text-red-600' : 'text-amber-600'}`}>
                  {maturityCheck.message}
                </p>
                {maturityCheck.severity === 'high' && (
                  <p className="text-sm text-red-500 mt-2">
                    코칭과 병행하여 전문 심리상담을 받으시면 더 효과적입니다.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 기질 유형 분석 */}
        {tempType && (
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
                  <span className="font-semibold text-green-700">평소에는</span>
                </div>
                <p className="text-sm text-gray-600">{tempType.strengths}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600">!</span>
                  <span className="font-semibold text-orange-700">때로는</span>
                </div>
                <p className="text-sm text-gray-600">{tempType.weaknesses}</p>
              </div>
            </div>
          </div>
        )}

        {/* 성격 유형 분석 */}
        {charType && (
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
                  <span className="font-semibold text-green-700">평소에는</span>
                </div>
                <p className="text-sm text-gray-600">{charType.strengths}</p>
              </div>
              <div className="bg-orange-50 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-orange-600">!</span>
                  <span className="font-semibold text-orange-700">때로는</span>
                </div>
                <p className="text-sm text-gray-600">{charType.weaknesses}</p>
              </div>
            </div>
          </div>
        )}

        {/* 기질 상호작용 분석 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white text-lg">🔗</span>
            </div>
            <h3 className="font-bold text-gray-800 text-lg">기질 상호작용 분석</h3>
          </div>

          <div className="space-y-4">
            {interactions.map(({ key, code, label, desc }) => {
              const interactionData = TEMPERAMENT_INTERACTIONS[key]?.combinations?.[code];
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
                        const level = getLevel(pct);
                        const traits = scaleTraits[code] || { lowAdv: [], lowDis: [], highAdv: [], highDis: [] };

                        // 레벨별 스타일: VH/H=오른쪽 강조, VL/L=왼쪽 강조, M=양쪽 동일
                        const isLow = level === 'L' || level === 'VL';
                        const isHigh = level === 'H' || level === 'VH';
                        const lowDisStyle = isLow ? 'text-gray-700 font-semibold' : isHigh ? 'text-gray-300' : 'text-gray-400';
                        const lowAdvStyle = isLow ? 'text-gray-800 font-bold' : isHigh ? 'text-gray-300' : 'text-gray-600';
                        const highAdvStyle = isHigh ? 'text-gray-800 font-bold' : isLow ? 'text-gray-300' : 'text-gray-600';
                        const highDisStyle = isHigh ? 'text-gray-700 font-semibold' : isLow ? 'text-gray-300' : 'text-gray-400';

                        return (
                          <tr key={code} className="border-b border-gray-100 hover:bg-gray-50 transition">
                            <td className={`p-3 align-top text-xs ${lowDisStyle}`}>
                              {traits.lowDis.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className={`p-3 align-top text-xs ${lowAdvStyle}`}>
                              {traits.lowAdv.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className="p-3 text-center">
                              {/* lowLabel - code (name) - highLabel */}
                              <div className="flex items-center justify-center gap-2 flex-wrap">
                                <span className="text-xs text-gray-400">{traits.lowLabel}</span>
                                <span className="font-bold text-gray-700">{code} ({traits.name})</span>
                                <span className="text-xs text-gray-400">{traits.highLabel}</span>
                              </div>
                              {/* coreDescription */}
                              <div className="text-xs text-blue-500 mt-1 leading-relaxed">{traits.coreDescription}</div>
                              {/* 점수 */}
                              <div className="mt-2">
                                <span className={`inline-block px-3 py-1 rounded-full text-white text-sm font-bold ${getLevelColor(level)}`}>
                                  {val} ({level})
                                </span>
                              </div>
                            </td>
                            <td className={`p-3 align-top text-xs ${highAdvStyle}`}>
                              {traits.highAdv.map((t, i) => <div key={i} className="mb-1">{t}</div>)}
                            </td>
                            <td className={`p-3 align-top text-xs ${highDisStyle}`}>
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

        {/* AI 개인 코칭 분석 */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-5 mb-4">
            <h4 className="font-bold text-white text-lg">AI 코칭 분석</h4>
            <p className="text-indigo-200 text-xs">TCI 데이터를 기반으로 맞춤형 코칭 가이드를 제공합니다</p>
          </div>

          {individualAiAnalysis && !individualAiLoading && (
            <button onClick={() => { setIndividualAiAnalysis(null); setIndividualAiError(null); }}
              className="text-xs text-gray-400 hover:text-gray-600 mb-3 block">↻ 다시 분석</button>
          )}

          {!individualAiAnalysis && !individualAiLoading && !individualAiError && (
            <div className="text-center py-6">
              <p className="text-gray-500 text-sm mb-4">AI가 이 사람의 TCI 프로필을 분석하여<br/>맞춤형 코칭 가이드를 제공합니다.</p>
              <button
                onClick={() => fetchIndividualAiAnalysis(person)}
                className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white rounded-xl hover:from-indigo-600 hover:to-violet-600 transition font-medium shadow-lg shadow-indigo-500/25">
                AI 코칭 분석 시작
              </button>
            </div>
          )}

          {individualAiLoading && (
            <div className="text-center py-8">
              <div className="animate-spin text-4xl mb-3">🔮</div>
              <p className="text-sm text-indigo-500 font-medium">AI가 분석 중입니다...</p>
            </div>
          )}

          {individualAiError && (
            <div className="bg-red-50 rounded-xl p-4 text-center">
              <p className="text-red-600 text-sm">{individualAiError}</p>
              <button onClick={() => fetchIndividualAiAnalysis(person)}
                className="mt-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm hover:bg-red-200">다시 시도</button>
            </div>
          )}

          {individualAiAnalysis && !individualAiLoading && (
            <div className="space-y-4">
              {parseIndividualAiSections(individualAiAnalysis).map((section, idx) => (
                <div key={idx} className={`${section.bg} border ${section.border} rounded-xl p-4`}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{section.icon}</span>
                    <span className={`font-bold ${section.title}`}>{section.key}</span>
                  </div>
                  <div className={`text-sm leading-relaxed ${section.body}`}
                    dangerouslySetInnerHTML={{ __html: section.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n- /g, '<br/>• ')
                      .replace(/\n/g, '<br/>')
                    }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 코칭 가이드 */}
        {coachingTips.length > 0 && (
          <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-6 shadow-sm border border-indigo-100">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">📋</span>
              </div>
              <h3 className="font-bold text-gray-800 text-lg">종합 코칭 가이드</h3>
            </div>

            <div className="space-y-4">
              {coachingTips.map(({ type, tip }, idx) => (
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
        )}

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
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase">참가자</h3>
            {selectedPersons.size > 0 && (
              <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">{selectedPersons.size}</span>
            )}
          </div>
          {/* 전체 선택/해제 토글 버튼 */}
          <button
            onClick={isAllSelected ? clearSelection : selectAll}
            className={`w-full mb-3 px-3 py-2 text-xs rounded-lg font-medium transition ${
              isAllSelected
                ? 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}>
            {isAllSelected ? '전체 해제' : '전체 선택'}
          </button>
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

      {/* PDF 옵션 모달 */}
      {showPdfModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPdfModal(false)}>
          <div className="bg-white rounded-2xl p-6 w-96 shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gray-800 mb-4">PDF 리포트 다운로드</h3>
            <p className="text-sm text-gray-500 mb-6">
              {selectedPersons.size === 1
                ? `${Array.from(selectedPersons)[0]}님의 리포트를 다운로드합니다.`
                : `선택된 ${selectedPersons.size}명의 리포트를 일괄 다운로드합니다.`}
            </p>
            <div className="space-y-3">
              <button
                onClick={() => selectedPersons.size === 1 ? handleDownloadPDF('indicators') : handleBatchDownloadPDF('indicators')}
                className="w-full px-4 py-3 bg-blue-50 text-blue-700 rounded-xl hover:bg-blue-100 transition text-left"
              >
                <div className="font-semibold">📊 지표 리포트</div>
                <div className="text-xs text-blue-500 mt-1">상위지표 + 하위지표 상세 (2페이지)</div>
              </button>
              <button
                onClick={() => selectedPersons.size === 1 ? handleDownloadPDF('full') : handleBatchDownloadPDF('full')}
                className="w-full px-4 py-3 bg-indigo-50 text-indigo-700 rounded-xl hover:bg-indigo-100 transition text-left"
              >
                <div className="font-semibold">📄 전체 리포트</div>
                <div className="text-xs text-indigo-500 mt-1">지표 + 유형분석 + 상호작용 + 코칭 (3페이지)</div>
              </button>
            </div>
            <button
              onClick={() => setShowPdfModal(false)}
              className="w-full mt-4 px-4 py-2 text-gray-500 hover:text-gray-700 transition text-sm"
            >
              취소
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
