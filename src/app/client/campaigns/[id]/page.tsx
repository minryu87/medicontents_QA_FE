'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { adminApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';

interface Campaign {
  id: number;
  name: string;
  description?: string;
  status: string;
  start_date: string;
  end_date: string;
  target_post_count: number;
  completed_post_count: number;
  published_post_count: number;
  medical_service?: {
    category: string;
    treatment: string;
  };
}

interface CampaignPost {
  post_id: string;
  title?: string;
  status: string;
  created_at: string;
  campaign_target_date?: string;
  seo_score?: number;
  legal_score?: number;
}

export default function CampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [posts, setPosts] = useState<CampaignPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadCampaignDetail(params.id as string);
    }
  }, [params.id]);

  const loadCampaignDetail = async (campaignId: string) => {
    try {
      const [campaignData, postsData] = await Promise.all([
        adminApi.getCampaign(parseInt(campaignId)),
        adminApi.getCampaignPosts(parseInt(campaignId))
      ]);

      setCampaign(campaignData);
      setPosts(postsData);
    } catch (error) {
      console.error('Error loading campaign detail:', error);
      router.push('/client/campaigns');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'initial': 'bg-gray-100 text-gray-800',
      'hospital_completed': 'bg-blue-100 text-blue-800',
      'agent_processing': 'bg-yellow-100 text-yellow-800',
      'agent_completed': 'bg-purple-100 text-purple-800',
      'client_review': 'bg-indigo-100 text-indigo-800',
      'client_approved': 'bg-teal-100 text-teal-800',
      'published': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'initial': '자료 대기',
      'hospital_completed': '자료 완료',
      'agent_processing': 'AI 처리 중',
      'agent_completed': 'AI 처리 완료',
      'client_review': '검토 필요',
      'client_approved': '승인됨',
      'published': '게시됨'
    };
    return texts[status] || status;
  };

  const calculateProgress = () => {
    if (!campaign) return 0;
    return Math.round((campaign.completed_post_count / Math.max(campaign.target_post_count, 1)) * 100);
  };

  const getDaysRemaining = () => {
    if (!campaign) return 0;
    const end = new Date(campaign.end_date);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusStats = () => {
    const stats = {
      initial: 0,
      processing: 0,
      review: 0,
      completed: 0
    };

    posts.forEach(post => {
      if (post.status === 'initial') stats.initial++;
      else if (['agent_processing', 'hospital_completed'].includes(post.status)) stats.processing++;
      else if (post.status === 'client_review') stats.review++;
      else if (['client_approved', 'published'].includes(post.status)) stats.completed++;
    });

    return stats;
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

  if (!campaign) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">캠페인을 찾을 수 없습니다</h2>
          <Link href="/client/campaigns">
            <Button>캠페인 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  const progress = calculateProgress();
  const daysRemaining = getDaysRemaining();
  const statusStats = getStatusStats();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">{campaign.name}</h1>
            {campaign.description && (
              <p className="text-gray-600 mt-2">{campaign.description}</p>
            )}
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${
            campaign.status === 'active' ? 'bg-green-100 text-green-800' :
            campaign.status === 'completed' ? 'bg-blue-100 text-blue-800' :
            'bg-gray-100 text-gray-800'
          }`}>
            {campaign.status === 'active' ? '진행 중' :
             campaign.status === 'completed' ? '완료' :
             campaign.status}
          </span>
        </div>

        {/* Campaign Info */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {campaign.medical_service && (
            <div>
              <p className="text-sm text-gray-600">진료 정보</p>
              <p className="font-medium">{campaign.medical_service.category}</p>
              <p className="text-sm text-gray-600">{campaign.medical_service.treatment}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">기간</p>
            <p className="font-medium">
              {new Date(campaign.start_date).toLocaleDateString('ko-KR')} ~
            </p>
            <p className="font-medium">
              {new Date(campaign.end_date).toLocaleDateString('ko-KR')}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">남은 기간</p>
            <p className={`font-medium ${
              daysRemaining < 0 ? 'text-red-600' :
              daysRemaining <= 7 ? 'text-orange-600' :
              'text-green-600'
            }`}>
              {daysRemaining > 0 ? `${daysRemaining}일` :
               daysRemaining === 0 ? '오늘 종료' :
               `${Math.abs(daysRemaining)}일 지남`}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">진행률</p>
            <p className="text-2xl font-bold text-blue-600">{progress}%</p>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Link href="/client/campaigns">
            <Button variant="secondary">목록으로</Button>
          </Link>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">총 포스트</h3>
          <p className="text-3xl font-bold">{posts.length}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">완료된 포스트</h3>
          <p className="text-3xl font-bold text-green-600">{campaign.completed_post_count}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">게시된 포스트</h3>
          <p className="text-3xl font-bold text-blue-600">{campaign.published_post_count}</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-600 mb-2">목표 포스트</h3>
          <p className="text-3xl font-bold text-gray-600">{campaign.target_post_count}</p>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">캠페인 진행률</h3>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-blue-600 h-4 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between text-sm text-gray-600">
          <span>0%</span>
          <span>{progress}% 완료</span>
          <span>100%</span>
        </div>
      </Card>

      {/* Status Breakdown */}
      <Card className="p-6 mb-8">
        <h3 className="text-lg font-semibold mb-4">포스트 상태별 현황</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">{statusStats.initial}</div>
            <div className="text-sm text-gray-600">자료 대기</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{statusStats.processing}</div>
            <div className="text-sm text-gray-600">처리 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">{statusStats.review}</div>
            <div className="text-sm text-gray-600">검토 필요</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{statusStats.completed}</div>
            <div className="text-sm text-gray-600">완료</div>
          </div>
        </div>
      </Card>

      {/* Posts List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">포스트 목록</h3>
        <div className="space-y-4">
          {posts.map((post) => (
            <div key={post.post_id} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h4 className="font-medium">
                    {post.title || `포스트 ${post.post_id}`}
                  </h4>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                    {getStatusText(post.status)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <span>생성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                  {post.campaign_target_date && (
                    <span>목표일: {new Date(post.campaign_target_date).toLocaleDateString('ko-KR')}</span>
                  )}
                  {(post.seo_score || post.legal_score) && (
                    <span>
                      점수: {post.seo_score && `SEO ${post.seo_score}`}
                      {post.seo_score && post.legal_score && ' / '}
                      {post.legal_score && `Legal ${post.legal_score}`}
                    </span>
                  )}
                </div>
              </div>
              <Link href={`/client/posts/${post.post_id}`}>
                <Button size="sm" variant="secondary">보기</Button>
              </Link>
            </div>
          ))}
          {posts.length === 0 && (
            <p className="text-gray-500 text-center py-8">포스트가 없습니다.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
