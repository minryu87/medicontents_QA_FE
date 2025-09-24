import React, { useState } from 'react';

interface EvaluationItem {
  id: string;
  name: string;
  description?: string;
  passed: boolean;
  score: number;
  detailed_feedback?: string;
  weight: number;
}

interface EvaluationCategory {
  total_items: number;
  passed_items: number;
  failed_items: number;
  score: number;
  items: EvaluationItem[];
}

interface EvaluationData {
  evaluation_history: Array<{
    iteration: number;
    overall_score: number;
    seo_score: number | null;
    legal_score: number | null;
    medical_score: number | null;
    created_at: string;
    evaluation_type: string;
  }>;
  latest_evaluation: {
    id: string;
    overall_score: number;
    seo_score: number | null;
    legal_score: number | null;
    medical_score: number | null;
    created_at: string;
    evaluation_type: string;
  } | null;
  evaluation_summary: {
    categories: Record<string, EvaluationCategory>;
    total_score: number;
    total_items: number;
    passed_items: number;
    failed_items: number;
  } | null;
}

interface EvaluationResultsCardProps {
  evaluationData: EvaluationData | null;
  loading?: boolean;
}

export default function EvaluationResultsCard({ evaluationData, loading = false }: EvaluationResultsCardProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'seo':
        return { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800' };
      case 'legal':
        return { bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800' };
      case 'medical':
        return { bg: 'bg-green-50', border: 'border-green-200', text: 'text-green-800' };
      default:
        return { bg: 'bg-gray-50', border: 'border-gray-200', text: 'text-gray-800' };
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'seo':
        return '🔍';
      case 'legal':
        return '⚖️';
      case 'medical':
        return '🏥';
      default:
        return '📊';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/3 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="border border-neutral-200 rounded p-4">
                <div className="h-4 bg-neutral-200 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-neutral-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-neutral-200 rounded w-full"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!evaluationData || !evaluationData.evaluation_summary) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-4">평가 결과</h3>
        <div className="text-center text-neutral-500 py-8">
          <p>평가 데이터가 없습니다.</p>
        </div>
      </div>
    );
  }

  const { evaluation_summary, latest_evaluation } = evaluationData;

  return (
    <>
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-neutral-900">평가 결과</h3>
          {latest_evaluation && (
            <div className="text-right">
              <div className="text-sm text-neutral-600">전체 점수</div>
              <div className={`text-2xl font-bold ${getScoreColor(latest_evaluation.overall_score)}`}>
                {latest_evaluation.overall_score}/100
              </div>
            </div>
          )}
        </div>

        {/* 카테고리별 카드 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          {Object.entries(evaluation_summary.categories).map(([category, data]) => {
            const colors = getCategoryColor(category);
            return (
              <div key={category} className={`${colors.bg} ${colors.border} border rounded-lg p-4`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getCategoryIcon(category)}</span>
                    <span className={`font-semibold ${colors.text}`}>{category.toUpperCase()}</span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedCategory(category);
                      setShowDetailModal(true);
                    }}
                    className={`text-xs px-2 py-1 ${colors.text} hover:bg-opacity-20 hover:bg-white rounded transition-colors`}
                  >
                    상세보기
                  </button>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">점수</span>
                    <span className={`font-bold ${getScoreColor(data.score)}`}>
                      {data.score.toFixed(1)}/100
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-neutral-600">통과율</span>
                    <span className="font-medium">
                      {data.total_items > 0 ? Math.round((data.passed_items / data.total_items) * 100) : 0}%
                    </span>
                  </div>

                  <div className="flex justify-between text-xs text-neutral-500">
                    <span>통과: {data.passed_items}</span>
                    <span>실패: {data.failed_items}</span>
                    <span>총계: {data.total_items}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* 전체 통계 */}
        <div className="bg-neutral-50 rounded-lg p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">총 항목 수</div>
              <div className="text-xl font-bold text-neutral-900">{evaluation_summary.total_items}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">통과 항목</div>
              <div className="text-xl font-bold text-green-600">{evaluation_summary.passed_items}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-neutral-600 mb-1">실패 항목</div>
              <div className="text-xl font-bold text-red-600">{evaluation_summary.failed_items}</div>
            </div>
          </div>
        </div>
      </div>

      {/* 상세보기 모달 */}
      {showDetailModal && selectedCategory && evaluation_summary.categories[selectedCategory] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-neutral-900">
                  {selectedCategory.toUpperCase()} 평가 상세 결과
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-neutral-400 hover:text-neutral-600"
                >
                  <i className="fa-solid fa-times"></i>
                </button>
              </div>

              <div className="space-y-3">
                {evaluation_summary.categories[selectedCategory].items.map((item, index) => (
                  <div key={item.id} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium text-neutral-900">{item.name}</span>
                          <span className={`px-2 py-1 rounded text-xs ${
                            item.passed ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {item.passed ? '통과' : '실패'}
                          </span>
                        </div>
                        {item.description && (
                          <p className="text-sm text-neutral-600 mb-2">{item.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <div className={`font-bold ${getScoreColor(item.score)}`}>
                          {item.score}/100
                        </div>
                        <div className="text-xs text-neutral-500">가중치: {item.weight}</div>
                      </div>
                    </div>

                    {item.detailed_feedback && (
                      <div className="bg-neutral-50 rounded p-3">
                        <div className="text-sm font-medium text-neutral-700 mb-1">상세 피드백:</div>
                        <div className="text-sm text-neutral-600 whitespace-pre-wrap">
                          {item.detailed_feedback}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="px-4 py-2 bg-neutral-600 text-white rounded hover:bg-neutral-700 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
