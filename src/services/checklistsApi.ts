import { 
  Checklist, 
  ChecklistVersion, 
  ChecklistCreateRequest, 
  ChecklistUpdateRequest,
  ChecklistItem,
  PromptImprovementRequest,
  PromptImprovementResponse,
  PromptQualityAnalysis,
  PromptComparison
} from '@/types/common';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// Checklists CRUD API
export const checklistsApi = {
  // 체크리스트 목록 조회
  async getChecklists(params?: {
    category?: string;
    subcategory?: string;
    is_active?: boolean;
    page?: number;
    size?: number;
  }): Promise<Checklist[]> {
    const searchParams = new URLSearchParams();
    if (params?.category) searchParams.append('category', params.category);
    if (params?.subcategory) searchParams.append('subcategory', params.subcategory);
    if (params?.is_active !== undefined) searchParams.append('is_active', params.is_active.toString());
    if (params?.page) searchParams.append('page', params.page.toString());
    if (params?.size) searchParams.append('size', params.size.toString());

    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists?${searchParams}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklists: ${response.statusText}`);
    }

    return response.json();
  },

  // 체크리스트 상세 조회
  async getChecklist(id: number): Promise<Checklist> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklist: ${response.statusText}`);
    }

    return response.json();
  },

  // 체크리스트 생성
  async createChecklist(data: ChecklistCreateRequest): Promise<Checklist> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checklist: ${response.statusText}`);
    }

    return response.json();
  },

  // 체크리스트 수정
  async updateChecklist(id: number, data: ChecklistUpdateRequest): Promise<Checklist> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to update checklist: ${response.statusText}`);
    }

    return response.json();
  },

  // 체크리스트 삭제
  async deleteChecklist(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete checklist: ${response.statusText}`);
    }
  },

  // 체크리스트 활성화/비활성화
  async toggleChecklistStatus(id: number): Promise<Checklist> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${id}/toggle-status`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to toggle checklist status: ${response.statusText}`);
    }

    return response.json();
  },
};

// Checklist Versions API
export const checklistVersionsApi = {
  // 체크리스트 버전 목록 조회
  async getChecklistVersions(checklistId: number): Promise<ChecklistVersion[]> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/versions`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch checklist versions: ${response.statusText}`);
    }

    return response.json();
  },

  // 새 버전 생성
  async createChecklistVersion(checklistId: number, data: {
    version: string;
    checklist_items: Omit<ChecklistItem, 'id'>[];
  }): Promise<ChecklistVersion> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/versions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to create checklist version: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 활성화
  async activateChecklistVersion(checklistId: number, versionId: number): Promise<ChecklistVersion> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/versions/${versionId}/activate`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to activate checklist version: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 삭제
  async deleteChecklistVersion(checklistId: number, versionId: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/versions/${versionId}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      throw new Error(`Failed to delete checklist version: ${response.statusText}`);
    }
  },
};

// LLM Improvement API (체크리스트용)
export const checklistImprovementApi = {
  // LLM 기반 체크리스트 개선
  async improveChecklist(data: PromptImprovementRequest): Promise<PromptImprovementResponse> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/improve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Failed to improve checklist: ${response.statusText}`);
    }

    return response.json();
  },

  // 체크리스트 품질 분석
  async analyzeChecklistQuality(checklistId: number): Promise<PromptQualityAnalysis> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/analyze`, {
      method: 'POST',
    });

    if (!response.ok) {
      throw new Error(`Failed to analyze checklist quality: ${response.statusText}`);
    }

    return response.json();
  },

  // 버전 비교
  async compareChecklistVersions(checklistId: number, versionAId: number, versionBId: number): Promise<PromptComparison> {
    const response = await fetch(`${API_BASE_URL}/api/v1/admin/checklists/${checklistId}/compare`, {
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
      throw new Error(`Failed to compare checklist versions: ${response.statusText}`);
    }

    return response.json();
  },
};
