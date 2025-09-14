import React from 'react';
import { Badge } from './Badge';
import { formatDateTime } from '@/lib/utils';

interface WorkflowStep {
  id: string;
  name: string;
  description: string;
  icon: string;
  status: 'completed' | 'in_progress' | 'pending' | 'error';
  timestamp?: string;
  details?: string;
}

interface WorkflowTimelineProps {
  steps: WorkflowStep[];
  currentStep?: string;
  className?: string;
}

export function WorkflowTimeline({
  steps,
  currentStep,
  className = ''
}: WorkflowTimelineProps) {
  const getStepColor = (status: WorkflowStep['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 border-green-300 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 border-blue-300 text-blue-800';
      case 'error':
        return 'bg-red-100 border-red-300 text-red-800';
      case 'pending':
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600';
    }
  };

  const getStepIcon = (step: WorkflowStep) => {
    if (step.status === 'completed') return '✅';
    if (step.status === 'error') return '❌';
    if (step.status === 'in_progress') return '⏳';
    return step.icon;
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {steps.map((step, index) => (
        <div key={step.id} className="relative">
          {/* 연결선 */}
          {index < steps.length - 1 && (
            <div className={`absolute left-6 top-12 w-0.5 h-8 ${
              step.status === 'completed' ? 'bg-green-300' :
              step.status === 'in_progress' ? 'bg-blue-300' : 'bg-gray-300'
            }`} />
          )}

          {/* 단계 표시 */}
          <div className={`flex items-start space-x-4 p-4 rounded-lg border-2 ${getStepColor(step.status)}`}>
            {/* 아이콘 */}
            <div className="flex-shrink-0 w-12 h-12 rounded-full bg-white border-2 flex items-center justify-center text-xl shadow-sm">
              {getStepIcon(step)}
            </div>

            {/* 내용 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h4 className="text-lg font-semibold">{step.name}</h4>
                <Badge
                  variant={
                    step.status === 'completed' ? 'default' :
                    step.status === 'in_progress' ? 'secondary' :
                    step.status === 'error' ? 'destructive' : 'outline'
                  }
                  className={
                    step.status === 'completed' ? 'bg-green-600 text-white' :
                    step.status === 'in_progress' ? 'bg-blue-600 text-white' :
                    step.status === 'error' ? 'bg-red-600 text-white' : ''
                  }
                >
                  {step.status === 'completed' ? '완료' :
                   step.status === 'in_progress' ? '진행 중' :
                   step.status === 'error' ? '오류' : '대기'}
                </Badge>
              </div>

              <p className="text-sm text-gray-600 mb-2">{step.description}</p>

              {step.details && (
                <p className="text-xs text-gray-500 mb-2">{step.details}</p>
              )}

              {step.timestamp && (
                <p className="text-xs text-gray-400">
                  {step.status === 'completed' && '완료 시간: '}
                  {step.status === 'in_progress' && '시작 시간: '}
                  {formatDateTime(step.timestamp)}
                </p>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// 포스트별 워크플로우 상태를 생성하는 유틸리티 함수
export function generatePostWorkflow(post: any): WorkflowStep[] {
  const steps: WorkflowStep[] = [
    {
      id: 'initial',
      name: '포스트 생성',
      description: '포스트가 생성되고 자료 제공 대기 중입니다',
      icon: '📝',
      status: 'completed',
      timestamp: post.created_at
    },
    {
      id: 'materials',
      name: '자료 제공',
      description: '클라이언트가 치료 정보와 이미지를 제공합니다',
      icon: '📋',
      status: post.materials_status === 'completed' ? 'completed' :
              post.materials_status === 'pending' ? 'in_progress' : 'pending',
      timestamp: post.materials_completed_at
    },
    {
      id: 'guide_input',
      name: '키워드 가이드',
      description: '어드민이 SEO 키워드 가이드를 입력합니다',
      icon: '🎯',
      status: post.guide_status === 'completed' ? 'completed' : 'pending',
      timestamp: post.guide_completed_at
    },
    {
      id: 'agent_processing',
      name: 'AI 콘텐츠 생성',
      description: 'AI 에이전트가 콘텐츠를 생성합니다',
      icon: '🤖',
      status: post.agent_status === 'completed' ? 'completed' :
              post.agent_status === 'processing' ? 'in_progress' :
              post.agent_status === 'error' ? 'error' : 'pending',
      timestamp: post.agent_completed_at
    },
    {
      id: 'admin_review',
      name: '어드민 검토',
      description: '어드민이 생성된 콘텐츠를 검토합니다',
      icon: '👨‍💼',
      status: post.admin_review_status === 'completed' ? 'completed' :
              post.admin_review_status === 'pending' ? 'in_progress' : 'pending',
      timestamp: post.admin_reviewed_at
    },
    {
      id: 'client_review',
      name: '클라이언트 검토',
      description: '클라이언트가 콘텐츠를 검토하고 승인합니다',
      icon: '👤',
      status: post.client_review_status === 'completed' ? 'completed' :
              post.client_review_status === 'pending' ? 'in_progress' : 'pending',
      timestamp: post.client_reviewed_at
    },
    {
      id: 'final_edit',
      name: '최종 편집',
      description: '필요시 최종 편집 작업을 수행합니다',
      icon: '🔧',
      status: post.final_edit_status === 'completed' ? 'completed' : 'pending',
      timestamp: post.final_edited_at
    },
    {
      id: 'publish',
      name: '게시',
      description: '콘텐츠가 게시됩니다',
      icon: '🚀',
      status: post.status === 'published' ? 'completed' : 'pending',
      timestamp: post.published_at
    }
  ];

  return steps;
}

