import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { SCALE_LABELS_KO, SCALE_LABELS, SCALE_TRAITS, SCALE_COLORS } from '../../data/tciData';
import { getTScoreLevel } from '../../utils/typeCalculator';

export default function ScaleDetail({ scale, members = [], showStats = true }) {
  const scaleKey = scale.toLowerCase();
  const scaleName = SCALE_LABELS_KO[scale] || scale;
  const scaleFullName = SCALE_LABELS[scale] || scale;
  const traits = SCALE_TRAITS[scale] || {};
  const color = SCALE_COLORS[scale] || '#6b7280';

  // 멤버별 데이터 정렬 (T점수 기준)
  const sortedMembers = [...members].sort(
    (a, b) => (b[`${scaleKey}_t`] || 50) - (a[`${scaleKey}_t`] || 50)
  );

  const data = sortedMembers.map((member) => ({
    name: member.name,
    tScore: member[`${scaleKey}_t`] || 50,
    percentile: member[`${scaleKey}_p`] || 50,
    level: getTScoreLevel(member[`${scaleKey}_t`] || 50),
  }));

  // 통계 계산
  const tScores = members.map((m) => m[`${scaleKey}_t`] || 50);
  const stats = {
    avg: Math.round((tScores.reduce((a, b) => a + b, 0) / tScores.length) * 10) / 10,
    min: Math.min(...tScores),
    max: Math.max(...tScores),
    high: tScores.filter((t) => t > 55).length,
    medium: tScores.filter((t) => t >= 45 && t <= 55).length,
    low: tScores.filter((t) => t < 45).length,
  };

  const getLevelColor = (level) => {
    switch (level) {
      case 'H':
        return '#ef4444';
      case 'L':
        return '#3b82f6';
      default:
        return '#6b7280';
    }
  };

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-xl font-bold text-gray-800">{scaleName}</h3>
          <p className="text-sm text-gray-500">{scaleFullName}</p>
        </div>
        <div
          className="px-4 py-2 rounded-xl text-white text-sm font-medium"
          style={{ backgroundColor: color }}
        >
          평균 {stats.avg}점
        </div>
      </div>

      {/* 특성 설명 */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-blue-50 rounded-xl p-4">
          <div className="text-sm font-semibold text-blue-700 mb-2">낮은 경우 (L)</div>
          <p className="text-sm text-blue-600">{traits.low || '-'}</p>
        </div>
        <div className="bg-red-50 rounded-xl p-4">
          <div className="text-sm font-semibold text-red-700 mb-2">높은 경우 (H)</div>
          <p className="text-sm text-red-600">{traits.high || '-'}</p>
        </div>
      </div>

      {/* 분포 통계 */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-blue-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{stats.low}</div>
            <div className="text-sm text-blue-600">낮음 (L)</div>
          </div>
          <div className="bg-gray-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-gray-700">{stats.medium}</div>
            <div className="text-sm text-gray-600">보통 (M)</div>
          </div>
          <div className="bg-red-100 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-700">{stats.high}</div>
            <div className="text-sm text-red-600">높음 (H)</div>
          </div>
        </div>
      )}

      {/* 막대 차트 */}
      <div className="h-64">
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout="vertical"
            margin={{ top: 10, right: 30, bottom: 10, left: 80 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" horizontal={false} />
            <XAxis type="number" domain={[20, 80]} tick={{ fontSize: 11 }} />
            <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={70} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name, props) => [
                `T점수: ${value} (${props.payload.level})`,
                `백분위: ${props.payload.percentile}%`,
              ]}
            />
            <ReferenceLine x={45} stroke="#3b82f6" strokeDasharray="3 3" />
            <ReferenceLine x={55} stroke="#ef4444" strokeDasharray="3 3" />
            <ReferenceLine x={50} stroke="#9ca3af" strokeDasharray="3 3" />
            <Bar dataKey="tScore" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={getLevelColor(entry.level)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* 범례 */}
      <div className="flex justify-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">낮음 (&lt;45)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-gray-500" />
          <span className="text-gray-600">보통 (45-55)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-600">높음 (&gt;55)</span>
        </div>
      </div>
    </div>
  );
}
