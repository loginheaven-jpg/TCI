import React, { useState } from 'react';
import Card from '../ui/Card';
import RadarChartView from './RadarChartView';
import BarChartView from './BarChartView';
import ScaleDetail from './ScaleDetail';
import { calculateTemperamentType, calculateTypeDistribution } from '../../utils/typeCalculator';
import { TEMPERAMENT_TYPES } from '../../data/interpretations';

const TEMPERAMENT_SCALES = ['ns', 'ha', 'rd', 'ps'];

export default function TemperamentTab({ members = [], selectedMembers = [] }) {
  const [viewMode, setViewMode] = useState('radar'); // radar, bar, detail
  const [selectedScale, setSelectedScale] = useState(null);

  const displayMembers = selectedMembers.length > 0 ? selectedMembers : members;

  // 유형 분포 계산
  const typeDistribution = calculateTypeDistribution(members, 'temperament');
  const topTypes = Object.entries(typeDistribution)
    .sort((a, b) => b[1].length - a[1].length)
    .slice(0, 5);

  return (
    <div className="space-y-6">
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
                ? 'bg-white text-blue-600 shadow-sm'
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
                기질 프로파일
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({displayMembers.length}명)
                </span>
              </h3>
            </div>

            {viewMode === 'radar' && (
              <RadarChartView
                members={displayMembers}
                scales={TEMPERAMENT_SCALES}
                showAverage={displayMembers.length > 1}
              />
            )}

            {viewMode === 'bar' && (
              <BarChartView
                members={displayMembers}
                scales={TEMPERAMENT_SCALES}
                showAverage={displayMembers.length > 1}
              />
            )}

            {viewMode === 'detail' && (
              <div className="space-y-4">
                <div className="grid grid-cols-4 gap-2">
                  {TEMPERAMENT_SCALES.map((scale) => (
                    <button
                      key={scale}
                      onClick={() => setSelectedScale(scale.toUpperCase())}
                      className={`px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                        selectedScale === scale.toUpperCase()
                          ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/25'
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
            <h4 className="font-bold text-gray-800 mb-4">기질 유형 분포</h4>
            <div className="space-y-3">
              {topTypes.map(([type, typeMembers]) => {
                const typeInfo = TEMPERAMENT_TYPES[type];
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
                        className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all"
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
              {TEMPERAMENT_SCALES.map((scale) => {
                const values = members.map((m) => m[`${scale}_t`] || 50);
                const avg = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
                const level = avg < 45 ? 'L' : avg > 55 ? 'H' : 'M';
                const levelColor =
                  level === 'H' ? 'text-red-600' : level === 'L' ? 'text-blue-600' : 'text-gray-600';

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
        </div>
      </div>
    </div>
  );
}
