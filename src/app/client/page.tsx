'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Progress } from '@/components/ui/Progress';
import { formatDateTime } from '@/lib/utils';

interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  completedPosts: number;
  averageQualityScore: number;
  approvalRate: number;
}

interface UrgentMaterial {
  id: number;
  post_id: string;
  title: string;
  created_at: string;
  campaign_name: string;
  days_since_creation: number;
}

interface OldReview {
  id: number;
  post_id: string;
  title: string;
  created_at: string;
  pipeline_completed_at: string;
  campaign_name: string;
  days_waiting: number;
}

interface MaterialNeeded {
  id: number;
  post_id: string;
  title: string;
  status: string;
  created_at: string;
  campaign_name: string;
  material_status: string;
}

interface ReviewNeeded {
  id: number;
  post_id: string;
  title: string;
  status: string;
  created_at: string;
  quality_score: number;
  seo_score: number;
  legal_score: number;
  campaign_name: string;
}

interface RecentPublished {
  id: number;
  post_id: string;
  title: string;
  status: string;
  publish_date: string;
  created_at: string;
  quality_score: number;
  campaign_name: string;
}

interface CampaignWithPosts {
  campaign: {
    id: number;
    name: string;
    description: string;
    start_date: string;
    end_date: string;
    target_post_count: number;
    status: string;
    total_posts: number;
    completed_posts: number;
    review_pending: number;
    materials_needed: number;
    progress: number;
  };
  posts: Array<{
    id: number;
    post_id: string;
    title: string;
    status: string;
    created_at: string;
    quality_score: number;
    seo_score: number;
    legal_score: number;
    material_status: string;
  }>;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [urgentMaterials, setUrgentMaterials] = useState<UrgentMaterial[]>([]);
  const [oldReviews, setOldReviews] = useState<OldReview[]>([]);
  const [materialsNeeded, setMaterialsNeeded] = useState<MaterialNeeded[]>([]);
  const [reviewNeeded, setReviewNeeded] = useState<ReviewNeeded[]>([]);
  const [recentPublished, setRecentPublished] = useState<RecentPublished[]>([]);
  const [campaignsWithPosts, setCampaignsWithPosts] = useState<CampaignWithPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    loadDashboardData();

    // 실시간 업데이트 (5분마다)
    const interval = setInterval(loadDashboardData, 300000);
    return () => clearInterval(interval);
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 실제 API 호출로 데이터 로드
      const [
        statsData,
        actionRequiredData,
        statusSummaryData,
        campaignsData
      ] = await Promise.all([
        clientApi.getDashboardStats(),
        clientApi.getActionRequiredPosts(),
        clientApi.getPostsStatusSummary(),
        clientApi.getCampaignsWithPosts()
      ]);

