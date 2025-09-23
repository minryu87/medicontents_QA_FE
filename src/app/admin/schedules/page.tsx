'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';

// Phase 4에서 만든 컴포넌트들 import
import { ScheduleCalendar, MiniScheduleCalendar } from '@/components/admin/ScheduleCalendar';
import { ScheduleNotificationCenter, NotificationSummaryCard } from '@/components/admin/ScheduleNotificationCenter';
import { ScheduleMetricsDashboard } from '@/components/admin/ScheduleMetrics';
import { PipelineRealtimeMonitor, CompactPipelineMonitor } from '@/components/admin/PipelineRealtimeMonitor';
import { CampaignScheduleManager } from '@/components/admin/CampaignScheduleManager';
import { PostScheduleManager } from '@/components/admin/PostScheduleManager';

// 데모용 더미 데이터
import type { PostSchedule, ScheduleNotification, Campaign } from '@/types/common';

const dummySchedules: PostSchedule[] = [
  {
    id: 1,
    post_id: 'QA_001',
    hospital_id: 1,
    scheduled_date: '2024-09-25T10:00:00Z',
    material_deadline: '2024-09-22T18:00:00Z',
    guide_deadline: '2024-09-23T18:00:00Z',
    ai_deadline: '2024-09-24T18:00:00Z',
    admin_review_deadline: '2024-09-24T18:00:00Z',
    client_review_deadline: '2024-09-25T08:00:00Z',
    final_revision_deadline: '2024-09-25T09:00:00Z',
    priority: 2,
    delay_status: 'on_track',
    created_at: '2024-09-20T10:00:00Z',
    status: 'pending',
    notes: '테스트 일정 1',
  },
  {
    id: 2,
    post_id: 'QA_002',
    hospital_id: 2,
    scheduled_date: '2024-09-26T14:00:00Z',
    material_deadline: '2024-09-23T18:00:00Z',
    guide_deadline: '2024-09-24T18:00:00Z',
    ai_deadline: '2024-09-25T18:00:00Z',
    admin_review_deadline: '2024-09-25T18:00:00Z',
    client_review_deadline: '2024-09-26T12:00:00Z',
    final_revision_deadline: '2024-09-26T13:00:00Z',
    priority: 1,
    delay_status: 'at_risk',
    created_at: '2024-09-21T10:00:00Z',
    status: 'pending',
    notes: '테스트 일정 2',
  }
];

const dummyNotifications: ScheduleNotification[] = [
  {
    id: 1,
    post_id: 'QA_001',
    post_title: '치아 신경치료의 모든 것',
    notification_type: 'deadline_approaching',
    stage: 'material',
    scheduled_at: '2024-09-22T18:00:00Z',
    sent_at: null,
    status: 'pending',
    priority: 2,
    campaign_id: 1,
    created_at: '2024-09-20T09:00:00Z',
  },
  {
    id: 2,
    post_id: 'QA_002',
    post_title: '임플란트 수술 전 주의사항',
    notification_type: 'overdue',
    stage: 'ai',
    scheduled_at: '2024-09-25T18:00:00Z',
    sent_at: '2024-09-25T20:00:00Z',
    status: 'sent',
    priority: 3,
    campaign_id: 1,
    created_at: '2024-09-25T08:00:00Z',
  }
];

const dummyCampaign: Campaign = {
  id: 1,
  name: '2024년 가을 치과 캠페인',
  description: '치과 진료 가이드 콘텐츠 제작',
  hospital_id: 1,
  start_date: '2024-09-01',
  end_date: '2024-12-31',
  target_post_count: 50,
  completed_post_count: 0,
  status: 'active',
  created_at: '2024-09-01T00:00:00Z',
  updated_at: '2024-09-20T00:00:00Z',
};

