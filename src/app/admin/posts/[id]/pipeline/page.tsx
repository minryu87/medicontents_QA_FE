'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Post, AgentExecutionLog, PipelineResult } from '@/types/common';

export default function AdminPostPipeline() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentExecutionLog[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postData, logsData, pipelineData] = await Promise.all([
          adminApi.getPost(postId),
          adminApi.getAgentLogs(postId),
          adminApi.getPipelineResult(postId).catch(() => null)
        ]);

        setPost(postData);
        setAgentLogs(logsData);
        setPipelineResult(pipelineData);
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadData();
    }
  }, [postId]);

  const handleExecutePipeline = async () => {
    setExecuting(true);
    try {
      // 파이프라인 실행 API 호출
      await fetch('/api/v1/pipeline/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ post_id: postId, agent_type: 'all' })
      });

      alert('파이프라인 실행이 시작되었습니다. 잠시 후 새로고침하여 결과를 확인하세요.');
      
      // 5초 후 자동 새로고침
      setTimeout(() => {
        window.location.reload();
      }, 5000);
    } catch (error) {
      console.error('파이프라인 실행 실패:', error);
      alert('파이프라인 실행에 실패했습니다.');
    } finally {
      setExecuting(false);
    }
  };

  const getAgentStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return '✅';
      case 'running': return '🔄';
      case 'failed': return '❌';
      case 'pending': return '⏳';
      default: return '⚪';
    }
  };

  const getAgentStepNumber = (agentType: string) => {
    const steps = ['input', 'plan', 'title', 'content', 'evaluation', 'edit'];
    return steps.indexOf(agentType) + 1;
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">AI 파이프라인 실행</h1>
            <p className="text-gray-600">Post ID: {post.post_id}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              돌아가기
            </Button>
            <Button 
              onClick={handleExecutePipeline} 
              loading={executing}
              disabled={executing}
            >
              파이프라인 실행
            </Button>
          </div>
        </div>
      </div>

      {/* 파이프라인 진행 상황 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>파이프라인 진행 상황</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {['input', 'plan', 'title', 'content', 'evaluation', 'edit'].map((agentType) => {
              const log = agentLogs.find(log => log.agent_type === agentType);
              const stepNumber = getAgentStepNumber(agentType);
              
              return (
                <div key={agentType} className="flex items-center space-x-4 p-3 border rounded-lg">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 font-medium">
                    {stepNumber}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium capitalize">{agentType}Agent</span>
                      {log && (
                        <Badge 
                          variant={log.execution_status === 'completed' ? 'success' : 
                                  log.execution_status === 'failed' ? 'destructive' : 'warning'}
                        >
                          {log.execution_status}
                        </Badge>
                      )}
                    </div>
                    {log && (
                      <div className="text-sm text-gray-600">
                        <p>실행 시간: {log.execution_time ? `${(log.execution_time / 1000).toFixed(1)}초` : '-'}</p>
                        <p>실행 시각: {formatDateTime(log.created_at)}</p>
                        {log.error_message && (
                          <p className="text-red-600">오류: {log.error_message}</p>
                        )}
                      </div>
                    )}
                    {!log && (
                      <p className="text-sm text-gray-500">실행되지 않음</p>
                    )}
                  </div>
                  <div className="text-2xl">
                    {getAgentStatusIcon(log?.execution_status || 'pending')}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 파이프라인 결과 */}
      {pipelineResult && (
        <Card>
          <CardHeader>
            <CardTitle>파이프라인 최종 결과</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {pipelineResult.quality_score?.toFixed(1) || '0.0'}
                  </div>
                  <div className="text-sm text-gray-600">품질 점수</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {pipelineResult.improvement_rate?.toFixed(1) || '0.0'}%
                  </div>
                  <div className="text-sm text-gray-600">개선률</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {pipelineResult.total_iterations}
                  </div>
                  <div className="text-sm text-gray-600">반복 횟수</div>
                </div>
                <div className="text-center">
                  <Badge variant={pipelineResult.pipeline_status === 'completed' ? 'success' : 'warning'}>
                    {pipelineResult.pipeline_status}
                  </Badge>
                  <div className="text-sm text-gray-600 mt-1">상태</div>
                </div>
              </div>
              
              {pipelineResult.final_title && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">생성된 제목</label>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="font-medium">{pipelineResult.final_title}</p>
                  </div>
                </div>
              )}
              
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
              
              <div className="flex justify-between items-center pt-4 border-t">
                <p className="text-sm text-gray-600">
                  완료 시간: {pipelineResult.pipeline_completed_at 
                    ? formatDateTime(pipelineResult.pipeline_completed_at) 
                    : '미완료'}
                </p>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline">
                    콘텐츠 다운로드
                  </Button>
                  <Button size="sm" variant="outline">
                    검토 단계로 이동
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 파이프라인 미실행 시 안내 */}
      {!pipelineResult && agentLogs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="mb-4">
              <div className="text-6xl mb-4">🤖</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">AI 파이프라인 미실행</h3>
              <p className="text-gray-600 mb-4">
                이 포스트는 아직 AI 파이프라인이 실행되지 않았습니다.
              </p>
            </div>
            <Button onClick={handleExecutePipeline} loading={executing}>
              AI 파이프라인 시작
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
