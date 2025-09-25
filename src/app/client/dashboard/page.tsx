'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { Bell, FileText, Users, CheckCircle, AlertTriangle, ChevronDown, ChevronRight } from 'lucide-react';
import { clientApi } from '@/services/api';

// 포스트 상태 범주 인터페이스 (백엔드 API 구조에 맞춤)
interface PostCategory {
  category_name: string;
  description: string;
  count: number;
  action_required: boolean;
  action_type: string | null;
  posts: Array<{
    id: number;
    post_id: string;
    title: string;
    status: string;
    status_category: {
      category: string;
      category_name: string;
      description: string;
      action_required: boolean;
      action_type: string | null;
    };
    created_at: string;
    updated_at: string;
  }>;
}

// 캠페인 인터페이스
interface Campaign {
  id: number;
  name: string;
  description: string;
  start_date: string | null;
  end_date: string | null;
  target_post_count: number;
  status: string;
  created_at: string;
  total_posts: number;
  category_counts: Record<string, number>;
}

// 캠페인별 포스트 현황 인터페이스 (백엔드 API 구조에 맞춤)
interface CampaignWithPosts {
  campaign: Campaign;
  posts_by_category: Record<string, PostCategory>;
}

export default function ClientDashboard() {
  const [campaigns, setCampaigns] = useState<CampaignWithPosts[]>([]);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCampaignsData();
  }, []);

  const loadCampaignsData = async () => {
    try {
      setLoading(true);
      console.log('캠페인 데이터 로드 시작');

      const campaignsData = await clientApi.getCampaignsWithPosts();
      console.log('캠페인 데이터:', campaignsData);

      setCampaigns(campaignsData);

      // 첫 번째 캠페인을 기본 선택
      if (campaignsData.length > 0) {
        setSelectedCampaignId(campaignsData[0].campaign.id);
      }
    } catch (error) {
      console.error('캠페인 데이터 로드 실패:', error);
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  // 상태 범주별 색상 (메인 컬러 #4A7C9E + 투명도 활용)
  const getCategoryColor = (category: string) => {
    const colors = {
      client_material_needed: 'bg-red-50 border-red-200 text-red-700',  // 자료 제공 필요
      client_processing: 'bg-orange-50 border-orange-200 text-orange-700',  // 자료 처리 중
      admin_processing: 'bg-blue-50 border-blue-200 text-blue-700',  // 어드민 작업 중
      client_review_needed: 'bg-yellow-50 border-yellow-200 text-yellow-700',  // 검토 필요
      admin_rework: 'bg-purple-50 border-purple-200 text-purple-700',  // 재작업 중
      client_approved: 'bg-green-50 border-green-200 text-green-700',  // 승인 완료
      publish_scheduled: 'bg-teal-50 border-teal-200 text-teal-700',  // 게시 예약
      published: 'bg-indigo-50 border-indigo-200 text-indigo-700',  // 게시 완료
      monitoring: 'bg-cyan-50 border-cyan-200 text-cyan-700',  // 모니터링
      other: 'bg-gray-50 border-gray-200 text-gray-700'  // 기타
    };
    return colors[category as keyof typeof colors] || colors.other;
  };

  // 액션 타입별 버튼 텍스트
  const getActionText = (actionType: string | null) => {
    const actions = {
      provide_material: '자료 제공하기',
      review_content: '콘텐츠 검토하기'
    };
    return actions[actionType as keyof typeof actions] || '확인하기';
  };

  // 선택된 캠페인 데이터
  const selectedCampaign = campaigns.find(c => c.campaign.id === selectedCampaignId);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium text-gray-700">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  if (campaigns.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center max-w-md">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-6" />
          <h2 className="text-base font-bold text-gray-700 mb-2">캠페인이 없습니다</h2>
          <p className="text-sm text-gray-600 mb-6">현재 진행 중인 캠페인이 없습니다.</p>
          <Button
            onClick={loadCampaignsData}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium"
          >
            새로고침
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-6 mt-6 space-y-6">
        {/* 캠페인 선택 영역 - Style 2: 강조 컨테이너 */}
        <div className="bg-white rounded-3xl p-8 shadow-xl">
          <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            캠페인 선택
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaignWithPosts) => {
              const campaign = campaignWithPosts.campaign;
              const isSelected = campaign.id === selectedCampaignId;

              return (
                <div
                  key={campaign.id}
                  onClick={() => setSelectedCampaignId(campaign.id)}
                  className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
                    isSelected
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-gray-800 mb-1">{campaign.name}</h3>
                      <p className="text-gray-600 text-xs">{campaign.description}</p>
                    </div>
                    {isSelected && <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0" />}
                  </div>

                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">총 포스트</span>
                    <span className="font-bold text-gray-800">{campaign.total_posts}개</span>
                  </div>

                  {campaign.start_date && (
                    <div className="flex items-center justify-between text-sm mt-2">
                      <span className="text-gray-500">시작일</span>
                      <span className="text-gray-700">
                        {new Date(campaign.start_date).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 선택된 캠페인의 포스트 상태 영역 */}
        {selectedCampaign && (
          <div className="space-y-6">
            {/* 캠페인 요약 - Style 3: Primary Action 포함된 영역 */}
            <div className="bg-white rounded-3xl p-8 shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-base font-bold text-gray-800">{selectedCampaign.campaign.name}</h2>
                  <p className="text-sm text-gray-600 mt-1">{selectedCampaign.campaign.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-base font-bold text-blue-600">{selectedCampaign.campaign.total_posts}</div>
                  <div className="text-xs text-gray-600">총 포스트</div>
                </div>
              </div>

              {/* 상태 범주별 요약 */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(selectedCampaign.posts_by_category).map(([category, categoryData]) => (
                  <div
                    key={category}
                    className={`rounded-2xl p-6 border-2 ${getCategoryColor(category)}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-bold text-sm">{categoryData.category_name}</h3>
                      <span className="text-base font-bold">{categoryData.count}</span>
                    </div>
                    <p className="text-xs opacity-80 mb-4">{categoryData.description}</p>

                    {/* 액션 버튼 - Primary Action은 최소한으로 */}
                    {categoryData.action_required && categoryData.count > 0 && (
                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-2xl py-2 font-medium"
                      >
                        {getActionText(categoryData.action_type)}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 상세 포스트 목록 */}
            {Object.entries(selectedCampaign.posts_by_category).map(([category, categoryData]) => (
              categoryData.count > 0 && (
                <div key={category} className="bg-white rounded-3xl p-8 shadow-lg">
                  <h3 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-3">
                    <div className={`w-4 h-4 rounded-full ${getCategoryColor(category).includes('red') ? 'bg-red-400' :
                      getCategoryColor(category).includes('orange') ? 'bg-orange-400' :
                      getCategoryColor(category).includes('blue') ? 'bg-blue-400' :
                      getCategoryColor(category).includes('yellow') ? 'bg-yellow-400' :
                      getCategoryColor(category).includes('green') ? 'bg-green-400' : 'bg-gray-400'}`} />
                    {categoryData.category_name}
                    <span className="text-sm font-normal text-gray-600">({categoryData.count}개)</span>
                  </h3>

                  <div className="space-y-4">
                    {categoryData.posts.slice(0, 5).map((post) => (
                      <div key={post.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-2xl">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-800 text-sm mb-1">{post.title}</h4>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>포스트 ID: {post.post_id}</span>
                            <span>생성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                          </div>
                        </div>

                        {categoryData.action_required && (
                          <Button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-2xl font-medium">
                            {getActionText(categoryData.action_type)}
                          </Button>
                        )}
                      </div>
                    ))}

                    {categoryData.posts.length > 5 && (
                      <div className="text-center pt-4">
                        <Button
                          variant="outline"
                          className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-6 py-2 rounded-2xl"
                        >
                          더 보기 ({categoryData.posts.length - 5}개)
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
