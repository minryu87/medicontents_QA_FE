'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { formatDate, formatDateTime, getStatusText, getStatusColor, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Post, AgentExecutionLog, PipelineResult, AgentResult } from '@/types/common';

export default function AdminPostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentExecutionLog[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [
          postData,
          agentLogsData,
          pipelineResultData,
          agentResultsData
        ] = await Promise.all([
          adminApi.getPost(postId),
          adminApi.getAgentLogs(postId),
          adminApi.getPipelineResult(postId),
          adminApi.getAgentResults(postId)
        ]);

        setPost(postData);
        setAgentLogs(agentLogsData);
        setPipelineResult(pipelineResultData);
        setAgentResults(agentResultsData);
      } catch (error) {
        console.error('포스트 상세 데이터 로드 실패:', error);
        // 에러 시 null/빈 상태로 설정
        setPost(null);
        setAgentLogs([]);
        setPipelineResult(null);
        setAgentResults([]);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadPostDetail();
    }
  }, [postId]);

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

      {/* 기본 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
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
                {post.post_type === 'informational' ? '정보성' : '사례 연구'}
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
      <Tabs defaultValue="pipeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pipeline">파이프라인 결과</TabsTrigger>
          <TabsTrigger value="agents">에이전트 로그</TabsTrigger>
          <TabsTrigger value="content">콘텐츠</TabsTrigger>
          <TabsTrigger value="actions">작업</TabsTrigger>
        </TabsList>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>파이프라인 실행 결과</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineResult ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">품질 점수</label>
                      <p className="mt-1 text-2xl font-bold text-blue-600">
                        {pipelineResult.quality_score?.toFixed(1) || '0.0'}
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">개선률</label>
                      <p className="mt-1 text-2xl font-bold text-green-600">
                        {pipelineResult.improvement_rate?.toFixed(1) || '0.0'}%
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">반복 횟수</label>
                      <p className="mt-1 text-2xl font-bold text-purple-600">
                        {pipelineResult.total_iterations}회
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">상태</label>
                      <Badge variant={pipelineResult.pipeline_status === 'completed' ? 'success' : 'warning'}>
                        {pipelineResult.pipeline_status}
                      </Badge>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">최종 제목</label>
                    <p className="mt-1 text-gray-900">{pipelineResult.final_title}</p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">콘텐츠 길이</label>
                    <p className="mt-1 text-gray-900">
                      {pipelineResult.final_content?.length || 0}자
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">완료 시간</label>
                    <p className="mt-1 text-gray-900">
                      {pipelineResult.pipeline_completed_at 
                        ? formatDateTime(pipelineResult.pipeline_completed_at) 
                        : '미완료'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500">파이프라인 결과가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle>에이전트 실행 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {agentLogs.map((log, index) => (
                  <div key={log.id} className="flex items-center space-x-4 p-4 border rounded-lg">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <Badge variant="outline">{log.agent_type}</Badge>
                        <Badge 
                          variant={log.execution_status === 'completed' ? 'success' : 
                                  log.execution_status === 'failed' ? 'destructive' : 'warning'}
                        >
                          {log.execution_status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        실행 시간: {log.execution_time ? `${(log.execution_time / 1000).toFixed(1)}초` : '-'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatDateTime(log.created_at)}
                      </p>
                    </div>
                    {log.error_message && (
                      <div className="text-red-600 text-sm">
                        <p>오류: {truncateText(log.error_message, 50)}</p>
                      </div>
                    )}
                  </div>
                ))}
                
                {agentLogs.length === 0 && (
                  <p className="text-gray-500 text-center py-8">실행 로그가 없습니다.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>생성된 콘텐츠</CardTitle>
            </CardHeader>
            <CardContent>
              {pipelineResult?.final_content ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최종 제목</label>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <p className="font-medium">{pipelineResult.final_title}</p>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">최종 콘텐츠</label>
                    <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                      <p className="whitespace-pre-wrap text-sm">
                        {pipelineResult.final_content}
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">HTML 길이</label>
                      <p className="text-gray-900">
                        {pipelineResult.final_html_content?.length || 0}자
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">마크다운 길이</label>
                      <p className="text-gray-900">
                        {pipelineResult.final_markdown_content?.length || 0}자
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">생성된 콘텐츠가 없습니다.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="actions">
          <Card>
            <CardHeader>
              <CardTitle>포스트 작업</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {post.status === 'admin_review' && (
                  <div className="flex space-x-4">
                    <Button variant="primary">승인</Button>
                    <Button variant="outline">수정 요청</Button>
                  </div>
                )}
                
                {post.status === 'agent_completed' && (
                  <div className="flex space-x-4">
                    <Button variant="primary">검토 시작</Button>
                    <Button variant="outline">재실행</Button>
                  </div>
                )}
                
                <div className="pt-4 border-t">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">추가 작업</h3>
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/posts/${postId}/pipeline`)}
                    >
                      파이프라인 상태
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/posts/${postId}/edit`)}
                    >
                      콘텐츠 편집
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => router.push(`/admin/posts/${postId}/review`)}
                    >
                      검토하기
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
