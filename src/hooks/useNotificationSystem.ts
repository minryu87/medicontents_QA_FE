/**
 * 알림 시스템 관리 Hook
 * WebSocket 이벤트를 받아서 토스트 알림 표시 및 알림 상태 관리
 */

import { useState, useCallback } from 'react';
import { ToastMessage } from '@/components/shared/Toast';

export interface NotificationStats {
  total: number;
  urgent: number;
  approaching: number;
  overdue: number;
}

export function useNotificationSystem() {
  console.log('🍞 useNotificationSystem 호출됨');

  // 일단 WebSocket 관련 로직을 제거하고 토스트 기능만 작동하도록 함
  const isConnected = false;
  const scheduleNotification = null;
  const pipelineUpdate = null;
  const systemAlert = null;

  console.log('✅ useNotificationSystem 간소화 모드로 작동');

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [notificationStats, setNotificationStats] = useState<NotificationStats>({
    total: 0,
    urgent: 0,
    approaching: 0,
    overdue: 0,
  });

  // 토스트 추가
  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    console.log('🍞 useNotificationSystem addToast 호출됨:', toast);

    const newToast: ToastMessage = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    console.log('🆕 새로운 토스트 생성:', newToast);
    setToasts(prev => {
      const newToasts = [newToast, ...prev.slice(0, 4)]; // 최대 5개 유지
      console.log('📋 토스트 목록 업데이트:', newToasts);
      return newToasts;
    });
  }, []);

  // 토스트 제거
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

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
