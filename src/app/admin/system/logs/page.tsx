'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { formatDateTime } from '@/lib/utils';

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'DEBUG' | 'INFO' | 'WARNING' | 'ERROR' | 'CRITICAL';
  source: string;
  message: string;
  user_id?: number;
  user_name?: string;
  ip_address?: string;
  details?: any;
}

interface LogFilters {
  level: string;
  source: string;
  user: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [realTime, setRealTime] = useState(false);
  const [filters, setFilters] = useState<LogFilters>({
    level: '',
    source: '',
    user: '',
    dateFrom: '',
    dateTo: '',
    search: ''
  });
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLogs();
  }, []);

  useEffect(() => {
    if (realTime) {
      intervalRef.current = setInterval(loadLogs, 5000); // 5초마다 업데이트
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [realTime]);

  useEffect(() => {
    applyFilters();
  }, [logs, filters]);

  useEffect(() => {
    if (realTime && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, realTime]);

  const loadLogs = async () => {
    try {
      // 실제로는 API를 통해 로그를 가져옵니다
      // 현재는 샘플 데이터로 구현
      const sampleLogs: LogEntry[] = generateSampleLogs();
      setLogs(sampleLogs);
    } catch (error) {
      console.error('로그 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSampleLogs = (): LogEntry[] => {
    const levels: LogEntry['level'][] = ['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'];
    const sources = ['auth', 'pipeline', 'database', 'api', 'agent'];
    const messages = [
      '사용자 로그인 성공',
      '포스트 생성 완료',
      'AI 에이전트 실행 시작',
      '데이터베이스 연결 오류',
      'API 요청 처리됨',
      '캠페인 상태 업데이트',
      '파일 업로드 성공',
      '검증 실패',
      '시스템 메모리 부족 경고',
      '백업 완료'
    ];

    const logs: LogEntry[] = [];
    const now = new Date();

    for (let i = 0; i < 50; i++) {
      const timestamp = new Date(now.getTime() - (i * 60000)); // 1분 간격
      logs.push({
        id: `log_${i}`,
        timestamp: timestamp.toISOString(),
        level: levels[Math.floor(Math.random() * levels.length)],
        source: sources[Math.floor(Math.random() * sources.length)],
        message: messages[Math.floor(Math.random() * messages.length)],
        user_id: Math.random() > 0.5 ? Math.floor(Math.random() * 10) + 1 : undefined,
        user_name: Math.random() > 0.5 ? `User${Math.floor(Math.random() * 10) + 1}` : undefined,
        ip_address: Math.random() > 0.3 ? `192.168.1.${Math.floor(Math.random() * 255)}` : undefined,
        details: Math.random() > 0.8 ? { additionalInfo: '상세 정보' } : undefined
      });
    }

    return logs;
  };

  const applyFilters = () => {
    let filtered = [...logs];

    // 레벨 필터링
    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    // 소스 필터링
    if (filters.source) {
      filtered = filtered.filter(log => log.source === filters.source);
    }

    // 사용자 필터링
    if (filters.user) {
      filtered = filtered.filter(log =>
        log.user_name?.toLowerCase().includes(filters.user.toLowerCase())
      );
    }

    // 날짜 필터링
    if (filters.dateFrom) {
      const fromDate = new Date(filters.dateFrom);
      filtered = filtered.filter(log => new Date(log.timestamp) >= fromDate);
    }

    if (filters.dateTo) {
      const toDate = new Date(filters.dateTo);
      filtered = filtered.filter(log => new Date(log.timestamp) <= toDate);
    }

    // 검색어 필터링
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchLower) ||
        log.source.toLowerCase().includes(searchLower) ||
        log.user_name?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredLogs(filtered);
  };

  const clearFilters = () => {
    setFilters({
      level: '',
      source: '',
      user: '',
      dateFrom: '',
      dateTo: '',
      search: ''
    });
  };

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Source', 'Message', 'User', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.source,
        `"${log.message}"`,
        log.user_name || '',
        log.ip_address || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getLevelColor = (level: string) => {
    const colors: { [key: string]: string } = {
      'DEBUG': 'bg-gray-100 text-gray-800',
      'INFO': 'bg-blue-100 text-blue-800',
      'WARNING': 'bg-yellow-100 text-yellow-800',
      'ERROR': 'bg-red-100 text-red-800',
      'CRITICAL': 'bg-red-100 text-red-900'
    };
    return colors[level] || 'bg-gray-100 text-gray-800';
  };

  const getLevelIcon = (level: string) => {
    const icons: { [key: string]: string } = {
      'DEBUG': '🔍',
      'INFO': 'ℹ️',
      'WARNING': '⚠️',
      'ERROR': '❌',
      'CRITICAL': '🚨'
    };
    return icons[level] || '📋';
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
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">시스템 로그</h1>
            <p className="text-gray-600 mt-2">실시간 시스템 로그 모니터링 및 분석</p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant={realTime ? "primary" : "outline"}
              onClick={() => setRealTime(!realTime)}
            >
              {realTime ? '실시간 중지' : '실시간 시작'}
            </Button>
            <Button variant="outline" onClick={exportLogs}>
              로그 내보내기
            </Button>
          </div>
        </div>
      </div>

      {/* 필터 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>로그 필터</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">로그 레벨</label>
              <select
                value={filters.level}
                onChange={(e) => setFilters(prev => ({ ...prev, level: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                <option value="DEBUG">DEBUG</option>
                <option value="INFO">INFO</option>
                <option value="WARNING">WARNING</option>
                <option value="ERROR">ERROR</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">소스</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters(prev => ({ ...prev, source: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="">전체</option>
                <option value="auth">인증</option>
                <option value="pipeline">파이프라인</option>
                <option value="database">데이터베이스</option>
                <option value="api">API</option>
                <option value="agent">AI 에이전트</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자</label>
              <input
                type="text"
                value={filters.user}
                onChange={(e) => setFilters(prev => ({ ...prev, user: e.target.value }))}
                placeholder="사용자명 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                placeholder="메시지 검색"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">시작 날짜</label>
              <input
                type="datetime-local"
                value={filters.dateFrom}
                onChange={(e) => setFilters(prev => ({ ...prev, dateFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
              <input
                type="datetime-local"
                value={filters.dateTo}
                onChange={(e) => setFilters(prev => ({ ...prev, dateTo: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              총 {filteredLogs.length}개 로그 (전체 {logs.length}개 중)
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                필터 초기화
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 로그 목록 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>로그 목록</CardTitle>
            {realTime && (
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600">실시간 모니터링 중</span>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {filteredLogs.map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <div className="text-lg mt-0.5">{getLevelIcon(log.level)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level}
                    </Badge>
                    <span className="text-sm font-medium text-gray-600">{log.source}</span>
                    <span className="text-xs text-gray-500">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>
                  <p className="text-sm text-gray-900 mb-1">{log.message}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-500">
                    {log.user_name && <span>사용자: {log.user_name}</span>}
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                  {log.details && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">상세 정보 보기</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                        {JSON.stringify(log.details, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {filteredLogs.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">로그가 없습니다</h3>
              <p className="text-gray-600">선택한 조건에 맞는 로그가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 로그 통계 */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-5 gap-4">
        {['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((level) => {
          const count = logs.filter(log => log.level === level).length;
          return (
            <Card key={level}>
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold">{count}</div>
                  <Badge className={getLevelColor(level)}>{level}</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
