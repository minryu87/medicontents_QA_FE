'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { X, Save, Eye } from 'lucide-react';
import { Prompt, PromptCreateRequest, PromptUpdateRequest } from '@/types/common';

interface PromptEditorModalProps {
  prompt?: Prompt | null;
  onClose: () => void;
  onSave: (data: PromptCreateRequest | PromptUpdateRequest) => void;
}

const agentTypes = {
  input: '입력 처리',
  plan: '계획 수립',
  title: '제목 생성',
  content: '콘텐츠 생성',
  evaluation: '품질 평가',
  edit: '수정 작업'
};

export default function PromptEditorModal({ prompt, onClose, onSave }: PromptEditorModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    prompt_text: '',
    variables: [] as string[],
    is_active: true
  });
  const [variablesInput, setVariablesInput] = useState('');
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (prompt) {
      setFormData({
        name: prompt.name,
        category: prompt.category,
        subcategory: prompt.subcategory || '',
        prompt_text: prompt.prompt_text,
        variables: prompt.variables,
        is_active: prompt.is_active
      });
      setVariablesInput((prompt.variables || []).join(', '));
    }
  }, [prompt]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const variables = variablesInput
      .split(',')
      .map(v => v.trim())
      .filter(v => v.length > 0);

    const data = {
      ...formData,
      variables,
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* 헤더 */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {prompt ? '프롬프트 편집' : '새 프롬프트 생성'}
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
                <div className="text-sm text-gray-600 mb-4">
                  <span className="font-medium">변수:</span> {formData.variables.join(', ')}
                </div>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="text-sm text-gray-700 font-mono whitespace-pre-wrap">
                    {formData.prompt_text || '프롬프트 내용이 없습니다.'}
                  </div>
                </div>
              </Card>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    프롬프트 이름 *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="프롬프트 이름을 입력하세요"
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

              {/* 프롬프트 내용 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  프롬프트 내용 *
                </label>
                <textarea
                  required
                  value={formData.prompt_text}
                  onChange={(e) => handleInputChange('prompt_text', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md h-64 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="프롬프트를 입력하세요..."
                />
                <div className="text-xs text-gray-500 mt-1">
                  변수는 {'{변수명}'} 형태로 사용하세요. 예: {'{topic}'}, {'{length}'}
                </div>
              </div>

              {/* 변수 설정 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  변수 목록
                </label>
                <input
                  type="text"
                  value={variablesInput}
                  onChange={(e) => setVariablesInput(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="topic, length, style (쉼표로 구분)"
                />
                <div className="text-xs text-gray-500 mt-1">
                  프롬프트에서 사용할 변수들을 쉼표로 구분하여 입력하세요
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
              {prompt ? '저장' : '생성'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
