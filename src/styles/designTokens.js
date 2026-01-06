// TCI 디자인 시스템 - 색상, 그림자, 스타일 토큰

// 기질 관련 (블루 계열)
export const TEMPERAMENT_COLORS = {
  primary: '#3B82F6',
  light: '#DBEAFE',
  dark: '#1E40AF',
  gradient: 'from-blue-600 to-blue-700',
  shadow: 'shadow-blue-500/25'
};

// 성격 관련 (그린 계열)
export const CHARACTER_COLORS = {
  primary: '#10B981',
  light: '#D1FAE5',
  dark: '#065F46',
  gradient: 'from-emerald-500 to-emerald-600',
  shadow: 'shadow-emerald-500/25'
};

// 구성원 식별 (10색)
export const MEMBER_COLORS = [
  '#60A5FA', // Blue
  '#F97316', // Orange
  '#A78BFA', // Purple
  '#10B981', // Green
  '#F472B6', // Pink
  '#FBBF24', // Yellow
  '#22D3EE', // Cyan
  '#A3E635', // Lime
  '#EF4444', // Red
  '#818CF8'  // Indigo
];

// 경고 레벨 색상
export const WARNING_COLORS = {
  high: {
    bg: '#FEE2E2',
    border: '#EF4444',
    text: '#991B1B'
  },
  moderate: {
    bg: '#FEF3C7',
    border: '#F59E0B',
    text: '#92400E'
  },
  low: {
    bg: '#DBEAFE',
    border: '#3B82F6',
    text: '#1E40AF'
  }
};

// 버튼 스타일
export const BUTTON_STYLES = {
  primary: 'bg-gradient-to-r from-blue-600 to-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:from-blue-700 hover:to-blue-800 transition-all',
  secondary: 'bg-white text-gray-700 px-6 py-3 rounded-xl font-medium border border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all',
  danger: 'bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-red-500/25 hover:shadow-xl hover:from-red-600 hover:to-red-700 transition-all',
  ghost: 'text-gray-600 px-6 py-3 rounded-xl font-medium hover:bg-gray-100 transition-all'
};

// 카드 스타일
export const CARD_STYLES = {
  base: 'bg-white rounded-2xl shadow-sm border border-gray-100',
  hover: 'hover:shadow-lg hover:border-blue-200 transition-all duration-200',
  selected: 'ring-2 ring-blue-500 border-blue-300'
};

// 탭 스타일
export const TAB_STYLES = {
  container: 'flex gap-2 p-1 bg-gray-100 rounded-xl',
  active: 'px-4 py-2 rounded-lg font-medium transition-all',
  temperament: 'bg-blue-500 text-white shadow-md',
  character: 'bg-emerald-500 text-white shadow-md',
  inactive: 'text-gray-600 hover:bg-white hover:shadow-sm'
};

// 레벨 색상 (L/M/H)
export const LEVEL_COLORS = {
  H: 'bg-blue-500',
  M: 'bg-gray-400',
  L: 'bg-orange-400'
};

// 차트 색상
export const CHART_COLORS = {
  temperament: '#3B82F6',
  character: '#10B981',
  grid: '#e5e7eb',
  axis: '#374151'
};
