import { 
  Prompt, 
  PromptVersion, 
  PromptCreateRequest, 
  PromptUpdateRequest,
  PromptImprovementRequest,
  PromptImprovementResponse,
  PromptQualityAnalysis,
  PromptComparison
} from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Prompts CRUD API
export const promptsApi = {
  // 프롬프트 목록 조회
  async getPrompts(params?: {
    category?: string;
    subcategory?: string;
    is_active?: boolean;
    page?: number;
    size?: number;
  }): Promise<Prompt[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.statusText}`);
    }

    return response.json();
  },

  // 프롬프트 상세 조회
  async getPrompt(id: number): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompt: ${response.statusText}`);
    }

    return response.json();
  },

  // 프롬프트 생성
  async createPrompt(data: PromptCreateRequest): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create prompt: ${response.statusText}`);
    }

    return response.json();
  },

  // 프롬프트 수정
  async updatePrompt(id: number, data: PromptUpdateRequest): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update prompt: ${response.statusText}`);
    }

    return response.json();
  },

  // 프롬프트 삭제
  async deletePrompt(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete prompt: ${response.statusText}`);
    }
  },

  // 프롬프트 활성화/비활성화
  async togglePromptStatus(id: number): Promise<Prompt> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${id}/toggle-status`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle prompt status: ${response.statusText}`);
    }

    return response.json();
  },
};

// Prompt Versions API
export const promptVersionsApi = {
  // 프롬프트 버전 목록 조회
  async getPromptVersions(promptId: number): Promise<PromptVersion[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompt versions: ${response.statusText}`);
    }

    return response.json();
  },

  // 새 버전 생성
  async createPromptVersion(promptId: number, data: {
    version: string;
    prompt_text: string;
    variables: string[];
  }): Promise<PromptVersion> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create prompt version: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 활성화
  async activatePromptVersion(promptId: number, versionId: number): Promise<PromptVersion> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/versions/${versionId}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to activate prompt version: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 삭제
  async deletePromptVersion(promptId: number, versionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/versions/${versionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete prompt version: ${response.statusText}`);
    }
  },
};

// LLM Improvement API
export const promptImprovementApi = {
  // LLM 기반 프롬프트 개선
  async improvePrompt(data: PromptImprovementRequest): Promise<PromptImprovementResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to improve prompt: ${response.statusText}`);
    }

    return response.json();
  },

  // 프롬프트 품질 분석
  async analyzePromptQuality(promptId: number): Promise<PromptQualityAnalysis> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/analyze`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze prompt quality: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 비교
  async comparePromptVersions(promptId: number, versionAId: number, versionBId: number): Promise<PromptComparison> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/prompts/${promptId}/compare`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        version_a_id: versionAId,
        version_b_id: versionBId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to compare prompt versions: ${response.statusText}`);
    }

    return response.json();
  },
};
