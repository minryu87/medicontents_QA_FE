/**
 * Toast 알림 컴포넌트
 * 실시간 알림 표시를 위한 토스트 UI
 */

import React, { useEffect, useState } from 'react';
import { X, CheckCircle, AlertCircle, AlertTriangle, Info, Clock } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info' | 'schedule';
  title: string;
  message: string;
  duration?: number; // 자동 닫힘 시간 (ms)
  action?: {
    label: string;
    onClick: () => void;
  };
  timestamp?: Date;
}

interface ToastProps extends ToastMessage {
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  message,
  duration = 5000,
  action,
  timestamp,
  onClose
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [progress, setProgress] = useState(100);

  useEffect(() => {
    // 애니메이션 시작
    setIsVisible(true);

    // 진행 바 애니메이션
    if (duration > 0) {
      const interval = setInterval(() => {
        setProgress(prev => {
          if (prev <= 0) {
            clearInterval(interval);
            return 0;
          }
          return prev - (100 / (duration / 100));
        });
      }, 100);

      // 자동 닫힘 타이머
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => {
        clearInterval(interval);
        clearTimeout(timer);
      };
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => onClose(id), 300); // 애니메이션 완료 후 제거
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'schedule':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getBorderColor = () => {
    switch (type) {
      case 'success':
        return 'border-green-500';
      case 'error':
        return 'border-red-500';
      case 'warning':
        return 'border-yellow-500';
      case 'schedule':
        return 'border-blue-500';
      default:
        return 'border-blue-500';
    }
  };

  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-50';
      case 'error':
        return 'bg-red-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'schedule':
        return 'bg-blue-50';
      default:
        return 'bg-blue-50';
    }
  };

  return (
    <div
      className={`
        fixed z-50 transition-all duration-300 ease-in-out
        ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}
        max-w-sm w-full
      `}
      style={{
        right: '1rem',
        top: `${4 + (parseInt(id) % 5) * 4.5}rem` // 여러 토스트를 겹치지 않게 배치
      }}
    >
      <div className={`
        border-l-4 shadow-lg rounded-lg p-4 ${getBorderColor()} ${getBgColor()}
        backdrop-blur-sm bg-white/95
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {title}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {message}
            </p>
            {timestamp && (
              <p className="mt-1 text-xs text-gray-400">
                {timestamp.toLocaleTimeString()}
              </p>
            )}
            {action && (
              <button
                onClick={action.onClick}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                {action.label}
              </button>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* 진행 바 */}
        {duration > 0 && (
          <div className="mt-3 bg-gray-200 rounded-full h-1">
            <div
              className="bg-current h-1 rounded-full transition-all duration-100 ease-linear"
              style={{
                width: `${progress}%`,
                color: type === 'success' ? '#10b981' :
                       type === 'error' ? '#ef4444' :
                       type === 'warning' ? '#f59e0b' :
                       type === 'schedule' ? '#3b82f6' : '#3b82f6'
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Toast 컨테이너 컴포넌트
interface ToastContainerProps {
  toasts: ToastMessage[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed top-0 right-0 z-50 p-4 space-y-4 pointer-events-none">
      {toasts.map(toast => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onRemove} />
        </div>
      ))}
    </div>
  );
}
