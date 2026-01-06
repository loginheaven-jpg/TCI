import React from 'react';
import Card from '../ui/Card';
import { getTScoreLevel } from '../../utils/typeCalculator';
import { TEMPERAMENT_INTERACTIONS } from '../../data/interpretations';

export default function InteractionAnalysis({ member }) {
  if (!member) return null;

  const nsLevel = getTScoreLevel(member.ns_t || 50);
  const haLevel = getTScoreLevel(member.ha_t || 50);
  const rdLevel = getTScoreLevel(member.rd_t || 50);

  const interactions = [
    {
      id: 'ns_ha',
      name: '자극추구 × 위험회피',
      scales: ['NS', 'HA'],
      code: `${nsLevel}${haLevel}`,
      values: [member.ns_t, member.ha_t],
      color: 'blue',
      description: '에너지 수준과 행동 조절의 균형',
    },
    {
      id: 'ns_rd',
      name: '자극추구 × 사회적민감성',
      scales: ['NS', 'RD'],
      code: `${nsLevel}${rdLevel}`,
      values: [member.ns_t, member.rd_t],
      color: 'purple',
      description: '사회적 상호작용 스타일',
    },
    {
      id: 'ha_rd',
      name: '위험회피 × 사회적민감성',
      scales: ['HA', 'RD'],
      code: `${haLevel}${rdLevel}`,
      values: [member.ha_t, member.rd_t],
      color: 'amber',
      description: '대인관계에서의 정서적 반응',
    },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <h3 className="text-lg font-bold text-gray-800 mb-2">기질 상호작용 분석</h3>
        <p className="text-sm text-gray-500 mb-6">
          기질 척도 간의 상호작용이 어떤 행동 패턴을 만들어내는지 분석합니다.
        </p>

        <div className="space-y-6">
          {interactions.map((interaction) => {
            const interactionData = TEMPERAMENT_INTERACTIONS[interaction.id];
            const combinationInfo = interactionData?.combinations?.[interaction.code];

            return (
              <div
                key={interaction.id}
                className="border border-gray-100 rounded-2xl p-5 hover:border-gray-200 transition"
              >
                {/* 헤더 */}
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-bold text-gray-800">{interaction.name}</h4>
                    <p className="text-sm text-gray-500">{interaction.description}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {interaction.scales.map((scale, idx) => (
                      <span
                        key={scale}
                        className={`px-3 py-1 rounded-lg text-sm font-medium
                          ${
                            interaction.code[idx] === 'H'
                              ? 'bg-red-100 text-red-700'
                              : interaction.code[idx] === 'L'
                              ? 'bg-blue-100 text-blue-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                      >
                        {scale}: {interaction.code[idx]}
                      </span>
                    ))}
                  </div>
                </div>

                {/* 점수 시각화 */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  {interaction.scales.map((scale, idx) => (
                    <div key={scale}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">{scale}</span>
                        <span className="font-medium">{interaction.values[idx] || 50}</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full transition-all ${
                            interaction.code[idx] === 'H'
                              ? 'bg-red-500'
                              : interaction.code[idx] === 'L'
                              ? 'bg-blue-500'
                              : 'bg-gray-400'
                          }`}
                          style={{
                            width: `${((interaction.values[idx] || 50) - 20) / 60 * 100}%`,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                {/* 조합 해석 */}
                {combinationInfo && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="font-medium text-gray-800 mb-2">
                      {combinationInfo.title || `${interaction.code} 조합`}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {combinationInfo.description}
                    </p>
                    {combinationInfo.behavioral_pattern && (
                      <div className="mt-3 pt-3 border-t border-gray-200">
                        <div className="text-xs font-medium text-gray-500 mb-1">행동 패턴</div>
                        <p className="text-sm text-gray-600">
                          {combinationInfo.behavioral_pattern}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {!combinationInfo && interactionData?.description && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-sm text-gray-600">{interactionData.description}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* 종합 상호작용 패턴 */}
      <Card>
        <h4 className="font-bold text-gray-800 mb-4">종합 행동 패턴</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-xl p-4">
            <div className="text-sm font-semibold text-blue-700 mb-2">에너지 방향</div>
            <p className="text-sm text-blue-600">
              {nsLevel === 'H' && haLevel === 'L'
                ? '외부 활동 지향적이며 적극적으로 새로운 경험을 추구합니다.'
                : nsLevel === 'L' && haLevel === 'H'
                ? '내부 활동 지향적이며 안정적인 환경을 선호합니다.'
                : '상황에 따라 유연하게 에너지를 조절합니다.'}
            </p>
          </div>
          <div className="bg-purple-50 rounded-xl p-4">
            <div className="text-sm font-semibold text-purple-700 mb-2">사회적 스타일</div>
            <p className="text-sm text-purple-600">
              {nsLevel === 'H' && rdLevel === 'H'
                ? '사교적이고 타인과의 교류를 즐깁니다.'
                : nsLevel === 'L' && rdLevel === 'L'
                ? '독립적이며 혼자만의 시간을 중요시합니다.'
                : '상황과 대상에 따라 사회적 참여 수준이 달라집니다.'}
            </p>
          </div>
          <div className="bg-amber-50 rounded-xl p-4">
            <div className="text-sm font-semibold text-amber-700 mb-2">정서적 반응</div>
            <p className="text-sm text-amber-600">
              {haLevel === 'H' && rdLevel === 'H'
                ? '타인의 감정에 민감하며 공감 능력이 높습니다.'
                : haLevel === 'L' && rdLevel === 'L'
                ? '감정적으로 독립적이며 냉정한 판단을 합니다.'
                : '정서적 민감성이 중간 수준입니다.'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}
