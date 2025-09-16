'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Tabs } from '@/components/shared/Tabs';
import type { Post as BasePost } from '@/types/common';

interface Post extends BasePost {
  type?: string;
  medical_service?: {
    category: string;
    treatment: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
  publish_date?: string;
  seo_score?: number;
  legal_score?: number;
}

export default function ClientPostsPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(searchParams.get('status') || 'all');

  useEffect(() => {
    loadPosts();
  }, [activeTab]);

  const loadPosts = async () => {
    try {
      setLoading(true);
      const params = activeTab !== 'all' ? { status: activeTab } : {};
      const data = await clientApi.getPosts(params);
      setPosts(data as Post[]);
    } catch (error) {
      console.error('Error loading posts:', error);
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

  const getActionButton = (post: Post) => {
    switch (post.status) {
      case 'initial':
        return (
          <Link href={`/client/materials/${post.post_id}`}>
            <Button size="sm">자료 제공</Button>
          </Link>
        );
      case 'client_review':
        return (
          <Link href={`/client/posts/${post.post_id}/review`}>
            <Button size="sm">검토하기</Button>
          </Link>
        );
      default:
        return (
          <Link href={`/client/posts/${post.post_id}`}>
            <Button size="sm" variant="secondary">상세보기</Button>
          </Link>
        );
    }
  };

  const tabCounts = {
    all: posts.length,
    initial: posts.filter(p => p.status === 'initial').length,
    processing: posts.filter(p => ['agent_processing', 'hospital_completed'].includes(p.status)).length,
    review: posts.filter(p => p.status === 'client_review').length,
    completed: posts.filter(p => ['client_approved', 'published'].includes(p.status)).length
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
          <h1 className="text-3xl font-bold">포스트 관리</h1>
          <p className="text-gray-600 mt-2">콘텐츠 생성 및 관리</p>
        </div>
        <Link href="/client/posts/create">
          <Button>새 포스트 생성</Button>
        </Link>
      </div>

      {/* Status Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: '전체', count: tabCounts.all },
              { key: 'initial', label: '자료 대기', count: tabCounts.initial },
              { key: 'processing', label: '처리 중', count: tabCounts.processing },
              { key: 'review', label: '검토 필요', count: tabCounts.review },
              { key: 'completed', label: '완료', count: tabCounts.completed }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`
                  whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm
                  ${activeTab === tab.key 
                    ? 'border-blue-500 text-blue-600' 
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }
                `}
              >
                {tab.label}
                {tab.count > 0 && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts
          .filter(post => {
            if (activeTab === 'all') return true;
            if (activeTab === 'initial') return post.status === 'initial';
            if (activeTab === 'processing') return ['agent_processing', 'hospital_completed'].includes(post.status);
            if (activeTab === 'review') return post.status === 'client_review';
            if (activeTab === 'completed') return ['client_approved', 'published'].includes(post.status);
            return true;
          })
          .map((post) => (
            <Card key={post.id} className="p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-lg">
                    {post.title || `포스트 ${post.post_id}`}
                  </h3>
                  <p className="text-sm text-gray-600">ID: {post.post_id}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(post.status)}`}>
                  {getStatusText(post.status)}
                </span>
              </div>

              {post.medical_service && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    {post.medical_service.category} - {post.medical_service.treatment}
                  </p>
                </div>
              )}

              {post.campaign && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">
                    캠페인: {post.campaign.name}
                  </p>
                </div>
              )}

              <div className="flex justify-between items-center text-sm text-gray-600 mb-4">
                <span>생성일: {new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                {post.publish_date && (
                  <span>게시 예정: {new Date(post.publish_date).toLocaleDateString('ko-KR')}</span>
                )}
              </div>

              {(post.seo_score || post.legal_score) && (
                <div className="flex gap-4 mb-4">
                  {post.seo_score && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-blue-600">{post.seo_score}</div>
                      <div className="text-xs text-gray-600">SEO 점수</div>
                    </div>
                  )}
                  {post.legal_score && (
                    <div className="text-center">
                      <div className="text-lg font-semibold text-green-600">{post.legal_score}</div>
                      <div className="text-xs text-gray-600">Legal 점수</div>
                    </div>
                  )}
                </div>
              )}

              <div className="flex gap-2">
                {getActionButton(post)}
              </div>
            </Card>
          ))}
      </div>

      {posts.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">포스트가 없습니다</p>
        </div>
      )}
    </div>
  );
}