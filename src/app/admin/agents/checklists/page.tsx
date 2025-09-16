'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  CheckSquare,
  Plus,
  Edit,
  Trash,
  TestTube,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Settings,
  Eye
} from 'lucide-react';

interface Rule {
  id: string;
  name: string;
  description: string;
  patterns: string[];
  weight: number;
  maxScore: number;
  severity: 'low' | 'medium' | 'high';
  category: 'medical' | 'seo';
  enabled: boolean;
}

interface ChecklistTest {
  id: number;
  content: string;
  rules: Rule[];
  results: Array<{
    ruleId: string;
    score: number;
    matches: string[];
    passed: boolean;
  }>;
  overallScore: number;
  passed: boolean;
  createdAt: string;
}

const severityColors = {
  low: 'text-yellow-600 bg-yellow-100',
  medium: 'text-orange-600 bg-orange-100',
  high: 'text-red-600 bg-red-100'
};

const severityLabels = {
  low: '낮음',
  medium: '중간',
  high: '높음'
};

export default function ChecklistManagementPage() {
  const [rules, setRules] = useState<{
    medical: Rule[];
    seo: Rule[];
  }>({
    medical: [],
    seo: []
  });
  const [tests, setTests] = useState<ChecklistTest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRuleEditor, setShowRuleEditor] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [showTester, setShowTester] = useState(false);
  const [testContent, setTestContent] = useState('');

  useEffect(() => {
    loadRules();
    loadTests();
  }, []);

  const loadRules = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockRules: Rule[] = [
        {
          id: 'medical-1',
          name: '의료법 준수 기본',
          description: '기본적인 의료법 용어 사용 확인',
          patterns: ['진료', '치료', '진단', '의료'],
          weight: 1.0,
          maxScore: 10,
          severity: 'high',
          category: 'medical',
          enabled: true
        },
        {
          id: 'medical-2',
          name: '과장 광고 방지',
          description: '과장된 치료 효과 표현 방지',
          patterns: ['완치', '100%', '무조건', '확실히'],
          weight: 1.5,
          maxScore: 15,
          severity: 'high',
          category: 'medical',
          enabled: true
        },
        {
          id: 'seo-1',
          name: '제목 최적화',
          description: '제목에 주요 키워드 포함 확인',
          patterns: ['치아', '임플란트', '교정'],
          weight: 1.0,
          maxScore: 10,
          severity: 'medium',
          category: 'seo',
          enabled: true
        },
        {
          id: 'seo-2',
          name: '메타 설명 길이',
          description: '메타 설명의 적절한 길이 확인',
          patterns: [], // 길이 기반 체크
          weight: 0.8,
          maxScore: 8,
          severity: 'low',
          category: 'seo',
          enabled: true
        }
      ];

      const categorized = {
        medical: mockRules.filter(r => r.category === 'medical'),
        seo: mockRules.filter(r => r.category === 'seo')
      };

      setRules(categorized);
    } catch (error) {
      console.error('Failed to load rules:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTests = async () => {
    // 실제로는 API 호출
    const mockTests: ChecklistTest[] = [
      {
        id: 1,
        content: '임플란트 치료 시 주의사항과 장점에 대해 알려드립니다. 현대적인 임플란트는 자연치아와 유사한 기능을 제공합니다.',
        rules: [],
        results: [
          { ruleId: 'medical-1', score: 8, matches: ['치료', '임플란트'], passed: true },
          { ruleId: 'medical-2', score: 15, matches: [], passed: true },
          { ruleId: 'seo-1', score: 10, matches: ['임플란트'], passed: true }
        ],
        overallScore: 88,
        passed: true,
        createdAt: '2024-01-20'
      }
    ];
    setTests(mockTests);
  };

  const handleCreateRule = () => {
    setEditingRule(null);
    setShowRuleEditor(true);
  };

  const handleEditRule = (rule: Rule) => {
    setEditingRule(rule);
    setShowRuleEditor(true);
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (confirm('이 규칙을 삭제하시겠습니까?')) {
      // API 호출
      console.log('Deleting rule:', ruleId);
      setRules(prev => ({
        medical: prev.medical.filter(r => r.id !== ruleId),
        seo: prev.seo.filter(r => r.id !== ruleId)
      }));
    }
  };

  const handleToggleRule = async (ruleId: string) => {
    // API 호출
    console.log('Toggling rule:', ruleId);
    setRules(prev => ({
      medical: prev.medical.map(r => r.id === ruleId ? {...r, enabled: !r.enabled} : r),
      seo: prev.seo.map(r => r.id === ruleId ? {...r, enabled: !r.enabled} : r)
    }));
  };

  const handleTestChecklist = async () => {
    if (!testContent.trim()) return;

    try {
      // 실제로는 API 호출
      const mockResults = rules.medical.concat(rules.seo)
        .filter(rule => rule.enabled)
        .map(rule => ({
          ruleId: rule.id,
          score: Math.floor(Math.random() * rule.maxScore),
          matches: rule.patterns.slice(0, 2),
          passed: Math.random() > 0.3
        }));

      const overallScore = mockResults.reduce((sum, r) => sum + r.score, 0);
      const maxScore = rules.medical.concat(rules.seo)
        .filter(rule => rule.enabled)
        .reduce((sum, r) => sum + r.maxScore, 0);
      const scorePercentage = Math.round((overallScore / maxScore) * 100);

      const newTest: ChecklistTest = {
        id: Date.now(),
        content: testContent,
        rules: rules.medical.concat(rules.seo).filter(r => r.enabled),
        results: mockResults,
        overallScore: scorePercentage,
        passed: scorePercentage >= 70,
        createdAt: new Date().toISOString()
      };

      setTests(prev => [newTest, ...prev]);
      setTestContent('');
      setShowTester(false);
    } catch (error) {
      console.error('Failed to test checklist:', error);
    }
  };

  const getCategoryStats = (category: 'medical' | 'seo') => {
    const categoryRules = rules[category];
    const enabledRules = categoryRules.filter(r => r.enabled);
    return {
      total: categoryRules.length,
      enabled: enabledRules.length,
      avgWeight: enabledRules.length > 0
        ? enabledRules.reduce((sum, r) => sum + r.weight, 0) / enabledRules.length
        : 0
    };
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">체크리스트 관리</h1>
            <p className="text-gray-600">
              콘텐츠 품질 검증을 위한 규칙을 관리하고 테스트합니다.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowTester(true)}>
              <TestTube className="w-4 h-4 mr-2" />
              테스트
            </Button>
            <Button onClick={handleCreateRule}>
              <Plus className="w-4 h-4 mr-2" />
              새 규칙
            </Button>
          </div>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <CheckSquare className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">총 규칙</p>
              <p className="text-2xl font-bold text-gray-900">
                {rules.medical.length + rules.seo.length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">활성 규칙</p>
              <p className="text-2xl font-bold text-gray-900">
                {rules.medical.filter(r => r.enabled).length + rules.seo.filter(r => r.enabled).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <BarChart3 className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">평균 가중치</p>
              <p className="text-2xl font-bold text-gray-900">
                {(getCategoryStats('medical').avgWeight + getCategoryStats('seo').avgWeight) / 2}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <TestTube className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">테스트 횟수</p>
              <p className="text-2xl font-bold text-gray-900">{tests.length}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 의료법 체크리스트 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-red-500" />
              의료법 체크리스트
            </h2>
            <span className="text-sm text-gray-600">
              {getCategoryStats('medical').enabled}/{getCategoryStats('medical').total} 활성
            </span>
          </div>

          <div className="space-y-4">
            {rules.medical.map((rule) => (
              <Card key={rule.id} className={`p-4 ${!rule.enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 mr-2">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[rule.severity]}`}>
                      {severityLabels[rule.severity]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>패턴: {rule.patterns.join(', ') || '없음'}</span>
                    <span>가중치: {rule.weight}</span>
                  </div>
                  <span className="font-medium">최대 {rule.maxScore}점</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* SEO 체크리스트 */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <CheckSquare className="w-5 h-5 mr-2 text-blue-500" />
              SEO 체크리스트
            </h2>
            <span className="text-sm text-gray-600">
              {getCategoryStats('seo').enabled}/{getCategoryStats('seo').total} 활성
            </span>
          </div>

          <div className="space-y-4">
            {rules.seo.map((rule) => (
              <Card key={rule.id} className={`p-4 ${!rule.enabled ? 'opacity-60' : ''}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <h3 className="font-medium text-gray-900 mr-2">{rule.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[rule.severity]}`}>
                      {severityLabels[rule.severity]}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleRule(rule.id)}
                      className={`w-12 h-6 rounded-full transition-colors ${
                        rule.enabled ? 'bg-green-500' : 'bg-gray-300'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-white transition-transform ${
                        rule.enabled ? 'translate-x-6' : 'translate-x-1'
                      }`} />
                    </button>
                    <Button variant="outline" size="sm" onClick={() => handleEditRule(rule)}>
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteRule(rule.id)}>
                      <Trash className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-3">{rule.description}</p>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-4">
                    <span>패턴: {rule.patterns.join(', ') || '없음'}</span>
                    <span>가중치: {rule.weight}</span>
                  </div>
                  <span className="font-medium">최대 {rule.maxScore}점</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* 테스트 결과 */}
      {tests.length > 0 && (
        <Card className="p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <TestTube className="w-5 h-5 mr-2 text-orange-500" />
            최근 테스트 결과
          </h2>

          <div className="space-y-4">
            {tests.slice(0, 5).map((test) => (
              <div key={test.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {test.passed ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-2" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-500 mr-2" />
                    )}
                    <span className="font-medium text-gray-900">
                      점수: {test.overallScore}/100
                    </span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {new Date(test.createdAt).toLocaleDateString('ko-KR')}
                  </span>
                </div>

                <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded-lg mb-3 line-clamp-2">
                  {test.content}
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-500 mr-2" />
                    <span>통과: {test.results.filter(r => r.passed).length}개</span>
                  </div>
                  <div className="flex items-center">
                    <XCircle className="w-4 h-4 text-red-500 mr-2" />
                    <span>실패: {test.results.filter(r => !r.passed).length}개</span>
                  </div>
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-blue-500 mr-2" />
                    <span>평균 점수: {Math.round(test.results.reduce((sum, r) => sum + r.score, 0) / test.results.length)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 규칙 편집기 모달 */}
      {showRuleEditor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingRule ? '규칙 편집' : '새 규칙 생성'}
              </h2>
              <Button variant="outline" onClick={() => setShowRuleEditor(false)}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    규칙명
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="규칙 이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                    <option value="medical">의료법</option>
                    <option value="seo">SEO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  설명
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="규칙에 대한 설명을 입력하세요"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    패턴 (쉼표로 구분)
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="치료, 진단, 진료"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    가중치
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="1.0"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    최대 점수
                  </label>
                  <input
                    type="number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  심각도
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  <option value="low">낮음</option>
                  <option value="medium">중간</option>
                  <option value="high">높음</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="primary">
                  {editingRule ? '저장' : '생성'}
                </Button>
                <Button variant="outline" onClick={() => setShowRuleEditor(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 테스트 도구 모달 */}
      {showTester && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">체크리스트 테스트</h2>
              <Button variant="outline" onClick={() => setShowTester(false)}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  테스트할 콘텐츠
                </label>
                <textarea
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-32"
                  value={testContent}
                  onChange={(e) => setTestContent(e.target.value)}
                  placeholder="테스트할 콘텐츠를 입력하세요..."
                />
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-medium text-gray-900 mb-2">활성 규칙</h3>
                <div className="text-sm text-gray-600">
                  의료법: {rules.medical.filter(r => r.enabled).length}개,
                  SEO: {rules.seo.filter(r => r.enabled).length}개
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="primary"
                  onClick={handleTestChecklist}
                  disabled={!testContent.trim()}
                >
                  <TestTube className="w-4 h-4 mr-2" />
                  테스트 실행
                </Button>
                <Button variant="outline" onClick={() => setShowTester(false)}>
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
