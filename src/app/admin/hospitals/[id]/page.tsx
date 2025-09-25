'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import Button from '@/components/shared/Button';
import { adminApi } from '@/services/api';
import type { Hospital, Campaign, Post, User } from '@/types/common';
import { formatDateTime } from '@/lib/utils';

interface HospitalDashboard {
  hospital: Hospital;
  campaigns: Campaign[];
  posts: Post[];
  users: User[];
  metrics: {
    totalPosts: number;
    completedPosts: number;
    activeCampaigns: number;
    avgQualityScore: number;
    totalRevenue: number; // 임시 값
  };
}

export default function AdminHospitalDetail() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [metrics, setMetrics] = useState<HospitalDashboard['metrics'] | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);

        // 병원 정보 조회
        const hospitalData = await adminApi.getHospitals().then(hospitals =>
          hospitals.hospitals?.find(h => h.id.toString() === hospitalId)
        );

        if (!hospitalData) {
          throw new Error('병원을 찾을 수 없습니다.');
        }

        setHospital(hospitalData);

        // 해당 병원의 캠페인과 포스트 조회
        const [campaignsData, postsData] = await Promise.all([
          adminApi.getCampaigns({ hospital_id: parseInt(hospitalId) }),
          adminApi.getPosts({ hospital_id: parseInt(hospitalId) })
        ]);

        setCampaigns(campaignsData);
        setPosts(postsData.posts || []);

        // 메트릭 계산
        const calculatedMetrics = calculateMetrics(hospitalData, campaignsData, postsData.posts || []);
        setMetrics(calculatedMetrics);

        // 사용자 정보 조회 (임시로 빈 배열)
        setUsers([]);

      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (hospitalId) {
      loadData();
    }
  }, [hospitalId]);

  const calculateMetrics = (hospital: Hospital, campaigns: Campaign[], posts: Post[]) => {
    const totalPosts = posts.length;
    const completedPosts = posts.filter(p => p.status === 'published' || p.status === 'final_revision').length;
    const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
    const avgQualityScore = posts.length > 0 ? 85 : 0; // 임시 값
    const totalRevenue = campaigns.length * 100000; // 임시 값

    return {
      totalPosts,
      completedPosts,
      activeCampaigns,
      avgQualityScore,
      totalRevenue
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
      'failed': 'bg-red-100 text-red-800',
      'active': 'bg-blue-100 text-blue-800',
      'inactive': 'bg-gray-100 text-gray-800'
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
      'failed': '실패',
      'active': '진행 중',
      'inactive': '중지됨'
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

  if (!hospital) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">병원을 찾을 수 없습니다.</p>
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
            <h1 className="text-2xl font-bold text-gray-900">{hospital.name}</h1>
            <div className="text-gray-600 mt-1">
              <p>{hospital.address}</p>
              {hospital.phone && <p>전화: {hospital.phone}</p>}
              {hospital.website && <p>웹사이트: <a href={hospital.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{hospital.website}</a></p>}
            </div>
            <div className="flex items-center space-x-4 mt-2">
              <Badge variant={hospital.is_active ? 'success' : 'secondary'}>
                {hospital.is_active ? '활성' : '비활성'}
              </Badge>
              <span className="text-sm text-gray-600">
                등록일: {hospital.created_at ? formatDateTime(hospital.created_at) : '알 수 없음'}
              </span>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              목록으로
            </Button>
            <Button onClick={() => router.push(`/admin/hospitals/${hospitalId}/edit`)}>
              병원 정보 수정
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 대시보드 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">개요</TabsTrigger>
          <TabsTrigger value="campaigns">캠페인</TabsTrigger>
          <TabsTrigger value="posts">포스트</TabsTrigger>
          <TabsTrigger value="users">사용자</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* 주요 메트릭 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">총 포스트</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.totalPosts || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  완료: {metrics?.completedPosts || 0}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">진행 중 캠페인</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.activeCampaigns || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  총 캠페인: {campaigns.length}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">평균 품질 점수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{metrics?.avgQualityScore || 0}</div>
                <p className="text-xs text-gray-500 mt-1">
                  /100점
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">총 매출</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {(metrics?.totalRevenue || 0).toLocaleString()}원
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  예상 매출
                </p>
              </CardContent>
            </Card>
          </div>

          {/* 최근 활동 */}
          <Card>
            <CardHeader>
              <CardTitle>최근 활동</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {posts.slice(0, 5).map((post) => (
                  <div key={post.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center space-x-3">
                      <div className="text-lg">
                        {post.status === 'published' ? '📄' : '⚡'}
                      </div>
                      <div>
                        <p className="font-medium">{post.title || `포스트 ${post.id}`}</p>
                        <p className="text-sm text-gray-600">
                          {formatDateTime(post.created_at)} • {getStatusLabel(post.status)}
                        </p>
                      </div>
                    </div>
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusLabel(post.status)}
                    </Badge>
                  </div>
                ))}
                {posts.length === 0 && (
                  <p className="text-center text-gray-500 py-4">최근 활동이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>캠페인 목록</CardTitle>
                <Button onClick={() => router.push('/admin/campaigns/create')}>
                  새 캠페인 생성
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map((campaign) => (
                  <div key={campaign.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="font-medium">{campaign.name}</h3>
                        <Badge className={getStatusColor(campaign.status)}>
                          {getStatusLabel(campaign.status)}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {formatDateTime(campaign.start_date)} - {formatDateTime(campaign.end_date)}
                        {campaign.description && (
                          <span className="ml-2">• {campaign.description}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/campaigns/${campaign.id}`)}
                      >
                        상세 보기
                      </Button>
                    </div>
                  </div>
                ))}
                {campaigns.length === 0 && (
                  <p className="text-center text-gray-500 py-8">등록된 캠페인이 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="posts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>포스트 목록</CardTitle>
                <Button onClick={() => router.push('/admin/posts/create')}>
                  새 포스트 생성
                </Button>
              </div>
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
                        {post.campaign_id && (
                          <span className="ml-2">
                            • 캠페인: {campaigns.find(c => c.id === post.campaign_id)?.name}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/posts/${post.id}`)}
                      >
                        상세
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/posts/${post.id}/pipeline`)}
                      >
                        파이프라인
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/posts/${post.id}/edit`)}
                      >
                        편집
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => router.push(`/admin/posts/${post.id}/review`)}
                      >
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

        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>병원 사용자</CardTitle>
                <Button onClick={() => router.push('/admin/system/users')}>
                  사용자 관리
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                        <span className="text-primary-600 font-medium">
                          {user.username?.charAt(0) || 'U'}
                        </span>
                      </div>
                      <div>
                        <p className="font-medium">{user.username}</p>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={user.is_active ? 'success' : 'secondary'}>
                        {user.is_active ? '활성' : '비활성'}
                      </Badge>
                      <Badge variant="outline">{user.role}</Badge>
                    </div>
                  </div>
                ))}
                {users.length === 0 && (
                  <p className="text-center text-gray-500 py-8">등록된 사용자가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
