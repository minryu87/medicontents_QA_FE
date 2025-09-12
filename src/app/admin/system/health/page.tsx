'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Activity,
  Database,
  Server,
  Cpu,
  HardDrive,
  Zap,
  AlertTriangle,
  CheckCircle,
  XCircle,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Minus,
  Clock,
  Wifi,
  Shield
} from 'lucide-react';

interface HealthStatus {
  overall: 'healthy' | 'warning' | 'critical';
  uptime: string;
  lastCheck: string;
  components: {
    database: {
      status: 'healthy' | 'warning' | 'critical';
      connections: {
        active: number;
        idle: number;
        max: number;
      };
      responseTime: number;
      size: string;
      lastBackup: string;
    };
    redis: {
      status: 'healthy' | 'warning' | 'critical';
      memory: {
        used: string;
        available: string;
        usagePercent: number;
      };
      connections: number;
      hitRate: number;
      operations: {
        gets: number;
        sets: number;
      };
    };
    api: {
      status: 'healthy' | 'warning' | 'critical';
      responseTime: number;
      requestsPerMinute: number;
      errorRate: number;
      endpoints: Array<{
        path: string;
        method: string;
        avgResponseTime: number;
        errorCount: number;
      }>;
    };
    filesystem: {
      status: 'healthy' | 'warning' | 'critical';
      total: string;
      used: string;
      available: string;
      usagePercent: number;
    };
    system: {
      status: 'healthy' | 'warning' | 'critical';
      cpu: {
        usage: number;
        cores: number;
      };
      memory: {
        total: string;
        used: string;
        available: string;
        usagePercent: number;
      };
      loadAverage: [number, number, number];
    };
  };
  alerts: Array<{
    id: number;
    type: 'error' | 'warning' | 'info';
    component: string;
    message: string;
    timestamp: string;
    resolved: boolean;
  }>;
}

const statusColors = {
  healthy: 'text-green-600 bg-green-100',
  warning: 'text-yellow-600 bg-yellow-100',
  critical: 'text-red-600 bg-red-100'
};

const statusIcons = {
  healthy: CheckCircle,
  warning: AlertTriangle,
  critical: XCircle
};

