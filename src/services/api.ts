/**
 * API 서비스 클래스들
 */

import api from '@/lib/api';
import type { 
  Post, 
  Hospital, 
  Campaign, 
  AgentExecutionLog, 
  PipelineResult, 
  AgentResult,
  User,
  Notification,
  PaginationInfo 
} from '@/types/common';

export class AdminApiService {
  // 대시보드 API
  async getDashboardStats() {
    const response = await api.get('/api/v1/admin/dashboard/stats');
    return response.data;
  }

  async getRecentActivities(): Promise<Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    related_id?: number;
  }>> {
    const response = await api.get('/api/v1/admin/dashboard/activities');
    return response.data;
  }

  async getSystemStatus(): Promise<{
    database: 'healthy' | 'warning' | 'error';
    redis: 'healthy' | 'warning' | 'error';
    api: 'healthy' | 'warning' | 'error';
    lastBackup: string;
  }> {
    const response = await api.get('/api/v1/admin/system/status');
    return response.data;
  }

  // 포스트 관리 API
  async getPosts(filters?: any): Promise<{ posts: Post[], pagination: PaginationInfo }> {
    const response = await api.get('/api/v1/admin/posts', { params: filters });
    return response.data;
  }

  async getPost(postId: string): Promise<Post> {
    const response = await api.get(`/api/v1/admin/posts/${postId}`);
    return response.data;
  }

  async getAgentLogs(postId: string): Promise<AgentExecutionLog[]> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/agent-logs`);
    return response.data;
  }

  async getPipelineResult(postId: string): Promise<PipelineResult | null> {
    try {
      const response = await api.get(`/api/v1/admin/posts/${postId}/pipeline-result`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  async getAgentResults(postId: string): Promise<AgentResult[]> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/agent-results`);
    return response.data;
  }

  // 캠페인 관리 API
  async getCampaigns(filters?: any): Promise<Campaign[]> {
    const response = await api.get('/api/v1/campaigns/', { params: filters });
    return response.data.campaigns || [];
  }

  async getCampaign(campaignId: number): Promise<Campaign> {
    const response = await api.get(`/api/v1/admin/campaigns/${campaignId}`);
    return response.data;
  }

  // 병원 관리 API
  async getHospitals(): Promise<Hospital[]> {
    const response = await api.get('/api/v1/hospitals/');
    return response.data.hospitals || [];
  }

  // 에이전트 모니터링 API
  async getAgentStats() {
    const response = await api.get('/api/v1/admin/agents/stats');
    return response.data;
  }

  async getRecentAgentLogs(limit: number = 20): Promise<AgentExecutionLog[]> {
    const response = await api.get('/api/v1/admin/agents/logs', { params: { limit } });
    return response.data;
  }

  async getRecentPipelineResults(limit: number = 10): Promise<PipelineResult[]> {
    const response = await api.get('/api/v1/admin/agents/pipeline-results', { params: { limit } });
    return response.data;
  }

  // 포스트 검토 API
  async submitPostReview(postId: string, reviewData: any): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/review`, reviewData);
    return response.data;
  }
}

export class ClientApiService {
  // 대시보드 API
  async getDashboardStats() {
    const response = await api.get('/api/v1/client/dashboard/stats');
    return response.data;
  }

  async getRecentPosts(limit: number = 5): Promise<Post[]> {
    const response = await api.get('/api/v1/client/posts/recent', { params: { limit } });
    return response.data;
  }

  async getActiveCampaigns(): Promise<Campaign[]> {
    const response = await api.get('/api/v1/campaigns/', { params: { hospital_id: 137, status: 'active' } });
    return response.data.campaigns || [];
  }

  // 포스트 관리 API
  async getPosts(filters?: any): Promise<Post[]> {
    const response = await api.get('/api/v1/client/posts', { params: filters });
    return response.data;
  }

  async getPost(postId: string): Promise<Post> {
    const response = await api.get(`/api/v1/client/posts/${postId}`);
    return response.data;
  }

  async getPipelineResult(postId: string): Promise<PipelineResult | null> {
    try {
      const response = await api.get(`/api/v1/client/posts/${postId}/pipeline-result`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null;
      }
      throw error;
    }
  }

  // 자료 제공 API
  async submitMaterials(postId: string, materials: FormData): Promise<void> {
    await api.post(`/api/v1/client/posts/${postId}/materials`, materials, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }

  async getMedicalServices(): Promise<any[]> {
    const response = await api.get('/api/v1/medical-services/');
    return response.data.services || [];
  }

  async getPersonaStyles(): Promise<any[]> {
    const response = await api.get('/api/v1/persona-styles/');
    return response.data.items || [];
  }

  // 검토 API
  async submitReview(postId: string, review: any): Promise<void> {
    await api.post(`/api/v1/client/posts/${postId}/review`, review);
  }

  // 캠페인 API
  async getCampaigns(): Promise<Campaign[]> {
    const response = await api.get('/api/v1/campaigns/', { params: { hospital_id: 137 } });
    return response.data.campaigns || [];
  }

  async getCampaign(campaignId: number): Promise<Campaign> {
    const response = await api.get(`/api/v1/admin/campaigns/${campaignId}`);
    return response.data;
  }

  async getCampaignPosts(campaignId: number): Promise<any[]> {
    const response = await api.get(`/api/v1/admin/campaigns/${campaignId}/posts`);
    return response.data.posts || [];
  }

  // 포스트 상세 API
  async getPostMaterials(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/client/posts/${postId}/materials`);
    return response.data;
  }

  async getContentResults(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/client/posts/${postId}/content`);
    return response.data;
  }

  async getEvaluationResults(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/client/posts/${postId}/evaluation`);
    return response.data;
  }

  async getAgentExecutionLogs(postId: string): Promise<any[]> {
    const response = await api.get(`/api/v1/client/posts/${postId}/logs`);
    return response.data;
  }

  async getPostReviews(postId: string): Promise<any[]> {
    const response = await api.get(`/api/v1/client/posts/${postId}/reviews`);
    return response.data;
  }

  // 성과 분석 API
  async getAnalytics(period: string = 'month'): Promise<any> {
    const response = await api.get('/api/v1/client/posts/analytics', {
      params: { period }
    });
    return response.data;
  }

  // 프로필 API
  async getHospitalProfile(): Promise<Hospital> {
    const response = await api.get('/api/v1/client/profile/hospital');
    return response.data;
  }

  async getCurrentUser(): Promise<User> {
    const response = await api.get('/api/v1/client/profile/user');
    return response.data;
  }

  async updateHospitalProfile(profileData: any): Promise<void> {
    await api.put('/api/v1/client/profile/hospital', profileData);
  }

  async updateProfile(profileData: any): Promise<void> {
    await api.put('/api/v1/client/posts/profile', profileData);
  }

  // 알림 API
  async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/api/v1/client/notifications');
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<void> {
    await api.put(`/api/v1/client/notifications/${notificationId}/read`);
  }
}

// 싱글톤 인스턴스
export const adminApi = new AdminApiService();
export const clientApi = new ClientApiService();
