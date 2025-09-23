/**
 * 캠페인 일정 관리 인터페이스
 * 일정 템플릿 편집, 단계별 마감일 설정, 우선순위 조정
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import {
  Calendar,
  Settings,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  TrendingUp,
  Edit3,
  Plus,
  Minus
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type {
  CampaignScheduleTemplate,
  Campaign,
  PostSchedule
} from '@/types/common';

interface ScheduleTemplateEditorProps {
  campaignId: number;
  template: CampaignScheduleTemplate | null;
  onSave: (template: Partial<CampaignScheduleTemplate>) => Promise<void>;
  onRefresh: () => void;
}

export function ScheduleTemplateEditor({
  campaignId,
  template,
  onSave,
  onRefresh
}: ScheduleTemplateEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    material_collection_days: template?.material_collection_days || 3,
    admin_guide_days: template?.admin_guide_days || 2,
    ai_generation_days: template?.ai_generation_days || 1,
    admin_review_days: template?.admin_review_days || 2,
    client_review_days: template?.client_review_days || 3,
    final_revision_days: template?.final_revision_days || 1,
    buffer_days: template?.buffer_days || 2,
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(formData);
      setIsEditing(false);
    } catch (error) {
      console.error('템플릿 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  const totalDays = Object.values(formData).reduce((sum, days) => sum + days, 0);

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Settings className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">일정 템플릿 설정</h3>
        </div>
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={saving}
          >
            <RefreshCw className="w-4 h-4 mr-1" />
            새로고침
          </Button>
          {!isEditing ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 className="w-4 h-4 mr-1" />
              편집
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setFormData({
                    material_collection_days: template?.material_collection_days || 3,
                    admin_guide_days: template?.admin_guide_days || 2,
                    ai_generation_days: template?.ai_generation_days || 1,
                    admin_review_days: template?.admin_review_days || 2,
                    client_review_days: template?.client_review_days || 3,
                    final_revision_days: template?.final_revision_days || 1,
                    buffer_days: template?.buffer_days || 2,
                  });
                }}
                disabled={saving}
              >
                취소
              </Button>
              <Button
                size="sm"
                onClick={handleSave}
                disabled={saving}
              >
                <Save className="w-4 h-4 mr-1" />
                {saving ? '저장 중...' : '저장'}
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              자료 수집
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.material_collection_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  material_collection_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.material_collection_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              가이드 제공
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="14"
                value={formData.admin_guide_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  admin_guide_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.admin_guide_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              AI 생성
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="7"
                value={formData.ai_generation_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  ai_generation_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.ai_generation_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              관리자 검토
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="14"
                value={formData.admin_review_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  admin_review_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.admin_review_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              클라이언트 검토
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="14"
                value={formData.client_review_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  client_review_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.client_review_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              최종 수정
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="1"
                max="7"
                value={formData.final_revision_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  final_revision_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.final_revision_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              버퍼 기간
            </label>
            {isEditing ? (
              <Input
                type="number"
                min="0"
                max="14"
                value={formData.buffer_days}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  buffer_days: parseInt(e.target.value) || 0
                }))}
                className="w-full"
              />
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                {formData.buffer_days}일
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              총 기간
            </label>
            <div className="text-2xl font-bold text-blue-600">
              {totalDays}일
            </div>
          </div>
        </div>

        {!isEditing && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <div className="text-sm font-medium text-blue-900 mb-1">
                  일정 템플릿 적용 안내
                </div>
                <p className="text-sm text-blue-800">
                  이 템플릿은 새로운 캠페인 생성 시 자동으로 적용되며, 기존 캠페인에도 수동으로 적용할 수 있습니다.
                  각 단계의 기간을 조정하여 프로젝트 일정을 최적화할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}

interface CampaignSchedulePlannerProps {
  campaign: Campaign;
  onPlanGenerated: () => void;
}

export function CampaignSchedulePlanner({ campaign, onPlanGenerated }: CampaignSchedulePlannerProps) {
  const [planning, setPlanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlanSchedule = async () => {
    setPlanning(true);
    setError(null);

    try {
      await adminApi.planCampaignSchedule(campaign.id);
      onPlanGenerated();
    } catch (err) {
      console.error('일정 계획 실패:', err);
      setError('일정 계획 생성에 실패했습니다.');
    } finally {
      setPlanning(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900">캠페인 일정 계획</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            캠페인 정보
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">기간:</span>
              <div className="font-medium">
                {new Date(campaign.start_date).toLocaleDateString()} - {new Date(campaign.end_date).toLocaleDateString()}
              </div>
            </div>
            <div>
              <span className="text-gray-600">목표 포스트:</span>
              <div className="font-medium">{campaign.target_post_count}개</div>
            </div>
            <div>
              <span className="text-gray-600">완료 포스트:</span>
              <div className="font-medium">{campaign.completed_post_count}개</div>
            </div>
            <div>
              <span className="text-gray-600">진행률:</span>
              <div className="font-medium">
                {campaign.target_post_count > 0
                  ? Math.round(((campaign.completed_post_count || 0) / campaign.target_post_count) * 100)
                  : 0}%
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-red-600" />
              <span className="text-sm text-red-800">{error}</span>
            </div>
          </div>
        )}

        <div className="flex justify-end">
          <Button
            onClick={handlePlanSchedule}
            disabled={planning}
            className="inline-flex items-center"
          >
            <Calendar className="w-4 h-4 mr-2" />
            {planning ? '일정 생성 중...' : '일정 계획 생성'}
          </Button>
        </div>
      </div>
    </Card>
  );
}

interface PostPriorityManagerProps {
  campaignId: number;
  onPriorityUpdated: () => void;
}

export function PostPriorityManager({ campaignId, onPriorityUpdated }: PostPriorityManagerProps) {
  const [distribution, setDistribution] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPriorityDistribution();
  }, [campaignId]);

  const loadPriorityDistribution = async () => {
    try {
      setLoading(true);
      // TODO: API 연동 후 실제 데이터로 교체
      // const data = await adminApi.getCampaignPriorityDistribution(campaignId);
      // setDistribution(data.data);

      // 임시 더미 데이터
      const dummyData = {
        distribution: {
          1: 15, // 일반 우선순위
          2: 8,  // 높음 우선순위
          3: 2   // 긴급 우선순위
        },
        percentages: {
          1: 60.0,
          2: 32.0,
          3: 8.0
        },
        total_posts: 25,
        generated_at: new Date().toISOString()
      };
      setDistribution(dummyData);
    } catch (error) {
      console.error('우선순위 분포 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </Card>
    );
  }

  if (!distribution) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">우선순위 데이터를 불러올 수 없습니다.</p>
        </div>
      </Card>
    );
  }

  const priorityLabels = {
    1: '보통',
    2: '높음',
    3: '긴급'
  };

  const priorityColors = {
    1: 'bg-blue-500',
    2: 'bg-orange-500',
    3: 'bg-red-500'
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">우선순위 분포</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadPriorityDistribution}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          새로고침
        </Button>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {Object.entries(distribution.distribution).map(([priority, count]) => {
            const percentage = distribution.percentages[priority] || 0;
            return (
              <div key={priority} className="text-center">
                <div className="relative mb-3">
                  <div className="w-20 h-20 mx-auto rounded-full bg-gray-200 flex items-center justify-center">
                    <div
                      className={`w-16 h-16 rounded-full ${priorityColors[priority as unknown as keyof typeof priorityColors]} flex items-center justify-center text-white font-bold`}
                    >
                      {count as number}
                    </div>
                  </div>
                </div>
                <div className="text-sm font-medium text-gray-900">
                  {priorityLabels[priority as unknown as keyof typeof priorityLabels]}
                </div>
                <div className="text-xs text-gray-500">
                  {percentage.toFixed(1)}%
                </div>
              </div>
            );
          })}
        </div>

        <div className="border-t pt-4">
          <div className="text-sm text-gray-600 mb-2">
            총 포스트: {distribution.total_posts}개
          </div>
          <div className="text-xs text-gray-500">
            마지막 업데이트: {new Date(distribution.generated_at).toLocaleString()}
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="text-sm font-medium text-yellow-900 mb-1">
                자동 우선순위 조정
              </div>
              <p className="text-sm text-yellow-800">
                마감일이 임박했거나 지연된 포스트는 자동으로 우선순위가 상향 조정됩니다.
                수동으로 우선순위를 변경할 수도 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface CampaignScheduleManagerProps {
  campaignId: number;
  campaign: Campaign;
  onScheduleUpdated: () => void;
}

export function CampaignScheduleManager({
  campaignId,
  campaign,
  onScheduleUpdated
}: CampaignScheduleManagerProps) {
  const [template, setTemplate] = useState<CampaignScheduleTemplate | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTemplate();
  }, [campaignId]);

  const loadTemplate = async () => {
    try {
      setLoading(true);
      // 템플릿 로드 로직 (API가 아직 없으므로 임시)
      // 실제로는 adminApi.getCampaignScheduleTemplate(campaignId) 같은 API 필요
      setTemplate(null); // 임시로 null 설정
    } catch (error) {
      console.error('템플릿 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTemplateSave = async (templateData: Partial<CampaignScheduleTemplate>) => {
    // 템플릿 저장 로직 (API 구현 필요)
    console.log('템플릿 저장:', templateData);
    await loadTemplate();
    onScheduleUpdated();
  };

  const handlePlanGenerated = () => {
    loadTemplate();
    onScheduleUpdated();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {[1, 2, 3].map(i => (
          <Card key={i} className="p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 일정 템플릿 편집 */}
      <ScheduleTemplateEditor
        campaignId={campaignId}
        template={template}
        onSave={handleTemplateSave}
        onRefresh={loadTemplate}
      />

      {/* 캠페인 일정 계획 */}
      <CampaignSchedulePlanner
        campaign={campaign}
        onPlanGenerated={handlePlanGenerated}
      />

      {/* 우선순위 관리 */}
      <PostPriorityManager
        campaignId={campaignId}
        onPriorityUpdated={onScheduleUpdated}
      />
    </div>
  );
}
