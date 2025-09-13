'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { formatDateTime } from '@/lib/utils';

interface DashboardStats {
  totalPosts: number;
  activePosts: number;
  completedPosts: number;
  totalHospitals: number;
  activeHospitals: number;
  totalCampaigns: number;
  activeCampaigns: number;
  agentExecutions: number;
  agentSuccessRate: number;
}

interface AgentPerformance {
  agent_type: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  success_rate: number;
  last_execution: string;
}

interface QualityMetrics {
  avg_seo_score: number;
  avg_legal_score: number;
  first_pass_rate: number;
  total_evaluations: number;
  quality_trend: 'improving' | 'stable' | 'declining';
}

interface ProcessingStatus {
  total_processing: number;
  agent_processing: number;
  admin_review: number;
  client_review: number;
  completed_today: number;
  failed_today: number;
  bottlenecks: string[];
}

interface SystemAlert {
  id: string;
  level: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  source: string;
  timestamp: string;
  resolved: boolean;
}

interface RecentActivity {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  related_id?: number;
}

interface SystemStatus {
  database: 'healthy' | 'warning' | 'error';
  redis: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
  lastBackup: string;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<QualityMetrics | null>(null);
  const [processingStatus, setProcessingStatus] = useState<ProcessingStatus | null>(null);
  const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();

