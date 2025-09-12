'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate, getStatusText, getStatusColor, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Post, Hospital } from '@/types/common';

interface PostFilters {
  status: string;
  hospital: string;
  type: string;
  search: string;
}

export default function AdminPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [filters, setFilters] = useState<PostFilters>({
    status: '',
    hospital: '',
    type: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [postsData, hospitalsData] = await Promise.all([
          adminApi.getPosts(),
          adminApi.getHospitals()
        ]);

        setPosts(postsData.posts || []);
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('포스트 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setPosts([]);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    loadPostsData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filters.status && post.status !== filters.status) return false;
    if (filters.hospital && post.hospital_id.toString() !== filters.hospital) return false;
    if (filters.type && post.post_type !== filters.type) return false;
    if (filters.search && !post.title?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !post.post_id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
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
          <h1 className="text-2xl font-bold text-gray-900">포스트 관리</h1>
          <p className="text-gray-600">모든 포스트를 관리하고 모니터링하세요</p>
        </div>
        <Button asChild>
          <Link href="/admin/posts/create">새 포스트 생성</Link>
        </Button>
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">상태</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체</option>
                <option value="initial">초기</option>
                <option value="agent_processing">에이전트 처리 중</option>
                <option value="agent_completed">에이전트 완료</option>
                <option value="admin_review">어드민 검토</option>
                <option value="client_review">클라이언트 검토</option>
                <option value="published">게시 완료</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">타입</label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="">전체</option>
                <option value="informational">정보성</option>
                <option value="case_study">사례 연구</option>
              </select>
            </div>
            
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

      {/* 포스트 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>포스트 목록 ({filteredPosts.length}개)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-2">Post ID</th>
                  <th className="text-left py-3 px-2">제목</th>
                  <th className="text-left py-3 px-2">병원</th>
                  <th className="text-left py-3 px-2">상태</th>
                  <th className="text-left py-3 px-2">타입</th>
                  <th className="text-left py-3 px-2">게시 예정일</th>
                  <th className="text-left py-3 px-2">생성일</th>
                  <th className="text-left py-3 px-2">작업</th>
                </tr>
              </thead>
              <tbody>
                {filteredPosts.map((post) => {
                  const hospital = hospitals.find(h => h.id === post.hospital_id);
                  
                  return (
                    <tr key={post.id} className="border-b hover:bg-gray-50">
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
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <span className="text-sm text-gray-600">
                          {hospital?.name || '알 수 없음'}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge className={getStatusColor(post.status)}>
                          {getStatusText(post.status)}
                        </Badge>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline">
                          {post.post_type === 'informational' ? '정보성' : '사례 연구'}
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
                            <Button size="sm" variant="primary">
                              검토
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            {filteredPosts.length === 0 && (
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
