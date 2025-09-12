'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, getStatusText, getStatusColor } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Post, Campaign } from '@/types/common';

interface ClientStats {
  totalPosts: number;
  pendingPosts: number;
  completedPosts: number;
  publishedPosts: number;
  averageQualityScore: number;
  approvalRate: number;
}

export default function ClientDashboard() {
  const [stats, setStats] = useState<ClientStats>({
    totalPosts: 0,
    pendingPosts: 0,
    completedPosts: 0,
    publishedPosts: 0,
    averageQualityScore: 0,
    approvalRate: 0,
  });
  const [recentPosts, setRecentPosts] = useState<Post[]>([]);
  const [activeCampaigns, setActiveCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [
          dashboardStats,
          recentPostsData,
          activeCampaignsData
        ] = await Promise.all([
          clientApi.getDashboardStats(),
          clientApi.getRecentPosts(5),
          clientApi.getActiveCampaigns()
        ]);

        setStats(dashboardStats);
        setRecentPosts(recentPostsData);
        setActiveCampaigns(activeCampaignsData);
      } catch (error) {
        console.error('클라이언트 대시보드 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setStats({
          totalPosts: 0,
          pendingPosts: 0,
          completedPosts: 0,
          publishedPosts: 0,
          averageQualityScore: 0,
          approvalRate: 0,
        });
        setRecentPosts([]);
        setActiveCampaigns([]);
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
      {/* 환영 메시지 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">안녕하세요, 내이튼치과의원님!</h1>
        <p className="text-gray-600 mt-2">오늘도 좋은 콘텐츠로 고객을 만나보세요.</p>
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
            <CardTitle className="text-sm font-medium text-gray-600">진행 중</CardTitle>
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
            <CardTitle className="text-sm font-medium text-gray-600">게시됨</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.publishedPosts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">평균 품질</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.averageQualityScore.toFixed(1)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">승인률</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.approvalRate.toFixed(1)}%</div>
          </CardContent>
        </Card>
      </div>

      {/* 빠른 액션 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>빠른 액션</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button asChild>
              <Link href="/client/posts/create">새 포스트 생성</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/client/posts">포스트 목록 보기</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/client/campaigns">캠페인 현황</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

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
                <div key={post.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">
                      {post.title || '제목 미정'}
                    </h3>
                    <Badge className={getStatusColor(post.status)}>
                      {getStatusText(post.status)}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Post ID: {post.post_id}</p>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-gray-500">
                      생성일: {formatDate(post.created_at)}
                    </p>
                    <div className="flex space-x-2">
                      {post.status === 'client_review' && (
                        <Button size="sm" variant="primary" asChild>
                          <Link href={`/client/posts/${post.post_id}/review`}>검토하기</Link>
                        </Button>
                      )}
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/client/posts/${post.post_id}`}>상세보기</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 활성 캠페인 */}
        <Card>
          <CardHeader>
            <CardTitle>활성 캠페인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {activeCampaigns.map((campaign) => {
                const progress = campaign.target_post_count > 0 
                  ? (campaign.completed_post_count / campaign.target_post_count) * 100 
                  : 0;

                return (
                  <div key={campaign.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-gray-900">{campaign.name}</h3>
                      <Badge variant={campaign.status === 'active' ? 'success' : 'warning'}>
                        {campaign.status === 'active' ? '진행 중' : campaign.status}
                      </Badge>
                    </div>
                    
                    <div className="mb-3">
                      <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>진행률</span>
                        <span>{Math.round(progress)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-600">목표:</span>
                        <div className="font-medium">{campaign.target_post_count}개</div>
                      </div>
                      <div>
                        <span className="text-gray-600">완료:</span>
                        <div className="font-medium text-green-600">{campaign.completed_post_count}개</div>
                      </div>
                      <div>
                        <span className="text-gray-600">게시:</span>
                        <div className="font-medium text-blue-600">{campaign.published_post_count}개</div>
                      </div>
                    </div>
                    
                    <div className="mt-3 flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        기간: {formatDate(campaign.start_date)} ~ {formatDate(campaign.end_date)}
                      </p>
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/client/campaigns/${campaign.id}`}>상세보기</Link>
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
