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

export function getStatusText(status: string): string {
  const statusMap: Record<string, string> = {
    'initial': '초기',
    'hospital_processing': '병원 처리 중',
    'hospital_completed': '병원 완료',
    'admin_guide_input': '어드민 가이드 입력',
    'guide_completed': '가이드 완료',
    'agent_processing': '에이전트 처리 중',
    'agent_completed': '에이전트 완료',
    'admin_review': '어드민 검토',
    'admin_approved': '어드민 승인',
    'client_review': '클라이언트 검토',
    'client_approved': '클라이언트 승인',
    'final_revision': '최종 수정',
    'published': '게시 완료',
  };
  
  return statusMap[status] || status;
}

export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    'initial': 'bg-gray-100 text-gray-800',
    'hospital_processing': 'bg-blue-100 text-blue-800',
    'hospital_completed': 'bg-green-100 text-green-800',
    'admin_guide_input': 'bg-yellow-100 text-yellow-800',
    'guide_completed': 'bg-green-100 text-green-800',
    'agent_processing': 'bg-purple-100 text-purple-800',
    'agent_completed': 'bg-green-100 text-green-800',
    'admin_review': 'bg-orange-100 text-orange-800',
    'admin_approved': 'bg-green-100 text-green-800',
    'client_review': 'bg-indigo-100 text-indigo-800',
    'client_approved': 'bg-green-100 text-green-800',
    'final_revision': 'bg-yellow-100 text-yellow-800',
    'published': 'bg-emerald-100 text-emerald-800',
  };
  
  return colorMap[status] || 'bg-gray-100 text-gray-800';
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
