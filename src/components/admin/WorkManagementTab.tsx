import { useState } from 'react';

interface WaitingTask {
  id: string;
  post_type: string;
  title: string;
  publish_date?: string;
  created_at?: string;
}

interface PublishItem {
  id: string;
  title: string;
  scheduledDate?: string;
  publishedDate?: string;
  views?: number;
  likes?: number;
  assignee: string;
  avatar: string;
}

interface MonitoringItem {
  id: string;
  title: string;
  views: number;
  likes: number;
  shares: number;
  performance: string;
  status: string;
}

interface WorkManagementTabProps {
  waitingTasks: WaitingTask[];
  publishPending: PublishItem[];
  publishCompleted: PublishItem[];
  monitoring: MonitoringItem[];
  monitoringIssues: MonitoringItem[];
  isLoadingWaitingTasks?: boolean;
  kanbanPosts?: any;
  isLoadingKanban?: boolean;
  statusPostsLoading?: boolean;
  selectedCampaign?: any;
  isLoadingAll?: boolean;
}

export default function WorkManagementTab({
  waitingTasks,
  publishPending,
  publishCompleted,
  monitoring,
  monitoringIssues,
  isLoadingWaitingTasks = false,
  kanbanPosts,
  isLoadingKanban = false,
  statusPostsLoading = false,
  selectedCampaign,
  isLoadingAll = false
}: WorkManagementTabProps) {
  const [isWaitingTasksCollapsed, setIsWaitingTasksCollapsed] = useState(false);

  // 캠페인이 선택되지 않은 경우
  if (!selectedCampaign) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="text-neutral-400 mb-4">
            <i className="fa-solid fa-folder-open text-4xl"></i>
          </div>
          <h3 className="text-lg font-medium text-neutral-900 mb-2">캠페인을 선택해주세요</h3>
          <p className="text-sm text-neutral-500">작업을 진행할 캠페인을 선택해야 합니다.</p>
        </div>
      </div>
    );
  }

  // 전체 로딩 중인 경우
  if (isLoadingAll) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 mx-auto mb-4"></div>
          <p className="text-sm text-neutral-600">작업 데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* 작업 대기 섹션 */}
      <div className="px-6 py-4 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center space-x-3 mb-4">
            <h2 className="text-lg text-neutral-900">작업 대기</h2>
            <button
              onClick={() => setIsWaitingTasksCollapsed(!isWaitingTasksCollapsed)}
              className="flex items-center space-x-2 px-3 py-1 text-neutral-600 hover:text-neutral-800 bg-neutral-100 hover:bg-neutral-200 rounded-lg transition-colors text-sm"
            >
              <span>{isWaitingTasksCollapsed ? '펼치기' : '접기'}</span>
              <i className={`fa-solid ${isWaitingTasksCollapsed ? 'fa-chevron-down' : 'fa-chevron-up'}`}></i>
            </button>
          </div>
          {!isWaitingTasksCollapsed && (
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {isLoadingWaitingTasks ? (
                <div className="flex items-center justify-center min-w-64 py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
                  <span className="ml-2 text-neutral-600">작업 대기 로딩 중...</span>
                </div>
              ) : waitingTasks.length === 0 ? (
                <div className="flex items-center justify-center min-w-64 py-8">
                  <div className="text-center">
                    <div className="text-neutral-400 mb-2">
                      <i className="fa-solid fa-clipboard-list text-2xl"></i>
                    </div>
                    <p className="text-sm text-neutral-500">대기 중인 작업이 없습니다</p>
                  </div>
                </div>
              ) : (
                waitingTasks.map((task) => (
              <div key={task.id} className="bg-white border border-neutral-200 rounded-lg p-3 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    {task.id}
                  </span>
                  <span className="text-xs text-neutral-500 bg-neutral-100 px-2 py-1 rounded">
                    {task.post_type === 'informational' ? '정보성' : '치료사례'}
                  </span>
                </div>
                <h4 className="text-sm text-neutral-800 mb-2 line-clamp-2">{task.title}</h4>
                <div className="text-xs text-neutral-600 space-y-1">
                  <p>게시예정: {task.publish_date ? new Date(task.publish_date).toLocaleDateString('ko-KR') : '미정'}</p>
                  <p>생성일: {task.created_at ? new Date(task.created_at).toLocaleDateString('ko-KR') : '미정'}</p>
                </div>
              </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>

      {/* 칸반 보드 (진행 중 캠페인 포스트 현황) */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg text-neutral-900 mb-4">진행 중 캠페인 포스트 현황 (칸반)</h2>

          {/* 정상 진행 섹션 */}
          <div className="mb-4">
            <h3 className="text-md text-neutral-800 mb-3">정상 진행</h3>
            <div className="grid grid-cols-6 gap-4">
              {/* 1: 자료 제공 완료 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">1. 자료 제공 완료</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.material_completed?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.material_completed?.length > 0 ? (
                    kanbanPosts.material_completed.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 2: 어드민 사전 검토 중 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">2. 어드민 사전 검토 중</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.admin_pre_review?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.admin_pre_review?.length > 0 ? (
                    kanbanPosts.admin_pre_review.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 3: AI 생성_성공 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">3. AI 생성_성공</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.ai_completed?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.ai_completed?.length > 0 ? (
                    kanbanPosts.ai_completed.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 4: 어드민 사후 검토 중 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">4. 어드민 사후 검토 중</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.admin_review?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.admin_review?.length > 0 ? (
                    kanbanPosts.admin_review.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 5: 고객 검토 중 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">5. 고객 검토 중</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.client_review?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.client_review?.length > 0 ? (
                    kanbanPosts.client_review.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 6: 게시 대기 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">6. 게시 대기</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.publish_scheduled?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.publish_scheduled?.length > 0 ? (
                    kanbanPosts.publish_scheduled.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* 이슈 발생 섹션 */}
          <div>
            <h3 className="text-md text-neutral-800 mb-3">이슈 발생</h3>
            <div className="grid grid-cols-6 gap-4">
              {/* 1: 자료 제공 지연 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">1. 자료 제공 지연</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.material_delay?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.material_delay?.length > 0 ? (
                    kanbanPosts.material_delay.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 빈 공간 (2번 위치) */}
              <div className="w-48 flex-shrink-0"></div>

              {/* 3: AI 생성_실패 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">3. AI 생성_실패</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.ai_failed?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.ai_failed?.length > 0 ? (
                    kanbanPosts.ai_failed.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 빈 공간 (4번 위치) */}
              <div className="w-48 flex-shrink-0"></div>

              {/* 5: 고객 검토 지연 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">5. 고객 검토 지연</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.client_delay?.length || 0}
                  </span>
                </div>
                <div className="space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.client_delay?.length > 0 ? (
                    kanbanPosts.client_delay.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>

              {/* 6: 생성 취소 */}
              <div className="bg-neutral-50 rounded-lg p-4 w-48 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">6. 생성 취소</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">
                    {kanbanPosts?.aborted?.length || 0}
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto space-y-3">
                  {isLoadingKanban ? (
                    <div className="text-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                    </div>
                  ) : kanbanPosts?.aborted?.length > 0 ? (
                    kanbanPosts.aborted.map((post: any) => {
                      const calculateDDay = (publishDate: string | null) => {
                        if (!publishDate) return '미정';
                        const today = new Date();
                        today.setHours(0, 0, 0, 0);
                        const publish = new Date(publishDate);
                        publish.setHours(0, 0, 0, 0);
                        const diffTime = publish.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                      };

                      return (
                        <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                          <div className="text-xs text-neutral-600 mb-2">
                            {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                          </div>
                          <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                          <div className="text-xs text-neutral-600">
                            {calculateDDay(post.publish_date)}
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center text-neutral-500 text-sm py-4">
                      포스트 없음
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 게시 및 모니터링 섹션 */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-4 gap-4">
          {/* 게시 대기 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">게시 대기</h2>
            <div className="space-y-3">
              {statusPostsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                </div>
              ) : publishPending.length > 0 ? (
                publishPending.map((post: any) => {
                  const calculateDDay = (publishDate: string | null) => {
                    if (!publishDate) return '미정';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const publish = new Date(publishDate);
                    publish.setHours(0, 0, 0, 0);
                    const diffTime = publish.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                  };

                  return (
                    <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                      <div className="text-xs text-neutral-600 mb-2">
                        {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                      </div>
                      <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                      <div className="text-xs text-neutral-600">
                        {calculateDDay(post.publish_date)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-neutral-500 text-sm py-4">
                  게시 대기 중인 포스트가 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 게시 완료 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">게시 완료</h2>
            <div className="space-y-3">
              {statusPostsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                </div>
              ) : publishCompleted.length > 0 ? (
                publishCompleted.map((post: any) => {
                  const calculateDDay = (publishDate: string | null) => {
                    if (!publishDate) return '미정';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const publish = new Date(publishDate);
                    publish.setHours(0, 0, 0, 0);
                    const diffTime = publish.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                  };

                  return (
                    <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                      <div className="text-xs text-neutral-600 mb-2">
                        {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                      </div>
                      <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                      <div className="text-xs text-neutral-600">
                        {calculateDDay(post.publish_date)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-neutral-500 text-sm py-4">
                  게시 완료된 포스트가 없습니다
                </div>
              )}
            </div>
          </div>
          {/* 모니터링 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">모니터링</h2>
            <div className="space-y-3">
              {statusPostsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                </div>
              ) : monitoring.length > 0 ? (
                monitoring.map((post: any) => {
                  const calculateDDay = (publishDate: string | null) => {
                    if (!publishDate) return '미정';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const publish = new Date(publishDate);
                    publish.setHours(0, 0, 0, 0);
                    const diffTime = publish.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                  };

                  return (
                    <div key={post.id} className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                      <div className="text-xs text-neutral-600 mb-2">
                        {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                      </div>
                      <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                      <div className="text-xs text-neutral-600">
                        {calculateDDay(post.publish_date)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-neutral-500 text-sm py-4">
                  모니터링 중인 포스트가 없습니다
                </div>
              )}
            </div>
          </div>

          {/* 모니터링 이슈 발생 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">모니터링 이슈 발생</h2>
            <div className="space-y-3">
              {statusPostsLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-600 mx-auto"></div>
                </div>
              ) : monitoringIssues.length > 0 ? (
                monitoringIssues.map((post: any) => {
                  const calculateDDay = (publishDate: string | null) => {
                    if (!publishDate) return '미정';
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);
                    const publish = new Date(publishDate);
                    publish.setHours(0, 0, 0, 0);
                    const diffTime = publish.getTime() - today.getTime();
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                    return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
                  };

                  return (
                    <div key={post.id} className="bg-neutral-50 p-3 rounded-lg border border-neutral-200 shadow-sm">
                      <div className="text-xs text-neutral-600 mb-2">
                        {post.post_id} / {post.post_type === 'informational' ? '정보성' : '치료사례'}
                      </div>
                      <h5 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h5>
                      <div className="text-xs text-neutral-600">
                        {calculateDDay(post.publish_date)}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-neutral-500 text-sm py-4">
                  모니터링 이슈가 발생한 포스트가 없습니다
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
