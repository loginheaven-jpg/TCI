import React, { useState, useRef } from 'react';
import Button from '../ui/Button';
import Tabs from '../ui/Tabs';
import ProfileSummary from './ProfileSummary';
import MaturityWarning from './MaturityWarning';
import TemperamentAnalysis from './TemperamentAnalysis';
import CharacterAnalysis from './CharacterAnalysis';
import InteractionAnalysis from './InteractionAnalysis';
import SubscaleDetail from './SubscaleDetail';
import CoachingGuide from './CoachingGuide';
import { generateIndividualReportPDF } from '../../utils/pdfGenerator';

export default function IndividualReport({ member, onBack }) {
  const [activeTab, setActiveTab] = useState('summary');
  const [exporting, setExporting] = useState(false);
  const reportRef = useRef(null);

  if (!member) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">멤버 정보를 찾을 수 없습니다.</p>
        <Button variant="secondary" onClick={onBack} className="mt-4">
          돌아가기
        </Button>
      </div>
    );
  }

  const tabs = [
    { id: 'summary', label: '프로파일', icon: '📊' },
    { id: 'temperament', label: '기질 분석', icon: '🧠' },
    { id: 'character', label: '성격 분석', icon: '💚' },
    { id: 'interaction', label: '상호작용', icon: '🔄' },
    { id: 'subscale', label: '하위척도', icon: '📋' },
    { id: 'coaching', label: '코칭가이드', icon: '🎯' },
  ];

  const handleExportPDF = async () => {
    setExporting(true);
    try {
      const element = reportRef.current;
      if (element) {
        await generateIndividualReportPDF(element, member.name);
      }
    } catch (err) {
      console.error('PDF 내보내기 실패:', err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center
                      hover:bg-gray-200 transition text-gray-600"
          >
            ←
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
            <p className="text-gray-500">개인 TCI 분석 리포트</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2">
            <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
              기질: {member.temperament_type || '-'}
            </span>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
              성격: {member.character_type || '-'}
            </span>
          </div>
          <Button
            variant="primary"
            onClick={handleExportPDF}
            loading={exporting}
          >
            PDF 내보내기
          </Button>
        </div>
      </div>

      {/* 성숙도 경고 */}
      <MaturityWarning member={member} />

      {/* 탭 네비게이션 */}
      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      {/* 탭 컨텐츠 */}
      <div ref={reportRef} id="individual-report-content">
        {activeTab === 'summary' && (
          <div className="space-y-6">
            <ProfileSummary member={member} />

            {/* 퀵 네비게이션 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => setActiveTab('temperament')}
                className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl text-left
                          hover:shadow-lg hover:shadow-blue-500/10 transition-all"
              >
                <span className="text-2xl mb-2 block">🧠</span>
                <div className="font-semibold text-gray-800">기질 분석</div>
                <div className="text-sm text-gray-500">27유형 상세 분석</div>
              </button>
              <button
                onClick={() => setActiveTab('character')}
                className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl text-left
                          hover:shadow-lg hover:shadow-emerald-500/10 transition-all"
              >
                <span className="text-2xl mb-2 block">💚</span>
                <div className="font-semibold text-gray-800">성격 분석</div>
                <div className="text-sm text-gray-500">성격 발달 수준</div>
              </button>
              <button
                onClick={() => setActiveTab('interaction')}
                className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl text-left
                          hover:shadow-lg hover:shadow-purple-500/10 transition-all"
              >
                <span className="text-2xl mb-2 block">🔄</span>
                <div className="font-semibold text-gray-800">상호작용</div>
                <div className="text-sm text-gray-500">기질 간 역동</div>
              </button>
              <button
                onClick={() => setActiveTab('coaching')}
                className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl text-left
                          hover:shadow-lg hover:shadow-indigo-500/10 transition-all"
              >
                <span className="text-2xl mb-2 block">🎯</span>
                <div className="font-semibold text-gray-800">코칭 가이드</div>
                <div className="text-sm text-gray-500">맞춤 발전 방향</div>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'temperament' && <TemperamentAnalysis member={member} />}

        {activeTab === 'character' && <CharacterAnalysis member={member} />}

        {activeTab === 'interaction' && <InteractionAnalysis member={member} />}

        {activeTab === 'subscale' && <SubscaleDetail member={member} />}

        {activeTab === 'coaching' && <CoachingGuide member={member} />}
      </div>

      {/* 하단 네비게이션 */}
      <div className="flex items-center justify-between pt-6 border-t border-gray-100">
        <Button variant="secondary" onClick={onBack}>
          목록으로 돌아가기
        </Button>
        <div className="flex items-center gap-2">
          {tabs.map((tab, idx) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`w-2 h-2 rounded-full transition-all ${
                activeTab === tab.id ? 'bg-blue-500 w-4' : 'bg-gray-300'
              }`}
              title={tab.label}
            />
          ))}
        </div>
        <Button variant="primary" onClick={handleExportPDF} loading={exporting}>
          PDF 저장
        </Button>
      </div>
    </div>
  );
}
