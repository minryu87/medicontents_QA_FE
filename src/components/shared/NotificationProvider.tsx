/**
 * 알림 시스템 Provider 컴포넌트
 * 앱 전체에서 알림 시스템을 사용할 수 있도록 함
 */

'use client';

import React from 'react';
import { useNotificationSystem } from '@/hooks/useNotificationSystem';
import { ToastContainer } from './Toast';

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  const { toasts, removeToast } = useNotificationSystem();

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// 개발용 알림 테스트 컴포넌트
export function NotificationTester() {
  const { addTestNotification, clearNotifications, notificationStats } = useNotificationSystem();

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-medium mb-2">알림 테스트 (개발용)</h3>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => addTestNotification('schedule')}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            일정 알림
          </button>
          <button
            onClick={() => addTestNotification('pipeline')}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            파이프라인 알림
          </button>
          <button
            onClick={() => addTestNotification('system')}
            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
          >
            시스템 알림
          </button>
        </div>
        <button
          onClick={clearNotifications}
          className="px-3 py-1 bg-gray-500 text-white text-xs rounded hover:bg-gray-600"
        >
          알림 초기화
        </button>
      </div>
      <div className="mt-2 text-xs text-gray-500">
        총 알림: {notificationStats.total} |
        긴급: {notificationStats.urgent} |
        마감임박: {notificationStats.approaching} |
        기한초과: {notificationStats.overdue}
      </div>
    </div>
  );
}
