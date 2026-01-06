import React from 'react';
import Card from '../ui/Card';
import { calculateTemperamentType, getTScoreLevel } from '../../utils/typeCalculator';
import { TEMPERAMENT_TYPES } from '../../data/interpretations';
import { SCALE_LABELS_KO, SCALE_TRAITS } from '../../data/tciData';

export default function TemperamentAnalysis({ member }) {
  if (!member) return null;

  const typeCode = member.temperament_type || calculateTemperamentType(member);
  const typeInfo = TEMPERAMENT_TYPES[typeCode] || {};

  const scales = [
    { key: 'ns', name: '자극추구', color: 'blue' },
    { key: 'ha', name: '위험회피', color: 'amber' },
    { key: 'rd', name: '사회적민감성', color: 'rose' },
    { key: 'ps', name: '인내력', color: 'violet' },
  ];

  return (
    <div className="space-y-6">
      {/* 유형 헤더 */}
      <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm opacity-80 mb-1">기질 유형</div>
            <h3 className="text-3xl font-bold mb-2">{typeCode}</h3>
            <p className="text-xl font-medium opacity-90">{typeInfo.name || '알 수 없는 유형'}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl opacity-20">🧠</div>
          </div>
        </div>

        {typeInfo.description && (
          <p className="mt-4 text-sm opacity-90 leading-relaxed">
            {typeInfo.description}
          </p>
        )}
      </Card>

      {/* 척도별 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {scales.map((scale) => {
          const tScore = member[`${scale.key}_t`] || 50;
          const percentile = member[`${scale.key}_p`] || 50;
          const level = getTScoreLevel(tScore);
          const traits = SCALE_TRAITS[scale.key.toUpperCase()] || {};

          const levelText = level === 'H' ? '높음' : level === 'L' ? '낮음' : '보통';
          const levelColor =
            level === 'H'
              ? 'from-red-500 to-red-600'
              : level === 'L'
              ? 'from-blue-500 to-blue-600'
              : 'from-gray-400 to-gray-500';

          return (
            <Card key={scale.key}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="font-bold text-gray-800">
                    {scale.key.toUpperCase()} - {scale.name}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {SCALE_LABELS_KO[scale.key.toUpperCase()]}
                  </p>
                </div>
                <div
                  className={`px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${levelColor}`}
                >
                  {levelText}
                </div>
              </div>

              {/* 점수 바 */}
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">T점수</span>
                  <span className="font-medium text-gray-800">{tScore}</span>
                </div>
                <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${levelColor} transition-all`}
                    style={{ width: `${((tScore - 20) / 60) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>낮음</span>
                  <span>보통</span>
                  <span>높음</span>
                </div>
              </div>

              {/* 특성 설명 */}
              <div className="text-sm text-gray-600 leading-relaxed">
                {level === 'H' && traits.high && <p>{traits.high}</p>}
                {level === 'L' && traits.low && <p>{traits.low}</p>}
                {level === 'M' && (
                  <p>이 척도에서 중간 범위에 해당합니다. 상황에 따라 유연하게 대처합니다.</p>
                )}
              </div>
            </Card>
          );
        })}
      </div>

      {/* 유형별 특성 */}
      {typeInfo.characteristics && (
        <Card>
          <h4 className="font-bold text-gray-800 mb-4">
            {typeCode} 유형의 특성
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {typeInfo.characteristics.strengths && (
              <div className="bg-blue-50 rounded-xl p-4">
                <div className="font-semibold text-blue-700 mb-2">강점</div>
                <ul className="text-sm text-blue-600 space-y-1">
                  {typeInfo.characteristics.strengths.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {typeInfo.characteristics.weaknesses && (
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="font-semibold text-amber-700 mb-2">주의점</div>
                <ul className="text-sm text-amber-600 space-y-1">
                  {typeInfo.characteristics.weaknesses.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* 코칭 포인트 */}
      {typeInfo.coaching && (
        <Card>
          <h4 className="font-bold text-gray-800 mb-4">코칭 포인트</h4>
          <ul className="space-y-2">
            {typeInfo.coaching.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">💡</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
