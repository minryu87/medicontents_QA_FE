'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
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
  CheckCircle
} from 'lucide-react';

interface PromptVersion {
  id: number;
  agentType: string;
  version: string;
  content: string;
  variables: string[];
  performance: {
    usageCount: number;
    avgScore: number;
    errorRate: number;
  };
  status: 'active' | 'testing' | 'archived';
  createdAt: string;
}

interface ABTest {
  id: number;
  variantA: PromptVersion;
  variantB: PromptVersion;
  status: 'running' | 'completed' | 'stopped';
  startDate: string;
  winner?: string;
  metrics: {
    variantA: { usage: number; score: number; };
    variantB: { usage: number; score: number; };
    significance: number;
  };
}

const agentTypes = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

export default function PromptManagementPage() {
  const [prompts, setPrompts] = useState<{
    active: PromptVersion[];
    testing: PromptVersion[];
    archived: PromptVersion[];
  }>({
    active: [],
    testing: [],
    archived: []
  });
  const [abTests, setAbTests] = useState<ABTest[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<PromptVersion | null>(null);

  useEffect(() => {
    loadPrompts();
    loadABTests();
  }, []);

  const loadPrompts = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockPrompts: PromptVersion[] = [
        {
          id: 1,
          agentType: 'content',
          version: 'v2.1.0',
          content: '다음과 같은 콘텐츠를 생성해주세요...',
          variables: ['topic', 'length', 'style'],
          performance: {
            usageCount: 1250,
            avgScore: 87.5,
            errorRate: 2.1
          },
          status: 'active',
          createdAt: '2024-01-15'
        },
        {
          id: 2,
          agentType: 'title',
          version: 'v1.8.2',
          content: '주제에 맞는 SEO 최적화 제목을 생성해주세요...',
          variables: ['topic', 'keywords'],
          performance: {
            usageCount: 980,
            avgScore: 92.1,
            errorRate: 1.5
          },
          status: 'active',
          createdAt: '2024-01-10'
        },
        {
          id: 3,
          agentType: 'content',
          version: 'v2.2.0-beta',
          content: '개선된 버전의 콘텐츠 생성 프롬프트...',
          variables: ['topic', 'length', 'style', 'audience'],
          performance: {
            usageCount: 145,
            avgScore: 89.2,
            errorRate: 1.8
          },
          status: 'testing',
          createdAt: '2024-01-20'
        }
      ];

      const categorized = {
        active: mockPrompts.filter(p => p.status === 'active'),
        testing: mockPrompts.filter(p => p.status === 'testing'),
        archived: mockPrompts.filter(p => p.status === 'archived')
      };

      setPrompts(categorized);
    } catch (error) {
      console.error('Failed to load prompts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadABTests = async () => {
    // 실제로는 API 호출
    const mockTests: ABTest[] = [
      {
        id: 1,
        variantA: prompts.active[0] || {} as PromptVersion,
        variantB: prompts.testing[0] || {} as PromptVersion,
        status: 'running',
        startDate: '2024-01-20',
        metrics: {
          variantA: { usage: 1250, score: 87.5 },
          variantB: { usage: 145, score: 89.2 },
          significance: 1.8
        }
      }
    ];
    setAbTests(mockTests);
  };

  const filteredPrompts = (status: 'active' | 'testing' | 'archived') => {
    let filtered = prompts[status];
    if (selectedAgent !== 'all') {
      filtered = filtered.filter(p => p.agentType === selectedAgent);
    }
    return filtered;
  };

  const handleCreatePrompt = () => {
    setEditingPrompt(null);
    setShowEditor(true);
  };

  const handleEditPrompt = (prompt: PromptVersion) => {
    setEditingPrompt(prompt);
    setShowEditor(true);
  };

  const handleArchivePrompt = async (promptId: number) => {
    if (confirm('이 프롬프트를 보관하시겠습니까?')) {
      // API 호출
      console.log('Archiving prompt:', promptId);
    }
  };

  const handleStartABTest = async (promptA: PromptVersion, promptB: PromptVersion) => {
    // API 호출
    console.log('Starting A/B test:', promptA.id, promptB.id);
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
          value={selectedAgent}
          onChange={(e) => setSelectedAgent(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">모든 에이전트</option>
          {Object.entries(agentTypes).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex gap-4 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {prompts.active.length}
            </div>
            <div className="text-sm text-gray-600">활성 프롬프트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {prompts.testing.length}
            </div>
            <div className="text-sm text-gray-600">테스트 중</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-600">
              {abTests.filter(t => t.status === 'running').length}
            </div>
            <div className="text-sm text-gray-600">A/B 테스트</div>
          </div>
        </div>
      </div>

      {/* A/B 테스트 섹션 */}
      {abTests.length > 0 && (
        <Card className="p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            <BarChart3 className="w-5 h-5 inline mr-2" />
            진행 중인 A/B 테스트
          </h2>
          <div className="space-y-4">
            {abTests.map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-medium text-gray-900">
                      {agentTypes[test.variantA.agentType as keyof typeof agentTypes]} A/B 테스트
                    </h3>
                    <p className="text-sm text-gray-600">
                      {test.variantA.version} vs {test.variantB.version}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      test.status === 'running' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {test.status === 'running' ? '진행중' : '완료'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {test.metrics.variantA.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Variant A 점수</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {test.metrics.variantA.usage}회 사용
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold text-gray-900">
                      {test.metrics.variantB.score.toFixed(1)}
                    </div>
                    <div className="text-sm text-gray-600">Variant B 점수</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {test.metrics.variantB.usage}회 사용
                    </div>
                  </div>
                </div>

                {test.winner && (
                  <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <span className="text-green-800 font-medium">
                        승자: {test.winner} (유의성: {test.metrics.significance.toFixed(2)})
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 프롬프트 목록 */}
      <div className="space-y-8">
        {/* 활성 프롬프트 */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Zap className="w-5 h-5 mr-2 text-green-600" />
            활성 프롬프트 ({filteredPrompts('active').length})
          </h2>
          <div className="grid gap-4">
            {filteredPrompts('active').map((prompt) => (
              <Card key={prompt.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {agentTypes[prompt.agentType as keyof typeof agentTypes]}
                    </h3>
                    <p className="text-gray-600">버전 {prompt.version}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditPrompt(prompt)}>
                      <Edit className="w-4 h-4 mr-1" />
                      편집
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      미리보기
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleArchivePrompt(prompt.id)}
                    >
                      <Archive className="w-4 h-4 mr-1" />
                      보관
                    </Button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-semibold text-blue-600">
                      {prompt.performance.usageCount}
                    </div>
                    <div className="text-sm text-blue-600">사용 횟수</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-semibold text-green-600">
                      {prompt.performance.avgScore.toFixed(1)}
                    </div>
                    <div className="text-sm text-green-600">평균 점수</div>
                  </div>
                  <div className="text-center p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-semibold text-red-600">
                      {prompt.performance.errorRate.toFixed(1)}%
                    </div>
                    <div className="text-sm text-red-600">오류율</div>
                  </div>
                </div>

                <div className="text-sm text-gray-600">
                  <span className="font-medium">변수:</span> {prompt.variables.join(', ')}
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* 테스트 중인 프롬프트 */}
        {filteredPrompts('testing').length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2 text-blue-600" />
              테스트 중인 프롬프트 ({filteredPrompts('testing').length})
            </h2>
            <div className="grid gap-4">
              {filteredPrompts('testing').map((prompt) => (
                <Card key={prompt.id} className="p-6 border-blue-200">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {agentTypes[prompt.agentType as keyof typeof agentTypes]}
                      </h3>
                      <p className="text-gray-600">버전 {prompt.version} (테스트 중)</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleStartABTest(prompt, prompts.active.find(p => p.agentType === prompt.agentType)!)}
                      >
                        <Play className="w-4 h-4 mr-1" />
                        A/B 테스트 시작
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleEditPrompt(prompt)}>
                        <Edit className="w-4 h-4 mr-1" />
                        편집
                      </Button>
                    </div>
                  </div>

                  <div className="text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
                    이 프롬프트는 현재 테스트 단계에 있습니다. A/B 테스트를 통해 성능을 비교해보세요.
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 보관된 프롬프트 */}
        {filteredPrompts('archived').length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
              <Archive className="w-5 h-5 mr-2 text-gray-600" />
              보관된 프롬프트 ({filteredPrompts('archived').length})
            </h2>
            <div className="text-gray-600 text-center py-8">
              보관된 프롬프트가 여기에 표시됩니다.
            </div>
          </div>
        )}
      </div>

      {/* 프롬프트 편집기 모달 (간단한 구현) */}
      {showEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingPrompt ? '프롬프트 편집' : '새 프롬프트 생성'}
              </h2>
              <Button variant="outline" onClick={() => setShowEditor(false)}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    에이전트 타입
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    {Object.entries(agentTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    버전
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="v1.0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프롬프트 내용
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-64 font-mono text-sm"
                  placeholder="프롬프트를 입력하세요..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  변수 (쉼표로 구분)
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="topic, length, style"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="primary">
                  {editingPrompt ? '저장' : '생성'}
                </Button>
                <Button variant="outline" onClick={() => setShowEditor(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
