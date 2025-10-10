'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { X, Save, Eye, Plus, Trash } from 'lucide-react';
import { Checklist, ChecklistCreateRequest, ChecklistUpdateRequest, ChecklistItem } from '@/types/common';

interface ChecklistEditorModalProps {
  checklist?: Checklist | null;
  onClose: () => void;
  onSave: (data: ChecklistCreateRequest | ChecklistUpdateRequest) => void;
}

const agentTypes = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

export default function ChecklistEditorModal({ checklist, onClose, onSave }: ChecklistEditorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    checklist_items: [] as Omit<ChecklistItem, 'id'>[],
    is_active: true
  });
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (checklist) {
      setFormData({
        name: checklist.name,
        category: checklist.checklist_type,
        subcategory: checklist.subcategory || '',
        checklist_items: (() => {
          const items = checklist.checklist_items;
          if (!items) return [];
          
          // 배열인 경우 그대로 사용
          if (Array.isArray(items)) {
            return items.map(item => ({
              category: item.category || '',
              item: item.item || item.name || '',
              weight: item.weight || 1,
              description: item.description || ''
            }));
          }
          
          // 객체인 경우 키-값 쌍을 배열로 변환
          return Object.entries(items).map(([key, itemData]: [string, any]) => ({
            category: itemData.category || '',
            item: itemData.item || itemData.name || key,
            weight: itemData.weight || 1,
            description: itemData.description || ''
          }));
        })(),
        is_active: checklist.is_active
      });
    }
  }, [checklist]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      ...formData,
      subcategory: formData.subcategory || undefined
    };

    onSave(data);
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const addChecklistItem = () => {
    setFormData(prev => ({
      ...prev,
      checklist_items: [...prev.checklist_items, {
        category: 'general',
        item: '',
        weight: 1.0,
        description: ''
      }]
    }));
  };

  const updateChecklistItem = (index: number, field: keyof Omit<ChecklistItem, 'id'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const removeChecklistItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      checklist_items: prev.checklist_items.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {checklist ? '체크리스트 편집' : '새 체크리스트 생성'}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              <Eye className="w-4 h-4 mr-1" />
              {showPreview ? '편집' : '미리보기'}
            </Button>
            <Button variant="outline" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* 내용 */}
        <div className="flex-1 overflow-y-auto p-6">
          {showPreview ? (
            <div className="space-y-4">
              <Card className="p-4">
                <h3 className="font-semibold text-lg mb-2">{formData.name || '제목 없음'}</h3>
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">카테고리:</span> {agentTypes[formData.category as keyof typeof agentTypes] || formData.category}
                  {formData.subcategory && (
                    <span className="ml-2">
                      <span className="font-medium">서브카테고리:</span> {formData.subcategory}
                    </span>
                  )}
                </div>
                <div className="space-y-2">
                  {formData.checklist_items.map((item, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <div className="w-4 h-4 border border-gray-300 rounded"></div>
                      <span className="text-sm">{item.item}</span>
                      <span className="text-xs text-gray-500">(가중치: {item.weight})</span>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    체크리스트 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="체크리스트 이름을 입력하세요"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    카테고리 *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">카테고리를 선택하세요</option>
                    {Object.entries(agentTypes).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  서브카테고리
                </label>
                <input
                  type="text"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="서브카테고리 (선택사항)"
                />
              </div>

              {/* 체크리스트 항목 */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-medium text-gray-700">
                    체크리스트 항목 *
                  </label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addChecklistItem}
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    항목 추가
                  </Button>
                </div>
                
                <div className="space-y-3">
                  {formData.checklist_items.map((item, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-medium text-gray-700">항목 {index + 1}</span>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => removeChecklistItem(index)}
                          className="text-red-600 hover:text-red-700"
                        >
                          <Trash className="w-4 h-4" />
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            카테고리
                          </label>
                          <select
                            value={item.category}
                            onChange={(e) => updateChecklistItem(index, 'category', e.target.value)}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          >
                            <option value="general">일반</option>
                            <option value="medical">의료법</option>
                            <option value="seo">SEO</option>
                            <option value="readability">가독성</option>
                            <option value="tone">톤앤매너</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-600 mb-1">
                            가중치
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            min="0.1"
                            max="5.0"
                            value={item.weight}
                            onChange={(e) => updateChecklistItem(index, 'weight', parseFloat(e.target.value))}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          />
                        </div>
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          체크리스트 항목 *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.item}
                          onChange={(e) => updateChecklistItem(index, 'item', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          placeholder="체크리스트 항목을 입력하세요"
                        />
                      </div>
                      
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          설명
                        </label>
                        <textarea
                          value={item.description}
                          onChange={(e) => updateChecklistItem(index, 'description', e.target.value)}
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                          rows={2}
                          placeholder="항목에 대한 설명 (선택사항)"
                        />
                      </div>
                    </div>
                  ))}
                  
                  {formData.checklist_items.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <p>체크리스트 항목이 없습니다.</p>
                      <p className="text-sm">"항목 추가" 버튼을 클릭하여 항목을 추가하세요.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 활성화 상태 */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={formData.is_active}
                  onChange={(e) => handleInputChange('is_active', e.target.checked)}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                  활성화
                </label>
              </div>
            </form>
          )}
        </div>

        {/* 푸터 */}
        {!showPreview && (
          <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
            <Button variant="outline" onClick={onClose}>
              취소
            </Button>
            <Button variant="primary" onClick={handleSubmit}>
              <Save className="w-4 h-4 mr-2" />
              {checklist ? '저장' : '생성'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
