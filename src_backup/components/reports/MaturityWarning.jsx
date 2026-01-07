import React from 'react';
import Alert from '../ui/Alert';
import { checkPersonalityDisorderTendency } from '../../utils/typeCalculator';
import { PERSONALITY_DISORDER_MAP } from '../../data/interpretations';

export default function MaturityWarning({ member }) {
  if (!member) return null;

  const sd_p = member.sd_p || 50;
  const co_p = member.co_p || 50;

  const result = checkPersonalityDisorderTendency(sd_p, co_p);

  if (!result.warning) return null;

  // SD, CO 레벨 계산
  const sdLevel = sd_p < 30 ? 'L' : sd_p > 70 ? 'H' : 'M';
  const coLevel = co_p < 30 ? 'L' : co_p > 70 ? 'H' : 'M';
  const combinedKey = `${sdLevel}${coLevel}`;

  const disorderInfo = PERSONALITY_DISORDER_MAP[combinedKey];

  return (
    <Alert variant={result.severity === 'high' ? 'error' : 'warning'}>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-xl">⚠️</span>
          <span className="font-bold text-lg">성격 발달 주의</span>
        </div>

        <p className="text-sm">{result.message}</p>

        <div className="grid grid-cols-2 gap-4 p-4 bg-white/50 rounded-xl">
          <div>
            <div className="text-xs text-gray-600 mb-1">자율성 (SD)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${sd_p < 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${sd_p}%` }}
                />
              </div>
              <span className="text-sm font-medium">{sd_p}%</span>
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">연대감 (CO)</div>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${co_p < 30 ? 'bg-red-500' : 'bg-emerald-500'}`}
                  style={{ width: `${co_p}%` }}
                />
              </div>
              <span className="text-sm font-medium">{co_p}%</span>
            </div>
          </div>
        </div>

        {disorderInfo && (
          <div className="mt-4 p-4 bg-white/50 rounded-xl">
            <div className="text-sm font-semibold text-gray-700 mb-2">
              관련 성격 경향성
            </div>
            <div className="flex flex-wrap gap-2 mb-3">
              {disorderInfo.tendencies?.map((tendency, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs"
                >
                  {tendency}
                </span>
              ))}
            </div>
            {disorderInfo.description && (
              <p className="text-sm text-gray-600">{disorderInfo.description}</p>
            )}
          </div>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-xl">
          <div className="text-sm font-semibold text-blue-700 mb-2">권장 사항</div>
          <ul className="text-sm text-blue-600 space-y-1 list-disc list-inside">
            <li>전문 상담사와의 심층 면담을 권장합니다</li>
            <li>자기 인식 및 정서 조절 훈련이 도움이 될 수 있습니다</li>
            <li>대인관계 기술 향상 프로그램을 고려해보세요</li>
          </ul>
        </div>
      </div>
    </Alert>
  );
}
