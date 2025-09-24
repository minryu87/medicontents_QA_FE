import React from 'react';

interface IterationData {
  iteration: number;
  overall_score: number;
  seo_score: number | null;
  legal_score: number | null;
  medical_score: number | null;
  created_at: string;
  evaluation_type: string;
}

interface IterationHistoryCardProps {
  evaluationHistory: IterationData[];
  loading?: boolean;
}

export default function IterationHistoryCard({ evaluationHistory, loading = false }: IterationHistoryCardProps) {
  const formatDateTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '알 수 없음';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getScoreChange = (current: number, previous: number | null) => {
    if (previous === null) return null;
    const diff = current - previous;
    if (diff > 0) return { value: `+${diff}`, color: 'text-green-600', icon: '↗️' };
    if (diff < 0) return { value: diff.toString(), color: 'text-red-600', icon: '↘️' };
    return { value: '0', color: 'text-gray-600', icon: '→' };
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex items-center space-x-4 p-3 border border-neutral-200 rounded">
                <div className="h-8 w-8 bg-neutral-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded w-1/4"></div>
                  <div className="h-3 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluationHistory || evaluationHistory.length === 0) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">평가 반복 히스토리</h3>
        <div className="text-center text-neutral-500 py-8">
          <p>평가 히스토리가 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">평가 반복 히스토리</h3>

      <div className="space-y-3">
        {evaluationHistory.map((iteration, index) => {
          const previousIteration = index > 0 ? evaluationHistory[index - 1] : null;
          const scoreChange = getScoreChange(iteration.overall_score, previousIteration?.overall_score || null);

          return (
            <div key={iteration.iteration} className="flex items-center space-x-4 p-4 border border-neutral-200 rounded-lg hover:bg-neutral-50 transition-colors">
              {/* 반복 번호 */}
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-semibold text-neutral-700">{iteration.iteration}</span>
                </div>
              </div>

              {/* 평가 정보 */}
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="font-medium text-neutral-900">
                    {iteration.evaluation_type === 'final' ? '최종 평가' :
                     iteration.evaluation_type === 'intermediate' ? `${iteration.iteration}차 평가` :
                     `${iteration.iteration}차 평가`}
                  </span>
                  <span className="text-sm text-neutral-500">{formatDateTime(iteration.created_at)}</span>
                  {scoreChange && (
                    <span className={`text-xs flex items-center space-x-1 ${scoreChange.color}`}>
                      <span>{scoreChange.icon}</span>
                      <span>{scoreChange.value}</span>
                    </span>
                  )}
                </div>

                {/* 점수들 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className={`p-2 rounded text-center ${getScoreColor(iteration.overall_score)}`}>
                    <div className="text-xs text-neutral-600">전체</div>
                    <div className="font-bold">{iteration.overall_score}</div>
                  </div>

                  {iteration.seo_score !== null && (
                    <div className={`p-2 rounded text-center ${getScoreColor(iteration.seo_score)}`}>
                      <div className="text-xs text-neutral-600">SEO</div>
                      <div className="font-bold">{iteration.seo_score}</div>
                    </div>
                  )}

                  {iteration.legal_score !== null && (
                    <div className={`p-2 rounded text-center ${getScoreColor(iteration.legal_score)}`}>
                      <div className="text-xs text-neutral-600">법률</div>
                      <div className="font-bold">{iteration.legal_score}</div>
                    </div>
                  )}

                  {iteration.medical_score !== null && (
                    <div className={`p-2 rounded text-center ${getScoreColor(iteration.medical_score)}`}>
                      <div className="text-xs text-neutral-600">의료</div>
                      <div className="font-bold">{iteration.medical_score}</div>
                    </div>
                  )}
                </div>
              </div>

              {/* 상태 표시 */}
              <div className="flex-shrink-0">
                {index === evaluationHistory.length - 1 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    최종 결과
                  </span>
                ) : iteration.overall_score >= 80 ? (
                  <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                    통과
                  </span>
                ) : (
                  <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                    재평가 필요
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 요약 정보 */}
      {evaluationHistory.length > 1 && (
        <div className="mt-4 p-4 bg-neutral-50 rounded-lg">
          <div className="text-sm text-neutral-600">
            <div className="flex items-center justify-between">
              <span>총 반복 횟수: {evaluationHistory.length}회</span>
              <span>
                개선도: {evaluationHistory.length > 1
                  ? `${(evaluationHistory[evaluationHistory.length - 1].overall_score - evaluationHistory[0].overall_score).toFixed(1)}점`
                  : '0점'
                }
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
