'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import EmptyState from '@/components/admin/EmptyState';
import HospitalInfoTab from '@/components/admin/HospitalInfoTab';
import WorkManagementTab from '@/components/admin/WorkManagementTab';
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
  const [isHospitalListCollapsed, setIsHospitalListCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'hospital-info' | 'work-management' | 'monitoring'>('hospital-info');

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

      // 캠페인 정보 처리
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
            : 0
        }));

        setSelectedHospitalCampaigns(uiCampaigns);
      } else {
        // 캠페인이 없는 경우
        const updatedHospital = { ...hospital, averageProgress: 0 };
        setSelectedHospital(updatedHospital);
        setSelectedHospitalCampaigns([]);
      }
    } catch (error) {
      console.error('병원 정보 로드 실패:', error);
      // 에러 시에도 병원 선택은 유지하되 기본값 사용
      const updatedHospital = { ...hospital, averageProgress: 0 };
      setSelectedHospital(updatedHospital);
      setSelectedHospitalCampaigns([]);
      setSelectedHospitalDetail(null);
    }
  };

  const handleTabChange = (newTab: 'hospital-info' | 'work-management' | 'monitoring') => {
    setActiveTab(newTab);
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
            waitingTasks={mockWaitingTasks}
            publishPending={mockPublishPending}
            publishCompleted={mockPublishCompleted}
            monitoring={mockMonitoring}
            monitoringIssues={mockMonitoringIssues}
          />
        ) : (
          <EmptyState
            icon="fa-tasks"
            title="병원을 선택해주세요"
            description="병원 목록에서 병원을 선택하면 작업 현황을 확인할 수 있습니다."
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

