import React, { useState } from 'react';
import Card from '../ui/Card';
import RadarChartView from './RadarChartView';
import BarChartView from './BarChartView';
import ScaleDetail from './ScaleDetail';
import { calculateCharacterType, calculateTypeDistribution, checkPersonalityDisorderTendency } from '../../utils/typeCalculator';
import { CHARACTER_TYPES } from '../../data/interpretations';
import Alert from '../ui/Alert';

const CHARACTER_SCALES = ['sd', 'co', 'st'];

export default function CharacterTab({ members = [], selectedMembers = [] }) {
  const [viewMode, setViewMode] = useState('radar'); // radar, bar, detail
  const [selectedScale, setSelectedScale] = useState(null);

  const displayMembers = selectedMembers.length > 0 ? selectedMembers : members;

  // 유형 분포 계산
  const typeDistribution = calculateTypeDistribution(members, 'character');
  const topTypes = Object.entries(typeDistribution)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  // 성격 장애 경향성 확인
  const warningMembers = members.filter((member) => {
    const result = checkPersonalityDisorderTendency(member.sd_p, member.co_p);
    return result.warning;
  });

  return (
    <div className="space-y-6">
      {/* 성숙도 경고 */}
      {warningMembers.length > 0 && (
        <Alert variant="warning">
          <div className="font-semibold mb-1">성격 발달 주의 필요 ({warningMembers.length}명)</div>
          <div className="text-sm">
            자율성(SD)과 연대감(CO)이 낮은 멤버가 있습니다. 개인 리포트에서 상세 내용을 확인하세요.
          </div>
          <div className="mt-2 flex flex-wrap gap-1">
            {warningMembers.slice(0, 5).map((member) => (
              <span
                key={member.id}
                className="px-2 py-0.5 bg-amber-100 rounded text-xs text-amber-800"
              >
                {member.name}
              </span>
            ))}
            {warningMembers.length > 5 && (
              <span className="text-xs text-amber-700">외 {warningMembers.length - 5}명</span>
            )}
          </div>
        </Alert>
      )}

      {/* 뷰 모드 선택 */}
      <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-xl w-fit">
        {[
          { key: 'radar', label: '레이더', icon: '📊' },
          { key: 'bar', label: '막대', icon: '📶' },
          { key: 'detail', label: '상세', icon: '📋' },
        ].map((mode) => (
          <button
            key={mode.key}
            onClick={() => {
              setViewMode(mode.key);
              setSelectedScale(null);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              viewMode === mode.key
                ? 'bg-white text-emerald-600 shadow-sm'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            {mode.icon} {mode.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 메인 차트 영역 */}
        <div className="lg:col-span-2">
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">
                성격 프로파일
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({displayMembers.length}명)
                </span>
              </h3>
            </div>

            {viewMode === 'radar' && (
              <RadarChartView
                members={displayMembers}
                scales={CHARACTER_SCALES}
                showAverage={displayMembers.length > 1}
              />
            )}

            {viewMode === 'bar' && (
              <BarChartView
                members={displayMembers}
                scales={CHARACTER_SCALES}
                showAverage={displayMembers.length > 1}
              />
            )}

            {viewMode === 'detail' && (
              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  {CHARACTER_SCALES.map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setSelectedScale(scale.toUpperCase())}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedScale === scale.toUpperCase()
                          ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/25'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {scale.toUpperCase()}
                    </button>
                  ))}
                </div>

                {selectedScale && (
                  <ScaleDetail scale={selectedScale} members={members} />
                )}

                {!selectedScale && (
                  <div className="text-center py-12 text-gray-500">
                    척도를 선택하여 상세 분석을 확인하세요
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>

        {/* 사이드바: 유형 분포 */}
        <div className="space-y-4">
          <Card>
            <h4 className="font-bold text-gray-800 mb-4">성격 유형 분포</h4>
            <div className="space-y-3">
              {topTypes.map(([type, typeMembers]) => {
                const typeInfo = CHARACTER_TYPES[type];
                const percentage = Math.round((typeMembers.length / members.length) * 100);

                return (
                  <div key={type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium text-gray-800">
                        {type}{' '}
                        <span className="text-gray-500 font-normal">
                          {typeInfo?.name || ''}
                        </span>
                      </span>
                      <span className="text-gray-600">
                        {typeMembers.length}명 ({percentage}%)
                      </span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {topTypes.length === 0 && (
              <div className="text-center py-4 text-gray-500">
                데이터가 없습니다
              </div>
            )}
          </Card>

          {/* 그룹 특성 요약 */}
          <Card>
            <h4 className="font-bold text-gray-800 mb-4">그룹 특성</h4>
            <div className="space-y-3 text-sm">
              {CHARACTER_SCALES.map((scale) => {
                const values = members.map((m) => m[`${scale}_t`] || 50);
                const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                const level = avg < 45 ? 'L' : avg > 55 ? 'H' : 'M';
                const levelColor =
                  level === 'H' ? 'text-emerald-600' : level === 'L' ? 'text-amber-600' : 'text-gray-600';

                return (
                  <div key={scale} className="flex items-center justify-between">
                    <span className="text-gray-700">{scale.toUpperCase()}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-600">{avg}점</span>
                      <span className={`font-bold ${levelColor}`}>{level}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* 성격 성숙도 지표 */}
          <Card>
            <h4 className="font-bold text-gray-800 mb-4">성격 성숙도</h4>
            <div className="space-y-3">
              {(() => {
                const sdAvg = Math.round(
                  members.map((m) => m.sd_p || 50).reduce((a, b) => a + b, 0) / members.length
                );
                const coAvg = Math.round(
                  members.map((m) => m.co_p || 50).reduce((a, b) => a + b, 0) / members.length
                );
                const maturitySum = sdAvg + coAvg;
                const maturityLevel =
                  maturitySum < 60 ? '주의' : maturitySum < 100 ? '보통' : '양호';
                const maturityColor =
                  maturitySum < 60 ? 'text-red-600' : maturitySum < 100 ? 'text-amber-600' : 'text-emerald-600';

                return (
                  <>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">SD 평균 백분위</span>
                      <span className="font-medium">{sdAvg}%</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">CO 평균 백분위</span>
                      <span className="font-medium">{coAvg}%</span>
                    </div>
                    <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                      <span className="text-gray-700 font-medium">성숙도 지표</span>
                      <span className={`font-bold ${maturityColor}`}>{maturityLevel}</span>
                    </div>
                  </>
                );
              })()}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