const formatBytes = (bytes: string) => {
  const num = parseInt(bytes);
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let unitIndex = 0;
  let size = num;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export default function SystemHealthPage() {
  const [healthData, setHealthData] = useState<HealthStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadHealthData();

    if (autoRefresh) {
      const interval = setInterval(loadHealthData, 30000); // 30초마다 갱신
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadHealthData = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockHealthData: HealthStatus = {
        overall: 'healthy',
        uptime: '7일 14시간 32분',
        lastCheck: new Date().toISOString(),
        components: {
          database: {
            status: 'healthy',
            connections: { active: 12, idle: 8, max: 50 },
            responseTime: 45,
            size: '2450000000', // 2.45GB in bytes
            lastBackup: '2024-01-20T02:00:00Z'
          },
          redis: {
            status: 'healthy',
            memory: {
              used: '256000000', // 256MB
              available: '512000000', // 512MB
              usagePercent: 33.3
            },
            connections: 15,
            hitRate: 94.7,
            operations: {
              gets: 15420,
              sets: 2340
            }
          },
          api: {
            status: 'warning',
            responseTime: 180,
            requestsPerMinute: 245,
            errorRate: 2.1,
            endpoints: [
              { path: '/api/v1/posts', method: 'GET', avgResponseTime: 120, errorCount: 2 },
              { path: '/api/v1/evaluation', method: 'POST', avgResponseTime: 250, errorCount: 5 },
              { path: '/api/v1/admin/users', method: 'GET', avgResponseTime: 80, errorCount: 0 }
            ]
          },
          filesystem: {
            status: 'healthy',
            total: '100000000000', // 100GB
            used: '65000000000', // 65GB
            available: '35000000000', // 35GB
            usagePercent: 65
          },
          system: {
            status: 'healthy',
            cpu: {
              usage: 23.5,
              cores: 4
            },
            memory: {
              total: '16000000000', // 16GB
              used: '12000000000', // 12GB
              available: '4000000000', // 4GB
              usagePercent: 75
            },
            loadAverage: [0.85, 0.72, 0.65]
          }
        },
        alerts: [
          {
            id: 1,
            type: 'warning',
            component: 'api',
            message: 'API 오류율이 2%를 초과했습니다.',
            timestamp: '2024-01-20T10:30:00Z',
            resolved: false
          },
          {
            id: 2,
            type: 'info',
            component: 'database',
            message: '데이터베이스 백업이 완료되었습니다.',
            timestamp: '2024-01-20T02:15:00Z',
            resolved: true
          },
          {
            id: 3,
            type: 'error',
            component: 'redis',
            message: 'Redis 연결이 일시적으로 끊어졌습니다.',
            timestamp: '2024-01-19T14:22:00Z',
            resolved: true
          }
        ]
      };

      setHealthData(mockHealthData);
    } catch (error) {
      console.error('Failed to load health data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getOverallStatusIcon = (status: string) => {
    const IconComponent = statusIcons[status as keyof typeof statusIcons];
    return <IconComponent className={`w-6 h-6 ${
      status === 'healthy' ? 'text-green-500' :
      status === 'warning' ? 'text-yellow-500' : 'text-red-500'
    }`} />;
  };

  const handleResolveAlert = async (alertId: number) => {
    if (!healthData) return;

    setHealthData(prev => prev ? {
      ...prev,
      alerts: prev.alerts.map(alert =>
        alert.id === alertId ? { ...alert, resolved: true } : alert
      )
    } : null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (!healthData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">헬스체크 데이터를 불러올 수 없습니다</h2>
          <p className="text-gray-600">잠시 후 다시 시도해주세요.</p>
        </div>
      </div>
    );
  }

  const { overall, uptime, lastCheck, components, alerts } = healthData;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">시스템 헬스체크</h1>
            <p className="text-gray-600">
              시스템 컴포넌트의 상태를 실시간으로 모니터링합니다.
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {getOverallStatusIcon(overall)}
              <span className="text-lg font-semibold">
                전체 상태: {
                  overall === 'healthy' ? '정상' :
                  overall === 'warning' ? '주의' : '심각'
                }
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
            <Button onClick={loadHealthData}>
              <RefreshCw className="w-4 h-4 mr-2" />
              수동 갱신
            </Button>
          </div>
        </div>
      </div>

      {/* 시스템 개요 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">가동 시간</p>
              <p className="text-2xl font-bold text-gray-900">{uptime}</p>
            </div>
            <Clock className="w-8 h-8 text-blue-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">마지막 점검</p>
              <p className="text-lg font-semibold text-gray-900">
                {new Date(lastCheck).toLocaleTimeString('ko-KR')}
              </p>
            </div>
            <Activity className="w-8 h-8 text-green-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">활성 알림</p>
              <p className="text-2xl font-bold text-gray-900">
                {alerts.filter(a => !a.resolved).length}
              </p>
            </div>
            <AlertTriangle className="w-8 h-8 text-orange-500" />
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">컴포넌트 상태</p>
              <p className="text-2xl font-bold text-gray-900">
                {Object.values(components).filter(c => c.status === 'healthy').length}/
                {Object.keys(components).length}
              </p>
            </div>
            <Shield className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
      </div>

      {/* 컴포넌트 상태 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* 데이터베이스 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Database className="w-6 h-6 mr-3 text-blue-500" />
              <h3 className="text-lg font-semibold text-gray-900">데이터베이스</h3>
            </div>
            {getOverallStatusIcon(components.database.status)}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">연결 수</span>
              <span className="font-medium">
                {components.database.connections.active} 활성 /
                {components.database.connections.idle} 유휴 /
                {components.database.connections.max} 최대
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">응답 시간</span>
              <span className="font-medium">{components.database.responseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">데이터베이스 크기</span>
              <span className="font-medium">{formatBytes(components.database.size)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">마지막 백업</span>
              <span className="font-medium">
                {new Date(components.database.lastBackup).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </Card>

        {/* Redis 캐시 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Server className="w-6 h-6 mr-3 text-red-500" />
              <h3 className="text-lg font-semibold text-gray-900">Redis 캐시</h3>
            </div>
            {getOverallStatusIcon(components.redis.status)}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">메모리 사용</span>
              <span className="font-medium">
                {formatBytes(components.redis.memory.used)} /
                {formatBytes(components.redis.memory.available)}
                ({components.redis.memory.usagePercent.toFixed(1)}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">연결 수</span>
              <span className="font-medium">{components.redis.connections}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">히트율</span>
              <span className="font-medium">{components.redis.hitRate}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">GET/SET 연산</span>
              <span className="font-medium">
                {components.redis.operations.gets.toLocaleString()} /
                {components.redis.operations.sets.toLocaleString()}
              </span>
            </div>
          </div>
        </Card>

        {/* API 성능 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Zap className="w-6 h-6 mr-3 text-yellow-500" />
              <h3 className="text-lg font-semibold text-gray-900">API 성능</h3>
            </div>
            {getOverallStatusIcon(components.api.status)}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">평균 응답 시간</span>
              <span className="font-medium">{components.api.responseTime}ms</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">요청/분</span>
              <span className="font-medium">{components.api.requestsPerMinute}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">오류율</span>
              <span className={`font-medium ${
                components.api.errorRate > 5 ? 'text-red-600' :
                components.api.errorRate > 2 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {components.api.errorRate}%
              </span>
            </div>
          </div>

          <div className="mt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">엔드포인트별 성능</h4>
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {components.api.endpoints.map((endpoint, index) => (
                <div key={index} className="flex justify-between text-xs">
                  <span className="text-gray-600">
                    {endpoint.method} {endpoint.path}
                  </span>
                  <span className={`font-medium ${
                    endpoint.errorCount > 0 ? 'text-red-600' : 'text-green-600'
                  }`}>
                    {endpoint.avgResponseTime}ms ({endpoint.errorCount} 오류)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* 시스템 리소스 */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Cpu className="w-6 h-6 mr-3 text-purple-500" />
              <h3 className="text-lg font-semibold text-gray-900">시스템 리소스</h3>
            </div>
            {getOverallStatusIcon(components.system.status)}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">CPU 사용률</span>
              <span className="font-medium">
                {components.system.cpu.usage}% ({components.system.cpu.cores} 코어)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">메모리 사용</span>
              <span className="font-medium">
                {formatBytes(components.system.memory.used)} /
                {formatBytes(components.system.memory.total)}
                ({components.system.memory.usagePercent}%)
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">부하 평균</span>
              <span className="font-medium">
                {components.system.loadAverage[0].toFixed(2)} /
                {components.system.loadAverage[1].toFixed(2)} /
                {components.system.loadAverage[2].toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">디스크 사용</span>
              <span className={`font-medium ${
                components.filesystem.usagePercent > 90 ? 'text-red-600' :
                components.filesystem.usagePercent > 80 ? 'text-yellow-600' : 'text-green-600'
              }`}>
                {formatBytes(components.filesystem.used)} /
                {formatBytes(components.filesystem.total)}
                ({components.filesystem.usagePercent}%)
              </span>
            </div>
          </div>
        </Card>
      </div>

      {/* 시스템 알림 */}
      <Card className="p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" />
          시스템 알림 및 이벤트
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
                    <XCircle className="w-5 h-5 text-red-500 mr-3" />
                  ) : alert.type === 'warning' ? (
                    <AlertTriangle className="w-5 h-5 text-yellow-500 mr-3" />
                  ) : (
                    <CheckCircle className="w-5 h-5 text-blue-500 mr-3" />
                  )}
                  <div>
                    <h3 className={`font-medium ${
                      alert.resolved
                        ? 'text-gray-600'
                        : alert.type === 'error'
                          ? 'text-red-800'
                          : alert.type === 'warning'
                            ? 'text-yellow-800'
                            : 'text-blue-800'
                    }`}>
                      {alert.component} 컴포넌트 {alert.type === 'error' ? '오류' : alert.type === 'warning' ? '경고' : '정보'}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {new Date(alert.timestamp).toLocaleString('ko-KR')}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {alert.resolved ? (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                      해결됨
                    </span>
                  ) : alert.type !== 'info' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleResolveAlert(alert.id)}
                    >
                      해결
                    </Button>
                  ) : null}
                </div>
              </div>
              <p className={`text-sm ${
                alert.resolved ? 'text-gray-600' : 'text-gray-700'
              }`}>
                {alert.message}
              </p>
            </div>
          ))}
        </div>

        {alerts.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
            <p>모든 시스템이 정상적으로 작동하고 있습니다.</p>
          </div>
        )}
      </Card>
    </div>
  );
}
