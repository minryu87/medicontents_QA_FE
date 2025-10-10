'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  BarChart3,
  TrendingUp,
  Download,
  FileText,
  Calendar,
  Filter,
  Target,
  CheckCircle,
  AlertTriangle,
  PieChart,
  LineChart,
  Users,
  Clock,
  Award,
  Zap
} from 'lucide-react';
import { SystemAnalytics } from '@/types/common';
import { analyticsApi } from '@/services/systemApi';

interface QualityMetrics {
  totalPosts: number;
  avgSeoScore: number;
  avgLegalScore: number;
  completionRate: number;
  approvalRate: number;
  qualityTrend: Array<{
    date: string;
    seoScore: number;
    legalScore: number;
    postCount: number;
  }>;
}

interface CategoryAnalysis {
  category: string;
  postCount: number;
  avgSeoScore: number;
  avgLegalScore: number;
  topIssues: string[];
  improvement: number;
}

interface AgentPerformance {
  agentType: string;
  successRate: number;
  avgExecutionTime: number;
  errorPatterns: Array<{
    error: string;
    count: number;
    percentage: number;
  }>;
  performanceTrend: Array<{
    date: string;
    successRate: number;
    executionTime: number;
  }>;
}

interface ReportConfig {
  type: 'quality' | 'performance' | 'usage' | 'custom';
  period: 'week' | 'month' | 'quarter' | 'year';
  format: 'pdf' | 'excel' | 'csv';
  includeCharts: boolean;
  includeRecommendations: boolean;
}

const reportTypes = {
  quality: '품질 분석 보고서',
  performance: '성능 분석 보고서',
  usage: '사용 현황 보고서',
  custom: '맞춤 보고서'
};

const periodLabels = {
  week: '이번 주',
  month: '이번 달',
  quarter: '이번 분기',
  year: '올해'
};

