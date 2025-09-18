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
  PaginationInfo,
  AdminReview,
  AdminRevision,
  ClientReview,
  WorkflowLog,
  UniversalImage,
  LandingAgentPerformance,
  ContentVersion,
  AdminReviewList,
  WorkflowLogList,
  UniversalImageList,
  CompletePostingWorkflow
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
    const response = await api.get('/api/v1/admin/dashboard/system/status');
    return response.data;
  }

  async getAgentPerformance(): Promise<Array<{
    agent_type: string;
    total_executions: number;
    successful_executions: number;
    failed_executions: number;
    avg_execution_time: number;
    success_rate: number;
    last_execution: string;
  }>> {
    const response = await api.get('/api/v1/admin/dashboard/agent-performance');
    return response.data;
  }

  async getQualityMetrics(): Promise<{
    avg_seo_score: number;
    avg_legal_score: number;
    first_pass_rate: number;
    total_evaluations: number;
    quality_trend: 'improving' | 'stable' | 'declining';
  }> {
    const response = await api.get('/api/v1/admin/dashboard/quality-metrics');
    return response.data;
  }

  async getProcessingStatus(): Promise<{
    total_processing: number;
    agent_processing: number;
    admin_review: number;
    client_review: number;
    completed_today: number;
    failed_today: number;
    bottlenecks: string[];
  }> {
    const response = await api.get('/api/v1/admin/dashboard/processing-status');
    return response.data;
  }

  async getSystemAlerts(): Promise<Array<{
    id: string;
    level: 'info' | 'warning' | 'error' | 'critical';
    message: string;
    source: string;
    timestamp: string;
    resolved: boolean;
  }>> {
    const response = await api.get('/api/v1/admin/dashboard/system-alerts');
    return response.data;
  }

  async getPostWorkflow(postId: string): Promise<{
    post: {
      id: number;
      post_id: string;
      title: string;
      status: string;
      created_at: string;
      campaign_name: string;
      hospital_name: string;
    };
    workflow_steps: Array<{
      id: string;
      name: string;
      description: string;
      icon: string;
      status: 'completed' | 'in_progress' | 'pending' | 'error';
      timestamp?: string;
      details?: string;
    }>;
    current_step: string;
    progress_percentage: number;
  }> {
    const response = await api.get(`/api/v1/admin/dashboard/post-workflow/${postId}`);
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
  async getHospitals(): Promise<{ hospitals: Hospital[] }> {
    const response = await api.get('/api/v1/user/hospitals/');
    return response.data;
  }

  async getHospital(hospitalId: number): Promise<Hospital> {
    const response = await api.get(`/api/v1/user/hospitals/${hospitalId}`);
    return response.data;
  }

  async getHospitalAdmin(hospitalId: number): Promise<{username: string} | null> {
    try {
      const response = await api.get(`/api/v1/user/hospitals/${hospitalId}/admin`);
      return response.data.admin || null;
    } catch (error) {
      return null;
    }
  }

  // 캠페인 및 포스트 일정 데이터 API
  async getHospitalCalendarData(hospitalId: number): Promise<{
    campaigns: any[];
    posts: any[];
  }> {
    const response = await api.get(`/api/v1/admin/campaigns/by-hospital/${hospitalId}`);
    return response.data;
  }

  // 작업 대기 포스트 목록 API
  async getWaitingTasks(hospitalId?: number, limit: number = 10): Promise<{
    waiting_tasks: any[];
    total_count: number;
  }> {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospital_id', hospitalId.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/api/v1/admin/posts/waiting-tasks?${params}`);
    return response.data;
  }

  // 칸반 포스트 목록 API
  async getKanbanPosts(hospitalId: number): Promise<{
    material_completed: any[];
    admin_pre_review: any[];
    ai_completed: any[];
    admin_review: any[];
    client_review: any[];
    publish_scheduled: any[];
    material_delay: any[];
    ai_failed: any[];
    client_delay: any[];
    aborted: any[];
  }> {
    const response = await api.get(`/api/v1/admin/posts/kanban/${hospitalId}`);
    return response.data;
  }

  // 상태별 포스트 목록 API (하단 컨테이너용)
  async getPostsByStatus(hospitalId: number): Promise<{
    publish_scheduled: any[];
    published: any[];
    monitoring: any[];
    monitoring_issue: any[];
  }> {
    const response = await api.get(`/api/v1/admin/posts/status/${hospitalId}`);
    return response.data;
  }

  // 포스팅 작업용 포스트 상세 정보 API
  async getPostsForPostingWork(hospitalId: number): Promise<any[]> {
    const response = await api.get(`/api/v1/blog-posts?hospital_id=${hospitalId}&limit=50`);
    console.log('API Response:', response);
    console.log('API Response Data:', response.data);
    console.log('API Response Data Items:', response.data?.items);

    // response.data가 직접 배열인 경우 처리
    if (Array.isArray(response.data)) {
      console.log('Response data is array:', response.data);
      return response.data;
    }

    // response.data.items가 있는 경우
    if (response.data?.items && Array.isArray(response.data.items)) {
      console.log('Response data has items array:', response.data.items);
      return response.data.items;
    }

    console.log('No valid data found, returning empty array');
    return [];
  }

  // 포스트 상태 업데이트 API
  async updatePostStatus(postId: string, status: string, notes?: string): Promise<any> {
    const response = await api.put(`/api/v1/admin/posts/${postId}/status`, {
      status,
      notes
    });
    return response.data;
  }

  // 포스트 자료 상태 업데이트 API
  async updatePostMaterialsStatus(postId: string, status: string): Promise<any> {
    const response = await api.put(`/api/v1/admin/posts/${postId}/materials/status`, {
      status
    });
    return response.data;
  }

  // AI 에이전트 실행 API
  async executeAIAgent(postId: string, agentType: string): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/agents/${agentType}/execute`);
    return response.data;
  }

  // 포스트 키워드 가이드 업데이트 API
  async updatePostKeywordsGuide(postId: number, guideData: any): Promise<any> {
    const response = await api.put(`/api/v1/admin/posts/${postId}/keywords-guide`, guideData);
    return response.data;
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

  // 통합 대시보드 API (권장)
  async getDashboardData(): Promise<{
    stats: any;
    activities: any[];
    system_status: any;
    agent_performance: any[];
    quality_metrics: any;
    processing_status: any;
    alerts: any[];
    hospitals: any[];
    agent_logs: any[];
    posts_by_status: any;
  }> {
    const response = await api.get('/api/v1/admin/dashboard');
    return response.data;
  }

  // 포스트 검토 API
  async submitPostReview(postId: string, reviewData: any): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/review`, reviewData);
    return response.data;
  }


  async getCampaignPosts(campaignId: number): Promise<any[]> {
    const response = await api.get(`/api/v1/admin/campaigns/${campaignId}/posts`);
    return response.data.posts || [];
  }

  // 새로운 대시보드 API들

  // 알림 관리 API
  async getAdminNotifications(skip: number = 0, limit: number = 50, isRead?: boolean): Promise<Notification[]> {
    const params: any = { skip, limit };
    if (isRead !== undefined) params.is_read = isRead;

    const response = await api.get('/api/v1/admin/notifications', { params });
    return response.data.notifications || [];
  }

  async getUnreadNotificationCount(): Promise<number> {
    const response = await api.get('/api/v1/admin/notifications/unread-count');
    return response.data.unread_count || 0;
  }

  async markAdminNotificationAsRead(notificationId: number): Promise<Notification> {
    const response = await api.put(`/api/v1/admin/notifications/${notificationId}/read`);
    return response.data;
  }

  async markAllAdminNotificationsAsRead(): Promise<{ updated_count: number }> {
    const response = await api.put('/api/v1/admin/notifications/mark-all-read');
    return response.data;
  }

  // 워크플로우 로그 관리 API
  async getWorkflowLogs(params?: {
    skip?: number;
    limit?: number;
    post_id?: string;
    action_type?: string;
    action_by?: number;
  }): Promise<WorkflowLogList> {
    const response = await api.get('/api/v1/admin/workflows', { params });
    return response.data;
  }

  async getWorkflowStats(): Promise<{
    total_logs_30d: number;
    action_type_stats: Record<string, number>;
    user_stats: Record<string, number>;
  }> {
    const response = await api.get('/api/v1/admin/workflows/stats/overview');
    return response.data;
  }

  async getRecentWorkflowActivity(limit: number = 20): Promise<Array<{
    id: string;
    type: string;
    action: string;
    post_id: string;
    action_by: number;
    notes?: string;
    timestamp: string;
  }>> {
    const response = await api.get('/api/v1/admin/workflows/recent-activity', {
      params: { limit }
    });
    return response.data;
  }

  async getPostWorkflowHistory(postId: string): Promise<WorkflowLog[]> {
    const response = await api.get(`/api/v1/admin/workflows/post/${postId}/history`);
    return response.data;
  }

  // 관리자 검토 API
  async getAdminReviews(params?: {
    skip?: number;
    limit?: number;
    post_id?: string;
    reviewer_id?: number;
    review_status?: string;
  }): Promise<AdminReviewList> {
    const response = await api.get('/api/v1/admin/reviews', { params });
    return response.data;
  }

  async getAdminReview(reviewId: number): Promise<AdminReview> {
    const response = await api.get(`/api/v1/admin/reviews/${reviewId}`);
    return response.data;
  }

  async createAdminReview(reviewData: {
    post_id: string;
    reviewer_id: number;
    review_status: string;
    review_notes?: string;
    revision_instructions?: string;
    edit_request_id?: number;
  }): Promise<AdminReview> {
    const response = await api.post('/api/v1/admin/reviews', reviewData);
    return response.data;
  }

  async updateAdminReview(reviewId: number, updateData: Partial<AdminReview>): Promise<AdminReview> {
    const response = await api.put(`/api/v1/admin/reviews/${reviewId}`, updateData);
    return response.data;
  }

  // 범용 이미지 관리 API
  async getUniversalImages(params?: {
    skip?: number;
    limit?: number;
    entity_type?: string;
    entity_id?: number;
    image_type?: string;
  }): Promise<UniversalImageList> {
    const response = await api.get('/api/v1/admin/images', { params });
    return response.data;
  }

  async getUniversalImage(imageId: number): Promise<UniversalImage> {
    const response = await api.get(`/api/v1/admin/images/${imageId}`);
    return response.data;
  }

  async createUniversalImage(imageData: Partial<UniversalImage>): Promise<UniversalImage> {
    const response = await api.post('/api/v1/admin/images', imageData);
    return response.data;
  }

  async updateUniversalImage(imageId: number, updateData: Partial<UniversalImage>): Promise<UniversalImage> {
    const response = await api.put(`/api/v1/admin/images/${imageId}`, updateData);
    return response.data;
  }

  async deleteUniversalImage(imageId: number): Promise<void> {
    await api.delete(`/api/v1/admin/images/${imageId}`);
  }

  // 콘텐츠 버전 관리 API
  async getContentVersions(params?: {
    skip?: number;
    limit?: number;
    post_id?: string;
  }): Promise<ContentVersion[]> {
    const response = await api.get('/api/v1/admin/content-versions', { params });
    return response.data.versions || [];
  }

  async getContentVersion(versionId: number): Promise<ContentVersion> {
    const response = await api.get(`/api/v1/admin/content-versions/${versionId}`);
    return response.data;
  }

  async createContentVersion(versionData: Partial<ContentVersion>): Promise<ContentVersion> {
    const response = await api.post('/api/v1/admin/content-versions', versionData);
    return response.data;
  }

  // 통합 포스팅 작업 워크플로우 데이터 조회
  async getCompletePostingWorkflow(postId: string): Promise<CompletePostingWorkflow> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/complete-workflow`);
    return response.data;
  }

  // 가이드 입력 데이터 조회 (우측 패널용)
  async getGuideInput(postId: string): Promise<{
    persona_selection: { persona_style_id?: string; persona_name: string; persona_description: string };
    persona_options: Array<{
      id: string;
      persona_name: string;
      persona_description: string;
      persona_type: string;
      priority: number;
    }>;
    emoji_options: Array<{
      value: number;
      name: string;
      emoji_usage_guide: string;
      description?: string;
    }>;
    keywords_guide: {
      region_keywords: string[];
      hospital_keywords: string[];
      symptom_keywords: string[];
      procedure_keywords: string[];
      treatment_keywords: string[];
      target_keywords: string[];
      writing_guide: string;
      is_completed: boolean;
      emoji_level_value: number;
    };
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/guide-input`);
    return response.data; // 백엔드에서 이미 camelCase로 반환됨
  }

  // 가이드 제공 관련 API
  async updateKeywordsGuide(postId: string, keywordsGuide: any) {
    const response = await api.put(`/api/v1/admin/posts/${postId}/keywords-guide`, keywordsGuide);
    return response.data;
  }

  async updatePersona(postId: string, persona: any) {
    const response = await api.put(`/api/v1/admin/posts/${postId}/persona`, persona);
    return response.data;
  }

  async updateEmojiLevel(postId: string, emojiLevel: number) {
    const response = await api.put(`/api/v1/admin/posts/${postId}/emoji-level`, { emoji_level_value: emojiLevel });
    return response.data;
  }

  // AI 파이프라인 실행
  async executeAIPipeline(postId: string): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/pipeline/execute`);
    return response.data;
  }

  // 포스트 콘텐츠 업데이트
  async updatePostContent(postId: string, contentData: any): Promise<any> {
    const response = await api.put(`/api/v1/admin/posts/${postId}/content`, contentData);
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

  async getPostsStatusSummary(): Promise<{
    status_summary: Record<string, number>;
    materials_needed: Array<{
      id: number;
      post_id: string;
      title: string;
      status: string;
      created_at: string;
      campaign_name: string;
      material_status: string;
    }>;
    review_needed: Array<{
      id: number;
      post_id: string;
      title: string;
      status: string;
      created_at: string;
      quality_score: number;
      seo_score: number;
      legal_score: number;
      campaign_name: string;
    }>;
    recent_published: Array<{
      id: number;
      post_id: string;
      title: string;
      status: string;
      publish_date: string;
      created_at: string;
      quality_score: number;
      campaign_name: string;
    }>;
  }> {
    const response = await api.get('/api/v1/client/dashboard/posts-status-summary');
    return response.data;
  }

  async getCampaignsWithPosts(): Promise<Array<{
    campaign: {
      id: number;
      name: string;
      description: string;
      start_date: string;
      end_date: string;
      target_post_count: number;
      status: string;
      total_posts: number;
      completed_posts: number;
      review_pending: number;
      materials_needed: number;
      progress: number;
    };
    posts: Array<{
      id: number;
      post_id: string;
      title: string;
      status: string;
      created_at: string;
      quality_score: number;
      seo_score: number;
      legal_score: number;
      material_status: string;
    }>;
  }>> {
    const response = await api.get('/api/v1/client/dashboard/campaigns-with-posts');
    return response.data;
  }

  async getActionRequiredPosts(): Promise<{
    urgent_materials: Array<{
      id: number;
      post_id: string;
      title: string;
      created_at: string;
      campaign_name: string;
      days_since_creation: number;
    }>;
    old_reviews: Array<{
      id: number;
      post_id: string;
      title: string;
      created_at: string;
      pipeline_completed_at: string;
      campaign_name: string;
      days_waiting: number;
    }>;
  }> {
    const response = await api.get('/api/v1/client/dashboard/action-required');
    return response.data;
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

  async getPersonaStyles(params?: {
    medical_service_id?: number;
    is_active?: boolean;
    sort_by?: string;
    sort_order?: string;
  }): Promise<any[]> {
    const queryParams = new URLSearchParams();
    if (params?.medical_service_id) queryParams.append('medical_service_id', params.medical_service_id.toString());
    if (params?.is_active !== undefined) queryParams.append('is_active', params.is_active.toString());
    if (params?.sort_by) queryParams.append('sort_by', params.sort_by);
    if (params?.sort_order) queryParams.append('sort_order', params.sort_order);

    const url = `/api/v1/persona-styles/${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    const response = await api.get(url);
    return response.data.items || [];
  }

  // 검토 API
  async submitReview(postId: string, review: any): Promise<void> {
    await api.post(`/api/v1/client/posts/${postId}/review`, review);
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

  async getPostReviews(postId: string): Promise<ClientReview[]> {
    const response = await api.get(`/api/v1/client/posts/${postId}/reviews`);
    return response.data;
  }

  // 클라이언트 검토 관리 API
  async createClientReview(reviewData: {
    post_id: string;
    review_status: string;
    review_notes?: string;
    revision_instructions?: string;
    edit_request_id?: number;
  }): Promise<ClientReview> {
    const response = await api.post('/api/v1/client/reviews', reviewData);
    return response.data;
  }

  async updateClientReview(reviewId: number, updateData: Partial<ClientReview>): Promise<ClientReview> {
    const response = await api.put(`/api/v1/client/reviews/${reviewId}`, updateData);
    return response.data;
  }

  // 워크플로우 조회 API
  async getPostWorkflowLogs(postId: string): Promise<WorkflowLog[]> {
    const response = await api.get(`/api/v1/client/posts/${postId}/workflows`);
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
