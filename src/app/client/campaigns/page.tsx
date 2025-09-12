'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Campaign } from '@/types/common';

export default function ClientCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaignsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드 (현재 병원의 캠페인만)
        const campaignsData = await clientApi.getCampaigns();
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('클라이언트 캠페인 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignsData();
  }, []);

  const getProgressPercentage = (campaign: Campaign) => {
    return campaign.target_post_count > 0 
      ? (campaign.completed_post_count / campaign.target_post_count) * 100 
      : 0;
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'completed': return 'secondary';
      case 'aborted': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      'active': '진행 중',
      'paused': '일시 중단',
      'completed': '완료',
      'aborted': '중단',
    };
    return statusMap[status] || status;
  };

  const getDaysRemaining = (endDate: string) => {
    const today = new Date();
    const end = new Date(endDate);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">캠페인 현황</h1>
        <p className="text-gray-600">진행 중인 캠페인의 현황을 확인하세요</p>
      </div>

      {/* 캠페인 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => {
          const progress = getProgressPercentage(campaign);
          const daysRemaining = getDaysRemaining(campaign.end_date);

          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <CardTitle className="text-lg">{campaign.name}</CardTitle>
                  <Badge variant={getStatusVariant(campaign.status)}>
                    {getStatusText(campaign.status)}
                  </Badge>
                </div>
                {campaign.description && (
                  <p className="text-sm text-gray-600">{campaign.description}</p>
                )}
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 기간 정보 */}
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">시작일:</span>
                      <div className="font-medium">{formatDate(campaign.start_date)}</div>
                    </div>
                    <div>
                      <span className="text-gray-600">종료일:</span>
                      <div className="font-medium">{formatDate(campaign.end_date)}</div>
                    </div>
                  </div>

                  {/* 남은 기간 */}
                  {campaign.status === 'active' && (
                    <div className="text-center">
                      <div className={`text-lg font-bold ${daysRemaining > 30 ? 'text-green-600' : 
                                      daysRemaining > 7 ? 'text-orange-600' : 'text-red-600'}`}>
                        {daysRemaining > 0 ? `${daysRemaining}일 남음` : '기간 만료'}
                      </div>
                    </div>
                  )}

                  {/* 진행률 */}
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>진행률</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${
                          progress >= 100 ? 'bg-green-500' : 
                          progress >= 75 ? 'bg-blue-500' : 
                          progress >= 50 ? 'bg-yellow-500' : 'bg-gray-400'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      />
                    </div>
                  </div>

                  {/* 포스트 수 통계 */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <div className="text-lg font-semibold text-gray-700">
                        {campaign.target_post_count}
                      </div>
                      <div className="text-xs text-gray-500">목표</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-green-600">
                        {campaign.completed_post_count}
                      </div>
                      <div className="text-xs text-gray-500">완료</div>
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-blue-600">
                        {campaign.published_post_count}
                      </div>
                      <div className="text-xs text-gray-500">게시</div>
                    </div>
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline" asChild className="flex-1">
                      <Link href={`/client/campaigns/${campaign.id}`}>상세보기</Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/client/posts?campaign_id=${campaign.id}`}>포스트</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {campaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">진행 중인 캠페인이 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
