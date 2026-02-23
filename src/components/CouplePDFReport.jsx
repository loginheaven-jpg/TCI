import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import {
  RELATIONSHIP_TYPES, TEMPERAMENT_DYNAMICS, CHARACTER_INTERACTIONS,
  COMMUNICATION_RULES, CONFLICT_RESOLUTION_STEPS, GROWTH_ROADMAP,
  getCoupleLevel, toInterpretLevel, getLevelLabel,
  getGapCategory, getCombinationKey, getGapLabel
} from '../data/coupleInterpretations';

// ========================================
// 색상 상수
// ========================================
const COLOR_A = '#60A5FA';
const COLOR_B = '#F97316';
const ROSE_DARK = '#9F1239';
const ROSE_LIGHT = '#FFF1F2';

const LEVEL_COLORS = { VH: '#4F46E5', H: '#3B82F6', M: '#9CA3AF', L: '#F97316', VL: '#EF4444' };
const GAP_COLORS = { similar: { bg: '#DCFCE7', text: '#15803D' }, moderate: { bg: '#FEF9C3', text: '#A16207' }, contrast: { bg: '#FEE2E2', text: '#B91C1C' } };

// ========================================
// 스타일
// ========================================
const s = StyleSheet.create({
  page: { padding: 30, fontFamily: 'NotoSansKR', fontSize: 8, lineHeight: 1.4, position: 'relative' },
  footer: { position: 'absolute', bottom: 18, left: 30, right: 30, textAlign: 'center', fontSize: 6, color: '#9CA3AF' },

  // 커버 헤더
  coverHeader: { backgroundColor: ROSE_DARK, borderRadius: 8, padding: 16, marginBottom: 14, alignItems: 'center' },
  coverTitle: { color: '#FECDD3', fontSize: 9, marginBottom: 2 },
  coverMain: { color: 'white', fontSize: 18, fontWeight: 700, marginBottom: 4 },
  coverNames: { color: 'white', fontSize: 13, fontWeight: 700, marginBottom: 6 },
  coverMeta: { color: '#FDA4AF', fontSize: 7 },

  // 섹션
  sectionTitle: { fontSize: 10, fontWeight: 700, color: '#1F2937', marginBottom: 5, paddingBottom: 3, borderBottomWidth: 2, borderBottomColor: ROSE_DARK },
  sectionTitleBlue: { borderBottomColor: '#3B82F6' },
  sectionTitleGreen: { borderBottomColor: '#10B981' },
  sectionTitlePurple: { borderBottomColor: '#7C3AED' },
  subTitle: { fontSize: 8, fontWeight: 700, color: '#374151', marginBottom: 3, marginTop: 8 },

  // 테이블
  tableHeader: { flexDirection: 'row', backgroundColor: '#F3F4F6', paddingVertical: 3, paddingHorizontal: 4, borderRadius: 3 },
  tableHeaderCell: { fontSize: 6, fontWeight: 700, color: '#374151', textAlign: 'center' },
  tableRow: { flexDirection: 'row', paddingVertical: 3, paddingHorizontal: 4, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB', alignItems: 'center' },
  tableCell: { fontSize: 7, color: '#4B5563', textAlign: 'center' },

  // 뱃지
  levelBadge: { fontSize: 5, color: 'white', paddingHorizontal: 4, paddingVertical: 1, borderRadius: 2, textAlign: 'center' },
  gapBadge: { fontSize: 6, paddingHorizontal: 5, paddingVertical: 1, borderRadius: 8, textAlign: 'center', fontWeight: 700 },

  // 요약 뱃지 행
  summaryRow: { flexDirection: 'row', gap: 8, marginTop: 6, marginBottom: 8 },
  summaryBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10, flexDirection: 'row', alignItems: 'center' },

  // 2단 레이아웃
  twoCol: { flexDirection: 'row', gap: 8 },
  colHalf: { flex: 1 },

  // 색상 박스
  box: { padding: 8, borderRadius: 6, marginBottom: 5 },
  boxGreen: { backgroundColor: '#ECFDF5', borderWidth: 0.5, borderColor: '#A7F3D0' },
  boxAmber: { backgroundColor: '#FFFBEB', borderWidth: 0.5, borderColor: '#FDE68A' },
  boxRed: { backgroundColor: '#FEF2F2', borderWidth: 0.5, borderColor: '#FECACA' },
  boxBlue: { backgroundColor: '#EFF6FF', borderWidth: 0.5, borderColor: '#BFDBFE' },
  boxOrange: { backgroundColor: '#FFF7ED', borderWidth: 0.5, borderColor: '#FED7AA' },
  boxPurple: { backgroundColor: '#F5F3FF', borderWidth: 0.5, borderColor: '#DDD6FE' },
  boxRose: { backgroundColor: ROSE_LIGHT, borderWidth: 0.5, borderColor: '#FECDD3' },
  boxEmerald: { backgroundColor: '#ECFDF5', borderWidth: 0.5, borderColor: '#6EE7B7' },

  boxLabel: { fontSize: 7, fontWeight: 700, marginBottom: 2 },
  boxText: { fontSize: 6.5, color: '#374151', lineHeight: 1.5 },

  // 바 차트
  barContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 3 },
  barLabel: { width: 55, fontSize: 6, color: '#6B7280' },
  barTrack: { flex: 1, height: 8, backgroundColor: '#F3F4F6', borderRadius: 4, overflow: 'hidden', position: 'relative' },
  barFill: { height: '100%', borderRadius: 4 },
  barValue: { width: 25, fontSize: 6, fontWeight: 700, textAlign: 'right', color: '#374151' },

  // 점수 비교 바
  scoreBar: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 4 },
  scoreName: { width: 50, fontSize: 6, fontWeight: 700 },
  scoreTrack: { flex: 1, height: 10, backgroundColor: '#F3F4F6', borderRadius: 5, overflow: 'hidden' },
  scoreFill: { height: '100%', borderRadius: 5, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 3 },
  scoreValue: { fontSize: 5, color: 'white', fontWeight: 700 },

  // 척도 블록
  scaleBlock: { marginBottom: 10, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#E5E7EB' },
  scaleHeader: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  scaleName: { fontSize: 9, fontWeight: 700, color: '#1F2937' },

  // 번호 원
  numberCircle: { width: 16, height: 16, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  numberText: { fontSize: 7, fontWeight: 700, color: 'white' },

  // 로드맵
  roadmapItem: { flexDirection: 'row', gap: 8, marginBottom: 6, alignItems: 'flex-start' },
  weekBadge: { backgroundColor: '#DDD6FE', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 8 },
  weekText: { fontSize: 6, fontWeight: 700, color: '#6D28D9' },

  // 마무리
  closingBox: { backgroundColor: '#FFF1F2', borderRadius: 8, padding: 14, marginTop: 10, alignItems: 'center' },
  closingTitle: { fontSize: 10, fontWeight: 700, color: ROSE_DARK, marginBottom: 6 },
  closingText: { fontSize: 7, color: '#4B5563', lineHeight: 1.6, textAlign: 'center' },
});

