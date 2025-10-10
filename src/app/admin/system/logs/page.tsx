'use client';

import { useEffect, useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { formatDateTime } from '@/lib/utils';
import { SystemLog, SystemLogsStats } from '@/types/common';
import { getSystemLogs, getSystemLogsStats, deleteSystemLogs, cleanupOldLogs, exportSystemLogs, SystemLogsFilters } from '@/services/systemLogsApi';

interface LogFilters {
  level: string;
  source: string;
  user: string;
  dateFrom: string;
  dateTo: string;
  search: string;
}

export default function SystemLogs() {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [stats, setStats] = useState<SystemLogsStats | null>(null);
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
  const [selectedLogs, setSelectedLogs] = useState<number[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const logsEndRef = useRef<HTMLDivElement>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  useEffect(() => {
    if (realTime) {
      intervalRef.current = setInterval(() => {
        loadLogs();
        loadStats();
      }, 5000); // 5초마다 업데이트
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
    loadLogs();
  }, [filters, page]);

  useEffect(() => {
    if (realTime && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [filteredLogs, realTime]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const apiFilters: SystemLogsFilters = {
        level: filters.level || undefined,
        source: filters.source || undefined,
        user_id: filters.user ? parseInt(filters.user) : undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        search: filters.search || undefined,
        page,
        limit: 200
      };

      const response = await getSystemLogs(apiFilters);
      setLogs(response.logs);
      setFilteredLogs(response.logs);
      setTotalPages(response.total_pages);
    } catch (error) {
      console.error('로그 로드 실패:', error);
      // 에러 발생 시 빈 배열로 설정
      setLogs([]);
      setFilteredLogs([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const statsData = await getSystemLogsStats();
      setStats(statsData);
    } catch (error) {
      console.error('로그 통계 로드 실패:', error);
    }
  };

  const handleFilterChange = (newFilters: Partial<LogFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPage(1); // 필터 변경 시 첫 페이지로 이동
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
    setPage(1);
  };

  const exportLogs = async () => {
    try {
      const apiFilters: SystemLogsFilters = {
        level: filters.level || undefined,
        source: filters.source || undefined,
        user_id: filters.user ? parseInt(filters.user) : undefined,
        date_from: filters.dateFrom || undefined,
        date_to: filters.dateTo || undefined,
        search: filters.search || undefined,
      };

      const blob = await exportSystemLogs(apiFilters, 'csv');
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `system_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('로그 내보내기 실패:', error);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedLogs.length === 0) return;
    
    try {
      await deleteSystemLogs(selectedLogs);
      setSelectedLogs([]);
      loadLogs();
    } catch (error) {
      console.error('로그 삭제 실패:', error);
    }
  };

  const handleCleanupOldLogs = async () => {
    try {
      const result = await cleanupOldLogs(30);
      alert(`${result.deleted_count}개의 오래된 로그가 삭제되었습니다.`);
      loadLogs();
      loadStats();
    } catch (error) {
      console.error('로그 정리 실패:', error);
    }
  };

  const handleLogSelect = (logId: number) => {
    setSelectedLogs(prev => 
      prev.includes(logId) 
        ? prev.filter(id => id !== logId)
        : [...prev, logId]
    );
  };

  const handleSelectAll = () => {
    if (selectedLogs.length === (filteredLogs?.length || 0)) {
      setSelectedLogs([]);
    } else {
      setSelectedLogs((filteredLogs || []).map(log => log.id));
    }
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
                onChange={(e) => handleFilterChange({ level: e.target.value })}
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
                onChange={(e) => handleFilterChange({ source: e.target.value })}
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
              <label className="block text-sm font-medium text-gray-700 mb-1">사용자 ID</label>
              <input
                type="number"
                value={filters.user}
                onChange={(e) => handleFilterChange({ user: e.target.value })}
                placeholder="사용자 ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">검색어</label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
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
                onChange={(e) => handleFilterChange({ dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">종료 날짜</label>
              <input
                type="datetime-local"
                value={filters.dateTo}
                onChange={(e) => handleFilterChange({ dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-600">
              총 {filteredLogs?.length || 0}개 로그
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" size="sm" onClick={clearFilters}>
                필터 초기화
              </Button>
              <Button variant="outline" size="sm" onClick={handleCleanupOldLogs}>
                오래된 로그 정리
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
            <div className="flex items-center space-x-4">
              {selectedLogs.length > 0 && (
                <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                  선택된 로그 삭제 ({selectedLogs.length})
                </Button>
              )}
              {realTime && (
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600">실시간 모니터링 중</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 전체 선택 체크박스 */}
          {(filteredLogs?.length || 0) > 0 && (
            <div className="mb-4 flex items-center space-x-2">
              <input
                type="checkbox"
                checked={selectedLogs.length === (filteredLogs?.length || 0) && (filteredLogs?.length || 0) > 0}
                onChange={handleSelectAll}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-600">전체 선택</span>
            </div>
          )}

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {(filteredLogs || []).map((log) => (
              <div key={log.id} className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  checked={selectedLogs.includes(log.id)}
                  onChange={() => handleLogSelect(log.id)}
                  className="mt-1 rounded border-gray-300"
                />
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
                    {log.user_id && <span>사용자 ID: {log.user_id}</span>}
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                  {log.log_metadata && (
                    <details className="mt-2">
                      <summary className="text-xs text-blue-600 cursor-pointer">상세 정보 보기</summary>
                      <pre className="text-xs bg-gray-100 p-2 mt-1 rounded overflow-x-auto">
                        {JSON.stringify(log.log_metadata, null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="mt-4 flex justify-center items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.max(1, prev - 1))}
                disabled={page === 1}
              >
                이전
              </Button>
              <span className="text-sm text-gray-600">
                {page} / {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(prev => Math.min(totalPages, prev + 1))}
                disabled={page === totalPages}
              >
                다음
              </Button>
            </div>
          )}

          {(filteredLogs?.length || 0) === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📋</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">로그가 없습니다</h3>
              <p className="text-gray-600">선택한 조건에 맞는 로그가 없습니다.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 로그 통계 */}
      {stats && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4">로그 통계</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {['DEBUG', 'INFO', 'WARNING', 'ERROR', 'CRITICAL'].map((level) => {
              const count = stats?.logs_by_level?.[level] || 0;
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
          
          {/* 소스별 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">소스별 로그</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(stats?.logs_by_source || {}).map(([source, count]) => (
                    <div key={source} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{source}</span>
                      <Badge variant="outline">{count as number}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">전체 로그 수</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary-600">
                  {(stats?.total_logs || 0).toLocaleString()}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">최근 에러</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {(stats?.recent_errors || []).slice(0, 3).map((error: SystemLog) => (
                    <div key={error.id} className="text-xs">
                      <div className="font-medium text-red-600">{error.level}</div>
                      <div className="text-gray-600 truncate">{error.message}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
