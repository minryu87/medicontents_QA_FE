import { 
  User,
  SystemLog,
  SystemHealth,
  SystemAnalytics,
  PaginationInfo
} from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Users Management API
export const usersApi = {
  // 사용자 목록 조회
  async getUsers(params?: {
    role?: string;
    is_active?: boolean;
    page?: number;
    size?: number;
  }): Promise<{ items: User[]; total: number; page: number; size: number }> {
    const searchParams = new URLSearchParams();
    if (params?.role) searchParams.append('role', params.role);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch users: ${response.statusText}`);
    }

    return response.json();
  },

  // 사용자 상세 조회
  async getUser(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch user: ${response.statusText}`);
    }

    return response.json();
  },

  // 사용자 생성
  async createUser(data: {
    username: string;
    email: string;
    role: 'admin' | 'client' | 'hospital';
    hospital_id?: number;
    password: string;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create user: ${response.statusText}`);
    }

    return response.json();
  },

  // 사용자 수정
  async updateUser(id: number, data: {
    username?: string;
    email?: string;
    role?: 'admin' | 'client' | 'hospital';
    hospital_id?: number;
    is_active?: boolean;
  }): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update user: ${response.statusText}`);
    }

    return response.json();
  },

  // 사용자 삭제
  async deleteUser(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete user: ${response.statusText}`);
    }
  },

  // 사용자 활성화/비활성화
  async toggleUserStatus(id: number): Promise<User> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}/toggle-status`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle user status: ${response.statusText}`);
    }

    return response.json();
  },

  // 사용자 비밀번호 재설정
  async resetPassword(id: number, newPassword: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/users/${id}/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ new_password: newPassword }),
    });

    if (!response.ok) {
      throw new Error(`Failed to reset password: ${response.statusText}`);
    }
  },
};

// System Logs API
export const systemLogsApi = {
  // 시스템 로그 조회
  async getSystemLogs(params?: {
    level?: string;
    logger_name?: string;
    date_from?: string;
    date_to?: string;
    page?: number;
    size?: number;
  }): Promise<{ items: SystemLog[]; total: number; page: number; size: number }> {
    const searchParams = new URLSearchParams();
    if (params?.level) searchParams.append('level', params.level);
    if (params?.logger_name) searchParams.append('logger_name', params.logger_name);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch system logs: ${response.statusText}`);
    }

    return response.json();
  },

  // 로그 통계 조회
  async getLogStats(): Promise<{
    total_logs: number;
    logs_by_level: { [level: string]: number };
    logs_by_logger: { [logger: string]: number };
    recent_errors: SystemLog[];
  }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs/stats`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch log stats: ${response.statusText}`);
    }

    return response.json();
  },

  // 로그 정리
  async cleanupLogs(olderThanDays: number): Promise<{ deleted_count: number }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/system-logs/cleanup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ older_than_days: olderThanDays }),
    });

    if (!response.ok) {
      throw new Error(`Failed to cleanup logs: ${response.statusText}`);
    }

    return response.json();
  },
};

// Health Check API
export const healthCheckApi = {
  // 시스템 상태 조회
  async getSystemHealth(): Promise<SystemHealth> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/health`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch system health: ${response.statusText}`);
    }

    return response.json();
  },

  // 서비스별 상태 조회
  async getServiceHealth(service: 'database' | 'redis' | 'llm_services'): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    response_time?: number;
    error_message?: string;
    last_check: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/health/${service}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch service health: ${response.statusText}`);
    }

    return response.json();
  },
};

// Analytics API
export const analyticsApi = {
  // 시스템 분석 데이터 조회
  async getSystemAnalytics(params?: {
    period?: string;
    date_from?: string;
    date_to?: string;
  }): Promise<SystemAnalytics> {
    const searchParams = new URLSearchParams();
    if (params?.period) searchParams.append('period', params.period);
    if (params?.date_from) searchParams.append('date_from', params.date_from);
    if (params?.date_to) searchParams.append('date_to', params.date_to);

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/analytics?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch analytics: ${response.statusText}`);
    }

    return response.json();
  },

  // 실시간 메트릭 조회
  async getRealtimeMetrics(): Promise<{
    active_pipelines: number;
    queue_size: number;
    system_load: number;
    memory_usage: number;
    timestamp: string;
  }> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/analytics/realtime`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch realtime metrics: ${response.statusText}`);
    }

    return response.json();
  },
};
