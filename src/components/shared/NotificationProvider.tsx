/**
 * 알림 시스템 Provider 컴포넌트
 * 앱 전체에서 알림 시스템을 사용할 수 있도록 함
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { ToastContainer, ToastMessage } from './Toast';

// 전역 window 객체 타입 확장
declare global {
  interface Window {
    addToast?: (toast: Omit<ToastMessage, 'id' | 'timestamp'>) => void;
  }
}

interface NotificationProviderProps {
  children: React.ReactNode;
}

export function NotificationProvider({ children }: NotificationProviderProps) {
  console.log('🔔 NotificationProvider 호출됨');

  // 토스트 상태 직접 관리
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // 토스트 추가 함수
  const addToast = useCallback((toast: Omit<ToastMessage, 'id' | 'timestamp'>) => {
    console.log('🍞 NotificationProvider addToast 호출됨:', toast);

    const newToast = {
      ...toast,
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
    };

    console.log('🆕 NotificationProvider 새로운 토스트 생성:', newToast);
    setToasts(prev => [newToast, ...prev.slice(0, 4)]); // 최대 5개 유지
  }, []);

  // 토스트 제거 함수
  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  // 전역 객체에 addToast 함수 등록 (다른 컴포넌트에서 사용할 수 있도록)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addToast = addToast;
    }
  }, [addToast]);

  console.log('🔔 NotificationProvider 렌더링:', { toasts, removeToast });

  return (
    <>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}

// 개발용 알림 테스트 컴포넌트
export function NotificationTester() {

  // 개발 환경에서만 표시
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const handleTestToast = (type: string) => {
    if (typeof window !== 'undefined' && window.addToast) {
      let toastConfig;
      switch (type) {
        case 'schedule':
          toastConfig = {
            type: 'schedule' as const,
            title: '일정 알림 테스트',
            message: '마감 임박 작업이 있습니다.',
            duration: 5000
          };
          break;
        case 'pipeline':
          toastConfig = {
            type: 'success' as const,
            title: '파이프라인 테스트',
            message: 'AI 생성이 완료되었습니다.',
            duration: 4000
          };
          break;
        case 'system':
          toastConfig = {
            type: 'warning' as const,
            title: '시스템 알림 테스트',
            message: '시스템 점검이 예정되어 있습니다.',
            duration: 6000
          };
          break;
      }

      if (toastConfig) {
        window.addToast(toastConfig);
      }
    }
  };

  return (
    <div className="fixed bottom-20 left-4 z-50 bg-white p-4 rounded-lg shadow-lg border">
      <h3 className="text-sm font-medium mb-2">알림 테스트 (개발용)</h3>
      <div className="space-y-2">
        <div className="flex space-x-2">
          <button
            onClick={() => handleTestToast('schedule')}
            className="px-3 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
          >
            일정 알림
          </button>
          <button
            onClick={() => handleTestToast('pipeline')}
            className="px-3 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600"
          >
            파이프라인 알림
          </button>
          <button
            onClick={() => handleTestToast('system')}
            className="px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
          >
            시스템 알림
          </button>
        </div>
      </div>
    </div>
  );
}
