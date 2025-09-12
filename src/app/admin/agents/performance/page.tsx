'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  TrendingDown,
  Zap,
  Server,
  Database,
  Cpu,
  HardDrive,
  RefreshCw
} from 'lucide-react';

interface AgentMetrics {
  agentType: string;
  health: 'healthy' | 'degraded' | 'critical';
  metrics: {
    successRate: number;
    avgExecutionTime: number;
    errorRate: number;
    throughput: number;
  };
  trends: {
    daily: Array<{ timestamp: string; value: number; }>;
    weekly: Array<{ timestamp: string; value: number; }>;
  };
}

interface SystemMetrics {
  database: {
    status: string;
    connections: {
      active: number;
      idle: number;
      max: number;
    };
    responseTime: number;
  };
  redis: {
    status: string;
    memory: {
      used: string;
      available: string;
    };
    hits: number;
    misses: number;
  };
  api: {
    status: string;
    requestsPerMinute: number;
    avgResponseTime: number;
    errorRate: number;
  };
}

interface Alert {
  id: number;
  type: 'error' | 'warning' | 'info';
  title: string;
  message: string;
  timestamp: string;
  agentType?: string;
  resolved: boolean;
}

const agentLabels = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

const healthColors = {
  healthy: 'text-green-600 bg-green-100',
  degraded: 'text-yellow-600 bg-yellow-100',
  critical: 'text-red-600 bg-red-100'
};

const healthLabels = {
  healthy: '정상',
  degraded: '주의',
  critical: '심각'
};

