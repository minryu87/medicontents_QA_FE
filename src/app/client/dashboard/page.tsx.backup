'use client';

import { useEffect, useState } from 'react';
import { clientApi } from '@/services/api';

// 실제 API에서 가져올 데이터들
export default function ClientDashboard() {
  const [loading, setLoading] = useState(true);

  // 실제 API에서 가져올 데이터들
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [recentActivities, setRecentActivities] = useState<any[]>([]);
  const [postsByStatus, setPostsByStatus] = useState<any>({});
  const [campaignsWithPosts, setCampaignsWithPosts] = useState<any[]>([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // 실제 API 호출들
      const [
        statsRes,
        activitiesRes,
        actionRequiredRes,
        statusSummaryRes,
        campaignsRes
      ] = await Promise.allSettled([
        clientApi.getDashboardStats(),
        Promise.resolve([]), // 최근 활동 API가 아직 없으므로 빈 배열
        clientApi.getActionRequiredPosts(),
        clientApi.getPostsStatusSummary(),
        clientApi.getCampaignsWithPosts()
      ]);

      // 각 API 결과를 상태에 저장
      if (statsRes.status === 'fulfilled') {
        setDashboardStats(statsRes.value);
      }

      if (activitiesRes.status === 'fulfilled') {
        setRecentActivities(activitiesRes.value);
      }

      if (campaignsRes.status === 'fulfilled') {
        setCampaignsWithPosts(campaignsRes.value);
      }

      // 포스트 상태별 데이터 구성
      if (actionRequiredRes.status === 'fulfilled' && statusSummaryRes.status === 'fulfilled') {
        const actionData = actionRequiredRes.value;
        const statusData = statusSummaryRes.value;

        setPostsByStatus({
          material_waiting: statusData.materials_needed || [],
          client_review: statusData.review_needed || [],
          urgent_materials: actionData.urgent_materials || [],
          old_reviews: actionData.old_reviews || []
        });
      }

      // 포스트 데이터 로드 (상태별 분류)
      await loadPostsByStatus();

    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error);
      // 에러 발생 시 빈 데이터로 설정
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const loadPostsByStatus = async () => {
    try {
      // 각 상태별 포스트 조회
      const statusFilters = [
        { status: 'material_waiting', limit: 5 },    // 자료 제공 필요
        { status: 'client_review', limit: 5 },       // 검토 필요
        { status: 'final_approved', limit: 5 },      // 승인 대기
        { status: 'published', limit: 5 }            // 게시 완료
      ];

      const postsData: any = {};

      for (const filter of statusFilters) {
        try {
          const response = await clientApi.getPosts({ ...filter });
          postsData[filter.status] = response || [];
        } catch (error) {
          console.warn(`${filter.status} 포스트 조회 실패:`, error);
          postsData[filter.status] = [];
        }
      }

      setPostsByStatus((prev: any) => ({ ...prev, ...postsData }));
    } catch (error) {
      console.error('포스트 데이터 로드 실패:', error);
      setPostsByStatus({});
    }
  };

  const setFallbackData = () => {
    // API 호출 실패 시 빈 데이터 설정
    setDashboardStats(null);
    setRecentActivities([]);
    setPostsByStatus({});
    setCampaignsWithPosts([]);
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
              <h1 className="text-xl text-neutral-900">내 콘텐츠 현황</h1>
              <p className="text-neutral-600 text-sm mt-1">
                {new Date().toLocaleDateString('ko-KR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  weekday: 'long'
                })}
                {dashboardStats && (
                  <span className="ml-4 text-xs">
                    총 {dashboardStats.totalPosts || 0}개 포스트 · 진행중 {dashboardStats.pendingPosts || 0}개
                  </span>
                )}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="px-3 py-2 bg-neutral-600 text-white rounded-lg hover:bg-neutral-700 text-sm">
                <i className="fa-solid fa-plus mr-1"></i>
                새 포스트
              </button>
              <button className="p-2 text-neutral-500 hover:text-neutral-700">
                <i className="fa-solid fa-bell"></i>
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
                <h2 className="text-sm text-neutral-900">🚨 긴급 작업</h2>
                <span className="text-xs text-neutral-500">실시간</span>
              </div>
              <div className="space-y-2">
                {(postsByStatus.urgent_materials?.length > 0 || postsByStatus.old_reviews?.length > 0) ? (
                  <>
                    {postsByStatus.urgent_materials?.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-clock text-red-600 text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-800">자료 제공 지연</p>
                          <p className="text-xs text-neutral-500 mt-1">{postsByStatus.urgent_materials.length}건</p>
                        </div>
                        <button className="px-2 py-1 bg-red-600 text-white text-xs rounded-lg hover:bg-red-700">
                          바로가기
                        </button>
                      </div>
                    )}
                    {postsByStatus.old_reviews?.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <div className="w-4 h-4 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-exclamation-triangle text-orange-600 text-xs"></i>
                        </div>
                        <div className="flex-1">
                          <p className="text-xs text-neutral-800">검토 오래됨</p>
                          <p className="text-xs text-neutral-500 mt-1">{postsByStatus.old_reviews.length}건</p>
                        </div>
                        <button className="px-2 py-1 bg-orange-600 text-white text-xs rounded-lg hover:bg-orange-700">
                          확인
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-4">
                    <p className="text-xs text-neutral-500">긴급한 작업이 없습니다</p>
                  </div>
                )}
              </div>
            </div>

            {/* 현황 모니터 */}
            <div className="bg-white rounded-xl shadow-lg p-3">
              <h2 className="text-sm text-neutral-900 mb-3">콘텐츠 현황</h2>
              <div className="grid grid-cols-2 gap-2">
                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-blue-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-file-alt text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">자료 대기</h3>
                  <p className="text-xs text-neutral-600">
                    {postsByStatus.material_waiting?.length || 0}건
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-eye text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">검토 대기</h3>
                  <p className="text-xs text-neutral-600">
                    {postsByStatus.client_review?.length || 0}건
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-purple-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-check text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">승인 완료</h3>
                  <p className="text-xs text-neutral-600">
                    {postsByStatus.final_approved?.length || 0}건
                  </p>
                </div>

                <div className="text-center p-2 bg-neutral-50 rounded-lg">
                  <div className="w-4 h-4 bg-green-600 rounded-full mx-auto mb-1 flex items-center justify-center">
                    <i className="fa-solid fa-paper-plane text-white text-xs"></i>
                  </div>
                  <h3 className="text-xs text-neutral-800">게시 완료</h3>
                  <p className="text-xs text-neutral-600">
                    {postsByStatus.published?.length || 0}건
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
            <h2 className="text-lg text-neutral-900 mb-3">내 작업 목록</h2>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* 자료 제공 필요 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">자료 제공 필요</h3>
                <div className="space-y-2">
                  {postsByStatus.material_waiting?.length > 0 ? (
                    postsByStatus.material_waiting.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.campaign_name || '캠페인 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(자료 제공)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 검토 필요 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">검토 필요</h3>
                <div className="space-y-2">
                  {postsByStatus.client_review?.length > 0 ? (
                    postsByStatus.client_review.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.campaign_name || '캠페인 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(검토하기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 승인 대기 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">승인 대기</h3>
                <div className="space-y-2">
                  {postsByStatus.final_approved?.length > 0 ? (
                    postsByStatus.final_approved.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.campaign_name || '캠페인 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(확인하기)</button>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-neutral-500 text-center py-2">작업 없음</p>
                  )}
                </div>
              </div>

              {/* 게시 완료 칸반 */}
              <div className="bg-neutral-50 rounded-lg p-3 min-w-48 flex-shrink-0">
                <h3 className="text-sm text-neutral-800 mb-2 text-center">게시 완료</h3>
                <div className="space-y-2">
                  {postsByStatus.published?.length > 0 ? (
                    postsByStatus.published.slice(0, 3).map((post: any) => (
                      <div key={post.id} className="bg-white p-2 rounded-lg border border-neutral-200">
                        <p className="text-xs text-neutral-800">{post.title || `포스트 ${post.post_id}`}</p>
                        <p className="text-xs text-neutral-600 mt-1">{post.campaign_name || '캠페인 미정'}</p>
                        <button className="text-xs text-neutral-600 hover:text-neutral-800 mt-1">(보기)</button>
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

        {/* 캠페인 현황 */}
        <div className="px-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg text-neutral-900">캠페인 현황</h2>
              <span className="text-neutral-600 hover:text-neutral-700 text-xs cursor-pointer">전체보기 →</span>
            </div>
            <div className="flex space-x-3 overflow-x-auto pb-2">
              {campaignsWithPosts && campaignsWithPosts.length > 0 ? (
                campaignsWithPosts.slice(0, 3).map((campaignData: any) => (
                  <div
                    key={campaignData.campaign.id}
                    className="bg-white border-2 rounded-lg p-3 min-w-48 flex-shrink-0 border-neutral-200"
                  >
                    <div className="text-center">
                      <h3 className="text-neutral-800 text-sm">{campaignData.campaign.name}</h3>
                      <p className="text-xs text-neutral-600 mb-2">{campaignData.campaign.description || '진행중인 캠페인'}</p>
                      <div className="w-10 h-10 bg-neutral-100 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <i className="fa-solid fa-bullhorn text-neutral-600 text-sm"></i>
                      </div>
                      <p className="text-xs text-neutral-600">진행률</p>
                      <p className={`text-xs mt-1 text-neutral-500`}>
                        {campaignData.campaign.completed_posts || 0}/{campaignData.campaign.target_post_count || 0}건
                      </p>
                      <p className="text-xs text-neutral-500 mt-1">
                        {Math.round(((campaignData.campaign.completed_posts || 0) / (campaignData.campaign.target_post_count || 1)) * 100)}% 완료
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 w-full">
                  <p className="text-neutral-500">진행 중인 캠페인이 없습니다</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 빠른 작업 섹션 */}
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-3">빠른 작업</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { icon: 'fa-plus', title: '새 포스트 생성', action: 'create' },
                { icon: 'fa-file-alt', title: '자료 제공', action: 'materials' },
                { icon: 'fa-eye', title: '콘텐츠 검토', action: 'review' },
                { icon: 'fa-chart-line', title: '성과 확인', action: 'analytics' }
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
      </div>
    </div>
  );
}