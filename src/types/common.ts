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
  map_link?: string;
  created_at: string;
  updated_at?: string;
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
