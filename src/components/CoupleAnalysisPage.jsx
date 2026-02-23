import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import {
  RELATIONSHIP_TYPES, TEMPERAMENT_DYNAMICS, CHARACTER_INTERACTIONS,
  COMMUNICATION_RULES, CONFLICT_RESOLUTION_STEPS, GROWTH_ROADMAP,
  getCoupleLevel, toInterpretLevel, getLevelLabel, getLevelColor5,
  getGapCategory, getCombinationKey, getGapLabel, getGapColor
} from '../data/coupleInterpretations';

const scaleLabels = {
  NS: '탐색성', HA: '불확실성 센서', RD: '관계 민감성', PS: '실행 일관성',
  SD: '자율성', CO: '협력성', ST: '자기초월'
};

const COLOR_A = '#60A5FA';
const COLOR_B = '#F97316';
const allScales = ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'];
const temperamentScales = ['NS', 'HA', 'RD', 'PS'];
const characterScales = ['SD', 'CO'];

export default function CoupleAnalysisPage({ personA, personB, relationshipType, onBack, mainScaleTraits }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScale, setSelectedScale] = useState('NS');

  const relType = RELATIONSHIP_TYPES[relationshipType] || RELATIONSHIP_TYPES.COUPLE;
  const nameA = personA.name || 'A';
  const nameB = personB.name || 'B';

  // 해석 텍스트에서 A님/B님을 실제 이름으로 치환
  const replaceNames = (text) => {
    if (!text) return text;
    return text.replace(/A님/g, `${nameA}님`).replace(/B님/g, `${nameB}님`);
  };

  // ========================================
  // 분석 데이터 계산
  // ========================================
  const analysis = {};
  allScales.forEach(s => {
    const scoreA = personA[s] || 0;
    const scoreB = personB[s] || 0;
    const levelA = getCoupleLevel(scoreA);
    const levelB = getCoupleLevel(scoreB);
    const gap = Math.abs(scoreA - scoreB);
    const gapCategory = getGapCategory(scoreA, scoreB);
    const combinationKey = getCombinationKey(levelA, levelB);
    analysis[s] = { scoreA, scoreB, levelA, levelB, gap, gapCategory, combinationKey };
  });

  const similarScales = allScales.filter(s => analysis[s].gapCategory === 'similar');
  const contrastScales = allScales.filter(s => analysis[s].gapCategory === 'contrast');
  const overallGap = Math.round(allScales.reduce((sum, s) => sum + analysis[s].gap, 0) / allScales.length);

  // 핵심 역동 요약 생성
  const getCoreDynamic = () => {
    const highestA = temperamentScales.reduce((a, b) => (personA[a] > personA[b]) ? a : b);
    const highestB = temperamentScales.reduce((a, b) => (personB[a] > personB[b]) ? a : b);
    const personaA = mainScaleTraits?.[highestA]?.highPersona || scaleLabels[highestA];
    const personaB = mainScaleTraits?.[highestB]?.highPersona || scaleLabels[highestB];
    return `${personaA}와 ${personaB}의 만남`;
  };

  // 소통 팁 생성 - 상대방의 가장 높은 기질 척도 기준
  const getCommunicationTips = (target) => {
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

  // 회복탄력성 계산
  const sdAvg = Math.round((analysis.SD.scoreA + analysis.SD.scoreB) / 2);
  const coAvg = Math.round((analysis.CO.scoreA + analysis.CO.scoreB) / 2);
  const resilience = Math.round((sdAvg + coAvg) / 2);
  const resilienceLevel = resilience >= 65 ? '높음' : resilience >= 50 ? '양호' : resilience >= 35 ? '주의' : '위험';
  const resilienceColor = resilience >= 65 ? 'text-green-600' : resilience >= 50 ? 'text-blue-600' : resilience >= 35 ? 'text-yellow-600' : 'text-red-600';

  // 레벨 뱃지 (5단계)
  const LevelBadge = ({ level }) => {
    const colorMap = {
      VH: 'bg-indigo-100 text-indigo-700', H: 'bg-blue-100 text-blue-700',
      M: 'bg-gray-100 text-gray-600', L: 'bg-orange-100 text-orange-700', VL: 'bg-red-100 text-red-700'
    };
    return <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${colorMap[level] || colorMap.M}`}>{getLevelLabel(level)}</span>;
  };

  // 탭 정의
  const tabs = [
    { key: 'overview', label: '관계 요약', icon: '📊' },
    { key: 'temperament', label: '기질 비교', icon: '🧬' },
    { key: 'character', label: '성격 분석', icon: '🛡️' },
    { key: 'communication', label: '소통 가이드', icon: '💬' }
  ];

  // ========================================
  // 탭 1: 관계 요약
  // ========================================
  const renderOverview = () => {
    const radarData = allScales.map(s => ({
      scale: `${scaleLabels[s]}`,
      fullMark: 100,
      [personA.name]: analysis[s].scoreA,
      [personB.name]: analysis[s].scoreB
    }));

    return (
      <div className="space-y-6">
        {/* 핵심 역동 */}
        <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl p-6 border border-rose-100">
          <h3 className="text-xl font-bold text-gray-800 mb-2">{relType.icon} {personA.name} & {personB.name}</h3>
          <p className="text-rose-700 font-semibold text-lg mb-3">{getCoreDynamic()}</p>
          <div className="flex items-center gap-3 text-sm text-gray-600">
            <span className="bg-white px-3 py-1 rounded-full border border-rose-200">전체 평균 차이: {overallGap}점</span>
            <span className="bg-white px-3 py-1 rounded-full border border-green-200">유사 지표: {similarScales.length}개</span>
            <span className="bg-white px-3 py-1 rounded-full border border-red-200">대비 지표: {contrastScales.length}개</span>
          </div>
        </div>

        {/* 레이더 차트 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-4">프로파일 비교</h4>
          <div className="flex items-center justify-center gap-6 mb-4">
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_A }}></div><span className="text-sm font-medium">{personA.name}</span></div>
            <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full" style={{ backgroundColor: COLOR_B }}></div><span className="text-sm font-medium">{personB.name}</span></div>
          </div>
          <ResponsiveContainer width="100%" height={350}>
            <RadarChart data={radarData} outerRadius="80%">
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="scale" tick={{ fontSize: 12, fill: '#6B7280' }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fontSize: 10 }} />
              <Radar name={personA.name} dataKey={personA.name} stroke={COLOR_A} fill={COLOR_A} fillOpacity={0.15} strokeWidth={2.5} />
              <Radar name={personB.name} dataKey={personB.name} stroke={COLOR_B} fill={COLOR_B} fillOpacity={0.15} strokeWidth={2.5} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 갭 바 차트 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-4">지표별 차이 비교</h4>
          <div className="space-y-3">
            {allScales.map(s => {
              const d = analysis[s];
              const gapCol = getGapColor(d.gapCategory);
              return (
                <div key={s} className="flex items-center gap-3">
                  <div className="w-20 text-right text-sm font-medium text-gray-600">{scaleLabels[s]}</div>
                  <div className="flex-1 flex items-center gap-2">
                    {/* A bar */}
                    <div className="w-12 text-right text-xs font-medium" style={{ color: COLOR_A }}>{d.scoreA}</div>
                    <div className="flex-1 relative h-6 bg-gray-50 rounded-full overflow-hidden">
                      <div className="absolute left-0 top-0 h-full rounded-l-full" style={{ width: `${d.scoreA}%`, backgroundColor: COLOR_A, opacity: 0.7 }}></div>
                      <div className="absolute left-0 top-0 h-full rounded-l-full border-r-2 border-white" style={{ width: `${d.scoreB}%`, backgroundColor: COLOR_B, opacity: 0.4 }}></div>
                    </div>
                    <div className="w-12 text-left text-xs font-medium" style={{ color: COLOR_B }}>{d.scoreB}</div>
                  </div>
                  <div className={`w-16 text-center text-xs font-bold px-2 py-1 rounded-full ${gapCol.bg} ${gapCol.text}`}>
                    {d.gap} {getGapLabel(d.gapCategory)}
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-4 text-xs text-gray-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 유사(차이≤10)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 보통(11~25)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 대비(26+)</span>
          </div>
        </div>

        {/* 강점 / 성장 포인트 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-green-50 rounded-2xl p-5 border border-green-100">
            <h4 className="font-bold text-green-700 mb-3">관계 강점</h4>
            <ul className="space-y-2">
              {similarScales.length > 0 ? similarScales.map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>{scaleLabels[s]} 유사 → 이 영역에서 자연스러운 공감이 이뤄집니다</span>
                </li>
              )) : <li className="text-sm text-green-600">다양한 차이가 관계의 풍성함을 만들어냅니다</li>}
              {resilience >= 50 && (
                <li className="flex items-start gap-2 text-sm text-green-700">
                  <span className="mt-0.5">✓</span>
                  <span>성격 성숙도가 양호하여 갈등 조율 능력이 있습니다</span>
                </li>
              )}
            </ul>
          </div>
          <div className="bg-amber-50 rounded-2xl p-5 border border-amber-100">
            <h4 className="font-bold text-amber-700 mb-3">성장 포인트</h4>
            <ul className="space-y-2">
              {contrastScales.length > 0 ? contrastScales.map(s => (
                <li key={s} className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-0.5">△</span>
                  <span>{scaleLabels[s]} 차이 → 서로의 관점 차이를 대화로 좁혀보세요</span>
                </li>
              )) : <li className="text-sm text-amber-600">전반적으로 큰 차이가 없어 안정적입니다</li>}
              {resilience < 50 && (
                <li className="flex items-start gap-2 text-sm text-amber-700">
                  <span className="mt-0.5">△</span>
                  <span>성격 성숙도 향상이 관계 안정에 도움이 됩니다</span>
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // 탭 2: 기질 비교
  // ========================================
  const renderTemperament = () => {
    const scale = selectedScale;
    const d = analysis[scale];
    const dynamics = TEMPERAMENT_DYNAMICS[scale]?.[d.combinationKey];
    const gapCol = getGapColor(d.gapCategory);

    return (
      <div className="space-y-4">
        {/* 척도 선택 */}
        <div className="bg-white rounded-xl p-1.5 inline-flex gap-1 border border-gray-100 shadow-sm">
          {temperamentScales.map(s => (
            <button key={s} onClick={() => setSelectedScale(s)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${selectedScale === s ? 'bg-blue-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {scaleLabels[s]}({s})
            </button>
          ))}
        </div>

        {/* 점수 비교 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <h4 className="text-lg font-bold text-gray-800">{TEMPERAMENT_DYNAMICS[scale]?.title || scaleLabels[scale]}</h4>
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${gapCol.bg} ${gapCol.text}`}>차이 {d.gap}점</span>
          </div>

          {/* A/B 점수 바 */}
          <div className="space-y-3 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-gray-700">{personA.name}</div>
              <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end pr-3" style={{ width: `${Math.max(d.scoreA, 5)}%`, backgroundColor: COLOR_A }}>
                  <span className="text-white text-xs font-bold">{d.scoreA}</span>
                </div>
              </div>
              <LevelBadge level={d.levelA} />
            </div>
            <div className="flex items-center gap-3">
              <div className="w-24 text-sm font-medium text-gray-700">{personB.name}</div>
              <div className="flex-1 relative h-8 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full flex items-center justify-end pr-3" style={{ width: `${Math.max(d.scoreB, 5)}%`, backgroundColor: COLOR_B }}>
                  <span className="text-white text-xs font-bold">{d.scoreB}</span>
                </div>
              </div>
              <LevelBadge level={d.levelB} />
            </div>
          </div>

          {dynamics && (
            <div className="text-sm text-gray-500 mb-2">
              조합 유형: <span className="font-semibold text-gray-700">{getLevelLabel(d.levelA)} × {getLevelLabel(d.levelB)}</span> → <span className="font-bold text-blue-700">{dynamics.label}</span>
            </div>
          )}
        </div>

        {/* 시너지 & 갈등 */}
        {dynamics && (
          <>
            <div className="bg-green-50 rounded-2xl p-6 border border-green-100">
              <h4 className="font-bold text-green-700 mb-3 flex items-center gap-2">🤝 시너지</h4>
              <p className="text-green-800 leading-relaxed">{replaceNames(dynamics.synergy)}</p>
            </div>

            <div className="bg-red-50 rounded-2xl p-6 border border-red-100">
              <h4 className="font-bold text-red-700 mb-3 flex items-center gap-2">⚡ 갈등 지점</h4>
              <p className="text-red-800 leading-relaxed">{replaceNames(dynamics.conflictPoint)}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <h5 className="font-bold text-blue-700 mb-2">{nameA} → {nameB}</h5>
                <p className="text-blue-800 text-sm leading-relaxed">"{replaceNames(dynamics.mutualUnderstanding.A_to_B)}"</p>
              </div>
              <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
                <h5 className="font-bold text-orange-700 mb-2">{nameB} → {nameA}</h5>
                <p className="text-orange-800 text-sm leading-relaxed">"{replaceNames(dynamics.mutualUnderstanding.B_to_A)}"</p>
              </div>
            </div>

            <div className="bg-purple-50 rounded-2xl p-6 border border-purple-100">
              <h4 className="font-bold text-purple-700 mb-3 flex items-center gap-2">📋 추천 행동</h4>
              <p className="text-purple-800 leading-relaxed">{replaceNames(dynamics.recommendation)}</p>
            </div>
          </>
        )}
      </div>
    );
  };

  // ========================================
  // 탭 3: 성격 분석
  // ========================================
  const renderCharacter = () => {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">관계를 지탱하는 성숙의 힘</h3>

        {characterScales.map(scale => {
          const d = analysis[scale];
          const interaction = CHARACTER_INTERACTIONS[scale]?.[d.combinationKey];
          const gapCol = getGapColor(d.gapCategory);

          return (
            <div key={scale} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <h4 className="text-lg font-bold text-gray-800">{CHARACTER_INTERACTIONS[scale]?.title || scaleLabels[scale]}</h4>
                {interaction && <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700">{interaction.label}</span>}
              </div>

              <div className="flex items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: COLOR_A }}>{personA.name}: {d.scoreA}</span>
                  <LevelBadge level={d.levelA} />
                </div>
                <span className="text-gray-400">←→</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium" style={{ color: COLOR_B }}>{personB.name}: {d.scoreB}</span>
                  <LevelBadge level={d.levelB} />
                </div>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${gapCol.bg} ${gapCol.text}`}>차이 {d.gap}</span>
              </div>

              {interaction && (
                <p className="text-gray-700 leading-relaxed">{replaceNames(interaction.analysis)}</p>
              )}
            </div>
          );
        })}

        {/* 회복탄력성 지표 */}
        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
          <h4 className="font-bold text-gray-800 mb-4">🛡️ 관계 회복탄력성 지표</h4>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600">자율성(SD) 평균</span>
              <div className="flex-1 h-4 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${sdAvg}%` }}></div>
              </div>
              <span className="w-12 text-sm font-bold text-gray-700">{sdAvg}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm text-gray-600">협력성(CO) 평균</span>
              <div className="flex-1 h-4 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-emerald-400" style={{ width: `${coAvg}%` }}></div>
              </div>
              <span className="w-12 text-sm font-bold text-gray-700">{coAvg}</span>
            </div>
            <hr className="border-emerald-200" />
            <div className="flex items-center gap-3">
              <span className="w-24 text-sm font-bold text-gray-700">종합</span>
              <div className="flex-1 h-5 bg-white rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500" style={{ width: `${resilience}%` }}></div>
              </div>
              <span className={`w-20 text-sm font-bold ${resilienceColor}`}>{resilience} ({resilienceLevel})</span>
            </div>
          </div>
          <p className="text-sm text-gray-600 mt-4 leading-relaxed">
            {resilience >= 65 && '두 분 모두 높은 성격 성숙도를 가지고 있어, 기질적 차이에도 불구하고 건강하게 갈등을 해결할 수 있는 힘이 있습니다.'}
            {resilience >= 50 && resilience < 65 && '적절한 수준의 성격 성숙도를 갖추고 있어, 의식적인 노력을 통해 관계를 안정적으로 발전시킬 수 있습니다.'}
            {resilience >= 35 && resilience < 50 && '성격 성숙도 향상이 관계 안정에 큰 도움이 됩니다. 자율성과 협력성을 함께 키워가는 노력이 필요합니다.'}
            {resilience < 35 && '관계의 기반이 되는 성격 성숙도가 낮은 상태입니다. 전문 상담을 통해 각자의 성격 성숙도를 함께 키워가는 것을 강력히 권장합니다.'}
          </p>
        </div>
      </div>
    );
  };

  // ========================================
  // 탭 4: 소통 가이드
  // ========================================
  const renderCommunication = () => {
    const tipsForA = getCommunicationTips(personB); // A가 B에게 쓸 팁
    const tipsForB = getCommunicationTips(personA); // B가 A에게 쓸 팁

    return (
      <div className="space-y-6">
        <h3 className="text-lg font-bold text-gray-800">서로에게 닿는 소통의 기술</h3>

        {/* 칭찬 / 변화 요청 */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
            <h4 className="font-bold text-blue-700 mb-4">📝 {personA.name} → {personB.name}</h4>
            <div className="mb-4">
              <h5 className="text-sm font-bold text-green-700 mb-2">💚 효과적인 칭찬</h5>
              <p className="text-sm text-gray-700 bg-white rounded-xl p-3 leading-relaxed">"{tipsForA.praise}"</p>
              <p className="text-xs text-gray-500 mt-1">{personB.name}님의 {tipsForA.scaleLabel}({getLevelLabel(tipsForA.level)}) 기질에 맞춘 표현</p>
            </div>
            <div>
              <h5 className="text-sm font-bold text-amber-700 mb-2">💛 변화 요청 방법</h5>
              <p className="text-sm text-gray-700 bg-white rounded-xl p-3 leading-relaxed">"{tipsForA.request}"</p>
            </div>
          </div>
          <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100">
            <h4 className="font-bold text-orange-700 mb-4">📝 {personB.name} → {personA.name}</h4>
            <div className="mb-4">
              <h5 className="text-sm font-bold text-green-700 mb-2">💚 효과적인 칭찬</h5>
              <p className="text-sm text-gray-700 bg-white rounded-xl p-3 leading-relaxed">"{tipsForB.praise}"</p>
              <p className="text-xs text-gray-500 mt-1">{personA.name}님의 {tipsForB.scaleLabel}({getLevelLabel(tipsForB.level)}) 기질에 맞춘 표현</p>
            </div>
            <div>
              <h5 className="text-sm font-bold text-amber-700 mb-2">💛 변화 요청 방법</h5>
              <p className="text-sm text-gray-700 bg-white rounded-xl p-3 leading-relaxed">"{tipsForB.request}"</p>
            </div>
          </div>
        </div>

        {/* 갈등 해결 */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-800 mb-4">🔥 갈등 시 대화 가이드</h4>
          <div className="space-y-4">
            {CONFLICT_RESOLUTION_STEPS.map(s => (
              <div key={s.step} className="flex gap-4">
                <div className="w-8 h-8 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center font-bold text-sm flex-shrink-0">{s.step}</div>
                <div>
                  <h5 className="font-bold text-gray-800 text-sm">{s.title}</h5>
                  <p className="text-rose-700 text-sm font-medium mt-1">{s.template}</p>
                  <p className="text-gray-500 text-xs mt-0.5">{s.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 성장 로드맵 */}
        <div className="bg-gradient-to-r from-violet-50 to-purple-50 rounded-2xl p-6 border border-violet-100">
          <h4 className="font-bold text-gray-800 mb-4">📅 관계 성장 로드맵</h4>
          <div className="space-y-4">
            {GROWTH_ROADMAP.map((item, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-16 text-center">
                  <span className="bg-violet-200 text-violet-800 px-2 py-1 rounded-full text-xs font-bold">{item.week}</span>
                </div>
                <div>
                  <h5 className="font-bold text-gray-800 text-sm">{item.task}</h5>
                  <p className="text-gray-500 text-xs mt-0.5">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // ========================================
  // 메인 렌더
  // ========================================
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-3 flex items-center justify-between">
          <button onClick={onBack} className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2">
            ← 목록으로
          </button>
          <h1 className="text-lg font-bold text-gray-800">{relType.icon} 커플분석</h1>
          <div></div>
        </div>
        {/* 탭 */}
        <div className="max-w-5xl mx-auto px-6 pb-2 flex gap-1">
          {tabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${activeTab === tab.key ? 'bg-rose-600 text-white shadow' : 'text-gray-600 hover:bg-gray-100'}`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'temperament' && renderTemperament()}
        {activeTab === 'character' && renderCharacter()}
        {activeTab === 'communication' && renderCommunication()}
      </div>
    </div>
  );
}
