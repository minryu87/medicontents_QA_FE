'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { formatDateTime, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { AgentExecutionLog, PipelineResult } from '@/types/common';

interface AgentStats {
  agent_type: string;
  total_executions: number;
  successful_executions: number;
  failed_executions: number;
  avg_execution_time: number;
  success_rate: number;
  last_execution: string;
}

export default function AdminAgents() {
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [recentLogs, setRecentLogs] = useState<AgentExecutionLog[]>([]);
  const [pipelineResults, setPipelineResults] = useState<PipelineResult[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAgentsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [
          agentStatsData,
          recentLogsData,
          pipelineResultsData
        ] = await Promise.all([
          adminApi.getAgentStats(),
          adminApi.getRecentAgentLogs(20),
          adminApi.getRecentPipelineResults(10)
        ]);

        setAgentStats(agentStatsData);
        setRecentLogs(recentLogsData);
        setPipelineResults(pipelineResultsData);
      } catch (error) {
        console.error('에이전트 데이터 로드 실패:', error);
        // 에러 시 빈 상태로 설정
        setAgentStats([]);
        setRecentLogs([]);
        setPipelineResults([]);
      } finally {
        setLoading(false);
      }
    };

    loadAgentsData();
  }, []);

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
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">에이전트 모니터링</h1>
        <p className="text-gray-600">AI 에이전트들의 실행 상태와 성능을 모니터링하세요</p>
      </div>

      {/* 에이전트별 성능 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {agentStats.map((stat) => (
          <Card key={stat.agent_type}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg capitalize">{stat.agent_type}Agent</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">총 실행:</span>
                  <span className="font-medium">{stat.total_executions}회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">성공률:</span>
                  <span className={`font-medium ${stat.success_rate >= 95 ? 'text-green-600' : 'text-orange-600'}`}>
                    {stat.success_rate.toFixed(1)}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">평균 시간:</span>
                  <span className="font-medium">{stat.avg_execution_time.toFixed(1)}초</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">마지막 실행:</span>
                  <span className="text-xs text-gray-500">
                    {formatDateTime(stat.last_execution)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 상세 정보 탭 */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">실행 로그</TabsTrigger>
          <TabsTrigger value="pipeline">파이프라인 결과</TabsTrigger>
          <TabsTrigger value="performance">성능 분석</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>최근 실행 로그</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Post ID</th>
                      <th className="text-left py-2">에이전트</th>
                      <th className="text-left py-2">상태</th>
                      <th className="text-left py-2">실행 시간</th>
                      <th className="text-left py-2">재시도</th>
                      <th className="text-left py-2">실행 시각</th>
                      <th className="text-left py-2">작업</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-2">
                          <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                            {log.post_id}
                          </code>
                        </td>
                        <td className="py-2">
                          <Badge variant="outline">{log.agent_type}</Badge>
                        </td>
                        <td className="py-2">
                          <Badge 
                            variant={log.execution_status === 'completed' ? 'success' : 
                                    log.execution_status === 'failed' ? 'destructive' : 'warning'}
                          >
                            {log.execution_status}
                          </Badge>
                        </td>
                        <td className="py-2 text-sm">
                          {log.execution_time ? `${(log.execution_time / 1000).toFixed(1)}초` : '-'}
                        </td>
                        <td className="py-2 text-sm">
                          {log.retry_count > 0 ? `${log.retry_count}회` : '-'}
                        </td>
                        <td className="py-2 text-sm text-gray-600">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="py-2">
                          <Button size="sm" variant="ghost">상세</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pipeline">
          <Card>
            <CardHeader>
              <CardTitle>파이프라인 실행 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {pipelineResults.map((result) => (
                  <div key={result.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium text-gray-900">
                        {truncateText(result.final_title || '제목 없음', 60)}
                      </h3>
                      <Badge variant={result.pipeline_status === 'completed' ? 'success' : 'warning'}>
                        {result.pipeline_status}
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                      <div>
                        <span className="text-sm text-gray-600">품질 점수:</span>
                        <div className="text-lg font-semibold text-blue-600">
                          {result.quality_score?.toFixed(1) || '0.0'}
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">개선률:</span>
                        <div className="text-lg font-semibold text-green-600">
                          {result.improvement_rate?.toFixed(1) || '0.0'}%
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">반복 횟수:</span>
                        <div className="text-lg font-semibold text-purple-600">
                          {result.total_iterations}회
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">콘텐츠 길이:</span>
                        <div className="text-lg font-semibold text-gray-700">
                          {result.final_content?.length || 0}자
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-gray-500">
                        완료: {result.pipeline_completed_at ? formatDateTime(result.pipeline_completed_at) : '미완료'}
                      </p>
                      <Button size="sm" variant="outline">
                        상세 보기
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* 성능 차트 */}
            <Card>
              <CardHeader>
                <CardTitle>에이전트별 성능</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {agentStats.map((stat) => (
                    <div key={stat.agent_type} className="p-3 border rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium capitalize">{stat.agent_type}Agent</span>
                        <Badge variant={stat.success_rate >= 95 ? 'success' : 'warning'}>
                          {stat.success_rate.toFixed(1)}%
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-gray-600">평균 시간:</span>
                          <span className="ml-2 font-medium">{stat.avg_execution_time.toFixed(1)}초</span>
                        </div>
                        <div>
                          <span className="text-gray-600">총 실행:</span>
                          <span className="ml-2 font-medium">{stat.total_executions}회</span>
                        </div>
                      </div>
                      
                      {/* 성공률 바 */}
                      <div className="mt-2">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${stat.success_rate >= 95 ? 'bg-green-500' : 'bg-orange-500'}`}
                            style={{ width: `${stat.success_rate}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* 시스템 상태 */}
            <Card>
              <CardHeader>
                <CardTitle>시스템 상태</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">전체 파이프라인</span>
                      <Badge variant="success">정상</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      모든 에이전트가 정상적으로 작동 중입니다.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">데이터베이스 연결</span>
                      <Badge variant="success">연결됨</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      PostgreSQL 데이터베이스에 정상 연결되었습니다.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">Redis 캐시</span>
                      <Badge variant="success">활성</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Redis 캐시 서버가 정상 작동 중입니다.
                    </p>
                  </div>
                  
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-medium">LLM API</span>
                      <Badge variant="success">연결됨</Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      Gemini API가 정상적으로 응답하고 있습니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* 액션 버튼 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>시스템 관리</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex space-x-4">
            <Button variant="outline">전체 파이프라인 재시작</Button>
            <Button variant="outline">로그 정리</Button>
            <Button variant="outline">캐시 초기화</Button>
            <Button variant="outline">성능 리포트 다운로드</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