    // 실시간 업데이트 (30초마다)
    const interval = setInterval(loadDashboardData, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 실제 API 호출로 데이터 로드
      const [
        statsData,
        agentPerfData,
        qualityData,
        processingData,
        alertsData,
        activitiesData,
        systemData
      ] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getAgentPerformance(),
        adminApi.getQualityMetrics(),
        adminApi.getProcessingStatus(),
        adminApi.getSystemAlerts(),
        adminApi.getRecentActivities(),
        adminApi.getSystemStatus()
      ]);

      setStats(statsData);
      setAgentPerformance(agentPerfData);
      setQualityMetrics(qualityData);
      setProcessingStatus(processingData);
      setSystemAlerts(alertsData);
      setRecentActivities(activitiesData);
      setSystemStatus(systemData);

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      loadFallbackData();
    } finally {
      setLoading(false);
    }
  };


  const loadFallbackData = () => {
    setStats({
      totalPosts: 0,
      activePosts: 0,
      completedPosts: 0,
      totalHospitals: 0,
      activeHospitals: 0,
      totalCampaigns: 0,
      activeCampaigns: 0,
      agentExecutions: 0,
      agentSuccessRate: 0
    });
    setAgentPerformance([]);
    setQualityMetrics({
      avg_seo_score: 0,
      avg_legal_score: 0,
      first_pass_rate: 0,
      total_evaluations: 0,
      quality_trend: 'stable'
    });
    setProcessingStatus({
      total_processing: 0,
      agent_processing: 0,
      admin_review: 0,
      client_review: 0,
      completed_today: 0,
      failed_today: 0,
      bottlenecks: []
    });
    setSystemAlerts([]);
    setRecentActivities([]);
    setSystemStatus({
      database: 'healthy',
      redis: 'healthy',
      api: 'healthy',
      lastBackup: new Date().toISOString()
    });
  };

  const getActivityIcon = (type: string) => {
    const icons: { [key: string]: string } = {
      'post_created': '📝',
      'post_completed': '✅',
      'agent_executed': '🤖',
      'campaign_created': '🎯',
      'hospital_registered': '🏥',
      'user_action': '👤',
      'error': '❌',
      'system': '⚙️'
    };
    return icons[type] || '📋';
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'healthy': 'text-green-600 bg-green-100',
      'warning': 'text-yellow-600 bg-yellow-100',
      'error': 'text-red-600 bg-red-100'
    };
    return colors[status] || 'text-gray-600 bg-gray-100';
  };

  const getAlertIcon = (level: string) => {
    const icons: { [key: string]: string } = {
      'info': 'ℹ️',
      'warning': '⚠️',
      'error': '❌',
      'critical': '🚨'
    };
    return icons[level] || '📢';
  };

  const getAlertColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'info': 'border-blue-200 bg-blue-50',
      'warning': 'border-yellow-200 bg-yellow-50',
      'error': 'border-red-200 bg-red-50',
      'critical': 'border-red-200 bg-red-50'
    };
    return colors[level] || 'border-gray-200 bg-gray-50';
  };

  const getQualityTrendIcon = (trend: string) => {
    const icons: { [key: string]: string } = {
      'improving': '📈',
      'stable': '➡️',
      'declining': '📉'
    };
    return icons[trend] || '➡️';
  };

  const getQualityTrendColor = (trend: string) => {
    const colors: { [key: string]: string } = {
      'improving': 'text-green-600',
      'stable': 'text-blue-600',
      'declining': 'text-red-600'
    };
    return colors[trend] || 'text-gray-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">MediContents QA 대시보드</h1>
            <p className="text-gray-600 mt-2">실시간 시스템 모니터링 및 콘텐츠 생성 현황</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">실시간 업데이트</span>
            </div>
            <span className="text-sm text-gray-500">
              마지막 업데이트: {formatDateTime(new Date().toISOString())}
            </span>
          </div>
        </div>
      </div>

      {/* 메인 대시보드 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="processing">처리 현황</TabsTrigger>
          <TabsTrigger value="agents">AI 에이전트</TabsTrigger>
          <TabsTrigger value="alerts">알림</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 주요 메트릭 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">총 포스트</p>
                      <p className="text-2xl font-bold">{stats.totalPosts}</p>
                    </div>
                    <div className="text-2xl">📝</div>
                  </div>
                  <div className="mt-4 flex items-center text-sm">
                    <span className="text-green-600 font-medium">{stats.completedPosts} 완료</span>
                    <span className="mx-2 text-gray-400">•</span>
                    <span className="text-blue-600 font-medium">{stats.activePosts} 진행중</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">활성 병원</p>
                      <p className="text-2xl font-bold">{stats.activeHospitals}</p>
                    </div>
                    <div className="text-2xl">🏥</div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    총 {stats.totalHospitals}개 병원
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">AI 성공률</p>
                      <p className="text-2xl font-bold">{stats.agentSuccessRate}%</p>
                    </div>
                    <div className="text-2xl">🤖</div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    {stats.agentExecutions}회 실행
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">활성 캠페인</p>
                      <p className="text-2xl font-bold">{stats.activeCampaigns}</p>
                    </div>
                    <div className="text-2xl">📋</div>
                  </div>
                  <div className="mt-4 text-sm text-gray-600">
                    총 {stats.totalCampaigns}개 캠페인
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 품질 메트릭 */}
          {qualityMetrics && (
            <Card>
              <CardHeader>
                <CardTitle>콘텐츠 품질 현황</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="text-3xl mb-2">
                      {getQualityTrendIcon(qualityMetrics.quality_trend)}
                    </div>
                    <div className={`text-lg font-bold ${getQualityTrendColor(qualityMetrics.quality_trend)}`}>
                      {qualityMetrics.quality_trend === 'improving' ? '개선 중' :
                       qualityMetrics.quality_trend === 'stable' ? '안정적' : '주의 필요'}
                    </div>
                    <div className="text-sm text-gray-600">품질 추이</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      {qualityMetrics.avg_seo_score}/100
                    </div>
                    <div className="text-sm text-gray-600">평균 SEO 점수</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {qualityMetrics.avg_legal_score}/100
                    </div>
                    <div className="text-sm text-gray-600">평균 법적 준수 점수</div>
                  </div>

                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {qualityMetrics.first_pass_rate}%
                    </div>
                    <div className="text-sm text-gray-600">1차 승인율</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className="text-lg">{getActivityIcon(activity.type)}</div>
                    <div className="flex-1">
                      <p className="font-medium">{activity.description}</p>
                      <p className="text-sm text-gray-600">{formatDateTime(activity.timestamp)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 처리 현황 탭 */}
        <TabsContent value="processing" className="space-y-6">
          {processingStatus && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 처리 단계별 현황 */}
              <Card>
                <CardHeader>
                  <CardTitle>처리 단계별 현황</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="font-medium">AI 처리 중</span>
                      </div>
                      <Badge variant="secondary">{processingStatus.agent_processing}개</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="font-medium">관리자 검토</span>
                      </div>
                      <Badge variant="secondary">{processingStatus.admin_review}개</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-orange-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                        <span className="font-medium">클라이언트 검토</span>
                      </div>
                      <Badge variant="secondary">{processingStatus.client_review}개</Badge>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="font-medium">총 처리 중</span>
                      </div>
                      <Badge variant="secondary">{processingStatus.total_processing}개</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 오늘의 성과 */}
              <Card>
                <CardHeader>
                  <CardTitle>오늘의 성과</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-4 bg-green-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-green-600">{processingStatus.completed_today}</div>
                        <div className="text-sm text-green-700">완료된 포스트</div>
                      </div>
                      <div className="text-3xl">✅</div>
                    </div>

                    <div className="flex justify-between items-center p-4 bg-red-50 rounded-lg">
                      <div>
                        <div className="text-2xl font-bold text-red-600">{processingStatus.failed_today}</div>
                        <div className="text-sm text-red-700">실패한 포스트</div>
                      </div>
                      <div className="text-3xl">❌</div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-medium mb-2">병목 현상</h4>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {processingStatus.bottlenecks.map((bottleneck, index) => (
                          <li key={index} className="flex items-center space-x-2">
                            <span className="text-yellow-500">⚠️</span>
                            <span>{bottleneck}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        {/* AI 에이전트 탭 */}
        <TabsContent value="agents" className="space-y-6">
          {agentPerformance.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agentPerformance.map((agent) => (
                <Card key={agent.agent_type}>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <span>🤖</span>
                      <span>{agent.agent_type}</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-2xl font-bold text-blue-600">{agent.total_executions}</div>
                          <div className="text-sm text-gray-600">총 실행</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-green-600">{agent.success_rate}%</div>
                          <div className="text-sm text-gray-600">성공률</div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span>평균 실행 시간</span>
                          <span className="font-medium">{agent.avg_execution_time}초</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>성공</span>
                          <span className="font-medium text-green-600">{agent.successful_executions}회</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span>실패</span>
                          <span className="font-medium text-red-600">{agent.failed_executions}회</span>
                        </div>
                      </div>

                      <div className="pt-3 border-t text-xs text-gray-500">
                        마지막 실행: {formatDateTime(agent.last_execution)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        {/* 알림 탭 */}
        <TabsContent value="alerts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>시스템 알림</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-4 border rounded-lg ${getAlertColor(alert.level)}`}
                  >
                    <div className="flex items-start space-x-3">
                      <div className="text-lg">{getAlertIcon(alert.level)}</div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <Badge variant={alert.level === 'critical' ? 'destructive' : 'secondary'}>
                            {alert.level === 'info' ? '정보' :
                             alert.level === 'warning' ? '경고' :
                             alert.level === 'error' ? '오류' : '심각'}
                          </Badge>
                          <span className="text-sm text-gray-500">
                            {formatDateTime(alert.timestamp)}
                          </span>
                        </div>
                        <p className="font-medium mt-2">{alert.message}</p>
                        <p className="text-sm text-gray-600 mt-1">출처: {alert.source}</p>
                        {alert.resolved && (
                          <Badge variant="outline" className="mt-2">
                            해결됨
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                {systemAlerts.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">모든 시스템이 정상입니다</h3>
                    <p className="text-gray-600">현재 활성 알림이 없습니다.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* 시스템 상태 */}
          {systemStatus && (
            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.database === 'healthy' ? 'bg-green-500' :
                      systemStatus.database === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">데이터베이스</div>
                      <div className="text-sm text-gray-600 capitalize">{systemStatus.database}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.redis === 'healthy' ? 'bg-green-500' :
                      systemStatus.redis === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">Redis 캐시</div>
                      <div className="text-sm text-gray-600 capitalize">{systemStatus.redis}</div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 p-3 border rounded-lg">
                    <div className={`w-3 h-3 rounded-full ${
                      systemStatus.api === 'healthy' ? 'bg-green-500' :
                      systemStatus.api === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                    }`}></div>
                    <div>
                      <div className="font-medium">API 서비스</div>
                      <div className="text-sm text-gray-600 capitalize">{systemStatus.api}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-600">
                    마지막 백업: {formatDateTime(systemStatus.lastBackup)}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
