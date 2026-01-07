/**
 * PDF 생성 유틸리티
 */

/**
 * HTML 요소를 PDF로 변환합니다.
 * @param {HTMLElement} element - 변환할 HTML 요소
 * @param {string} filename - 저장할 파일명
 * @param {Object} options - 옵션
 */
export async function generatePDF(element, filename = 'report.pdf', options = {}) {
  const html2pdf = (await import('html2pdf.js')).default;

  const defaultOptions = {
    margin: [10, 10, 10, 10],
    filename: filename,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
      logging: false,
    },
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
    pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
  };

  const mergedOptions = { ...defaultOptions, ...options };

  try {
    await html2pdf().set(mergedOptions).from(element).save();
    return { success: true };
  } catch (error) {
    console.error('PDF 생성 실패:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 개인 리포트 PDF를 생성합니다.
 * @param {HTMLElement} reportElement - 리포트 요소
 * @param {string} memberName - 멤버 이름
 */
export async function generateIndividualReportPDF(reportElement, memberName) {
  const filename = `TCI_개인리포트_${memberName}_${formatDate(new Date())}.pdf`;

  return generatePDF(reportElement, filename, {
    margin: [15, 15, 15, 15],
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'portrait',
    },
  });
}

/**
 * 그룹 분석 리포트 PDF를 생성합니다.
 * @param {HTMLElement} reportElement - 리포트 요소
 * @param {string} groupName - 그룹 이름
 */
export async function generateGroupReportPDF(reportElement, groupName) {
  const filename = `TCI_그룹분석_${groupName}_${formatDate(new Date())}.pdf`;

  return generatePDF(reportElement, filename, {
    margin: [10, 10, 10, 10],
    jsPDF: {
      unit: 'mm',
      format: 'a4',
      orientation: 'landscape',
    },
  });
}

/**
 * 날짜를 포맷팅합니다.
 * @param {Date} date - 날짜
 * @returns {string} 포맷된 날짜 문자열
 */
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

/**
 * PDF 프린트용 스타일을 적용합니다.
 * @param {HTMLElement} element - 대상 요소
 */
export function applyPrintStyles(element) {
  // 페이지 브레이크 방지 요소 추가
  const cards = element.querySelectorAll('.card, [data-pdf-section]');
  cards.forEach((card) => {
    card.style.pageBreakInside = 'avoid';
  });

  // 그래프/차트 요소 보존
  const charts = element.querySelectorAll('.recharts-wrapper, canvas');
  charts.forEach((chart) => {
    chart.style.pageBreakInside = 'avoid';
  });

  return element;
}

/**
 * PDF 내보내기 버튼 클릭 핸들러
 * @param {string} elementId - 내보낼 요소 ID
 * @param {string} filename - 파일명
 */
export async function handleExportPDF(elementId, filename) {
  const element = document.getElementById(elementId);
  if (!element) {
    console.error('PDF 생성 대상 요소를 찾을 수 없습니다:', elementId);
    return { success: false, error: '대상 요소를 찾을 수 없습니다.' };
  }

  // 클론하여 스타일 적용
  const clone = element.cloneNode(true);
  applyPrintStyles(clone);

  // 임시 컨테이너 생성
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.top = '0';
  container.appendChild(clone);
  document.body.appendChild(container);

  try {
    const result = await generatePDF(clone, filename);
    return result;
  } finally {
    document.body.removeChild(container);
  }
}
