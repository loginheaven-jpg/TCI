import React from 'react';
import Card from '../ui/Card';
import { calculateCharacterType, getTScoreLevel } from '../../utils/typeCalculator';
import { CHARACTER_TYPES } from '../../data/interpretations';
import { SCALE_LABELS_KO, SCALE_TRAITS } from '../../data/tciData';

export default function CharacterAnalysis({ member }) {
  if (!member) return null;

  const typeCode = member.character_type || calculateCharacterType(member);
  const typeInfo = CHARACTER_TYPES[typeCode] || {};

  const scales = [
    { key: 'sd', name: '자율성', color: 'emerald' },
    { key: 'co', name: '연대감', color: 'sky' },
    { key: 'st', name: '자기초월', color: 'purple' },
  ];

  return (
    <div className="space-y-6">
      {/* 유형 헤더 */}
      <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="text-sm opacity-80 mb-1">성격 유형</div>
            <h3 className="text-3xl font-bold mb-2">{typeCode}</h3>
            <p className="text-xl font-medium opacity-90">{typeInfo.name || '알 수 없는 유형'}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl opacity-20">💚</div>
          </div>
        </div>

        {typeInfo.description && (
          <p className="mt-4 text-sm opacity-90 leading-relaxed">
            {typeInfo.description}
          </p>
        )}
      </Card>

      {/* 척도별 분석 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {scales.map((scale) => {
          const tScore = member[`${scale.key}_t`] || 50;
          const percentile = member[`${scale.key}_p`] || 50;
          const level = getTScoreLevel(tScore);
          const traits = SCALE_TRAITS[scale.key.toUpperCase()] || {};

          const levelText = level === 'H' ? '높음' : level === 'L' ? '낮음' : '보통';
          const levelColor =
            level === 'H'
              ? 'from-emerald-500 to-emerald-600'
              : level === 'L'
              ? 'from-amber-500 to-amber-600'
              : 'from-gray-400 to-gray-500';

          return (
            <Card key={scale.key}>
              <div className="text-center mb-4">
                <h4 className="font-bold text-gray-800">
                  {scale.key.toUpperCase()}
                </h4>
                <p className="text-sm text-gray-500">{scale.name}</p>
              </div>

              {/* 원형 점수 표시 */}
              <div className="relative w-24 h-24 mx-auto mb-4">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="8"
                  />
                  <circle
                    cx="48"
                    cy="48"
                    r="40"
                    fill="none"
                    stroke={level === 'H' ? '#10b981' : level === 'L' ? '#f59e0b' : '#6b7280'}
                    strokeWidth="8"
                    strokeDasharray={`${(tScore / 80) * 251.2} 251.2`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-2xl font-bold text-gray-800">{tScore}</span>
                  <span className="text-xs text-gray-500">T점수</span>
                </div>
              </div>

              <div
                className={`text-center px-3 py-1 rounded-full text-white text-sm font-medium bg-gradient-to-r ${levelColor} mx-auto w-fit`}
              >
                {levelText}
              </div>

              {/* 특성 설명 */}
              <div className="mt-4 text-sm text-gray-600 leading-relaxed text-center">
                {level === 'H' && traits.high && <p>{traits.high}</p>}
                {level === 'L' && traits.low && <p>{traits.low}</p>}
                {level === 'M' && <p>중간 수준으로 균형 잡힌 특성을 보입니다.</p>}
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
              <div className="bg-emerald-50 rounded-xl p-4">
                <div className="font-semibold text-emerald-700 mb-2">강점</div>
                <ul className="text-sm text-emerald-600 space-y-1">
                  {typeInfo.characteristics.strengths.map((item, idx) => (
                    <li key={idx}>• {item}</li>
                  ))}
                </ul>
              </div>
            )}
            {typeInfo.characteristics.weaknesses && (
              <div className="bg-amber-50 rounded-xl p-4">
                <div className="font-semibold text-amber-700 mb-2">발전 영역</div>
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

      {/* 성격 성숙도 */}
      <Card>
        <h4 className="font-bold text-gray-800 mb-4">성격 성숙도 지표</h4>
        <div className="grid grid-cols-2 gap-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">자율성 (SD)</span>
              <span className="text-sm font-medium">{member.sd_p || 50}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (member.sd_p || 50) < 30 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${member.sd_p || 50}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">연대감 (CO)</span>
              <span className="text-sm font-medium">{member.co_p || 50}%</span>
            </div>
            <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${
                  (member.co_p || 50) < 30 ? 'bg-red-500' : 'bg-emerald-500'
                }`}
                style={{ width: `${member.co_p || 50}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-50 rounded-xl">
          <p className="text-sm text-gray-600">
            {(member.sd_p || 50) + (member.co_p || 50) >= 100 ? (
              <>
                자율성과 연대감이 모두 양호하여 <span className="font-medium text-emerald-600">성숙한 성격 발달</span>을 보이고 있습니다.
              </>
            ) : (member.sd_p || 50) + (member.co_p || 50) >= 60 ? (
              <>
                성격 발달이 <span className="font-medium text-amber-600">평균 수준</span>입니다. 자기 성장을 위한 노력이 도움이 됩니다.
              </>
            ) : (
              <>
                성격 발달에 <span className="font-medium text-red-600">주의가 필요</span>합니다. 전문적인 코칭이나 상담을 권장합니다.
              </>
            )}
          </p>
        </div>
      </Card>

      {/* 코칭 포인트 */}
      {typeInfo.coaching && (
        <Card>
          <h4 className="font-bold text-gray-800 mb-4">성격 발달 가이드</h4>
          <ul className="space-y-2">
            {typeInfo.coaching.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-emerald-500 mt-0.5">✨</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}
