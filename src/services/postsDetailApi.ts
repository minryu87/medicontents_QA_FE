import { PostStatusHistory, PostActivityResult, PostDetailMetrics } from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface PostDetailResponse {
  post_id: string;
  status_history: PostStatusHistory[];
  activity_results: PostActivityResult[];
  metrics: PostDetailMetrics;
}

// 포스트 상세 정보 조회 (타임라인 포함)
export const getPostDetail = async (postId: string): Promise<PostDetailResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/detail`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`포스트 상세 정보 조회 실패: ${response.statusText}`);
  }

  return response.json();
};

// 포스트 상태 히스토리 조회
export const getPostStatusHistory = async (postId: string): Promise<PostStatusHistory[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/status-history`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`포스트 상태 히스토리 조회 실패: ${response.statusText}`);
  }

  return response.json();
};

// 포스트 활동 결과 조회
export const getPostActivityResults = async (postId: string): Promise<PostActivityResult[]> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/activity-results`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`포스트 활동 결과 조회 실패: ${response.statusText}`);
  }

  return response.json();
};

// 포스트 성능 메트릭 조회
export const getPostMetrics = async (postId: string): Promise<PostDetailMetrics> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/metrics`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`포스트 성능 메트릭 조회 실패: ${response.statusText}`);
  }

  return response.json();
};

// 포스트 상태 업데이트
export const updatePostStatus = async (postId: string, status: string, notes?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/status`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ status, notes }),
  });

  if (!response.ok) {
    throw new Error(`포스트 상태 업데이트 실패: ${response.statusText}`);
  }
};

// 포스트 재처리 요청
export const reprocessPost = async (postId: string, fromStep?: string): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/api/v1/admin/posts/${postId}/reprocess`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from_step: fromStep }),
  });

  if (!response.ok) {
    throw new Error(`포스트 재처리 요청 실패: ${response.statusText}`);
  }
};
