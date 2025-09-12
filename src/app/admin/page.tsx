'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatDate, getStatusText, getStatusColor } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Post, AgentExecutionLog, PipelineResult } from '@/types/common';

interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  completedPosts: number;
  averageQualityScore: number;
  averageImprovementRate: number;
  successRate: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPosts: 0,
    pendingPosts: 0,
    completedPosts: 0,
    averageQualityScore: 0,
    averageImprovementRate: 0,
    successRate: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [recentLogs, setRecentLogs] = useState<AgentExecutionLog[]>([]);
  const [pipelineResults, setPipelineResults] = useState<PipelineResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [
          dashboardStats,
          recentPostsData,
          recentLogsData,
          pipelineResultsData
        ] = await Promise.all([
          adminApi.getDashboardStats(),
          adminApi.getPosts({ limit: 5 }),
          adminApi.getRecentAgentLogs(10),
          adminApi.getRecentPipelineResults(5)
        ]);

        setStats(dashboardStats);
        setRecentPosts(recentPostsData.posts || []);
        setRecentLogs(recentLogsData);
        setPipelineResults(pipelineResultsData);
      } catch (error) {
        console.error('대시보드 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setStats({
          totalPosts: 0,
          pendingPosts: 0,
          completedPosts: 0,
          averageQualityScore: 0,
          averageImprovementRate: 0,
          successRate: 0,
        });
        setRecentPosts([]);
        setRecentLogs([]);
        setPipelineResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">관리자 대시보드</h1>
        <p className="text-gray-600 mt-2">시스템 현황을 한눈에 확인하세요</p>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">총 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">대기 중</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">완료</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.completedPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 품질 점수</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.averageQualityScore.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 개선률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageImprovementRate.toFixed(1)}%</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">성공률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.successRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 메인 콘텐츠 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 최근 포스트 */}
        <Card>
          <CardHeader>
            <CardTitle>최근 포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">
                      {post.title || '제목 미정'}
                    </h3>
                    <p className="text-sm text-gray-600">Post ID: {post.post_id}</p>
                    <p className="text-xs text-gray-500">{formatDate(post.created_at)}</p>
                  </div>
                  <Badge className={getStatusColor(post.status)}>
                    {getStatusText(post.status)}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 파이프라인 결과 */}
        <Card>
          <CardHeader>
            <CardTitle>파이프라인 실행 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pipelineResults.map((result) => (
                <div key={result.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {result.final_title || '제목 없음'}
                    </h3>
                    <Badge variant={result.pipeline_status === 'completed' ? 'success' : 'warning'}>
                      {result.pipeline_status}
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">품질 점수:</span>
                      <div className="font-semibold text-blue-600">
                        {result.quality_score?.toFixed(1) || '0.0'}
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">개선률:</span>
                      <div className="font-semibold text-green-600">
                        {result.improvement_rate?.toFixed(1) || '0.0'}%
                      </div>
                    </div>
                    <div>
                      <span className="text-gray-600">반복 횟수:</span>
                      <div className="font-semibold text-purple-600">
                        {result.total_iterations}회
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    완료: {result.pipeline_completed_at ? formatDate(result.pipeline_completed_at) : '미완료'}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 최근 에이전트 실행 로그 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>최근 에이전트 실행 로그</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Post ID</th>
                  <th className="text-left py-2">에이전트</th>
                  <th className="text-left py-2">상태</th>
                  <th className="text-left py-2">실행 시간</th>
                  <th className="text-left py-2">생성 시간</th>
                </tr>
              </thead>
              <tbody>
                {recentLogs.map((log) => (
                  <tr key={log.id} className="border-b">
                    <td className="py-2 font-mono text-sm">{log.post_id}</td>
                    <td className="py-2">
                      <Badge variant="outline">{log.agent_type}</Badge>
                    </td>
                    <td className="py-2">
                      <Badge 
                        variant={log.execution_status === 'completed' ? 'success' : 
                                log.execution_status === 'failed' ? 'destructive' : 'warning'}
                      >
                        {log.execution_status}
                      </Badge>
                    </td>
                    <td className="py-2 text-sm">
                      {log.execution_time ? `${(log.execution_time / 1000).toFixed(1)}초` : '-'}
                    </td>
                    <td className="py-2 text-sm text-gray-600">
                      {formatDate(log.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
