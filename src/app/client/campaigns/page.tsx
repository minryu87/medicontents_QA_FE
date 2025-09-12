'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { clientApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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
  progress: number;
  medical_service?: {
    category: string;
    treatment: string;
  };
}

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaigns();
  }, []);

  const loadCampaigns = async () => {
    try {
      const data = await clientApi.getCampaigns();
      setCampaigns(data);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'active': 'bg-green-100 text-green-800',
      'paused': 'bg-yellow-100 text-yellow-800',
      'completed': 'bg-blue-100 text-blue-800',
      'aborted': 'bg-red-100 text-red-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'active': '진행 중',
      'paused': '일시 정지',
      'completed': '완료',
      'aborted': '중단됨'
    };
    return texts[status] || status;
  };

  const calculateProgress = (campaign: Campaign) => {
    return Math.round((campaign.completed_post_count / Math.max(campaign.target_post_count, 1)) * 100);
  };

  const getDaysRemaining = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
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
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">캠페인 현황</h1>
          <p className="text-gray-600 mt-2">진행 중인 콘텐츠 캠페인을 확인하세요</p>
        </div>
        <Link href="/client/posts">
          <Button variant="secondary">포스트 관리로</Button>
        </Link>
      </div>

      {campaigns.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">진행 중인 캠페인이 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map((campaign) => {
            const progress = calculateProgress(campaign);
            const daysRemaining = getDaysRemaining(campaign.end_date);

            return (
              <Card key={campaign.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold mb-1">{campaign.name}</h3>
                    {campaign.description && (
                      <p className="text-sm text-gray-600 line-clamp-2">{campaign.description}</p>
                    )}
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(campaign.status)}`}>
                    {getStatusText(campaign.status)}
                  </span>
                </div>

                {campaign.medical_service && (
                  <div className="mb-4">
                    <p className="text-sm text-gray-600">
                      {campaign.medical_service.category} - {campaign.medical_service.treatment}
                    </p>
                  </div>
                )}

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-2">
                    <span>진행률</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                  <div>
                    <div className="text-lg font-semibold text-blue-600">{campaign.target_post_count}</div>
                    <div className="text-xs text-gray-600">목표</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-green-600">{campaign.completed_post_count}</div>
                    <div className="text-xs text-gray-600">완료</div>
                  </div>
                  <div>
                    <div className="text-lg font-semibold text-purple-600">{campaign.published_post_count}</div>
                    <div className="text-xs text-gray-600">게시</div>
                  </div>
                </div>

                {/* Period */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm">
                    <span>기간</span>
                    <span className={daysRemaining < 0 ? 'text-red-600 font-medium' : daysRemaining <= 7 ? 'text-orange-600 font-medium' : ''}>
                      {daysRemaining > 0 ? `${daysRemaining}일 남음` : daysRemaining === 0 ? '오늘 종료' : `${Math.abs(daysRemaining)}일 지남`}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    {new Date(campaign.start_date).toLocaleDateString('ko-KR')} ~ {new Date(campaign.end_date).toLocaleDateString('ko-KR')}
                  </p>
                </div>

                {/* Action */}
                <Link href={`/client/campaigns/${campaign.id}`}>
                  <Button className="w-full">상세보기</Button>
                </Link>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}