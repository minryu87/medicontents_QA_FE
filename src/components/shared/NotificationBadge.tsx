/**
 * 알림 배지 컴포넌트
 * 알림 개수 표시 및 긴급 알림 표시
 */

import React from 'react';
import { Bell, AlertTriangle, Clock } from 'lucide-react';

interface NotificationBadgeProps {
  count: number;
  urgentCount?: number; // 긴급 알림 개수
  approachingCount?: number; // 마감 임박 알림 개수
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'filled';
  showIcon?: boolean;
  className?: string;
}

export function NotificationBadge({
  count,
  urgentCount = 0,
  approachingCount = 0,
  size = 'md',
  variant = 'default',
  showIcon = true,
  className = ''
}: NotificationBadgeProps) {
  if (count === 0) return null;

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          container: 'w-5 h-5',
          text: 'text-xs',
          icon: 'w-3 h-3'
        };
      case 'lg':
        return {
          container: 'w-8 h-8',
          text: 'text-sm',
          icon: 'w-5 h-5'
        };
      default: // md
        return {
          container: 'w-6 h-6',
          text: 'text-xs',
          icon: 'w-4 h-4'
        };
    }
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-red-500 text-white border border-white shadow-sm';
      case 'filled':
        return 'bg-red-500 text-white shadow-lg';
      default: // default
        return 'bg-red-500 text-white shadow-md hover:bg-red-600 transition-colors';
    }
  };

  const sizeClasses = getSizeClasses();
  const variantClasses = getVariantClasses();

  // 긴급 알림이 있는 경우 다른 스타일 적용
  const hasUrgent = urgentCount > 0;
  const hasApproaching = approachingCount > 0;

  const urgentClasses = hasUrgent ? 'animate-pulse bg-red-600 ring-2 ring-red-300' : '';
  const approachingClasses = hasApproaching && !hasUrgent ? 'bg-orange-500' : '';

  return (
    <div className={`relative inline-flex items-center justify-center ${sizeClasses.container} rounded-full ${variantClasses} ${urgentClasses} ${approachingClasses} ${className}`}>
      {showIcon ? (
        <Bell className={`${sizeClasses.icon} ${hasUrgent ? 'animate-bounce' : ''}`} />
      ) : (
        <span className={`font-bold ${sizeClasses.text}`}>
          {count > 99 ? '99+' : count}
        </span>
      )}

      {/* 긴급 알림 표시 */}
      {hasUrgent && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-600 rounded-full flex items-center justify-center">
          <AlertTriangle className="w-2 h-2 text-white" />
        </div>
      )}

      {/* 마감 임박 표시 */}
      {hasApproaching && !hasUrgent && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-orange-600 rounded-full flex items-center justify-center">
          <Clock className="w-2 h-2 text-white" />
        </div>
      )}
    </div>
  );
}

// 알림 버튼 컴포넌트 (배지와 함께 사용)
interface NotificationButtonProps extends Omit<NotificationBadgeProps, 'className'> {
  onClick: () => void;
  children?: React.ReactNode;
  className?: string;
}

export function NotificationButton({
  count,
  urgentCount,
  approachingCount,
  size,
  variant,
  showIcon,
  onClick,
  children,
  className = ''
}: NotificationButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative p-2 rounded-lg hover:bg-gray-100 transition-colors
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${className}
      `}
    >
      {children || <Bell className="w-5 h-5 text-gray-600" />}

      <NotificationBadge
        count={count}
        urgentCount={urgentCount}
        approachingCount={approachingCount}
        size={size}
        variant={variant}
        showIcon={false}
        className="absolute -top-1 -right-1"
      />
    </button>
  );
}

// 알림 요약 컴포넌트
interface NotificationSummaryProps {
  totalCount: number;
  urgentCount: number;
  approachingCount: number;
  overdueCount: number;
  className?: string;
}

export function NotificationSummary({
  totalCount,
  urgentCount,
  approachingCount,
  overdueCount,
  className = ''
}: NotificationSummaryProps) {
  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
        <span className="text-sm text-gray-600">
          긴급: {urgentCount}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
        <span className="text-sm text-gray-600">
          마감 임박: {approachingCount}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-red-700 rounded-full"></div>
        <span className="text-sm text-gray-600">
          기한 초과: {overdueCount}
        </span>
      </div>

      <div className="flex items-center space-x-2">
        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
        <span className="text-sm text-gray-600">
          전체: {totalCount}
        </span>
      </div>
    </div>
  );
}
