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
  const [hospitals, setHospitals] = useState<any[]>([]);
  const [recentAgentLogs, setRecentAgentLogs] = useState<any[]>([]);

  // 긴급 처리 필요 데이터
  const [systemErrors, setSystemErrors] = useState<any[]>([]);
  const [failedAgentJobs, setFailedAgentJobs] = useState<any[]>([]);
  const [delayedScheduleJobs, setDelayedScheduleJobs] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

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
        // return; // 통합 API가 성공해도 긴급 데이터는 별도로 로드
      } catch (integratedError) {
        console.warn('통합 API 실패, 개별 API로 폴백:', integratedError);
      }

      // 긴급 처리 필요 데이터 로드 (항상 실행)
      await loadEmergencyData();

      // 폴백: 기존 개별 API 방식
      const [
        statsRes,
        activitiesRes,
        systemRes,
        agentPerfRes,
        qualityRes,
        processingRes,
        alertsRes,
        hospitalsRes,
        agentLogsRes
      ] = await Promise.allSettled([
        adminApi.getDashboardStats(),
        adminApi.getRecentActivities(),
        adminApi.getSystemStatus(),
        adminApi.getAgentPerformance(),
        adminApi.getQualityMetrics(),
        adminApi.getProcessingStatus(),
        adminApi.getSystemAlerts(),
        adminApi.getHospitals(),
        adminApi.getRecentAgentLogs()
      ]);

      // 각 API 결과를 상태에 저장
      if (statsRes.status === 'fulfilled') {
        setDashboardStats(statsRes.value);
      }

      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value);
      }

      if (systemRes.status === 'fulfilled') {
        setSystemStatus(systemRes.value);
      }

      if (agentPerfRes.status === 'fulfilled') {
        setAgentPerformance(agentPerfRes.value);
      }

      if (qualityRes.status === 'fulfilled') {
        setQualityMetrics(qualityRes.value);
      }

      if (processingRes.status === 'fulfilled') {
        setProcessingStatus(processingRes.value);
      }

      if (alertsRes.status === 'fulfilled') {
        setSystemAlerts(alertsRes.value);
      }

      if (hospitalsRes.status === 'fulfilled') {
        setHospitals(hospitalsRes.value.hospitals || []);
      }

      if (agentLogsRes.status === 'fulfilled') {
        setRecentAgentLogs(agentLogsRes.value);
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
      console.log('긴급 처리 필요 데이터 로드 시작');
      console.log('adminApi 객체 확인:', adminApi);
      console.log('getSystemErrors 메소드 존재:', typeof adminApi.getSystemErrors);
      console.log('getFailedAgentJobs 메소드 존재:', typeof adminApi.getFailedAgentJobs);
      console.log('getDelayedScheduleJobs 메소드 존재:', typeof adminApi.getDelayedScheduleJobs);

      // 시스템 에러 조회
      try {
        console.log('시스템 에러 API 호출 시도');
        const systemErrorsRes = await adminApi.getSystemErrors();
        console.log('시스템 에러 응답 수신:', systemErrorsRes);
        if (systemErrorsRes.success) {
          setSystemErrors(systemErrorsRes.data || []);
        }
      } catch (error) {
        console.warn('시스템 에러 조회 실패:', error);
        setSystemErrors([]);
      }

      // 실패한 에이전트 작업 조회
      try {
        console.log('실패한 에이전트 작업 API 호출 시도');
        const failedJobsRes = await adminApi.getFailedAgentJobs();
        console.log('실패한 에이전트 작업 응답 수신:', failedJobsRes);
        if (failedJobsRes.success) {
          setFailedAgentJobs(failedJobsRes.data || []);
        }
      } catch (error) {
        console.warn('실패한 에이전트 작업 조회 실패:', error);
        setFailedAgentJobs([]);
      }

      // 딜레이된 스케줄 작업 조회
      try {
        console.log('딜레이된 스케줄 작업 API 호출 시도');
        const delayedJobsRes = await adminApi.getDelayedScheduleJobs();
        console.log('딜레이된 스케줄 작업 응답 수신:', delayedJobsRes);
        setDelayedScheduleJobs(delayedJobsRes.data || []);
      } catch (error) {
        console.warn('딜레이된 스케줄 작업 조회 실패:', error);
        setDelayedScheduleJobs([]);
      }

      console.log('긴급 처리 필요 데이터 로드 완료');
    } catch (error) {
      console.error('긴급 처리 필요 데이터 로드 실패:', error);
      setSystemErrors([]);
      setFailedAgentJobs([]);
      setDelayedScheduleJobs([]);
    }
  };

  const loadPostsByStatus = async () => {
    try {
      // 각 상태별 포스트 조회
      const statusFilters = [
        { status: 'initial', limit: 5 },           // 캠페인 준비
        { status: 'material_waiting', limit: 5 },  // 포스팅 사전 작업
        { status: 'agent_completed', limit: 5 },   // 포스팅 생성 검토
        { status: 'admin_review', limit: 5 },      // 포스팅 승인 검토
        { status: 'final_approved', limit: 5 },    // 포스팅 게시
        { status: 'published', limit: 5 }          // 포스팅 모니터링
      ];

      const postsData: any = {};

      for (const filter of statusFilters) {
        try {
          const response = await adminApi.getPosts({ ...filter });
          postsData[filter.status] = response.posts || [];
        } catch (error) {
          console.warn(`${filter.status} 포스트 조회 실패:`, error);
          postsData[filter.status] = [];
        }
      }

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

        {/* Header Section */}
        <div className="bg-white border-b border-neutral-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl text-neutral-900">운영 현황</h1>
              <p className="text-neutral-600 text-sm mt-1">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
                {dashboardStats && (
                  <span className="ml-4 text-xs">
                    총 {dashboardStats.totalPosts || 0}개 포스트 · {dashboardStats.activePosts || 0}개 진행중
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm">
                <i className="fa-solid fa-plus mr-1"></i>
                새 캠페인
              </button>
              <button className="p-2 text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-bell"></i>
                {systemAlerts && systemAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center">
                    {systemAlerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Alert Cards Section */}
        <div className="px-6 py-4">
          <div className="grid grid-cols-3 gap-4">
            {/* 긴급 처리 필요 */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-neutral-900">🚨 긴급 처리 필요</h2>
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
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-bullhorn text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">캠페인 운영</h3>
                  <p className="text-xs text-neutral-600">null</p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-edit text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">포스팅 생성</h3>
                  <p className="text-xs text-neutral-600">null</p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-paper-plane text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">포스팅 게시</h3>
                  <p className="text-xs text-neutral-600">null</p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-chart-line text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">성과 모니터링</h3>
                  <p className="text-xs text-neutral-600">null</p>
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
                  recentActivities.slice(0, 3).map((activity: any, index: number) => (
                    <div key={index} className="flex items-start space-x-2">
                      <div className="w-4 h-4 bg-neutral-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <i className={`fa-solid fa-${activity.type === 'post_completed' ? 'check' : activity.type === 'post_created' ? 'plus' : 'info'} text-neutral-600 text-xs`}></i>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-neutral-800">{activity.description}</p>
                        <p className="text-xs text-neutral-500 mt-1">
                          {new Date(activity.timestamp).toLocaleString('ko-KR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-neutral-500">최근 활동이 없습니다</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 오늘의 작업 섹션 */}
        <div className="px-6">
          <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
            <h2 className="text-lg text-neutral-900 mb-3">오늘 처리할 작업</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* 캠페인 준비 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">캠페인 준비</h3>
                <div className="space-y-2">
                  {postsByStatus?.initial?.length > 0 ? (
                    postsByStatus.initial.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 포스팅 사전 작업 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">포스팅 사전 작업</h3>
                <div className="space-y-2">
                  {postsByStatus?.material_waiting?.length > 0 ? (
                    postsByStatus.material_waiting.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 포스팅 생성 검토 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">포스팅 생성 검토</h3>
                <div className="space-y-2">
                  {postsByStatus?.agent_completed?.length > 0 ? (
                    postsByStatus.agent_completed.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 포스팅 승인 검토 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">포스팅 승인 검토</h3>
                <div className="space-y-2">
                  {postsByStatus?.admin_review?.length > 0 ? (
                    postsByStatus.admin_review.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 포스팅 게시 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">포스팅 게시</h3>
                <div className="space-y-2">
                  {postsByStatus?.final_approved?.length > 0 ? (
                    postsByStatus.final_approved.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 포스팅 모니터링 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">포스팅 모니터링</h3>
                <div className="space-y-2">
                  {postsByStatus?.published?.length > 0 ? (
                    postsByStatus.published.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.hospital_name || '병원 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(바로가기)</button>
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
                      className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 aspect-square flex flex-col justify-between"
                    >
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
                            <div className="w-full bg-neutral-200 rounded-full h-1.5">
                              <div
                                className="bg-neutral-600 h-1.5 rounded-full transition-all duration-300"
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
                <span className="text-xs text-neutral-600">전체 진행률</span>
                <span className="text-xs text-neutral-600">
                  {agentPerformance && agentPerformance.length > 0 ?
                    `${Math.round(agentPerformance.reduce((acc: number, perf: any) => acc + perf.success_rate, 0) / agentPerformance.length)}%` :
                    'N/A'
                  }
                </span>
              </div>
              <div className="w-full bg-neutral-200 rounded-full h-1">
                <div
                  className="bg-neutral-600 h-1 rounded-full"
                  style={{
                    width: agentPerformance && agentPerformance.length > 0 ?
                      `${Math.min(100, agentPerformance.reduce((acc: number, perf: any) => acc + perf.success_rate, 0) / agentPerformance.length)}%` :
                      '0%'
                  }}
                ></div>
              </div>
            </div>

            {/* 파이프라인 단계들 */}
            <div className="grid grid-cols-6 gap-2">
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
                    <div key={index} className="p-2 bg-neutral-50 border border-neutral-200 rounded-lg">
                      <div className="flex items-center justify-center mb-2">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          status === 'processing' ? 'bg-blue-600' :
                          status === 'error' ? 'bg-red-600' :
                          status === 'waiting' ? 'bg-gray-400' : 'bg-green-600'
                        }`}>
                          <i className={`fa-solid fa-${agent.agent_type === 'evaluation' ? 'check-circle' : 'robot'} text-white text-xs ${
                            status === 'processing' ? 'fa-spin' : ''
                          }`}></i>
                        </div>
                      </div>
                      <div className="text-center">
                        <span className="text-neutral-800 text-xs block">{displayName}</span>
                        <div className="text-xs text-neutral-500">24h: {agent.total_executions}건</div>
                        <div className="text-xs text-neutral-500">성공률: {agent.success_rate}%</div>
                        {agent.failed_executions > 0 && (
                          <div className="text-xs text-red-600 mt-1">
                            실패: {agent.failed_executions}건
                          </div>
                        )}
                        <span className={`text-xs px-1 py-0.5 rounded mt-1 inline-block ${
                          status === 'normal' ? 'text-white bg-green-600' :
                          status === 'processing' ? 'text-white bg-blue-600' :
                          status === 'error' ? 'text-white bg-red-600' : 'text-white bg-gray-400'
                        }`}>
                          {status === 'normal' ? '정상' :
                           status === 'processing' ? '실행중' :
                           status === 'error' ? '에러' : '대기'}
                        </span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="col-span-6 text-center py-4">
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
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    systemStatus?.database === 'healthy' ? 'bg-green-600' :
                    systemStatus?.database === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    <i className="fa-solid fa-database text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">데이터베이스</h3>
                  <p className="text-xs text-neutral-600 capitalize">
                    {systemStatus?.database || 'unknown'}
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    systemStatus?.redis === 'healthy' ? 'bg-green-600' :
                    systemStatus?.redis === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    <i className="fa-solid fa-memory text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">Redis 캐시</h3>
                  <p className="text-xs text-neutral-600 capitalize">
                    {systemStatus?.redis || 'unknown'}
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-server text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">웹 서버</h3>
                  <p className="text-xs text-neutral-600">정상</p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className={`w-4 h-4 rounded-full mx-auto mb-1 flex items-center justify-center ${
                    systemStatus?.api === 'healthy' ? 'bg-green-600' :
                    systemStatus?.api === 'warning' ? 'bg-yellow-600' : 'bg-red-600'
                  }`}>
                    <i className="fa-solid fa-plug text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">API 상태</h3>
                  <p className="text-xs text-neutral-600 capitalize">
                    {systemStatus?.api || 'unknown'}
                  </p>
                </div>
              </div>

              {/* 추가 시스템 정보 */}
              <div className="mt-4 pt-3 border-t border-neutral-200">
                <div className="text-xs text-neutral-600 space-y-1">
                  <div className="flex justify-between">
                    <span>마지막 백업:</span>
                    <span>{systemStatus?.lastBackup ?
                      new Date(systemStatus.lastBackup).toLocaleString('ko-KR') :
                      '정보 없음'
                    }</span>
                  </div>
                  <div className="flex justify-between">
                    <span>활성 연결:</span>
                    <span>{dashboardStats?.activePosts || 0}건</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 캘린더 */}
            <div className="bg-white rounded-xl shadow-lg p-4">
              <h2 className="text-lg text-neutral-900 mb-3">
                {new Date().toLocaleDateString('ko-KR', { month: 'long', year: 'numeric' })}
              </h2>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day, index) => (
                  <div key={index} className="text-center text-xs text-neutral-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* 이번 달의 첫 날까지 빈 칸 채우기 */}
                {(() => {
                  const today = new Date();
                  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
                  const startDayOfWeek = firstDay.getDay(); // 0: 일요일, 1: 월요일, ...

                  return Array.from({ length: startDayOfWeek }, (_, i) => (
                    <div key={`empty-${i}`} className="text-center py-1 text-xs text-neutral-400"></div>
                  ));
                })()}

                {/* 날짜들 */}
                {(() => {
                  const today = new Date();
                  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
                  const currentDay = today.getDate();

                  return Array.from({ length: lastDay }, (_, i) => {
                    const day = i + 1;
                    const isToday = day === currentDay;

                    // 게시 예정 포스트가 있는 날짜 계산
                    const publishedPosts = postsByStatus?.published || [];
                    const scheduledPosts = postsByStatus?.final_approved || [];
                    const hasPosts = [...publishedPosts, ...scheduledPosts].some((post: any) => {
                      const postDate = post.publish_date ? new Date(post.publish_date) : null;
                      return postDate && postDate.getDate() === day && postDate.getMonth() === today.getMonth();
                    });

                    return (
                      <div
                        key={day}
                        className={`text-center py-1 text-xs relative ${
                          isToday ? 'bg-neutral-600 text-white rounded' :
                          hasPosts ? 'font-medium text-neutral-800' : 'text-neutral-700'
                        }`}
                      >
                        {day}
                        {hasPosts && !isToday && (
                          <div className="w-1 h-1 bg-neutral-600 rounded-full mx-auto mt-1"></div>
                        )}
                      </div>
                    );
                  });
                })()}
              </div>
              <div className="mt-3 space-y-1">
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full mr-2"></div>
                  <span className="text-neutral-600">게시 예정/완료</span>
                </div>
                <div className="flex items-center text-xs">
                  <div className="w-2 h-2 bg-neutral-600 rounded-full mr-2"></div>
                  <span className="text-neutral-600">오늘</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 빠른 작업 섹션 */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-3">빠른 작업</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: 'fa-plus', title: '새 캠페인' },
                { icon: 'fa-hospital', title: '병원 추가' },
                { icon: 'fa-file-alt', title: '포스트 생성' },
                { icon: 'fa-download', title: '보고서 다운로드' }
              ].map((action, index) => (
                <button
                  key={index}
                  className="flex flex-col items-center p-3 border-2 border-neutral-200 rounded-lg hover:border-neutral-300 hover:bg-neutral-50 transition-colors"
                >
                  <div className="w-8 h-8 bg-neutral-100 rounded-lg flex items-center justify-center mb-2">
                    <i className={`fa-solid ${action.icon} text-neutral-600 text-sm`}></i>
                  </div>
                  <span className="text-xs text-neutral-700">{action.title}</span>
                </button>
              ))}
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