      setStats(statsData);
      setUrgentMaterials(actionRequiredData.urgent_materials);
      setOldReviews(actionRequiredData.old_reviews);
      setMaterialsNeeded(statusSummaryData.materials_needed);
      setReviewNeeded(statusSummaryData.review_needed);
      setRecentPublished(statusSummaryData.recent_published);
      setCampaignsWithPosts(campaignsData);

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 에러 시 기본 데이터 설정
      setStats({
        totalPosts: 0,
        pendingPosts: 0,
        completedPosts: 0,
        averageQualityScore: 0.0,
        approvalRate: 0.0
      });
      setUrgentMaterials([]);
      setOldReviews([]);
      setMaterialsNeeded([]);
      setReviewNeeded([]);
      setRecentPublished([]);
      setCampaignsWithPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'initial': 'bg-gray-100 text-gray-800',
      'hospital_processing': 'bg-blue-100 text-blue-800',
      'agent_processing': 'bg-yellow-100 text-yellow-800',
      'client_review': 'bg-purple-100 text-purple-800',
      'admin_approved': 'bg-indigo-100 text-indigo-800',
      'client_approved': 'bg-teal-100 text-teal-800',
      'published': 'bg-green-100 text-green-800',
      'error': 'bg-red-100 text-red-800',
      'cancelled': 'bg-orange-100 text-orange-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'initial': '초기',
      'hospital_processing': '자료 작성 중',
      'agent_processing': 'AI 처리 중',
      'client_review': '검토 필요',
      'admin_approved': '관리자 승인',
      'client_approved': '클라이언트 승인',
      'published': '게시됨',
      'error': '오류',
      'cancelled': '취소됨'
    };
    return texts[status] || status;
  };

  const getActionButton = (post: any, type: 'material' | 'review') => {
    if (type === 'material') {
      return (
        <Link href={`/client/posts/${post.post_id}/materials`}>
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            자료 제공
          </Button>
        </Link>
      );
    } else {
      return (
        <Link href={`/client/posts/${post.post_id}/review`}>
          <Button size="sm" className="bg-purple-600 hover:bg-purple-700">
            검토하기
          </Button>
        </Link>
      );
    }
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
            <h1 className="text-3xl font-bold">클라이언트 대시보드</h1>
            <p className="text-gray-600 mt-2">콘텐츠 생성 현황 및 작업 관리</p>
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

      {/* 긴급 조치 필요 알림 */}
      {(urgentMaterials.length > 0 || oldReviews.length > 0) && (
        <Card className="mb-6 border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-red-800">
              <span className="text-2xl">🚨</span>
              <span>긴급 조치 필요</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {urgentMaterials.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">자료 제공 지연 ({urgentMaterials.length}건)</h4>
                  <div className="space-y-2">
                    {urgentMaterials.slice(0, 3).map((material) => (
                      <div key={material.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1">
                          <p className="font-medium">{material.title}</p>
                          <p className="text-sm text-gray-600">
                            {material.campaign_name} • {material.days_since_creation}일 경과
                          </p>
                        </div>
                        {getActionButton(material, 'material')}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {oldReviews.length > 0 && (
                <div>
                  <h4 className="font-medium text-red-700 mb-2">검토 대기 오래됨 ({oldReviews.length}건)</h4>
                  <div className="space-y-2">
                    {oldReviews.slice(0, 3).map((review) => (
                      <div key={review.id} className="flex items-center justify-between p-3 bg-white rounded border">
                        <div className="flex-1">
                          <p className="font-medium">{review.title}</p>
                          <p className="text-sm text-gray-600">
                            {review.campaign_name} • {review.days_waiting}일 대기
                          </p>
                        </div>
                        {getActionButton(review, 'review')}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 메인 대시보드 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="campaigns">캠페인</TabsTrigger>
          <TabsTrigger value="materials">자료 제공</TabsTrigger>
          <TabsTrigger value="reviews">검토</TabsTrigger>
          <TabsTrigger value="published">게시됨</TabsTrigger>
        </TabsList>

        {/* 개요 탭 */}
        <TabsContent value="overview" className="space-y-6">
          {/* 주요 통계 */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">전체 포스트</p>
                      <p className="text-2xl font-bold">{stats.totalPosts}</p>
                    </div>
                    <div className="text-2xl">📝</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">자료 필요</p>
                      <p className="text-2xl font-bold text-blue-600">{materialsNeeded.length}</p>
                    </div>
                    <div className="text-2xl">📋</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">검토 필요</p>
                      <p className="text-2xl font-bold text-purple-600">{reviewNeeded.length}</p>
                    </div>
                    <div className="text-2xl">👀</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">평균 품질</p>
                      <p className="text-2xl font-bold text-green-600">{stats.averageQualityScore.toFixed(1)}</p>
                    </div>
                    <div className="text-2xl">⭐</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* 빠른 작업 */}
          <Card>
            <CardHeader>
              <CardTitle>빠른 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Link href="/client/posts/create">
                  <Button className="w-full h-16 flex flex-col items-center justify-center space-y-1">
                    <span className="text-2xl">➕</span>
                    <span className="text-sm">새 포스트 생성</span>
                  </Button>
                </Link>

                <Link href="#materials">
                  <Button
                    variant="secondary"
                    className="w-full h-16 flex flex-col items-center justify-center space-y-1"
                    onClick={() => setActiveTab('materials')}
                  >
                    <span className="text-2xl">📋</span>
                    <span className="text-sm">자료 제공 ({materialsNeeded.length})</span>
                  </Button>
                </Link>

                <Link href="#reviews">
                  <Button
                    variant="secondary"
                    className="w-full h-16 flex flex-col items-center justify-center space-y-1"
                    onClick={() => setActiveTab('reviews')}
                  >
                    <span className="text-2xl">👀</span>
                    <span className="text-sm">검토하기 ({reviewNeeded.length})</span>
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 캠페인 탭 */}
        <TabsContent value="campaigns" className="space-y-6">
          {campaignsWithPosts.length > 0 ? (
            <div className="space-y-6">
              {campaignsWithPosts.map((campaignData) => (
                <Card key={campaignData.campaign.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{campaignData.campaign.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{campaignData.campaign.description}</p>
                      </div>
                      <Badge variant="outline">
                        {campaignData.campaign.status === 'active' ? '진행중' : '완료'}
                      </Badge>
                    </div>

                    {/* 캠페인 진행률 */}
                    <div className="mt-4">
                      <div className="flex justify-between text-sm mb-2">
                        <span>진행률</span>
                        <span>{campaignData.campaign.progress}% ({campaignData.campaign.completed_posts}/{campaignData.campaign.target_post_count})</span>
                      </div>
                      <Progress value={campaignData.campaign.progress} className="h-2" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    {/* 포스트 상태 요약 */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      <div className="text-center p-3 bg-blue-50 rounded-lg">
                        <div className="text-lg font-bold text-blue-600">{campaignData.campaign.materials_needed}</div>
                        <div className="text-xs text-blue-700">자료 필요</div>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 rounded-lg">
                        <div className="text-lg font-bold text-yellow-600">{campaignData.campaign.review_pending}</div>
                        <div className="text-xs text-yellow-700">검토 대기</div>
                      </div>
                      <div className="text-center p-3 bg-green-50 rounded-lg">
                        <div className="text-lg font-bold text-green-600">{campaignData.campaign.completed_posts}</div>
                        <div className="text-xs text-green-700">완료</div>
                      </div>
                      <div className="text-center p-3 bg-purple-50 rounded-lg">
                        <div className="text-lg font-bold text-purple-600">{campaignData.campaign.total_posts}</div>
                        <div className="text-xs text-purple-700">전체</div>
                      </div>
                    </div>

                    {/* 포스트 목록 */}
                    <div className="space-y-3">
                      <h4 className="font-medium">포스트 현황</h4>
                      {campaignData.posts.slice(0, 5).map((post) => (
                        <div key={post.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium">{post.title}</p>
                            <p className="text-sm text-gray-600">
                              생성: {formatDateTime(post.created_at)}
                              {post.quality_score && ` • 품질: ${post.quality_score.toFixed(1)}`}
                            </p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge className={getStatusColor(post.status)}>
                              {getStatusText(post.status)}
                            </Badge>
                            {(post.status === 'initial' || post.status === 'hospital_processing') && (
                              <Link href={`/client/posts/${post.post_id}/materials`}>
                                <Button size="sm">자료 제공</Button>
                              </Link>
                            )}
                            {post.status === 'client_review' && (
                              <Link href={`/client/posts/${post.post_id}/review`}>
                                <Button size="sm" variant="secondary">검토</Button>
                              </Link>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">진행 중인 캠페인이 없습니다</h3>
              <p className="text-gray-600">새로운 캠페인이 시작되면 여기에 표시됩니다.</p>
            </div>
          )}
        </TabsContent>

        {/* 자료 제공 탭 */}
        <TabsContent value="materials" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>자료 제공 필요한 포스트</CardTitle>
              <p className="text-sm text-gray-600">AI 콘텐츠 생성을 위해 자료를 제공해야 하는 포스트들입니다.</p>
            </CardHeader>
            <CardContent>
              {materialsNeeded.length > 0 ? (
                <div className="space-y-4">
                  {materialsNeeded.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-gray-600">
                          {post.campaign_name} • 생성일: {formatDateTime(post.created_at)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className={getStatusColor(post.status)}>
                            {getStatusText(post.status)}
                          </Badge>
                          <Badge variant="outline">
                            자료 상태: {post.material_status || '미제공'}
                          </Badge>
                        </div>
                      </div>
                      {getActionButton(post, 'material')}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">모든 포스트에 자료가 제공되었습니다</h3>
                  <p className="text-gray-600">새로운 포스트가 생성되면 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 검토 탭 */}
        <TabsContent value="reviews" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>검토 필요한 포스트</CardTitle>
              <p className="text-sm text-gray-600">AI가 생성한 콘텐츠를 검토하고 승인해야 하는 포스트들입니다.</p>
            </CardHeader>
            <CardContent>
              {reviewNeeded.length > 0 ? (
                <div className="space-y-4">
                  {reviewNeeded.map((post) => (
                    <div key={post.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex-1">
                          <h4 className="font-medium">{post.title}</h4>
                          <p className="text-sm text-gray-600">
                            {post.campaign_name} • 생성일: {formatDateTime(post.created_at)}
                          </p>
                        </div>
                        {getActionButton(post, 'review')}
                      </div>

                      {/* 품질 점수 */}
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div className="text-center p-2 bg-blue-50 rounded">
                          <div className="font-medium text-blue-700">SEO</div>
                          <div className="text-lg font-bold">{post.seo_score?.toFixed(1) || 'N/A'}</div>
                        </div>
                        <div className="text-center p-2 bg-green-50 rounded">
                          <div className="font-medium text-green-700">법적 준수</div>
                          <div className="text-lg font-bold">{post.legal_score?.toFixed(1) || 'N/A'}</div>
                        </div>
                        <div className="text-center p-2 bg-purple-50 rounded">
                          <div className="font-medium text-purple-700">종합 품질</div>
                          <div className="text-lg font-bold">{post.quality_score?.toFixed(1) || 'N/A'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">✅</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">검토할 포스트가 없습니다</h3>
                  <p className="text-gray-600">AI가 콘텐츠를 생성하면 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 게시됨 탭 */}
        <TabsContent value="published" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>게시된 포스트</CardTitle>
              <p className="text-sm text-gray-600">성공적으로 게시된 콘텐츠들을 확인하세요.</p>
            </CardHeader>
            <CardContent>
              {recentPublished.length > 0 ? (
                <div className="space-y-4">
                  {recentPublished.map((post) => (
                    <div key={post.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{post.title}</h4>
                        <p className="text-sm text-gray-600">
                          {post.campaign_name} • 게시일: {formatDateTime(post.publish_date)}
                        </p>
                        <div className="flex items-center space-x-2 mt-2">
                          <Badge className="bg-green-100 text-green-800">게시됨</Badge>
                          {post.quality_score && (
                            <Badge variant="outline">
                              품질: {post.quality_score.toFixed(1)}
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Link href={`/blog/${post.post_id}`} target="_blank">
                        <Button size="sm" variant="outline">블로그에서 보기</Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📄</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">게시된 포스트가 없습니다</h3>
                  <p className="text-gray-600">콘텐츠가 게시되면 여기에 표시됩니다.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}