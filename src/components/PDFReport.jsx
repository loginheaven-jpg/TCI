import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// 한글 폰트 등록 (Noto Sans KR - woff 포맷)
Font.register({
  family: 'NotoSansKR',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.1.1/files/noto-sans-kr-korean-400-normal.woff',
      fontWeight: 400
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/@fontsource/noto-sans-kr@5.1.1/files/noto-sans-kr-korean-700-normal.woff',
      fontWeight: 700
    },
  ]
});

// 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'NotoSansKR',
    fontSize: 9,
    lineHeight: 1.4,
  },
  // 헤더 - 높이 축소
  header: {
    backgroundColor: '#2563EB',
    padding: 10,
    paddingHorizontal: 14,
    marginBottom: 12,
    borderRadius: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerRight: {
    alignItems: 'flex-end',
  },
  headerTitle: {
    color: '#BFDBFE',
    fontSize: 9,
  },
  headerSubtitle: {
    color: 'white',
    fontSize: 11,
    fontWeight: 700,
  },
  headerName: {
    color: 'white',
    fontSize: 18,
    fontWeight: 700,
  },
  headerInfo: {
    color: '#93C5FD',
    fontSize: 8,
    marginTop: 2,
  },
  // 섹션
  section: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#3B82F6',
  },
  sectionTitleGreen: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1F2937',
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 2,
    borderBottomColor: '#10B981',
  },
  // 상위지표 요약 그리드
  scaleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  scaleItem: {
    width: '13.5%',
    padding: 4,
    paddingTop: 5,
    borderRadius: 4,
    alignItems: 'center',
    marginBottom: 4,
  },
  scaleItemBlue: {
    backgroundColor: '#EFF6FF',
  },
  scaleItemGreen: {
    backgroundColor: '#ECFDF5',
  },
  scaleName: {
    fontSize: 6,
    color: '#6B7280',
    marginBottom: 1,
  },
  scaleValue: {
    fontSize: 11,
    fontWeight: 700,
    marginBottom: 2,
  },
  scaleValueBlue: {
    color: '#2563EB',
  },
  scaleValueGreen: {
    color: '#059669',
  },
  scaleLevel: {
    fontSize: 6,
    color: 'white',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 2,
  },
  levelH: { backgroundColor: '#3B82F6' },
  levelM: { backgroundColor: '#9CA3AF' },
  levelL: { backgroundColor: '#F97316' },
  // 유형 분석 박스
  typeBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 6,
    marginBottom: 6,
  },
  typeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  typeName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#1E40AF',
  },
  typeCode: {
    fontSize: 10,
    fontWeight: 700,
    color: '#3B82F6',
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  typeCodeGreen: {
    color: '#059669',
    backgroundColor: '#D1FAE5',
  },
  typeDescription: {
    fontSize: 8,
    color: '#374151',
    lineHeight: 1.5,
    marginBottom: 8,
  },
  // 평소에는/때로는 박스
  traitRow: {
    flexDirection: 'row',
    gap: 6,
  },
  traitBox: {
    flex: 1,
    padding: 6,
    borderRadius: 4,
  },
  traitBoxGreen: {
    backgroundColor: '#ECFDF5',
  },
  traitBoxOrange: {
    backgroundColor: '#FFF7ED',
  },
  traitLabel: {
    fontSize: 7,
    fontWeight: 700,
    marginBottom: 2,
  },
  traitLabelGreen: {
    color: '#059669',
  },
  traitLabelOrange: {
    color: '#EA580C',
  },
  traitText: {
    fontSize: 7,
    color: '#4B5563',
    lineHeight: 1.4,
  },
  // 상호작용 박스
  interactionBox: {
    backgroundColor: '#F5F3FF',
    padding: 6,
    borderRadius: 4,
    marginBottom: 4,
  },
  interactionLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#7C3AED',
    marginBottom: 2,
  },
  interactionText: {
    fontSize: 7,
    color: '#374151',
    lineHeight: 1.4,
  },
  // 하위지표 테이블
  table: {
    marginTop: 3,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderRadius: 3,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontWeight: 700,
    color: '#374151',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 3,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  tableCell: {
    fontSize: 7,
    color: '#4B5563',
  },
  // 기질 하위지표 컬럼 (평균, 레벨 포함)
  colScaleTemp: { width: '10%', textAlign: 'center' },
  colValueTemp: { width: '14%', textAlign: 'center' },
  colLevelTemp: { width: '8%', textAlign: 'center' },
  colTraitTemp: { width: '34%' },
  // 성격 하위지표 컬럼 (평균, 레벨 없음)
  colScaleChar: { width: '12%', textAlign: 'center' },
  colValueChar: { width: '10%', textAlign: 'center' },
  colTraitChar: { width: '39%' },
  // 레벨 뱃지 (작은 버전)
  levelBadge: {
    fontSize: 6,
    color: 'white',
    paddingHorizontal: 3,
    paddingVertical: 1,
    borderRadius: 2,
  },
  // 하위지표 그룹 타이틀
  subScaleTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#2563EB',
    marginBottom: 3,
    marginTop: 6,
  },
  subScaleTitleGreen: {
    color: '#059669',
  },
  // 코칭 가이드
  coachingBox: {
    backgroundColor: '#F0F9FF',
    padding: 8,
    borderRadius: 4,
    marginBottom: 5,
  },
  coachingLabel: {
    fontSize: 7,
    fontWeight: 700,
    color: '#0369A1',
    marginBottom: 2,
  },
  coachingText: {
    fontSize: 7,
    color: '#374151',
    lineHeight: 1.4,
  },
  // 푸터
  footer: {
    position: 'absolute',
    bottom: 20,
    left: 30,
    right: 30,
    textAlign: 'center',
    fontSize: 7,
    color: '#9CA3AF',
  },
});

