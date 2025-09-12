'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { formatDate, formatDateTime, getStatusText, getStatusColor } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Post, PipelineResult } from '@/types/common';

export default function ClientPostDetail() {
  const params = useParams();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);
        const [postData, pipelineData] = await Promise.all([
          clientApi.getPost(postId),
          clientApi.getPipelineResult(postId).catch(() => null)
        ]);

        setPost(postData);
        setPipelineResult(pipelineData);
      } catch (error) {
        console.error('포스트 상세 데이터 로드 실패:', error);
        setPost(null);
        setPipelineResult(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

  const getActionButton = () => {
    if (!post) return null;

    switch (post.status) {
      case 'initial':
      case 'hospital_processing':
        return (
          <Button asChild>
            <Link href={`/client/materials/${post.post_id}`}>자료 제공하기</Link>
          </Button>
        );
      case 'client_review':
        return (
          <Button asChild>
            <Link href={`/client/posts/${post.post_id}/review`}>검토하기</Link>
          </Button>
        );
      case 'agent_completed':
        return (
          <Button variant="outline">
            검토 대기 중
          </Button>
        );
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">포스트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center space-x-2 mb-2">
          <h1 className="text-2xl font-bold text-gray-900">포스트 상세</h1>
          <Badge className={getStatusColor(post.status)}>
            {getStatusText(post.status)}
          </Badge>
        </div>
        <p className="text-gray-600">Post ID: {post.post_id}</p>
      </div>

      {/* 액션 버튼 */}
      <div className="mb-6">
        {getActionButton()}
      </div>

      {/* 포스트 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>포스트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">제목</label>
              <p className="mt-1 text-gray-900">{post.title || '제목 미정'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">포스트 타입</label>
              <p className="mt-1 text-gray-900">
                {post.post_type === 'informational' ? '정보성 포스팅' : '사례 연구'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">캠페인 포스트</label>
              <p className="mt-1 text-gray-900">{post.is_campaign_post ? '예' : '아니오'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">게시 예정일</label>
              <p className="mt-1 text-gray-900">
                {post.publish_date ? formatDate(post.publish_date) : '미정'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">생성일</label>
              <p className="mt-1 text-gray-900">{formatDateTime(post.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">수정일</label>
              <p className="mt-1 text-gray-900">{formatDateTime(post.updated_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 탭 콘텐츠 */}
      <Tabs defaultValue="status" className="space-y-4">
        <TabsList>
          <TabsTrigger value="status">진행 상황</TabsTrigger>
          {pipelineResult && <TabsTrigger value="content">생성된 콘텐츠</TabsTrigger>}
          <TabsTrigger value="materials">제공한 자료</TabsTrigger>
        </TabsList>

        <TabsContent value="status">
          <Card>
            <CardHeader>
              <CardTitle>포스트 진행 상황</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 진행 단계 */}
                <div className="space-y-3">
                  {[
                    { status: 'initial', label: '포스트 생성', description: '포스트가 생성되었습니다' },
                    { status: 'hospital_processing', label: '자료 제공', description: '병원에서 치료 사례 자료를 제공합니다' },
                    { status: 'hospital_completed', label: '자료 제공 완료', description: '치료 사례 자료 제공이 완료되었습니다' },
                    { status: 'agent_processing', label: 'AI 처리', description: 'AI가 콘텐츠를 생성하고 있습니다' },
                    { status: 'agent_completed', label: 'AI 처리 완료', description: 'AI 콘텐츠 생성이 완료되었습니다' },
                    { status: 'client_review', label: '검토 요청', description: '생성된 콘텐츠를 검토해주세요' },
                    { status: 'client_approved', label: '승인 완료', description: '콘텐츠가 승인되었습니다' },
                    { status: 'published', label: '게시 완료', description: '콘텐츠가 게시되었습니다' }
                  ].map((step, index) => {
                    const isCompleted = ['initial', 'hospital_processing', 'hospital_completed', 'agent_processing', 'agent_completed', 'client_review', 'client_approved', 'published'].indexOf(post.status) >= index;
                    const isCurrent = step.status === post.status;
                    
                    return (
                      <div key={step.status} className={`flex items-center space-x-3 p-3 rounded-lg ${
                        isCurrent ? 'bg-blue-50 border-blue-200 border' : 
                        isCompleted ? 'bg-green-50' : 'bg-gray-50'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-medium ${
                          isCurrent ? 'bg-blue-500' :
                          isCompleted ? 'bg-green-500' : 'bg-gray-300'
                        }`}>
                          {isCurrent ? '⏳' : isCompleted ? '✅' : index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${isCurrent ? 'text-blue-700' : 'text-gray-900'}`}>
                            {step.label}
                          </p>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {pipelineResult && (
          <TabsContent value="content">
            <Card>
              <CardHeader>
                <CardTitle>AI 생성 콘텐츠</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 품질 정보 */}
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <div className="text-2xl font-bold text-blue-600">
                        {pipelineResult.quality_score?.toFixed(1) || '0.0'}
                      </div>
                      <div className="text-sm text-gray-600">품질 점수</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-600">
                        {pipelineResult.improvement_rate?.toFixed(1) || '0.0'}%
                      </div>
                      <div className="text-sm text-gray-600">개선률</div>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-purple-600">
                        {pipelineResult.total_iterations}
                      </div>
                      <div className="text-sm text-gray-600">AI 수정 횟수</div>
                    </div>
                  </div>
                  
                  {/* 제목 */}
                  {pipelineResult.final_title && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">생성된 제목</label>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <p className="font-medium">{pipelineResult.final_title}</p>
                      </div>
                    </div>
                  )}
                  
                  {/* 콘텐츠 미리보기 */}
                  {pipelineResult.final_content && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        생성된 콘텐츠 ({pipelineResult.final_content.length}자)
                      </label>
                      <div className="p-3 bg-gray-50 rounded-lg max-h-64 overflow-y-auto">
                        <p className="text-sm whitespace-pre-wrap">{pipelineResult.final_content}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="materials">
          <Card>
            <CardHeader>
              <CardTitle>제공한 자료</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-gray-500">
                자료 정보 표시 기능은 개발 중입니다.
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
