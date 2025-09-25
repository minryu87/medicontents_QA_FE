'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminApi } from '@/services/api';

// 실제 API에서 사용하는 타입들은 api.ts에서 import하여 사용

// 단계 표시명 변환 함수
const getStageDisplayName = (stage: string) => {
  const stageMap: { [key: string]: string } = {
    'material': '자료 수집',
    'guide': '가이드 작성',
    'ai': 'AI 생성',
    'admin_review': '관리자 검토',
    'client_review': '클라이언트 검토',
    'final_revision': '최종 수정'
  };
  return stageMap[stage] || stage;
};

// 현황 모니터 색상 결정 함수 (일정 기반)
const getStatusMonitorColor = (item: any, category: string) => {
  // item이 없거나 undefined인 경우 neutral 반환
  if (!item) {
    return 'neutral';
  }

  // 성과 모니터링은 항상 회색
  if (category === 'performance_monitoring') {
    return 'neutral';
  }

  // 모든 카테고리에서 일정 색상 우선 사용
  if (item.schedule_color) {
    return item.schedule_color;
  }

  // fallback: 값 기반 색상 (캠페인 운영 제외)
  if (category !== 'campaign_operation') {
    const value = category === 'posting_creation' ? item.created_this_week :
                 category === 'posting_publish' ? item.published_this_week : 0;

    if (value === 0) return 'neutral';
    if (value >= 1 && value <= 9) return 'yellow';
    return 'green';
  }

  // 캠페인 운영 fallback
  const activeCampaigns = item.active_campaigns || 0;
  if (activeCampaigns === 0) return 'neutral';
  return 'green';
};