// 레벨 계산 함수
const getLevel = (value) => value >= 70 ? 'H' : value <= 30 ? 'L' : 'M';
const getLevelStyle = (level) => level === 'H' ? styles.levelH : level === 'L' ? styles.levelL : styles.levelM;

// 하위척도 레벨 계산 (백분위 기준 - 상위지표와 동일)
const getSubScaleLevel = (value, avg) => {
  // 평균 대비 상대적 위치로 판단
  if (value >= avg * 1.5) return 'H';
  if (value <= avg * 0.5) return 'L';
  return 'M';
};

// 척도 라벨
const scaleLabels = {
  NS: '탐색성', HA: '신중성', RD: '관계민감성', PS: '실행관성력',
  SD: '자기주도성', CO: '관계협력성', ST: '초월지향성'
};

// 하위척도 그룹
const subScaleGroups = {
  NS: ['NS1', 'NS2', 'NS3', 'NS4'],
  HA: ['HA1', 'HA2', 'HA3', 'HA4'],
  RD: ['RD1', 'RD2', 'RD3', 'RD4'],
  PS: ['PS1', 'PS2', 'PS3', 'PS4'],
  SD: ['SD1', 'SD2', 'SD3', 'SD4', 'SD5'],
  CO: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
  ST: ['ST1', 'ST2', 'ST3'],
};

// 하위척도 평균값 (TCI 규준 기반)
const subScaleAverages = {
  NS1: 9.5, NS2: 6.5, NS3: 5.5, NS4: 7.0,
  HA1: 6.5, HA2: 5.5, HA3: 5.0, HA4: 5.5,
  RD1: 8.5, RD2: 5.5, RD3: 6.0, RD4: 5.0,
  PS1: 5.5, PS2: 5.0, PS3: 5.5, PS4: 6.0,
  SD1: 7.5, SD2: 6.5, SD3: 5.0, SD4: 8.0, SD5: 8.0,
  CO1: 8.5, CO2: 5.5, CO3: 6.0, CO4: 7.5, CO5: 8.0,
  ST1: 6.0, ST2: 6.5, ST3: 5.0,
};