export default function AdminSchedulesPage() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'calendar' | 'notifications' | 'campaigns' | 'posts' | 'pipeline'>('dashboard');
  const [schedules, setSchedules] = useState<PostSchedule[]>(dummySchedules);
  const [notifications, setNotifications] = useState<ScheduleNotification[]>(dummyNotifications);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<number | null>(null);

  const tabs = [
    { id: 'dashboard', label: '대시보드', icon: '📊' },
    { id: 'calendar', label: '캘린더', icon: '📅' },
    { id: 'notifications', label: '알림센터', icon: '🔔' },
    { id: 'campaigns', label: '캠페인 일정', icon: '🎯' },
    { id: 'posts', label: '포스트 일정', icon: '📝' },
    { id: 'pipeline', label: '파이프라인 모니터', icon: '⚡' },
  ];

  const handleScheduleUpdate = async (postId: string, updates: Partial<PostSchedule>) => {
    console.log('일정 업데이트:', postId, updates);
    // 실제 API 호출로 대체
    setSchedules(prev => prev.map(schedule =>
      schedule.post_id === postId ? { ...schedule, ...updates } : schedule
    ));
  };

  const handleNotificationClick = (notification: ScheduleNotification) => {
    console.log('알림 클릭:', notification);
    setSelectedPostId(notification.post_id);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">일정 관리 시스템</h1>
            <p className="text-gray-600 mt-1">
              Phase 4 프론트엔드 컴포넌트 데모 페이지
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="info">실시간 모니터링 활성</Badge>
            <Badge variant="success">WebSocket 연결됨</Badge>
          </div>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-6 py-3">
        <div className="flex space-x-1 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-6">
        {/* 대시보드 탭 */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* 알림 요약 카드 */}
              <div className="lg:col-span-1">
                <NotificationSummaryCard
                  totalCount={notifications.length}
                  pendingCount={notifications.filter(n => n.status === 'pending').length}
                  urgentCount={notifications.filter(n => n.notification_type === 'overdue').length}
                  approachingCount={notifications.filter(n => n.notification_type === 'deadline_approaching').length}
                  onClick={() => setActiveTab('notifications')}
                />
              </div>

              {/* 미니 캘린더 */}
              <div className="lg:col-span-1">
                <MiniScheduleCalendar
                  schedules={schedules}
                  onDateClick={(date) => console.log('날짜 선택:', date)}
                />
              </div>

              {/* 컴팩트 파이프라인 모니터 */}
              <div className="lg:col-span-1">
                <CompactPipelineMonitor
                  postId="QA_001"
                  pipelineResult={{
                    id: 1,
                    post_id: 'QA_001',
                    pipeline_status: 'running',
                    total_iterations: 1,
                    successful_agents: 3,
                    total_agents: 5,
                    current_step: 'content',
                    progress: 75,
                    created_at: '2024-09-20T10:00:00Z',
                    updated_at: '2024-09-20T10:00:00Z'
                  }}
                />
              </div>
            </div>

            {/* 일정 메트릭 대시보드 */}
            <ScheduleMetricsDashboard
              campaignId={1}
              className="w-full"
            />

            {/* 컴포넌트 설명 */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Phase 4 컴포넌트 설명</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-800 mb-2">실시간 기능</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• WebSocket 실시간 연결 시스템</li>
                    <li>• 실시간 토스트 알림</li>
                    <li>• 파이프라인 진행률 실시간 모니터링</li>
                    <li>• 알림 배지 자동 업데이트</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">일정 관리 기능</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 드래그 앤 드롭 일정 조정</li>
                    <li>• 단계별 마감일 관리</li>
                    <li>• 우선순위 기반 필터링</li>
                    <li>• 일괄 알림 확인</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">모바일 최적화</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 터치 친화적 인터페이스</li>
                    <li>• 반응형 디자인</li>
                    <li>• 모바일 전용 메뉴</li>
                    <li>• 스와이프 제스처 지원</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-medium text-gray-800 mb-2">통합 기능</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>• 캠페인 일정 템플릿</li>
                    <li>• 포스트별 상세 일정 관리</li>
                    <li>• 일정 변경 이력 추적</li>
                    <li>• 자동 우선순위 계산</li>
                  </ul>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 캘린더 탭 */}
        {activeTab === 'calendar' && (
          <ScheduleCalendar
            schedules={schedules}
            onScheduleUpdate={handleScheduleUpdate}
            onScheduleClick={(schedule) => setSelectedPostId(schedule.post_id)}
          />
        )}

        {/* 알림센터 탭 */}
        {activeTab === 'notifications' && (
          <ScheduleNotificationCenter
            notifications={{
              notifications: notifications,
              total: notifications.length,
              page: 1,
              size: notifications.length
            }}
            onNotificationClick={handleNotificationClick}
          />
        )}

        {/* 캠페인 일정 탭 */}
        {activeTab === 'campaigns' && (
          <CampaignScheduleManager
            campaignId={selectedCampaignId || 1}
            campaign={dummyCampaign}
            onScheduleUpdated={() => console.log('캠페인 일정 업데이트됨')}
          />
        )}

        {/* 포스트 일정 탭 */}
        {activeTab === 'posts' && (
          <div className="space-y-6">
            {selectedPostId ? (
              <PostScheduleManager
                postId={selectedPostId}
                onScheduleUpdated={() => console.log('포스트 일정 업데이트됨')}
              />
            ) : (
              <Card className="p-8 text-center">
                <p className="text-gray-600">포스트를 선택해주세요.</p>
                <div className="mt-4 space-x-2">
                  {schedules.map(schedule => (
                    <Button
                      key={schedule.id}
                      variant="outline"
                      onClick={() => setSelectedPostId(schedule.post_id)}
                    >
                      {schedule.post_id}
                    </Button>
                  ))}
                </div>
              </Card>
            )}
          </div>
        )}

        {/* 파이프라인 모니터 탭 */}
        {activeTab === 'pipeline' && (
          <PipelineRealtimeMonitor
            postId={selectedPostId || 'QA_001'}
            pipelineResult={{
              id: 2,
              post_id: selectedPostId || 'QA_001',
              pipeline_status: 'running',
              total_iterations: 1,
              successful_agents: 3,
              total_agents: 6,
              current_step: 'content',
              progress: 60,
              created_at: '2024-09-20T10:00:00Z',
              updated_at: '2024-09-20T10:00:00Z'
            }}
            agentLogs={[]} // 실제 데이터로 대체 가능
            onExecute={async () => console.log('파이프라인 실행')}
            onStop={async () => console.log('파이프라인 중지')}
            onRefresh={async () => console.log('새로고침')}
          />
        )}
      </div>

      {/* 푸터 정보 */}
      <div className="bg-white border-t border-gray-200 px-6 py-4 mt-8">
        <div className="text-center text-sm text-gray-500">
          <p>Phase 4 프론트엔드 일정 관리 시스템 데모</p>
          <p className="mt-1">
            WebSocket 실시간 연결 · 드래그 앤 드롭 · 모바일 반응형 · 알림 시스템
          </p>
        </div>
      </div>
    </div>
  );
}
