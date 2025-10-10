'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { formatDate, formatDateTime, getStatusText, getStatusColor, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import { WorkflowTimeline } from '@/components/shared/WorkflowTimeline';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { getPostDetail, getPostStatusHistory, getPostActivityResults, getPostMetrics, updatePostStatus, reprocessPost } from '@/services/postsDetailApi';
import type { Post, AgentExecutionLog, PipelineResult, AgentResult, PostStatusHistory, PostActivityResult, PostDetailMetrics } from '@/types/common';

export default function AdminPostDetail() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentExecutionLog[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [agentResults, setAgentResults] = useState<AgentResult[]>([]);
  const [workflowData, setWorkflowData] = useState<any>(null);
  const [statusHistory, setStatusHistory] = useState<PostStatusHistory[]>([]);
  const [activityResults, setActivityResults] = useState<PostActivityResult[]>([]);
  const [metrics, setMetrics] = useState<PostDetailMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPostDetail = async () => {
      try {
        setLoading(true);
        
        // 새로운 Posts Detail API를 사용하여 데이터 로드
        const [
          postDetailData,
          statusHistoryData,
          activityResultsData,
          metricsData,
          postData,
          agentLogsData,
          pipelineResultData,
          agentResultsData,
          workflowDataResponse
        ] = await Promise.all([
          getPostDetail(postId),
          getPostStatusHistory(postId),
          getPostActivityResults(postId),
          getPostMetrics(postId),
          adminApi.getPost(postId),
          adminApi.getAgentLogs(postId),
          adminApi.getPipelineResult(postId),
          adminApi.getAgentResults(postId),
          adminApi.getPostWorkflow(postId)
        ]);

        setPost(postData);
        setAgentLogs(agentLogsData);
        setPipelineResult(pipelineResultData);
        setAgentResults(agentResultsData);
        setWorkflowData(workflowDataResponse);
        setStatusHistory(statusHistoryData);
        setActivityResults(activityResultsData);
        setMetrics(metricsData);
      } catch (error) {
        console.error('포스트 상세 데이터 로드 실패:', error);
        // 에러 시 null/빈 상태로 설정
        setPost(null);
        setAgentLogs([]);
        setPipelineResult(null);
        setAgentResults([]);
        setStatusHistory([]);
        setActivityResults([]);
        setMetrics(null);
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
          <StatusBadge status={post.status} workflowData={workflowData} />
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
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList>
          <TabsTrigger value="timeline">타임라인</TabsTrigger>
          <TabsTrigger value="workflow">워크플로우</TabsTrigger>
          <TabsTrigger value="pipeline">파이프라인 결과</TabsTrigger>
          <TabsTrigger value="agents">에이전트 로그</TabsTrigger>
          <TabsTrigger value="content">콘텐츠</TabsTrigger>
          <TabsTrigger value="actions">작업</TabsTrigger>
        </TabsList>

        {/* 타임라인 탭 */}
        <TabsContent value="timeline">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 상태 히스토리 */}
            <Card>
              <CardHeader>
                <CardTitle>상태 변경 히스토리</CardTitle>
                <p className="text-sm text-gray-600">
                  포스트의 상태 변경 이력을 시간순으로 확인하세요
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {statusHistory.map((history, index) => (
                    <div key={history.id} className="flex items-start space-x-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{history.from_status || '시작'}</Badge>
                          <span className="text-gray-400">→</span>
                          <Badge variant="outline">{history.to_status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          {history.action_type === 'status_change' ? '상태 변경' :
                           history.action_type === 'content_update' ? '콘텐츠 업데이트' :
                           history.action_type === 'approval' ? '승인' :
                           history.action_type === 'review' ? '검토' :
                           history.action_type === 'revision' ? '수정' : history.action_type}
                        </p>
                        {history.action_notes && (
                          <p className="text-xs text-gray-500 mb-1">
                            {truncateText(history.action_notes, 100)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDateTime(history.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {statusHistory.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">📋</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">상태 히스토리가 없습니다</h3>
                      <p className="text-gray-600">아직 상태 변경 이력이 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* 활동 결과 */}
            <Card>
              <CardHeader>
                <CardTitle>활동별 결과</CardTitle>
                <p className="text-sm text-gray-600">
                  각 에이전트의 실행 결과와 성능을 확인하세요
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {activityResults.map((result, index) => (
                    <div key={result.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center text-green-600 font-medium text-sm">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant="outline">{result.activity_type}</Badge>
                          <Badge 
                            variant={result.status === 'success' ? 'success' : 
                                    result.status === 'failed' ? 'destructive' : 'warning'}
                          >
                            {result.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">
                          실행 시간: {result.execution_time ? `${(result.execution_time / 1000).toFixed(1)}초` : '-'}
                        </p>
                        {result.quality_score && (
                          <p className="text-sm text-gray-600 mb-1">
                            품질 점수: {result.quality_score.toFixed(1)}
                          </p>
                        )}
                        {result.error_message && (
                          <p className="text-xs text-red-600 mb-1">
                            오류: {truncateText(result.error_message, 80)}
                          </p>
                        )}
                        <p className="text-xs text-gray-400">
                          {formatDateTime(result.created_at)}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  {activityResults.length === 0 && (
                    <div className="text-center py-8">
                      <div className="text-4xl mb-4">⚡</div>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">활동 결과가 없습니다</h3>
                      <p className="text-gray-600">아직 실행된 활동이 없습니다.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 성능 메트릭 */}
          {metrics && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>성능 메트릭</CardTitle>
                <p className="text-sm text-gray-600">
                  포스트 생성 과정의 성능 지표를 확인하세요
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {metrics.total_execution_time ? `${(metrics.total_execution_time / 1000).toFixed(1)}초` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">총 실행 시간</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {metrics.success_rate ? `${(metrics.success_rate * 100).toFixed(1)}%` : '-'}
                    </div>
                    <div className="text-sm text-gray-600">성공률</div>
                  </div>
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-2xl font-bold text-purple-600">
                      {metrics.retry_count || 0}
                    </div>
                    <div className="text-sm text-gray-600">재시도 횟수</div>
                  </div>
                  <div className="text-center p-4 bg-orange-50 rounded-lg">
                    <div className="text-2xl font-bold text-orange-600">
                      {metrics.quality_score ? metrics.quality_score.toFixed(1) : '-'}
                    </div>
                    <div className="text-sm text-gray-600">최종 품질 점수</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 워크플로우 탭 */}
        <TabsContent value="workflow">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>콘텐츠 생성 워크플로우</span>
                {workflowData && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">진행률:</span>
                    <Badge variant="outline">
                      {Math.round(workflowData.progress_percentage)}%
                    </Badge>
                  </div>
                )}
              </CardTitle>
              <p className="text-sm text-gray-600">
                포스트 생성부터 게시까지의 전체 프로세스를 단계별로 확인하세요
              </p>
            </CardHeader>
            <CardContent>
              {workflowData && workflowData.workflow_steps ? (
                <WorkflowTimeline steps={workflowData.workflow_steps} />
              ) : (
                <div className="text-center py-8">
                  <div className="text-4xl mb-4">📊</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">워크플로우 데이터를 불러올 수 없습니다</h3>
                  <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

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
