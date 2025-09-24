'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import Button from '@/components/shared/Button';
import { adminApi } from '@/services/api';
import type { Campaign, Post } from '@/types/common';
import { formatDateTime } from '@/lib/utils';
import { Calendar, FileText, Building, Target } from 'lucide-react';

interface CampaignDashboard {
  campaign: Campaign & { hospital?: any };
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

interface PostGenerationItem {
  sequence: number;
  postId: string;
  title: string;
  postType: 'informational' | 'case_study';
  publishDate: string;
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

  // 포스트 생성 관련 상태
  const [generationItems, setGenerationItems] = useState<PostGenerationItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);



  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [campaignData, postsData] = await Promise.all([
          adminApi.getCampaign(parseInt(campaignId)),
          adminApi.getCampaignPosts(parseInt(campaignId))
        ]);

        // 백엔드에서 이미 hospital 정보가 포함되어 있음
        const campaignWithHospital = campaignData;

        setCampaign(campaignWithHospital);
        setPosts(postsData || []);

        // 메트릭 계산
        const calculatedMetrics = calculateMetrics(campaignWithHospital, postsData || []);
        setMetrics(calculatedMetrics);

        // Draft 상태이고 포스트가 없는 경우, 포스트 생성 아이템 초기화
        if (campaignWithHospital.status === 'draft' && (!postsData || postsData.length === 0)) {
          initializePostGenerationItems(campaignWithHospital);
        }

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

  const initializePostGenerationItems = (campaign: Campaign & { hospital?: any }) => {
    const items: PostGenerationItem[] = [];
    const hospitalId = campaign.hospital?.id || campaign.hospital_id;

    // 캠페인 기간 내에 균등하게 분배할 날짜 계산
    const startDate = new Date(campaign.start_date || new Date());
    const endDate = new Date(campaign.end_date || new Date());
    const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const intervalDays = Math.max(1, Math.floor(totalDays / campaign.target_post_count));

    for (let i = 1; i <= campaign.target_post_count; i++) {
      const publishDate = new Date(startDate);
      publishDate.setDate(startDate.getDate() + (i - 1) * intervalDays);

      // 한국 시간으로 포맷팅
      const kstDate = new Date(publishDate.getTime() - (publishDate.getTimezoneOffset() * 60000));
      const dateString = kstDate.toISOString().split('T')[0];

      items.push({
        sequence: i,
        postId: `${hospitalId}-${campaign.id}-${i.toString().padStart(3, '0')}`,
        title: `${campaign.name} - 포스트 ${i}`,
        postType: 'case_study',
        publishDate: dateString
      });
    }

    setGenerationItems(items);
  };

  const handlePostItemChange = (sequence: number, field: keyof PostGenerationItem, value: string) => {
    setGenerationItems(prev =>
      prev.map(item =>
        item.sequence === sequence
          ? { ...item, [field]: value }
          : item
      )
    );
  };

  const handleGeneratePosts = async () => {
    if (!campaign || generationItems.length === 0) return;

    try {
      setGenerating(true);
      setGenerationProgress(0);

      const postData = {
        posts: generationItems.map(item => ({
          sequence: item.sequence,
          title: item.title,
          post_type: item.postType,
          publish_date: item.publishDate
        })),
        created_by: 1 // 임시 어드민 ID
      };

      const result = await adminApi.generatePosts(campaign.id, postData);

      setGenerationProgress(100);

      // 성공 시 포스트 목록 새로고침
      const updatedPosts = await adminApi.getCampaignPosts(campaign.id);
      setPosts(updatedPosts || []);

      alert(result.message || `포스트 ${result.total_created}개가 성공적으로 생성되고 캠페인이 준비 완료 상태로 변경되었습니다!`);

      // 페이지를 새로고침해서 일반 대시보드로 전환
      window.location.reload();

    } catch (error: any) {
      console.error('포스트 생성 실패:', error);
      alert(`포스트 생성에 실패했습니다: ${error.response?.data?.detail || error.message}`);
    } finally {
      setGenerating(false);
      setGenerationProgress(0);
    }
  };

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

    // 품질 메트릭 (실제 데이터로 교체 필요)
    const avgSeoScore = 0; // 실제 데이터 없음
    const avgLegalScore = 0; // 실제 데이터 없음
    const firstPassRate = 0; // 실제 데이터 없음

    // 생산성 메트릭
    const postsPerWeek = totalPosts > 0 ? (totalPosts / Math.max(1, Math.ceil(totalDuration / (1000 * 60 * 60 * 24 * 7)))) : 0;
    const avgCompletionTime = 0; // 실제 데이터 없음
    const bottlenecks: string[] = []; // 실제 데이터 없음

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

