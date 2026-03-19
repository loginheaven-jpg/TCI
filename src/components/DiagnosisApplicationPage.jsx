import React, { useState } from 'react';
import { supabase } from '../supabaseClient';

const STATUS_INFO = {
  pending: {
    label: '입금 대기 중',
    desc: '아래 계좌로 입금해 주세요. 입금 확인 후 카톡 또는 문자로 검사 링크가 발송됩니다.',
    color: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    icon: '⏳'
  },
  paid: {
    label: '입금 확인 완료',
    desc: '입금이 확인되었습니다. 곧 카톡 또는 문자로 검사 링크를 발송해 드립니다.',
    color: 'bg-blue-50 border-blue-200 text-blue-800',
    icon: '✅'
  },
  link_sent: {
    label: '검사 링크 발송 완료',
    desc: '카톡 또는 문자로 발송된 링크에서 검사를 진행해 주세요.',
    color: 'bg-purple-50 border-purple-200 text-purple-800',
    icon: '🔗'
  },
  completed: {
    label: '검사 완료',
    desc: '검사가 완료되었습니다. 결과는 상담자 검토 후 본 서비스를 통해 제공됩니다.',
    color: 'bg-green-50 border-green-200 text-green-800',
    icon: '🎉'
  },
  cancelled: {
    label: '신청 취소',
    desc: '신청이 취소되었습니다. 다시 신청하시려면 아래 버튼을 눌러주세요.',
    color: 'bg-gray-50 border-gray-200 text-gray-600',
    icon: '❌'
  }
};

