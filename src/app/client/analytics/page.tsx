'use client';

import { useEffect, useState } from 'react';
import { clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  PieChart,
  Calendar,
  Target,
  CheckCircle,
  Clock,
  Users,
  FileText,
  Zap,
  AlertTriangle
} from 'lucide-react';

interface AnalyticsData {
  periodStats: {
    period: string;
    metrics: {
      totalPosts: number;
      avgSeoScore: number;
      avgLegalScore: number;
      completionRate: number;
      approvalRate: number;
    };
    comparison: {
      totalPosts: number;
      avgSeoScore: number;
      avgLegalScore: number;
    };
  };
  categoryPerformance: Array<{
    category: string;
    postCount: number;
    avgSeoScore: number;
    avgLegalScore: number;
    topKeywords: string[];
  }>;
  agentPerformance: Array<{
    agentType: string;
    avgExecutionTime: number;
    successRate: number;
    errorRate: number;
  }>;
  qualityTrend: Array<{
    date: string;
    postCount: number;
    seoScore: number;
    legalScore: number;
  }>;
}

type PeriodType = 'week' | 'month' | 'quarter' | 'year';

const periodLabels = {
  week: '이번 주',
  month: '이번 달',
  quarter: '이번 분기',
  year: '올해'
};

const agentLabels = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

export default function ClientAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [selectedPeriod, setSelectedPeriod] = useState<PeriodType>('month');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getAnalytics(selectedPeriod);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatChange = (value: number) => {
    const sign = value > 0 ? '+' : '';
    return `${sign}${value.toFixed(1)}%`;
  };

  const getChangeIcon = (value: number) => {
    return value > 0 ?
      <TrendingUp className="w-4 h-4 text-green-500" /> :
      <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  const getChangeColor = (value: number) => {
    return value > 0 ? 'text-green-600' : 'text-red-600';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const { periodStats, categoryPerformance, agentPerformance, qualityTrend } = analyticsData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4">성과 분석</h1>
        <p className="text-gray-600">
          콘텐츠 생성 성과와 AI 에이전트 성능을 분석하여 개선 방향을 제시합니다.
        </p>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-2 mb-8">
        {(['week', 'month', 'quarter', 'year'] as PeriodType[]).map((period) => (
          <Button
            key={period}
            variant={selectedPeriod === period ? 'primary' : 'secondary'}
            size="sm"
            onClick={() => setSelectedPeriod(period)}
          >
            {periodLabels[period]}
          </Button>
        ))}
      </div>

      {/* 주요 지표 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <FileText className="w-8 h-8 text-blue-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">총 콘텐츠</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.metrics.totalPosts}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${getChangeColor(periodStats.comparison.totalPosts)}`}>
              {getChangeIcon(periodStats.comparison.totalPosts)}
              <span className="text-sm font-medium ml-1">
                {formatChange(periodStats.comparison.totalPosts)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Target className="w-8 h-8 text-green-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">평균 SEO 점수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.metrics.avgSeoScore}
                </p>
              </div>
            </div>
            <div className={`flex items-center ${getChangeColor(periodStats.comparison.avgSeoScore)}`}>
              {getChangeIcon(periodStats.comparison.avgSeoScore)}
              <span className="text-sm font-medium ml-1">
                {formatChange(periodStats.comparison.avgSeoScore)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-purple-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">완료율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.metrics.completionRate}%
                </p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-orange-500 mr-3" />
              <div>
                <p className="text-sm font-medium text-gray-600">승인율</p>
                <p className="text-2xl font-bold text-gray-900">
                  {periodStats.metrics.approvalRate}%
                </p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 카테고리별 성과 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">카테고리별 성과</h2>
          <div className="space-y-4">
            {categoryPerformance.map((category, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{category.category}</h3>
                  <p className="text-sm text-gray-600">{category.postCount}개 콘텐츠</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">SEO / 의료법</div>
                  <div className="font-semibold text-gray-900">
                    {category.avgSeoScore} / {category.avgLegalScore}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI 에이전트 성능 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">AI 에이전트 성능</h2>
          <div className="space-y-4">
            {agentPerformance.map((agent, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-gray-900">{agentLabels[agent.agentType as keyof typeof agentLabels]}</h3>
                  <p className="text-sm text-gray-600">{agent.avgExecutionTime}초 평균</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600">성공률</div>
                  <div className="font-semibold text-gray-900">{agent.successRate}%</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 콘텐츠 품질 추이 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">콘텐츠 품질 추이</h2>
        <div className="space-y-4">
          {qualityTrend.map((trend, index) => (
            <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                <div>
                  <p className="font-medium text-gray-900">
                    {new Date(trend.date).toLocaleDateString('ko-KR', {
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                  <p className="text-sm text-gray-600">{trend.postCount}개 생성</p>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-600">SEO / 의료법 점수</div>
                <div className="font-semibold text-gray-900">
                  {trend.seoScore} / {trend.legalScore}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* 개선 제안 */}
      <Card className="p-6 mt-8 bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">💡 개선 제안</h2>
        <div className="space-y-3">
          {periodStats.comparison.avgSeoScore < 0 && (
            <div className="flex items-start">
              <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">SEO 점수 개선 필요</p>
                <p className="text-sm text-gray-600">
                  최근 SEO 점수가 하락했습니다. 키워드 최적화와 메타 태그 관리를 강화해보세요.
                </p>
              </div>
            </div>
          )}
          {periodStats.metrics.completionRate < 80 && (
            <div className="flex items-start">
              <Clock className="w-5 h-5 text-orange-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">콘텐츠 완성도 향상</p>
                <p className="text-sm text-gray-600">
                  콘텐츠 완료율이 낮습니다. 에이전트 성능 모니터링과 재처리 작업을 고려해보세요.
                </p>
              </div>
            </div>
          )}
          {agentPerformance.some(agent => agent.successRate < 95) && (
            <div className="flex items-start">
              <Zap className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">AI 에이전트 최적화</p>
                <p className="text-sm text-gray-600">
                  일부 AI 에이전트의 성공률이 낮습니다. 프롬프트 개선이나 재학습을 고려해보세요.
                </p>
              </div>
            </div>
          )}
          {periodStats.comparison.totalPosts > 20 && (
            <div className="flex items-start">
              <TrendingUp className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="font-medium text-gray-900">성장세 유지</p>
                <p className="text-sm text-gray-600">
                  콘텐츠 생성량이 크게 증가했습니다. 품질 관리 프로세스를 더욱 강화해보세요.
                </p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