// PDF 문서 컴포넌트
// reportType: 'full' (전체) | 'indicators' (지표만)
const PDFReport = ({ person, tempType, charType, tempTypeCode, charTypeCode, scaleTraits, interactions, coachingTips, reportType = 'full' }) => {
  const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
  const characterScales = ['SD', 'CO', 'ST'];
  const allScales = [...temperamentScales, ...characterScales];

  // 유효한 상호작용만 필터링
  const validInteractions = (interactions || []).filter(i => i.data && i.data.description);

  // 지표만 리포트 (간단 버전)
  if (reportType === 'indicators') {
    return (
      <Document>
        {/* 1페이지: 헤더 + 상위지표 + 하위지표(기질) */}
        <Page size="A4" style={styles.page}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <Text style={styles.headerTitle}>TCI 기질 및 성격검사</Text>
              <Text style={styles.headerSubtitle}>지표 리포트</Text>
              <Text style={styles.headerInfo}>
                {person.gender === 'F' ? '여성' : '남성'} / {person.age}세 · 검사일: {new Date().toLocaleDateString('ko-KR')}
              </Text>
            </View>
            <View style={styles.headerRight}>
              <Text style={styles.headerName}>{person.name || '익명'}</Text>
            </View>
          </View>

          {/* 상위지표 요약 */}
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>상위지표 요약</Text>
            <View style={styles.scaleGrid}>
              {allScales.map(scale => {
                const val = person[scale] || 0;
                const level = getLevel(val);
                const isTemp = temperamentScales.includes(scale);
                return (
                  <View key={scale} style={[styles.scaleItem, isTemp ? styles.scaleItemBlue : styles.scaleItemGreen]}>
                    <Text style={styles.scaleName}>{scaleLabels[scale]}</Text>
                    <Text style={[styles.scaleValue, isTemp ? styles.scaleValueBlue : styles.scaleValueGreen]}>{val}%</Text>
                    <Text style={[styles.scaleLevel, getLevelStyle(level)]}>{level}</Text>
                  </View>
                );
              })}
            </View>
          </View>

          {/* 하위지표 - 기질 */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>하위지표 상세 분석 (기질)</Text>
            {temperamentScales.map(scale => (
              <View key={scale} wrap={false}>
                <Text style={styles.subScaleTitle}>{scale} - {scaleLabels[scale]}</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colScaleTemp]}>척도</Text>
                    <Text style={[styles.tableHeaderCell, styles.colValueTemp]}>점수(평균)</Text>
                    <Text style={[styles.tableHeaderCell, styles.colLevelTemp]}>수준</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTraitTemp]}>낮을 때</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTraitTemp]}>높을 때</Text>
                  </View>
                  {subScaleGroups[scale].map(code => {
                    const val = person[code] || 0;
                    const avg = subScaleAverages[code] || 10;
                    const level = getSubScaleLevel(val, avg);
                    const traits = scaleTraits[code] || { lowAdv: [], highAdv: [] };
                    return (
                      <View key={code} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colScaleTemp, { fontWeight: 700 }]}>{code}</Text>
                        <Text style={[styles.tableCell, styles.colValueTemp]}>{val}({avg})</Text>
                        <View style={[styles.colLevelTemp, { alignItems: 'center' }]}>
                          <Text style={[styles.levelBadge, getLevelStyle(level)]}>{level}</Text>
                        </View>
                        <Text style={[styles.tableCell, styles.colTraitTemp]}>{traits.lowAdv?.join(', ') || '-'}</Text>
                        <Text style={[styles.tableCell, styles.colTraitTemp]}>{traits.highAdv?.join(', ') || '-'}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>TCI 기질 및 성격검사 지표 리포트</Text>
        </Page>

        {/* 2페이지: 하위지표(성격) */}
        <Page size="A4" style={styles.page}>
          <View style={styles.section}>
            <Text style={styles.sectionTitleGreen}>하위지표 상세 분석 (성격)</Text>
            {characterScales.map(scale => (
              <View key={scale} wrap={false}>
                <Text style={[styles.subScaleTitle, styles.subScaleTitleGreen]}>{scale} - {scaleLabels[scale]}</Text>
                <View style={styles.table}>
                  <View style={styles.tableHeader}>
                    <Text style={[styles.tableHeaderCell, styles.colScaleChar]}>척도</Text>
                    <Text style={[styles.tableHeaderCell, styles.colValueChar]}>점수</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTraitChar]}>낮을 때</Text>
                    <Text style={[styles.tableHeaderCell, styles.colTraitChar]}>높을 때</Text>
                  </View>
                  {subScaleGroups[scale].map(code => {
                    const val = person[code] || 0;
                    const traits = scaleTraits[code] || { lowAdv: [], highAdv: [] };
                    return (
                      <View key={code} style={styles.tableRow}>
                        <Text style={[styles.tableCell, styles.colScaleChar, { fontWeight: 700 }]}>{code}</Text>
                        <Text style={[styles.tableCell, styles.colValueChar]}>{val}</Text>
                        <Text style={[styles.tableCell, styles.colTraitChar]}>{traits.lowAdv?.join(', ') || '-'}</Text>
                        <Text style={[styles.tableCell, styles.colTraitChar]}>{traits.highAdv?.join(', ') || '-'}</Text>
                      </View>
                    );
                  })}
                </View>
              </View>
            ))}
          </View>

          <Text style={styles.footer}>TCI 기질 및 성격검사 지표 리포트</Text>
        </Page>
      </Document>
    );
  }

  // 전체 리포트 (기존)
  return (
    <Document>
      {/* 1페이지: 헤더 + 상위지표 + 유형분석 + 상호작용 */}
      <Page size="A4" style={styles.page}>
        {/* 헤더 - 이름을 우측으로 */}
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>TCI 기질 및 성격검사</Text>
            <Text style={styles.headerSubtitle}>결과 리포트</Text>
            <Text style={styles.headerInfo}>
              {person.gender === 'F' ? '여성' : '남성'} / {person.age}세 · 검사일: {new Date().toLocaleDateString('ko-KR')}
            </Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.headerName}>{person.name || '익명'}</Text>
          </View>
        </View>

        {/* 상위지표 요약 */}
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>상위지표 요약</Text>
          <View style={styles.scaleGrid}>
            {allScales.map(scale => {
              const val = person[scale] || 0;
              const level = getLevel(val);
              const isTemp = temperamentScales.includes(scale);
              return (
                <View key={scale} style={[styles.scaleItem, isTemp ? styles.scaleItemBlue : styles.scaleItemGreen]}>
                  <Text style={styles.scaleName}>{scaleLabels[scale]}</Text>
                  <Text style={[styles.scaleValue, isTemp ? styles.scaleValueBlue : styles.scaleValueGreen]}>{val}%</Text>
                  <Text style={[styles.scaleLevel, getLevelStyle(level)]}>{level}</Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* 기질 유형 분석 */}
        {tempType && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>기질 유형 분석 (NS × HA × RD)</Text>
            <View style={styles.typeBox}>
              <View style={styles.typeHeader}>
                <Text style={styles.typeName}>{tempType.name}</Text>
                <Text style={styles.typeCode}>{tempTypeCode}</Text>
              </View>
              <Text style={styles.typeDescription}>{tempType.description}</Text>
              <View style={styles.traitRow}>
                <View style={[styles.traitBox, styles.traitBoxGreen]}>
                  <Text style={[styles.traitLabel, styles.traitLabelGreen]}>평소에는</Text>
                  <Text style={styles.traitText}>{tempType.strengths}</Text>
                </View>
                <View style={[styles.traitBox, styles.traitBoxOrange]}>
                  <Text style={[styles.traitLabel, styles.traitLabelOrange]}>때로는</Text>
                  <Text style={styles.traitText}>{tempType.weaknesses}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 성격 유형 분석 */}
        {charType && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitleGreen}>성격 유형 분석 (SD × CO × ST)</Text>
            <View style={styles.typeBox}>
              <View style={styles.typeHeader}>
                <Text style={[styles.typeName, { color: '#059669' }]}>{charType.name}</Text>
                <Text style={[styles.typeCode, styles.typeCodeGreen]}>{charTypeCode}</Text>
              </View>
              <Text style={styles.typeDescription}>{charType.description}</Text>
              <View style={styles.traitRow}>
                <View style={[styles.traitBox, styles.traitBoxGreen]}>
                  <Text style={[styles.traitLabel, styles.traitLabelGreen]}>평소에는</Text>
                  <Text style={styles.traitText}>{charType.strengths}</Text>
                </View>
                <View style={[styles.traitBox, styles.traitBoxOrange]}>
                  <Text style={[styles.traitLabel, styles.traitLabelOrange]}>때로는</Text>
                  <Text style={styles.traitText}>{charType.weaknesses}</Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* 기질 상호작용 분석 - 1페이지에 포함 */}
        {validInteractions.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>기질 상호작용 분석</Text>
            {validInteractions.map((interaction, idx) => (
              <View key={idx} style={styles.interactionBox}>
                <Text style={styles.interactionLabel}>
                  {interaction.label}: {interaction.code}
                </Text>
                <Text style={styles.interactionText}>{interaction.data.description}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>TCI 기질 및 성격검사 결과 리포트</Text>
      </Page>

      {/* 2페이지: 하위지표 상세 분석 (기질) - 평균값 + H/L/M 포함 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>하위지표 상세 분석 (기질)</Text>

          {temperamentScales.map(scale => (
            <View key={scale} wrap={false}>
              <Text style={styles.subScaleTitle}>{scale} - {scaleLabels[scale]}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.colScaleTemp]}>척도</Text>
                  <Text style={[styles.tableHeaderCell, styles.colValueTemp]}>점수(평균)</Text>
                  <Text style={[styles.tableHeaderCell, styles.colLevelTemp]}>수준</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTraitTemp]}>낮을 때</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTraitTemp]}>높을 때</Text>
                </View>
                {subScaleGroups[scale].map(code => {
                  const val = person[code] || 0;
                  const avg = subScaleAverages[code] || 10;
                  const level = getSubScaleLevel(val, avg);
                  const traits = scaleTraits[code] || { lowAdv: [], highAdv: [] };
                  return (
                    <View key={code} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.colScaleTemp, { fontWeight: 700 }]}>{code}</Text>
                      <Text style={[styles.tableCell, styles.colValueTemp]}>{val}({avg})</Text>
                      <View style={[styles.colLevelTemp, { alignItems: 'center' }]}>
                        <Text style={[styles.levelBadge, getLevelStyle(level)]}>{level}</Text>
                      </View>
                      <Text style={[styles.tableCell, styles.colTraitTemp]}>{traits.lowAdv?.join(', ') || '-'}</Text>
                      <Text style={[styles.tableCell, styles.colTraitTemp]}>{traits.highAdv?.join(', ') || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>TCI 기질 및 성격검사 결과 리포트</Text>
      </Page>

      {/* 3페이지: 하위지표 상세 분석 (성격) + 코칭 가이드 - H/L/M 없음 */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitleGreen}>하위지표 상세 분석 (성격)</Text>

          {characterScales.map(scale => (
            <View key={scale} wrap={false}>
              <Text style={[styles.subScaleTitle, styles.subScaleTitleGreen]}>{scale} - {scaleLabels[scale]}</Text>
              <View style={styles.table}>
                <View style={styles.tableHeader}>
                  <Text style={[styles.tableHeaderCell, styles.colScaleChar]}>척도</Text>
                  <Text style={[styles.tableHeaderCell, styles.colValueChar]}>점수</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTraitChar]}>낮을 때</Text>
                  <Text style={[styles.tableHeaderCell, styles.colTraitChar]}>높을 때</Text>
                </View>
                {subScaleGroups[scale].map(code => {
                  const val = person[code] || 0;
                  const traits = scaleTraits[code] || { lowAdv: [], highAdv: [] };
                  return (
                    <View key={code} style={styles.tableRow}>
                      <Text style={[styles.tableCell, styles.colScaleChar, { fontWeight: 700 }]}>{code}</Text>
                      <Text style={[styles.tableCell, styles.colValueChar]}>{val}</Text>
                      <Text style={[styles.tableCell, styles.colTraitChar]}>{traits.lowAdv?.join(', ') || '-'}</Text>
                      <Text style={[styles.tableCell, styles.colTraitChar]}>{traits.highAdv?.join(', ') || '-'}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          ))}
        </View>

        {/* 코칭 가이드 */}
        {coachingTips && coachingTips.length > 0 && (
          <View style={styles.section} wrap={false}>
            <Text style={styles.sectionTitle}>종합 코칭 가이드</Text>
            {coachingTips.map((item, idx) => (
              <View key={idx} style={styles.coachingBox}>
                <Text style={styles.coachingLabel}>{item.type} 코칭</Text>
                <Text style={styles.coachingText}>{item.tip}</Text>
              </View>
            ))}
          </View>
        )}

        <Text style={styles.footer}>TCI 기질 및 성격검사 결과 리포트</Text>
      </Page>
    </Document>
  );
};

export default PDFReport;