// 메인 컴포넌트
export default function AdminDashboard() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // 실제 API에서 가져올 데이터들
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);
  const [agentPerformance, setAgentPerformance] = useState<any[]>([]);
  const [qualityMetrics, setQualityMetrics] = useState<any>(null);
  const [processingStatus, setProcessingStatus] = useState<any>(null);
  const [systemAlerts, setSystemAlerts] = useState<any[]>([]);
  const [postsByStatus, setPostsByStatus] = useState<any>({});
  const [statusMonitor, setStatusMonitor] = useState<any>(null);
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [recentAgentLogs, setRecentAgentLogs] = useState<any[]>([]);

  // 캘린더 관련 상태
  const [calendarData, setCalendarData] = useState<any[]>([]);
  const [currentCalendarDate, setCurrentCalendarDate] = useState(new Date());
  const [selectedDateInfo, setSelectedDateInfo] = useState<any>(null);

  // 긴급 처리 필요 데이터
  const [systemErrors, setSystemErrors] = useState<any[]>([]);
  const [failedAgentJobs, setFailedAgentJobs] = useState<any[]>([]);
  const [delayedScheduleJobs, setDelayedScheduleJobs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  // 캘린더 날짜 변경 시 데이터 재로드
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        const year = currentCalendarDate.getFullYear();
        const month = currentCalendarDate.getMonth() + 1;
        const calendarDataResponse = await adminApi.getCalendarSchedule(year, month);
        setCalendarData(calendarDataResponse || []);
      } catch (error) {
        console.warn('캘린더 데이터 로드 실패:', error);
        setCalendarData([]);
      }
    };

    loadCalendarData();
  }, [currentCalendarDate]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 통합 대시보드 API 시도 (새로운 방식)
      try {
        const dashboardData = await adminApi.getDashboardData();
        // 통합된 데이터를 각 상태에 분배
        setDashboardStats(dashboardData.stats);
        setRecentActivities(dashboardData.activities);
        setSystemStatus(dashboardData.system_status);
        setAgentPerformance(dashboardData.agent_performance);
        setQualityMetrics(dashboardData.quality_metrics);
        setProcessingStatus(dashboardData.processing_status);
        setSystemAlerts(dashboardData.alerts);
        setHospitals(dashboardData.hospitals);
        setRecentAgentLogs(dashboardData.agent_logs);
        setPostsByStatus(dashboardData.posts_by_status || {});
        setStatusMonitor(dashboardData.status_monitor);

        // return; // 통합 API가 성공해도 긴급 데이터는 별도로 로드
      } catch (integratedError) {
        console.warn('통합 API 실패, 개별 API로 폴백:', integratedError);
        console.error('통합 API 에러 상세:', (integratedError as any)?.response?.data || (integratedError as any)?.message);
      }

      // 긴급 처리 필요 데이터 로드 (항상 실행)
      await loadEmergencyData();

      // 폴백: 기존 개별 API 방식 (완전 개별 호출로 변경)
      const results: any = {};

      // 각 API를 개별적으로 호출 (타임아웃 방지)
      try {
        results.statsRes = { status: 'fulfilled', value: await adminApi.getDashboardStats() };
      } catch (e) {
        console.warn('stats API 실패:', e);
        results.statsRes = { status: 'rejected', reason: e };
      }

      try {
        results.activitiesRes = { status: 'fulfilled', value: await adminApi.getRecentActivities() };
      } catch (e) {
        console.warn('activities API 실패:', e);
        results.activitiesRes = { status: 'rejected', reason: e };
      }

      try {
        results.systemRes = { status: 'fulfilled', value: await adminApi.getSystemStatus() };
      } catch (e) {
        console.warn('system status API 실패:', e);
        results.systemRes = { status: 'rejected', reason: e };
      }

      try {
        results.statusMonitorRes = { status: 'fulfilled', value: await adminApi.getStatusMonitor() };
      } catch (e) {
        console.warn('status monitor API 실패:', e);
        results.statusMonitorRes = { status: 'rejected', reason: e };
      }

      // 각 API 결과를 상태에 저장
      if (results.statsRes?.status === 'fulfilled') {
        setDashboardStats(results.statsRes.value);
      }

      if (results.activitiesRes?.status === 'fulfilled') {
        // API 응답에서 실제 데이터만 추출하여 저장
        const activitiesData = results.activitiesRes.value?.data || [];
      setRecentActivities(activitiesData);
      } else {
        console.warn('❌ 개별 activities API 실패:', results.activitiesRes?.reason);
      }

      if (results.systemRes?.status === 'fulfilled') {
        setSystemStatus(results.systemRes.value?.data || results.systemRes.value);
      }

      if (results.agentPerfRes?.status === 'fulfilled') {
        setAgentPerformance(results.agentPerfRes.value?.data || results.agentPerfRes.value);
      }

      if (results.qualityRes?.status === 'fulfilled') {
        setQualityMetrics(results.qualityRes.value?.data || results.qualityRes.value);
      }

      if (results.processingRes?.status === 'fulfilled') {
        setProcessingStatus(results.processingRes.value?.data || results.processingRes.value);
      }

      if (results.alertsRes?.status === 'fulfilled') {
        setSystemAlerts(results.alertsRes.value?.data || results.alertsRes.value);
      }

      if (results.statusMonitorRes?.status === 'fulfilled') {
        // API 응답에서 실제 데이터만 추출하여 저장
        const statusMonitorData = results.statusMonitorRes.value?.data || null;
        setStatusMonitor(statusMonitorData);
      } else {
        console.warn('❌ 개별 statusMonitor API 실패:', results.statusMonitorRes?.reason);
      }

      if (results.hospitalsRes?.status === 'fulfilled') {
        setHospitals(results.hospitalsRes.value.hospitals || []);
      }

      if (results.agentLogsRes?.status === 'fulfilled') {
        setRecentAgentLogs(results.agentLogsRes.value);
      }

      if (results.calendarRes?.status === 'fulfilled') {
        setCalendarData(results.calendarRes.value?.data || []);
      } else {
        console.warn('❌ 캘린더 API 실패:', results.calendarRes?.reason);
      }

      // 포스트 데이터 로드 (상태별 분류)
      await loadPostsByStatus();

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadEmergencyData = async () => {
    try {

      // 시스템 에러 조회
      try {
        const systemErrorsRes = await adminApi.getSystemErrors();
        if (systemErrorsRes.success) {
          setSystemErrors(systemErrorsRes.data || []);
        }
      } catch (error) {
        console.warn('시스템 에러 조회 실패:', error);
        setSystemErrors([]);
      }

      // 실패한 에이전트 작업 조회
      try {
        const failedJobsRes = await adminApi.getFailedAgentJobs();
        if (failedJobsRes.success) {
          setFailedAgentJobs(failedJobsRes.data || []);
        }
      } catch (error) {
        console.warn('실패한 에이전트 작업 조회 실패:', error);
        setFailedAgentJobs([]);
      }

      // 딜레이된 스케줄 작업 조회
      try {
        const delayedJobsRes = await adminApi.getDelayedScheduleJobs();
        setDelayedScheduleJobs(delayedJobsRes.data || []);
      } catch (error) {
        console.warn('딜레이된 스케줄 작업 조회 실패:', error);
        setDelayedScheduleJobs([]);
      }

    } catch (error) {
      console.error('긴급 처리 필요 데이터 로드 실패:', error);
      setSystemErrors([]);
      setFailedAgentJobs([]);
      setDelayedScheduleJobs([]);
    }
  };

  const loadPostsByStatus = async () => {
    try {
      // 업무 중심 칸반을 위한 데이터 조회
      // 실제로는 schedule 정보를 활용한 7일 이내 필터링이 필요하지만,
      // 현재는 status 기반으로 업무 카테고리에 맞게 매핑

      const postsData: any = {};

      // 1. 검토 필요 (AI 생성 완료된 작업들 - generation_completed 상태)
      try {
        const reviewResponse = await adminApi.getPosts({
          status: 'generation_completed',
          limit: 5
        });
        postsData.agent_completed = reviewResponse.posts || [];
      } catch (error) {
        console.warn('검토 필요 포스트 조회 실패:', error);
        postsData.agent_completed = [];
      }

      // 2. 승인 필요 (관리자 승인 대기 - admin_review 상태)
      try {
        const approvalResponse = await adminApi.getPosts({
          status: 'admin_review',
          limit: 5,
          // 추후: schedule_deadline이 7일 이내인 것들만 필터링
        });
        postsData.admin_review = approvalResponse.posts || [];
      } catch (error) {
        console.warn('승인 필요 포스트 조회 실패:', error);
        postsData.admin_review = [];
      }

      // 3. 게시 준비 (승인 완료된 작업들 - final_approved 상태)
      try {
        const publishResponse = await adminApi.getPosts({
          status: 'final_approved',
          limit: 5,
          // 추후: schedule_deadline이 7일 이내인 것들만 필터링
        });
        postsData.final_approved = publishResponse.posts || [];
      } catch (error) {
        console.warn('게시 준비 포스트 조회 실패:', error);
        postsData.final_approved = [];
      }

      // 4. 이슈 모니터링 (게시된 작업들 중 모니터링 필요한 것들 - published 상태)
      try {
        const monitoringResponse = await adminApi.getPosts({
          status: 'published',
          limit: 5,
          // 추후: 최근 7일 내 게시 + 이슈 플래그 있는 것들 필터링
        });
        postsData.published = monitoringResponse.posts || [];
      } catch (error) {
        console.warn('이슈 모니터링 포스트 조회 실패:', error);
        postsData.published = [];
      }

      // 5. 긴급 처리 (게시까지 7일 이내인 작업들)
      // 실제로는 schedule 정보로 필터링해야 하지만, 현재 API로는 제한적
      // 임시로 initial, material_completed, generation_completed 상태의 작업들 표시
      try {
        const urgentResponse1 = await adminApi.getPosts({
          status: 'initial',
          limit: 3
        });
        const urgentResponse2 = await adminApi.getPosts({
          status: 'material_completed',
          limit: 3
        });

        const urgentTasks = [
          ...(urgentResponse1.posts || []),
          ...(urgentResponse2.posts || [])
        ].slice(0, 5); // 최대 5개로 제한

        // 긴급 사유 추가
        postsData.urgent = urgentTasks.map(post => ({
          ...post,
          urgent_reason: post.status === 'initial' ? '초기 작업 진행 중' : '자료 수집 완료'
        }));
      } catch (error) {
        console.warn('긴급 처리 포스트 조회 실패:', error);
        postsData.urgent = [];
      }

      console.log('업무 중심 칸반 데이터 로드 완료:', {
        검토필요: postsData.agent_completed?.length || 0, // generation_completed 상태
        승인필요: postsData.admin_review?.length || 0,   // admin_review 상태
        게시준비: postsData.final_approved?.length || 0, // final_approved 상태
        이슈모니터링: postsData.published?.length || 0,  // published 상태
        긴급처리: postsData.urgent?.length || 0         // initial + material_completed 상태
      });

      setPostsByStatus(postsData);
    } catch (error) {
      console.error('포스트 데이터 로드 실패:', error);
      setPostsByStatus({});
    }
  };


  const setFallbackData = () => {
    // API 호출 실패 시 빈 데이터 설정
    setDashboardStats(null);
    setRecentActivities([]);
    setSystemStatus(null);
    setAgentPerformance([]);
    setQualityMetrics(null);
    setProcessingStatus(null);
    setSystemAlerts([]);
    setPostsByStatus({});
    setHospitals([]);
    setRecentAgentLogs([]);
  };


  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">대시보드 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-neutral-50">
      {/* Main Content Area */}
      <div className="overflow-y-auto">


        {/* Alert Cards Section */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 긴급 처리 필요 */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-neutral-900">긴급 처리 필요</h2>
                <span className="text-xs text-neutral-500">실시간</span>
          </div>
              <div className="space-y-2">
                {/* a: 시스템 에러 (최우선 - 빨간색) */}
                {systemErrors && systemErrors.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-exclamation-triangle text-red-600 text-xs"></i>
            </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-800">시스템 에러</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {systemErrors.length}건 - {systemErrors[0]?.message?.substring(0, 30)}...
                      </p>
          </div>
                    <button className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
                      즉시 확인
                    </button>
        </div>
                )}

                {/* b: 에이전트 실패한 작업 (중간 - 노란색) */}
                {failedAgentJobs && failedAgentJobs.length > 0 && (
                  <div className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-yellow-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-robot text-yellow-600 text-xs"></i>
      </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-800">에이전트 실패 작업</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {failedAgentJobs.length}건 - {failedAgentJobs[0]?.agent_type} 실패
                      </p>
                    </div>
                    <button className="px-2 py-1 bg-yellow-600 text-white text-xs rounded-lg hover:bg-yellow-700">
                      재시도
                    </button>
                  </div>
                )}

                {/* c: 일정상 딜레이된 작업 (포스트별 개별 표시 - 파란색) */}
                {delayedScheduleJobs && delayedScheduleJobs.length > 0 && delayedScheduleJobs.map((job: any, index: number) => (
                  <div key={job.id || index} className="flex items-start space-x-2">
                    <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <i className="fa-solid fa-clock text-blue-600 text-xs"></i>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-neutral-800">일정 딜레이 작업</p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {job.hospital_name} - {job.post_id} - {getStageDisplayName(job.urgent_stage)} - {job.delay_days}일 지연
                      </p>
                    </div>
                    <button
                      onClick={() => {
                        // 병원별 작업 관리 페이지로 이동 (포스팅 작업 탭의 해당 포스트 선택)
                        const hospitalId = job.hospital_id || 'unknown';
                        router.push(`/admin/hospital-work?hospital=${hospitalId}&tab=posting&post=${job.post_id}`);
                      }}
                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 flex items-center"
                    >
                      <span className="mr-1">&gt;&gt;</span>
                    </button>
                  </div>
                ))}

                {/* 긴급 이슈가 없는 경우 */}
                {(!systemErrors?.length && !failedAgentJobs?.length && !delayedScheduleJobs?.length) && (
                  <div className="text-center py-4">
                    <p className="text-xs text-neutral-500">현재 긴급한 이슈가 없습니다</p>
                    </div>
                )}
                  </div>
                  </div>

            {/* 현황 모니터 */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-sm text-neutral-900 mb-3">현황 모니터</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    getStatusMonitorColor(statusMonitor?.campaign_operation, 'campaign_operation') === 'neutral' ? 'bg-neutral-400' :
                    getStatusMonitorColor(statusMonitor?.campaign_operation, 'campaign_operation') === 'yellow' ? 'bg-yellow-500' :
                    getStatusMonitorColor(statusMonitor?.campaign_operation, 'campaign_operation') === 'red' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    <i className="fa-solid fa-bullhorn text-white text-xs"></i>
                    </div>
                  <h3 className="text-xs text-neutral-800">캠페인 운영</h3>
                  <p className="text-xs text-neutral-600">
                    {statusMonitor?.campaign_operation?.active_campaigns || 0}개 활성
                  </p>
                  <p className="text-xs text-neutral-500">
                    총 {statusMonitor?.campaign_operation?.total_campaigns || 0}개
                  </p>
                  </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    getStatusMonitorColor(statusMonitor?.posting_creation, 'posting_creation') === 'neutral' ? 'bg-neutral-400' :
                    getStatusMonitorColor(statusMonitor?.posting_creation, 'posting_creation') === 'yellow' ? 'bg-yellow-500' :
                    getStatusMonitorColor(statusMonitor?.posting_creation, 'posting_creation') === 'red' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    <i className="fa-solid fa-edit text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">포스팅 생성</h3>
                  <p className="text-xs text-neutral-600">
                    오늘 {statusMonitor?.posting_creation?.created_today || 0}개
                  </p>
                  <p className="text-xs text-neutral-500">
                    이번주 {statusMonitor?.posting_creation?.created_this_week || 0}개
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    getStatusMonitorColor(statusMonitor?.posting_publish, 'posting_publish') === 'neutral' ? 'bg-neutral-400' :
                    getStatusMonitorColor(statusMonitor?.posting_publish, 'posting_publish') === 'yellow' ? 'bg-yellow-500' :
                    getStatusMonitorColor(statusMonitor?.posting_publish, 'posting_publish') === 'red' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    <i className="fa-solid fa-paper-plane text-white text-xs"></i>
                    </div>
                  <h3 className="text-xs text-neutral-800">포스팅 게시</h3>
                  <p className="text-xs text-neutral-600">
                    오늘 {statusMonitor?.posting_publish?.published_today || 0}개
                  </p>
                  <p className="text-xs text-neutral-500">
                    이번주 {statusMonitor?.posting_publish?.published_this_week || 0}개
                  </p>
                  </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    getStatusMonitorColor(statusMonitor?.performance_monitoring, 'performance_monitoring') === 'neutral' ? 'bg-neutral-400' :
                    getStatusMonitorColor(statusMonitor?.performance_monitoring, 'performance_monitoring') === 'yellow' ? 'bg-yellow-500' :
                    getStatusMonitorColor(statusMonitor?.performance_monitoring, 'performance_monitoring') === 'red' ? 'bg-red-500' :
                    'bg-green-600'
                  }`}>
                    <i className="fa-solid fa-chart-line text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">성과 모니터링</h3>
                  <p className="text-xs text-neutral-600">
                    게시 {statusMonitor?.performance_monitoring?.published_posts || 0}개
                  </p>
                  <p className="text-xs text-neutral-500">
                    검토중 {statusMonitor?.performance_monitoring?.in_review_posts || 0}개
                  </p>
                </div>
              </div>
            </div>

            {/* 최근 활동 */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-neutral-900">최근 활동</h2>
                <button className="text-neutral-600 hover:text-neutral-700 text-xs">전체보기</button>
                    </div>
              <div className="space-y-2">
                {recentActivities && recentActivities.length > 0 ? (
                  recentActivities.slice(0, 3).map((activity: any, index: number) => {
                    // 활동 타입에 따른 아이콘 결정
                    const getActivityIcon = (type: string) => {
                      switch (type) {
                        case 'post_created':
                          return 'plus';
                        case 'agent_completed':
                          return 'check';
                        case 'agent_failed':
                          return 'times';
                        case 'status_changed':
                          return 'exchange-alt';
                        case 'schedule_updated':
                          return 'calendar-alt';
                        default:
                          return 'info';
                      }
                    };

                    // 활동 타입에 따른 배경색 결정
                    const getActivityBgColor = (type: string) => {
                      switch (type) {
                        case 'post_created':
                          return 'bg-green-100';
                        case 'agent_completed':
                          return 'bg-blue-100';
                        case 'agent_failed':
                          return 'bg-red-100';
                        case 'status_changed':
                          return 'bg-yellow-100';
                        case 'schedule_updated':
                          return 'bg-purple-100';
                        default:
                          return 'bg-neutral-100';
                      }
                    };

                    const icon = getActivityIcon(activity.type);
                    const bgColor = getActivityBgColor(activity.type);

                    return (
                      <div key={activity.id || index} className="flex items-start space-x-2">
                        <div className={`w-4 h-4 ${bgColor} rounded-full flex items-center justify-center flex-shrink-0`}>
                          <i className={`fa-solid fa-${icon} text-neutral-600 text-xs`}></i>
                  </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-800">{activity.description}</p>
                          <div className="flex items-center justify-between mt-1">
                            <p className="text-xs text-neutral-500">
                              {activity.timestamp ? new Date(activity.timestamp).toLocaleString('ko-KR', {
                                hour: '2-digit',
                                minute: '2-digit'
                              }) : '시간 정보 없음'}
                            </p>
                            {activity.hospital_name && (
                              <span className="text-xs bg-neutral-100 text-neutral-600 px-1 py-0.5 rounded">
                                {activity.hospital_name}
                              </span>
                            )}
                  </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-neutral-500">최근 활동이 없습니다</p>
            </div>
          )}
                    </div>
                    </div>
          </div>
                  </div>

        {/* 7일 이내 처리 예정 작업 섹션 */}
        <div className="px-6">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg text-neutral-900 mb-3">7일 이내 처리 예정 작업</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* 긴급 처리 칸반 */}
              <div className="bg-white rounded-lg p-3 min-w-48 flex-shrink-0 border-l-4 border-red-500 shadow-sm">
                <h3 className="text-sm text-neutral-900 mb-2 text-center font-semibold">긴급 처리</h3>
                <div className="space-y-2">
                  {postsByStatus?.urgent?.length > 0 ? (
                    postsByStatus.urgent.slice(0, 3).map((post: any, index: number) => (
                      <div key={post.id || index} className="bg-white p-2 rounded-lg border border-red-200 relative">
                        <button
                          className="absolute top-1 right-1 text-red-600 hover:text-red-800 text-sm font-bold"
                          onClick={() => {
                            // 긴급 처리 액션
                            console.log('긴급 처리:', post.post_id);
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <p className="text-xs text-neutral-800 pr-8">{post.title || `포스트 ${post.post_id}`}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs bg-red-100 text-red-700 px-1 py-0.5 rounded">
                            {post.hospital_name || '병원 미정'}
                          </span>
                          <span className="text-xs text-red-600 font-semibold">
                            {post.urgent_reason || '기한 초과'}
                          </span>
                    </div>
                  </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">긴급 작업 없음</p>
                  )}
                    </div>
                  </div>

              {/* 검토 필요 칸반 */}
              <div className="bg-white rounded-lg p-3 min-w-48 flex-shrink-0 border-l-4 border-sky-600 shadow-sm">
                <h3 className="text-sm text-neutral-900 mb-2 text-center font-semibold">검토 필요</h3>
                <div className="space-y-2">
                  {postsByStatus?.agent_completed?.length > 0 ? (
                    postsByStatus.agent_completed.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-sky-200 relative">
                        <button
                          className="absolute top-1 right-1 text-sky-600 hover:text-sky-800 text-sm font-bold"
                          onClick={() => {
                            // 검토 작업으로 이동
                            console.log('검토 작업:', post.post_id);
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <p className="text-xs text-neutral-800 pr-8">{post.title || `포스트 ${post.post_id}`}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs bg-sky-100 text-sky-700 px-1 py-0.5 rounded">
                            {post.hospital_name || '병원 미정'}
                          </span>
                          <span className="text-xs text-neutral-500">D-3</span>
                    </div>
                  </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 승인 필요 칸반 */}
              <div className="bg-white rounded-lg p-3 min-w-48 flex-shrink-0 border-l-4 border-sky-500 shadow-sm">
                <h3 className="text-sm text-neutral-900 mb-2 text-center font-semibold">승인 필요</h3>
                <div className="space-y-2">
                  {postsByStatus?.admin_review?.length > 0 ? (
                    postsByStatus.admin_review.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-sky-200 relative">
                        <button
                          className="absolute top-1 right-1 text-sky-600 hover:text-sky-800 text-sm font-bold"
                          onClick={() => {
                            // 승인 작업으로 이동
                            console.log('승인 작업:', post.post_id);
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <p className="text-xs text-neutral-800 pr-8">{post.title || `포스트 ${post.post_id}`}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs bg-sky-100 text-sky-700 px-1 py-0.5 rounded">
                            {post.hospital_name || '병원 미정'}
                          </span>
                          <span className="text-xs text-neutral-500">D-5</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 게시 준비 칸반 */}
              <div className="bg-white rounded-lg p-3 min-w-48 flex-shrink-0 border-l-4 border-sky-400 shadow-sm">
                <h3 className="text-sm text-neutral-900 mb-2 text-center font-semibold">게시 준비</h3>
                <div className="space-y-2">
                  {postsByStatus?.final_approved?.length > 0 ? (
                    postsByStatus.final_approved.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-sky-200 relative">
                        <button
                          className="absolute top-1 right-1 text-sky-600 hover:text-sky-800 text-sm font-bold"
                          onClick={() => {
                            // 게시 준비 작업으로 이동
                            console.log('게시 준비 작업:', post.post_id);
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <p className="text-xs text-neutral-800 pr-8">{post.title || `포스트 ${post.post_id}`}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs bg-sky-100 text-sky-700 px-1 py-0.5 rounded">
                            {post.hospital_name || '병원 미정'}
                          </span>
                          <span className="text-xs text-neutral-500">D-7</span>
                    </div>
                  </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
              </div>
              </div>

              {/* 이슈 모니터링 칸반 */}
              <div className="bg-white rounded-lg p-3 min-w-48 flex-shrink-0 border-l-4 border-sky-300 shadow-sm">
                <h3 className="text-sm text-neutral-900 mb-2 text-center font-semibold">이슈 모니터링</h3>
                <div className="space-y-2">
                  {postsByStatus?.published?.slice(0, 3).length > 0 ? (
                    postsByStatus.published.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-sky-200 relative">
                        <button
                          className="absolute top-1 right-1 text-sky-600 hover:text-sky-800 text-sm font-bold"
                          onClick={() => {
                            // 이슈 모니터링으로 이동
                            console.log('이슈 모니터링:', post.post_id);
                          }}
                        >
                          &gt;&gt;
                        </button>
                        <p className="text-xs text-neutral-800 pr-8">{post.title || `포스트 ${post.post_id}`}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs bg-sky-100 text-sky-700 px-1 py-0.5 rounded">
                            {post.hospital_name || '병원 미정'}
                          </span>
                          <span className="text-xs text-neutral-500">게시됨</span>
                      </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>
            </div>
          </div>
                    </div>

        {/* 병원별 진행 현황 */}
        <div className="px-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg text-neutral-900">병원별 진행 현황</h2>
              <span className="text-neutral-600 hover:text-neutral-700 text-xs cursor-pointer">전체보기 →</span>
                      </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {hospitals && hospitals.length > 0 ? (
                hospitals.slice(0, 6).map((hospital: any) => {
                  // 백엔드에서 제공하는 current_campaign 데이터 사용
                  const currentCampaign = hospital.current_campaign;

                  return (
                    <div
                      key={hospital.id}
                      className="bg-white border border-sky-200 rounded-lg p-4 aspect-square flex flex-col justify-between relative"
                    >
                      {/* >> 버튼 - 우측 상단 */}
                      <button
                        onClick={() => router.push(`/admin/hospital-work?hospital=${hospital.id}`)}
                        className="absolute top-2 right-2 text-sky-500 hover:text-sky-700 text-sm font-bold p-1"
                      >
                        &gt;&gt;
                      </button>

                      {/* 병원명 */}
                      <div className="text-center">
                        <h3 className="text-neutral-900 font-medium text-sm mb-1">{hospital.name}</h3>
                    </div>

                      {/* 진행 중 캠페인 정보 */}
                      <div className="flex-1 flex flex-col justify-center text-center">
                        {currentCampaign ? (
                          <div className="space-y-1">
                            <p className="text-xs text-neutral-700 font-medium">{currentCampaign.name}</p>
                            <p className="text-xs text-neutral-500">
                              {currentCampaign.start_date && currentCampaign.end_date ?
                                `${new Date(currentCampaign.start_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })} - ${new Date(currentCampaign.end_date).toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })}` :
                                '기간 미정'
                              }
                            </p>
                      </div>
                        ) : (
                          <p className="text-xs text-neutral-500">진행 중 캠페인 없음</p>
                        )}
                    </div>

                      {/* 진행률 */}
                      <div className="space-y-1">
                        {currentCampaign && currentCampaign.target_post_count > 0 ? (
                          <>
                            <div className="w-full bg-sky-100 rounded-full h-1.5">
                              <div
                                className="bg-sky-500 h-1.5 rounded-full transition-all duration-300"
                                style={{ width: `${currentCampaign.progress_percentage}%` }}
                              ></div>
                      </div>
                            <p className="text-xs text-neutral-600 text-center">
                              {currentCampaign.completed_post_count}/{currentCampaign.target_post_count} ({Math.round(currentCampaign.progress_percentage)}%)
                            </p>
                          </>
                        ) : (
                          <p className="text-xs text-neutral-500 text-center">진행률 정보 없음</p>
                        )}
                    </div>
                  </div>
                  );
                })
              ) : (
                <div className="col-span-full text-center py-8">
                  <p className="text-neutral-500">병원 정보 로딩 중...</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* AI 파이프라인 모니터 */}
        <div className="px-6 py-4">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-3">AI 파이프라인 모니터</h2>

            {/* 전체 진행률 */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-neutral-700 font-medium">전체 성공률</span>
                <span className="text-sm text-neutral-700 font-medium">
                  {agentPerformance && agentPerformance.length > 0 ?
                    `${Math.round(agentPerformance.reduce((acc: number, perf: any) => acc + perf.success_rate, 0) / agentPerformance.length)}%` :
                    'N/A'
                  }
                </span>
                      </div>
              <div className="w-full bg-sky-100 rounded-full h-2">
                <div
                  className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: agentPerformance && agentPerformance.length > 0 ?
                      `${Math.min(100, agentPerformance.reduce((acc: number, perf: any) => acc + perf.success_rate, 0) / agentPerformance.length)}%` :
                      '0%'
                  }}
                ></div>
              </div>
                    </div>

            {/* 파이프라인 단계들 */}
            <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
              {agentPerformance && agentPerformance.length > 0 ? (
                agentPerformance.slice(0, 6).map((agent: any, index: number) => {
                  const getAgentStatus = () => {
                    if (agent.success_rate >= 95) return 'normal';
                    if (agent.success_rate >= 80) return 'processing';
                    if (agent.success_rate >= 60) return 'waiting';
                    return 'error';
                  };

                  const status = getAgentStatus();
                  const agentNameMap: any = {
                    'input': 'Input',
                    'plan': 'Plan',
                    'title': 'Title',
                    'content': 'Content',
                    'evaluation': 'Eval',
                    'edit': 'Edit'
                  };

                  const displayName = agentNameMap[agent.agent_type] || agent.agent_type;

                  return (
                    <div key={index} className="bg-white border border-sky-200 rounded-lg p-3">
                      <div className="text-center">
                        <div className="text-sm text-neutral-800 font-medium mb-1">{displayName}</div>
                        <div className="text-xs text-neutral-600 mb-1">{agent.total_executions}건 실행</div>
                        <div className={`text-sm font-medium mb-2 ${
                          status === 'normal' ? 'text-sky-600' :
                          status === 'processing' ? 'text-blue-600' :
                          status === 'error' ? 'text-red-600' : 'text-neutral-500'
                        }`}>
                          {agent.success_rate}%
                      </div>
                        <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                          status === 'normal' ? 'bg-sky-100 text-sky-700' :
                          status === 'processing' ? 'bg-blue-100 text-blue-700' :
                          status === 'error' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                        }`}>
                          {status === 'normal' ? '정상' :
                           status === 'processing' ? '실행중' :
                           status === 'error' ? '주의' : '대기'}
                        </div>
                        {agent.failed_executions > 0 && (
                          <div className="text-xs text-red-600 mt-2">
                            실패: {agent.failed_executions}건
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-6 text-center py-6">
                  <p className="text-neutral-500 text-sm">AI 에이전트 정보 로딩 중...</p>
                </div>
              )}
                    </div>

            {/* 최근 로그 요약 */}
            {recentAgentLogs && recentAgentLogs.length > 0 && (
              <div className="mt-4 pt-4 border-t border-neutral-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600">최근 실행 로그</span>
                  <span className="text-xs text-neutral-500">
                    {recentAgentLogs.filter((log: any) => log.execution_status === 'completed').length}건 성공
                  </span>
                    </div>
                <div className="text-xs text-neutral-500">
                  최근 1시간: {recentAgentLogs.length}건 실행
                  </div>
            </div>
          )}
          </div>
        </div>

        {/* 시스템 성능 모니터 & 캘린더 */}
        <div className="px-6 py-4">
                      <div className="grid grid-cols-2 gap-4">
            {/* 시스템 성능 모니터 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg text-neutral-900 mb-3">시스템 성능 모니터</h2>

              {/* 시스템 컴포넌트 상태 */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="bg-white border border-sky-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-sm text-neutral-800 font-medium mb-1">데이터베이스</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      systemStatus?.database === 'healthy' ? 'bg-sky-100 text-sky-700' :
                      systemStatus?.database === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {systemStatus?.database === 'healthy' ? '정상' :
                       systemStatus?.database === 'warning' ? '주의' : '오류'}
                        </div>
                        </div>
                      </div>

                <div className="bg-white border border-sky-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-sm text-neutral-800 font-medium mb-1">Redis 캐시</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      systemStatus?.redis === 'healthy' ? 'bg-sky-100 text-sky-700' :
                      systemStatus?.redis === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {systemStatus?.redis === 'healthy' ? '정상' :
                       systemStatus?.redis === 'warning' ? '주의' : '오류'}
                        </div>
                        </div>
                </div>

                <div className="bg-white border border-sky-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-sm text-neutral-800 font-medium mb-1">API 상태</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      systemStatus?.api === 'healthy' ? 'bg-sky-100 text-sky-700' :
                      systemStatus?.api === 'warning' ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {systemStatus?.api === 'healthy' ? '정상' :
                       systemStatus?.api === 'warning' ? '주의' : '오류'}
                    </div>
                        </div>
                      </div>

                <div className="bg-white border border-sky-200 rounded-lg p-3">
                  <div className="text-center">
                    <div className="text-sm text-neutral-800 font-medium mb-1">시스템 부하</div>
                    <div className={`text-xs px-2 py-1 rounded-full inline-block ${
                      systemStatus?.system_load === 'low' ? 'bg-sky-100 text-sky-700' :
                      systemStatus?.system_load === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                      systemStatus?.system_load === 'high' ? 'bg-red-100 text-red-700' : 'bg-neutral-100 text-neutral-700'
                    }`}>
                      {systemStatus?.system_load === 'low' ? '낮음' :
                       systemStatus?.system_load === 'medium' ? '보통' :
                       systemStatus?.system_load === 'high' ? '높음' : '알 수 없음'}
                      </div>
                    </div>
            </div>
              </div>

              {/* 시스템 메트릭 */}
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-sky-100">
                  <span className="text-sm text-neutral-700">메모리 사용량</span>
                  <span className={`text-sm font-medium ${
                    systemStatus?.memory_usage === 'low' ? 'text-sky-600' :
                    systemStatus?.memory_usage === 'medium' ? 'text-yellow-600' :
                    systemStatus?.memory_usage === 'high' ? 'text-red-600' : 'text-neutral-500'
                  }`}>
                    {systemStatus?.memory_usage === 'low' ? '낮음' :
                     systemStatus?.memory_usage === 'medium' ? '보통' :
                     systemStatus?.memory_usage === 'high' ? '높음' : '알 수 없음'}
                  </span>
                      </div>

                <div className="flex justify-between items-center py-2 border-b border-sky-100">
                  <span className="text-sm text-neutral-700">응답 시간</span>
                  <span className="text-sm text-sky-600 font-medium">
                    {systemStatus?.response_time || '알 수 없음'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2 border-b border-sky-100">
                  <span className="text-sm text-neutral-700">업타임</span>
                  <span className="text-sm text-sky-600 font-medium">
                    {systemStatus?.uptime || '알 수 없음'}
                  </span>
                </div>

                <div className="flex justify-between items-center py-2">
                  <span className="text-sm text-neutral-700">마지막 백업</span>
                  <span className="text-sm text-neutral-600">
                    {systemStatus?.lastBackup ?
                      new Date(systemStatus.lastBackup).toLocaleString('ko-KR') :
                      '정보 없음'
                    }
                          </span>
                        </div>
                      </div>
                    </div>

            {/* 캘린더 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              {/* 캘린더 헤더 - 네비게이션 */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => {
                    const newDate = new Date(currentCalendarDate);
                    newDate.setMonth(newDate.getMonth() - 1);
                    setCurrentCalendarDate(newDate);
                  }}
                  className="text-neutral-600 hover:text-neutral-800 p-1"
                >
                  <i className="fa-solid fa-chevron-left text-sm"></i>
                </button>
                <h2 className="text-lg text-neutral-900 font-medium">
                  {currentCalendarDate.toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
                </h2>
                <button
                  onClick={() => {
                    const newDate = new Date(currentCalendarDate);
                    newDate.setMonth(newDate.getMonth() + 1);
                    setCurrentCalendarDate(newDate);
                  }}
                  className="text-neutral-600 hover:text-neutral-800 p-1"
                >
                  <i className="fa-solid fa-chevron-right text-sm"></i>
                </button>
              </div>

              {/* 요일 헤더 */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div key={index} className="text-center text-xs text-neutral-500 py-2 font-medium">
                    {day}
                  </div>
                ))}
              </div>

              {/* 날짜 그리드 */}
              <div className="grid grid-cols-7 gap-1">
                {(() => {
                  const year = currentCalendarDate.getFullYear();
                  const month = currentCalendarDate.getMonth();
                  const firstDay = new Date(year, month, 1);
                  const lastDay = new Date(year, month + 1, 0);
                  const startDayOfWeek = firstDay.getDay();
                  const totalDays = lastDay.getDate();

                  const today = new Date();
                  const isCurrentMonth = today.getFullYear() === year && today.getMonth() === month;

                  // 빈 칸 채우기
                  const emptyCells = Array.from({ length: startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="py-2"></div>
                  ));

                  // 날짜 셀들
                  const dateCells = Array.from({ length: totalDays }, (_, i) => {
                    const day = i + 1;
                    const isToday = isCurrentMonth && day === today.getDate();

                    // 해당 날짜의 일정 데이터 찾기
                    const dateString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const daySchedule = Array.isArray(calendarData) ? calendarData.find((item: any) => item.date === dateString) : null;

                    const hasScheduled = (daySchedule?.scheduled_count || 0) > 0;
                    const hasPublished = (daySchedule?.published_count || 0) > 0;
                    const hasFailed = (daySchedule?.failed_count || 0) > 0;

                    return (
                      <div
                        key={day}
                        onClick={() => daySchedule && setSelectedDateInfo(daySchedule)}
                        className={`py-2 text-center text-sm cursor-pointer hover:bg-neutral-50 rounded transition-colors ${
                          isToday ? 'bg-sky-100 text-sky-700 font-medium' :
                          hasFailed ? 'text-red-600' :
                          hasPublished ? 'text-green-600' :
                          hasScheduled ? 'text-sky-600' : 'text-neutral-700'
                        }`}
                      >
                        <div className="relative">
                          {day}
                          {/* 일정 표시 점 */}
                          {(hasScheduled || hasPublished || hasFailed) && (
                            <div className="flex justify-center mt-1 space-x-0.5">
                              {hasScheduled && <div className="w-1 h-1 bg-sky-400 rounded-full"></div>}
                              {hasPublished && <div className="w-1 h-1 bg-green-400 rounded-full"></div>}
                              {hasFailed && <div className="w-1 h-1 bg-red-400 rounded-full"></div>}
                  </div>
                )}
              </div>
                      </div>
                    );
                  });

                  return [...emptyCells, ...dateCells];
                })()}
                  </div>

              {/* 범례 */}
              <div className="mt-4 pt-3 border-t border-neutral-200">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-sky-400 rounded-full mr-2"></div>
                    <span className="text-neutral-600">게시 예정</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-neutral-600">게시 완료</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-red-400 rounded-full mr-2"></div>
                    <span className="text-neutral-600">실패</span>
                  </div>
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-sky-600 rounded-full mr-2"></div>
                    <span className="text-neutral-600">오늘</span>
                  </div>
                    </div>
                  </div>

              {/* 선택된 날짜 상세 정보 모달 */}
              {selectedDateInfo && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedDateInfo(null)}>
                  <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-medium text-neutral-900">
                        {new Date(selectedDateInfo.date).toLocaleDateString('ko-KR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </h3>
                      <button
                        onClick={() => setSelectedDateInfo(null)}
                        className="text-neutral-400 hover:text-neutral-600"
                      >
                        <i className="fa-solid fa-times"></i>
                      </button>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">게시 예정:</span>
                        <span className="font-medium">{selectedDateInfo.scheduled_count}건</span>
                  </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">게시 완료:</span>
                        <span className="font-medium text-green-600">{selectedDateInfo.published_count}건</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-neutral-600">실패:</span>
                        <span className="font-medium text-red-600">{selectedDateInfo.failed_count}건</span>
                </div>

                      {selectedDateInfo.posts && selectedDateInfo.posts.length > 0 && (
                        <div className="mt-4 pt-3 border-t border-neutral-200">
                          <h4 className="text-sm font-medium text-neutral-900 mb-2">상세 일정</h4>
                          <div className="space-y-2 max-h-40 overflow-y-auto">
                            {selectedDateInfo.posts.map((post: any, index: number) => (
                              <div key={index} className="text-xs p-2 bg-neutral-50 rounded">
                                <div className="font-medium text-neutral-800 truncate">{post.title}</div>
                                <div className="text-neutral-600 mt-1">
                                  {post.hospital_name} • {post.status === 'published' ? '게시완료' : '게시예정'}
                  </div>
                </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>


        {/* 플로팅 채팅 버튼 */}
        <div className="fixed bottom-6 right-6">
          <button className="w-12 h-12 bg-neutral-600 text-white rounded-full shadow-lg hover:bg-neutral-700 hover:shadow-xl transition-all flex items-center justify-center">
            <i className="fa-solid fa-comment"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
