'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { formatDate, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Post, Hospital, Campaign } from '@/types/common';

// 글로벌 포스트 관리용 인터페이스
interface GlobalPost {
  id: number;
  post_id: string;
  title: string;
  status: string;
  post_type: string;
  hospital_id: number;
  hospital_name?: string;
  campaign_id?: number;
  campaign_name?: string;
  publish_date?: string;
  created_at: string;
  updated_at: string;
  is_campaign_post: boolean;
  content_length: number;
}

interface PostFilters {
  hospital_ids: string;
  statuses: string;
  post_types: string;
  campaign_ids: string;
  date_from: string;
  date_to: string;
  publish_from: string;
  publish_to: string;
  search: string;
}

interface GlobalPostsResponse {
  posts: GlobalPost[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  filters_applied: any;
}

interface BulkActionRequest {
  post_ids: string[];
  action: 'status_change' | 'priority_update' | 'campaign_assign';
  new_status?: string;
  priority?: number;
  campaign_id?: number;
  reason?: string;
}

export default function AdminPosts() {
  // 글로벌 포스트 관리용 상태
  const [globalPosts, setGlobalPosts] = useState<GlobalPostsResponse | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filters, setFilters] = useState<PostFilters>({
    hospital_ids: '',
    statuses: '',
    post_types: '',
    campaign_ids: '',
    date_from: '',
    date_to: '',
    publish_from: '',
    publish_to: '',
    search: '',
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  // 일괄 작업 관련
  const [selectedPosts, setSelectedPosts] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);

  const [loading, setLoading] = useState(true);

  // 글로벌 포스트 데이터 로드
  const loadGlobalPosts = async (page: number = 1) => {
    try {
      setLoading(true);

      // 글로벌 포스트 API 호출
      const queryParams: any = {
        page,
        page_size: pageSize,
      };

      // 필터 파라미터 추가
      if (filters.hospital_ids) queryParams.hospital_ids = filters.hospital_ids;
      if (filters.statuses) queryParams.statuses = filters.statuses;
      if (filters.post_types) queryParams.post_types = filters.post_types;
      if (filters.campaign_ids) queryParams.campaign_ids = filters.campaign_ids;
      if (filters.date_from) queryParams.date_from = filters.date_from;
      if (filters.date_to) queryParams.date_to = filters.date_to;
      if (filters.publish_from) queryParams.publish_from = filters.publish_from;
      if (filters.publish_to) queryParams.publish_to = filters.publish_to;
      if (filters.search) queryParams.search = filters.search;

      const response = await adminApi.getGlobalPosts(queryParams);
      setGlobalPosts(response);

    } catch (error) {
      console.error('글로벌 포스트 데이터 로드 실패:', error);
      setGlobalPosts(null);
    } finally {
      setLoading(false);
    }
  };

  // 병원 및 캠페인 데이터 로드
  const loadReferenceData = async () => {
    try {
      const [hospitalsData, campaignsData] = await Promise.all([
        adminApi.getHospitals(),
        adminApi.getCampaigns()
      ]);

      setHospitals(hospitalsData.hospitals || []);
      setCampaigns(campaignsData || []);
    } catch (error) {
      console.error('참조 데이터 로드 실패:', error);
    }
  };

  useEffect(() => {
    const initializeData = async () => {
      await Promise.all([
        loadReferenceData(),
        loadGlobalPosts(1)
      ]);
    };

    initializeData();
  }, []);

  // 필터 변경 핸들러
  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 필터 적용 및 데이터 리로드
  const applyFilters = () => {
    loadGlobalPosts(1);
  };

  // 필터 초기화
  const resetFilters = () => {
    setFilters({
      hospital_ids: '',
      statuses: '',
      post_types: '',
      campaign_ids: '',
      date_from: '',
      date_to: '',
      publish_from: '',
      publish_to: '',
      search: '',
    });
    setCurrentPage(1);
    loadGlobalPosts(1);
  };

  // 일괄 작업 핸들러
  const handleBulkAction = async (action: BulkActionRequest['action'], value?: any) => {
    if (selectedPosts.length === 0) {
      alert('포스트를 선택해주세요.');
      return;
    }

    try {
      setBulkActionLoading(true);

      const request: BulkActionRequest = {
        post_ids: selectedPosts,
        action,
      };

      // 액션별 추가 파라미터 설정
      if (action === 'status_change' && value) {
        request.new_status = value;
        request.reason = '어드민 일괄 상태 변경';
      } else if (action === 'campaign_assign' && value) {
        request.campaign_id = value;
      } else if (action === 'priority_update' && value) {
        request.priority = value;
      }

      const result = await adminApi.bulkUpdatePosts(request);

      if (result.success) {
        alert(result.message);
        setSelectedPosts([]); // 선택 초기화
        loadGlobalPosts(currentPage); // 데이터 리프레시
      } else {
        alert(`일괄 작업 실패: ${result.message}`);
      }

    } catch (error: any) {
      console.error('일괄 작업 실패:', error);
      alert(`일괄 작업 실패: ${error.response?.data?.detail || error.message}`);
    } finally {
      setBulkActionLoading(false);
    }
  };

  // 개별 포스트 선택/해제
  const togglePostSelection = (postId: string) => {
    setSelectedPosts(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    if (!globalPosts) return;

    const allPostIds = globalPosts.posts.map(post => post.post_id);
    const allSelected = allPostIds.every(id => selectedPosts.includes(id));

    if (allSelected) {
      setSelectedPosts([]);
    } else {
      setSelectedPosts(allPostIds);
    }
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
          <h1 className="text-2xl font-bold text-gray-900">글로벌 포스트 관리</h1>
          <p className="text-gray-600">모든 병원의 모든 포스트를 통합 관리하세요</p>
        </div>
        <div className="flex space-x-2">
          <Button asChild>
            <Link href="/admin/posts/create">새 포스트 생성</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin/campaigns/create">새 캠페인 생성</Link>
          </Button>
        </div>
      </div>

      {/* 통계 요약 */}
      {globalPosts && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{globalPosts.total}</div>
              <div className="text-sm text-gray-600">총 포스트</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">
                {globalPosts.posts.filter(p => p.status === 'published').length}
              </div>
              <div className="text-sm text-gray-600">게시 완료</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">
                {globalPosts.posts.filter(p => p.status === 'admin_review').length}
              </div>
              <div className="text-sm text-gray-600">검토 대기</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">
                {globalPosts.posts.filter(p => p.status === 'failed').length}
              </div>
              <div className="text-sm text-gray-600">실패</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* 고급 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            검색 및 필터
            <div className="flex space-x-2">
              <Button size="sm" onClick={applyFilters} disabled={loading}>
                적용
              </Button>
              <Button size="sm" variant="outline" onClick={resetFilters}>
                초기화
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            {/* 병원 다중 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">병원</label>
              <select
                multiple
                value={filters.hospital_ids.split(',').filter(Boolean)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('hospital_ids', values.join(','));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {hospitals.map((hospital) => (
                  <option key={hospital.id} value={hospital.id.toString()}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            {/* 상태 다중 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                multiple
                value={filters.statuses.split(',').filter(Boolean)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('statuses', values.join(','));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="initial">초기</option>
                <option value="hospital_processing">병원 처리 중</option>
                <option value="hospital_completed">병원 완료</option>
                <option value="agent_processing">AI 처리 중</option>
                <option value="agent_completed">AI 완료</option>
                <option value="admin_review">어드민 검토</option>
                <option value="client_review">클라이언트 검토</option>
                <option value="published">게시 완료</option>
                <option value="failed">실패</option>
              </select>
            </div>

            {/* 포스트 타입 다중 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">포스트 타입</label>
              <select
                multiple
                value={filters.post_types.split(',').filter(Boolean)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('post_types', values.join(','));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="informational">정보성</option>
                <option value="case_study">치료사례</option>
              </select>
            </div>

            {/* 캠페인 다중 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">캠페인</label>
              <select
                multiple
                value={filters.campaign_ids.split(',').filter(Boolean)}
                onChange={(e) => {
                  const values = Array.from(e.target.selectedOptions, option => option.value);
                  handleFilterChange('campaign_ids', values.join(','));
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                {campaigns.map((campaign) => (
                  <option key={campaign.id} value={campaign.id.toString()}>
                    {campaign.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 날짜 범위 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">생성일 범위</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.date_from}
                  onChange={(e) => handleFilterChange('date_from', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={filters.date_to}
                  onChange={(e) => handleFilterChange('date_to', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* 게시일 범위 필터 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">게시일 범위</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  value={filters.publish_from}
                  onChange={(e) => handleFilterChange('publish_from', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
                <input
                  type="date"
                  value={filters.publish_to}
                  onChange={(e) => handleFilterChange('publish_to', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                />
              </div>
            </div>

            {/* 검색 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색</label>
              <Input
                placeholder="제목 또는 Post ID 검색"
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 일괄 작업 패널 */}
      {selectedPosts.length > 0 && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="font-medium text-blue-900">
                  {selectedPosts.length}개 포스트 선택됨
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelectedPosts([])}
                >
                  선택 해제
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {/* 상태 변경 드롭다운 */}
                <select
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('status_change', e.target.value);
                      e.target.value = ''; // 초기화
                    }
                  }}
                  disabled={bulkActionLoading}
                >
                  <option value="">상태 변경</option>
                  <option value="hospital_processing">병원 처리 중</option>
                  <option value="agent_processing">AI 처리 시작</option>
                  <option value="admin_review">어드민 검토</option>
                  <option value="client_review">클라이언트 검토</option>
                  <option value="published">게시 완료</option>
                </select>

                {/* 캠페인 할당 드롭다운 */}
                <select
                  className="px-3 py-1 border border-gray-300 rounded text-sm"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleBulkAction('campaign_assign', parseInt(e.target.value));
                      e.target.value = ''; // 초기화
                    }
                  }}
                  disabled={bulkActionLoading}
                >
                  <option value="">캠페인 할당</option>
                  {campaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </option>
                  ))}
                </select>

                {bulkActionLoading && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 포스트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>
              포스트 목록
              {globalPosts && (
                <span className="text-sm font-normal text-gray-500 ml-2">
                  ({globalPosts.total}개 중 {globalPosts.posts.length}개 표시)
                </span>
              )}
            </span>
            {globalPosts && globalPosts.total_pages > 1 && (
              <div className="flex items-center space-x-2 text-sm">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentPage > 1) {
                      setCurrentPage(currentPage - 1);
                      loadGlobalPosts(currentPage - 1);
                    }
                  }}
                  disabled={currentPage === 1}
                >
                  이전
                </Button>
                <span className="text-gray-600">
                  {currentPage} / {globalPosts.total_pages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (currentPage < globalPosts.total_pages) {
                      setCurrentPage(currentPage + 1);
                      loadGlobalPosts(currentPage + 1);
                    }
                  }}
                  disabled={currentPage === globalPosts.total_pages}
                >
                  다음
                </Button>
              </div>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="py-3 px-2 w-12">
                    <input
                      type="checkbox"
                      checked={
                        Boolean(globalPosts &&
                        globalPosts.posts.length > 0 &&
                        globalPosts.posts.every(post => selectedPosts.includes(post.post_id)))
                      }
                      onChange={toggleAllSelection}
                      className="rounded border-gray-300"
                    />
                  </th>
                  <th className="text-left py-3 px-2">Post ID</th>
                  <th className="text-left py-3 px-2">제목</th>
                  <th className="text-left py-3 px-2">병원</th>
                  <th className="text-left py-3 px-2">캠페인</th>
                  <th className="text-left py-3 px-2">상태</th>
                  <th className="text-left py-3 px-2">타입</th>
                  <th className="text-left py-3 px-2">게시 예정일</th>
                  <th className="text-left py-3 px-2">생성일</th>
                  <th className="text-left py-3 px-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {globalPosts?.posts.map((post) => (
                  <tr key={post.post_id} className="border-b hover:bg-gray-50">
                    <td className="py-3 px-2">
                      <input
                        type="checkbox"
                        checked={selectedPosts.includes(post.post_id)}
                        onChange={() => togglePostSelection(post.post_id)}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="py-3 px-2">
                      <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                        {post.post_id}
                      </code>
                    </td>
                    <td className="py-3 px-2">
                      <div className="max-w-xs">
                        <p className="font-medium text-gray-900">
                          {truncateText(post.title || '제목 미정', 40)}
                        </p>
                        {post.content_length > 0 && (
                          <p className="text-xs text-gray-500">
                            {post.content_length}자
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-2">
                      <span className="text-sm text-gray-600">
                        {post.hospital_name || '알 수 없음'}
                      </span>
                    </td>
                    <td className="py-3 px-2">
                      {post.campaign_name ? (
                        <Badge variant="secondary">
                          {truncateText(post.campaign_name, 20)}
                        </Badge>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <Badge
                        variant={
                          post.status === 'published' ? 'default' :
                          post.status === 'failed' ? 'destructive' :
                          post.status.includes('processing') ? 'secondary' :
                          'outline'
                        }
                      >
                        {post.status === 'initial' ? '초기' :
                         post.status === 'hospital_processing' ? '병원 처리 중' :
                         post.status === 'hospital_completed' ? '병원 완료' :
                         post.status === 'agent_processing' ? 'AI 처리 중' :
                         post.status === 'agent_completed' ? 'AI 완료' :
                         post.status === 'admin_review' ? '어드민 검토' :
                         post.status === 'client_review' ? '클라이언트 검토' :
                         post.status === 'published' ? '게시 완료' :
                         post.status === 'failed' ? '실패' :
                         post.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-2">
                      <Badge variant="outline">
                        {post.post_type === 'informational' ? '정보성' : '치료사례'}
                      </Badge>
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {post.publish_date ? formatDate(post.publish_date) : '-'}
                    </td>
                    <td className="py-3 px-2 text-sm text-gray-600">
                      {formatDate(post.created_at)}
                    </td>
                    <td className="py-3 px-2">
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline" asChild>
                          <Link href={`/admin/posts/${post.post_id}`}>상세</Link>
                        </Button>
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/admin/posts/${post.post_id}/pipeline`}>파이프라인</Link>
                        </Button>
                        {post.status === 'admin_review' && (
                          <Button size="sm" variant="primary" asChild>
                            <Link href={`/admin/posts/${post.post_id}/review`}>검토</Link>
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {globalPosts && globalPosts.posts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500">조건에 맞는 포스트가 없습니다.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
