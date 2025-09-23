/**
 * 일정 메트릭 컴포넌트들
 * 대시보드에서 일정 관련 통계를 표시
 */

import React from 'react';
import { Card } from '@/components/shared/Card';
import { Progress } from '@/components/shared/Progress';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { Clock, AlertTriangle, CheckCircle, TrendingUp, Calendar, Target, RefreshCw } from 'lucide-react';
import { adminApi } from '@/services/api';
import type { CampaignScheduleOverview, ScheduleMonitoringResult } from '@/types/common';

interface ScheduleProgressChartProps {
  overview: CampaignScheduleOverview;
}

export function ScheduleProgressChart({ overview }: ScheduleProgressChartProps) {
  const { progress, stage_progress } = overview;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">일정 진행 현황</h3>
        </div>
        <Badge variant={progress.completion_rate >= 80 ? 'success' : progress.completion_rate >= 60 ? 'warning' : 'error'}>
          {progress.completion_rate.toFixed(1)}% 완료
        </Badge>
      </div>

      <div className="space-y-4">
        {/* 전체 진행률 */}
        <div>
          <div className="flex justify-between text-sm text-gray-600 mb-2">
            <span>전체 진행률</span>
            <span>{progress.completed_posts}/{progress.total_posts} 포스트</span>
          </div>
          <Progress value={progress.completion_rate} className="h-3" />
        </div>

        {/* 단계별 진행률 */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(stage_progress).map(([stage, data]) => {
            const stageNames: { [key: string]: string } = {
              material: '자료 수집',
              guide: '가이드 제공',
              ai: 'AI 생성',
              admin_review: '관리자 검토',
              client_review: '클라이언트 검토',
              final_revision: '최종 수정',
              published: '게시 완료'
            };

            return (
              <div key={stage} className="bg-gray-50 rounded-lg p-3">
                <div className="text-xs font-medium text-gray-600 mb-2">
                  {stageNames[stage] || stage}
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {data.completed}/{data.total}
                  </span>
                  <span className="text-xs text-gray-500">
                    {data.percentage.toFixed(0)}%
                  </span>
                </div>
                <Progress value={data.percentage} className="h-2" />
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}

interface DeadlineAlertsProps {
  monitoringResult: ScheduleMonitoringResult;
}

export function DeadlineAlerts({ monitoringResult }: DeadlineAlertsProps) {
  const { delayed_posts, approaching_deadlines } = monitoringResult;

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Clock className="w-5 h-5 text-orange-600" />
          <h3 className="text-lg font-semibold text-gray-900">마감 임박 및 지연 알림</h3>
        </div>
        <div className="flex space-x-2">
          <Badge variant="error">{delayed_posts.length} 지연</Badge>
          <Badge variant="warning">{approaching_deadlines.length} 임박</Badge>
        </div>
      </div>

      <div className="space-y-4">
        {/* 지연된 작업들 */}
        {delayed_posts.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-red-700 mb-3 flex items-center">
              <AlertTriangle className="w-4 h-4 mr-1" />
              지연된 작업 ({delayed_posts.length})
            </h4>
            <div className="space-y-2">
              {delayed_posts.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <div className="text-sm font-medium text-red-900">
                      {post.stage} 단계 - {post.delay_days}일 지연
                    </div>
                    <div className="text-xs text-red-600">
                      Post ID: {post.post_id}
                    </div>
                  </div>
                  <Badge variant="error" size="sm">
                    {post.severity === 'high' ? '심각' : post.severity === 'medium' ? '보통' : '낮음'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 마감 임박 작업들 */}
        {approaching_deadlines.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-orange-700 mb-3 flex items-center">
              <Clock className="w-4 h-4 mr-1" />
              마감 임박 ({approaching_deadlines.length})
            </h4>
            <div className="space-y-2">
              {approaching_deadlines.slice(0, 5).map((post, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg border border-orange-200">
                  <div>
                    <div className="text-sm font-medium text-orange-900">
                      {post.stage} 단계 - {post.hours_remaining}시간 남음
                    </div>
                    <div className="text-xs text-orange-600">
                      Post ID: {post.post_id}
                    </div>
                  </div>
                  <Badge variant="warning" size="sm">
                    {post.urgency === 'high' ? '긴급' : post.urgency === 'medium' ? '주의' : '일반'}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 알림이 없는 경우 */}
        {delayed_posts.length === 0 && approaching_deadlines.length === 0 && (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-gray-600">모든 작업이 정상적으로 진행되고 있습니다.</p>
          </div>
        )}
      </div>
    </Card>
  );
}

interface BottleneckAnalysisProps {
  bottlenecks: CampaignScheduleOverview['bottlenecks'];
}

export function BottleneckAnalysis({ bottlenecks }: BottleneckAnalysisProps) {
  if (bottlenecks.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            <h3 className="text-lg font-semibold text-gray-900">병목 현황 분석</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
          <p className="text-gray-600">현재 병목 현상이 발견되지 않았습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-semibold text-gray-900">병목 현황 분석</h3>
        </div>
        <Badge variant="error">{bottlenecks.length}개 발견</Badge>
      </div>

      <div className="space-y-4">
        {bottlenecks.map((bottleneck, index) => (
          <div key={index} className="border border-red-200 rounded-lg p-4 bg-red-50">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-red-900">{bottleneck.stage} 단계</span>
                <Badge
                  variant={bottleneck.severity === 'high' ? 'error' : bottleneck.severity === 'medium' ? 'warning' : 'info'}
                  size="sm"
                >
                  {bottleneck.severity === 'high' ? '심각' : bottleneck.severity === 'medium' ? '보통' : '낮음'}
                </Badge>
              </div>
            </div>

            <p className="text-sm text-red-800 mb-2">{bottleneck.description}</p>

            <div className="bg-white rounded p-3 border border-red-300">
              <div className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <div className="text-sm font-medium text-green-900 mb-1">권장 조치</div>
                  <p className="text-sm text-green-800">{bottleneck.recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}

interface ScheduleMetricsDashboardProps {
  campaignId: number;
  className?: string;
}

export function ScheduleMetricsDashboard({ campaignId, className = '' }: ScheduleMetricsDashboardProps) {
  const [overview, setOverview] = React.useState<CampaignScheduleOverview | null>(null);
  const [monitoringResult, setMonitoringResult] = React.useState<ScheduleMonitoringResult | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    loadScheduleMetrics();
  }, [campaignId]);

  const loadScheduleMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      // 실제 API 연동 전까지 mock 데이터 사용
      // TODO: 백엔드 API 준비 후 실제 연동
      /*
      // 캠페인 일정 개요 조회
      const overviewData = await adminApi.getCampaignScheduleOverview(campaignId);
      setOverview(overviewData.data);

      // 일정 모니터링 실행
      const monitoringData = await adminApi.runScheduleMonitoring();
      setMonitoringResult(monitoringData.data);
      */

      // Mock 데이터
      setOverview({
        campaign: {
          id: campaignId,
          name: '2024년 가을 치과 캠페인',
          start_date: '2024-09-01',
          end_date: '2024-12-31',
          target_post_count: 50,
          completed_post_count: 35
        },
        progress: {
          total_posts: 50,
          completed_posts: 35,
          delayed_posts: 5,
          completion_rate: 70.0
        },
        stage_progress: {
          material: { completed: 40, total: 50, percentage: 80.0 },
          guide: { completed: 38, total: 50, percentage: 76.0 },
          ai: { completed: 35, total: 50, percentage: 70.0 },
          admin_review: { completed: 35, total: 50, percentage: 70.0 },
          client_review: { completed: 35, total: 50, percentage: 70.0 },
          final_revision: { completed: 35, total: 50, percentage: 70.0 },
          published: { completed: 35, total: 50, percentage: 70.0 }
        },
        bottlenecks: [
          {
            stage: 'ai_generation',
            severity: 'medium',
            description: 'AI 생성 대기 포스트 3건',
            recommendation: 'AI 리소스 확충 고려'
          }
        ]
      });

      setMonitoringResult({
        delayed_posts: [
          { post_id: 'QA_001', stage: 'ai', delay_days: 2, severity: 'medium' }
        ],
        approaching_deadlines: [
          { post_id: 'QA_002', stage: 'admin_review', hours_remaining: 6, urgency: 'high' }
        ],
        notifications_created: 3,
        priorities_updated: 2,
        monitored_at: new Date().toISOString()
      });

    } catch (err) {
      console.error('일정 메트릭 로드 실패:', err);
      setError('일정 메트릭을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  if (error || !overview) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error || '일정 데이터를 불러올 수 없습니다.'}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 일정 진행 현황 차트 */}
      <ScheduleProgressChart overview={overview} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 마감 임박 및 지연 알림 */}
        {monitoringResult && (
          <DeadlineAlerts monitoringResult={monitoringResult} />
        )}

        {/* 병목 현황 분석 */}
        <BottleneckAnalysis bottlenecks={overview.bottlenecks} />
      </div>

      {/* 새로고침 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={loadScheduleMetrics}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Calendar className="w-4 h-4 mr-2" />
          새로고침
        </button>
      </div>
    </div>
  );
}
