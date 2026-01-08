import React, { useState, useRef } from 'react';

// 상위척도 코드 배열
const MAIN_SCALE_CODES = ['NS', 'HA', 'RD', 'PS', 'SD', 'CO', 'ST'];

// 하위척도 그룹
const SUB_SCALE_GROUPS = {
  NS: ['NS1', 'NS2', 'NS3', 'NS4'],
  HA: ['HA1', 'HA2', 'HA3', 'HA4'],
  RD: ['RD1', 'RD2', 'RD3', 'RD4'],
  PS: ['PS1', 'PS2', 'PS3', 'PS4'],
  SD: ['SD1', 'SD2', 'SD3', 'SD4', 'SD5'],
  CO: ['CO1', 'CO2', 'CO3', 'CO4', 'CO5'],
  ST: ['ST1', 'ST2', 'ST3']
};

// 모든 하위척도 코드
const ALL_SUB_SCALE_CODES = Object.values(SUB_SCALE_GROUPS).flat();

// 상위척도 라벨
const scaleLabels = {
  NS: '탐색성', HA: '불확실성 센서', RD: '관계 민감성', PS: '실행 일관성',
  SD: '자율성', CO: '협력', ST: '자기초월'
};

// 태그 입력 컴포넌트
function TagInput({ tags = [], onChange, placeholder = '입력 후 Enter' }) {
  const [input, setInput] = useState('');

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && input.trim()) {
      e.preventDefault();
      if (!tags.includes(input.trim())) {
        onChange([...tags, input.trim()]);
      }
      setInput('');
    }
  };

  const removeTag = (idx) => {
    onChange(tags.filter((_, i) => i !== idx));
  };

  return (
    <div className="border border-gray-200 rounded-lg p-2 focus-within:ring-2 focus-within:ring-blue-500">
      <div className="flex flex-wrap gap-1 mb-2">
        {tags.map((tag, idx) => (
          <span key={idx} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(idx)} className="hover:text-blue-900">&times;</button>
          </span>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="w-full outline-none text-sm"
      />
    </div>
  );
}

export default function SettingsPage({
  mainScaleTraits,
  scaleTraits,
  norms,
  onUpdateMainScaleTraits,
  onUpdateScaleTraits,
  onUpdateNorms,
  onBack
}) {
  const [activeTab, setActiveTab] = useState('main'); // 'main' | 'sub' | 'norms'
  const [selectedMainScale, setSelectedMainScale] = useState('NS');
  const [selectedSubScale, setSelectedSubScale] = useState('NS1');
  const fileInputRef = useRef(null);

  // 로컬 편집 상태
  const [editedMainTraits, setEditedMainTraits] = useState(() => JSON.parse(JSON.stringify(mainScaleTraits)));
  const [editedSubTraits, setEditedSubTraits] = useState(() => JSON.parse(JSON.stringify(scaleTraits)));
  const [editedNorms, setEditedNorms] = useState(() => JSON.parse(JSON.stringify(norms)));

  // JSON 내보내기
  const handleExport = () => {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      mainScaleTraits: editedMainTraits,
      scaleTraits: editedSubTraits,
      norms: editedNorms
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tci-scale-definitions-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // JSON 가져오기
  const handleImport = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.mainScaleTraits) setEditedMainTraits(data.mainScaleTraits);
        if (data.scaleTraits) setEditedSubTraits(data.scaleTraits);
        if (data.norms) setEditedNorms(data.norms);
        alert('설정을 성공적으로 가져왔습니다.');
      } catch (err) {
        alert('JSON 파일 형식이 올바르지 않습니다: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // 같은 파일 다시 선택 가능하게
  };

  // 저장
  const handleSave = () => {
    onUpdateMainScaleTraits(editedMainTraits);
    onUpdateScaleTraits(editedSubTraits);
    onUpdateNorms(editedNorms);
    alert('설정이 저장되었습니다.');
  };

  // 초기화
  const handleReset = () => {
    if (window.confirm('모든 설정을 기본값으로 초기화하시겠습니까?')) {
      onUpdateMainScaleTraits(null);
      onUpdateScaleTraits(null);
      onUpdateNorms(null);
      // 편집 상태도 props로 받은 원본으로 초기화
      setEditedMainTraits(JSON.parse(JSON.stringify(mainScaleTraits)));
      setEditedSubTraits(JSON.parse(JSON.stringify(scaleTraits)));
      setEditedNorms(JSON.parse(JSON.stringify(norms)));
      alert('기본값으로 초기화되었습니다.');
    }
  };

  // 상위척도 필드 업데이트
  const updateMainField = (code, field, value) => {
    setEditedMainTraits(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: value }
    }));
  };

  // 하위척도 필드 업데이트
  const updateSubField = (code, field, value) => {
    setEditedSubTraits(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: value }
    }));
  };

  // 규준 필드 업데이트
  const updateNormField = (code, field, value) => {
    setEditedNorms(prev => ({
      ...prev,
      [code]: { ...prev[code], [field]: parseFloat(value) || 0 }
    }));
  };

  // 현재 선택된 상위척도 데이터
  const currentMainData = editedMainTraits[selectedMainScale] || {};

  // 현재 선택된 하위척도 데이터
  const currentSubData = editedSubTraits[selectedSubScale] || {};

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-5xl mx-auto">
        {/* 헤더 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button onClick={onBack}
              className="text-gray-500 hover:text-gray-700 flex items-center gap-2 font-medium">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              뒤로가기
            </button>
            <h1 className="text-2xl font-bold text-gray-800">지표 설정</h1>
          </div>
          <div className="flex gap-2">
            <button onClick={() => fileInputRef.current?.click()}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              가져오기
            </button>
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
            <button onClick={handleExport}
              className="px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              내보내기
            </button>
          </div>
        </div>

        {/* 탭 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-1.5 mb-4 inline-flex gap-1">
          {[
            { key: 'main', label: '상위척도 (7개)' },
            { key: 'sub', label: '하위척도 (23개)' },
            { key: 'norms', label: '규준 데이터' }
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === tab.key ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-100'
              }`}>
              {tab.label}
            </button>
          ))}
        </div>

        {/* 상위척도 탭 */}
        {activeTab === 'main' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {/* 척도 선택 버튼 */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {MAIN_SCALE_CODES.map(code => (
                <button key={code} onClick={() => setSelectedMainScale(code)}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    selectedMainScale === code
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}>
                  {code} ({scaleLabels[code]})
                </button>
              ))}
            </div>

            {/* 편집 폼 */}
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">척도 설명</label>
                <textarea
                  value={currentMainData.description || ''}
                  onChange={(e) => updateMainField(selectedMainScale, 'description', e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition resize-none"
                  placeholder="척도에 대한 설명을 입력하세요"
                />
              </div>

              {/* 높을 때 섹션 */}
              <div className="bg-blue-50 rounded-xl p-4">
                <h3 className="font-bold text-blue-700 mb-4">높을 때</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">페르소나</label>
                    <input
                      type="text"
                      value={currentMainData.highPersona || ''}
                      onChange={(e) => updateMainField(selectedMainScale, 'highPersona', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 탐험가(Explorer)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">페르소나 설명</label>
                    <input
                      type="text"
                      value={currentMainData.highPersonaDesc || ''}
                      onChange={(e) => updateMainField(selectedMainScale, 'highPersonaDesc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="페르소나에 대한 설명"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">장점</label>
                    <TagInput
                      tags={currentMainData.highAdv || []}
                      onChange={(tags) => updateMainField(selectedMainScale, 'highAdv', tags)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">단점</label>
                    <TagInput
                      tags={currentMainData.highDis || []}
                      onChange={(tags) => updateMainField(selectedMainScale, 'highDis', tags)}
                    />
                  </div>
                </div>
              </div>

              {/* 낮을 때 섹션 */}
              <div className="bg-orange-50 rounded-xl p-4">
                <h3 className="font-bold text-orange-700 mb-4">낮을 때</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">페르소나</label>
                    <input
                      type="text"
                      value={currentMainData.lowPersona || ''}
                      onChange={(e) => updateMainField(selectedMainScale, 'lowPersona', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="예: 보존가(Preserver)"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">페르소나 설명</label>
                    <input
                      type="text"
                      value={currentMainData.lowPersonaDesc || ''}
                      onChange={(e) => updateMainField(selectedMainScale, 'lowPersonaDesc', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="페르소나에 대한 설명"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">장점</label>
                    <TagInput
                      tags={currentMainData.lowAdv || []}
                      onChange={(tags) => updateMainField(selectedMainScale, 'lowAdv', tags)}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">단점</label>
                    <TagInput
                      tags={currentMainData.lowDis || []}
                      onChange={(tags) => updateMainField(selectedMainScale, 'lowDis', tags)}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 하위척도 탭 */}
        {activeTab === 'sub' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            {/* 상위척도 그룹 선택 */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {MAIN_SCALE_CODES.map(code => (
                <button key={code} onClick={() => {
                  setSelectedSubScale(SUB_SCALE_GROUPS[code][0]);
                }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    SUB_SCALE_GROUPS[selectedSubScale.substring(0, 2)]?.includes(selectedSubScale) &&
                    selectedSubScale.substring(0, 2) === code
                      ? 'bg-blue-100 text-blue-700'
                      : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                  }`}>
                  {code}
                </button>
              ))}
            </div>

            {/* 하위척도 선택 버튼 */}
            <div className="flex gap-2 mb-6 flex-wrap">
              {ALL_SUB_SCALE_CODES.map(code => (
                <button key={code} onClick={() => setSelectedSubScale(code)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                    selectedSubScale === code
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}>
                  {code}
                </button>
              ))}
            </div>

            {/* 편집 폼 */}
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">척도명</label>
                  <input
                    type="text"
                    value={currentSubData.name || ''}
                    onChange={(e) => updateSubField(selectedSubScale, 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 신박성"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">낮을 때 레이블</label>
                  <input
                    type="text"
                    value={currentSubData.lowLabel || ''}
                    onChange={(e) => updateSubField(selectedSubScale, 'lowLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 현재의 가치"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">높을 때 레이블</label>
                  <input
                    type="text"
                    value={currentSubData.highLabel || ''}
                    onChange={(e) => updateSubField(selectedSubScale, 'highLabel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 새로운 것의 가치"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">핵심 설명 (coreDescription)</label>
                <textarea
                  value={currentSubData.coreDescription || ''}
                  onChange={(e) => updateSubField(selectedSubScale, 'coreDescription', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none"
                  placeholder="척도의 핵심 의미를 설명하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">상세 설명 (description)</label>
                <textarea
                  value={currentSubData.description || ''}
                  onChange={(e) => updateSubField(selectedSubScale, 'description', e.target.value)}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 transition resize-none"
                  placeholder="척도에 대한 상세 설명"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* 높을 때 */}
                <div className="bg-blue-50 rounded-xl p-4">
                  <h4 className="font-bold text-blue-700 mb-3">높을 때</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">장점</label>
                      <TagInput
                        tags={currentSubData.highAdv || []}
                        onChange={(tags) => updateSubField(selectedSubScale, 'highAdv', tags)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">단점</label>
                      <TagInput
                        tags={currentSubData.highDis || []}
                        onChange={(tags) => updateSubField(selectedSubScale, 'highDis', tags)}
                      />
                    </div>
                  </div>
                </div>

                {/* 낮을 때 */}
                <div className="bg-orange-50 rounded-xl p-4">
                  <h4 className="font-bold text-orange-700 mb-3">낮을 때</h4>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">장점</label>
                      <TagInput
                        tags={currentSubData.lowAdv || []}
                        onChange={(tags) => updateSubField(selectedSubScale, 'lowAdv', tags)}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-600 mb-1">단점</label>
                      <TagInput
                        tags={currentSubData.lowDis || []}
                        onChange={(tags) => updateSubField(selectedSubScale, 'lowDis', tags)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 규준 탭 */}
        {activeTab === 'norms' && (
          <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
            <p className="text-gray-500 mb-4">각 하위척도의 규준 평균(M)과 표준편차(SD)를 설정합니다.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {ALL_SUB_SCALE_CODES.map(code => {
                const normData = editedNorms[code] || { m: 0, sd: 0 };
                const subData = editedSubTraits[code] || {};
                return (
                  <div key={code} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-gray-700">{code}</span>
                      <span className="text-sm text-gray-500">{subData.name || ''}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">평균 (M)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={normData.m}
                          onChange={(e) => updateNormField(code, 'm', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">표준편차 (SD)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={normData.sd}
                          onChange={(e) => updateNormField(code, 'sd', e.target.value)}
                          className="w-full px-2 py-1.5 border border-gray-200 rounded text-sm focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 하단 버튼 */}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={handleReset}
            className="px-6 py-2.5 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition">
            기본값으로 초기화
          </button>
          <button onClick={handleSave}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-medium hover:from-blue-700 hover:to-blue-800 transition shadow-lg shadow-blue-500/25">
            저장
          </button>
        </div>
      </div>
    </div>
  );
}
