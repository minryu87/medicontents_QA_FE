'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import { adminApi } from '@/services/api';
import type { Campaign, Post } from '@/types/common';
import { formatDateTime } from '@/lib/utils';

interface CampaignDashboard {
  campaign: Campaign;
  posts: Post[];
  metrics: {
    progress: {
      overall: number;
      byStatus: { [status: string]: number };
      timeline: {
        elapsed: number;
        remaining: number;
      };
    };
    quality: {
      avgSeoScore: number;
      avgLegalScore: number;
      firstPassRate: number;
    };
    productivity: {
      postsPerWeek: number;
      avgCompletionTime: number;
      bottlenecks: string[];
    };
  };
}

export default function AdminCampaignDetail() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [metrics, setMetrics] = useState<CampaignDashboard['metrics'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [campaignData, postsData] = await Promise.all([
          adminApi.getCampaign(parseInt(campaignId)),
          adminApi.getCampaignPosts(parseInt(campaignId))
        ]);

        setCampaign(campaignData);
        setPosts(postsData || []);

        // 메트릭 계산
        const calculatedMetrics = calculateMetrics(campaignData, postsData || []);
        setMetrics(calculatedMetrics);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) {
      loadData();
    }
  }, [campaignId]);

  const calculateMetrics = (campaign: Campaign, posts: Post[]) => {
    const totalPosts = posts.length;
    const completedPosts = posts.filter(p => p.status === 'published' || p.status === 'final_revision').length;
    const overallProgress = totalPosts > 0 ? (completedPosts / totalPosts) * 100 : 0;

    // 상태별 분포
    const byStatus = posts.reduce((acc, post) => {
      acc[post.status] = (acc[post.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });

    // 타임라인 계산
    const startDate = new Date(campaign.start_date);
    const endDate = new Date(campaign.end_date);
    const now = new Date();
    const totalDuration = endDate.getTime() - startDate.getTime();
    const elapsed = Math.max(0, now.getTime() - startDate.getTime());
    const elapsedDays = Math.ceil(elapsed / (1000 * 60 * 60 * 24));
    const remainingDays = Math.max(0, Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));

    // 품질 메트릭 (실제로는 pipeline_results에서 가져와야 함)
    const avgSeoScore = 85; // 임시 값
    const avgLegalScore = 90; // 임시 값
    const firstPassRate = 75; // 임시 값

    // 생산성 메트릭
    const postsPerWeek = totalPosts > 0 ? (totalPosts / Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24 * 7)))) : 0;
    const avgCompletionTime = 2.5; // 임시 값 (일)
    const bottlenecks = ['AI 에이전트 응답 지연', '콘텐츠 검토 대기']; // 임시 값

    return {
      progress: {
        overall: overallProgress,
        byStatus,
        timeline: {
          elapsed: elapsedDays,
          remaining: remainingDays
        }
      },
      quality: {
        avgSeoScore,
        avgLegalScore,
        firstPassRate
      },
      productivity: {
        postsPerWeek,
        avgCompletionTime,
        bottlenecks
      }
    };
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'initial': 'bg-gray-100 text-gray-800',
      'agent_processing': 'bg-blue-100 text-blue-800',
      'admin_review': 'bg-yellow-100 text-yellow-800',
      'client_review': 'bg-orange-100 text-orange-800',
      'completed': 'bg-green-100 text-green-800',
      'published': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      'initial': '초기',
      'agent_processing': 'AI 처리 중',
      'admin_review': '관리자 검토',
      'client_review': '클라이언트 검토',
      'completed': '완료',
      'published': '게시됨',
      'failed': '실패'
    };
    return labels[status] || status;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!campaign) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">캠페인을 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
            <p className="text-gray-600">{campaign.description}</p>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={campaign.status === 'active' ? 'success' : 'secondary'}>
                {campaign.status === 'active' ? '진행 중' : '완료'}
              </Badge>
              <span className="text-sm text-gray-600">
                {formatDateTime(campaign.start_date)} - {formatDateTime(campaign.end_date)}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              목록으로
            </Button>
            <Button>
              캠페인 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 대시보드 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="posts">포스트 관리</TabsTrigger>
          <TabsTrigger value="analytics">성과 분석</TabsTrigger>
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 진행률 메트릭 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>전체 진행률</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-2xl font-bold">{Math.round(metrics?.progress.overall || 0)}%</span>
                    <span className="text-sm text-gray-600">
                      {posts.filter(p => p.status === 'published' || p.status === 'final_revision').length}/{posts.length} 완료
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                      className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${metrics?.progress.overall || 0}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>경과: {metrics?.progress.timeline.elapsed}일</span>
                    <span>남음: {metrics?.progress.timeline.remaining}일</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>품질 지표</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">SEO 점수</span>
                    <span className="font-semibold">{metrics?.quality.avgSeoScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">법적 준수</span>
                    <span className="font-semibold">{metrics?.quality.avgLegalScore}/100</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">1차 승인율</span>
                    <span className="font-semibold">{metrics?.quality.firstPassRate}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>생산성</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-sm">주간 포스트 수</span>
                    <span className="font-semibold">{metrics?.productivity.postsPerWeek.toFixed(1)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">평균 완료 시간</span>
                    <span className="font-semibold">{metrics?.productivity.avgCompletionTime}일</span>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-red-600">병목 현상:</span>
                    <ul className="text-xs text-gray-600 mt-1">
                      {metrics?.productivity.bottlenecks.map((bottleneck, index) => (
                        <li key={index}>• {bottleneck}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 상태별 분포 */}
          <Card>
            <CardHeader>
              <CardTitle>포스트 상태 분포</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(metrics?.progress.byStatus || {}).map(([status, count]) => (
                  <div key={status} className="text-center">
                    <div className="text-2xl font-bold">{count}</div>
                    <Badge className={getStatusColor(status)}>
                      {getStatusLabel(status)}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>포스트 목록</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{post.title || `포스트 ${post.id}`}</h3>
                        <Badge className={getStatusColor(post.status)}>
                          {getStatusLabel(post.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        생성일: {formatDateTime(post.created_at)}
                        {post.updated_at && ` • 수정일: ${formatDateTime(post.updated_at)}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/posts/${post.id}`)}>
                        상세
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/posts/${post.id}/pipeline`)}>
                        파이프라인
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/posts/${post.id}/edit`)}>
                        편집
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/posts/${post.id}/review`)}>
                        검토
                      </Button>
                    </div>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-center text-gray-500 py-8">등록된 포스트가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>성과 분석</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📊</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">성과 분석</h3>
                <p className="text-gray-600">상세한 성과 분석 차트가 이곳에 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>캠페인 타임라인</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📅</div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">타임라인</h3>
                <p className="text-gray-600">캠페인 진행 상황을 시각적으로 보여주는 타임라인이 표시됩니다.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
