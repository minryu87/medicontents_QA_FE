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
  Eye,
  Brain,
  History,
  GitBranch,
  Sparkles
} from 'lucide-react';
import { 
  Checklist, 
  ChecklistVersion, 
  ChecklistCreateRequest, 
  ChecklistUpdateRequest,
  ChecklistItem
} from '@/types/common';
import { checklistsApi, checklistVersionsApi, checklistImprovementApi } from '@/services/checklistsApi';
import ChecklistEditorModal from '@/components/admin/ChecklistEditorModal';

const checklistTypes = {
  seo: 'SEO 평가',
  legal: '법적 준수',
  medical: '의학적 정확성',
  title: '제목 품질',
  content: '콘텐츠 품질'
};

export default function ChecklistManagementPage() {
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [showEditor, setShowEditor] = useState(false);
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [showVersions, setShowVersions] = useState<number | null>(null);
  const [showImprovement, setShowImprovement] = useState<number | null>(null);

  useEffect(() => {
    loadChecklists();
  }, []);

  const loadChecklists = async () => {
    try {
      setLoading(true);
      const response = await checklistsApi.getChecklists();
      setChecklists(response);
    } catch (error) {
      console.error('Failed to load checklists:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredChecklists = () => {
    let filtered = checklists || [];
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(c => c.checklist_type === selectedCategory);
    }
    return filtered;
  };

  const handleCreateChecklist = () => {
    setEditingChecklist(null);
    setShowEditor(true);
  };

  const handleEditChecklist = (checklist: Checklist) => {
    setEditingChecklist(checklist);
    setShowEditor(true);
  };

  const handleToggleStatus = async (checklistId: number) => {
    try {
      await checklistsApi.toggleChecklistStatus(checklistId);
      await loadChecklists();
    } catch (error) {
      console.error('Failed to toggle checklist status:', error);
    }
  };

  const handleDeleteChecklist = async (checklistId: number) => {
    if (confirm('이 체크리스트를 삭제하시겠습니까?')) {
      try {
        await checklistsApi.deleteChecklist(checklistId);
        await loadChecklists();
      } catch (error) {
        console.error('Failed to delete checklist:', error);
      }
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
            <h1 className="text-3xl font-bold text-gray-900 mb-2">체크리스트 관리</h1>
            <p className="text-gray-600">
              AI 에이전트의 평가 체크리스트를 관리하고 성능을 최적화합니다.
            </p>
          </div>
          <Button onClick={handleCreateChecklist}>
              <Plus className="w-4 h-4 mr-2" />
            새 체크리스트
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
          {Object.entries(checklistTypes).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <div className="flex gap-4 ml-auto">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">
              {(checklists || []).filter(c => c.is_active).length}
            </div>
            <div className="text-sm text-gray-600">활성 체크리스트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(checklists || []).filter(c => !c.is_active).length}
            </div>
            <div className="text-sm text-gray-600">비활성 체크리스트</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">
              {(checklists || []).length}
            </div>
            <div className="text-sm text-gray-600">전체 체크리스트</div>
          </div>
        </div>
      </div>

      {/* 체크리스트 목록 */}
      <div className="space-y-6">
        {filteredChecklists().map((checklist) => (
          <Card key={checklist.id} className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {checklist.name}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    checklist.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {checklist.is_active ? '활성' : '비활성'}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">카테고리:</span> {checklistTypes[checklist.checklist_type as keyof typeof checklistTypes] || checklist.checklist_type}
                  {checklist.subcategory && (
                    <span className="ml-2">
                      <span className="font-medium">서브카테고리:</span> {checklist.subcategory}
                    </span>
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <span className="font-medium">체크리스트 항목:</span> {checklist.checklist_items.length}개
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowVersions(showVersions === checklist.id ? null : checklist.id)}
                >
                  <History className="w-4 h-4 mr-1" />
                  버전
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setShowImprovement(showImprovement === checklist.id ? null : checklist.id)}
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  개선
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditChecklist(checklist)}>
                  <Edit className="w-4 h-4 mr-1" />
                  편집
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleToggleStatus(checklist.id)}
                >
                  {checklist.is_active ? '비활성화' : '활성화'}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => handleDeleteChecklist(checklist.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  삭제
                </Button>
              </div>
            </div>

            {/* 체크리스트 항목 미리보기 */}
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="text-sm text-gray-700">
                {(() => {
                  const items = checklist.checklist_items;
                  if (!items) return <div className="text-gray-500">항목이 없습니다.</div>;
                  
                  // 객체인 경우 키-값 쌍을 배열로 변환
                  const itemArray = Array.isArray(items) ? items : Object.entries(items);
                  const displayItems = itemArray.slice(0, 3);
                  
                  return (
                    <>
                      {displayItems.map((item, index) => {
                        const itemData = Array.isArray(item) ? item[1] : item;
                        const itemKey = Array.isArray(item) ? item[0] : item.id || index;
                        const itemName = itemData?.name || itemData?.item || itemData?.description || `항목 ${index + 1}`;
                        const itemWeight = itemData?.weight || 1;
                        
                        return (
                          <div key={itemKey} className="flex items-center gap-2 mb-1">
                            <CheckSquare className="w-4 h-4 text-gray-400" />
                            <span>{itemName}</span>
                            <span className="text-xs text-gray-500">(가중치: {itemWeight})</span>
                          </div>
                        );
                      })}
                      {itemArray.length > 3 && (
                        <div className="text-xs text-gray-500 mt-2">
                          ... 외 {itemArray.length - 3}개 항목
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>
            </div>

            {/* 버전 관리 섹션 */}
            {showVersions === checklist.id && (
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
            {showImprovement === checklist.id && (
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
                      onClick={() => {/* handleAnalyzeQuality(checklist.id) */}}
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

      {/* 체크리스트 편집기 모달 */}
      {showEditor && (
        <ChecklistEditorModal
          checklist={editingChecklist}
          onClose={() => setShowEditor(false)}
          onSave={async (data) => {
            try {
              if (editingChecklist) {
                await checklistsApi.updateChecklist(editingChecklist.id, data as ChecklistUpdateRequest);
              } else {
                await checklistsApi.createChecklist(data as ChecklistCreateRequest);
              }
              await loadChecklists();
              setShowEditor(false);
            } catch (error) {
              console.error('Failed to save checklist:', error);
            }
          }}
        />
      )}
    </div>
  );
}
