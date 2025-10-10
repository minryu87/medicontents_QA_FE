import { SystemLog } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface SystemLogsFilters {
  level?: string;
  source?: string;
  user_id?: number;
  date_from?: string;
  date_to?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export interface SystemLogsResponse {
  logs: SystemLog[];
  total: number;
  page: number;
  limit: number;
  total_pages: number;
}

export interface SystemLogsStats {
  total_logs: number;
  logs_by_level: { [level: string]: number };
  logs_by_source: { [source: string]: number };
  recent_errors: SystemLog[];
}

// 시스템 로그 조회
export const getSystemLogs = async (filters: SystemLogsFilters = {}): Promise<SystemLogsResponse> => {
  const params = new URLSearchParams();
  
  if (filters.level) params.append('level', filters.level);
  if (filters.source) params.append('source', filters.source);
  if (filters.user_id) params.append('user_id', filters.user_id.toString());
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.search) params.append('search', filters.search);
  if (filters.page) params.append('page', filters.page.toString());
  if (filters.limit) params.append('limit', filters.limit.toString());

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`시스템 로그 조회 실패: ${response.statusText}`);
  }

  const result = await response.json();
  
  // 백엔드 응답 구조에 맞게 변환
  if (result.success && result.data) {
    return {
      logs: result.data.logs || [],
      total: result.data.total || 0,
      page: filters.page || 1,
      limit: result.data.limit || 200,
      total_pages: Math.ceil((result.data.total || 0) / (result.data.limit || 200))
    };
  }
  
  throw new Error('API 응답 형식이 올바르지 않습니다.');
};

// 시스템 로그 통계 조회
export const getSystemLogsStats = async (): Promise<SystemLogsStats> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs/stats`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`시스템 로그 통계 조회 실패: ${response.statusText}`);
  }

  const result = await response.json();
  
  // 백엔드 응답 구조에 맞게 변환
  if (result.success && result.data) {
    return {
      total_logs: result.data.total_logs || 0,
      logs_by_level: result.data.logs_by_level || {},
      logs_by_source: result.data.logs_by_source || {},
      recent_errors: result.data.recent_errors || []
    };
  }
  
  throw new Error('API 응답 형식이 올바르지 않습니다.');
};

// 시스템 로그 삭제 (관리자만)
export const deleteSystemLogs = async (logIds: number[]): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ log_ids: logIds }),
  });

  if (!response.ok) {
    throw new Error(`시스템 로그 삭제 실패: ${response.statusText}`);
  }
};

// 오래된 로그 정리 (관리자만)
export const cleanupOldLogs = async (daysToKeep: number = 30): Promise<{ deleted_count: number }> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs/cleanup`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ days_to_keep: daysToKeep }),
  });

  if (!response.ok) {
    throw new Error(`로그 정리 실패: ${response.statusText}`);
  }

  return response.json();
};

// 로그 내보내기
export const exportSystemLogs = async (filters: SystemLogsFilters = {}, format: 'csv' | 'json' = 'csv'): Promise<Blob> => {
  const params = new URLSearchParams();
  
  if (filters.level) params.append('level', filters.level);
  if (filters.source) params.append('source', filters.source);
  if (filters.user_id) params.append('user_id', filters.user_id.toString());
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.search) params.append('search', filters.search);
  params.append('format', format);

  const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs/export?${params}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`로그 내보내기 실패: ${response.statusText}`);
  }

  return response.blob();
};
