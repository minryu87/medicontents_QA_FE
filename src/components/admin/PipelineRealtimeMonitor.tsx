/**
 * 파이프라인 실시간 모니터링 컴포넌트
 * 에이전트 실행 상태 실시간 표시, 진행률 바, 오류 표시
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Progress } from '@/components/shared/Progress';
import Button from '@/components/shared/Button';
import {
  Play,
  Pause,
  Square,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap,
  Eye,
  EyeOff,
  RefreshCw,
  Activity,
  Timer
} from 'lucide-react';
import { usePipelineUpdates } from '@/hooks/useWebSocket';
import type { AgentExecutionLog, PipelineResult } from '@/types/common';

interface AgentStatus {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  output: string;
  error: string | null;
  start_time: string | null;
  end_time: string | null;
  execution_time?: number;
}

interface PipelineRealtimeMonitorProps {
  postId: string;
  pipelineResult?: PipelineResult | null;
  agentLogs?: AgentExecutionLog[];
  onExecute?: () => Promise<void>;
  onStop?: () => Promise<void>;
  onRefresh?: () => void;
}

export function PipelineRealtimeMonitor({
  postId,
  pipelineResult,
  agentLogs = [],
  onExecute,
  onStop,
  onRefresh
}: PipelineRealtimeMonitorProps) {
  const { update: pipelineUpdate } = usePipelineUpdates();
  const [isAutoScroll, setIsAutoScroll] = useState(true);
  const [selectedAgent, setSelectedAgent] = useState<string | null>(null);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [agentStatuses, setAgentStatuses] = useState<AgentStatus[]>([]);

  // WebSocket으로부터 실시간 업데이트 처리
  useEffect(() => {
    if (!pipelineUpdate || pipelineUpdate.post_id !== postId) return;

    const { agent_type, status, execution_time, error_message } = pipelineUpdate;

    setAgentStatuses(prev => prev.map(agent =>
      agent.name === agent_type
        ? {
            ...agent,
            status: status as any,
            execution_time,
            error: error_message || null,
            progress: status === 'completed' ? 100 :
                     status === 'running' ? Math.min(agent.progress + 10, 90) : agent.progress
          }
        : agent
    ));

    // 자동 스크롤
    if (isAutoScroll && logsContainerRef.current) {
      logsContainerRef.current.scrollTop = logsContainerRef.current.scrollHeight;
    }
  }, [pipelineUpdate, postId, isAutoScroll]);

  // 초기 에이전트 상태 설정
  useEffect(() => {
    if (pipelineResult?.ai_generation?.agents) {
                    const statuses: AgentStatus[] = pipelineResult.ai_generation.agents.map((agent: any) => ({
        name: agent.name,
        status: agent.status as any,
        progress: agent.progress,
        output: agent.output,
        error: agent.error,
        start_time: agent.start_time,
        end_time: agent.end_time,
      }));
      setAgentStatuses(statuses);
    } else if (agentLogs.length > 0) {
      // agentLogs로부터 초기 상태 추론
      const agentNames = ['InputAgent', 'PlanAgent', 'TitleAgent', 'ContentAgent', 'EvaluationAgent', 'EditAgent'];
      const statuses: AgentStatus[] = agentNames.map(name => {
        const log = agentLogs.find(log => log.agent_type === name.toLowerCase().replace('agent', ''));
        return {
          name,
          status: log ? (log.execution_status as any) : 'pending',
          progress: log ? (log.execution_status === 'completed' ? 100 : 50) : 0,
          output: '',
          error: log?.error_message || null,
          start_time: log?.created_at || null,
          end_time: log?.updated_at || null,
          execution_time: log?.execution_time ? log.execution_time / 1000 : undefined,
        };
      });
      setAgentStatuses(statuses);
    }
  }, [pipelineResult, agentLogs]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-500 animate-pulse" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'cancelled':
        return <Square className="w-4 h-4 text-gray-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'completed':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'failed':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'cancelled':
        return 'text-gray-600 bg-gray-50 border-gray-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'running':
        return 'bg-blue-500';
      case 'completed':
        return 'bg-green-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-300';
    }
  };

  const overallProgress = agentStatuses.length > 0
    ? Math.round(agentStatuses.reduce((sum, agent) => sum + agent.progress, 0) / agentStatuses.length)
    : 0;

  const runningAgents = agentStatuses.filter(agent => agent.status === 'running');
  const failedAgents = agentStatuses.filter(agent => agent.status === 'failed');
  const completedAgents = agentStatuses.filter(agent => agent.status === 'completed');

  return (
    <div className="space-y-6">
      {/* 실시간 모니터링 헤더 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">실시간 파이프라인 모니터링</h3>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAutoScroll(!isAutoScroll)}
              className={isAutoScroll ? 'bg-blue-50 border-blue-200' : ''}
            >
              {isAutoScroll ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              자동스크롤
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
            >
              <RefreshCw className="w-4 h-4" />
              새로고침
            </Button>
          </div>
        </div>

        {/* 전체 진행률 및 상태 요약 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">{overallProgress}%</div>
            <div className="text-sm text-gray-600">전체 진행률</div>
            <Progress value={overallProgress} className="mt-2 h-2" />
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">{runningAgents.length}</div>
            <div className="text-sm text-gray-600">실행 중</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">{completedAgents.length}</div>
            <div className="text-sm text-gray-600">완료됨</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-red-600 mb-1">{failedAgents.length}</div>
            <div className="text-sm text-gray-600">실패함</div>
          </div>
        </div>

        {/* 실행 제어 버튼들 */}
        <div className="flex space-x-2">
          <Button
            onClick={onExecute}
            disabled={runningAgents.length > 0}
            className="inline-flex items-center"
          >
            <Play className="w-4 h-4 mr-1" />
            실행
          </Button>
          {runningAgents.length > 0 && (
            <Button
              variant="outline"
              onClick={onStop}
              className="inline-flex items-center text-red-600 border-red-300 hover:bg-red-50"
            >
              <Square className="w-4 h-4 mr-1" />
              중지
            </Button>
          )}
        </div>
      </Card>

      {/* 에이전트별 실시간 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 에이전트 상태 목록 */}
        <Card className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">에이전트 상태</h4>
          <div className="space-y-3">
            {agentStatuses.map((agent, index) => (
              <div
                key={agent.name}
                className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                  selectedAgent === agent.name ? 'ring-2 ring-blue-500 bg-blue-50' : 'hover:bg-gray-50'
                } ${getStatusColor(agent.status)}`}
                onClick={() => setSelectedAgent(selectedAgent === agent.name ? null : agent.name)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(agent.status)}
                    <span className="font-medium">{agent.name}</span>
                    <Badge variant={
                      agent.status === 'completed' ? 'success' :
                      agent.status === 'running' ? 'default' :
                      agent.status === 'failed' ? 'error' : 'secondary'
                    } size="sm">
                      {agent.status === 'running' ? '실행중' :
                       agent.status === 'completed' ? '완료' :
                       agent.status === 'failed' ? '실패' :
                       agent.status === 'pending' ? '대기중' : '취소됨'}
                    </Badge>
                  </div>
                  {agent.execution_time && (
                    <div className="flex items-center space-x-1 text-sm text-gray-500">
                      <Timer className="w-3 h-3" />
                      <span>{agent.execution_time.toFixed(1)}s</span>
                    </div>
                  )}
                </div>

                <Progress
                  value={agent.progress}
                  className="h-2 mb-2"
                  color={getProgressColor(agent.status)}
                />

                {agent.start_time && (
                  <div className="text-xs text-gray-500">
                    시작: {new Date(agent.start_time).toLocaleTimeString()}
                    {agent.end_time && ` ~ ${new Date(agent.end_time).toLocaleTimeString()}`}
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* 선택된 에이전트 상세 로그 */}
        <Card className="p-6">
          <h4 className="text-md font-semibold text-gray-900 mb-4">
            {selectedAgent ? `${selectedAgent} 로그` : '실행 로그'}
          </h4>
          <div
            ref={logsContainerRef}
            className="h-96 overflow-y-auto bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm"
          >
            {selectedAgent ? (
              agentStatuses.find(agent => agent.name === selectedAgent) ? (
                <div className="space-y-2">
                  {(() => {
                    const agent = agentStatuses.find(a => a.name === selectedAgent)!;
                    return (
                      <>
                        <div className="text-blue-400">
                          [{agent.name}] 상태: {agent.status.toUpperCase()}
                        </div>
                        {agent.start_time && (
                          <div className="text-green-400">
                            시작 시간: {new Date(agent.start_time).toLocaleString()}
                          </div>
                        )}
                        {agent.end_time && (
                          <div className="text-green-400">
                            종료 시간: {new Date(agent.end_time).toLocaleString()}
                          </div>
                        )}
                        {agent.execution_time && (
                          <div className="text-yellow-400">
                            실행 시간: {agent.execution_time.toFixed(2)}초
                          </div>
                        )}
                        {agent.output && (
                          <div className="text-gray-300 mt-4">
                            <div className="text-green-400 mb-1">출력:</div>
                            <pre className="whitespace-pre-wrap text-xs">{agent.output}</pre>
                          </div>
                        )}
                        {agent.error && (
                          <div className="text-red-400 mt-4">
                            <div className="text-red-300 mb-1">오류:</div>
                            <pre className="whitespace-pre-wrap text-xs">{agent.error}</pre>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : (
                <div className="text-gray-400 text-center">
                  에이전트를 선택하면 상세 로그가 표시됩니다.
                </div>
              )
            ) : (
              <div className="space-y-2">
                {agentStatuses.map((agent, index) => (
                  <div key={agent.name} className="space-y-1">
                    <div className="text-blue-400">
                      [{new Date().toLocaleTimeString()}] {agent.name}: {agent.status.toUpperCase()}
                    </div>
                    {agent.progress > 0 && agent.progress < 100 && (
                      <div className="text-yellow-400">
                        진행률: {agent.progress}%
                      </div>
                    )}
                    {agent.error && (
                      <div className="text-red-400">
                        오류: {agent.error.slice(0, 100)}...
                      </div>
                    )}
                  </div>
                ))}
                {agentStatuses.length === 0 && (
                  <div className="text-gray-400 text-center">
                    파이프라인 실행 로그가 여기에 표시됩니다.
                  </div>
                )}
              </div>
            )}
          </div>
        </Card>
      </div>

      {/* 오류 알림 */}
      {failedAgents.length > 0 && (
        <Card className="p-6 border-red-200 bg-red-50">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <h4 className="text-lg font-semibold text-red-900 mb-2">
                파이프라인 오류 발생
              </h4>
              <div className="space-y-2">
                {failedAgents.map(agent => (
                  <div key={agent.name} className="text-sm text-red-800">
                    <strong>{agent.name}:</strong> {agent.error || '알 수 없는 오류'}
                  </div>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={onExecute}
                className="mt-4 border-red-300 text-red-700 hover:bg-red-100"
              >
                <RotateCcw className="w-4 h-4 mr-1" />
                재시도
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* 실시간 업데이트 표시기 */}
      <div className="fixed bottom-4 right-4 z-40">
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
          <span className="text-sm">실시간 모니터링 활성</span>
        </div>
      </div>
    </div>
  );
}

// 간단 버전 - 컴팩트 모니터링
interface CompactPipelineMonitorProps {
  postId: string;
  pipelineResult?: PipelineResult | null;
  className?: string;
}

export function CompactPipelineMonitor({
  postId,
  pipelineResult,
  className = ''
}: CompactPipelineMonitorProps) {
  const { update: pipelineUpdate } = usePipelineUpdates();
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'running' | 'completed' | 'failed'>('idle');

  useEffect(() => {
    if (!pipelineUpdate || pipelineUpdate.post_id !== postId) return;

    const { status: updateStatus } = pipelineUpdate;
    setStatus(updateStatus as 'idle' | 'running' | 'completed' | 'failed');

    if (updateStatus === 'running') {
      setProgress(prev => Math.min(prev + 15, 90));
    } else if (updateStatus === 'completed') {
      setProgress(100);
    }
  }, [pipelineUpdate, postId]);

  useEffect(() => {
    if (pipelineResult?.ai_generation) {
      const { progress: pipelineProgress, current_step } = pipelineResult.ai_generation;
      setProgress(pipelineProgress);

      // 현재 단계에 따라 상태 결정
      if (pipelineProgress === 100) {
        setStatus('completed');
      } else if (pipelineProgress > 0) {
        setStatus('running');
      } else {
        setStatus('idle');
      }
    }
  }, [pipelineResult]);

  const getStatusText = () => {
    switch (status) {
      case 'running':
        return '실행 중';
      case 'completed':
        return '완료됨';
      case 'failed':
        return '실패함';
      default:
        return '대기 중';
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'running':
        return 'text-blue-600';
      case 'completed':
        return 'text-green-600';
      case 'failed':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`bg-white border rounded-lg p-4 ${className}`}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Activity className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-900">파이프라인 상태</span>
        </div>
        <span className={`text-xs font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between text-xs text-gray-600">
          <span>진행률</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {status === 'running' && (
        <div className="mt-2 flex items-center space-x-1 text-xs text-blue-600">
          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
          <span>실시간 업데이트 중</span>
        </div>
      )}
    </div>
  );
}
