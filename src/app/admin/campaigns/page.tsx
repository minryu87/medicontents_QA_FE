'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Campaign, Hospital } from '@/types/common';

interface CampaignFilters {
  status: string;
  hospital: string;
  search: string;
}

export default function AdminCampaigns() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filters, setFilters] = useState<CampaignFilters>({
    status: '',
    hospital: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaignsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [campaignsData, hospitalsData] = await Promise.all([
          adminApi.getCampaigns(),
          adminApi.getHospitals()
        ]);

        setCampaigns(campaignsData);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('캠페인 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setCampaigns([]);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaignsData();
  }, []);

  const filteredCampaigns = campaigns.filter((campaign) => {
    if (filters.status && campaign.status !== filters.status) return false;
    if (filters.hospital && campaign.hospital_id.toString() !== filters.hospital) return false;
    if (filters.search && !campaign.name.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (key: keyof CampaignFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">캠페인 관리</h1>
          <p className="text-gray-600">캠페인을 생성하고 진행 상황을 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/admin/campaigns/create">새 캠페인 생성</Link>
        </Button>
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체</option>
                <option value="active">진행 중</option>
                <option value="paused">일시 중단</option>
                <option value="completed">완료</option>
                <option value="aborted">중단</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">병원</label>
              <select
                value={filters.hospital}
                onChange={(e) => handleFilterChange('hospital', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체</option>
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id.toString()}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <Input
                placeholder="캠페인명 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 캠페인 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCampaigns.map((campaign) => {
          const hospital = hospitals.find(h => h.id === campaign.hospital_id);
          const progress = getProgressPercentage(campaign);

          return (
            <Card key={campaign.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
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
                  {/* 병원 정보 */}
                  <div>
                    <span className="text-sm text-gray-600">병원:</span>
                    <p className="font-medium">{hospital?.name || '알 수 없음'}</p>
                  </div>

                  {/* 기간 */}
                  <div>
                    <span className="text-sm text-gray-600">기간:</span>
                    <p className="font-medium">
                      {formatDate(campaign.start_date)} ~ {formatDate(campaign.end_date)}
                    </p>
                  </div>

                  {/* 진행률 */}
                  <div>
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

                  {/* 포스트 수 */}
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
                      <Link href={`/admin/campaigns/${campaign.id}`}>상세보기</Link>
                    </Button>
                    <Button size="sm" variant="ghost" asChild>
                      <Link href={`/admin/campaigns/${campaign.id}/edit`}>수정</Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredCampaigns.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 캠페인이 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
