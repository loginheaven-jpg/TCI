import React from 'react';
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { SCALE_LABELS_KO } from '../../data/tciData';

const COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export default function RadarChartView({
  members = [],
  scales = ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'],
  showAverage = true,
  height = 400,
}) {
  // 데이터 포맷팅
  const data = scales.map((scale) => {
    const point = {
      scale: SCALE_LABELS_KO[scale.toUpperCase()] || scale.toUpperCase(),
      fullMark: 100,
    };

    members.forEach((member) => {
      point[member.name] = member[`${scale}_t`] || 50;
    });

    if (showAverage && members.length > 1) {
      const values = members.map((m) => m[`${scale}_t`] || 50);
      point['그룹평균'] = Math.round(values.reduce((a, b) => a + b, 0) / values.length);
    }

    return point;
  });

  const renderMembers = showAverage && members.length > 1
    ? [...members.map((m) => m.name), '그룹평균']
    : members.map((m) => m.name);

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <RadarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
          <PolarGrid gridType="polygon" stroke="#e5e7eb" />
          <PolarAngleAxis
            dataKey="scale"
            tick={{ fontSize: 12, fill: '#374151' }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[20, 80]}
            tickCount={4}
            tick={{ fontSize: 10, fill: '#9ca3af' }}
            axisLine={false}
          />

          {renderMembers.map((name, idx) => (
            <Radar
              key={name}
              name={name}
              dataKey={name}
              stroke={name === '그룹평균' ? '#1f2937' : COLORS[idx % COLORS.length]}
              fill={name === '그룹평균' ? '#1f2937' : COLORS[idx % COLORS.length]}
              fillOpacity={name === '그룹평균' ? 0.1 : 0.2}
              strokeWidth={name === '그룹평균' ? 2 : 1.5}
              strokeDasharray={name === '그룹평균' ? '5 5' : undefined}
            />
          ))}

          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
            formatter={(value) => [`${value}점`, '']}
          />

          <Legend
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
            formatter={(value) => (
              <span className="text-sm text-gray-700">{value}</span>
            )}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