// ========================================
// 헬퍼
// ========================================
const scaleLabels = {
  NS: '탐색성', HA: '불확실성 센서', RD: '관계 민감성', PS: '실행 일관성',
  SD: '자율성', CO: '협력성', ST: '자기초월'
};
const allScales = ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'];
const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
const characterScales = ['SD', 'CO'];

const replaceNames = (text, nameA, nameB) => {
  if (!text) return '';
  return text.replace(/A님/g, `${nameA}님`).replace(/B님/g, `${nameB}님`);
};

const LevelBadge = ({ level }) => (
  <Text style={[s.levelBadge, { backgroundColor: LEVEL_COLORS[level] || LEVEL_COLORS.M }]}>{getLevelLabel(level)}</Text>
);

const GapBadge = ({ category, gap }) => {
  const c = GAP_COLORS[category] || GAP_COLORS.moderate;
  return <Text style={[s.gapBadge, { backgroundColor: c.bg, color: c.text }]}>{gap} {getGapLabel(category)}</Text>;
};

// ========================================
// 메인 컴포넌트
// ========================================
const CouplePDFReport = ({ personA, personB, relationshipType, mainScaleTraits }) => {
  const relType = RELATIONSHIP_TYPES[relationshipType] || RELATIONSHIP_TYPES.COUPLE;
  const nameA = personA.name || 'A';
  const nameB = personB.name || 'B';

  // 분석 데이터 계산
  const analysis = {};
  allScales.forEach(sc => {
    const scoreA = personA[sc] || 0;
    const scoreB = personB[sc] || 0;
    const levelA = getCoupleLevel(scoreA);
    const levelB = getCoupleLevel(scoreB);
    const gap = Math.abs(scoreA - scoreB);
    const gapCategory = getGapCategory(scoreA, scoreB);
    const combinationKey = getCombinationKey(levelA, levelB);
    analysis[sc] = { scoreA, scoreB, levelA, levelB, gap, gapCategory, combinationKey };
  });

  const similarScales = allScales.filter(sc => analysis[sc].gapCategory === 'similar');
  const contrastScales = allScales.filter(sc => analysis[sc].gapCategory === 'contrast');
  const overallGap = Math.round(allScales.reduce((sum, sc) => sum + analysis[sc].gap, 0) / allScales.length);

  // 핵심 역동
  const highestA = temperamentScales.reduce((a, b) => (personA[a] > personA[b]) ? a : b);
  const highestB = temperamentScales.reduce((a, b) => (personB[a] > personB[b]) ? a : b);
  const personaA = mainScaleTraits?.[highestA]?.highPersona || scaleLabels[highestA];
  const personaB = mainScaleTraits?.[highestB]?.highPersona || scaleLabels[highestB];
  const coreDynamic = `${personaA}와 ${personaB}의 만남`;

  // 소통 팁
  const getTips = (target) => {
    const highest = temperamentScales.reduce((a, b) => (target[a] > target[b]) ? a : b);
    const level5 = getCoupleLevel(target[highest]);
    const level3 = toInterpretLevel(level5);
    const key = `${highest}-${level3}`;
    return {
      praise: COMMUNICATION_RULES.praise[key] || COMMUNICATION_RULES.praise[`${highest}-High`],
      request: COMMUNICATION_RULES.request[key] || COMMUNICATION_RULES.request[`${highest}-High`],
      scaleLabel: scaleLabels[highest],
      level: level5
    };
  };
  const tipsForA = getTips(personB);
  const tipsForB = getTips(personA);

  // 회복탄력성
  const sdAvg = Math.round((analysis.SD.scoreA + analysis.SD.scoreB) / 2);
  const coAvg = Math.round((analysis.CO.scoreA + analysis.CO.scoreB) / 2);
  const resilience = Math.round((sdAvg + coAvg) / 2);
  const resilienceLevel = resilience >= 65 ? '높음' : resilience >= 50 ? '양호' : resilience >= 35 ? '주의' : '위험';
  const resilienceText = resilience >= 65
    ? '두 분 모두 높은 성격 성숙도를 가지고 있어, 기질적 차이에도 불구하고 건강하게 갈등을 해결할 수 있는 힘이 있습니다.'
    : resilience >= 50
    ? '적절한 수준의 성격 성숙도를 갖추고 있어, 의식적인 노력을 통해 관계를 안정적으로 발전시킬 수 있습니다.'
    : resilience >= 35
    ? '성격 성숙도 향상이 관계 안정에 큰 도움이 됩니다. 자율성과 협력성을 함께 키워가는 노력이 필요합니다.'
    : '관계의 기반이 되는 성격 성숙도가 낮은 상태입니다. 전문 상담을 통해 각자의 성격 성숙도를 함께 키워가는 것을 강력히 권장합니다.';

  const today = new Date().toLocaleDateString('ko-KR');

  // ========================================
  // 렌더
  // ========================================
  return (
    <Document>
      {/* ==================== PAGE 1: 커버 + 관계 요약 ==================== */}
      <Page size="A4" style={s.page}>
        {/* 커버 헤더 */}
        <View style={s.coverHeader}>
          <Text style={s.coverTitle}>TCI 기질 및 성격검사</Text>
          <Text style={s.coverMain}>커플 분석 리포트</Text>
          <Text style={s.coverNames}>{nameA}  &  {nameB}</Text>
          <Text style={s.coverMeta}>{relType.label} | 분석일: {today}</Text>
        </View>

        {/* 핵심 역동 */}
        <View style={[s.box, s.boxRose, { marginBottom: 8, alignItems: 'center' }]}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: ROSE_DARK, marginBottom: 2 }}>{coreDynamic}</Text>
          <Text style={{ fontSize: 6, color: '#6B7280' }}>전체 평균 차이: {overallGap}점 | 유사 지표: {similarScales.length}개 | 대비 지표: {contrastScales.length}개</Text>
        </View>

        {/* 7척도 비교 테이블 */}
        <View style={[s.sectionTitle, { marginBottom: 4 }]}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: '#1F2937' }}>7척도 비교 분석</Text>
        </View>
        <View style={s.tableHeader}>
          <Text style={[s.tableHeaderCell, { width: '18%' }]}>지표</Text>
          <Text style={[s.tableHeaderCell, { width: '14%' }]}>{nameA}</Text>
          <Text style={[s.tableHeaderCell, { width: '14%' }]}>{nameB}</Text>
          <Text style={[s.tableHeaderCell, { width: '10%' }]}>차이</Text>
          <Text style={[s.tableHeaderCell, { width: '12%' }]}>구분</Text>
          <Text style={[s.tableHeaderCell, { width: '32%' }]}>비교 바</Text>
        </View>
        {allScales.map(sc => {
          const d = analysis[sc];
          const gc = GAP_COLORS[d.gapCategory];
          return (
            <View key={sc} style={s.tableRow}>
              <Text style={[s.tableCell, { width: '18%', fontWeight: 700, textAlign: 'left' }]}>{scaleLabels[sc]} ({sc})</Text>
              <View style={{ width: '14%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: COLOR_A }}>{d.scoreA}</Text>
                <LevelBadge level={d.levelA} />
              </View>
              <View style={{ width: '14%', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 2 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: COLOR_B }}>{d.scoreB}</Text>
                <LevelBadge level={d.levelB} />
              </View>
              <Text style={[s.tableCell, { width: '10%', fontWeight: 700 }]}>{d.gap}</Text>
              <View style={{ width: '12%', alignItems: 'center' }}>
                <Text style={[s.gapBadge, { backgroundColor: gc.bg, color: gc.text, fontSize: 5 }]}>{getGapLabel(d.gapCategory)}</Text>
              </View>
              <View style={{ width: '32%', flexDirection: 'row', gap: 1, alignItems: 'center' }}>
                <View style={{ flex: 1, height: 6, backgroundColor: '#F3F4F6', borderRadius: 3, overflow: 'hidden', position: 'relative' }}>
                  <View style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${d.scoreA}%`, backgroundColor: COLOR_A, opacity: 0.7, borderRadius: 3 }} />
                  <View style={{ position: 'absolute', left: 0, top: 0, height: '100%', width: `${d.scoreB}%`, backgroundColor: COLOR_B, opacity: 0.4, borderRadius: 3 }} />
                </View>
              </View>
            </View>
          );
        })}

        {/* 강점 / 성장 포인트 */}
        <View style={[s.twoCol, { marginTop: 10 }]}>
          <View style={[s.colHalf, s.box, s.boxGreen]}>
            <Text style={[s.boxLabel, { color: '#15803D' }]}>관계 강점</Text>
            {similarScales.length > 0 ? similarScales.map(sc => (
              <Text key={sc} style={[s.boxText, { color: '#166534' }]}>{scaleLabels[sc]} 유사 - 이 영역에서 자연스러운 공감이 이뤄집니다</Text>
            )) : <Text style={[s.boxText, { color: '#166534' }]}>다양한 차이가 관계의 풍성함을 만들어냅니다</Text>}
            {resilience >= 50 && <Text style={[s.boxText, { color: '#166534' }]}>성격 성숙도가 양호하여 갈등 조율 능력이 있습니다</Text>}
          </View>
          <View style={[s.colHalf, s.box, s.boxAmber]}>
            <Text style={[s.boxLabel, { color: '#A16207' }]}>성장 포인트</Text>
            {contrastScales.length > 0 ? contrastScales.map(sc => (
              <Text key={sc} style={[s.boxText, { color: '#92400E' }]}>{scaleLabels[sc]} 차이 - 서로의 관점 차이를 대화로 좁혀보세요</Text>
            )) : <Text style={[s.boxText, { color: '#92400E' }]}>전반적으로 큰 차이가 없어 안정적입니다</Text>}
            {resilience < 50 && <Text style={[s.boxText, { color: '#92400E' }]}>성격 성숙도 향상이 관계 안정에 도움이 됩니다</Text>}
          </View>
        </View>

        <Text style={s.footer}>TCI 커플 분석 리포트 | {nameA} & {nameB} | p.1</Text>
      </Page>

      {/* ==================== PAGE 2-3: 기질 역동 ==================== */}
      {[
        { scales: ['NS', 'HA'], pageNum: 2 },
        { scales: ['RD', 'PS'], pageNum: 3 }
      ].map(({ scales, pageNum }) => (
        <Page key={pageNum} size="A4" style={s.page}>
          <View style={[s.sectionTitle, s.sectionTitleBlue]}>
            <Text style={{ fontSize: 10, fontWeight: 700, color: '#1F2937' }}>기질 역동 분석 {pageNum === 2 ? '(1/2)' : '(2/2)'}</Text>
          </View>

          {scales.map(sc => {
            const d = analysis[sc];
            const dynamics = TEMPERAMENT_DYNAMICS[sc]?.[d.combinationKey];
            const gc = GAP_COLORS[d.gapCategory];
            return (
              <View key={sc} style={s.scaleBlock} wrap={false}>
                {/* 척도 헤더 */}
                <View style={s.scaleHeader}>
                  <Text style={s.scaleName}>{TEMPERAMENT_DYNAMICS[sc]?.title || scaleLabels[sc]}</Text>
                  <Text style={{ fontSize: 6, color: '#6B7280' }}>{TEMPERAMENT_DYNAMICS[sc]?.subtitle || ''}</Text>
                </View>

                {/* 점수 비교 바 */}
                <View style={{ marginBottom: 4 }}>
                  <View style={s.scoreBar}>
                    <Text style={[s.scoreName, { color: COLOR_A }]}>{nameA}</Text>
                    <View style={s.scoreTrack}>
                      <View style={[s.scoreFill, { width: `${Math.max(d.scoreA, 5)}%`, backgroundColor: COLOR_A }]}>
                        <Text style={s.scoreValue}>{d.scoreA}</Text>
                      </View>
                    </View>
                    <LevelBadge level={d.levelA} />
                  </View>
                  <View style={s.scoreBar}>
                    <Text style={[s.scoreName, { color: COLOR_B }]}>{nameB}</Text>
                    <View style={s.scoreTrack}>
                      <View style={[s.scoreFill, { width: `${Math.max(d.scoreB, 5)}%`, backgroundColor: COLOR_B }]}>
                        <Text style={s.scoreValue}>{d.scoreB}</Text>
                      </View>
                    </View>
                    <LevelBadge level={d.levelB} />
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                    <GapBadge category={d.gapCategory} gap={d.gap} />
                    {dynamics && <Text style={{ fontSize: 6, color: '#3B82F6', fontWeight: 700 }}>조합: {getLevelLabel(d.levelA)} x {getLevelLabel(d.levelB)} = {dynamics.label}</Text>}
                  </View>
                </View>

                {dynamics && (
                  <>
                    {/* 시너지 + 갈등 */}
                    <View style={s.twoCol}>
                      <View style={[s.colHalf, s.box, s.boxGreen]}>
                        <Text style={[s.boxLabel, { color: '#15803D' }]}>시너지</Text>
                        <Text style={s.boxText}>{replaceNames(dynamics.synergy, nameA, nameB)}</Text>
                      </View>
                      <View style={[s.colHalf, s.box, s.boxRed]}>
                        <Text style={[s.boxLabel, { color: '#B91C1C' }]}>갈등 지점</Text>
                        <Text style={s.boxText}>{replaceNames(dynamics.conflictPoint, nameA, nameB)}</Text>
                      </View>
                    </View>

                    {/* 상호 이해 */}
                    <View style={s.twoCol}>
                      <View style={[s.colHalf, s.box, s.boxBlue]}>
                        <Text style={[s.boxLabel, { color: '#1D4ED8' }]}>{nameA} → {nameB}</Text>
                        <Text style={s.boxText}>"{replaceNames(dynamics.mutualUnderstanding.A_to_B, nameA, nameB)}"</Text>
                      </View>
                      <View style={[s.colHalf, s.box, s.boxOrange]}>
                        <Text style={[s.boxLabel, { color: '#C2410C' }]}>{nameB} → {nameA}</Text>
                        <Text style={s.boxText}>"{replaceNames(dynamics.mutualUnderstanding.B_to_A, nameA, nameB)}"</Text>
                      </View>
                    </View>

                    {/* 추천 행동 */}
                    <View style={[s.box, s.boxPurple]}>
                      <Text style={[s.boxLabel, { color: '#6D28D9' }]}>추천 행동</Text>
                      <Text style={s.boxText}>{replaceNames(dynamics.recommendation, nameA, nameB)}</Text>
                    </View>
                  </>
                )}
              </View>
            );
          })}

          <Text style={s.footer}>TCI 커플 분석 리포트 | {nameA} & {nameB} | p.{pageNum}</Text>
        </Page>
      ))}

      {/* ==================== PAGE 4: 성격 분석 + 회복탄력성 ==================== */}
      <Page size="A4" style={s.page}>
        <View style={[s.sectionTitle, s.sectionTitleGreen]}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: '#1F2937' }}>성격 성숙도 분석</Text>
        </View>

        {characterScales.map(sc => {
          const d = analysis[sc];
          const interaction = CHARACTER_INTERACTIONS[sc]?.[d.combinationKey];
          return (
            <View key={sc} style={s.scaleBlock} wrap={false}>
              <View style={s.scaleHeader}>
                <Text style={s.scaleName}>{CHARACTER_INTERACTIONS[sc]?.title || scaleLabels[sc]}</Text>
                <Text style={{ fontSize: 6, color: '#6B7280' }}>{CHARACTER_INTERACTIONS[sc]?.subtitle || ''}</Text>
              </View>

              {/* 점수 비교 */}
              <View style={{ marginBottom: 4 }}>
                <View style={s.scoreBar}>
                  <Text style={[s.scoreName, { color: COLOR_A }]}>{nameA}</Text>
                  <View style={s.scoreTrack}>
                    <View style={[s.scoreFill, { width: `${Math.max(d.scoreA, 5)}%`, backgroundColor: COLOR_A }]}>
                      <Text style={s.scoreValue}>{d.scoreA}</Text>
                    </View>
                  </View>
                  <LevelBadge level={d.levelA} />
                </View>
                <View style={s.scoreBar}>
                  <Text style={[s.scoreName, { color: COLOR_B }]}>{nameB}</Text>
                  <View style={s.scoreTrack}>
                    <View style={[s.scoreFill, { width: `${Math.max(d.scoreB, 5)}%`, backgroundColor: COLOR_B }]}>
                      <Text style={s.scoreValue}>{d.scoreB}</Text>
                    </View>
                  </View>
                  <LevelBadge level={d.levelB} />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginTop: 2 }}>
                  <GapBadge category={d.gapCategory} gap={d.gap} />
                  {interaction && <Text style={{ fontSize: 6, color: '#059669', fontWeight: 700 }}>{interaction.label}</Text>}
                </View>
              </View>

              {interaction && (
                <View style={[s.box, s.boxEmerald]}>
                  <Text style={s.boxText}>{replaceNames(interaction.analysis, nameA, nameB)}</Text>
                </View>
              )}
            </View>
          );
        })}

        {/* 회복탄력성 */}
        <View style={[s.box, { backgroundColor: '#ECFDF5', borderWidth: 1, borderColor: '#6EE7B7', borderRadius: 8, padding: 12, marginTop: 6 }]} wrap={false}>
          <Text style={{ fontSize: 9, fontWeight: 700, color: '#1F2937', marginBottom: 6 }}>관계 회복탄력성 지표</Text>

          <View style={s.barContainer}>
            <Text style={s.barLabel}>자율성(SD) 평균</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${sdAvg}%`, backgroundColor: '#34D399' }]} />
            </View>
            <Text style={s.barValue}>{sdAvg}</Text>
          </View>
          <View style={s.barContainer}>
            <Text style={s.barLabel}>협력성(CO) 평균</Text>
            <View style={s.barTrack}>
              <View style={[s.barFill, { width: `${coAvg}%`, backgroundColor: '#34D399' }]} />
            </View>
            <Text style={s.barValue}>{coAvg}</Text>
          </View>
          <View style={{ height: 0.5, backgroundColor: '#A7F3D0', marginVertical: 4 }} />
          <View style={s.barContainer}>
            <Text style={[s.barLabel, { fontWeight: 700 }]}>종합</Text>
            <View style={[s.barTrack, { height: 10 }]}>
              <View style={[s.barFill, { width: `${resilience}%`, backgroundColor: '#10B981', height: 10 }]} />
            </View>
            <Text style={[s.barValue, { color: resilience >= 50 ? '#059669' : '#DC2626' }]}>{resilience} ({resilienceLevel})</Text>
          </View>
          <Text style={{ fontSize: 6, color: '#4B5563', lineHeight: 1.5, marginTop: 4 }}>{resilienceText}</Text>
        </View>

        <Text style={s.footer}>TCI 커플 분석 리포트 | {nameA} & {nameB} | p.4</Text>
      </Page>

      {/* ==================== PAGE 5: 소통 가이드 ==================== */}
      <Page size="A4" style={s.page}>
        <View style={[s.sectionTitle, s.sectionTitlePurple]}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: '#1F2937' }}>소통 가이드</Text>
        </View>

        {/* 쌍방향 소통 팁 */}
        <View style={s.twoCol}>
          <View style={[s.colHalf, s.box, s.boxBlue]}>
            <Text style={[s.boxLabel, { color: '#1D4ED8', marginBottom: 4 }]}>{nameA} → {nameB}</Text>
            <Text style={{ fontSize: 6, fontWeight: 700, color: '#15803D', marginBottom: 2 }}>효과적인 칭찬</Text>
            <View style={{ backgroundColor: 'white', borderRadius: 4, padding: 4, marginBottom: 4 }}>
              <Text style={{ fontSize: 6, color: '#374151', lineHeight: 1.5 }}>"{tipsForA.praise}"</Text>
            </View>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 4 }}>{nameB}님의 {tipsForA.scaleLabel}({getLevelLabel(tipsForA.level)}) 기질에 맞춘 표현</Text>
            <Text style={{ fontSize: 6, fontWeight: 700, color: '#A16207', marginBottom: 2 }}>변화 요청 방법</Text>
            <View style={{ backgroundColor: 'white', borderRadius: 4, padding: 4 }}>
              <Text style={{ fontSize: 6, color: '#374151', lineHeight: 1.5 }}>"{tipsForA.request}"</Text>
            </View>
          </View>
          <View style={[s.colHalf, s.box, s.boxOrange]}>
            <Text style={[s.boxLabel, { color: '#C2410C', marginBottom: 4 }]}>{nameB} → {nameA}</Text>
            <Text style={{ fontSize: 6, fontWeight: 700, color: '#15803D', marginBottom: 2 }}>효과적인 칭찬</Text>
            <View style={{ backgroundColor: 'white', borderRadius: 4, padding: 4, marginBottom: 4 }}>
              <Text style={{ fontSize: 6, color: '#374151', lineHeight: 1.5 }}>"{tipsForB.praise}"</Text>
            </View>
            <Text style={{ fontSize: 5, color: '#6B7280', marginBottom: 4 }}>{nameA}님의 {tipsForB.scaleLabel}({getLevelLabel(tipsForB.level)}) 기질에 맞춘 표현</Text>
            <Text style={{ fontSize: 6, fontWeight: 700, color: '#A16207', marginBottom: 2 }}>변화 요청 방법</Text>
            <View style={{ backgroundColor: 'white', borderRadius: 4, padding: 4 }}>
              <Text style={{ fontSize: 6, color: '#374151', lineHeight: 1.5 }}>"{tipsForB.request}"</Text>
            </View>
          </View>
        </View>

        {/* 갈등 해결 4단계 */}
        <Text style={[s.subTitle, { marginTop: 12 }]}>갈등 시 대화 가이드</Text>
        <View style={{ marginBottom: 8 }}>
          {CONFLICT_RESOLUTION_STEPS.map(step => (
            <View key={step.step} style={{ flexDirection: 'row', gap: 6, marginBottom: 5, alignItems: 'flex-start' }}>
              <View style={[s.numberCircle, { backgroundColor: ROSE_DARK }]}>
                <Text style={s.numberText}>{step.step}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 7, fontWeight: 700, color: '#1F2937' }}>{step.title}</Text>
                <Text style={{ fontSize: 7, color: ROSE_DARK, fontWeight: 700, marginTop: 1 }}>{step.template}</Text>
                <Text style={{ fontSize: 6, color: '#6B7280', marginTop: 1 }}>{step.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <Text style={s.footer}>TCI 커플 분석 리포트 | {nameA} & {nameB} | p.5</Text>
      </Page>

      {/* ==================== PAGE 6: 성장 로드맵 + 마무리 ==================== */}
      <Page size="A4" style={s.page}>
        <View style={[s.sectionTitle, s.sectionTitlePurple]}>
          <Text style={{ fontSize: 10, fontWeight: 700, color: '#1F2937' }}>관계 성장 로드맵</Text>
        </View>

        {GROWTH_ROADMAP.map((item, idx) => (
          <View key={idx} style={s.roadmapItem}>
            <View style={s.weekBadge}>
              <Text style={s.weekText}>{item.week}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 8, fontWeight: 700, color: '#1F2937' }}>{item.task}</Text>
              <Text style={{ fontSize: 6.5, color: '#4B5563', marginTop: 1, lineHeight: 1.5 }}>{item.detail}</Text>
            </View>
          </View>
        ))}

        {/* 마무리 메시지 */}
        <View style={s.closingBox}>
          <Text style={s.closingTitle}>{nameA}님과 {nameB}님에게</Text>
          <Text style={s.closingText}>
            기질의 차이는 '틀림'이 아닌 '다름'입니다.{'\n'}
            서로의 기질을 이해하는 것은 상대를 바꾸기 위함이 아니라,{'\n'}
            있는 그대로를 받아들이고 더 나은 소통을 위한 첫걸음입니다.{'\n\n'}
            유사한 기질은 공감의 기반이 되고,{'\n'}
            다른 기질은 서로를 보완하는 힘이 됩니다.{'\n\n'}
            이 리포트가 두 분의 관계를 더 깊이 이해하고,{'\n'}
            함께 성장해나가는 데 작은 도움이 되기를 바랍니다.
          </Text>
        </View>

        <Text style={s.footer}>TCI 커플 분석 리포트 | {nameA} & {nameB} | p.6</Text>
      </Page>
    </Document>
  );
};

export default CouplePDFReport;
