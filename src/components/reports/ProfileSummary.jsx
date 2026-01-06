import React from 'react';
import Card from '../ui/Card';
import { SCALE_LABELS_KO, SCALE_COLORS } from '../../data/tciData';
import { getTScoreLevel, calculateProfileStats } from '../../utils/typeCalculator';

export default function ProfileSummary({ member }) {
  if (!member) return null;

  const stats = calculateProfileStats(member);
  const scales = ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'];

  const getLevelBadge = (level) => {
    const colors = {
      H: 'bg-red-100 text-red-700',
      M: 'bg-gray-100 text-gray-700',
      L: 'bg-blue-100 text-blue-700',
    };
    return colors[level] || colors.M;
  };

  return (
    <Card>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{member.name}</h3>
          <p className="text-sm text-gray-500">TCI 프로파일 요약</p>
        </div>
        <div className="flex gap-2">
          <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-blue-500/25">
            기질: {member.temperament_type || '-'}
          </div>
          <div className="px-4 py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl text-sm font-medium shadow-lg shadow-emerald-500/25">
            성격: {member.character_type || '-'}
          </div>
        </div>
      </div>

      {/* 척도별 바 차트 */}
      <div className="space-y-3">
        {scales.map((scale) => {
          const tScore = member[`${scale}_t`] || 50;
          const percentile = member[`${scale}_p`] || 50;
          const level = getTScoreLevel(tScore);
          const color = SCALE_COLORS[scale.toUpperCase()] || '#6b7280';

          // 바 위치 계산 (20-80 범위)
          const barPosition = ((tScore - 20) / 60) * 100;

          return (
            <div key={scale} className="flex items-center gap-4">
              <div className="w-12 text-sm font-semibold text-gray-700">
                {scale.toUpperCase()}
              </div>
              <div className="flex-1 relative">
                {/* 배경 바 */}
                <div className="h-6 bg-gray-100 rounded-full relative overflow-hidden">
                  {/* 정상 범위 표시 (45-55) */}
                  <div
                    className="absolute h-full bg-gray-200"
                    style={{
                      left: `${((45 - 20) / 60) * 100}%`,
                      width: `${(10 / 60) * 100}%`,
                    }}
                  />
                  {/* 값 마커 */}
                  <div
                    className="absolute top-0 w-1.5 h-full rounded"
                    style={{
                      left: `${Math.min(Math.max(barPosition, 0), 100)}%`,
                      backgroundColor: color,
                      transform: 'translateX(-50%)',
                    }}
                  />
                </div>
                {/* 스케일 라벨 */}
                <div className="flex justify-between mt-1 text-xs text-gray-400">
                  <span>20</span>
                  <span>50</span>
                  <span>80</span>
                </div>
              </div>
              <div className="flex items-center gap-2 w-24 justify-end">
                <span className="text-sm font-medium text-gray-800">{tScore}</span>
                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getLevelBadge(level)}`}>
                  {level}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 통계 요약 */}
      <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-100">
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">{stats.avgTScore}</div>
          <div className="text-xs text-gray-500">평균 T점수</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.temperamentAvg}</div>
          <div className="text-xs text-gray-500">기질 평균</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.characterAvg}</div>
          <div className="text-xs text-gray-500">성격 평균</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-gray-800">
            {stats.maxScale}/{stats.minScale}
          </div>
          <div className="text-xs text-gray-500">최고/최저</div>
        </div>
      </div>
    </Card>
  );
}
