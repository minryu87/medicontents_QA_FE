/**
 * 포스트 일정 상세 관리 인터페이스
 * 마감일 조정, 우선순위 변경, 일정 변경 이력 표시
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import {
  Calendar,
  Clock,
  TrendingUp,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  History,
  Edit3,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react';
import { adminApi } from '@/services/api';
import type {
  PostSchedule,
  PostScheduleDetail,
  ScheduleChangeHistory,
  PriorityDistribution
} from '@/types/common';

interface ScheduleDeadlineEditorProps {
  schedule: PostScheduleDetail;
  onSave: (updates: Partial<PostSchedule>) => Promise<void>;
  onRefresh: () => void;
}

export function ScheduleDeadlineEditor({
  schedule,
  onSave,
  onRefresh
}: ScheduleDeadlineEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    scheduled_date: schedule.schedule.scheduled_date || '',
    material_deadline: schedule.deadlines.material || '',
    guide_deadline: schedule.deadlines.guide || '',
    ai_deadline: schedule.deadlines.ai || '',
    admin_review_deadline: schedule.deadlines.admin_review || '',
    client_review_deadline: schedule.deadlines.client_review || '',
    final_revision_deadline: schedule.deadlines.final_revision || '',
  });
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave({
        scheduled_date: formData.scheduled_date || null,
        material_deadline: formData.material_deadline || null,
        guide_deadline: formData.guide_deadline || null,
        ai_deadline: formData.ai_deadline || null,
        admin_review_deadline: formData.admin_review_deadline || null,
        client_review_deadline: formData.client_review_deadline || null,
        final_revision_deadline: formData.final_revision_deadline || null,
      });
      setIsEditing(false);
    } catch (error) {
      console.error('마감일 저장 실패:', error);
    } finally {
      setSaving(false);
    }
  };

  const getStatusColor = (deadline: string | null, completedAt: string | null) => {
    if (completedAt) return 'text-green-600';
    if (!deadline) return 'text-gray-400';

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'text-red-600';
    if (daysDiff <= 1) return 'text-orange-600';
    if (daysDiff <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getStatusText = (deadline: string | null, completedAt: string | null) => {
    if (completedAt) return '완료';
    if (!deadline) return '미설정';

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return `${Math.abs(daysDiff)}일 초과`;
    if (daysDiff === 0) return '오늘 마감';
    if (daysDiff === 1) return '내일 마감';
    return `${daysDiff}일 남음`;
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">마감일 설정</h3>
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
                    scheduled_date: schedule.schedule.scheduled_date || '',
                    material_deadline: schedule.deadlines.material || '',
                    guide_deadline: schedule.deadlines.guide || '',
                    ai_deadline: schedule.deadlines.ai || '',
                    admin_review_deadline: schedule.deadlines.admin_review || '',
                    client_review_deadline: schedule.deadlines.client_review || '',
                    final_revision_deadline: schedule.deadlines.final_revision || '',
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
        {/* 게시 일정 */}
        <div className="p-4 bg-blue-50 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-blue-900">게시 일정</span>
            {schedule.schedule.scheduled_date && (
              <span className={`text-sm ${getStatusColor(schedule.schedule.scheduled_date, schedule.schedule.published_date)}`}>
                {getStatusText(schedule.schedule.scheduled_date, schedule.schedule.published_date)}
              </span>
            )}
          </div>
          {isEditing ? (
            <Input
              type="datetime-local"
              value={formData.scheduled_date}
              onChange={(e) => setFormData(prev => ({ ...prev, scheduled_date: e.target.value }))}
              className="w-full"
            />
          ) : (
            <div className="text-sm text-blue-800">
              {schedule.schedule.scheduled_date
                ? new Date(schedule.schedule.scheduled_date).toLocaleString()
                : '미설정'
              }
            </div>
          )}
        </div>

        {/* 단계별 마감일 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'material', label: '자료 수집', deadline: schedule.deadlines.material, completed: schedule.completed_at.material },
            { key: 'guide', label: '가이드 제공', deadline: schedule.deadlines.guide, completed: schedule.completed_at.guide },
            { key: 'ai', label: 'AI 생성', deadline: schedule.deadlines.ai, completed: schedule.completed_at.ai },
            { key: 'admin_review', label: '관리자 검토', deadline: schedule.deadlines.admin_review, completed: schedule.completed_at.admin_review },
            { key: 'client_review', label: '클라이언트 검토', deadline: schedule.deadlines.client_review, completed: schedule.completed_at.client_review },
            { key: 'final_revision', label: '최종 수정', deadline: schedule.deadlines.final_revision, completed: schedule.completed_at.final_revision },
          ].map(({ key, label, deadline, completed }) => (
            <div key={key} className="p-3 border rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-900">{label}</span>
                <span className={`text-xs ${getStatusColor(deadline, completed)}`}>
                  {getStatusText(deadline, completed)}
                </span>
              </div>
              {isEditing ? (
                <Input
                  type="datetime-local"
                  value={formData[`${key}_deadline` as keyof typeof formData] as string}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    [`${key}_deadline`]: e.target.value
                  }))}
                  className="w-full text-sm"
                />
              ) : (
                <div className="text-sm text-gray-600">
                  {deadline ? new Date(deadline).toLocaleString() : '미설정'}
                </div>
              )}
              {completed && (
                <div className="mt-1 text-xs text-green-600">
                  완료: {new Date(completed).toLocaleString()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

interface PriorityControllerProps {
  currentPriority: number;
  postId: string;
  onPriorityChanged: (newPriority: number) => void;
}

export function PriorityController({
  currentPriority,
  postId,
  onPriorityChanged
}: PriorityControllerProps) {
  const [changing, setChanging] = useState(false);

  const priorityLabels = {
    1: '보통',
    2: '높음',
    3: '긴급'
  };

  const priorityColors = {
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-orange-100 text-orange-800',
    3: 'bg-red-100 text-red-800'
  };

  const handlePriorityChange = async (newPriority: number) => {
    if (newPriority === currentPriority) return;

    setChanging(true);
    try {
      await adminApi.updatePostPriority(postId, {
        priority: newPriority,
        reason: `수동 우선순위 조정: ${priorityLabels[currentPriority as keyof typeof priorityLabels]} → ${priorityLabels[newPriority as keyof typeof priorityLabels]}`
      });
      onPriorityChanged(newPriority);
    } catch (error) {
      console.error('우선순위 변경 실패:', error);
    } finally {
      setChanging(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <TrendingUp className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">우선순위 설정</h3>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${priorityColors[currentPriority as keyof typeof priorityColors]}`}>
            <span className="mr-2">현재 우선순위:</span>
            <span className="font-bold">{priorityLabels[currentPriority as keyof typeof priorityLabels]}</span>
          </div>
        </div>

        <div className="flex justify-center space-x-2">
          {[1, 2, 3].map((priority) => (
            <Button
              key={priority}
              variant={priority === currentPriority ? 'default' : 'outline'}
              size="sm"
              onClick={() => handlePriorityChange(priority)}
              disabled={changing}
              className="flex items-center space-x-1"
            >
              {priority === 1 && <Minus className="w-4 h-4" />}
              {priority === 2 && <ArrowUp className="w-4 h-4" />}
              {priority === 3 && <AlertTriangle className="w-4 h-4" />}
              <span>{priorityLabels[priority as keyof typeof priorityLabels]}</span>
            </Button>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">우선순위 안내</h4>
          <div className="space-y-2 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <Minus className="w-4 h-4 text-blue-500" />
              <span><strong>보통:</strong> 정상적인 작업 우선순위</span>
            </div>
            <div className="flex items-center space-x-2">
              <ArrowUp className="w-4 h-4 text-orange-500" />
              <span><strong>높음:</strong> 빠른 처리가 필요한 작업</span>
            </div>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 text-red-500" />
              <span><strong>긴급:</strong> 즉시 처리가 필요한 작업</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface ScheduleHistoryViewerProps {
  postId: string;
}

export function ScheduleHistoryViewer({ postId }: ScheduleHistoryViewerProps) {
  const [history, setHistory] = useState<ScheduleChangeHistory | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHistory();
  }, [postId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      // TODO: API 연동 후 실제 데이터로 교체
      // const data = await adminApi.getScheduleHistory(postId);
      // setHistory(data.data);

      // 임시 더미 데이터
      const dummyHistory = {
        changes: [
          {
            id: 1,
            change_type: 'deadline_extended',
            old_value: '2025-01-17T18:00:00Z',
            new_value: '2025-01-18T18:00:00Z',
            reason: '작업자 일정으로 인한 연장',
            changed_by: 1,
            created_at: '2025-01-15T09:30:00Z'
          },
          {
            id: 2,
            change_type: 'priority_changed',
            old_value: '1',
            new_value: '2',
            reason: '치료 사례가 긴급하여 우선순위 상승',
            changed_by: 1,
            created_at: '2025-01-14T14:20:00Z'
          }
        ],
        total: 2,
        page: 1,
        size: 10
      };
      setHistory(dummyHistory);
    } catch (error) {
      console.error('일정 변경 이력 로드 실패:', error);
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

  if (!history || history.changes.length === 0) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <History className="w-5 h-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">일정 변경 이력</h3>
          </div>
        </div>
        <div className="text-center py-8">
          <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">일정 변경 이력이 없습니다.</p>
        </div>
      </Card>
    );
  }

  const getChangeTypeLabel = (changeType: string) => {
    const labels: { [key: string]: string } = {
      'deadline_adjusted': '마감일 조정',
      'priority_changed': '우선순위 변경',
      'status_updated': '상태 업데이트'
    };
    return labels[changeType] || changeType;
  };

  const getChangeTypeColor = (changeType: string) => {
    const colors: { [key: string]: string } = {
      'deadline_adjusted': 'text-blue-600',
      'priority_changed': 'text-purple-600',
      'status_updated': 'text-green-600'
    };
    return colors[changeType] || 'text-gray-600';
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-gray-600" />
          <h3 className="text-lg font-semibold text-gray-900">일정 변경 이력</h3>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={loadHistory}
        >
          <RefreshCw className="w-4 h-4 mr-1" />
          새로고침
        </Button>
      </div>

      <div className="space-y-4">
        {history.changes.map((change) => (
          <div key={change.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center space-x-2">
                <span className={`text-sm font-medium ${getChangeTypeColor(change.change_type)}`}>
                  {getChangeTypeLabel(change.change_type)}
                </span>
                <span className="text-xs text-gray-500">
                  {new Date(change.created_at).toLocaleString()}
                </span>
              </div>
            </div>

            {change.old_value && change.new_value && (
              <div className="mb-2">
                <div className="text-sm text-gray-600 mb-1">변경 내용:</div>
                <div className="flex items-center space-x-2 text-sm">
                  <span className="text-red-600 line-through">{change.old_value}</span>
                  <span className="text-gray-400">→</span>
                  <span className="text-green-600 font-medium">{change.new_value}</span>
                </div>
              </div>
            )}

            {change.reason && (
              <div className="text-sm text-gray-600">
                <span className="font-medium">사유:</span> {change.reason}
              </div>
            )}

            {change.changed_by && (
              <div className="text-xs text-gray-500 mt-2">
                변경자 ID: {change.changed_by}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 text-center text-sm text-gray-500">
        총 {history.total}개의 변경 이력 (페이지 {history.page}/{Math.ceil(history.total / history.size)})
      </div>
    </Card>
  );
}

interface PostScheduleManagerProps {
  postId: string;
  onScheduleUpdated: () => void;
}

export function PostScheduleManager({
  postId,
  onScheduleUpdated
}: PostScheduleManagerProps) {
  const [schedule, setSchedule] = useState<PostScheduleDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSchedule();
  }, [postId]);

  const loadSchedule = async () => {
    try {
      setLoading(true);
      setError(null);
      // TODO: API 연동 후 실제 데이터로 교체
      // const data = await adminApi.getPostSchedule(postId);
      // setSchedule(data.data);

      // 임시 더미 데이터
      const dummyData = {
        post_id: postId,
        schedule: {
          scheduled_date: '2025-01-20T09:00:00Z',
          published_date: null,
          priority: 2,
          delay_status: 'on_track'
        },
        deadlines: {
          material: '2025-01-15T18:00:00Z',
          guide: '2025-01-17T18:00:00Z',
          ai: '2025-01-18T18:00:00Z',
          admin_review: '2025-01-19T18:00:00Z',
          client_review: '2025-01-19T18:00:00Z',
          final_revision: '2025-01-20T08:00:00Z'
        },
        completed_at: {
          material: '2025-01-15T16:30:00Z',
          guide: null,
          ai: null,
          admin_review: null,
          client_review: null,
          final_revision: null
        },
        stage_status: {
          material: 'completed',
          guide: 'due_soon',
          ai: 'pending',
          admin_review: 'pending',
          client_review: 'pending',
          final_revision: 'pending'
        },
        next_stage: {
          stage: 'guide',
          deadline: '2025-01-17T18:00:00Z',
          days_remaining: 2
        },
        recommended_actions: [
          {
            type: 'reminder',
            stage: 'guide',
            action: '가이드 입력 마감 2일 전',
            reason: '마감 임박 알림'
          }
        ]
      };
      setSchedule(dummyData);
    } catch (err) {
      console.error('일정 로드 실패:', err);
      setError('일정 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleSave = async (updates: Partial<PostSchedule>) => {
    try {
      await adminApi.updatePostSchedule(postId, updates);
      await loadSchedule();
      onScheduleUpdated();
    } catch (error) {
      console.error('일정 저장 실패:', error);
      throw error;
    }
  };

  const handlePriorityChanged = (newPriority: number) => {
    if (schedule) {
      setSchedule({
        ...schedule,
        schedule: {
          ...schedule.schedule,
          priority: newPriority
        }
      });
    }
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

  if (error || !schedule) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <p className="text-gray-600">{error || '일정 정보를 불러올 수 없습니다.'}</p>
          <Button onClick={loadSchedule} className="mt-4">
            다시 시도
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 일정 개요 */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-semibold text-gray-900">일정 개요</h3>
          </div>
          <div className="flex space-x-2">
            <Badge variant={schedule.schedule.delay_status === 'on_track' ? 'success' :
                           schedule.schedule.delay_status === 'at_risk' ? 'warning' : 'error'}>
              {schedule.schedule.delay_status === 'on_track' ? '정상' :
               schedule.schedule.delay_status === 'at_risk' ? '위험' : '지연'}
            </Badge>
            <Badge variant="info">
              우선순위 {schedule.schedule.priority}
            </Badge>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 mb-1">
              {schedule.next_stage ? Math.max(0, schedule.next_stage.days_remaining) : '-'}
            </div>
            <div className="text-sm text-gray-600">
              {schedule.next_stage ? `${schedule.next_stage.stage}까지 남은 일수` : '다음 단계 없음'}
            </div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600 mb-1">
              {schedule.schedule.scheduled_date ?
                new Date(schedule.schedule.scheduled_date).toLocaleDateString() : '미설정'}
            </div>
            <div className="text-sm text-gray-600">게시 예정일</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold text-green-600 mb-1">
              {Object.values(schedule.completed_at).filter(Boolean).length}
            </div>
            <div className="text-sm text-gray-600">완료된 단계</div>
          </div>
        </div>

        {schedule.recommended_actions.length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <h4 className="text-sm font-medium text-yellow-900 mb-2">권장 조치</h4>
            <div className="space-y-2">
              {schedule.recommended_actions.map((action, index) => (
                <div key={index} className="flex items-start space-x-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-yellow-800">
                    <span className="font-medium">{action.stage}:</span> {action.action}
                    <span className="text-yellow-600"> ({action.reason})</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* 마감일 편집 */}
      <ScheduleDeadlineEditor
        schedule={schedule}
        onSave={handleScheduleSave}
        onRefresh={loadSchedule}
      />

      {/* 우선순위 제어 */}
      <PriorityController
        currentPriority={schedule.schedule.priority}
        postId={postId}
        onPriorityChanged={handlePriorityChanged}
      />

      {/* 변경 이력 */}
      <ScheduleHistoryViewer postId={postId} />
    </div>
  );
}
