/**
 * 알림 시스템 관리 Hook
 * WebSocket 이벤트를 받아서 토스트 알림 표시 및 알림 상태 관리
 */

import { useState, useEffect, useCallback } from 'react';
import { useScheduleNotifications, usePipelineUpdates, useSystemAlerts } from './useWebSocket';
import { useWebSocketContext } from '@/contexts/WebSocketContext';
import { ToastMessage } from '@/components/shared/Toast';

export interface NotificationStats {
  total: number;
  urgent: number;
  approaching: number;
  overdue: number;
}

export function useNotificationSystem() {
  const { isConnected } = useWebSocketContext();
  const { notification: scheduleNotification } = useScheduleNotifications();
  const { update: pipelineUpdate } = usePipelineUpdates();
  const { alert: systemAlert } = useSystemAlerts();

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    total: 0,
    urgent: 0,
    approaching: 0,
    overdue: 0,
  });

  // 토스트 추가
  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    const newToast: ToastMessage = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // 최대 5개 유지
  }, []);

  // 토스트 제거
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 일정 알림 처리
  useEffect(() => {
    if (!scheduleNotification) return;

    const { post_id, type, stage, delay_days, hours_remaining, urgency, message } = scheduleNotification;

    let toastType: ToastMessage['type'] = 'schedule';
    let title = '일정 알림';
    let displayMessage = message;
    let duration = 7000; // 일정 알림은 더 오래 표시

    switch (type) {
      case 'deadline_approaching':
        title = `마감 임박: ${stage || '작업'} 단계`;
        displayMessage = hours_remaining
          ? `${hours_remaining}시간 후 마감 예정입니다.`
          : displayMessage;
        toastType = urgency === 'high' ? 'warning' : 'info';
        break;

      case 'overdue':
        title = `기한 초과: ${stage || '작업'} 단계`;
        displayMessage = delay_days
          ? `${delay_days}일 지연되었습니다.`
          : displayMessage;
        toastType = 'error';
        duration = 10000; // 기한 초과는 더 오래 표시
        break;

      case 'priority_changed':
        title = '우선순위 변경';
        toastType = 'warning';
        break;

      case 'stage_completed':
        title = '단계 완료';
        toastType = 'success';
        duration = 5000;
        break;
    }

    addToast({
      type: toastType,
      title,
      message: displayMessage,
      duration,
      action: type === 'overdue' ? {
        label: '확인하기',
        onClick: () => {
          // 해당 포스트의 상세 페이지로 이동하는 로직
          console.log('Navigate to post:', post_id);
        }
      } : undefined,
    });

    // 알림 통계 업데이트
    setNotificationStats(prev => ({
      ...prev,
      total: prev.total + 1,
      urgent: type === 'overdue' ? prev.urgent + 1 : prev.urgent,
      approaching: type === 'deadline_approaching' ? prev.approaching + 1 : prev.approaching,
      overdue: type === 'overdue' ? prev.overdue + 1 : prev.overdue,
    }));

  }, [scheduleNotification, addToast]);

  // 파이프라인 업데이트 처리
  useEffect(() => {
    if (!pipelineUpdate) return;

    const { post_id, agent_type, status, execution_time, error_message } = pipelineUpdate;

    let title = '파이프라인 업데이트';
    let message = '';
    let type: ToastMessage['type'] = 'info';

    switch (status) {
      case 'running':
        title = `${agent_type} 실행 시작`;
        message = 'AI 에이전트가 작업을 시작했습니다.';
        type = 'info';
        break;

      case 'completed':
        title = `${agent_type} 완료`;
        message = execution_time
          ? `${execution_time.toFixed(1)}초 만에 완료되었습니다.`
          : '작업이 성공적으로 완료되었습니다.';
        type = 'success';
        break;

      case 'failed':
        title = `${agent_type} 실패`;
        message = error_message || '작업 중 오류가 발생했습니다.';
        type = 'error';
        break;
    }

    addToast({
      type,
      title,
      message,
      duration: status === 'failed' ? 8000 : 5000,
    });

  }, [pipelineUpdate, addToast]);

  // 시스템 알림 처리
  useEffect(() => {
    if (!systemAlert) return;

    const { alert_type, message, level } = systemAlert;

    let title = '시스템 알림';
    let type: ToastMessage['type'] = 'info';

    switch (level) {
      case 'warning':
        type = 'warning';
        title = '시스템 경고';
        break;
      case 'critical':
        type = 'error';
        title = '시스템 오류';
        break;
      default:
        type = 'info';
        title = '시스템 정보';
    }

    addToast({
      type,
      title: title,
      message,
      duration: level === 'critical' ? 10000 : 6000,
    });

  }, [systemAlert, addToast]);

  // WebSocket 연결 상태 변경 시 토스트 표시
  useEffect(() => {
    if (isConnected) {
      addToast({
        type: 'success',
        title: '실시간 연결됨',
        message: '일정 및 파이프라인 알림을 받을 수 있습니다.',
        duration: 3000,
      });
    } else {
      addToast({
        type: 'warning',
        title: '연결 끊어짐',
        message: '실시간 알림이 일시적으로 중단되었습니다.',
        duration: 5000,
      });
    }
  }, [isConnected, addToast]);

  // 알림 초기화 (개발용)
  const clearNotifications = useCallback(() => {
    setNotificationStats({
      total: 0,
      urgent: 0,
      approaching: 0,
      overdue: 0,
    });
  }, []);

  // 테스트 알림 추가 (개발용)
  const addTestNotification = useCallback((type: 'schedule' | 'pipeline' | 'system' = 'schedule') => {
    switch (type) {
      case 'schedule':
        addToast({
          type: 'schedule',
          title: '테스트: 마감 임박',
          message: 'AI 생성 단계가 2시간 후 마감됩니다.',
          duration: 5000,
        });
        break;
      case 'pipeline':
        addToast({
          type: 'success',
          title: '테스트: 파이프라인 완료',
          message: 'ContentAgent 작업이 완료되었습니다.',
          duration: 4000,
        });
        break;
      case 'system':
        addToast({
          type: 'warning',
          title: '테스트: 시스템 알림',
          message: '일정 모니터링 시스템이 재시작되었습니다.',
          duration: 6000,
        });
        break;
    }
  }, [addToast]);

  return {
    // 토스트 관련
    toasts,
    addToast,
    removeToast,

    // 알림 통계
    notificationStats,
    clearNotifications,

    // 테스트용 (개발에서만 사용)
    addTestNotification,
  };
}
