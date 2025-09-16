'use client';

import { useState } from 'react';
import EmptyState from '@/components/admin/EmptyState';
import HospitalInfoTab from '@/components/admin/HospitalInfoTab';
import WorkManagementTab from '@/components/admin/WorkManagementTab';
import MonitoringTab from '@/components/admin/MonitoringTab';

export default function HospitalWorkPage() {
  const [selectedHospital, setSelectedHospital] = useState<any>(null);
  const [isHospitalListCollapsed, setIsHospitalListCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<'hospital-info' | 'work-management' | 'monitoring'>('hospital-info');

  const handleHospitalSelect = (hospital: any) => {
    setSelectedHospital(hospital);
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
            {mockHospitals.map((hospital) => (
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
                  <h3 className={`text-sm mb-1 ${hospital.id === selectedHospital?.id ? 'text-white' : 'text-neutral-800'}`}>
                    {hospital.name}
                  </h3>
                  <p className={`text-xs mb-2 ${hospital.id === selectedHospital?.id ? 'text-neutral-200' : 'text-neutral-600'}`}>
                    {hospital.specialty}
                  </p>
                  <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${
                    hospital.id === selectedHospital?.id ? 'bg-white bg-opacity-20' : 'bg-neutral-100'
                  }`}>
                    <i className={`fa-solid fa-hospital text-xs ${
                      hospital.id === selectedHospital?.id ? 'text-white' : 'text-neutral-600'
                    }`}></i>
                  </div>
                  <p className={`text-xs ${hospital.id === selectedHospital?.id ? 'text-neutral-200' : 'text-neutral-600'}`}>
                    활성 캠페인: {hospital.activeCampaigns}개
                  </p>
                </div>
              </div>
            ))}
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
            summaryCards={mockSummaryCards}
            basicInfo={mockHospitalDetails.basicInfo}
            campaigns={mockHospitalDetails.campaigns}
            schedule={mockHospitalDetails.schedule}
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
const mockHospitals = [
  {
    id: '137',
    name: '내이튼치과의원',
    specialty: '치과',
    activeCampaigns: 1,
    isSelected: true
  },
  {
    id: '138',
    name: '강남세브란스병원',
    specialty: '피부과',
    activeCampaigns: 2,
    isSelected: false
  },
  {
    id: '139',
    name: '아산병원',
    specialty: '내과',
    activeCampaigns: 1,
    isSelected: false
  },
  {
    id: '140',
    name: '삼성서울병원',
    specialty: '안과',
    activeCampaigns: 4,
    isSelected: false
  },
  {
    id: '141',
    name: '서울성모병원',
    specialty: '치과',
    activeCampaigns: 2,
    isSelected: false
  }
];

const mockSummaryCards = [
  {
    id: 'urgent',
    title: '🚨 긴급 처리 필요',
    value: '2건',
    description: '게시 지연, 자료 누락',
    action: '즉시 처리'
  },
  {
    id: 'progress',
    title: '캠페인 진행률',
    value: '78%',
    description: '3개 캠페인 평균',
    progress: 78
  },
  {
    id: 'performance',
    title: '성과 모니터링',
    value: '12.3K',
    description: '이번 주 총 조회수',
    change: '+15%'
  },
  {
    id: 'activity',
    title: '최근 활동',
    activities: [
      { description: '포스트 승인 완료', time: '15분 전' },
      { description: '캠페인 데이터 업데이트', time: '1시간 전' }
    ]
  }
];

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

