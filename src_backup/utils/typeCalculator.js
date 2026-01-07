/**
 * TCI 유형 계산 유틸리티
 */

/**
 * T점수를 L/M/H 레벨로 변환합니다.
 * @param {number} tScore - T점수
 * @returns {'L' | 'M' | 'H'} 레벨
 */
export function getTScoreLevel(tScore) {
  if (tScore < 45) return 'L';
  if (tScore <= 55) return 'M';
  return 'H';
}

/**
 * 기질 유형 코드를 계산합니다 (NS × HA × RD).
 * @param {Object} member - 멤버 객체 (ns_t, ha_t, rd_t 필요)
 * @returns {string} 3자리 유형 코드 (예: HML)
 */
export function calculateTemperamentType(member) {
  const ns = getTScoreLevel(member.ns_t);
  const ha = getTScoreLevel(member.ha_t);
  const rd = getTScoreLevel(member.rd_t);
  return `${ns}${ha}${rd}`;
}

/**
 * 성격 유형 코드를 계산합니다 (SD × CO × ST).
 * @param {Object} member - 멤버 객체 (sd_t, co_t, st_t 필요)
 * @returns {string} 3자리 유형 코드 (예: HML)
 */
export function calculateCharacterType(member) {
  const sd = getTScoreLevel(member.sd_t);
  const co = getTScoreLevel(member.co_t);
  const st = getTScoreLevel(member.st_t);
  return `${sd}${co}${st}`;
}

/**
 * 모든 유형 코드를 계산합니다.
 * @param {Object} member - 멤버 객체
 * @returns {{ temperament: string, character: string }}
 */
export function calculateAllTypes(member) {
  return {
    temperament: calculateTemperamentType(member),
    character: calculateCharacterType(member),
  };
}

/**
 * 성격 장애 경향성을 확인합니다.
 * @param {number} sd_p - 자율성 백분위
 * @param {number} co_p - 연대감 백분위
 * @returns {{ warning: boolean, severity: 'high' | 'moderate' | 'none', message: string }}
 */
export function checkPersonalityDisorderTendency(sd_p, co_p) {
  const sum = (sd_p || 0) + (co_p || 0);

  if ((sd_p < 30 && co_p < 30) || sum < 30) {
    return {
      warning: true,
      severity: 'high',
      message: '자율성(SD)과 연대감(CO)이 모두 매우 낮습니다. 성격 발달 수준을 면밀히 살펴볼 필요가 있습니다.',
    };
  }

  if (sd_p < 30 || co_p < 30) {
    return {
      warning: true,
      severity: 'moderate',
      message: sd_p < 30
        ? '자율성(SD)이 낮아 자기조절 능력 강화가 필요합니다.'
        : '연대감(CO)이 낮아 대인관계 기술 개발이 필요합니다.',
    };
  }

  return {
    warning: false,
    severity: 'none',
    message: '',
  };
}

/**
 * 멤버의 프로파일 통계를 계산합니다.
 * @param {Object} member - 멤버 객체
 * @returns {Object} 통계 정보
 */
export function calculateProfileStats(member) {
  const scales = ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'];

  const tScores = scales.map((s) => member[`${s}_t`] || 50);
  const percentiles = scales.map((s) => member[`${s}_p`] || 50);

  const avgTScore = tScores.reduce((a, b) => a + b, 0) / tScores.length;
  const avgPercentile = percentiles.reduce((a, b) => a + b, 0) / percentiles.length;

  // 최고/최저 척도 찾기
  let maxScale = scales[0];
  let minScale = scales[0];
  let maxT = tScores[0];
  let minT = tScores[0];

  scales.forEach((s, i) => {
    if (tScores[i] > maxT) {
      maxT = tScores[i];
      maxScale = s;
    }
    if (tScores[i] < minT) {
      minT = tScores[i];
      minScale = s;
    }
  });

  // 기질/성격 평균
  const temperamentAvg = (member.ns_t + member.ha_t + member.rd_t + member.ps_t) / 4;
  const characterAvg = (member.sd_t + member.co_t + member.st_t) / 3;

  return {
    avgTScore: Math.round(avgTScore * 10) / 10,
    avgPercentile: Math.round(avgPercentile * 10) / 10,
    maxScale: maxScale.toUpperCase(),
    minScale: minScale.toUpperCase(),
    temperamentAvg: Math.round(temperamentAvg * 10) / 10,
    characterAvg: Math.round(characterAvg * 10) / 10,
  };
}

/**
 * 그룹의 유형 분포를 계산합니다.
 * @param {Array} members - 멤버 배열
 * @param {'temperament' | 'character'} typeCategory - 유형 카테고리
 * @returns {Object} 유형별 멤버 수
 */
export function calculateTypeDistribution(members, typeCategory = 'temperament') {
  const distribution = {};

  members.forEach((member) => {
    const type =
      typeCategory === 'temperament'
        ? calculateTemperamentType(member)
        : calculateCharacterType(member);

    if (!distribution[type]) {
      distribution[type] = [];
    }
    distribution[type].push(member);
  });

  return distribution;
}

/**
 * 그룹의 평균 프로파일을 계산합니다.
 * @param {Array} members - 멤버 배열
 * @returns {Object} 평균 프로파일
 */
export function calculateGroupAverage(members) {
  if (!members || members.length === 0) return null;

  const scales = ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'];
  const average = {};

  scales.forEach((scale) => {
    const tKey = `${scale}_t`;
    const pKey = `${scale}_p`;

    const tValues = members.map((m) => m[tKey]).filter((v) => v != null);
    const pValues = members.map((m) => m[pKey]).filter((v) => v != null);

    average[tKey] =
      tValues.length > 0
        ? Math.round((tValues.reduce((a, b) => a + b, 0) / tValues.length) * 10) / 10
        : 50;
    average[pKey] =
      pValues.length > 0
        ? Math.round((pValues.reduce((a, b) => a + b, 0) / pValues.length) * 10) / 10
        : 50;
  });

  average.name = '그룹 평균';
  return average;
}

/**
 * 척도별 통계를 계산합니다.
 * @param {Array} members - 멤버 배열
 * @param {string} scale - 척도 코드 (ns, ha, rd, ps, sd, co, st)
 * @returns {Object} 통계 정보
 */
export function calculateScaleStats(members, scale) {
  const tKey = `${scale}_t`;
  const values = members.map((m) => m[tKey]).filter((v) => v != null);

  if (values.length === 0) {
    return { min: 0, max: 0, avg: 0, std: 0 };
  }

  const min = Math.min(...values);
  const max = Math.max(...values);
  const avg = values.reduce((a, b) => a + b, 0) / values.length;

  // 표준편차
  const squaredDiffs = values.map((v) => Math.pow(v - avg, 2));
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  const std = Math.sqrt(avgSquaredDiff);

  return {
    min: Math.round(min * 10) / 10,
    max: Math.round(max * 10) / 10,
    avg: Math.round(avg * 10) / 10,
    std: Math.round(std * 10) / 10,
    count: values.length,
  };
}
