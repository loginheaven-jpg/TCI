import React from 'react';
import Card from '../ui/Card';
import { SUBSCALE_LABELS, SUBSCALE_DESCRIPTIONS } from '../../data/tciData';

const SUBSCALE_GROUPS = {
  NS: ['ns1', 'ns2', 'ns3', 'ns4'],
  HA: ['ha1', 'ha2', 'ha3', 'ha4'],
  RD: ['rd1', 'rd2', 'rd3'],
  PS: ['ps1', 'ps2', 'ps3', 'ps4'],
  SD: ['sd1', 'sd2', 'sd3', 'sd4', 'sd5'],
  CO: ['co1', 'co2', 'co3', 'co4', 'co5'],
  ST: ['st1', 'st2', 'st3'],
};

const SCALE_NAMES = {
  NS: '자극추구',
  HA: '위험회피',
  RD: '사회적민감성',
  PS: '인내력',
  SD: '자율성',
  CO: '연대감',
  ST: '자기초월',
};

const SCALE_COLORS = {
  NS: 'blue',
  HA: 'amber',
  RD: 'rose',
  PS: 'violet',
  SD: 'emerald',
  CO: 'sky',
  ST: 'purple',
};

export default function SubscaleDetail({ member, showScale = null }) {
  if (!member) return null;

  const scalesToShow = showScale ? [showScale] : Object.keys(SUBSCALE_GROUPS);

  const hasSubscaleData = Object.values(SUBSCALE_GROUPS).some((subscales) =>
    subscales.some((sub) => member[sub] !== undefined)
  );

  if (!hasSubscaleData) {
    return (
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-2">하위척도 분석</h3>
        <p className="text-gray-500 text-sm">
          하위척도 데이터가 제공되지 않았습니다.
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {scalesToShow.map((scale) => {
        const subscales = SUBSCALE_GROUPS[scale];
        const color = SCALE_COLORS[scale];
        const mainScore = member[`${scale.toLowerCase()}_t`] || 50;

        const subscaleData = subscales
          .map((sub) => ({
            code: sub.toUpperCase(),
            label: SUBSCALE_LABELS[sub.toUpperCase()] || sub,
            description: SUBSCALE_DESCRIPTIONS[sub.toUpperCase()] || '',
            value: member[sub],
          }))
          .filter((item) => item.value !== undefined);

        if (subscaleData.length === 0) return null;

        return (
          <Card key={scale}>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-gray-800">
                  {scale} - {SCALE_NAMES[scale]}
                </h4>
                <p className="text-sm text-gray-500">하위척도 상세</p>
              </div>
              <div
                className={`px-4 py-2 rounded-xl text-white text-sm font-medium
                  bg-${color}-500`}
                style={{
                  backgroundColor:
                    color === 'blue'
                      ? '#3b82f6'
                      : color === 'amber'
                      ? '#f59e0b'
                      : color === 'rose'
                      ? '#f43f5e'
                      : color === 'violet'
                      ? '#8b5cf6'
                      : color === 'emerald'
                      ? '#10b981'
                      : color === 'sky'
                      ? '#0ea5e9'
                      : '#a855f7',
                }}
              >
                주척도 T점수: {mainScore}
              </div>
            </div>

            {/* 하위척도 테이블 */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-20">
                      코드
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700">
                      하위척도
                    </th>
                    <th className="px-4 py-3 text-center font-semibold text-gray-700 w-24">
                      원점수
                    </th>
                    <th className="px-4 py-3 text-left font-semibold text-gray-700 w-48">
                      수준
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {subscaleData.map((item) => {
                    const level =
                      item.value < 40 ? 'low' : item.value > 60 ? 'high' : 'medium';

                    return (
                      <tr key={item.code} className="hover:bg-gray-50">
                        <td className="px-4 py-3 font-medium text-gray-800">
                          {item.code}
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-medium text-gray-800">{item.label}</div>
                          {item.description && (
                            <div className="text-xs text-gray-500 mt-1">
                              {item.description}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-3 text-center font-medium text-gray-800">
                          {item.value}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className={`h-full transition-all ${
                                  level === 'high'
                                    ? 'bg-red-500'
                                    : level === 'low'
                                    ? 'bg-blue-500'
                                    : 'bg-gray-400'
                                }`}
                                style={{ width: `${item.value}%` }}
                              />
                            </div>
                            <span
                              className={`text-xs font-medium px-2 py-0.5 rounded ${
                                level === 'high'
                                  ? 'bg-red-100 text-red-700'
                                  : level === 'low'
                                  ? 'bg-blue-100 text-blue-700'
                                  : 'bg-gray-100 text-gray-700'
                              }`}
                            >
                              {level === 'high' ? 'H' : level === 'low' ? 'L' : 'M'}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* 하위척도 요약 */}
            <div className="mt-4 p-4 bg-gray-50 rounded-xl">
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-blue-600">
                    {subscaleData.filter((d) => d.value < 40).length}
                  </div>
                  <div className="text-xs text-gray-500">낮음 (L)</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-gray-600">
                    {subscaleData.filter((d) => d.value >= 40 && d.value <= 60).length}
                  </div>
                  <div className="text-xs text-gray-500">보통 (M)</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-red-600">
                    {subscaleData.filter((d) => d.value > 60).length}
                  </div>
                  <div className="text-xs text-gray-500">높음 (H)</div>
                </div>
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
