import React from 'react';
import { Badge } from './Badge';
import {
  getStatusIcon,
  getStatusText,
  getStatusColor,
  getStatusDescription,
  getWorkflowProgress,
  getStatusPriority,
  getPriorityColor
} from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  showProgress?: boolean;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'priority' | 'workflow';
}

export function StatusBadge({
  status,
  showIcon = true,
  showProgress = false,
  showDescription = false,
  size = 'md',
  variant = 'default'
}: StatusBadgeProps) {
  const icon = getStatusIcon(status);
  const text = getStatusText(status);
  const color = getStatusColor(status);
  const description = getStatusDescription(status);
  const progress = getWorkflowProgress(status);
  const priority = getStatusPriority(status);
  const priorityColor = getPriorityColor(priority);

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base'
  };

  if (variant === 'priority') {
    return (
      <div className={`inline-flex items-center rounded-full border ${priorityColor} ${sizeClasses[size]}`}>
        <span className="mr-1.5 text-lg">{icon}</span>
        <span className="font-medium">{text}</span>
        {priority <= 2 && (
          <span className="ml-1 w-2 h-2 bg-current rounded-full animate-pulse"></span>
        )}
      </div>
    );
  }

  if (variant === 'workflow') {
    return (
      <div className="space-y-2">
        <div className={`inline-flex items-center rounded-full ${color} ${sizeClasses[size]}`}>
          <span className="mr-1.5">{icon}</span>
          <span className="font-medium">{text}</span>
          <span className="ml-2 text-xs opacity-75">({progress}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-1.5">
          <div
            className="bg-current h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="inline-flex flex-col">
      <Badge className={`inline-flex items-center ${color} ${sizeClasses[size]}`}>
        {showIcon && <span className="mr-1.5">{icon}</span>}
        <span className="font-medium">{text}</span>
        {priority <= 2 && (
          <span className="ml-1 w-1.5 h-1.5 bg-current rounded-full animate-pulse"></span>
        )}
      </Badge>
      {showDescription && description && (
        <span className="text-xs text-gray-500 mt-1">{description}</span>
      )}
      {showProgress && (
        <div className="mt-1 w-full bg-gray-200 rounded-full h-1">
          <div
            className="bg-current h-1 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
}

// 간단한 상태 표시를 위한 컴포넌트
export function StatusIndicator({
  status,
  className = ''
}: {
  status: string;
  className?: string;
}) {
  const icon = getStatusIcon(status);
  const color = getStatusColor(status);

  return (
    <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${color} ${className}`}>
      <span className="text-sm">{icon}</span>
    </div>
  );
}

// 워크플로우 진행률을 보여주는 컴포넌트
export function WorkflowProgress({ status }: { status: string }) {
  const progress = getWorkflowProgress(status);
  const statusInfo = getStatusText(status);
  const icon = getStatusIcon(status);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
          <span>{icon}</span>
          <span className="font-medium">{statusInfo}</span>
        </div>
        <span className="text-gray-500">{progress}%</span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