  // Draft 상태일 때는 포스트 생성 페이지를 표시
  if (campaign.status === 'draft') {
    return (
      <div className="p-6">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{campaign.name}</h1>
              <p className="text-gray-600">{campaign.description}</p>
              <div className="flex items-center space-x-4 mt-2">
                <Badge variant="secondary">
                  초안
                </Badge>
                <span className="text-sm text-gray-600">
                  캠페인 준비 단계 - 포스트 생성이 필요합니다
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

        {/* 캠페인 정보 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Building className="h-8 w-8 text-blue-600" />
                  <div>
                    <p className="text-sm text-gray-600">병원</p>
                    <p className="font-medium">{(campaign as any).hospital?.name || `병원 ID: ${campaign.hospital_id}`}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Target className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-sm text-gray-600">목표 포스트</p>
                  <p className="font-medium">{campaign.target_post_count}개</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-8 w-8 text-purple-600" />
                <div>
                  <p className="text-sm text-gray-600">캠페인 기간</p>
                  <p className="font-medium text-sm">
                    {formatDateTime(campaign.start_date)} ~ {formatDateTime(campaign.end_date)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <FileText className="h-8 w-8 text-orange-600" />
                <div>
                  <p className="text-sm text-gray-600">현재 포스트</p>
                  <p className="font-medium">{posts.length}개</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 포스트 생성 테이블 */}
        {posts.length === 0 && generationItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>포스트 생성 (총 {generationItems.length}개)</CardTitle>
              <p className="text-sm text-gray-600">
                각 포스트의 제목, 타입, 게시일을 설정한 후 저장하세요.
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-3 font-medium">순번</th>
                      <th className="text-left p-3 font-medium">포스트 ID</th>
                      <th className="text-left p-3 font-medium">제목</th>
                      <th className="text-left p-3 font-medium">타입</th>
                      <th className="text-left p-3 font-medium">게시일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generationItems.map((item) => (
                      <tr key={item.sequence} className="border-b hover:bg-gray-50">
                        <td className="p-3 font-medium">{item.sequence}</td>
                        <td className="p-3 text-sm font-mono text-gray-600">{item.postId}</td>
                        <td className="p-3">
                          <input
                            type="text"
                            value={item.title}
                            onChange={(e) => handlePostItemChange(item.sequence, 'title', e.target.value)}
                            className="w-full px-3 py-2 border rounded-md text-sm"
                            placeholder="포스트 제목을 입력하세요"
                          />
                        </td>
                        <td className="p-3">
                          <select
                            value={item.postType}
                            onChange={(e) => handlePostItemChange(item.sequence, 'postType', e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                          >
                            <option value="informational">정보성</option>
                            <option value="case_study">치료사례</option>
                          </select>
                        </td>
                        <td className="p-3">
                          <input
                            type="date"
                            value={item.publishDate}
                            onChange={(e) => handlePostItemChange(item.sequence, 'publishDate', e.target.value)}
                            className="px-3 py-2 border rounded-md text-sm"
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* 전체 저장 버튼 */}
              <div className="mt-6 flex justify-between items-center">
                <div className="text-sm text-gray-600">
                  모든 포스트 정보를 확인한 후 저장하세요.
                </div>
                <Button
                  onClick={handleGeneratePosts}
                  disabled={generating}
                  className="px-6"
                >
                  {generating ? '생성 중...' : '전체 저장 및 생성'}
                </Button>
              </div>

              {/* 진행률 표시 */}
              {generating && (
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${generationProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    포스트 생성 진행 중... {generationProgress}%
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* 이미 생성된 포스트가 있는 경우 */}
        {posts.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>생성된 포스트 목록</CardTitle>
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
                        {post.publish_date && ` • 게시일: ${formatDateTime(post.publish_date)}`}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline" onClick={() => router.push(`/admin/posts/${post.id}`)}>
                        상세
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
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
                    <span className="font-semibold">
                      {metrics && metrics.quality && metrics.quality.avgSeoScore > 0 ? `${metrics.quality.avgSeoScore}/100` : '데이터 없음'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">법적 준수</span>
                    <span className="font-semibold">
                      {metrics && metrics.quality && metrics.quality.avgLegalScore > 0 ? `${metrics.quality.avgLegalScore}/100` : '데이터 없음'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">1차 승인율</span>
                    <span className="font-semibold">
                      {metrics && metrics.quality && metrics.quality.firstPassRate > 0 ? `${metrics.quality.firstPassRate}%` : '데이터 없음'}
                    </span>
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
                    <span className="font-semibold">
                      {metrics && metrics.productivity && metrics.productivity.avgCompletionTime > 0 ? `${metrics.productivity.avgCompletionTime}일` : '데이터 없음'}
                    </span>
                  </div>
                  {metrics?.productivity.bottlenecks && metrics.productivity.bottlenecks.length > 0 && (
                    <div>
                      <span className="text-sm font-medium text-red-600">병목 현상:</span>
                      <ul className="text-xs text-gray-600 mt-1">
                        {metrics.productivity.bottlenecks.map((bottleneck, index) => (
                          <li key={index}>• {bottleneck}</li>
                        ))}
                      </ul>
                    </div>
                  )}
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
