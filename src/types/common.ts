/**
 * 공통 타입 정의
 */

export interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'client' | 'hospital';
  hospital_id?: number;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Hospital {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  is_active: boolean;
  address_keywords?: string[];
  hospital_keywords?: string[];
  business_card_image?: string;
  logo_image?: string;
  map_link?: string;
  created_at: string;
  updated_at?: string;
  active_campaigns?: number; // 활성 캠페인 개수
}

export interface Campaign {
  id: number;
  name: string;
  description?: string;
  hospital_id: number;
  hospital?: Hospital; // 백엔드에서 함께 반환되는 병원 정보
  medical_service_id?: number; // 선택적 속성으로 변경
  start_date: string;
  end_date: string;
  target_post_count: number;
  completed_post_count: number; // 필수 속성으로 변경 (기본값 0)
  published_post_count?: number; // 선택적 속성으로 변경
  status: 'draft' | 'ready' | 'active' | 'paused' | 'completed' | 'aborted';
  selected_platform_ids?: number[]; // 선택된 플랫폼 ID 목록
  created_by?: number; // 선택적 속성으로 변경
  created_at: string;
  updated_at: string;
}

export interface Post {
  id: number;
  post_id: string;
  campaign_id?: number;
  hospital_id: number;
  medical_service_id?: number;
  hospital_service_id?: number;
  title?: string;
  status: PostStatus;
  post_type: 'informational' | 'case_study';
  publish_date?: string;
  published_url?: string;
  published_at?: string;
  campaign_sequence?: number;
  is_campaign_post: boolean;
  campaign_target_date?: string;
  created_by?: number;
  created_at: string;
  updated_at: string;
}

export type PostStatus = 
  | 'initial'
  | 'hospital_processing'
  | 'hospital_completed'
  | 'admin_guide_input'
  | 'guide_completed'
  | 'agent_processing'
  | 'agent_completed'
  | 'admin_review'
  | 'admin_approved'
  | 'client_review'
  | 'client_approved'
  | 'final_revision'
  | 'published';

export interface AgentExecutionLog {
  id: number;
  post_id: string;
  agent_type: 'input' | 'plan' | 'title' | 'content' | 'evaluation' | 'edit';
  execution_status: 'pending' | 'running' | 'completed' | 'failed' | 'timeout' | 'cancelled';
  input_data?: any;
  output_data?: any;
  error_message?: string;
  execution_time?: number;
  retry_count: number;
  fallback_type?: string;
  created_at: string;
  updated_at?: string;
}

export interface AgentResult {
  id: number;
  post_id: string;
  agent_type: string;
  result_data: any;
  status: string;
  success: boolean;
  error_message?: string;
  execution_time?: number;
  token_usage?: any;
  result_metadata?: any;
  fallback_info?: any;
  created_at: string;
  updated_at: string;
}

