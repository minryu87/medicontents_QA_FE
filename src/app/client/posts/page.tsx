'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate, getStatusText, getStatusColor, truncateText } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Post } from '@/types/common';

interface PostFilters {
  status: string;
  type: string;
  search: string;
}

export default function ClientPosts() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [filters, setFilters] = useState<PostFilters>({
    status: '',
    type: '',
    search: '',
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const postsData = await clientApi.getPosts();
        setPosts(postsData);
      } catch (error) {
        console.error('클라이언트 포스트 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    loadPostsData();
  }, []);

  const filteredPosts = posts.filter((post) => {
    if (filters.status && post.status !== filters.status) return false;
    if (filters.type && post.post_type !== filters.type) return false;
    if (filters.search && !post.title?.toLowerCase().includes(filters.search.toLowerCase()) && 
        !post.post_id.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleFilterChange = (key: keyof PostFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const getActionButton = (post: Post) => {
    switch (post.status) {
      case 'initial':
      case 'hospital_processing':
        return (
          <Button size="sm" variant="primary" asChild>
            <Link href={`/client/materials/${post.post_id}`}>자료 제공</Link>
          </Button>
        );
      case 'client_review':
        return (
          <Button size="sm" variant="primary" asChild>
            <Link href={`/client/posts/${post.post_id}/review`}>검토하기</Link>
          </Button>
        );
      default:
        return (
          <Button size="sm" variant="outline" asChild>
            <Link href={`/client/posts/${post.post_id}`}>상세보기</Link>
          </Button>
        );
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
          <h1 className="text-2xl font-bold text-gray-900">포스트 관리</h1>
          <p className="text-gray-600">포스트 현황을 확인하고 관리하세요</p>
        </div>
        <Button asChild>
          <Link href="/client/posts/create">새 포스트 요청</Link>
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
                <option value="initial">초기</option>
                <option value="hospital_processing">자료 제공 중</option>
                <option value="agent_processing">AI 처리 중</option>
                <option value="agent_completed">AI 완료</option>
                <option value="client_review">검토 대기</option>
                <option value="client_approved">승인 완료</option>
                <option value="published">게시 완료</option>
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
                <option value="informational">정보성 포스팅</option>
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

      {/* 포스트 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPosts.map((post) => (
          <Card key={post.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {truncateText(post.title || '제목 미정', 30)}
                </CardTitle>
                <Badge className={getStatusColor(post.status)}>
                  {getStatusText(post.status)}
                </Badge>
              </div>
              <p className="text-sm text-gray-600">Post ID: {post.post_id}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">타입:</span>
                  <span>{post.post_type === 'informational' ? '정보성' : '사례 연구'}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">생성일:</span>
                  <span>{formatDate(post.created_at)}</span>
                </div>
                {post.publish_date && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">게시일:</span>
                    <span>{formatDate(post.publish_date)}</span>
                  </div>
                )}
                
                <div className="flex space-x-2 pt-2">
                  {getActionButton(post)}
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/client/posts/${post.post_id}`}>상세</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {filteredPosts.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">조건에 맞는 포스트가 없습니다.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
