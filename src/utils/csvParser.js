import Papa from 'papaparse';

// CSV 필수 컬럼 정의
export const CSV_COLUMNS = {
  required: ['name'],
  scales: ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'],
  suffixes: ['_t', '_p'], // T점수, 백분위
  subscales: {
    ns: ['ns1', 'ns2', 'ns3', 'ns4'],
    ha: ['ha1', 'ha2', 'ha3', 'ha4'],
    rd: ['rd1', 'rd2', 'rd3'],
    ps: ['ps1', 'ps2', 'ps3', 'ps4'],
    sd: ['sd1', 'sd2', 'sd3', 'sd4', 'sd5'],
    co: ['co1', 'co2', 'co3', 'co4', 'co5'],
    st: ['st1', 'st2', 'st3'],
  },
};

/**
 * CSV 텍스트를 파싱합니다.
 * @param {string} csvText - CSV 텍스트
 * @returns {{ data: Array, errors: Array }}
 */
export function parseCSV(csvText) {
  const errors = [];

  try {
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim().toLowerCase(),
      transform: (value) => value.trim(),
    });

    if (result.errors.length > 0) {
      result.errors.forEach((err) => {
        errors.push(`행 ${err.row + 1}: ${err.message}`);
      });
    }

    // 필수 컬럼 확인
    const headers = result.meta.fields || [];
    const missingColumns = [];

    // name 컬럼 확인
    if (!headers.includes('name')) {
      missingColumns.push('name');
    }

    // 주 척도 컬럼 확인 (T점수)
    CSV_COLUMNS.scales.forEach((scale) => {
      if (!headers.includes(`${scale}_t`)) {
        missingColumns.push(`${scale}_t`);
      }
    });

    if (missingColumns.length > 0) {
      errors.push(`필수 컬럼이 누락되었습니다: ${missingColumns.join(', ')}`);
    }

    return { data: result.data, errors };
  } catch (err) {
    errors.push('CSV 파싱 중 오류가 발생했습니다.');
    return { data: [], errors };
  }
}

/**
 * 파싱된 데이터의 유효성을 검증합니다.
 * @param {Array} data - 파싱된 CSV 데이터
 * @returns {{ validData: Array, errors: Array }}
 */
export function validateTCIData(data) {
  const errors = [];
  const validData = [];

  data.forEach((row, idx) => {
    const rowNum = idx + 2; // 헤더 + 0-indexed
    const rowErrors = [];

    // 이름 확인
    if (!row.name || row.name.trim() === '') {
      rowErrors.push('이름이 비어있습니다');
    }

    // 주 척도 T점수 확인
    const member = {
      name: row.name?.trim() || `Unknown_${rowNum}`,
    };

    let hasValidScores = true;
    CSV_COLUMNS.scales.forEach((scale) => {
      const tKey = `${scale}_t`;
      const pKey = `${scale}_p`;

      const tScore = parseFloat(row[tKey]);
      const pScore = row[pKey] !== undefined ? parseFloat(row[pKey]) : null;

      if (isNaN(tScore)) {
        rowErrors.push(`${scale.toUpperCase()} T점수가 유효하지 않습니다`);
        hasValidScores = false;
      } else {
        member[tKey] = tScore;
        member[pKey] = !isNaN(pScore) ? pScore : tScoreToPercentile(tScore);
      }
    });

    // 하위척도 파싱 (선택적)
    Object.entries(CSV_COLUMNS.subscales).forEach(([scale, subscales]) => {
      subscales.forEach((sub) => {
        if (row[sub] !== undefined && row[sub] !== '') {
          const value = parseFloat(row[sub]);
          if (!isNaN(value)) {
            member[sub] = value;
          }
        }
      });
    });

    if (rowErrors.length > 0) {
      errors.push(`행 ${rowNum}: ${rowErrors.join(', ')}`);
    }

    if (hasValidScores && row.name) {
      validData.push(member);
    }
  });

  return { validData, errors };
}

/**
 * T점수를 백분위로 변환합니다 (근사치).
 * @param {number} tScore - T점수
 * @returns {number} 백분위
 */
export function tScoreToPercentile(tScore) {
  // T점수 50이 백분위 50, 표준편차 10
  // Z = (T - 50) / 10
  const z = (tScore - 50) / 10;

  // 정규분포 CDF 근사
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = z < 0 ? -1 : 1;
  const absZ = Math.abs(z);

  const t = 1.0 / (1.0 + p * absZ);
  const y = 1.0 - ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absZ * absZ / 2);

  const cdf = (1.0 + sign * y) / 2.0;
  return Math.round(cdf * 100);
}

/**
 * 멤버 데이터를 CSV 문자열로 변환합니다.
 * @param {Array} members - 멤버 배열
 * @returns {string} CSV 문자열
 */
export function membersToCSV(members) {
  if (!members || members.length === 0) return '';

  // 헤더 구성
  const headers = ['name'];
  CSV_COLUMNS.scales.forEach((scale) => {
    headers.push(`${scale}_t`, `${scale}_p`);
  });

  // 데이터 행 구성
  const rows = members.map((member) => {
    const row = [member.name];
    CSV_COLUMNS.scales.forEach((scale) => {
      row.push(member[`${scale}_t`] || '', member[`${scale}_p`] || '');
    });
    return row;
  });

  return Papa.unparse({
    fields: headers,
    data: rows,
  });
}

/**
 * CSV 샘플 템플릿을 생성합니다.
 * @returns {string} CSV 템플릿 문자열
 */
export function generateCSVTemplate() {
  const headers = ['name'];
  CSV_COLUMNS.scales.forEach((scale) => {
    headers.push(`${scale}_t`, `${scale}_p`);
  });

  // 샘플 데이터
  const sampleData = [
    ['홍길동', 55, 69, 48, 42, 52, 58, 45, 31, 62, 88, 58, 79, 50, 50],
    ['김영희', 42, 21, 58, 79, 48, 42, 55, 69, 48, 42, 52, 58, 62, 88],
  ];

  return Papa.unparse({
    fields: headers,
    data: sampleData,
  });
}
