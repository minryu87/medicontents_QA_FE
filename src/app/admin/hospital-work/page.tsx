'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import EmptyState from '@/components/admin/EmptyState';
import HospitalInfoTab from '@/components/admin/HospitalInfoTab';
import WorkManagementTab from '@/components/admin/WorkManagementTab';
import PostingWorkTab from '@/components/admin/PostingWorkTab';
import MonitoringTab from '@/components/admin/MonitoringTab';

interface HospitalWithCampaigns {
  id: number;
  name: string;
  specialty?: string;
  activeCampaigns: number;
  averageProgress?: number; // 캠페인 평균 진행률
  logo_image?: string;
  isSelected?: boolean;
}

export default function HospitalWorkPage() {
  const [hospitals, setHospitals] = useState<HospitalWithCampaigns[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedHospital, setSelectedHospital] = useState<HospitalWithCampaigns | null>(null);
  const [selectedHospitalDetail, setSelectedHospitalDetail] = useState<any>(null);
  const [selectedHospitalCampaigns, setSelectedHospitalCampaigns] = useState<any[]>([]);
  const [calendarEvents, setCalendarEvents] = useState<any[]>([]);
  const [selectedCalendarDate, setSelectedCalendarDate] = useState<Date | null>(null);
  const [isHospitalListCollapsed, setIsHospitalListCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'hospital-info' | 'work-management' | 'posting-work' | 'monitoring'>('hospital-info');
  const [showCampaignTooltip, setShowCampaignTooltip] = useState(false);
  const [waitingTasks, setWaitingTasks] = useState<any[]>([]);
  const [waitingTasksLoading, setWaitingTasksLoading] = useState(false);
  const [kanbanPosts, setKanbanPosts] = useState<any>(null);
  const [kanbanLoading, setKanbanLoading] = useState(false);
  const [statusPosts, setStatusPosts] = useState<any>(null);
  const [statusPostsLoading, setStatusPostsLoading] = useState(false);
  const [selectedPostForWork, setSelectedPostForWork] = useState<any>(null);
  const [postingWorkPosts, setPostingWorkPosts] = useState<any[]>([]);
  const [postingWorkPostsLoading, setPostingWorkPostsLoading] = useState(false);
  const [selectedCampaignForWork, setSelectedCampaignForWork] = useState<any>(null);
  const [allPostingWorkPosts, setAllPostingWorkPosts] = useState<any[]>([]); // 필터링 전 전체 포스트

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.campaign-tooltip') && !target.closest('.campaign-selector')) {
        setShowCampaignTooltip(false);
      }
    };

    if (showCampaignTooltip) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCampaignTooltip]);

  // 캠페인 선택에 따라 데이터 로드
  useEffect(() => {
    if (selectedCampaignForWork && selectedHospital) {
      // 포스팅 작업 데이터 로드
      loadPostsForCampaign(selectedCampaignForWork.id);

      // 작업 관리 데이터 로드
      loadWorkManagementDataForCampaign(selectedCampaignForWork.id);
    } else {
      // 캠페인이 선택되지 않은 경우 빈 데이터로 설정
      setPostingWorkPosts([]);
      setAllPostingWorkPosts([]);
      setWaitingTasks([]);
      setKanbanPosts({
        material_completed: [],
        admin_pre_review: [],
        ai_completed: [],
        admin_review: [],
        client_review: [],
        publish_scheduled: [],
        material_delay: [],
        ai_failed: [],
        client_delay: [],
        aborted: []
      });
      setStatusPosts({
        publish_scheduled: [],
        published: [],
        monitoring: [],
        monitoring_issue: []
      });
    }
  }, [selectedCampaignForWork, selectedHospital]);

  // 캠페인별 포스트 로드 함수 (포스팅 작업용)
  const loadPostsForCampaign = async (campaignId: number) => {
    if (!selectedHospital) return;

    setPostingWorkPostsLoading(true);
    try {
      // 캠페인 ID로 포스트 조회 (새로운 API가 필요할 수 있음)
      // 현재는 전체 포스트에서 필터링하는 방식으로 임시 구현
      const allPosts = await adminApi.getPostsForPostingWork(selectedHospital.id);
      const campaignPosts = allPosts.filter((post: any) => post.campaign_id === campaignId);
      setPostingWorkPosts(campaignPosts);
      setAllPostingWorkPosts(campaignPosts);
    } catch (error) {
      console.error('캠페인 포스트 로드 실패:', error);
      setPostingWorkPosts([]);
      setAllPostingWorkPosts([]);
    } finally {
      setPostingWorkPostsLoading(false);
    }
  };

  // 캠페인별 작업 관리 데이터 로드 함수
  const loadWorkManagementDataForCampaign = async (campaignId: number) => {
    if (!selectedHospital) return;

    // 모든 로딩 상태를 true로 설정
    setWaitingTasksLoading(true);
    setKanbanLoading(true);
    setStatusPostsLoading(true);

    try {
      // 병렬로 작업 관리 데이터 로드
      const [waitingTasksResult, kanbanResult, statusPostsResult] = await Promise.allSettled([
        // 작업 대기 포스트 (캠페인별 필터링)
        adminApi.getWaitingTasks(selectedHospital.id, 20).then(data => {
          const filteredTasks = data.waiting_tasks.filter((task: any) => task.campaign_id === campaignId);
          return filteredTasks.map(task => ({
            id: task.post_id,
            post_type: task.post_type,
            title: task.title,
            publish_date: task.publish_date,
            created_at: task.created_at
          }));
        }),

        // 칸반 포스트 (캠페인별 필터링이 필요하다면 여기에 추가)
        adminApi.getKanbanPosts(selectedHospital.id),

        // 상태별 포스트 (캠페인별 필터링)
        adminApi.getPostsByStatus(selectedHospital.id).then(data => {
          const filteredPosts = {
            publish_scheduled: data.publish_scheduled?.filter((post: any) => post.campaign_id === campaignId) || [],
            published: data.published?.filter((post: any) => post.campaign_id === campaignId) || [],
            monitoring: data.monitoring?.filter((post: any) => post.campaign_id === campaignId) || [],
            monitoring_issue: data.monitoring_issue?.filter((post: any) => post.campaign_id === campaignId) || []
          };
          return filteredPosts;
        })
      ]);

      // 작업 대기 데이터 설정
      if (waitingTasksResult.status === 'fulfilled') {
        setWaitingTasks(waitingTasksResult.value);
      } else {
        console.error('작업 대기 데이터 로드 실패:', waitingTasksResult.reason);
        setWaitingTasks([]);
      }

      // 칸반 데이터 설정
      if (kanbanResult.status === 'fulfilled') {
        // 칸반 데이터도 캠페인별로 필터링할 수 있다면 여기서 처리
        setKanbanPosts(kanbanResult.value);
      } else {
        console.error('칸반 데이터 로드 실패:', kanbanResult.reason);
        setKanbanPosts({
          material_completed: [],
          admin_pre_review: [],
          ai_completed: [],
          admin_review: [],
          client_review: [],
          publish_scheduled: [],
          material_delay: [],
          ai_failed: [],
          client_delay: [],
          aborted: []
        });
      }

      // 상태별 포스트 데이터 설정
      if (statusPostsResult.status === 'fulfilled') {
        setStatusPosts(statusPostsResult.value);
      } else {
        console.error('상태별 포스트 데이터 로드 실패:', statusPostsResult.reason);
        setStatusPosts({
          publish_scheduled: [],
          published: [],
          monitoring: [],
          monitoring_issue: []
        });
      }

    } catch (error) {
      console.error('작업 관리 데이터 로드 실패:', error);
      // 에러 시 빈 데이터로 설정
      setWaitingTasks([]);
      setKanbanPosts({
        material_completed: [],
        admin_pre_review: [],
        ai_completed: [],
        admin_review: [],
        client_review: [],
        publish_scheduled: [],
        material_delay: [],
        ai_failed: [],
        client_delay: [],
        aborted: []
      });
      setStatusPosts({
        publish_scheduled: [],
        published: [],
        monitoring: [],
        monitoring_issue: []
      });
    } finally {
      setWaitingTasksLoading(false);
      setKanbanLoading(false);
      setStatusPostsLoading(false);
    }
  };

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        setError(null);

        const hospitalsData = await adminApi.getHospitals();

        // 병원 데이터를 UI에 맞는 형태로 변환
        const hospitalsWithCampaigns: HospitalWithCampaigns[] = hospitalsData.map(hospital => ({
          id: hospital.id,
          name: hospital.name,
          specialty: '병원', // 기본값, 실제로는 더 구체적인 정보 필요
          activeCampaigns: hospital.active_campaigns || 0,
          logo_image: hospital.logo_image,
          isSelected: false
        }));

        setHospitals(hospitalsWithCampaigns);
      } catch (error) {
        console.error('병원 목록 로드 실패:', error);
        setError('병원 목록을 불러오는 중 오류가 발생했습니다.');
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, []);

  const handleHospitalSelect = async (hospital: HospitalWithCampaigns) => {
    setSelectedHospital(hospital);
    setSelectedCampaignForWork(null); // 병원 선택 시 캠페인 선택 초기화

    // 선택된 병원의 상세 정보, 담당자 정보, 캠페인 정보를 병렬로 가져오기
    try {
      const [hospitalDetail, hospitalAdmin, campaigns] = await Promise.allSettled([
        adminApi.getHospital(hospital.id),
        adminApi.getHospitalAdmin(hospital.id),
        adminApi.getCampaigns({ hospital_id: hospital.id, status: 'active' })
      ]);

      // 병원 상세 정보 저장
      if (hospitalDetail.status === 'fulfilled') {
        setSelectedHospitalDetail(hospitalDetail.value);
      }

      // 담당자 정보 처리 및 병원 상세 정보 업데이트
      if (hospitalDetail.status === 'fulfilled' && hospitalAdmin.status === 'fulfilled' && hospitalAdmin.value?.username) {
        const updatedDetail = {
          ...hospitalDetail.value,
          admin: hospitalAdmin.value.username
        };
        setSelectedHospitalDetail(updatedDetail);
      }

        // 캠페인 및 포스트 정보 처리
        if (campaigns.status === 'fulfilled' && campaigns.value && campaigns.value.length > 0) {
          // 각 캠페인의 진행률 계산 (completed_post_count / target_post_count * 100)
          const progresses = campaigns.value.map((campaign: any) => {
            if (campaign.target_post_count && campaign.target_post_count > 0) {
              return (campaign.completed_post_count || 0) / campaign.target_post_count * 100;
            }
            return 0;
          });

          // 평균 진행률 계산
          const averageProgress = progresses.reduce((sum: number, progress: number) => sum + progress, 0) / progresses.length;

          // 선택된 병원 정보 업데이트
          const updatedHospital = { ...hospital, averageProgress };
          setSelectedHospital(updatedHospital);

          // 캠페인 데이터를 UI용 포맷으로 변환
          const uiCampaigns = campaigns.value.map((campaign: any) => ({
            id: campaign.id.toString(),
            name: campaign.name,
            status: campaign.status === 'active' ? '진행중' : campaign.status,
            period: campaign.start_date && campaign.end_date
              ? `${new Date(campaign.start_date).toLocaleDateString('ko-KR')} ~ ${new Date(campaign.end_date).toLocaleDateString('ko-KR')}`
              : '기간 미정',
            progress: campaign.target_post_count && campaign.target_post_count > 0
              ? Math.round((campaign.completed_post_count || 0) / campaign.target_post_count * 100)
              : 0,
            medical_service: campaign.medical_service,
            creator_username: campaign.creator_username
          }));

          setSelectedHospitalCampaigns(uiCampaigns);

          // 병원별 캠페인 및 포스트 데이터 가져오기
          try {
            const calendarData = await adminApi.getHospitalCalendarData(hospital.id);
            console.log('Calendar data received:', calendarData);

            // 캘린더 이벤트 생성
            const events: any[] = [];

            // 캠페인 이벤트 추가 (기간 전체를 표시)
            calendarData.campaigns.forEach((campaign: any) => {
              const startDate = new Date(campaign.start_date);
              const endDate = new Date(campaign.end_date);
              const today = new Date();
              const isCompleted = endDate < today;
              const isActive = startDate <= today && endDate >= today;
              const isScheduled = startDate > today;

              // 캠페인 기간의 모든 날짜에 이벤트 추가
              for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
                let eventType: string;
                if (isCompleted) eventType = 'campaign_completed';
                else if (isActive) eventType = 'campaign_active';
                else eventType = 'campaign_scheduled';

                events.push({
                  date: new Date(date),
                  type: eventType,
                  campaign: {
                    id: campaign.id.toString(),
                    name: campaign.name,
                    status: campaign.status,
                    start_date: campaign.start_date,
                    end_date: campaign.end_date,
                    description: campaign.description,
                    target_post_count: campaign.target_post_count,
                    completed_post_count: campaign.completed_post_count,
                    published_post_count: campaign.published_post_count,
                    medical_service: campaign.medical_service,
                    creator_username: campaign.creator_username
                  }
                });
              }
            });

            // 포스트 이벤트 추가 (게시 예정일에 점 표시)
            calendarData.posts.forEach((post: any) => {
              if (post.publish_date) {
                const publishDate = new Date(post.publish_date);
                let eventType: string;
                if (post.status === 'published') eventType = 'post_published';
                else if (post.status === 'completed' || post.status === 'final_approved') eventType = 'post_completed';
                else eventType = 'post_pending';

                events.push({
                  date: publishDate,
                  type: eventType,
                  post: {
                    id: post.post_id,
                    title: post.title,
                    status: post.status,
                    post_type: post.post_type,
                    publish_date: post.publish_date,
                    published_at: post.published_at,
                    published_url: post.published_url,
                    creator_username: post.creator_username
                  }
                });
              }
            });

            setCalendarEvents(events);
          } catch (error) {
            console.error('캘린더 데이터 로드 실패:', error);
            setCalendarEvents([]);
          }
        } else {
          // 캠페인이 없는 경우
          const updatedHospital = { ...hospital, averageProgress: 0 };
          setSelectedHospital(updatedHospital);
          setSelectedHospitalCampaigns([]);
          setCalendarEvents([]);
        }
      // 작업 관리 데이터는 캠페인 선택 시 로드하도록 변경

            // 포스팅 작업 탭용 기본 캠페인 설정 (첫 번째 active 캠페인)
            if (campaigns.status === 'fulfilled' && campaigns.value && campaigns.value.length > 0) {
              const activeCampaign = campaigns.value.find((c: any) => c.status === '진행중') || campaigns.value[0];
              setSelectedCampaignForWork(activeCampaign);
            }

    } catch (error) {
      console.error('병원 정보 로드 실패:', error);
      // 에러 시에도 병원 선택은 유지하되 기본값 사용
      const updatedHospital = { ...hospital, averageProgress: 0 };
      setSelectedHospital(updatedHospital);
      setSelectedHospitalCampaigns([]);
      setSelectedHospitalDetail(null);
             setWaitingTasks([]);
             setWaitingTasksLoading(false);
             setKanbanPosts({
               material_completed: [],
               admin_pre_review: [],
               ai_completed: [],
               admin_review: [],
               client_review: [],
               publish_scheduled: [],
               material_delay: [],
               ai_failed: [],
               client_delay: [],
               aborted: []
             });
             setKanbanLoading(false);
             setStatusPosts({
               publish_scheduled: [],
               published: [],
               monitoring: [],
               monitoring_issue: []
             });
             setStatusPostsLoading(false);
             setPostingWorkPosts([]);
             setPostingWorkPostsLoading(false);
             setCalendarEvents([]);
    }
  };


  const handleTabChange = (newTab: 'hospital-info' | 'work-management' | 'posting-work' | 'monitoring') => {
    setActiveTab(newTab);
  };

  const handleDateSelect = (date: Date) => {
    setSelectedCalendarDate(date);
  };

  return (
    <div className="h-full bg-neutral-50 overflow-y-auto">
      {/* 병원 목록 캐러셀 */}
      <div className="px-6 py-4 bg-white border-b border-neutral-100">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <h2 className="text-lg text-neutral-900">병원 목록</h2>
            <button
              onClick={() => setIsHospitalListCollapsed(!isHospitalListCollapsed)}
              className="flex items-center space-x-2 px-3 py-1 text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-sm"
            >
              <span>{isHospitalListCollapsed ? '펼치기' : '접기'}</span>
              <i className={`fa-solid ${isHospitalListCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
            </button>
          </div>
          <div className="flex space-x-2">
            <button className="p-2 text-neutral-500 hover:text-neutral-700">
              <i className="fa-solid fa-chevron-left"></i>
            </button>
            <button className="p-2 text-neutral-500 hover:text-neutral-700">
              <i className="fa-solid fa-chevron-right"></i>
            </button>
          </div>
        </div>
        {!isHospitalListCollapsed && (
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {loading ? (
              <div className="flex items-center justify-center min-w-48 py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
                <span className="ml-2 text-neutral-600">병원 목록 로딩 중...</span>
              </div>
            ) : error ? (
              <div className="flex items-center justify-center min-w-48 py-8">
                <div className="text-center">
                  <div className="text-red-500 mb-2">⚠️</div>
                  <p className="text-sm text-red-600">{error}</p>
                  <button
                    onClick={() => window.location.reload()}
                    className="mt-2 px-3 py-1 bg-red-100 text-red-700 rounded text-sm hover:bg-red-200"
                  >
                    다시 시도
                  </button>
                </div>
              </div>
            ) : hospitals.length === 0 ? (
              <div className="flex items-center justify-center min-w-48 py-8">
                <div className="text-center text-neutral-500">
                  <div className="text-2xl mb-2">🏥</div>
                  <p className="text-sm">등록된 병원이 없습니다.</p>
                </div>
              </div>
            ) : (
              hospitals.map((hospital) => (
                <div
                  key={hospital.id}
                  className={`rounded-lg p-3 min-w-48 flex-shrink-0 shadow-lg cursor-pointer transition-all ${
                    hospital.id === selectedHospital?.id
                      ? 'bg-neutral-600 text-white'
                      : 'bg-white border border-neutral-200 text-neutral-800'
                  }`}
                  onClick={() => handleHospitalSelect(hospital)}
                >
                  <div className="text-center">
                    <h3 className={`text-sm mb-2 ${hospital.id === selectedHospital?.id ? 'text-white' : 'text-neutral-800'}`}>
                      {hospital.name}
                    </h3>
                    <div className={`w-20 h-10 rounded-lg mx-auto mb-2 flex items-center justify-center bg-white border ${
                      hospital.id === selectedHospital?.id ? 'border-white border-opacity-30' : 'border-neutral-200'
                    }`}>
                      {hospital.logo_image ? (
                        <img
                          src={hospital.logo_image.replace('@', '')}
                          alt={`${hospital.name} 로고`}
                          className="w-16 h-8 object-contain"
                        />
                      ) : (
                        <i className={`fa-solid fa-hospital text-sm ${
                          hospital.id === selectedHospital?.id ? 'text-neutral-600' : 'text-neutral-400'
                        }`}></i>
                      )}
                    </div>
                    <p className={`text-xs ${hospital.id === selectedHospital?.id ? 'text-neutral-200' : 'text-neutral-600'}`}>
                      활성 캠페인: {hospital.activeCampaigns}개
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 탭 메뉴 */}
      <div className="px-6 py-4 bg-white border-b border-neutral-100">
        <div className="flex items-center" style={{ justifyContent: 'space-between', paddingRight: '120px' }}>
          <div className="flex space-x-1">
            <button
              onClick={() => handleTabChange('hospital-info')}
              className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                activeTab === 'hospital-info'
                  ? 'bg-neutral-600 text-white'
                  : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
              }`}
            >
              병원 정보
            </button>
                   <button
                     onClick={() => handleTabChange('work-management')}
                     className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                       activeTab === 'work-management'
                         ? 'bg-neutral-600 text-white'
                         : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                     }`}
                   >
                     작업 관리
                   </button>
                   <button
                     onClick={() => handleTabChange('posting-work')}
                     className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                       activeTab === 'posting-work'
                         ? 'bg-neutral-600 text-white'
                         : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                     }`}
                   >
                     포스팅 작업
                   </button>
                   <button
                     onClick={() => handleTabChange('monitoring')}
                     className={`px-6 py-3 text-sm font-medium rounded-lg transition-colors ${
                       activeTab === 'monitoring'
                         ? 'bg-neutral-600 text-white'
                         : 'text-neutral-600 hover:text-neutral-800 hover:bg-neutral-100'
                     }`}
                   >
                     모니터링
                   </button>
          </div>

          {/* 작업 관리/포스팅 작업 탭용 캠페인 선택기 */}
          {(activeTab === 'work-management' || activeTab === 'posting-work') && selectedHospital && (
            <div className="relative">
              <div
                className="campaign-selector border border-neutral-200 rounded-lg p-3 hover:bg-neutral-50 transition-colors duration-200 cursor-pointer"
                onClick={() => setShowCampaignTooltip(!showCampaignTooltip)}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm text-neutral-800">
                    {selectedHospitalCampaigns.length > 0
                      ? selectedHospitalCampaigns[0]?.name || '캠페인 없음'
                      : '캠페인 없음'
                    }
                  </h3>
                  <div className="flex items-center space-x-1">
                    <button className="p-1 text-neutral-500 hover:text-neutral-700">
                      <i className="fa-solid fa-chevron-left text-xs"></i>
                    </button>
                    <span className={`px-1 py-1 rounded text-xs ${
                      selectedHospitalCampaigns.length > 0 && selectedHospitalCampaigns[0]?.status === '진행중'
                        ? 'bg-neutral-100 text-neutral-800' :
                      selectedHospitalCampaigns.length > 0 && selectedHospitalCampaigns[0]?.status === '완료'
                        ? 'bg-green-100 text-green-800' :
                        'bg-blue-100 text-blue-800'
                    }`}>
                      {selectedHospitalCampaigns.length > 0
                        ? selectedHospitalCampaigns[0]?.status || '대기'
                        : '없음'
                      }
                    </span>
                    <button className="p-1 text-neutral-500 hover:text-neutral-700">
                      <i className="fa-solid fa-chevron-right text-xs"></i>
                    </button>
                  </div>
                </div>
              </div>

              {/* 캠페인 상세 정보 툴팁 */}
              {showCampaignTooltip && selectedHospitalCampaigns.length > 0 && (
                <div className="campaign-tooltip absolute top-full left-0 mt-2 w-120 bg-white border border-neutral-200 rounded-lg shadow-lg p-4 z-50">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm text-neutral-900 font-medium">
                        {selectedHospitalCampaigns[0]?.name}
                      </h4>
                      <span className={`px-2 py-1 rounded text-xs ${
                        selectedHospitalCampaigns[0]?.status === '진행중'
                          ? 'bg-neutral-100 text-neutral-800' :
                        selectedHospitalCampaigns[0]?.status === '완료'
                          ? 'bg-green-100 text-green-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                        {selectedHospitalCampaigns[0]?.status}
                      </span>
                    </div>

                    <div className="text-sm text-neutral-600">
                      <p><strong>기간:</strong> {selectedHospitalCampaigns[0]?.period || '미정'}</p>
                      <p><strong>진행률:</strong> {selectedHospitalCampaigns[0]?.progress || 0}%</p>
                      <p><strong>담당자:</strong> {selectedHospitalCampaigns[0]?.creator_username || '미정'}</p>
                    </div>

                    {selectedHospitalCampaigns[0]?.description && (
                      <div className="text-sm text-neutral-700 bg-neutral-50 p-2 rounded">
                        <strong>설명:</strong> {selectedHospitalCampaigns[0].description}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>


      {/* 탭별 콘텐츠 */}
             {activeTab === 'hospital-info' && (
               selectedHospital ? (
                 <HospitalInfoTab
                   summaryCards={createSummaryCards(selectedHospital)}
                   basicInfo={{
                     name: selectedHospital.name,
                     specialty: '병원',
                     logoImage: selectedHospital.logo_image,
                     manager: selectedHospitalDetail?.admin || '담당자 미정',
                     joinDate: selectedHospitalDetail?.created_at
                       ? new Date(selectedHospitalDetail.created_at).toLocaleDateString('ko-KR')
                       : '가입일 미정',
                     contact: selectedHospitalDetail?.phone || '연락처 미정',
                     address: selectedHospitalDetail?.address,
                     website: selectedHospitalDetail?.website,
                     mapLink: selectedHospitalDetail?.map_link,
                     description: selectedHospitalDetail?.description,
                     status: selectedHospitalDetail?.is_active ? '활성' : '비활성'
                   }}
                   campaigns={selectedHospitalCampaigns}
                   schedule={{
                     month: '1월 2025',
                     events: [] // 실제 일정 데이터로 교체 필요
                   }}
                   calendarEvents={calendarEvents}
                   onDateSelect={handleDateSelect}
                   selectedDate={selectedCalendarDate}
                 />
               ) : (
          <EmptyState
            icon="fa-hospital"
            title="병원을 선택해주세요"
            description="병원 목록에서 병원을 선택하면 상세 정보를 확인할 수 있습니다."
          />
        )
      )}

             {activeTab === 'work-management' && (
               selectedHospital ? (
                 <WorkManagementTab
                   waitingTasks={waitingTasks}
                   publishPending={statusPosts?.publish_scheduled || []}
                   publishCompleted={statusPosts?.published || []}
                   monitoring={statusPosts?.monitoring || []}
                   monitoringIssues={statusPosts?.monitoring_issue || []}
                   isLoadingWaitingTasks={waitingTasksLoading}
                   kanbanPosts={kanbanPosts}
                   isLoadingKanban={kanbanLoading}
                   statusPostsLoading={statusPostsLoading}
                   selectedCampaign={selectedCampaignForWork}
                   isLoadingAll={waitingTasksLoading || kanbanLoading || statusPostsLoading}
                 />
               ) : (
                 <EmptyState
                   icon="fa-tasks"
                   title="병원을 선택해주세요"
                   description="병원 목록에서 병원을 선택하면 작업 현황을 확인할 수 있습니다."
                 />
               )
             )}

             {activeTab === 'posting-work' && (
               selectedHospital ? (
                 <PostingWorkTab
                   posts={postingWorkPosts}
                   isLoading={postingWorkPostsLoading}
                   selectedHospitalId={selectedHospital.id}
                   onPostSelect={setSelectedPostForWork}
                   selectedPost={selectedPostForWork}
                 />
               ) : (
                 <EmptyState
                   icon="fa-tools"
                   title="병원을 선택해주세요"
                   description="병원 목록에서 병원을 선택하면 포스팅 작업을 진행할 수 있습니다."
                 />
               )
             )}

             {activeTab === 'monitoring' && (
        selectedHospital ? (
          <MonitoringTab
            performanceStats={mockPerformanceStats}
            trafficData={mockTrafficData}
            topPosts={mockTopPosts}
          />
        ) : (
          <EmptyState
            icon="fa-chart-line"
            title="병원을 선택해주세요"
            description="병원 목록에서 병원을 선택하면 성과 데이터를 확인할 수 있습니다."
          />
        )
      )}
    </div>
  );
}

// Mock 데이터들 (나중에 API로 대체)

// 병원별 요약 카드 생성 함수
const createSummaryCards = (hospital: HospitalWithCampaigns | null) => {
  return [
  {
    id: 'urgent',
    title: '🚨 긴급 처리 필요',
      value: undefined, // 데이터 없음 표시
      description: '표시할 데이터가 없습니다.'
  },
  {
    id: 'progress',
    title: '캠페인 진행률',
      value: hospital ? `${Math.round(hospital.averageProgress || 0)}%` : '0%',
      description: hospital ? `${hospital.activeCampaigns}개 캠페인 평균` : '캠페인 없음',
      progress: hospital?.averageProgress || 0
  },
  {
    id: 'performance',
    title: '성과 모니터링',
      value: undefined, // 데이터 없음 표시
      description: '표시할 데이터가 없습니다.'
  },
  {
    id: 'activity',
    title: '최근 활동',
      activities: undefined // 데이터 없음 표시
  }
];
};

const mockHospitalDetails = {
  basicInfo: {
    name: '내이튼치과의원',
    specialty: '치과',
    manager: '김의사',
    contact: '02-2072-2114',
    joinDate: '2024.03.15',
    status: '활성'
  },
  campaigns: [
    {
      id: 'camp_001',
      name: '무릎 관절염 치료',
      status: '진행중',
      period: '2025.01.01 ~ 2025.03.31',
      progress: 65
    },
    {
      id: 'camp_002',
      name: '척추 건강 관리',
      status: '완료',
      period: '2024.10.01 ~ 2024.12.31',
      progress: 100
    },
    {
      id: 'camp_003',
      name: '스포츠 부상 예방',
      status: '준비중',
      period: '2025.02.01 ~ 2025.04.30',
      progress: 15
    }
  ],
  schedule: {
    month: '1월 2025',
    events: [
      { day: 15, hasEvent: true, type: 'post' },
      { day: 16, hasEvent: true, type: 'review' },
      { day: 17, hasEvent: true, type: 'publish' },
      { day: 20, hasEvent: true, type: 'post' },
      { day: 22, hasEvent: true, type: 'review' }
    ]
  }
};

const mockWaitingTasks = [
  {
    id: 'WAIT-001',
    title: '관절 건강 교육자료',
    description: '병원 측 자료 대기 중',
    assignee: '김의사',
    priority: 'waiting',
    type: 'material'
  },
  {
    id: 'WAIT-002',
    title: '수술 후 관리법',
    description: '의료진 검토 대기',
    assignee: '이간호사',
    priority: 'waiting',
    type: 'review'
  },
  {
    id: 'WAIT-003',
    title: '재활 운동 가이드',
    description: '콘텐츠 기획 대기',
    assignee: '박물리치료사',
    priority: 'waiting',
    type: 'planning'
  }
];

// 게시 대기 데이터
const mockPublishPending = [
  {
    id: 'READY-001',
    title: '관절 건강 체크리스트',
    scheduledDate: '1월 17일 09:00',
    assignee: '김의사',
    avatar: 'ready01'
  },
  {
    id: 'READY-002',
    title: '수술 후 재활 운동',
    scheduledDate: '1월 18일 14:00',
    assignee: '박물리치료사',
    avatar: 'ready02'
  }
];

// 게시 완료 데이터
const mockPublishCompleted = [
  {
    id: 'DONE-001',
    title: '겨울철 관절 관리',
    publishedDate: '1월 15일 09:00',
    views: 1234,
    likes: 89,
    assignee: '김의사',
    avatar: 'done01'
  },
  {
    id: 'DONE-002',
    title: '무릎 관절염 초기 증상',
    publishedDate: '1월 14일 14:00',
    views: 892,
    likes: 67,
    assignee: '이간호사',
    avatar: 'done02'
  }
];

// 모니터링 데이터
const mockMonitoring = [
  {
    id: 'MON-001',
    title: '겨울철 관절 관리',
    views: 1234,
    likes: 89,
    shares: 23,
    performance: '목표 대비 112%',
    status: '정상'
  },
  {
    id: 'MON-002',
    title: '무릎 관절염 초기 증상',
    views: 892,
    likes: 67,
    shares: 15,
    performance: '목표 대비 89%',
    status: '정상'
  }
];

// 모니터링 이슈 발생 데이터
const mockMonitoringIssues = [
  {
    id: 'ALERT-001',
    title: '척추 건강 체크포인트',
    views: 234,
    likes: 12,
    shares: 3,
    performance: '목표 대비 45%',
    status: '주의'
  },
  {
    id: 'ALERT-002',
    title: '관절염 예방 운동',
    views: 156,
    likes: 8,
    shares: 2,
    performance: '목표 대비 32%',
    status: '주의'
  }
];

// 성과 모니터링 데이터
const mockPerformanceStats = {
  totalViews: 12340,
  totalViewsChange: '+15.2%',
  likes: 847,
  likesChange: '+23.1%',
  shares: 156,
  sharesChange: '-5.3%',
  engagement: '3.2%',
  engagementChange: '+0.8%'
};

// 유입량 추이 데이터
const mockTrafficData = [
  { day: '1일', views: 800 },
  { day: '2일', views: 1200 },
  { day: '3일', views: 1600 },
  { day: '4일', views: 2000 },
  { day: '5일', views: 2400 },
  { day: '6일', views: 1800 },
  { day: '7일', views: 2200 },
  { day: '8일', views: 2800 },
  { day: '9일', views: 3200 },
  { day: '10일', views: 3000 },
  { day: '11일', views: 3400 },
  { day: '12일', views: 4000 },
  { day: '13일', views: 3800 },
  { day: '14일', views: 3600 }
];

// 인기 포스트 TOP 5
const mockTopPosts = [
  {
    rank: 1,
    title: '겨울철 관절 관리법',
    publishedDate: '1월 15일 게시',
    views: 2456
  },
  {
    rank: 2,
    title: '무릎 관절염 초기 증상',
    publishedDate: '1월 12일 게시',
    views: 1892
  },
  {
    rank: 3,
    title: '척추 건강 체크포인트',
    publishedDate: '1월 10일 게시',
    views: 1654
  },
  {
    rank: 4,
    title: '관절염 예방 운동',
    publishedDate: '1월 8일 게시',
    views: 1423
  },
  {
    rank: 5,
    title: '스포츠 부상 재활',
    publishedDate: '1월 5일 게시',
    views: 1289
  }
];