export interface PipelineResult {
  id: number;
  post_id: string;
  final_title?: string;
  final_content?: string;
  final_html_content?: string;
  final_markdown_content?: string;
  quality_score?: number;
  improvement_rate?: number;
  total_iterations: number;
  pipeline_started_at?: string;
  pipeline_completed_at?: string;
  pipeline_status: string;
  agent_results_summary?: any;
  final_evaluation_summary?: any;
  ai_generation?: any; // AI 생성 결과
  successful_agents?: number; // 성공한 에이전트 수
  total_agents?: number; // 총 에이전트 수
  current_step?: string; // 현재 진행 중인 단계
  progress?: number; // 진행률
  created_at: string;
  updated_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  post_id?: string;
  notification_type: 'status_change' | 'review_request' | 'approval';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface PaginationInfo {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface DateRange {
  from?: Date;
  to?: Date;
}

// 새로운 모델 타입 정의들 (백엔드 Models/Schemas 기반)

export interface AdminReview {
  id: number;
  post_id: string;
  reviewer_id: number;
  review_status: 'pending' | 'approved' | 'revision_requested' | 'rejected';
  review_notes?: string;
  revision_instructions?: string;
  edit_request_id?: number;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
  reviewer?: User;
}

export interface AdminRevision {
  id: number;
  post_id: string;
  admin_id: number;
  revision_type: 'direct_edit' | 'instruction' | 'edit_agent';
  original_content?: any;
  revised_content?: any;
  revision_notes?: string;
  edit_result_id?: number;
  created_at: string;
  updated_at?: string;
  admin?: User;
}

export interface ClientReview {
  id: number;
  post_id: string;
  client_id: number;
  review_status: 'pending' | 'approved' | 'revision_requested';
  review_notes?: string;
  revision_instructions?: string;
  edit_request_id?: number;
  reviewed_at: string;
  created_at: string;
  updated_at: string;
}

export interface WorkflowLog {
  id: number;
  post_id: string;
  from_status?: string;
  to_status?: string;
  action_type: 'status_change' | 'content_update' | 'approval' | 'review' | 'revision';
  action_by: number;
  action_notes?: string;
  created_at: string;
  updated_at?: string;
  actor?: User;
}

export interface UniversalImage {
  id: number;
  entity_type: 'hospital' | 'post' | 'user' | 'clinic';
  entity_id: number;
  image_type: 'business_card' | 'logo' | 'interior' | 'before' | 'after' | 'process';
  image_category?: 'before' | 'after' | 'process';
  original_filename?: string;
  file_size?: number;
  mime_type?: string;
  width?: number;
  height?: number;
  s3_bucket?: string;
  s3_key?: string;
  cdn_url?: string;
  alt_text?: string;
  caption?: string;
  sort_order: number;
  is_active: boolean;
  is_primary: boolean;
  created_at: string;
  updated_at: string;
}

export interface LandingAgentPerformance {
  id: number;
  agent_type: string;
  avg_execution_time?: number;
  success_rate?: number;
  total_executions: number;
  updated_at: string;
}

export interface ContentVersion {
  id: number;
  post_id: string;
  version_number: number;
  title?: string;
  content?: string;
  created_by: number;
  created_at: string;
  creator?: User;
}

// API 응답 타입들
export interface AdminReviewList {
  items: AdminReview[];
  total: number;
  page: number;
  size: number;
}

export interface AdminRevisionList {
  items: AdminRevision[];
  total: number;
  page: number;
  size: number;
}

export interface ClientReviewList {
  items: ClientReview[];
  total: number;
  page: number;
  size: number;
}

export interface WorkflowLogList {
  items: WorkflowLog[];
  total: number;
  page: number;
  size: number;
}

export interface UniversalImageList {
  items: UniversalImage[];
  total: number;
  page: number;
  size: number;
}

export interface LandingAgentPerformanceList {
  items: LandingAgentPerformance[];
  total: number;
  page: number;
  size: number;
}

export interface ContentVersionList {
  items: ContentVersion[];
  total: number;
  page: number;
  size: number;
}

// 필터 및 검색 타입들
export interface NotificationFilter {
  is_read?: boolean;
  notification_type?: string;
  date_from?: string;
  date_to?: string;
}

export interface WorkflowLogFilter {
  post_id?: string;
  action_type?: string;
  action_by?: number;
  date_from?: string;
  date_to?: string;
}

export interface AdminReviewFilter {
  post_id?: string;
  reviewer_id?: number;
  review_status?: string;
  date_from?: string;
  date_to?: string;
}

export interface UniversalImageFilter {
  entity_type?: string;
  entity_id?: number;
  image_type?: string;
  is_active?: boolean;
  is_primary?: boolean;
}

// 통합 포스팅 작업 워크플로우 데이터 구조
export interface CompletePostingWorkflow {
  post_id: string;
  basic_info: {
    title: string | null;
    status: string;
    created_at: string | null;
    updated_at: string | null;
  };
  hospital_info: {
    id: number | null;
    name: string | null;
    address: string | null;
  } | null;
  guide_provision_info?: {
    hospital_info: any;
    campaign_info: any;
    post_medical_info: any;
    treatment_info: any;
    post_materials: any;
    clinical_context: any;
    publish_info: any;
  };
  guide_provision_input?: {
    persona_selection: {
      persona_style_id?: string;
      persona_name: string;
      persona_description: string;
    };
    keywords_guide: {
      region_keywords_guide: string[];
      hospital_keywords_guide: string[];
      symptom_keywords_guide: string[];
      procedure_keywords_guide: string[];
      treatment_keywords_guide: string[];
      target_keywords_guide: string[];
      writing_guide: string;
      is_completed: boolean;
      emoji_level_value: number;
    };
  };
  material_review: {
    materials: {
      treatment_info: {
        concept_message: string;
        patient_condition: string;
        treatment_process_message: string;
        treatment_result_message: string;
        additional_message: string;
      };
      tooth_numbers: string[];
      images: {
        before: any[];
        process: any[];
        after: any[];
      };
      before_images_texts: string | null;
      process_images_texts: string | null;
      after_images_texts: string | null;
      quality_score: number | null;
    } | null;
    status: string;
  };
  guide_provision: {
    keywords_guide: {
      region_keywords: string[];
      hospital_keywords: string[];
      symptom_keywords: string[];
      procedure_keywords: string[];
      treatment_keywords: string[];
      target_keywords: string[];
    } | null;
    writing_guide: string | null;
    is_completed: boolean;
    spt_info: {
      selected_symptom_keyword: string | null;
      selected_procedure_keyword: string | null;
      selected_treatment_keyword: string | null;
      additional_notes: string | null;
    } | null;
  };
  ai_generation: {
    pipeline_status: string;
    agents: Array<{
      name: string;
      status: string;
      progress: number;
      output: string;
      error: string | null;
      start_time: string | null;
      end_time: string | null;
    }>;
    progress: number;
    current_step: string;
  };
  result_review: {
    content: {
      content: string;
      html_content: string | null;
      metadata: any;
      created_at: string | null;
      updated_at: string | null;
    } | null;
    admin_reviews: Array<{
      id: number;
      reviewer_id: number;
      review_status: string;
      review_notes: string | null;
      revision_instructions: string | null;
      reviewed_at: string | null;
    }>;
    admin_revisions: Array<{
      id: number;
      admin_id: number;
      revision_type: string;
      revision_notes: string | null;
      created_at: string | null;
      updated_at: string | null;
    }>;
  };
  client_review: {
    status: string;
    reviews: Array<{
      id: number;
      client_id: number;
      review_status: string;
      review_notes: string | null;
      revision_instructions: string | null;
      reviewed_at: string | null;
    }>;
  };
  publish_ready: {
    status: string;
    scheduled_date: string | null;
    published_date: string | null;
    platforms: string[] | null;
    notes: string | null;
    created_at: string | null;
  };
}

// 일정 관리 관련 타입들
export interface PostSchedule {
  id: number;
  post_id: string;
  hospital_id: number;
  campaign_id?: number | null; // 선택적 속성으로 변경
  scheduled_date: string | null;
  published_date?: string | null; // 선택적 속성으로 변경
  platforms?: string[] | null; // 선택적 속성으로 변경
  notes: string | null;
  status: 'pending' | 'scheduled' | 'published' | 'cancelled' | 'delayed';
  priority?: number; // 선택적 속성으로 변경
  delay_status?: 'on_track' | 'at_risk' | 'delayed'; // 선택적 속성으로 변경
  material_deadline: string | null;
  guide_deadline: string | null;
  ai_deadline: string | null;
  admin_review_deadline: string | null;
  client_review_deadline: string | null;
  final_revision_deadline: string | null;
  material_completed_at?: string | null; // 선택적 속성으로 변경
  guide_completed_at?: string | null; // 선택적 속성으로 변경
  ai_completed_at?: string | null; // 선택적 속성으로 변경
  admin_review_completed_at?: string | null; // 선택적 속성으로 변경
  client_review_completed_at?: string | null; // 선택적 속성으로 변경
  final_revision_completed_at?: string | null; // 선택적 속성으로 변경
  created_at: string;
  updated_at?: string | null; // 선택적 속성으로 변경
}

export interface ScheduleNotification {
  id: number;
  post_id: string;
  post_title?: string; // 포스트 제목
  notification_type: 'deadline_approaching' | 'overdue' | 'priority_changed' | 'stage_completed';
  stage: 'material' | 'guide' | 'ai' | 'admin_review' | 'client_review' | 'final_revision' | 'publish' | null;
  scheduled_at: string | null;
  sent_at: string | null;
  status: 'pending' | 'sent' | 'acknowledged' | 'failed';
  priority?: number; // 우선순위
  campaign_id?: number | null;
  created_at: string;
}

export interface ScheduleChangeLog {
  id: number;
  post_id?: string; // 선택적 속성으로 변경
  change_type: 'deadline_adjusted' | 'priority_changed' | 'status_updated';
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  changed_by: number | null;
  created_at: string;
}

export interface CampaignScheduleTemplate {
  id: number;
  campaign_id: number;
  material_collection_days: number;
  admin_guide_days: number;
  ai_generation_days: number;
  admin_review_days: number;
  client_review_days: number;
  final_revision_days: number;
  buffer_days: number;
  created_at: string;
  updated_at: string;
}

export interface CampaignScheduleOverview {
  campaign: {
    id: number;
    name: string;
    start_date: string;
    end_date: string;
    target_post_count: number;
    completed_post_count: number;
  };
  progress: {
    total_posts: number;
    completed_posts: number;
    delayed_posts: number;
    completion_rate: number;
  };
  stage_progress: {
    [stage: string]: {
      completed: number;
      total: number;
      percentage: number;
    };
  };
  bottlenecks: Array<{
    stage: string;
    severity: 'low' | 'medium' | 'high';
    description: string;
    recommendation: string;
  }>;
}

export interface PostScheduleDetail {
  post_id: string;
  schedule: {
    scheduled_date: string | null;
    published_date: string | null;
    priority: number;
    delay_status: 'on_track' | 'at_risk' | 'delayed';
  };
  deadlines: {
    [stage: string]: string | null;
  };
  completed_at: {
    [stage: string]: string | null;
  };
  stage_status: {
    [stage: string]: 'pending' | 'completed' | 'due_soon' | 'overdue';
  };
  next_stage: {
    stage: string;
    deadline: string;
    days_remaining: number;
  } | null;
  recommended_actions: Array<{
    type: 'reminder' | 'priority_increase' | 'deadline_extension';
    stage: string;
    action: string;
    reason: string;
  }>;
}

export interface ScheduleNotificationList {
  notifications: ScheduleNotification[];
  total: number;
  page: number;
  size: number;
}

export interface ScheduleChangeHistory {
  changes: ScheduleChangeLog[];
  total: number;
  page: number;
  size: number;
}

export interface PriorityDistribution {
  distribution: { [priority: number]: number };
  percentages: { [priority: number]: number };
  total_posts: number;
  generated_at: string;
}

export interface ScheduleMonitoringResult {
  delayed_posts: Array<{
    post_id: string;
    stage: string;
    delay_days: number;
    severity: 'low' | 'medium' | 'high';
  }>;
  approaching_deadlines: Array<{
    post_id: string;
    stage: string;
    hours_remaining: number;
    urgency: 'low' | 'medium' | 'high';
  }>;
  notifications_created: number;
  priorities_updated: number;
  monitored_at: string;
}

export interface ScheduleMaintenanceResult {
  monitor_result: {
    delayed_posts: number;
    approaching_deadlines: number;
    notifications_created: number;
  };
  priority_result: {
    total_processed: number;
    updated_count: number;
  };
  cleanup_result: {
    deleted_notifications: number;
    cutoff_date: string;
  };
  executed_at: string;
}