export default function DiagnosisApplicationPage({ user, userProfile, application, onApply, onBack }) {
  const [applying, setApplying] = useState(false);
  const [done, setDone] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    const { error } = await supabase.from('diagnosis_applications').insert({
      user_id: user.id,
      name: userProfile?.name || '',
      phone: userProfile?.phone || ''
    });
    setApplying(false);
    if (!error) {
      setDone(true);
      if (onApply) onApply();
    } else {
      alert('신청 중 오류가 발생했습니다: ' + error.message);
    }
  };

  const statusInfo = application ? STATUS_INFO[application.status] : null;
  const canApply = !application || application.status === 'cancelled';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* 헤더 */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={onBack} className="text-slate-400 hover:text-slate-600 transition">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-teal-600 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">TCI</span>
            </div>
            <span className="font-semibold text-slate-800 text-sm">TCI 진단 신청</span>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-5">

        {/* 신청 현황 (기존 신청 있을 때) */}
        {statusInfo && !done && (
          <div className={`rounded-2xl border p-5 ${statusInfo.color}`}>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xl">{statusInfo.icon}</span>
              <span className="font-bold">{statusInfo.label}</span>
            </div>
            <p className="text-sm mt-1">{statusInfo.desc}</p>
            {application?.admin_note && (
              <p className="text-sm mt-2 font-medium">담당자 메모: {application.admin_note}</p>
            )}
            <p className="text-xs mt-2 opacity-70">
              신청일: {application.created_at?.split('T')[0]}
            </p>
          </div>
        )}

        {/* 신청 완료 메시지 */}
        {done && (
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-5 text-center">
            <div className="text-3xl mb-2">✅</div>
            <p className="font-bold text-teal-800">신청이 완료되었습니다!</p>
            <p className="text-sm text-teal-700 mt-1">
              아래 계좌로 입금해 주세요.<br />
              입금 확인 후 카톡 또는 문자로 검사 링크가 발송됩니다.
            </p>
          </div>
        )}

        {/* 1. 검사 비용 안내 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">1. 검사 비용 안내</h2>
          </div>
          <div className="p-5 space-y-3 text-sm">
            <div className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-2.5">
              <span className="text-slate-500 whitespace-nowrap">검사 비용</span>
              <div>
                <span className="font-bold text-slate-800 text-base">10,000원</span>
                <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">
                  진단시스템 사용료 및 세부진단리포트 제공료이며,<br />
                  해석상담·코칭 비용은 별도입니다.
                </p>
              </div>

              <span className="text-slate-500 whitespace-nowrap">입금 계좌</span>
              <div>
                <span className="font-semibold text-slate-800">토스은행 1000-3884-9129</span>
                <span className="text-slate-500 ml-2">예금주: 최철영</span>
              </div>

              <span className="text-slate-500 whitespace-nowrap">입금 기한</span>
              <span className="text-slate-800">신청일로부터 <span className="font-semibold">3일 이내</span></span>

              <span className="text-slate-500 whitespace-nowrap">입금자명</span>
              <span className="text-slate-800">
                가입 시 등록한 <span className="font-semibold">본인 이름</span>으로 입금해 주세요
              </span>

              <span className="text-slate-500 whitespace-nowrap">문의</span>
              <a href="tel:010-8870-9133" className="text-teal-600 font-semibold">010-8870-9133</a>
            </div>
          </div>
        </div>

        {/* 2. 검사 안내 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">2. 검사 안내</h2>
          </div>
          <div className="p-5 space-y-5 text-sm">
            <p className="text-slate-700">
              입금 확인 후 검사 링크가 <span className="font-semibold">카톡 또는 문자로 발송됩니다.</span>
              <br />
              <span className="text-slate-400 text-xs">검사 플랫폼: 마음사랑</span>
            </p>

            {/* 검사 전 준비 */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">검사 전 준비</h3>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  조용하고 방해받지 않는 환경에서 응답해 주세요.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  소요 시간은 약 <span className="font-semibold">20~30분</span>입니다.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  PC 또는 태블릿을 권장합니다. (스마트폰도 가능)
                </li>
              </ul>
            </div>

            {/* 검사 요령 */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">검사 요령</h3>
              <ul className="space-y-1.5 text-slate-600">
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  문항을 읽고 <span className="font-semibold">가장 먼저 떠오르는 반응</span>으로 답하세요.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  맞고 틀린 답이 없습니다. 현재의 나를 솔직하게 표현해 주세요.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  <span className="font-semibold">"이래야 한다, 이렇게 되고 싶다"</span>는 기준이 아닌,
                  현재 나의 모습으로 답해 주세요.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  이해가 어려운 문항은 <span className="font-semibold">평소 자신의 경향</span>을 기준으로 선택하세요.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-teal-500 mt-0.5">•</span>
                  중간에 중단하지 말고 <span className="font-semibold">한 번에 완료</span>해 주세요.
                </li>
              </ul>
            </div>

            {/* 검사 완료 후 */}
            <div>
              <h3 className="font-semibold text-slate-700 mb-2">검사 완료 후</h3>
              <p className="text-slate-600 mb-3">
                검사 완료 메시지를 확인하면 제출이 완료된 것입니다.
              </p>
              {/* 강조 박스 */}
              <div className="rounded-xl border-2 border-teal-300 bg-teal-50 p-4 space-y-2">
                <p className="font-bold text-teal-900 text-sm leading-relaxed">
                  🔔 TCI 진단은 자격을 갖춘 해석자에 의해 해석되고 진단상담이 이루어져야 합니다.
                </p>
                <p className="font-semibold text-teal-800 text-sm leading-relaxed">
                  검사 결과 개요는 본 서비스를 통해 제공되며, 세부적인 해석은 상담자의 해석상담을 통해 제공됩니다.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. 진행 일정 */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 bg-slate-50">
            <h2 className="font-bold text-slate-800">3. 진행 일정</h2>
          </div>
          <div className="p-5">
            <div className="space-y-3">
              {[
                { step: '입금', desc: '신청일로부터 3일 이내' },
                { step: '검사 링크 발송', desc: '입금 확인 후 카톡/문자 발송' },
                { step: '결과 제공', desc: '검사 완료 후 상담자 안내' }
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 flex items-center justify-between">
                    <span className="font-medium text-slate-700 text-sm">{item.step}</span>
                    <span className="text-slate-500 text-sm">{item.desc}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 신청 버튼 */}
        {canApply && !done && (
          <button
            onClick={handleApply}
            disabled={applying}
            className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-300 text-white font-bold rounded-2xl text-base transition shadow-lg shadow-teal-500/25 disabled:shadow-none"
          >
            {applying ? '신청 중...' : 'TCI 진단 신청하기'}
          </button>
        )}

        {!canApply && !done && application?.status !== 'cancelled' && (
          <p className="text-center text-sm text-slate-400">
            이미 신청이 접수되었습니다. 진행 상황은 위 현황을 확인해 주세요.
          </p>
        )}

        <div className="text-center text-xs text-slate-300 pb-4">
          TCI 진단기반 코칭 서비스 · {new Date().getFullYear()}
        </div>
      </div>
    </div>
  );
}
