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
  medical_service_id: number;
  start_date: string;
  end_date: string;
  target_post_count: number;
  completed_post_count: number;
  published_post_count: number;
  status: 'active' | 'paused' | 'completed' | 'aborted';
  created_by: number;
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
