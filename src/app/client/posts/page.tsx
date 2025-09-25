'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clientApi, adminApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FileText, Clock, CheckCircle, AlertTriangle, Users, Plus, ChevronRight } from 'lucide-react';
import type { Campaign, Post as BasePost } from '@/types/common';

// 포스트 인터페이스 - 백엔드 API 구조에 맞춤
interface Post extends BasePost {
  post_type: 'case_study' | 'informational';
  campaign?: {
    id: number;
    name: string;
  };
  medical_service?: {
    category: string;
    treatment: string;
  };
  publish_date?: string;
  seo_score?: number;
  legal_score?: number;
}

export default function ClientPostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  // 캠페인 데이터 로드
  const loadCampaigns = async () => {
    try {
      const campaignsData = await adminApi.getCampaigns();
      const activeCampaigns = campaignsData.filter((c: Campaign) =>
        ['active', 'completed'].includes(c.status)
      );
      setCampaigns(activeCampaigns);
      return activeCampaigns;
    } catch (error) {
      console.error('캠페인 로드 실패:', error);
      setCampaigns([]);
      return [];
    }
  };

  // 포스트 데이터 로드
  const loadPosts = async (campaignId?: number | null) => {
    try {
      const postParams: any = {};
      if (activeTab !== 'all') postParams.status = activeTab;
      if (campaignId) postParams.campaign_id = campaignId;

      const postsData = await clientApi.getPosts(postParams);
      setPosts(postsData as Post[]);
    } catch (error) {
      console.error('포스트 로드 실패:', error);
      setPosts([]);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    const initializeData = async () => {
      setLoading(true);
      try {
        const activeCampaigns = await loadCampaigns();

        // 첫 번째 캠페인을 기본 선택
        if (activeCampaigns.length > 0) {
          const firstCampaignId = activeCampaigns[0].id;
          setSelectedCampaignId(firstCampaignId);
          await loadPosts(firstCampaignId);
        }
      } catch (error) {
        console.error('초기 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeData();
  }, []);

  // 탭 변경 시 포스트 재로딩
  useEffect(() => {
    if (!loading && selectedCampaignId) {
      loadPosts(selectedCampaignId);
    }
  }, [activeTab]);

  // 캠페인 변경 시 포스트 재로딩 (드롭다운에서 선택 변경 시)
  useEffect(() => {
    if (!loading && selectedCampaignId) {
      loadPosts(selectedCampaignId);
    }
  }, [selectedCampaignId]);

  // 상태별 탭 카운트 계산
  const getTabCounts = () => {
    const all = posts.length;
    const pending_materials = posts.filter(p =>
      ['initial', 'hospital_processing'].includes(p.status)
    ).length;
    const ai_processing = posts.filter(p =>
      ['material_completed', 'agent_processing', 'generation_completed', 'admin_review'].includes(p.status)
    ).length;
    const awaiting_review = posts.filter(p => p.status === 'client_review').length;
    const approved = posts.filter(p =>
      ['client_approved', 'approved', 'publish_scheduled', 'published'].includes(p.status)
    ).length;

    return { all, pending_materials, ai_processing, awaiting_review, approved };
  };

  const tabCounts = getTabCounts();

  // 상태별 색상 (메인 컬러 #4A7C9E + 투명도 활용)
  const getStatusColor = (status: string) => {
    const colors = {
      // 자료 제공 대기
      'initial': 'bg-red-50 border-red-200 text-red-700',
      'hospital_processing': 'bg-red-50 border-red-200 text-red-700',
      // AI 처리 중
      'material_completed': 'bg-blue-50 border-blue-200 text-blue-700',
      'agent_processing': 'bg-blue-50 border-blue-200 text-blue-700',
      'generation_completed': 'bg-blue-50 border-blue-200 text-blue-700',
      'admin_review': 'bg-blue-50 border-blue-200 text-blue-700',
      // 검토 대기
      'client_review': 'bg-yellow-50 border-yellow-200 text-yellow-700',
      // 승인됨
      'client_approved': 'bg-green-50 border-green-200 text-green-700',
      'approved': 'bg-green-50 border-green-200 text-green-700',
      'publish_scheduled': 'bg-green-50 border-green-200 text-green-700',
      'published': 'bg-green-50 border-green-200 text-green-700',
      // 기타
      'other': 'bg-gray-50 border-gray-200 text-gray-700'
    };
    return colors[status as keyof typeof colors] || colors.other;
  };

  // 상태별 텍스트
  const getStatusText = (status: string) => {
    const texts = {
      'initial': '자료 제공 필요',
      'hospital_processing': '자료 처리 중',
      'material_completed': 'AI 콘텐츠 생성 중',
      'agent_processing': 'AI 콘텐츠 생성 중',
      'generation_completed': '어드민 검토 중',
      'admin_review': '어드민 검토 중',
      'client_review': '콘텐츠 검토 필요',
      'client_approved': '승인 완료',
      'approved': '게시 예약됨',
      'publish_scheduled': '게시 예약됨',
      'published': '게시 완료'
    };
    return texts[status as keyof typeof texts] || status;
  };

  // 액션 버튼 텍스트
  const getActionText = (post: Post) => {
    if (post.post_type === 'informational') {
      return '보기';
    }

    switch (post.status) {
      case 'initial':
      case 'hospital_processing':
        return '자료 제공하기';
      case 'client_review':
        return '콘텐츠 검토하기';
      default:
        return '상세 보기';
    }
  };

  // 포스트 타입별 UI 렌더링
  const renderPostCard = (post: Post) => {
    const isCaseStudy = post.post_type === 'case_study';
    const isInformational = post.post_type === 'informational';

    return (
      <Card key={post.id} className="rounded-2xl shadow-lg hover:shadow-xl transition-all duration-200">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <Badge
                  variant="secondary"
                  className={`text-xs px-2 py-1 ${isCaseStudy ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700'}`}
                >
                  {isCaseStudy ? '치료 사례' : '정보성'}
                </Badge>
                <Badge
                  variant="outline"
                  className={`text-xs px-2 py-1 border-2 ${getStatusColor(post.status)}`}
                >
                  {getStatusText(post.status)}
                </Badge>
              </div>
              <CardTitle className="text-sm font-bold text-gray-800 mb-1">
                {post.title || `포스트 ${post.post_id}`}
              </CardTitle>
              <p className="text-xs text-gray-600">ID: {post.post_id}</p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {post.campaign && (
            <div className="mb-3">
              <p className="text-xs text-gray-600 flex items-center gap-1">
                <Users className="w-3 h-3" />
                {post.campaign.name}
              </p>
            </div>
          )}

          {post.medical_service && isCaseStudy && (
            <div className="mb-3">
              <p className="text-xs text-gray-600">
                {post.medical_service.category} - {post.medical_service.treatment}
              </p>
            </div>
          )}

          <div className="text-xs text-gray-600 mb-4">
            생성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}
          </div>

          {(post.seo_score || post.legal_score) && (
            <div className="flex gap-3 mb-4 p-3 bg-gray-50 rounded-xl">
              {post.seo_score && (
                <div className="text-center">
                  <div className="text-sm font-bold text-blue-600">{post.seo_score}</div>
                  <div className="text-xs text-gray-600">SEO</div>
                </div>
              )}
              {post.legal_score && (
                <div className="text-center">
                  <div className="text-sm font-bold text-green-600">{post.legal_score}</div>
                  <div className="text-xs text-gray-600">Legal</div>
                </div>
              )}
            </div>
          )}

          <div className="flex gap-2">
            {isCaseStudy && (post.status === 'initial' || post.status === 'hospital_processing') && (
              <Link href={`/client/posts/${post.post_id}/materials`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
                  {getActionText(post)}
                </Button>
              </Link>
            )}

            {isCaseStudy && post.status === 'client_review' && (
              <Link href={`/client/posts/${post.post_id}/review`}>
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium">
                  {getActionText(post)}
                </Button>
              </Link>
            )}

            <Link href={`/client/posts/${post.post_id}`}>
              <Button variant="outline" className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-3 py-2 rounded-xl text-sm">
                <ChevronRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  };

  // 탭별 필터링된 포스트들
  const getFilteredPosts = () => {
    switch (activeTab) {
      case 'all':
        return posts;
      case 'pending_materials':
        return posts.filter(p => ['initial', 'hospital_processing'].includes(p.status));
      case 'ai_processing':
        return posts.filter(p => ['material_completed', 'agent_processing', 'generation_completed', 'admin_review'].includes(p.status));
      case 'awaiting_review':
        return posts.filter(p => p.status === 'client_review');
      case 'approved':
        return posts.filter(p => ['client_approved', 'approved', 'publish_scheduled', 'published'].includes(p.status));
      default:
        return posts;
    }
  };

  const filteredPosts = getFilteredPosts();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium text-gray-700">포스트 및 캠페인 데이터 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 */}
      <div className="bg-white rounded-3xl mx-6 mt-6 p-8 shadow-lg">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-base font-bold text-gray-800 mb-2">포스트 관리</h1>
            <p className="text-sm text-gray-600">콘텐츠 생성 및 관리</p>
          </div>
          <Link href="/client/posts/create">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2">
              <Plus className="w-4 h-4" />
              새 포스트
            </Button>
          </Link>
        </div>
      </div>

      <div className="mx-6 mt-6">
        {/* 캠페인 필터 */}
        {campaigns.length > 0 && (
          <div className="bg-white rounded-3xl p-6 shadow-lg mb-6">
            <div className="flex items-center gap-4">
              <label className="text-sm font-bold text-gray-700">캠페인 필터:</label>
              <select
                value={selectedCampaignId || ''}
                onChange={(e) => setSelectedCampaignId(e.target.value ? Number(e.target.value) : null)}
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm font-medium focus:border-blue-500 focus:ring-0 bg-white"
              >
                <option value="">전체 캠페인</option>
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id}>
                    {campaign.name}
                  </option>
                ))}
              </select>
              <Button
                onClick={async () => {
                  setLoading(true);
                  try {
                    const activeCampaigns = await loadCampaigns();
                    if (activeCampaigns.length > 0) {
                      await loadPosts(selectedCampaignId || activeCampaigns[0].id);
                    }
                  } catch (error) {
                    console.error('새로고침 실패:', error);
                  } finally {
                    setLoading(false);
                  }
                }}
                variant="outline"
                className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-3 rounded-2xl"
              >
                새로고침
              </Button>
            </div>
          </div>
        )}

        {/* 상태 탭 */}
        <div className="bg-white rounded-3xl p-8 shadow-xl mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { key: 'all', label: '전체', count: tabCounts.all, icon: FileText, color: 'text-gray-600' },
              { key: 'pending_materials', label: '자료 제공 대기', count: tabCounts.pending_materials, icon: AlertTriangle, color: 'text-red-600' },
              { key: 'ai_processing', label: 'AI 콘텐츠 생성 중', count: tabCounts.ai_processing, icon: Clock, color: 'text-blue-600' },
              { key: 'awaiting_review', label: '콘텐츠 검토 필요', count: tabCounts.awaiting_review, icon: CheckCircle, color: 'text-yellow-600' },
              { key: 'approved', label: '승인됨', count: tabCounts.approved, icon: CheckCircle, color: 'text-green-600' }
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`
                    flex items-center gap-3 px-6 py-4 rounded-2xl border-2 transition-all duration-200 font-medium
                    ${isActive
                      ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-lg'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:shadow-md'
                    }
                  `}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-blue-600' : tab.color}`} />
                  <span className="text-sm">{tab.label}</span>
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${isActive ? 'bg-blue-200 text-blue-800' : 'bg-gray-100 text-gray-600'}
                  `}>
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 포스트 그리드 */}
        {filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => renderPostCard(post))}
          </div>
        ) : campaigns.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-base font-bold text-gray-700 mb-2">활성 캠페인이 없습니다</h3>
            <p className="text-sm text-gray-600 mb-6">
              현재 진행 중인(active 이상 상태) 캠페인이 없습니다.
              관리자에게 문의해주세요.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 shadow-lg text-center">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
            <h3 className="text-base font-bold text-gray-700 mb-2">포스트가 없습니다</h3>
            <p className="text-sm text-gray-600 mb-6">
              {selectedCampaignId
                ? `선택한 캠페인에 ${activeTab === 'all' ? '' : '해당 상태의 '}포스트가 없습니다.`
                : `현재 ${activeTab === 'all' ? '' : '해당 상태의 '}포스트가 없습니다.`
              }
            </p>
            {activeTab === 'all' && (
              <Link href="/client/posts/create">
                <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium">
                  첫 포스트 만들기
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}