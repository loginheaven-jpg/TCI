import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from 'recharts';
import { SCALE_LABELS_KO, SCALE_COLORS } from '../../data/tciData';

const MEMBER_COLORS = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
];

export default function BarChartView({
  members = [],
  scales = ['ns', 'ha', 'rd', 'ps', 'sd', 'co', 'st'],
  showAverage = true,
  height = 350,
  orientation = 'vertical', // vertical or horizontal
}) {
  // 단일 멤버 모드 (척도별 비교)
  if (members.length === 1) {
    const member = members[0];
    const data = scales.map((scale) => ({
      name: SCALE_LABELS_KO[scale.toUpperCase()] || scale.toUpperCase(),
      value: member[`${scale}_t`] || 50,
      percentile: member[`${scale}_p`] || 50,
      color: SCALE_COLORS[scale.toUpperCase()] || '#6b7280',
    }));

    return (
      <div className="w-full" style={{ height }}>
        <ResponsiveContainer>
          <BarChart
            data={data}
            layout={orientation === 'horizontal' ? 'vertical' : 'horizontal'}
            margin={{ top: 20, right: 30, bottom: 20, left: 60 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            {orientation === 'horizontal' ? (
              <>
                <XAxis type="number" domain={[20, 80]} tick={{ fontSize: 12 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={80} />
              </>
            ) : (
              <>
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis domain={[20, 80]} tick={{ fontSize: 12 }} />
              </>
            )}
            <Tooltip
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
              }}
              formatter={(value, name, props) => [
                `T점수: ${value} (백분위: ${props.payload.percentile}%)`,
                '',
              ]}
            />
            <ReferenceLine
              {...(orientation === 'horizontal' ? { x: 50 } : { y: 50 })}
              stroke="#9ca3af"
              strokeDasharray="3 3"
              label={{ value: '평균', position: 'top', fontSize: 10, fill: '#9ca3af' }}
            />
            <Bar dataKey="value" radius={[4, 4, 4, 4]}>
              {data.map((entry, index) => (
                <Cell key={index} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // 다중 멤버 모드 (멤버 간 비교)
  const data = scales.map((scale) => {
    const point = {
      name: SCALE_LABELS_KO[scale.toUpperCase()] || scale.toUpperCase(),
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

  return (
    <div className="w-full" style={{ height }}>
      <ResponsiveContainer>
        <BarChart data={data} margin={{ top: 20, right: 30, bottom: 20, left: 60 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="name" tick={{ fontSize: 12 }} />
          <YAxis domain={[20, 80]} tick={{ fontSize: 12 }} />
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
            wrapperStyle={{ paddingTop: '10px' }}
            iconType="square"
            formatter={(value) => <span className="text-sm text-gray-700">{value}</span>}
          />
          <ReferenceLine y={50} stroke="#9ca3af" strokeDasharray="3 3" />

          {members.map((member, idx) => (
            <Bar
              key={member.name}
              dataKey={member.name}
              fill={MEMBER_COLORS[idx % MEMBER_COLORS.length]}
              radius={[4, 4, 0, 0]}
            />
          ))}

          {showAverage && members.length > 1 && (
            <Bar dataKey="그룹평균" fill="#1f2937" radius={[4, 4, 0, 0]} />
          )}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