export default function AdminAnalyticsPage() {
  const [analyticsData, setAnalyticsData] = useState<SystemAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [showReportBuilder, setShowReportBuilder] = useState(false);
  const [reportConfig, setReportConfig] = useState<ReportConfig>({
    type: 'quality',
    period: 'month',
    format: 'pdf',
    includeCharts: true,
    includeRecommendations: true
  });

  useEffect(() => {
    loadAnalyticsData();
  }, [selectedPeriod]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsApi.getSystemAnalytics({
        period: selectedPeriod
      });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateReport = async () => {
    try {
      // 실제로는 API 호출
      console.log('Generating report:', reportConfig);

      // 모의 다운로드
      const reportName = `${reportTypes[reportConfig.type]}_${periodLabels[reportConfig.period]}.${reportConfig.format}`;
      alert(`${reportName} 보고서 생성이 완료되었습니다. (실제 구현에서는 다운로드가 시작됩니다.)`);

      setShowReportBuilder(false);
    } catch (error) {
      console.error('Failed to generate report:', error);
      alert('보고서 생성에 실패했습니다.');
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      // 실제로는 API 호출
      console.log(`Exporting data as ${format}`);
      alert(`${format.toUpperCase()} 파일로 데이터 내보내기가 완료되었습니다.`);
    } catch (error) {
      console.error('Failed to export data:', error);
      alert('데이터 내보내기에 실패했습니다.');
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBgColor = (score: number) => {
    if (score >= 90) return 'bg-green-100';
    if (score >= 80) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">품질 분석 및 보고</h1>
            <p className="text-gray-600">
              콘텐츠 품질과 시스템 성능을 분석하고 상세한 보고서를 생성합니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => exportData('csv')}>
              <Download className="w-4 h-4 mr-2" />
              CSV 내보내기
            </Button>
            <Button variant="outline" onClick={() => exportData('excel')}>
              <Download className="w-4 h-4 mr-2" />
              Excel 내보내기
            </Button>
            <Button onClick={() => setShowReportBuilder(true)}>
              <FileText className="w-4 h-4 mr-2" />
              보고서 생성
            </Button>
          </div>
        </div>
      </div>

      {/* 기간 선택 */}
      <div className="flex gap-2 mb-8">
        {(['week', 'month', 'quarter', 'year'] as const).map((period) => (
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

      {/* 주요 품질 지표 */}
      {analyticsData && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <FileText className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">총 콘텐츠 수</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {analyticsData.metrics.total_posts.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              {periodLabels[selectedPeriod]} 생성된 콘텐츠
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Target className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">평균 SEO 점수</p>
                  <p className={`text-2xl font-bold ${getScoreColor(85)}`}>
                    85.0
                  </p>
                </div>
              </div>
            </div>
            <div className={`text-sm px-2 py-1 rounded-full ${getScoreBgColor(85)} inline-block`}>
              양호
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <CheckCircle className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">의료법 준수율</p>
                  <p className={`text-2xl font-bold ${getScoreColor(92)}`}>
                    92.0%
                  </p>
                </div>
              </div>
            </div>
            <div className={`text-sm px-2 py-1 rounded-full ${getScoreBgColor(92)} inline-block`}>
              우수
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Award className="w-8 h-8 text-orange-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">완료율</p>
                  <p className="text-2xl font-bold text-gray-900">
                    95.0%
                  </p>
                </div>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              승인율: 88.0%
            </div>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 카테고리별 분석 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <PieChart className="w-5 h-5 mr-2 text-blue-500" />
            카테고리별 품질 분석
          </h2>

          <div className="space-y-4">
            {[
              { category: '치과', posts: 45, avgScore: 87.2, improvement: 12.5, topIssues: ['이미지 최적화', 'SEO 키워드'] },
              { category: '피부과', posts: 32, avgScore: 89.1, improvement: 8.3, topIssues: ['의료법 준수'] },
              { category: '성형외과', posts: 28, avgScore: 85.8, improvement: 15.2, topIssues: ['콘텐츠 길이', '가독성'] },
              { category: '안과', posts: 19, avgScore: 91.3, improvement: 6.7, topIssues: ['이미지 품질'] }
            ].map((category, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900">{category.category}</h3>
                  <div className="flex items-center">
                    <TrendingUp className={`w-4 h-4 mr-1 ${
                      category.improvement > 10 ? 'text-green-500' : 'text-yellow-500'
                    }`} />
                    <span className={`text-sm font-medium ${
                      category.improvement > 10 ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                      +{category.improvement.toFixed(1)}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">콘텐츠 수</div>
                    <div className="font-semibold text-gray-900">{category.posts}개</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">평균 점수</div>
                    <div className="font-semibold text-gray-900">
                      평균: {category.avgScore.toFixed(1)}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="text-sm text-gray-600 mb-1">주요 개선사항</div>
                  <div className="flex flex-wrap gap-1">
                    {category.topIssues.map((issue, issueIndex) => (
                      <span key={issueIndex} className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs">
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* AI 에이전트 성능 분석 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-yellow-500" />
            AI 에이전트 성능 분석
          </h2>

          <div className="space-y-6">
            {[
              { agent: 'Content Agent', successRate: 95.2, avgTime: 12.3, executions: 156, errorPatterns: ['타임아웃', '메모리 부족'] },
              { agent: 'Edit Agent', successRate: 88.7, avgTime: 8.9, executions: 142, errorPatterns: ['문법 오류'] },
              { agent: 'Evaluation Agent', successRate: 92.1, avgTime: 5.4, executions: 138, errorPatterns: ['점수 계산 오류'] },
              { agent: 'Title Agent', successRate: 97.8, avgTime: 3.2, executions: 145, errorPatterns: [] }
            ].map((agent, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-medium text-gray-900 capitalize">{agent.agent}</h3>
                  <div className="text-right">
                    <div className={`text-lg font-bold ${getScoreColor(agent.successRate)}`}>
                      {agent.successRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-gray-600">성공률</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-3">
                  <div>
                    <div className="text-sm text-gray-600">평균 실행시간</div>
                    <div className="font-semibold text-gray-900">{agent.avgTime.toFixed(1)}초</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">오류 패턴</div>
                    <div className="font-semibold text-gray-900">{agent.errorPatterns.length}개</div>
                  </div>
                </div>

                {agent.errorPatterns.length > 0 && (
                  <div>
                    <div className="text-sm text-gray-600 mb-2">주요 오류</div>
                    <div className="space-y-1">
                      {agent.errorPatterns.slice(0, 2).map((error, errorIndex) => (
                        <div key={errorIndex} className="flex justify-between text-xs">
                          <span className="text-gray-700 truncate mr-2">{error}</span>
                          <span className="text-red-600 font-medium">-</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* 품질 추이 차트 (간단한 시각화) */}
      {analyticsData && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <LineChart className="w-5 h-5 mr-2 text-green-500" />
            품질 추이 분석
          </h2>

          <div className="mb-4">
            <div className="h-40 bg-gray-100 rounded-lg flex items-end justify-between px-4 py-2">
              {Array.from({ length: 14 }, (_, index) => ({ 
                seoScore: 80 + Math.random() * 20, 
                legalScore: 85 + Math.random() * 15,
                date: new Date(Date.now() - (13 - index) * 24 * 60 * 60 * 1000).toISOString()
              })).map((point, index) => (
                <div key={index} className="flex flex-col items-center">
                  <div
                    className="bg-blue-500 rounded-sm w-6 mb-1"
                    style={{
                      height: `${(point.seoScore / 100) * 120}px`,
                      opacity: 0.7 + (point.seoScore / 100) * 0.3
                    }}
                  />
                  <div
                    className="bg-green-500 rounded-sm w-6 mb-2"
                    style={{
                      height: `${(point.legalScore / 100) * 120}px`,
                      opacity: 0.7 + (point.legalScore / 100) * 0.3
                    }}
                  />
                  <div className="text-xs text-gray-500 transform -rotate-45 origin-top-left">
                    {new Date(point.date).getDate()}일
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-center gap-6 mt-2">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded mr-2" />
                <span className="text-sm text-gray-600">SEO 점수</span>
              </div>
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-500 rounded mr-2" />
                <span className="text-sm text-gray-600">의료법 점수</span>
              </div>
            </div>
          </div>

          {/* 개선 권장사항 */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2" />
              개선 권장사항
            </h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• SEO 점수가 가장 낮은 카테고리(피부과)에 키워드 최적화 집중</li>
              <li>• Content Agent의 실행시간 최적화로 전체 처리 속도 향상</li>
              <li>• 정기적인 프롬프트 A/B 테스트로 품질 지속적 개선</li>
              <li>• 법적 준수율이 낮은 콘텐츠에 대한 검토 프로세스 강화</li>
            </ul>
          </div>
        </Card>
      )}

      {/* 보고서 생성기 모달 */}
      {showReportBuilder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">보고서 생성</h2>
              <Button variant="outline" onClick={() => setShowReportBuilder(false)}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  보고서 유형
                </label>
                <select
                  value={reportConfig.type}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    type: e.target.value as ReportConfig['type']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.entries(reportTypes).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  분석 기간
                </label>
                <select
                  value={reportConfig.period}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    period: e.target.value as ReportConfig['period']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  {Object.entries(periodLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내보내기 형식
                </label>
                <select
                  value={reportConfig.format}
                  onChange={(e) => setReportConfig(prev => ({
                    ...prev,
                    format: e.target.value as ReportConfig['format']
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="pdf">PDF</option>
                  <option value="excel">Excel</option>
                  <option value="csv">CSV</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeCharts}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      includeCharts: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">차트 포함</span>
                </label>

                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={reportConfig.includeRecommendations}
                    onChange={(e) => setReportConfig(prev => ({
                      ...prev,
                      includeRecommendations: e.target.checked
                    }))}
                    className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">개선 권장사항 포함</span>
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="primary" onClick={generateReport}>
                  보고서 생성
                </Button>
                <Button variant="outline" onClick={() => setShowReportBuilder(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
