import React, { useState } from 'react';
import {
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar,
  ResponsiveContainer, Tooltip
} from 'recharts';
import { pdf } from '@react-pdf/renderer';
import CouplePDFReport from './CouplePDFReport';
import {
  RELATIONSHIP_TYPES, TEMPERAMENT_DYNAMICS, CHARACTER_INTERACTIONS,
  COMMUNICATION_RULES, CONFLICT_RESOLUTION_STEPS, GROWTH_ROADMAP,
  getCoupleLevel, toInterpretLevel, getLevelLabel, getLevelColor5,
  getGapCategory, getCombinationKey, getGapColor
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

const AI_GATEWAY_URL = import.meta.env.VITE_AI_GATEWAY_URL || 'https://ai-gateway20251125.up.railway.app';

const TCI_SYSTEM_PROMPT = `당신은 TCI(기질 및 성격 검사) 전문 심리상담사입니다.
두 사람의 TCI 점수를 바탕으로 관계 역동을 분석합니다.

## 핵심 철학 (반드시 준수)
- 기질(NS, HA, RD, PS)은 선천적 특성이므로 우열이나 좋고 나쁨을 논하는 것은 무의미합니다.
- 모든 기질 점수에는 긍정적 측면이 있습니다. 높든 낮든 그 자체로 고유한 강점입니다.
- 분석의 목적은 "기질의 긍정적 면을 십분 활용하고, 취약점을 서로 커버하는 전략"을 제시하는 것입니다.
- 부정적 평가, 문제점 나열, 결함 지적은 절대 금지합니다. 내담자의 기를 꺾지 마세요.
- "차이"는 문제가 아니라 서로를 보완하는 자원입니다. 이 관점으로 해석하세요.
- 성격(SD, CO, ST)은 기질과 달리 노력으로 성장 가능한 영역이므로, 성장 방향을 긍정적으로 제안할 수 있습니다.

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
## 핵심 역동
(두 사람의 기질 조합이 만들어내는 고유한 관계 패턴과 시너지. 2~3문장. 긍정적 톤으로)

## 관계 강점
(각자의 기질이 상대방을 어떻게 보완하는지 구체적으로. 2~3가지. 점수 근거 포함)

## 활용 전략
(각자의 기질적 강점을 관계에서 어떻게 십분 활용할 수 있는지. 취약한 부분은 상대의 강점으로 커버하는 전략 포함. 2~3가지)

## 실천 제안
(오늘부터 시작할 수 있는 구체적이고 긍정적인 행동 2~3가지)

## 주의사항
- "유사하면 공감이 잘 된다" 같은 당연한 말 금지
- 반드시 구체적 점수를 언급하며 해석할 것
- 두 사람의 이름을 사용할 것
- 따뜻하고 격려하는 전문가 톤. 내담자가 읽었을 때 힘이 되는 분석
- 각 섹션 2~4줄 이내로 간결하게
- "문제", "결함", "부족", "못하는" 같은 부정 표현 대신 "성장 여지", "발전 가능성", "보완" 등 사용`;

export default function CoupleAnalysisPage({ personA, personB, relationshipType, onBack, mainScaleTraits }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedScale, setSelectedScale] = useState('NS');
  const [pdfLoading, setPdfLoading] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState(null);

  const relType = RELATIONSHIP_TYPES[relationshipType] || RELATIONSHIP_TYPES.COUPLE;
  const nameA = personA.name || 'A';
  const nameB = personB.name || 'B';

  // 해석 텍스트에서 A님/B님을 실제 이름으로 치환
  const replaceNames = (text) => {
    if (!text) return text;
    return text.replace(/A님/g, `${nameA}님`).replace(/B님/g, `${nameB}님`);
  };

  // PDF 다운로드 핸들러
  const handleDownloadCouplePDF = async () => {
    setPdfLoading(true);
    try {
      const blob = await pdf(
        <CouplePDFReport
          personA={personA}
          personB={personB}
          relationshipType={relationshipType}
          mainScaleTraits={mainScaleTraits}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `TCI_커플분석_${nameA}_${nameB}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('PDF 생성 실패:', err);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setPdfLoading(false);
    }
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

  // ========================================
  // AI 심층 분석
  // ========================================
  const buildAnalysisPrompt = () => {
    const scoresA = allScales.map(s => `${s}=${analysis[s].scoreA}`).join(', ');
    const scoresB = allScales.map(s => `${s}=${analysis[s].scoreB}`).join(', ');
    const contrastList = contrastScales.map(s => `${scaleLabels[s]}(차이 ${analysis[s].gap})`).join(', ');
    const similarList = similarScales.map(s => `${scaleLabels[s]}(차이 ${analysis[s].gap})`).join(', ');
    return `[관계 유형] ${relType.label}
[${nameA}] ${scoresA}
[${nameB}] ${scoresB}
[차이가 큰 지표] ${contrastList || '없음'}
[유사한 지표] ${similarList || '없음'}
[전체 평균 차이] ${overallGap}점

이 두 사람의 관계를 TCI 전문가 관점에서 심층 분석해주세요.`;
  };

  const fetchAiAnalysis = async () => {
    setAiLoading(true);
    setAiError(null);
    try {
      const response = await fetch(`${AI_GATEWAY_URL}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: 'claude-sonnet',
          messages: [{ role: 'user', content: buildAnalysisPrompt() }],
          system_prompt: TCI_SYSTEM_PROMPT,
          max_tokens: 2048,
          temperature: 0.7
        })
      });
      if (!response.ok) throw new Error(`API 오류 (${response.status})`);
      const data = await response.json();
      setAiAnalysis(data.content);
    } catch (err) {
      setAiError(err.message || 'AI 분석 중 오류가 발생했습니다.');
    } finally {
      setAiLoading(false);
    }
  };

  // AI 응답을 ## 헤더 기준으로 섹션 파싱
  const parseAiSections = (text) => {
    if (!text) return [];
    const sectionConfigs = [
      { key: '핵심 역동', icon: '🔮', bg: 'bg-purple-50', border: 'border-purple-100', title: 'text-purple-700', body: 'text-purple-800' },
      { key: '관계 강점', icon: '💪', bg: 'bg-green-50', border: 'border-green-100', title: 'text-green-700', body: 'text-green-800' },
      { key: '활용 전략', icon: '🎯', bg: 'bg-amber-50', border: 'border-amber-100', title: 'text-amber-700', body: 'text-amber-800' },
      { key: '실천 제안', icon: '✅', bg: 'bg-blue-50', border: 'border-blue-100', title: 'text-blue-700', body: 'text-blue-800' }
    ];
    const sections = [];
    for (const cfg of sectionConfigs) {
      const regex = new RegExp(`##\\s*${cfg.key}[\\s\\S]*?(?=##|$)`, 'i');
      const match = text.match(regex);
      if (match) {
        const content = match[0].replace(/##\s*[^\n]+\n?/, '').trim();
        if (content) sections.push({ ...cfg, content });
      }
    }
    // 파싱 실패 시 전체 텍스트를 하나의 카드로
    if (sections.length === 0) {
      sections.push({ key: 'AI 분석', icon: '🤖', bg: 'bg-gray-50', border: 'border-gray-200', title: 'text-gray-700', body: 'text-gray-800', content: text });
    }
    return sections;
  };

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

        {/* 기질 비교 (덤벨 도트 차트) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-1">기질 비교</h4>
          <p className="text-xs text-gray-400 mb-4">선천적 특성 — 두 점 사이의 거리가 차이를 나타냅니다</p>
          <div className="flex items-center gap-4 mb-4">
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_A }}></div><span className="text-xs font-medium text-gray-600">{nameA}</span></div>
            <div className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_B }}></div><span className="text-xs font-medium text-gray-600">{nameB}</span></div>
          </div>
          {(() => {
            const traitDir = {
              NS: { low: '안정·신중', high: '모험·혁신' },
              HA: { low: '대담·낙관', high: '세심·준비' },
              RD: { low: '독립·자율', high: '공감·연결' },
              PS: { low: '유연·적응', high: '끈기·완수' }
            };
            const gapSvg = {
              similar: { fill: '#dcfce7', stroke: '#bbf7d0', text: '#166534' },
              moderate: { fill: '#fef9c3', stroke: '#fde68a', text: '#854d0e' },
              contrast: { fill: '#fee2e2', stroke: '#fecaca', text: '#991b1b' }
            };
            const tL = 90, tR = 478, tW = tR - tL;
            const toX = (v) => tL + (v / 100) * tW;
            const rowH = 85, svgH = temperamentScales.length * rowH + 24;
            return (
              <svg viewBox={`0 0 560 ${svgH}`} className="w-full">
                {/* 배경 영역 */}
                <rect x={tL} y={8} width={toX(50) - tL} height={temperamentScales.length * rowH - 8} fill="#fafafa" opacity={0.3} rx={2} />
                <rect x={toX(50)} y={8} width={tR - toX(50)} height={temperamentScales.length * rowH - 8} fill="#f0fdf4" opacity={0.15} rx={2} />
                {/* 세로 눈금선 */}
                {[0, 25, 50, 75, 100].map(v => (
                  <g key={v}>
                    <line x1={toX(v)} y1={8} x2={toX(v)} y2={temperamentScales.length * rowH} stroke={v === 50 ? '#d1d5db' : '#f3f4f6'} strokeWidth={0.5} strokeDasharray={v === 50 ? '4,3' : 'none'} />
                    <text x={toX(v)} y={svgH - 2} textAnchor="middle" fill={v === 50 ? '#9ca3af' : '#d1d5db'} fontSize={9} fontWeight={v === 50 ? 600 : 400}>{v}</text>
                  </g>
                ))}
                {/* 각 기질 척도 */}
                {temperamentScales.map((s, i) => {
                  const d = analysis[s];
                  const cy = i * rowH + 45;
                  const xA = toX(d.scoreA);
                  const xB = toX(d.scoreB);
                  const lo = Math.min(xA, xB), hi = Math.max(xA, xB);
                  const gc = gapSvg[d.gapCategory] || gapSvg.moderate;
                  const tr = traitDir[s];
                  const near = Math.abs(xA - xB) < 28;
                  const aLabelY = near && d.scoreA < d.scoreB ? cy + 23 : cy - 16;
                  const bLabelY = near && d.scoreB <= d.scoreA ? cy + 23 : cy - 16;
                  return (
                    <g key={s}>
                      {/* 지표명 */}
                      <text x={0} y={cy - 6} fill="#374151" fontSize={12} fontWeight={700}>{scaleLabels[s]}</text>
                      <text x={0} y={cy + 8} fill="#9ca3af" fontSize={9}>({s})</text>
                      {/* 트랙 */}
                      <rect x={tL} y={cy - 14} width={tW} height={28} rx={14} fill="#f9fafb" stroke="#e5e7eb" strokeWidth={0.5} />
                      <line x1={toX(50)} y1={cy - 8} x2={toX(50)} y2={cy + 8} stroke="#d1d5db" strokeWidth={1} strokeDasharray="2,2" />
                      {/* 차이 구간 하이라이트 + 연결선 */}
                      {hi - lo > 2 && <rect x={lo} y={cy - 7} width={hi - lo} height={14} rx={7} fill={gc.fill} opacity={0.5} />}
                      {hi - lo > 2 && <line x1={lo} y1={cy} x2={hi} y2={cy} stroke="#94a3b8" strokeWidth={2} strokeLinecap="round" opacity={0.4} />}
                      {/* A 도트 */}
                      <circle cx={xA} cy={cy} r={9} fill={COLOR_A} stroke="white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 3px rgba(96,165,250,0.4))' }} />
                      <text x={xA} y={aLabelY} textAnchor="middle" fill="#3B82F6" fontSize={10} fontWeight={700}>{d.scoreA}</text>
                      {/* B 도트 */}
                      <circle cx={xB} cy={cy} r={9} fill={COLOR_B} stroke="white" strokeWidth={2.5} style={{ filter: 'drop-shadow(0 1px 3px rgba(249,115,22,0.4))' }} />
                      <text x={xB} y={bLabelY} textAnchor="middle" fill="#EA580C" fontSize={10} fontWeight={700}>{d.scoreB}</text>
                      {/* 차이 뱃지 */}
                      <rect x={498} y={cy - 10} width={56} height={20} rx={10} fill={gc.fill} stroke={gc.stroke} strokeWidth={0.5} />
                      <text x={526} y={cy + 4} textAnchor="middle" fill={gc.text} fontSize={9} fontWeight={700}>차이 {d.gap}</text>
                      {/* 양 끝 특성 라벨 */}
                      <text x={tL + 4} y={cy + 28} fill="#d1d5db" fontSize={8}>← {tr.low}</text>
                      <text x={tR - 4} y={cy + 28} textAnchor="end" fill="#d1d5db" fontSize={8}>{tr.high} →</text>
                    </g>
                  );
                })}
              </svg>
            );
          })()}
          <div className="flex gap-4 mt-2 text-xs text-gray-500 justify-center">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> 유사(≤10)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"></span> 보통(11~25)</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"></span> 대비(26+)</span>
          </div>
        </div>

        {/* 성격 (각자의 성숙도) */}
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <h4 className="font-bold text-gray-700 mb-1">성격 성숙도</h4>
          <p className="text-xs text-gray-400 mb-4">노력으로 성장 가능한 영역 — 각자의 현재 수준입니다</p>
          <div className="grid grid-cols-2 gap-6">
            {/* A */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_A }}></div>
                <span className="text-sm font-bold text-gray-700">{nameA}</span>
              </div>
              <div className="space-y-2.5">
                {['SD', 'CO', 'ST'].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-gray-500 text-right">{scaleLabels[s]}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${analysis[s].scoreA}%`, backgroundColor: COLOR_A, opacity: 0.7 }} />
                    </div>
                    <span className="w-7 text-xs font-bold text-right" style={{ color: COLOR_A }}>{analysis[s].scoreA}</span>
                  </div>
                ))}
              </div>
            </div>
            {/* B */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLOR_B }}></div>
                <span className="text-sm font-bold text-gray-700">{nameB}</span>
              </div>
              <div className="space-y-2.5">
                {['SD', 'CO', 'ST'].map(s => (
                  <div key={s} className="flex items-center gap-2">
                    <span className="w-16 text-xs text-gray-500 text-right">{scaleLabels[s]}</span>
                    <div className="flex-1 h-4 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${analysis[s].scoreB}%`, backgroundColor: COLOR_B, opacity: 0.7 }} />
                    </div>
                    <span className="w-7 text-xs font-bold text-right" style={{ color: COLOR_B }}>{analysis[s].scoreB}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* AI 심층 분석 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">🤖</span>
              <div>
                <h4 className="font-bold text-white text-lg">AI 심층 분석</h4>
                <p className="text-violet-200 text-xs">Claude가 두 분의 TCI 데이터를 기반으로 분석합니다</p>
              </div>
            </div>
            {aiAnalysis && !aiLoading && (
              <button
                onClick={fetchAiAnalysis}
                className="px-3 py-1.5 bg-white/20 hover:bg-white/30 text-white rounded-lg text-xs font-medium transition"
              >
                다시 분석
              </button>
            )}
          </div>
          <div className="p-6">
            {/* 초기 상태: 분석 버튼 */}
            {!aiAnalysis && !aiLoading && !aiError && (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm mb-4">두 사람의 점수 패턴을 AI가 심층 분석하여<br/>구체적인 관계 역동과 실천 제안을 제공합니다.</p>
                <button
                  onClick={fetchAiAnalysis}
                  className="px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 transition shadow-lg shadow-violet-200"
                >
                  AI 심층 분석 시작
                </button>
              </div>
            )}
            {/* 로딩 중 */}
            {aiLoading && (
              <div className="space-y-4 py-4">
                {['핵심 역동 분석 중...', '관계 강점 도출 중...', '활용 전략 수립 중...', '실천 제안 생성 중...'].map((label, i) => (
                  <div key={i} className="animate-pulse flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gray-200"></div>
                    <div className="flex-1">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="h-2 bg-gray-100 rounded w-full"></div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-violet-500 font-medium mt-4">AI가 분석 중입니다...</p>
              </div>
            )}
            {/* 에러 */}
            {aiError && (
              <div className="text-center py-6">
                <p className="text-red-500 text-sm mb-3">{aiError}</p>
                <button
                  onClick={fetchAiAnalysis}
                  className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-medium hover:bg-red-100 transition border border-red-200"
                >
                  다시 시도
                </button>
              </div>
            )}
            {/* 분석 결과 */}
            {aiAnalysis && !aiLoading && (
              <div className="grid grid-cols-2 gap-4">
                {parseAiSections(aiAnalysis).map((section, idx) => (
                  <div key={idx} className={`${section.bg} rounded-xl p-5 border ${section.border}`}>
                    <h5 className={`font-bold ${section.title} mb-2 flex items-center gap-2`}>
                      <span>{section.icon}</span> {section.key}
                    </h5>
                    <div className={`text-sm ${section.body} leading-relaxed whitespace-pre-line`}
                      dangerouslySetInnerHTML={{ __html: section.content
                        .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\*(.+?)\*/g, '<em>$1</em>')
                        .replace(/^- /gm, '• ')
                      }}
                    />
                  </div>
                ))}
              </div>
            )}
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
          <button
            onClick={handleDownloadCouplePDF}
            disabled={pdfLoading}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-pink-600 text-white rounded-lg text-sm font-medium hover:from-rose-700 hover:to-pink-700 disabled:opacity-50 flex items-center gap-2 shadow-sm"
          >
            {pdfLoading ? (
              <><svg className="animate-spin h-4 w-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg> 생성중...</>
            ) : (
              <>PDF 다운로드</>
            )}
          </button>
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