export default function AgentPerformancePage() {
  const [agentMetrics, setAgentMetrics] = useState<AgentMetrics[]>([]);
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMetrics();

    if (autoRefresh) {
      const interval = setInterval(loadMetrics, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMetrics = async () => {
    try {
      // 실제로는 API 호출
      const mockAgentMetrics: AgentMetrics[] = [
        {
          agentType: 'input',
          health: 'healthy',
          metrics: {
            successRate: 98.5,
            avgExecutionTime: 2.1,
            errorRate: 1.5,
            throughput: 45
          },
          trends: {
            daily: Array.from({ length: 24 }, (_, i) => ({
              timestamp: `${i}:00`,
              value: 95 + Math.random() * 10
            })),
            weekly: Array.from({ length: 7 }, (_, i) => ({
              timestamp: `Day ${i + 1}`,
              value: 96 + Math.random() * 8
            }))
          }
        },
        {
          agentType: 'plan',
          health: 'healthy',
          metrics: {
            successRate: 96.8,
            avgExecutionTime: 3.2,
            errorRate: 3.2,
            throughput: 38
          },
          trends: {
            daily: Array.from({ length: 24 }, (_, i) => ({
              timestamp: `${i}:00`,
              value: 94 + Math.random() * 12
            })),
            weekly: Array.from({ length: 7 }, (_, i) => ({
              timestamp: `Day ${i + 1}`,
              value: 95 + Math.random() * 10
            }))
          }
        },
        {
          agentType: 'content',
          health: 'degraded',
          metrics: {
            successRate: 94.7,
            avgExecutionTime: 12.5,
            errorRate: 5.3,
            throughput: 15
          },
          trends: {
            daily: Array.from({ length: 24 }, (_, i) => ({
              timestamp: `${i}:00`,
              value: 88 + Math.random() * 15
            })),
            weekly: Array.from({ length: 7 }, (_, i) => ({
              timestamp: `Day ${i + 1}`,
              value: 90 + Math.random() * 12
            }))
          }
        },
        {
          agentType: 'evaluation',
          health: 'healthy',
          metrics: {
            successRate: 99.1,
            avgExecutionTime: 4.2,
            errorRate: 0.9,
            throughput: 52
          },
          trends: {
            daily: Array.from({ length: 24 }, (_, i) => ({
              timestamp: `${i}:00`,
              value: 97 + Math.random() * 6
            })),
            weekly: Array.from({ length: 7 }, (_, i) => ({
              timestamp: `Day ${i + 1}`,
              value: 98 + Math.random() * 4
            }))
          }
        },
        {
          agentType: 'edit',
          health: 'critical',
          metrics: {
            successRate: 92.3,
            avgExecutionTime: 8.7,
            errorRate: 7.7,
            throughput: 22
          },
          trends: {
            daily: Array.from({ length: 24 }, (_, i) => ({
              timestamp: `${i}:00`,
              value: 85 + Math.random() * 20
            })),
            weekly: Array.from({ length: 7 }, (_, i) => ({
              timestamp: `Day ${i + 1}`,
              value: 87 + Math.random() * 18
            }))
          }
        }
      ];

      const mockSystemMetrics: SystemMetrics = {
        database: {
          status: 'healthy',
          connections: { active: 12, idle: 8, max: 50 },
          responseTime: 45
        },
        redis: {
          status: 'healthy',
          memory: { used: '256MB', available: '512MB' },
          hits: 9847,
          misses: 153
        },
        api: {
          status: 'healthy',
          requestsPerMinute: 245,
          avgResponseTime: 180,
          errorRate: 0.8
        }
      };

      const mockAlerts: Alert[] = [
        {
          id: 1,
          type: 'warning',
          title: 'Edit Agent 성능 저하',
          message: 'Edit Agent의 성공률이 95% 미만으로 떨어졌습니다.',
          timestamp: '2024-01-20T10:30:00Z',
          agentType: 'edit',
          resolved: false
        },
        {
          id: 2,
          type: 'error',
          title: 'Content Agent 오류 증가',
          message: 'Content Agent에서 5분 동안 3건의 오류가 발생했습니다.',
          timestamp: '2024-01-20T09:15:00Z',
          agentType: 'content',
          resolved: false
        },
        {
          id: 3,
          type: 'info',
          title: '시스템 유지보수 완료',
          message: '데이터베이스 최적화 작업이 완료되었습니다.',
          timestamp: '2024-01-20T08:00:00Z',
          resolved: true
        }
      ];

      setAgentMetrics(mockAgentMetrics);
      setSystemMetrics(mockSystemMetrics);
      setAlerts(mockAlerts);
    } catch (error) {
      console.error('Failed to load metrics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleResolveAlert = async (alertId: number) => {
    // API 호출
    setAlerts(prev => prev.map(alert =>
      alert.id === alertId ? { ...alert, resolved: true } : alert
    ));
  };

  const getOverallHealth = () => {
    const criticalCount = agentMetrics.filter(m => m.health === 'critical').length;
    const degradedCount = agentMetrics.filter(m => m.health === 'degraded').length;

    if (criticalCount > 0) return 'critical';
    if (degradedCount > 0) return 'degraded';
    return 'healthy';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">성능 모니터링</h1>
            <p className="text-gray-600">
              AI 에이전트와 시스템의 실시간 성능을 모니터링합니다.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${
                getOverallHealth() === 'healthy' ? 'bg-green-500' :
                getOverallHealth() === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
              }`} />
              <span className="text-sm font-medium">
                전체 상태: {healthLabels[getOverallHealth()]}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={autoRefresh ? 'bg-green-50 border-green-200' : ''}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
              {autoRefresh ? '자동 갱신 중' : '자동 갱신 끄기'}
            </Button>
            <Button onClick={loadMetrics}>
              <RefreshCw className="w-4 h-4 mr-2" />
              수동 갱신
            </Button>
          </div>
        </div>
      </div>

      {/* 시스템 메트릭 */}
      {systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Database className="w-8 h-8 text-blue-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">데이터베이스</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {systemMetrics.database.status === 'healthy' ? '정상' : '이상'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                systemMetrics.database.status === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {systemMetrics.database.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>활성 연결:</span>
                <span>{systemMetrics.database.connections.active}</span>
              </div>
              <div className="flex justify-between">
                <span>응답 시간:</span>
                <span>{systemMetrics.database.responseTime}ms</span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Server className="w-8 h-8 text-purple-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">Redis 캐시</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {systemMetrics.redis.status === 'healthy' ? '정상' : '이상'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                systemMetrics.redis.status === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {systemMetrics.redis.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>메모리 사용:</span>
                <span>{systemMetrics.redis.memory.used}</span>
              </div>
              <div className="flex justify-between">
                <span>히트율:</span>
                <span>
                  {Math.round((systemMetrics.redis.hits /
                    (systemMetrics.redis.hits + systemMetrics.redis.misses)) * 100)}%
                </span>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Activity className="w-8 h-8 text-green-500 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-600">API 성능</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {systemMetrics.api.status === 'healthy' ? '정상' : '이상'}
                  </p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                systemMetrics.api.status === 'healthy'
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {systemMetrics.api.status}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>요청/분:</span>
                <span>{systemMetrics.api.requestsPerMinute}</span>
              </div>
              <div className="flex justify-between">
                <span>평균 응답:</span>
                <span>{systemMetrics.api.avgResponseTime}ms</span>
              </div>
              <div className="flex justify-between">
                <span>오류율:</span>
                <span>{systemMetrics.api.errorRate}%</span>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* AI 에이전트 메트릭 */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">AI 에이전트 성능</h2>
        <div className="grid gap-6">
          {agentMetrics.map((agent) => (
            <Card key={agent.agentType} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <div className={`w-4 h-4 rounded-full mr-3 ${
                    agent.health === 'healthy' ? 'bg-green-500' :
                    agent.health === 'degraded' ? 'bg-yellow-500' : 'bg-red-500'
                  }`} />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agentLabels[agent.agentType as keyof typeof agentLabels]}
                    </h3>
                    <p className="text-sm text-gray-600">
                      상태: {healthLabels[agent.health]}
                    </p>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${healthColors[agent.health]}`}>
                  {healthLabels[agent.health]}
                </span>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600 mb-1">
                    {agent.metrics.successRate}%
                  </div>
                  <div className="text-sm text-blue-600">성공률</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600 mb-1">
                    {agent.metrics.avgExecutionTime}s
                  </div>
                  <div className="text-sm text-green-600">평균 실행시간</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600 mb-1">
                    {agent.metrics.errorRate}%
                  </div>
                  <div className="text-sm text-red-600">오류율</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600 mb-1">
                    {agent.metrics.throughput}
                  </div>
                  <div className="text-sm text-purple-600">처리량/시간</div>
                </div>
              </div>

              {/* 간단한 차트 시각화 (실제로는 차트 라이브러리 사용) */}
              <div className="mb-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">최근 24시간 성공률 추이</h4>
                <div className="h-20 bg-gray-100 rounded-lg flex items-end justify-between px-2">
                  {agent.trends.daily.slice(-12).map((point, index) => (
                    <div
                      key={index}
                      className="bg-blue-500 rounded-sm min-w-[4px]"
                      style={{
                        height: `${(point.value / 100) * 100}%`,
                        opacity: 0.7 + (point.value / 100) * 0.3
                      }}
                    />
                  ))}
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>12시간 전</span>
                  <span>현재</span>
                </div>
              </div>

              {agent.health !== 'healthy' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <h4 className="font-medium text-yellow-800 mb-1">
                        성능 이슈 감지
                      </h4>
                      <p className="text-sm text-yellow-700">
                        {agent.health === 'critical'
                          ? '즉각적인 조치가 필요합니다. 시스템 담당자에게 문의하세요.'
                          : '성능 모니터링을 강화하고 원인을 분석하세요.'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          ))}
        </div>
      </div>

      {/* 알림 및 경고 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          시스템 알림
        </h2>

        <div className="space-y-4">
          {alerts.map((alert) => (
            <div key={alert.id} className={`border rounded-lg p-4 ${
              alert.resolved
                ? 'border-gray-200 bg-gray-50'
                : alert.type === 'error'
                  ? 'border-red-200 bg-red-50'
                  : alert.type === 'warning'
                    ? 'border-yellow-200 bg-yellow-50'
                    : 'border-blue-200 bg-blue-50'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  {alert.type === 'error' ? (
                    <AlertTriangle className="w-5 h-5 text-red-500 mr-3" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  )}
                  <h3 className={`font-medium ${
                    alert.resolved
                      ? 'text-gray-600'
                      : alert.type === 'error'
                        ? 'text-red-800'
                        : alert.type === 'warning'
                          ? 'text-yellow-800'
                          : 'text-blue-800'
                  }`}>
                    {alert.title}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  {alert.resolved && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      해결됨
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {new Date(alert.timestamp).toLocaleString('ko-KR')}
                  </span>
                  {!alert.resolved && alert.type !== 'info' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      해결
                    </Button>
                  )}
                </div>
              </div>
              <p className={`text-sm ${
                alert.resolved ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {alert.message}
              </p>
              {alert.agentType && (
                <p className="text-xs text-gray-500 mt-1">
                  관련 에이전트: {agentLabels[alert.agentType as keyof typeof agentLabels]}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
