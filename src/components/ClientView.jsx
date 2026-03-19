import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { pdf } from '@react-pdf/renderer';
import PDFReport from './PDFReport';
import { checkCharacterGrowthNeeds } from '../data/interpretations';

const SCALE_LABELS = {
  NS: '자극추구', HA: '위험회피', RD: '사회적민감성', PS: '인내력',
  SD: '자율성', CO: '연대감', ST: '자기초월'
};

const TEMPERAMENT_SCALES = ['NS', 'HA', 'RD', 'PS'];
const CHARACTER_SCALES = ['SD', 'CO', 'ST'];

// 백분위 → 레벨
function getLevel(percentile) {
  if (percentile == null) return 'M';
  if (percentile >= 65) return 'H';
  if (percentile <= 35) return 'L';
  return 'M';
}

const LEVEL_CONFIG = {
  H: { label: '높음', color: 'bg-blue-100 text-blue-700', bar: 'bg-blue-500' },
  M: { label: '보통', color: 'bg-gray-100 text-gray-600', bar: 'bg-gray-400' },
  L: { label: '낮음', color: 'bg-orange-100 text-orange-700', bar: 'bg-orange-400' }
};

export default function ClientView({ user, userProfile, onSignOut, norms, mainScaleTraits, scaleTraits }) {
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [pdfLoading, setPdfLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('members')
        .select('*, groups(name, created_at)')
        .eq('client_user_id', user.id)
        .order('created_at', { ascending: false });
      if (!error && data?.length > 0) {
        setMembers(data);
        setSelectedMember(data[0]);
      } else {
        setMembers([]);
      }
      setLoading(false);
    };
    fetchMembers();
  }, [user.id]);

  // PDF 다운로드 (indicators 모드)
  const handlePdfDownload = async () => {
    if (!selectedMember) return;
    setPdfLoading(true);
    try {
      const memberData = buildMemberData(selectedMember);
      const blob = await pdf(
        <PDFReport
          member={memberData}
          reportType="indicators"
          norms={norms}
          mainScaleTraits={mainScaleTraits}
          scaleTraits={scaleTraits}
        />
      ).toBlob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TCI_${memberData.name}_indicators.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('PDF 오류:', e);
    }
    setPdfLoading(false);
  };

  // DB 레코드 → PDFReport / 분석용 형식 변환
  const buildMemberData = (m) => ({
    name: m.name,
    gender: m.gender,
    age: m.age,
    createdAt: m.created_at?.split('T')[0] || '',
    groupName: m.groups?.name || '',
    NS: m.ns, HA: m.ha, RD: m.rd, PS: m.ps,
    SD: m.sd, CO: m.co, ST: m.st,
    NS_T: m.ns_t, HA_T: m.ha_t, RD_T: m.rd_t, PS_T: m.ps_t,
    SD_T: m.sd_t, CO_T: m.co_t, ST_T: m.st_t,
    NS_P: m.ns_p, HA_P: m.ha_p, RD_P: m.rd_p, PS_P: m.ps_p,
    SD_P: m.sd_p, CO_P: m.co_p, ST_P: m.st_p,
    NS1: m.ns1, NS2: m.ns2, NS3: m.ns3, NS4: m.ns4,
    HA1: m.ha1, HA2: m.ha2, HA3: m.ha3, HA4: m.ha4,
    RD1: m.rd1, RD2: m.rd2, RD3: m.rd3, RD4: m.rd4,
    PS1: m.ps1, PS2: m.ps2, PS3: m.ps3, PS4: m.ps4,
    SD1: m.sd1, SD2: m.sd2, SD3: m.sd3, SD4: m.sd4, SD5: m.sd5,
    CO1: m.co1, CO2: m.co2, CO3: m.co3, CO4: m.co4, CO5: m.co5,
    ST1: m.st1, ST2: m.st2, ST3: m.st3,
    temperament_type: m.temperament_type,
    character_type: m.character_type
  });

  const m = selectedMember;
  const growthNeeds = m ? checkCharacterGrowthNeeds(m.sd, m.co) : null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-teal-600 rounded-2xl mb-3 shadow-lg">
            <span className="text-white text-xl font-bold">TCI</span>
          </div>
          <p className="text-slate-500 text-sm mt-2">결과를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-3xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">TCI</span>
            </div>
            <span className="font-semibold text-slate-800 text-sm">기질 및 성격검사 결과</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{userProfile?.name || user.email}</span>
            <button
              onClick={onSignOut}
              className="text-xs text-slate-400 hover:text-slate-600 border border-slate-200 rounded-lg px-2.5 py-1 hover:bg-slate-50"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-6">
        {/* 연결된 결과 없는 경우 */}
        {members.length === 0 ? (
          <div className="bg-white rounded-2xl p-16 text-center shadow-sm border border-slate-100">
            <div className="text-5xl mb-4">📋</div>
            <h2 className="text-lg font-semibold text-slate-700 mb-2">검사 결과가 아직 연결되지 않았습니다</h2>
            <p className="text-slate-500 text-sm">상담자에게 결과 열람 권한을 요청해 주세요.</p>
          </div>
        ) : (
          <>
            {/* 여러 검사 이력이 있을 경우 선택 */}
            {members.length > 1 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">검사 이력 선택</label>
                <select
                  value={members.indexOf(selectedMember)}
                  onChange={e => setSelectedMember(members[parseInt(e.target.value)])}
                  className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  {members.map((mem, i) => (
                    <option key={mem.id} value={i}>
                      {mem.groups?.name || '—'} · {mem.created_at?.split('T')[0]}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* 결과 카드 */}
            {m && (
              <div className="space-y-4">
                {/* 개인 정보 헤더 */}
                <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-xl font-bold">{m.name}</h2>
                      <div className="flex items-center gap-3 mt-1 text-teal-100 text-sm">
                        {m.gender && <span>{m.gender}</span>}
                        {m.age && <span>{m.age}세</span>}
                        {m.groups?.name && <span>그룹: {m.groups.name}</span>}
                      </div>
                      <p className="text-teal-200 text-xs mt-1">
                        검사일: {m.created_at?.split('T')[0] || '—'}
                      </p>
                    </div>
                    <button
                      onClick={handlePdfDownload}
                      disabled={pdfLoading}
                      className="px-3 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium text-white border border-white/30 transition-colors disabled:opacity-50"
                    >
                      {pdfLoading ? '생성 중...' : 'PDF 저장'}
                    </button>
                  </div>
                </div>

                {/* 성격 성장 포인트 경고 */}
                {growthNeeds && (
                  <div className={`rounded-xl p-4 border ${
                    growthNeeds.severity === 'high'
                      ? 'bg-amber-50 border-amber-200'
                      : 'bg-yellow-50 border-yellow-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      <span className="text-lg">🌱</span>
                      <div>
                        <p className={`font-semibold text-sm ${
                          growthNeeds.severity === 'high' ? 'text-amber-800' : 'text-yellow-800'
                        }`}>성격 성장 포인트</p>
                        <p className={`text-xs mt-0.5 leading-relaxed ${
                          growthNeeds.severity === 'high' ? 'text-amber-700' : 'text-yellow-700'
                        }`}>{growthNeeds.message}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* 상위지표 — 기질 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-3 bg-blue-50 border-b border-blue-100">
                    <h3 className="font-bold text-blue-800 text-sm">기질 척도</h3>
                    <p className="text-xs text-blue-600 mt-0.5">타고난 기질적 특성</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {TEMPERAMENT_SCALES.map(scale => {
                      const score = m[scale.toLowerCase()];
                      const percentile = m[`${scale.toLowerCase()}_p`];
                      const level = getLevel(percentile ?? score);
                      const lc = LEVEL_CONFIG[level];
                      const traits = mainScaleTraits?.[scale];
                      return (
                        <div key={scale} className="px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-8">{scale}</span>
                              <span className="font-semibold text-slate-800 text-sm">{SCALE_LABELS[scale]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">{score ?? '—'}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lc.color}`}>
                                {lc.label}
                              </span>
                            </div>
                          </div>
                          {/* 점수 바 */}
                          <div className="h-1.5 bg-slate-100 rounded-full mb-2">
                            <div
                              className={`h-1.5 rounded-full ${lc.bar}`}
                              style={{ width: `${Math.min(100, score ?? 50)}%` }}
                            />
                          </div>
                          {traits?.description && (
                            <p className="text-xs text-slate-500 leading-relaxed">{traits.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 상위지표 — 성격 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-3 bg-emerald-50 border-b border-emerald-100">
                    <h3 className="font-bold text-emerald-800 text-sm">성격 척도</h3>
                    <p className="text-xs text-emerald-600 mt-0.5">자기 이해와 성장 역량</p>
                  </div>
                  <div className="divide-y divide-slate-50">
                    {CHARACTER_SCALES.map(scale => {
                      const score = m[scale.toLowerCase()];
                      const percentile = m[`${scale.toLowerCase()}_p`];
                      const level = getLevel(percentile ?? score);
                      const lc = LEVEL_CONFIG[level];
                      const traits = mainScaleTraits?.[scale];
                      return (
                        <div key={scale} className="px-5 py-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-400 w-8">{scale}</span>
                              <span className="font-semibold text-slate-800 text-sm">{SCALE_LABELS[scale]}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-slate-700">{score ?? '—'}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${lc.color}`}>
                                {lc.label}
                              </span>
                            </div>
                          </div>
                          <div className="h-1.5 bg-slate-100 rounded-full mb-2">
                            <div
                              className={`h-1.5 rounded-full ${lc.bar}`}
                              style={{ width: `${Math.min(100, score ?? 50)}%` }}
                            />
                          </div>
                          {traits?.description && (
                            <p className="text-xs text-slate-500 leading-relaxed">{traits.description}</p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 하위지표 — 기질 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700 text-sm">하위지표 상세 — 기질</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 uppercase">
                          <th className="px-4 py-2 text-left">척도</th>
                          <th className="px-4 py-2 text-right">점수</th>
                          <th className="px-4 py-2 text-left">하위 척도명</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { scale: 'NS', subs: [['NS1','탐색적 흥분'],['NS2','충동성'],['NS3','사치/낭비'],['NS4','무질서']] },
                          { scale: 'HA', subs: [['HA1','예기불안'],['HA2','불확실성 두려움'],['HA3','낯선 이 수줍음'],['HA4','쉽게 피로']] },
                          { scale: 'RD', subs: [['RD1','정서적 감수성'],['RD2','정서적 개방성'],['RD3','친밀감'],['RD4','의존']] },
                          { scale: 'PS', subs: [['PS1','근면'],['PS2','끈기'],['PS3','성취 야망'],['PS4','완벽주의']] }
                        ].map(({ scale, subs }) =>
                          subs.map(([code, name], i) => (
                            <tr key={code} className="hover:bg-slate-50">
                              {i === 0 && (
                                <td rowSpan={4} className="px-4 py-2 font-bold text-slate-600 border-r border-slate-100 align-middle">
                                  {scale}
                                </td>
                              )}
                              <td className="px-4 py-2 text-right font-mono text-slate-700">
                                {m[code.toLowerCase()] ?? '—'}
                              </td>
                              <td className="px-4 py-2 text-slate-600">{name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 하위지표 — 성격 */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="px-5 py-3 bg-slate-50 border-b border-slate-100">
                    <h3 className="font-semibold text-slate-700 text-sm">하위지표 상세 — 성격</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs">
                      <thead>
                        <tr className="text-slate-400 uppercase">
                          <th className="px-4 py-2 text-left">척도</th>
                          <th className="px-4 py-2 text-right">점수</th>
                          <th className="px-4 py-2 text-left">하위 척도명</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {[
                          { scale: 'SD', subs: [['SD1','책임감'],['SD2','목적의식'],['SD3','유능감'],['SD4','자기수용'],['SD5','자기일치']] },
                          { scale: 'CO', subs: [['CO1','타인수용'],['CO2','공감'],['CO3','이타성'],['CO4','관대함'],['CO5','공평']] },
                          { scale: 'ST', subs: [['ST1','창조적 자기망각'],['ST2','우주만물 일체감'],['ST3','영성 수용']] }
                        ].map(({ scale, subs }) =>
                          subs.map(([code, name], i) => (
                            <tr key={code} className="hover:bg-slate-50">
                              {i === 0 && (
                                <td rowSpan={subs.length} className="px-4 py-2 font-bold text-slate-600 border-r border-slate-100 align-middle">
                                  {scale}
                                </td>
                              )}
                              <td className="px-4 py-2 text-right font-mono text-slate-700">
                                {m[code.toLowerCase()] ?? '—'}
                              </td>
                              <td className="px-4 py-2 text-slate-600">{name}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 푸터 */}
                <div className="text-center text-xs text-slate-400 py-4">
                  TCI 진단기반 코칭 서비스 · {new Date().getFullYear()}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
