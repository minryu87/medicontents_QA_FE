/**
 * 일정 알림 센터 컴포넌트
 * 알림 목록, 알림 확인, 필터링 및 정렬 기능
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import {
  Bell,
  CheckCircle,
  Clock,
  AlertTriangle,
  Filter,
  Search,
  SortAsc,
  SortDesc,
  Eye,
  EyeOff,
  CheckSquare,
  Square,
  Calendar,
  TrendingUp
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type { ScheduleNotificationList, ScheduleNotification } from '@/types/common';
import { formatDistanceToNow, format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface NotificationFilters {
  type: string;
  status: string;
  stage: string;
  dateRange: string;
  search: string;
}

interface NotificationCenterProps {
  notifications?: ScheduleNotificationList;
  onNotificationClick?: (notification: ScheduleNotification) => void;
  className?: string;
}

export function ScheduleNotificationCenter({
  notifications: initialNotifications,
  onNotificationClick,
  className = ''
}: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<ScheduleNotificationList | null>(initialNotifications || null);
  const [loading, setLoading] = useState(!initialNotifications);
  const [filters, setFilters] = useState<NotificationFilters>({
    type: 'all',
    status: 'all',
    stage: 'all',
    dateRange: 'all',
    search: ''
  });
  const [sortBy, setSortBy] = useState<'scheduled_at' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [selectedNotifications, setSelectedNotifications] = useState<Set<number>>(new Set());
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    loadNotifications();
  }, [filters, sortBy, sortOrder]);

  const loadNotifications = async () => {
    try {
      setLoading(true);

      // 실제 API 연동 전까지 mock 데이터 사용
      // TODO: 백엔드 API 준비 후 실제 연동
      /*
      const params: any = {};
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.type !== 'all') params.type = filters.type;
      if (filters.stage !== 'all') params.stage = filters.stage;
      if (filters.dateRange !== 'all') {
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            params.start_date = format(now, 'yyyy-MM-dd');
            break;
          case 'week':
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
            params.start_date = format(weekAgo, 'yyyy-MM-dd');
            break;
          case 'month':
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
            params.start_date = format(monthAgo, 'yyyy-MM-dd');
            break;
        }
      }
      const data = await adminApi.getPendingNotifications(filters.status, 50);
      */

      // Mock 데이터
      const mockNotifications = [
        {
          id: 1,
          post_id: 'QA_001',
          post_title: '치아 신경치료의 모든 것',
          notification_type: 'deadline_approaching' as const,
          stage: 'material',
          scheduled_at: '2024-09-22T18:00:00Z',
          sent_at: null,
          status: 'pending' as const,
          priority: 2,
          campaign_id: 1,
          created_at: '2024-09-20T09:00:00Z',
        },
        {
          id: 2,
          post_id: 'QA_002',
          post_title: '임플란트 수술 전 주의사항',
          notification_type: 'overdue' as const,
          stage: 'ai',
          scheduled_at: '2024-09-25T18:00:00Z',
          sent_at: '2024-09-25T20:00:00Z',
          status: 'sent' as const,
          priority: 3,
          campaign_id: 1,
          created_at: '2024-09-25T08:00:00Z',
        }
      ];

      setNotifications({
        notifications: mockNotifications,
        total: mockNotifications.length,
        page: 1,
        size: 50
      });
    } catch (error) {
      console.error('알림 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAcknowledgeNotification = async (notificationId: number) => {
    try {
      // 실제 API 연동 전까지 mock 처리
      // TODO: 백엔드 API 준비 후 실제 연동
      // await adminApi.acknowledgeNotification(notificationId);

      console.log('알림 확인:', notificationId);
      await loadNotifications();
      setSelectedNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notificationId);
        return newSet;
      });
    } catch (error) {
      console.error('알림 확인 실패:', error);
    }
  };

  const handleBulkAcknowledge = async () => {
    if (selectedNotifications.size === 0) return;

    try {
      // 실제 API 연동 전까지 mock 처리
      // TODO: 백엔드 API 준비 후 실제 연동
      /*
      await Promise.all(
        Array.from(selectedNotifications).map(id =>
          adminApi.acknowledgeNotification(id)
        )
      );
      */

      console.log('일괄 알림 확인:', Array.from(selectedNotifications));
      setSelectedNotifications(new Set());
      await loadNotifications();
    } catch (error) {
      console.error('일괄 확인 실패:', error);
    }
  };

  const toggleNotificationSelection = (id: number) => {
    setSelectedNotifications(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAllNotifications = () => {
    if (!notifications) return;

    const allIds = notifications.notifications
      .filter((n: any) => n.status === 'pending')
      .map(n => n.id);

    setSelectedNotifications(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedNotifications(new Set());
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'deadline_approaching':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'priority_changed':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'stage_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getNotificationTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'deadline_approaching': '마감 임박',
      'overdue': '기한 초과',
      'priority_changed': '우선순위 변경',
      'stage_completed': '단계 완료'
    };
    return labels[type] || type;
  };

  const getStageLabel = (stage: string | null) => {
    const labels: { [key: string]: string } = {
      'material': '자료 수집',
      'guide': '가이드 제공',
      'ai': 'AI 생성',
      'admin_review': '관리자 검토',
      'client_review': '클라이언트 검토',
      'final_revision': '최종 수정',
      'publish': '게시'
    };
    return labels[stage || ''] || stage || '전체';
  };

  const filteredAndSortedNotifications = React.useMemo(() => {
    if (!notifications) return [];

    let filtered = notifications.notifications;

    // 검색 필터
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(n =>
        n.post_title.toLowerCase().includes(searchLower) ||
        n.notification_type.toLowerCase().includes(searchLower)
      );
    }

    // 정렬
    filtered.sort((a: any, b: any) => {
      const aValue = new Date(a[sortBy]).getTime();
      const bValue = new Date(b[sortBy]).getTime();

      return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
    });

    return filtered;
  }, [notifications, filters.search, sortBy, sortOrder]);

  if (loading) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </Card>
    );
  }

  if (!notifications) {
    return (
      <Card className={`p-6 ${className}`}>
        <div className="text-center py-8">
          <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">알림 데이터를 불러올 수 없습니다.</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Bell className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">일정 알림 센터</h3>
          <Badge variant="info">
            {notifications.total}개
          </Badge>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="w-4 h-4 mr-1" />
            필터
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={loadNotifications}
          >
            새로고침
          </Button>
        </div>
      </div>

      {/* 필터 패널 */}
      {showFilters && (
        <Card className="p-4 mb-6 bg-gray-50">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                검색
              </label>
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="포스트 제목, 알림 유형..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                알림 유형
              </label>
              <select
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="deadline_approaching">마감 임박</option>
                <option value="overdue">기한 초과</option>
                <option value="priority_changed">우선순위 변경</option>
                <option value="stage_completed">단계 완료</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                상태
              </label>
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="pending">미확인</option>
                <option value="sent">전송됨</option>
                <option value="acknowledged">확인됨</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                단계
              </label>
              <select
                value={filters.stage}
                onChange={(e) => setFilters(prev => ({ ...prev, stage: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="material">자료 수집</option>
                <option value="guide">가이드 제공</option>
                <option value="ai">AI 생성</option>
                <option value="admin_review">관리자 검토</option>
                <option value="client_review">클라이언트 검토</option>
                <option value="final_revision">최종 수정</option>
                <option value="publish">게시</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기간
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">전체</option>
                <option value="today">오늘</option>
                <option value="week">1주일</option>
                <option value="month">1개월</option>
              </select>
            </div>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">정렬:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2 py-1 border border-gray-300 rounded text-sm"
              >
                <option value="created_at">생성일</option>
                <option value="scheduled_at">예약일</option>
              </select>
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="p-1 hover:bg-gray-200 rounded"
              >
                {sortOrder === 'asc' ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />}
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFilters({
                  type: 'all',
                  status: 'all',
                  stage: 'all',
                  dateRange: 'all',
                  search: ''
                });
              }}
            >
              초기화
            </Button>
          </div>
        </Card>
      )}

      {/* 일괄 작업 */}
      {selectedNotifications.size > 0 && (
        <div className="flex items-center justify-between mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <span className="text-sm text-blue-800">
            {selectedNotifications.size}개의 알림을 선택했습니다.
          </span>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={clearSelection}
            >
              선택 해제
            </Button>
            <Button
              size="sm"
              onClick={handleBulkAcknowledge}
            >
              일괄 확인
            </Button>
          </div>
        </div>
      )}

      {/* 알림 목록 */}
      <div className="space-y-3">
        {filteredAndSortedNotifications.length === 0 ? (
          <div className="text-center py-8">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">
              {filters.search ? '검색 결과가 없습니다.' : '알림이 없습니다.'}
            </p>
          </div>
        ) : (
          <>
            {/* 전체 선택 */}
            {notifications.notifications.some((n: any) => n.status === 'pending') && (
              <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                <button
                  onClick={selectedNotifications.size === notifications.notifications.filter((n: any) => n.status === 'pending').length
                    ? clearSelection
                    : selectAllNotifications}
                  className="flex items-center space-x-2"
                >
                  {selectedNotifications.size === notifications.notifications.filter((n: any) => n.status === 'pending').length ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm text-gray-700">전체 선택</span>
                </button>
              </div>
            )}

            {filteredAndSortedNotifications.map((notification: any) => (
              <div
                key={notification.id}
                className={`
                  p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md
                  ${notification.status === 'pending' ? 'bg-white border-gray-200' : 'bg-gray-50 border-gray-100'}
                  ${selectedNotifications.has(notification.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                `}
                onClick={() => onNotificationClick?.(notification)}
              >
                <div className="flex items-start space-x-3">
                  {/* 체크박스 */}
                  {notification.status === 'pending' && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleNotificationSelection(notification.id);
                      }}
                      className="mt-1"
                    >
                      {selectedNotifications.has(notification.id) ? (
                        <CheckSquare className="w-5 h-5 text-blue-600" />
                      ) : (
                        <Square className="w-5 h-5 text-gray-400" />
                      )}
                    </button>
                  )}

                  {/* 아이콘 */}
                  <div className="flex-shrink-0">
                    {getNotificationIcon(notification.notification_type)}
                  </div>

                  {/* 내용 */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-medium text-gray-900">
                          {notification.post_title}
                        </h4>
                        <Badge variant={
                          notification.notification_type === 'overdue' ? 'error' :
                          notification.notification_type === 'deadline_approaching' ? 'warning' :
                          notification.notification_type === 'priority_changed' ? 'info' :
                          'success'
                        } size="sm">
                          {getNotificationTypeLabel(notification.notification_type)}
                        </Badge>
                        {notification.stage && (
                          <Badge variant="secondary" size="sm">
                            {getStageLabel(notification.stage)}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {notification.scheduled_at ?
                            formatDistanceToNow(new Date(notification.scheduled_at), { addSuffix: true, locale: ko }) :
                            formatDistanceToNow(new Date((notification as any).created_at), { addSuffix: true, locale: ko })
                          }
                        </span>
                        <Badge variant={
                          (notification as any).status === 'pending' ? 'warning' :
                          (notification as any).status === 'sent' ? 'info' :
                          (notification as any).status === 'acknowledged' ? 'success' : 'secondary'
                        } size="sm">
                          {(notification as any).status === 'pending' ? '미확인' :
                           (notification as any).status === 'sent' ? '전송됨' :
                           (notification as any).status === 'acknowledged' ? '확인됨' : (notification as any).status}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-1 text-sm text-gray-600">
                      우선순위: {notification.priority} |
                      캠페인: {notification.campaign_id || '없음'}
                    </div>

                    {notification.scheduled_at && (
                      <div className="mt-1 text-xs text-gray-500">
                        예정 시각: {format(new Date(notification.scheduled_at), 'yyyy-MM-dd HH:mm', { locale: ko })}
                      </div>
                    )}
                  </div>

                  {/* 액션 버튼 */}
                  <div className="flex-shrink-0">
                    {notification.status === 'pending' && (
                      <Button
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAcknowledgeNotification(notification.id);
                        }}
                      >
                        확인
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* 페이지네이션 정보 */}
      {notifications.total > 0 && (
        <div className="mt-4 text-center text-sm text-gray-500">
          총 {notifications.total}개의 알림 (페이지 {notifications.page})
        </div>
      )}
    </Card>
  );
}

// 알림 요약 카드 컴포넌트
interface NotificationSummaryCardProps {
  totalCount: number;
  pendingCount: number;
  urgentCount: number;
  approachingCount: number;
  onClick?: () => void;
  className?: string;
}

export function NotificationSummaryCard({
  totalCount,
  pendingCount,
  urgentCount,
  approachingCount,
  onClick,
  className = ''
}: NotificationSummaryCardProps) {
  return (
    <Card className={`p-4 cursor-pointer hover:shadow-md transition-shadow ${className}`} onClick={onClick}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Bell className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-900">일정 알림</h3>
            <p className="text-xs text-gray-500">
              {pendingCount}개 미확인
            </p>
          </div>
        </div>

        <div className="flex space-x-2">
          {urgentCount > 0 && (
            <Badge variant="error" size="sm">
              긴급 {urgentCount}
            </Badge>
          )}
          {approachingCount > 0 && (
            <Badge variant="warning" size="sm">
              임박 {approachingCount}
            </Badge>
          )}
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-xs text-gray-600">
        <span>총 {totalCount}개</span>
        <span>알림 센터 보기 →</span>
      </div>
    </Card>
  );
}
