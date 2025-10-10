'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  FileText,
  Edit,
  Plus,
  Eye,
  Archive,
  Play,
  BarChart3,
  Code,
  Settings,
  Zap,
  AlertTriangle,
  CheckCircle,
  Brain,
  History,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { 
  Prompt, 
  PromptVersion, 
  PromptCreateRequest, 
  PromptUpdateRequest,
  PromptImprovementRequest,
  PromptImprovementResponse,
  PromptQualityAnalysis
} from '@/types/common';
import { promptsApi, promptVersionsApi, promptImprovementApi } from '@/services/promptsApi';
import PromptEditorModal from '@/components/admin/PromptEditorModal';

const agentTypes = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

export default function PromptManagementPage() {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Prompt | null>(null);
  const [showVersions, setShowVersions] = useState<number | null>(null);
  const [showImprovement, setShowImprovement] = useState<number | null>(null);
  const [improvementResult, setImprovementResult] = useState<PromptImprovementResponse | null>(null);
  const [qualityAnalysis, setQualityAnalysis] = useState<PromptQualityAnalysis | null>(null);

  useEffect(() => {
    loadPrompts();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      const response = await promptsApi.getPrompts();
      setPrompts(response);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredPrompts = () => {
    let filtered = prompts || [];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }
    return filtered;
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setShowEditor(true);
  };

  const handleEditPrompt = (prompt: Prompt) => {
    setEditingPrompt(prompt);
    setShowEditor(true);
  };

  const handleToggleStatus = async (promptId: number) => {
    try {
      await promptsApi.togglePromptStatus(promptId);
      await loadPrompts();
    } catch (error) {
      console.error('Failed to toggle prompt status:', error);
    }
  };

  const handleDeletePrompt = async (promptId: number) => {
    if (confirm('이 프롬프트를 삭제하시겠습니까?')) {
      try {
        await promptsApi.deletePrompt(promptId);
        await loadPrompts();
      } catch (error) {
        console.error('Failed to delete prompt:', error);
      }
    }
  };

  const handleImprovePrompt = async (promptId: number, instruction: string) => {
    try {
      const result = await promptImprovementApi.improvePrompt({
        target: 'prompt',
        target_id: promptId,
        improvement_instruction: instruction,
      });
      setImprovementResult(result);
    } catch (error) {
      console.error('Failed to improve prompt:', error);
    }
  };

  const handleAnalyzeQuality = async (promptId: number) => {
    try {
      const analysis = await promptImprovementApi.analyzePromptQuality(promptId);
      setQualityAnalysis(analysis);
    } catch (error) {
      console.error('Failed to analyze prompt quality:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">프롬프트 관리</h1>
            <p className="text-gray-600">
              AI 에이전트의 프롬프트를 관리하고 성능을 최적화합니다.
            </p>
          </div>
          <Button onClick={handleCreatePrompt}>
            <Plus className="w-4 h-4 mr-2" />
            새 프롬프트
          </Button>
        </div>
      </div>

      {/* 필터 및 통계 */}
      <div className="mb-8 flex gap-4 items-center">
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">모든 카테고리</option>
          {Object.entries(agentTypes).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex gap-4 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(prompts || []).filter(p => p.is_active).length}
            </div>
            <div className="text-sm text-gray-600">활성 프롬프트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(prompts || []).filter(p => !p.is_active).length}
            </div>
            <div className="text-sm text-gray-600">비활성 프롬프트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(prompts || []).length}
            </div>
            <div className="text-sm text-gray-600">전체 프롬프트</div>
          </div>
        </div>
      </div>

      {/* 프롬프트 목록 */}
      <div className="space-y-6">
        {filteredPrompts().map((prompt) => (
          <Card key={prompt.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {prompt.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    prompt.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {prompt.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">카테고리:</span> {agentTypes[prompt.category as keyof typeof agentTypes] || prompt.category}
                  {prompt.subcategory && (
                    <span className="ml-2">
                      <span className="font-medium">서브카테고리:</span> {prompt.subcategory}
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowVersions(showVersions === prompt.id ? null : prompt.id)}
                >
                  <History className="w-4 h-4 mr-1" />
                  버전
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowImprovement(showImprovement === prompt.id ? null : prompt.id)}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  개선
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditPrompt(prompt)}>
                  <Edit className="w-4 h-4 mr-1" />
                  편집
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleStatus(prompt.id)}
                >
                  {prompt.is_active ? '비활성화' : '활성화'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>

            {/* 프롬프트 내용 미리보기 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap max-h-96 overflow-y-auto">
                {prompt.prompt_text}
              </div>
            </div>

            {/* 버전 관리 섹션 */}
            {showVersions === prompt.id && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <GitBranch className="w-4 h-4 mr-2" />
                  버전 관리
                </h4>
                <div className="text-sm text-gray-600">
                  버전 관리 기능이 여기에 표시됩니다.
                </div>
              </div>
            )}

            {/* LLM 개선 섹션 */}
            {showImprovement === prompt.id && (
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                  <Brain className="w-4 h-4 mr-2" />
                  LLM 기반 개선
                </h4>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      개선 지시사항
                    </label>
                    <textarea
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      rows={3}
                      placeholder="어떤 부분을 개선하고 싶은지 설명해주세요..."
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => handleAnalyzeQuality(prompt.id)}
                    >
                      <BarChart3 className="w-4 h-4 mr-1" />
                      품질 분석
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                    >
                      <Sparkles className="w-4 h-4 mr-1" />
                      개선 제안
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </Card>
        ))}
      </div>


      {/* 프롬프트 편집기 모달 */}
      {showEditor && (
        <PromptEditorModal
          prompt={editingPrompt}
          onClose={() => setShowEditor(false)}
          onSave={async (data) => {
            try {
              if (editingPrompt) {
                await promptsApi.updatePrompt(editingPrompt.id, data as PromptUpdateRequest);
              } else {
                await promptsApi.createPrompt(data as PromptCreateRequest);
              }
              await loadPrompts();
              setShowEditor(false);
            } catch (error) {
              console.error('Failed to save prompt:', error);
            }
          }}
        />
      )}
    </div>
  );
}
