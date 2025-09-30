/**
 * API 서비스 클래스들
 */

import api from '@/lib/api';
import config from '@/lib/config';
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
    hospital_name?: string;
    agent_type?: string;
    old_status?: string;
    new_status?: string;
    changed_by?: string;
    scheduled_date?: string;
  }>> {
    const response = await api.get('/api/v1/admin/dashboard/activities', { timeout: 60000 });
    return response.data;
  }

  // 긴급 처리 관련 API 메소드들
  async getSystemErrors(hospitalId?: number): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      message: string;
      timestamp: string;
      severity: string;
    }>;
    total: number;
  }> {
    const params = hospitalId ? { hospital_id: hospitalId } : {};
    const response = await api.get('/api/v1/admin/dashboard/system-errors', { params });
    return response.data;
  }

  async getFailedAgentJobs(hospitalId?: number): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      agent_type: string;
      post_id: string;
      error_message: string;
      timestamp: string;
      retry_count: number;
    }>;
    total: number;
  }> {
    const params = hospitalId ? { hospital_id: hospitalId } : {};
    const response = await api.get('/api/v1/admin/dashboard/failed-agent-jobs', { params });
    return response.data;
  }

  async getDelayedScheduleJobs(hospitalId?: number): Promise<{
    success: boolean;
    data: Array<{
      id: string;
      post_id: string;
      hospital_id: number;
      hospital_name: string;
      urgent_stage: string;
      delay_days: number;
      scheduled_date: string;
      deadline: string;
      post_title: string;
    }>;
    total: number;
  }> {
    const params = hospitalId ? { hospital_id: hospitalId } : {};
    const response = await api.get('/api/v1/admin/dashboard/delayed-schedule-jobs', { params });
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

  async getCalendarSchedule(year: number, month: number): Promise<{
    date: string;
    scheduled_count: number;
    published_count: number;
    failed_count: number;
    posts: Array<{
      post_id: string;
      title: string;
      hospital_name: string;
      status: string;
      scheduled_date: string;
      publish_date?: string;
    }>;
  }[]> {
    const response = await api.get(`/api/v1/admin/dashboard/calendar/${year}/${month}`);
    return response.data;
  }

  async getHospitalStats(hospitalId: number): Promise<{
    urgent_count: number;
    campaign_progress: number;
    total_views: number;
    total_likes: number;
    recent_activities: Array<{
      description: string;
      time: string;
    }>;
  }> {
    const response = await api.get(`/api/v1/admin/dashboard/hospitals/${hospitalId}/stats`);
    return response.data;
  }

  async planCampaignSchedule(campaignId: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.post(`/api/v1/admin/schedules/campaigns/${campaignId}/plan`);
    return response.data;
  }

  async updatePostPriority(postId: string, priority: number): Promise<{
    success: boolean;
    message: string;
  }> {
    const response = await api.patch(`/api/v1/admin/posts/${postId}/priority`, { priority });
    return response.data;
  }

  async updatePostSchedule(postId: string, scheduleData: any): Promise<{
    success: boolean;
    data: any;
  }> {
    const response = await api.patch(`/api/v1/admin/posts/${postId}/schedule`, scheduleData);
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

  async getStatusMonitor(): Promise<{
    campaign_operation: {
      total_campaigns: number;
      active_campaigns: number;
      completed_campaigns: number;
    };
    posting_creation: {
      created_today: number;
      created_this_week: number;
    };
    posting_publish: {
      published_today: number;
      published_this_week: number;
    };
    performance_monitoring: {
      published_posts: number;
      in_review_posts: number;
      processing_posts: number;
      total_posts: number;
    };
  }> {
    const response = await api.get('/api/v1/admin/dashboard/status-monitor', { timeout: 60000 });
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

  async getAgentResult(postId: string, agentType: string): Promise<any> {
    const response = await api.get(`/api/v1/blog-posts/${postId}/agent-result/${agentType}`);
    return response.data;
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
    const response = await api.get(`/api/v1/campaigns/${campaignId}`);
    return response.data;
  }

  async createCampaign(campaignData: any): Promise<Campaign> {
    const response = await api.post('/api/v1/campaigns/', campaignData);
    return response.data;
  }

  async generatePosts(campaignId: number, postData: any): Promise<any> {
    const response = await api.post(`/api/v1/campaigns/${campaignId}/generate-posts`, postData);
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


  async getHospitalMedicalServices(hospitalId: number): Promise<any[]> {
    const response = await api.get(`/api/v1/user/hospital-services/hospitals/${hospitalId}/medical-services`);
    return response.data || [];
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
  async getWaitingTasks(hospitalId?: number, campaignId?: number, limit: number = 10): Promise<{
    waiting_tasks: any[];
    total_count: number;
  }> {
    const params = new URLSearchParams();
    if (hospitalId) params.append('hospital_id', hospitalId.toString());
    if (campaignId) params.append('campaign_id', campaignId.toString());
    params.append('limit', limit.toString());

    const response = await api.get(`/api/v1/admin/posts/waiting-tasks?${params}`);
    return response.data;
  }

  // 칸반 포스트 목록 API
  async getKanbanPosts(hospitalId: number, campaignId?: number): Promise<{
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
    const params = new URLSearchParams();
    if (campaignId) params.append('campaign_id', campaignId.toString());
    const queryString = params.toString();
    const url = queryString ? `/api/v1/admin/posts/kanban/${hospitalId}?${queryString}` : `/api/v1/admin/posts/kanban/${hospitalId}`;

    const response = await api.get(url);
    return response.data;
  }

  // 상태별 포스트 목록 API (하단 컨테이너용)
  async getPostsByStatus(hospitalId: number, campaignId?: number): Promise<{
    publish_scheduled: any[];
    published: any[];
    monitoring: any[];
    monitoring_issue: any[];
  }> {
    const params = new URLSearchParams();
    if (campaignId) params.append('campaign_id', campaignId.toString());
    const queryString = params.toString();
    const url = queryString ? `/api/v1/admin/posts/status/${hospitalId}?${queryString}` : `/api/v1/admin/posts/status/${hospitalId}`;

    const response = await api.get(url);
    return response.data;
  }

  // 포스팅 작업용 포스트 상세 정보 API
  async getPostsForPostingWork(hospitalId: number, campaignId?: number): Promise<any[]> {
    try {
      const params = new URLSearchParams();
      params.append('hospital_id', hospitalId.toString());
      if (campaignId) params.append('campaign_id', campaignId.toString());
      params.append('limit', '50');

      const response = await api.get(`/api/v1/blog-posts/?${params}`);
      console.log('API Response:', response);
      console.log('API Response Data:', response.data);
      console.log('API Response Data Items:', response.data?.items);

      // BlogPostListResponse 형식: { items: [], total, page, size, pages }
      if (response.data?.items && Array.isArray(response.data.items)) {
        console.log('Response data items is array:', response.data.items);
        return response.data.items;
      }

      console.log('No valid data found, returning empty array');
      return [];
    } catch (error) {
      console.error('포스트 로드 실패:', error);
      throw error;
    }
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

  // 파이프라인 상태 조회 API
  async getPipelineStatus(postId: string): Promise<{
    post_id: string;
    current_status: string;
    is_running: boolean;
    is_completed: boolean;
    last_execution: any;
    executions: Array<{
      pipeline_id: string;
      status: string;
      started_at: string;
      completed_at: string;
      quality_score: number;
      improvement_rate: number;
      total_iterations: number;
      successful_agents: number;
      total_agents: number;
    }>;
    total_executions: number;
  }> {
    const response = await api.get(`/api/v1/blog-posts/${postId}/pipeline-status`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
    return response.data;
  }

  // 파이프라인 실행 정보 조회 API
  async getPipelineExecutionInfo(postId: string): Promise<{
    post_id: string;
    total_executions: number;
    last_execution: {
      pipeline_id: string;
      execution_result: string;
      execution_time: string;
    } | null;
  }> {
    const response = await api.get(`/api/v1/blog-posts/${postId}/pipeline-execution-info`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
    return response.data;
  }

  // 파이프라인 생성 제어 API (시작/중단/재시작)
  async controlGeneration(postId: string, action: 'start' | 'stop' | 'restart' | 'regenerate', parameters?: any): Promise<{
    success: boolean;
    message: string;
    pipeline_id?: string;
    status?: string;
  }> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/generation-control`, {
      action,
      parameters: parameters || {}
    }, {
      timeout: 120000 // 2분 타임아웃 (파이프라인 초기화용)
    });
    return response.data;
  }

  // 파이프라인 터미널 로그 조회 API
  async getPipelineTerminalLogs(postId: string, pipelineId: string): Promise<{
    post_id: string;
    pipeline_id: string;
    logs: Array<{
      id: number;
      timestamp: string;
      level: string;
      logger: string;
      message: string;
      elapsed_seconds: number;
      module: string;
      function: string;
      line: number;
      agent_type: string;
      execution_id: string;
      log_metadata: any;
    }>;
    total_count: number;
  }> {
    const response = await api.get(`/api/v1/blog-posts/${postId}/pipeline-logs/${pipelineId}`);
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
    status_monitor: any;
  }> {
    const response = await api.get('/api/v1/admin/dashboard', { timeout: 60000 }); // 60초 타임아웃
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
    const response = await api.get(`/api/v1/admin/posts/${postId}/complete-workflow`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
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
    const response = await api.get(`/api/v1/admin/posts/${postId}/guide-input`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
    return response.data; // 백엔드에서 이미 camelCase로 반환됨
  }

  // 가이드 제공 관련 API
  async updateKeywordsGuide(postId: string, keywordsGuide: any) {
    console.log('API 호출: updateKeywordsGuide', { postId, keywordsGuide });
    const response = await api.put(`/api/v1/admin/posts/${postId}/keywords-guide`, keywordsGuide);
    console.log('API 응답:', response.data);
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

  // AI 생성 관련 API
  async getGenerationPreview(postId: string): Promise<{
    post_id: string;
    input_data_summary: {
      has_hospital_info: boolean;
      has_treatment_info: boolean;
      has_medical_service_info: boolean;
      has_post_materials: boolean;
      has_keywords_guide: boolean;
      has_clinical_context: boolean;
      hospital_images_count: number;
      post_images_count: number;
      cache_hit: boolean;
    };
    agent_sequence: Array<{
      step: number;
      agent_type: string;
      name: string;
      description: string;
      estimated_duration: number;
    }>;
    prompts_preview: Record<string, any>;
    checklists_preview: Array<{
      name: string;
      version: string;
      category: string;
      description?: string;
      items_count?: number;
      items: Array<{
        id: string;
        name: string;
        description?: string;
        weight: number;
      }>;
      performance_score?: number;
      success_rate?: number;
    }>;
    model_settings: {
      primary_model: string;
      fallback_model: string;
      temperature: number;
      max_output_tokens: number;
      top_p: number;
      agent_configs?: Array<{
        agent_type: string;
        model: string;
        temperature: number;
        max_tokens: number;
      }>;
    };
    estimated_duration: number;
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/generation-preview`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
    return response.data;
  }

  async getPostInputData(postId: string): Promise<{
    hospital_info: any;
    treatment_info: any;
    medical_service_info: any;
    post_materials: any;
    keywords_guide: any;
    clinical_context: string;
    universal_images: {
      hospital_images_count: number;
      post_images_count: number;
    };
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/input-data`);
    return response.data;
  }

  async getChecklistDetails(postId: string, checklistName: string): Promise<{
    name: string;
    version: string;
    category: string;
    description: string;
    checklist_items: Array<{
      id: string;
      name: string;
      description?: string;
      weight: number;
    }>;
    performance_score?: number;
    success_rate?: number;
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/checklist/${encodeURIComponent(checklistName)}`);
    return response.data;
  }

  async getPromptDetails(postId: string, category: string): Promise<{
    category: string;
    description: string;
    prompt_text: string;
    version: string;
    is_active: boolean;
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/prompt/${category}`);
    return response.data;
  }


  async getGenerationResults(postId: string): Promise<{
    post_id: string;
    pipeline_id: string; // 파이프라인 ID 추가
    overall_status: string;
    total_duration: number;
    successful_agents: number;
    total_agents: number;
    agent_results: Array<{
      agent_type: string;
      status: string;
      duration?: number;
      result_count: number;
      has_content: boolean;
    }>;
    final_content?: {
      title?: string;
      content?: string;
      html_content?: string;
      markdown_content?: string;
    };
    evaluation_scores?: {
      seo_score?: number;
      legal_score?: number;
      medical_score?: number;
      overall_score?: number;
    };
    created_at: string;
  }> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/generation-results`, {
      timeout: 120000 // 2분 타임아웃 (대량 데이터 처리용)
    });
    return response.data;
  }

  // 플랫폼 관리 API 메소드들
  async getPlatformTypes(): Promise<any> {
    const response = await api.get('/api/v1/admin/platforms/types');
    return response.data;
  }

  async getPlatforms(params?: {
    hospital_id?: number;
    platform_type?: string;
    is_active?: boolean;
    skip?: number;
    limit?: number;
  }): Promise<any> {
    const response = await api.get('/api/v1/admin/platforms/', { params });
    return response.data;
  }

  async createPlatform(platformData: any): Promise<any> {
    const response = await api.post('/api/v1/admin/platforms/', platformData);
    return response.data;
  }

  async updatePlatform(platformId: number, platformData: any): Promise<any> {
    const response = await api.put(`/api/v1/admin/platforms/${platformId}`, platformData);
    return response.data;
  }

  async deletePlatform(platformId: number): Promise<void> {
    await api.delete(`/api/v1/admin/platforms/${platformId}`);
  }

  // 포스트 플랫폼 매핑 API 메소드들
  async getPostPlatforms(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/admin/posts/${postId}/platforms`);
    return response.data;
  }

  async assignPlatformToPost(postId: string, platformData: any): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/platforms`, platformData);
    return response.data;
  }

  async bulkAssignPlatformsToPost(postId: string, platformIds: number[]): Promise<any> {
    const response = await api.post(`/api/v1/admin/posts/${postId}/platforms/bulk`, {
      post_id: postId,
      platform_ids: platformIds
    });
    return response.data;
  }

  async updatePostPlatformStatus(
    postId: string,
    platformId: number,
    statusData: any
  ): Promise<any> {
    const response = await api.put(`/api/v1/admin/posts/${postId}/platforms/${platformId}/status`, statusData);
    return response.data;
  }

  async removePlatformFromPost(postId: string, platformId: number): Promise<void> {
    await api.delete(`/api/v1/admin/posts/${postId}/platforms/${platformId}`);
  }

  // 병원 관리 API 메소드들
  async updateHospital(hospitalId: number, hospitalData: any): Promise<any> {
    const response = await api.put(`/api/v1/admin/hospitals/${hospitalId}`, hospitalData);
    return response.data;
  }

  async getHospitalDetail(hospitalId: number): Promise<any> {
    const response = await api.get(`/api/v1/admin/hospitals/${hospitalId}`);
    return response.data;
  }

  // 글로벌 포스트 관리 API
  async getGlobalPosts(params?: any): Promise<any> {
    const response = await api.get('/api/v1/admin/posts/global', { params });
    return response.data;
  }

  async bulkUpdatePosts(request: {
    post_ids: string[];
    action: 'status_change' | 'priority_update' | 'campaign_assign';
    new_status?: string;
    priority?: number;
    campaign_id?: number;
    reason?: string;
  }): Promise<any> {
    const response = await api.post('/api/v1/admin/posts/bulk-update', request);
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
      start_date: string | null;
      end_date: string | null;
      target_post_count: number;
      status: string;
      created_at: string;
      total_posts: number;
      category_counts: Record<string, number>;
    };
    posts_by_category: Record<string, {
      category_name: string;
      description: string;
      count: number;
      action_required: boolean;
      action_type: string | null;
      posts: Array<{
        id: number;
        post_id: string;
        title: string;
        status: string;
        status_category: {
          category: string;
          category_name: string;
          description: string;
          action_required: boolean;
          action_type: string | null;
        };
        created_at: string;
        updated_at: string;
      }>;
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
    // user_id를 기본적으로 추가 (실제로는 인증된 사용자 ID를 사용해야 함)
    const params = { ...filters, user_id: 13 };
    const response = await api.get('/api/v1/client/posts', { params });
    return response.data;
  }

          async getSPTKeywords(postId: string): Promise<{
            post_id: string;
            medical_service_id: number;
            treatments: string[];
            symptoms: string[];
            procedures: string[];
          }> {
            const response = await api.get('/api/v1/client/posts/spt', {
              params: { post_id: postId }
            });
            return response.data;
          }

          async submitSPTInfo(postId: string, sptData: {
            selected_treatment: string;
            selected_symptom: string;
            selected_procedure: string;
          }): Promise<any> {
            const formData = new FormData();
            formData.append('selected_treatment', sptData.selected_treatment);
            formData.append('selected_symptom', sptData.selected_symptom);
            formData.append('selected_procedure', sptData.selected_procedure);

            const response = await api.post(`/api/v1/client/posts/${postId}/spt`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            });
            return response.data;
          }

  // EMR 관련 API
  async searchEMRPatients(query: string, searchType: 'name' | 'id' | 'phone' = 'name'): Promise<any[]> {
    const response = await api.get('/api/v1/client/emr/patients/search', {
      params: { q: query, search_type: searchType }
    });
    return response.data;
  }

  async getEMRPatientDetail(patientId: string): Promise<any> {
    const response = await api.get(`/api/v1/client/emr/patients/${patientId}`);
    return response.data;
  }

  async getEMRPatientTreatments(patientId: string): Promise<any[]> {
    const response = await api.get(`/api/v1/client/emr/patients/${patientId}/treatments`);
    return response.data;
  }

  async getEMRTreatmentImages(treatmentId: number): Promise<any[]> {
    const response = await api.get(`/api/v1/client/emr/treatments/${treatmentId}/images`);
    return response.data;
  }

  async getPost(postId: string): Promise<Post> {
    // user_id를 쿼리 파라미터로 추가 (실제로는 인증된 사용자 ID를 사용해야 함)
    const params = { user_id: 13 };
    const response = await api.get(`/api/v1/client/posts/${postId}`, { params });
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


  // 일정 관리 API
  async planCampaignSchedule(campaignId: number, settings?: any): Promise<any> {
    const response = await api.post(`/api/v1/admin/schedules/campaigns/${campaignId}/plan`, {
      use_template: true,
      custom_settings: settings
    });
    return response.data;
  }

  async getCampaignScheduleOverview(campaignId: number): Promise<any> {
    const response = await api.get(`/api/v1/admin/schedules/campaigns/${campaignId}/overview`);
    return response.data;
  }

  async getPostSchedule(postId: string): Promise<any> {
    const response = await api.get(`/api/v1/admin/schedules/posts/${postId}`);
    return response.data;
  }

  async updatePostSchedule(postId: string, scheduleData: any): Promise<any> {
    const response = await api.put(`/api/v1/admin/schedules/posts/${postId}`, scheduleData);
    return response.data;
  }

  async updatePostPriority(postId: string, priorityData: {
    priority: number;
    reason: string;
  }): Promise<any> {
    const response = await api.put(`/api/v1/admin/schedules/posts/${postId}/priority`, priorityData);
    return response.data;
  }

  async getPendingNotifications(status: string = 'pending', limit: number = 20): Promise<any> {
    const response = await api.get('/api/v1/admin/schedules/notifications', {
      params: { status, limit }
    });
    return response.data;
  }

  async acknowledgeNotification(notificationId: number): Promise<void> {
    await api.post(`/api/v1/admin/schedules/notifications/${notificationId}/acknowledge`);
  }

  async getScheduleHistory(postId: string, page: number = 1, limit: number = 10): Promise<any> {
    const response = await api.get(`/api/v1/admin/schedules/posts/${postId}/history`, {
      params: { page, limit }
    });
    return response.data;
  }

  async runScheduleMonitoring(): Promise<any> {
    const response = await api.post('/api/v1/admin/schedules/monitor');
    return response.data;
  }

  async runScheduleMaintenance(): Promise<any> {
    const response = await api.post('/api/v1/admin/schedules/maintenance');
    return response.data;
  }

  async getCampaignPriorityDistribution(campaignId: number): Promise<any> {
    const response = await api.get(`/api/v1/admin/schedules/campaigns/${campaignId}/priority/distribution`);
    return response.data;
  }

  // 긴급 처리 필요 데이터 API들 - 클래식 메소드 방식
  async getSystemErrors(): Promise<any> {
    console.log('getSystemErrors 메소드 호출됨');
    const response = await api.get('/api/v1/admin/dashboard/system-errors');
    console.log('getSystemErrors 응답:', response.data);
    return response.data;
  }

  async getFailedAgentJobs(): Promise<any> {
    console.log('getFailedAgentJobs 메소드 호출됨');
    const response = await api.get('/api/v1/admin/dashboard/failed-agent-jobs');
    console.log('getFailedAgentJobs 응답:', response.data);
    return response.data;
  }

  async getDelayedScheduleJobs(): Promise<any> {
    console.log('getDelayedScheduleJobs 메소드 호출됨');
    const response = await api.get('/api/v1/admin/dashboard/delayed-schedule-jobs');
    console.log('getDelayedScheduleJobs 응답:', response.data);
    return response.data;
  }

  // 알림 관리 API
  async createNotification(data: {
    user_id?: number;
    post_id?: string;
    notification_type: string;
    message: string;
    is_read?: boolean;
  }): Promise<any> {
    const response = await api.post('/api/v1/admin/notifications/', data);
    return response.data;
  }

  async getNotifications(params?: {
    skip?: number;
    limit?: number;
    is_read?: boolean;
    user_id?: number;
    post_id?: string;
    notification_type?: string;
  }): Promise<any> {
    const response = await api.get('/api/v1/admin/notifications/', { params });
    return response.data;
  }

  async markNotificationAsRead(notificationId: number): Promise<any> {
    const response = await api.put(`/api/v1/admin/notifications/${notificationId}/read`);
    return response.data;
  }

  async getUnreadCount(): Promise<{ unread_count: number }> {
    const response = await api.get('/api/v1/admin/notifications/unread-count');
    return response.data;
  }
}

// 긴급 처리 필요 API 함수들은 AdminApiService 클래스에 통합됨

// 싱글톤 인스턴스
export const adminApi: AdminApiService = new AdminApiService();

// 인스턴스에 직접 메소드 추가
(adminApi as any).createNotification = async function(data: {
  user_id?: number;
  post_id?: string;
  notification_type: string;
  message: string;
  is_read?: boolean;
}): Promise<any> {
  const response = await api.post('/api/v1/admin/notifications/', data);
  return response.data;
};

(adminApi as any).getNotifications = async function(params?: {
  skip?: number;
  limit?: number;
  is_read?: boolean;
  user_id?: number;
  post_id?: string;
  notification_type?: string;
}): Promise<any> {
  const response = await api.get('/api/v1/admin/notifications/', { params });
  return response.data;
};

(adminApi as any).markNotificationAsRead = async function(notificationId: number): Promise<any> {
  const response = await api.put(`/api/v1/admin/notifications/${notificationId}/read`);
  return response.data;
};

(adminApi as any).getUnreadCount = async function(): Promise<{ unread_count: number }> {
  const response = await api.get('/api/v1/admin/notifications/unread-count');
  return response.data;
};

// 디버깅: adminApi에 새로운 메소드가 제대로 추가되었는지 확인
if (typeof window !== 'undefined') {
  console.log('adminApi 메소드들:', Object.getOwnPropertyNames(adminApi));
  console.log('getLatestPipelineResult 존재:', adminApi.hasOwnProperty('getLatestPipelineResult'));
  console.log('createNotification 존재:', adminApi.hasOwnProperty('createNotification'));
  console.log('getNotifications 존재:', adminApi.hasOwnProperty('getNotifications'));
  console.log('markNotificationAsRead 존재:', adminApi.hasOwnProperty('markNotificationAsRead'));
}
export const clientApi = new ClientApiService();


