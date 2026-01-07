import React from 'react';
import Card from '../ui/Card';
import { getTScoreLevel, checkPersonalityDisorderTendency } from '../../utils/typeCalculator';
import { TEMPERAMENT_TYPES, CHARACTER_TYPES } from '../../data/interpretations';

export default function CoachingGuide({ member }) {
  if (!member) return null;

  const temperamentType = member.temperament_type || '';
  const characterType = member.character_type || '';

  const temperamentInfo = TEMPERAMENT_TYPES[temperamentType] || {};
  const characterInfo = CHARACTER_TYPES[characterType] || {};

  const maturityCheck = checkPersonalityDisorderTendency(member.sd_p, member.co_p);

  // 척도별 레벨
  const levels = {
    ns: getTScoreLevel(member.ns_t || 50),
    ha: getTScoreLevel(member.ha_t || 50),
    rd: getTScoreLevel(member.rd_t || 50),
    ps: getTScoreLevel(member.ps_t || 50),
    sd: getTScoreLevel(member.sd_t || 50),
    co: getTScoreLevel(member.co_t || 50),
    st: getTScoreLevel(member.st_t || 50),
  };

  // 코칭 우선순위 도출
  const getCoachingPriorities = () => {
    const priorities = [];

    // 성숙도 관련
    if (maturityCheck.warning) {
      priorities.push({
        category: '성격 발달',
        priority: 'high',
        title: '자기조절 및 대인관계 능력 강화',
        description: maturityCheck.message,
        actions: [
          '정서 인식 및 조절 훈련',
          '자기 수용 연습',
          '건강한 경계 설정 학습',
          '공감 능력 개발',
        ],
      });
    }

    // 기질 관련 코칭
    if (levels.ns === 'H' && levels.ha === 'L') {
      priorities.push({
        category: '기질',
        priority: 'medium',
        title: '충동성 조절',
        description: '높은 자극추구와 낮은 위험회피로 인해 충동적인 결정을 할 수 있습니다.',
        actions: [
          '결정 전 숙고하는 습관 기르기',
          '장기적 결과 고려하기',
          '마음챙김 명상 실천',
        ],
      });
    }

    if (levels.ha === 'H') {
      priorities.push({
        category: '기질',
        priority: 'medium',
        title: '불안 관리',
        description: '높은 위험회피로 인해 불안이나 걱정이 많을 수 있습니다.',
        actions: [
          '점진적 노출 훈련',
          '이완 기법 습득',
          '인지적 재구성 연습',
        ],
      });
    }

    if (levels.rd === 'L') {
      priorities.push({
        category: '기질',
        priority: 'medium',
        title: '사회적 연결 강화',
        description: '낮은 사회적 민감성으로 인해 대인관계에서 어려움이 있을 수 있습니다.',
        actions: [
          '적극적 경청 연습',
          '감사 표현하기',
          '소규모 모임 참여',
        ],
      });
    }

    if (levels.ps === 'L') {
      priorities.push({
        category: '기질',
        priority: 'medium',
        title: '인내력 향상',
        description: '낮은 인내력으로 인해 장기 목표 달성에 어려움이 있을 수 있습니다.',
        actions: [
          '작은 목표부터 시작하기',
          '진행 상황 기록하기',
          '자기 보상 시스템 만들기',
        ],
      });
    }

    // 성격 관련 코칭
    if (levels.st === 'H') {
      priorities.push({
        category: '성격',
        priority: 'low',
        title: '현실적 균형',
        description: '높은 자기초월은 영적 성장에 도움이 되지만, 현실적 문제 해결도 중요합니다.',
        actions: [
          '일상적 책임 우선시하기',
          '구체적 목표 설정',
          '실용적 기술 개발',
        ],
      });
    }

    return priorities;
  };

  const priorities = getCoachingPriorities();

  return (
    <div className="space-y-6">
      {/* 종합 코칭 가이드 헤더 */}
      <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-2xl font-bold mb-2">종합 코칭 가이드</h3>
            <p className="opacity-90">{member.name}님을 위한 맞춤 코칭 방향</p>
          </div>
          <div className="text-6xl opacity-20">🎯</div>
        </div>
      </Card>

      {/* 코칭 우선순위 */}
      {priorities.length > 0 && (
        <Card>
          <h4 className="font-bold text-gray-800 mb-4">코칭 우선순위</h4>
          <div className="space-y-4">
            {priorities.map((item, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-4 ${
                  item.priority === 'high'
                    ? 'border-red-200 bg-red-50'
                    : item.priority === 'medium'
                    ? 'border-amber-200 bg-amber-50'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-medium ${
                      item.priority === 'high'
                        ? 'bg-red-500 text-white'
                        : item.priority === 'medium'
                        ? 'bg-amber-500 text-white'
                        : 'bg-blue-500 text-white'
                    }`}
                  >
                    {item.priority === 'high' ? '긴급' : item.priority === 'medium' ? '중요' : '참고'}
                  </span>
                  <span className="text-xs text-gray-500">{item.category}</span>
                </div>
                <h5 className="font-semibold text-gray-800 mb-1">{item.title}</h5>
                <p className="text-sm text-gray-600 mb-3">{item.description}</p>
                <div className="space-y-1">
                  {item.actions.map((action, actionIdx) => (
                    <div key={actionIdx} className="flex items-center gap-2 text-sm text-gray-700">
                      <span className="text-green-500">✓</span>
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 기질 유형별 코칭 */}
      {temperamentInfo.coaching && temperamentInfo.coaching.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
              🧠
            </span>
            <h4 className="font-bold text-gray-800">기질 유형 ({temperamentType}) 코칭</h4>
          </div>
          <ul className="space-y-2">
            {temperamentInfo.coaching.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-blue-500 mt-0.5">💡</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 성격 유형별 코칭 */}
      {characterInfo.coaching && characterInfo.coaching.length > 0 && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <span className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600">
              💚
            </span>
            <h4 className="font-bold text-gray-800">성격 유형 ({characterType}) 코칭</h4>
          </div>
          <ul className="space-y-2">
            {characterInfo.coaching.map((point, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-600">
                <span className="text-emerald-500 mt-0.5">✨</span>
                <span>{point}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* 강점 활용 가이드 */}
      <Card>
        <h4 className="font-bold text-gray-800 mb-4">강점 활용 가이드</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {temperamentInfo.characteristics?.strengths && (
            <div className="bg-blue-50 rounded-xl p-4">
              <div className="font-semibold text-blue-700 mb-2">기질적 강점</div>
              <ul className="text-sm text-blue-600 space-y-1">
                {temperamentInfo.characteristics.strengths.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {characterInfo.characteristics?.strengths && (
            <div className="bg-emerald-50 rounded-xl p-4">
              <div className="font-semibold text-emerald-700 mb-2">성격적 강점</div>
              <ul className="text-sm text-emerald-600 space-y-1">
                {characterInfo.characteristics.strengths.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* 발전 영역 */}
      <Card>
        <h4 className="font-bold text-gray-800 mb-4">발전 영역</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {temperamentInfo.characteristics?.weaknesses && (
            <div className="bg-amber-50 rounded-xl p-4">
              <div className="font-semibold text-amber-700 mb-2">기질 관련</div>
              <ul className="text-sm text-amber-600 space-y-1">
                {temperamentInfo.characteristics.weaknesses.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
          {characterInfo.characteristics?.weaknesses && (
            <div className="bg-rose-50 rounded-xl p-4">
              <div className="font-semibold text-rose-700 mb-2">성격 관련</div>
              <ul className="text-sm text-rose-600 space-y-1">
                {characterInfo.characteristics.weaknesses.map((item, idx) => (
                  <li key={idx}>• {item}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </Card>

      {/* 실천 체크리스트 */}
      <Card>
        <h4 className="font-bold text-gray-800 mb-4">주간 실천 체크리스트</h4>
        <div className="space-y-2">
          {[
            '매일 10분 자기 성찰 시간 갖기',
            '감정 일기 작성하기',
            '새로운 것 하나 시도해보기',
            '감사한 일 3가지 적기',
            '타인에게 긍정적 피드백 주기',
          ].map((item, idx) => (
            <label
              key={idx}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl cursor-pointer hover:bg-gray-100 transition"
            >
              <input type="checkbox" className="w-5 h-5 rounded border-gray-300 text-indigo-600" />
              <span className="text-sm text-gray-700">{item}</span>
            </label>
          ))}
        </div>
      </Card>
    </div>
  );
}
