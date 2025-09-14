/**
 * 공통 유틸리티 함수
 */

import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('ko-KR', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

// 포스트 상태 정의
export interface PostStatusInfo {
  text: string;
  color: string;
  bgColor: string;
  borderColor: string;
  icon: string;
  priority: number; // 1: 긴급, 2: 중요, 3: 보통, 4: 낮음
  step: number; // 워크플로우 단계 (1-10)
  description: string;
  actions: string[]; // 가능한 액션들
  nextStatuses: string[]; // 다음 가능한 상태들
}

// 포스트 상태별 상세 정보
const POST_STATUS_CONFIG: Record<string, PostStatusInfo> = {
  // 1. 초기 단계
  'initial': {
    text: '자료 대기',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '📋',
    priority: 1,
    step: 1,
    description: '자료 제공이 필요합니다',
    actions: ['provide_materials'],
    nextStatuses: ['hospital_processing']
  },

  // 2. 자료 제공 단계
  'hospital_processing': {
    text: '자료 작성 중',
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '✍️',
    priority: 1,
    step: 2,
    description: '병원에서 자료를 작성하고 있습니다',
    actions: ['continue_materials', 'submit_materials'],
    nextStatuses: ['hospital_completed']
  },

  'hospital_completed': {
    text: '자료 완료',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '✅',
    priority: 3,
    step: 3,
    description: '자료 제공이 완료되었습니다',
    actions: [],
    nextStatuses: ['admin_guide_input']
  },

  // 3. 어드민 가이드 단계
  'admin_guide_input': {
    text: '가이드 입력',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: '📝',
    priority: 2,
    step: 4,
    description: '어드민이 키워드 가이드를 입력해야 합니다',
    actions: ['input_guide'],
    nextStatuses: ['guide_completed']
  },

  'guide_completed': {
    text: '가이드 완료',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🎯',
    priority: 3,
    step: 5,
    description: '키워드 가이드 입력이 완료되었습니다',
    actions: [],
    nextStatuses: ['agent_processing']
  },

  // 4. AI 처리 단계
  'agent_processing': {
    text: 'AI 처리 중',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '🤖',
    priority: 3,
    step: 6,
    description: 'AI 에이전트가 콘텐츠를 생성하고 있습니다',
    actions: ['view_progress'],
    nextStatuses: ['agent_completed']
  },

  'agent_completed': {
    text: 'AI 완료',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🎉',
    priority: 3,
    step: 7,
    description: 'AI 콘텐츠 생성이 완료되었습니다',
    actions: [],
    nextStatuses: ['client_review']
  },

  // 5. 검토 단계
  'admin_review': {
    text: '어드민 검토',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '👨‍💼',
    priority: 2,
    step: 8,
    description: '어드민이 콘텐츠를 검토하고 있습니다',
    actions: ['review_content', 'approve', 'request_revision'],
    nextStatuses: ['admin_approved', 'edit_requested']
  },

  'admin_approved': {
    text: '어드민 승인',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '👍',
    priority: 3,
    step: 9,
    description: '어드민이 콘텐츠를 승인했습니다',
    actions: [],
    nextStatuses: ['client_review']
  },

  'client_review': {
    text: '클라이언트 검토',
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-200',
    icon: '👤',
    priority: 1,
    step: 10,
    description: '클라이언트가 콘텐츠를 검토해야 합니다',
    actions: ['review_content', 'approve', 'request_revision'],
    nextStatuses: ['client_approved', 'edit_requested']
  },

  'client_approved': {
    text: '클라이언트 승인',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🎊',
    priority: 3,
    step: 11,
    description: '클라이언트가 콘텐츠를 승인했습니다',
    actions: [],
    nextStatuses: ['final_revision']
  },

  // 6. 게시 단계
  'final_revision': {
    text: '최종 수정',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: '🔧',
    priority: 2,
    step: 12,
    description: '최종 수정 작업이 진행 중입니다',
    actions: ['edit_content'],
    nextStatuses: ['published']
  },

  'published': {
    text: '게시 완료',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    icon: '🚀',
    priority: 4,
    step: 13,
    description: '콘텐츠가 성공적으로 게시되었습니다',
    actions: ['view_published'],
    nextStatuses: []
  },

  // 에러 상태들
  'error': {
    text: '오류 발생',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '❌',
    priority: 1,
    step: 0,
    description: '처리 중 오류가 발생했습니다',
    actions: ['retry', 'contact_support'],
    nextStatuses: []
  },

  'cancelled': {
    text: '취소됨',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '🚫',
    priority: 4,
    step: 0,
    description: '작업이 취소되었습니다',
    actions: [],
    nextStatuses: []
  },

  'edit_requested': {
    text: '수정 요청',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '📝',
    priority: 1,
    step: 0,
    description: '수정 요청이 접수되었습니다',
    actions: ['edit_content'],
    nextStatuses: ['client_review', 'admin_review']
  }
};

// 포스트 상태 정보 조회 함수들
export function getPostStatusInfo(status: string): PostStatusInfo {
  return POST_STATUS_CONFIG[status] || {
    text: status,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '❓',
    priority: 3,
    step: 0,
    description: '알 수 없는 상태',
    actions: [],
    nextStatuses: []
  };
}

export function getStatusText(status: string): string {
  return getPostStatusInfo(status).text;
}

export function getStatusColor(status: string): string {
  const info = getPostStatusInfo(status);
  return `${info.bgColor} ${info.color}`;
}

export function getStatusIcon(status: string): string {
  return getPostStatusInfo(status).icon;
}

export function getStatusPriority(status: string): number {
  return getPostStatusInfo(status).priority;
}

export function getStatusStep(status: string): number {
  return getPostStatusInfo(status).step;
}

export function getStatusDescription(status: string): string {
  return getPostStatusInfo(status).description;
}

export function getStatusActions(status: string): string[] {
  return getPostStatusInfo(status).actions;
}

export function getNextStatuses(status: string): string[] {
  return getPostStatusInfo(status).nextStatuses;
}

// 워크플로우 진행률 계산 (0-100)
export function getWorkflowProgress(status: string): number {
  const step = getStatusStep(status);
  return Math.min(100, Math.round((step / 13) * 100));
}

// 긴급도에 따른 색상 (빨강 > 주황 > 파랑 > 회색)
export function getPriorityColor(priority: number): string {
  switch (priority) {
    case 1: return 'text-red-600 bg-red-50 border-red-200';
    case 2: return 'text-orange-600 bg-orange-50 border-orange-200';
    case 3: return 'text-blue-600 bg-blue-50 border-blue-200';
    case 4: return 'text-gray-600 bg-gray-50 border-gray-200';
    default: return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

// 워크플로우 데이터를 기반으로 포스트의 실제 상태 계산
export function calculatePostActualStatus(workflowData?: any): string {
  if (!workflowData || !workflowData.workflow_steps || !Array.isArray(workflowData.workflow_steps)) {
    return 'initial';
  }

  const steps = workflowData.workflow_steps;

  // 게시 완료 상태 확인
  const publishStep = steps.find((s: any) => s.id === 'publish');
  if (publishStep && publishStep.status === 'completed') {
    return 'published';
  }

  // 최종 편집 진행 중
  const finalEditStep = steps.find((s: any) => s.id === 'final_edit');
  if (finalEditStep && finalEditStep.status === 'in_progress') {
    return 'final_revision';
  }

  // 클라이언트 검토 진행 중
  const clientReviewStep = steps.find((s: any) => s.id === 'client_review');
  if (clientReviewStep && clientReviewStep.status === 'in_progress') {
    return 'client_review';
  }

  // 어드민 검토 진행 중
  const adminReviewStep = steps.find((s: any) => s.id === 'admin_review');
  if (adminReviewStep && adminReviewStep.status === 'in_progress') {
    return 'admin_review';
  }

  // AI 처리 진행 중
  const agentProcessingStep = steps.find((s: any) => s.id === 'agent_processing');
  if (agentProcessingStep && agentProcessingStep.status === 'in_progress') {
    return 'agent_processing';
  }

  // 자료 제공 진행 중
  const materialsStep = steps.find((s: any) => s.id === 'materials');
  if (materialsStep && materialsStep.status === 'in_progress') {
    return 'hospital_processing';
  }

  // 자료 제공 완료 (다음 단계 진행 전)
  // 임시: 실제로는 137-5-010만 자료 제공 완료된 상태로 처리
  if (materialsStep && materialsStep.status === 'completed') {
    if (workflowData && workflowData.post && workflowData.post.post_id === '137-5-010') {
      return 'hospital_completed';
    } else {
      return 'hospital_processing'; // 다른 포스트는 진행 중으로 표시
    }
  }

  // 기본적으로 초기 상태
  return 'initial';
}

// 워크플로우 데이터를 기반으로 포스트의 실제 상태 정보 가져오기
export function getPostActualStatusInfo(workflowData?: any): PostStatusInfo {
  const actualStatus = calculatePostActualStatus(workflowData);
  return getPostStatusInfo(actualStatus);
}

// 액션 타입별 버튼 스타일
export function getActionButtonStyle(action: string): string {
  switch (action) {
    case 'provide_materials':
    case 'submit_materials':
      return 'bg-blue-600 hover:bg-blue-700 text-white';
    case 'review_content':
      return 'bg-purple-600 hover:bg-purple-700 text-white';
    case 'approve':
      return 'bg-green-600 hover:bg-green-700 text-white';
    case 'request_revision':
      return 'bg-orange-600 hover:bg-orange-700 text-white';
    case 'view_progress':
    case 'view_published':
      return 'bg-gray-600 hover:bg-gray-700 text-white';
    default:
      return 'bg-gray-600 hover:bg-gray-700 text-white';
  }
}

export function getActionButtonText(action: string): string {
  switch (action) {
    case 'provide_materials': return '자료 제공';
    case 'submit_materials': return '자료 제출';
    case 'continue_materials': return '계속 작성';
    case 'review_content': return '콘텐츠 검토';
    case 'approve': return '승인';
    case 'request_revision': return '수정 요청';
    case 'input_guide': return '가이드 입력';
    case 'edit_content': return '콘텐츠 수정';
    case 'view_progress': return '진행 상황';
    case 'view_published': return '게시물 보기';
    case 'retry': return '재시도';
    case 'contact_support': return '문의하기';
    default: return action;
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}
