'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [systemStatus, setSystemStatus] = useState<SystemStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, activitiesData, systemData] = await Promise.all([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivities(),
        adminApi.getSystemStatus()
      ]);

      setStats(statsData);
      setRecentActivities(activitiesData);
      setSystemStatus(systemData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">시스템 전체 현황을 모니터링하고 관리하세요</p>
      </div>

      {/* Key Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">전체 포스트</p>
                <p className="text-3xl font-bold">{stats.totalPosts}</p>
                <p className="text-sm text-gray-600 mt-1">
                  활성: {stats.activePosts} • 완료: {stats.completedPosts}
                </p>
              </div>
              <div className="text-3xl">📄</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">병원 현황</p>
                <p className="text-3xl font-bold">{stats.totalHospitals}</p>
                <p className="text-sm text-green-600 mt-1">
                  활성: {stats.activeHospitals}
                </p>
              </div>
              <div className="text-3xl">🏥</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">캠페인 현황</p>
                <p className="text-3xl font-bold">{stats.totalCampaigns}</p>
                <p className="text-sm text-blue-600 mt-1">
                  진행 중: {stats.activeCampaigns}
                </p>
              </div>
              <div className="text-3xl">🎯</div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">AI 에이전트</p>
                <p className="text-3xl font-bold">{stats.agentExecutions}</p>
                <p className="text-sm text-green-600 mt-1">
                  성공률: {stats.agentSuccessRate}%
                </p>
              </div>
              <div className="text-3xl">🤖</div>
            </div>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link href="/admin/database">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">🗄️</div>
                <h3 className="font-semibold">데이터베이스 관리</h3>
                <p className="text-sm text-gray-600 mt-1">모든 테이블 직접 관리</p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/posts">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">📝</div>
                <h3 className="font-semibold">포스트 관리</h3>
                <p className="text-sm text-gray-600 mt-1">콘텐츠 검토 및 관리</p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/agents/performance">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">📊</div>
                <h3 className="font-semibold">AI 성능 모니터링</h3>
                <p className="text-sm text-gray-600 mt-1">에이전트 성능 분석</p>
              </div>
            </Card>
          </Link>

          <Link href="/admin/hospitals">
            <Card className="p-4 hover:shadow-lg transition-shadow cursor-pointer">
              <div className="text-center">
                <div className="text-3xl mb-2">🏥</div>
                <h3 className="font-semibold">병원 관리</h3>
                <p className="text-sm text-gray-600 mt-1">고객 병원 관리</p>
              </div>
            </Card>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Activities */}
        <Card className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">최근 활동</h2>
            <Link href="/admin/activities">
              <Button variant="secondary" size="sm">전체 보기</Button>
            </Link>
          </div>
          <div className="space-y-4">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                <div className="text-lg">{getActivityIcon(activity.type)}</div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{activity.description}</p>
                  <p className="text-xs text-gray-600 mt-1">
                    {new Date(activity.timestamp).toLocaleString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
            {recentActivities.length === 0 && (
              <p className="text-gray-500 text-center py-4">최근 활동이 없습니다</p>
            )}
          </div>
        </Card>

        {/* System Status */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">시스템 상태</h2>
          {systemStatus && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">데이터베이스</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(systemStatus.database)}`}>
                  {systemStatus.database === 'healthy' ? '정상' :
                   systemStatus.database === 'warning' ? '주의' : '오류'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Redis 캐시</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(systemStatus.redis)}`}>
                  {systemStatus.redis === 'healthy' ? '정상' :
                   systemStatus.redis === 'warning' ? '주의' : '오류'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">API 서버</span>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(systemStatus.api)}`}>
                  {systemStatus.api === 'healthy' ? '정상' :
                   systemStatus.api === 'warning' ? '주의' : '오류'}
                </span>
              </div>

              <div className="pt-4 border-t">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">마지막 백업</span>
                  <span className="text-sm text-gray-600">
                    {new Date(systemStatus.lastBackup).toLocaleString('ko-KR')}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="mt-6 pt-4 border-t">
            <Link href="/admin/system/health">
              <Button className="w-full">상세 상태 확인</Button>
            </Link>
          </div>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">포스트 상태 분포</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            차트 구현 예정
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">AI 에이전트 성능</h2>
          <div className="h-64 flex items-center justify-center text-gray-500">
            차트 구현 예정
          </div>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">상세 통계</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">오늘의 활동</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">새 포스트</span>
                <span className="font-semibold">12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">완료된 포스트</span>
                <span className="font-semibold">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">AI 실행 횟수</span>
                <span className="font-semibold">156</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">품질 지표</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">평균 SEO 점수</span>
                <span className="font-semibold">82.5</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">평균 Legal 점수</span>
                <span className="font-semibold">87.3</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">자동 승인율</span>
                <span className="font-semibold">78%</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">시스템 성능</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">평균 응답 시간</span>
                <span className="font-semibold">245ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">업타임</span>
                <span className="font-semibold">99.9%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">활성 사용자</span>
                <span className="font-semibold">23</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}