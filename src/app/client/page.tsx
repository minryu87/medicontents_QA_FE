'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface DashboardStats {
  totalPosts: number;
  pendingPosts: number;
  completedPosts: number;
  averageSeoScore: number;
  averageLegalScore: number;
}

interface RecentPost {
  id: string;
  post_id: string;
  title: string;
  status: string;
  created_at: string;
}

interface ActiveCampaign {
  id: number;
  name: string;
  progress: number;
  end_date: string;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentPosts, setRecentPosts] = useState<RecentPost[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<ActiveCampaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const [statsData, postsData, campaignsData] = await Promise.all([
        clientApi.getDashboardStats(),
        clientApi.getRecentPosts(),
        clientApi.getActiveCampaigns()
      ]);
      
      setStats(statsData);
      setRecentPosts(postsData);
      setActiveCampaigns(campaignsData);
    } catch (error) {
      console.error('Error loading dashboard:', error);
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
      'published': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'initial': '자료 대기',
      'hospital_processing': '자료 작성 중',
      'agent_processing': 'AI 처리 중',
      'client_review': '검토 필요',
      'published': '게시됨'
    };
    return texts[status] || status;
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
        <h1 className="text-3xl font-bold">대시보드</h1>
        <p className="text-gray-600 mt-2">콘텐츠 생성 현황을 한눈에 확인하세요</p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">전체 포스트</h3>
            <p className="text-3xl font-bold">{stats.totalPosts}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">대기 중</h3>
            <p className="text-3xl font-bold text-yellow-600">{stats.pendingPosts}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">완료</h3>
            <p className="text-3xl font-bold text-green-600">{stats.completedPosts}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 SEO 점수</h3>
            <p className="text-3xl font-bold text-blue-600">{stats.averageSeoScore}</p>
          </Card>
          <Card className="p-6">
            <h3 className="text-sm font-medium text-gray-600 mb-2">평균 Legal 점수</h3>
            <p className="text-3xl font-bold text-purple-600">{stats.averageLegalScore}</p>
          </Card>
        </div>
      )}

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">빠른 작업</h2>
        <div className="flex gap-4">
          <Link href="/client/posts/create">
            <Button>새 포스트 생성</Button>
          </Link>
          <Link href="/client/posts?status=client_review">
            <Button variant="secondary">검토 대기 포스트</Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Posts */}
        <div>
          <h2 className="text-xl font-semibold mb-4">최근 포스트</h2>
          <div className="space-y-4">
            {recentPosts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{post.title || `포스트 ${post.post_id}`}</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                      {getStatusText(post.status)}
                    </span>
                    <Link href={`/client/posts/${post.post_id}`}>
                      <Button size="sm" variant="secondary">보기</Button>
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
            {recentPosts.length === 0 && (
              <p className="text-gray-500 text-center py-8">최근 포스트가 없습니다</p>
            )}
          </div>
        </div>

        {/* Active Campaigns */}
        <div>
          <h2 className="text-xl font-semibold mb-4">진행 중인 캠페인</h2>
          <div className="space-y-4">
            {activeCampaigns.map((campaign) => (
              <Card key={campaign.id} className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{campaign.name}</h3>
                  <span className="text-sm text-gray-600">
                    ~{new Date(campaign.end_date).toLocaleDateString('ko-KR')}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all"
                    style={{ width: `${campaign.progress}%` }}
                  />
                </div>
                <div className="flex justify-between text-sm text-gray-600">
                  <span>진행률</span>
                  <span>{campaign.progress}%</span>
                </div>
              </Card>
            ))}
            {activeCampaigns.length === 0 && (
              <p className="text-gray-500 text-center py-8">진행 중인 캠페인이 없습니다</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}