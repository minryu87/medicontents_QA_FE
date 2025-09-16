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
}

export default function WorkManagementTab({
  waitingTasks,
  publishPending,
  publishCompleted,
  monitoring,
  monitoringIssues,
  isLoadingWaitingTasks = false,
  kanbanPosts,
  isLoadingKanban = false
}: WorkManagementTabProps) {
  const [isWaitingTasksCollapsed, setIsWaitingTasksCollapsed] = useState(false);

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
                <div className="space-y-3">
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
                    kanbanPosts.admin_pre_review.map((post: any) => (
                      <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{post.post_id}</span>
                          <i className="fa-solid fa-eye text-neutral-600 text-xs"></i>
                        </div>
                        <h5 className="text-sm text-neutral-800 mb-2">{post.title}</h5>
                        <p className="text-xs text-neutral-600 mb-2">어드민 검토 중</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${post.creator_name}`} alt="User" className="w-5 h-5 rounded-full" />
                            <span className="text-xs text-neutral-600">{post.creator_name}</span>
                          </div>
                          <span className="text-xs text-neutral-500">검토중</span>
                        </div>
                      </div>
                    ))
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-600 shadow-sm">
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-600 shadow-sm">
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
                    kanbanPosts.material_delay.map((post: any) => (
                      <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{post.post_id}</span>
                          <i className="fa-solid fa-exclamation-triangle text-neutral-600 text-xs"></i>
                        </div>
                        <h5 className="text-sm text-neutral-800 mb-2">{post.title}</h5>
                        <p className="text-xs text-neutral-600 mb-2">자료 제공 지연</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${post.creator_name}`} alt="User" className="w-5 h-5 rounded-full" />
                            <span className="text-xs text-neutral-600">{post.creator_name}</span>
                          </div>
                          <span className="text-xs text-neutral-500">지연</span>
                        </div>
                      </div>
                    ))
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
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
                    kanbanPosts.client_delay.map((post: any) => (
                      <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{post.post_id}</span>
                          <i className="fa-solid fa-clock text-neutral-600 text-xs"></i>
                        </div>
                        <h5 className="text-sm text-neutral-800 mb-2">{post.title}</h5>
                        <p className="text-xs text-neutral-600 mb-2">검토 기한 초과</p>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-1">
                            <img src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${post.creator_name}`} alt="User" className="w-5 h-5 rounded-full" />
                            <span className="text-xs text-neutral-600">{post.creator_name}</span>
                          </div>
                          <span className="text-xs text-neutral-500">지연</span>
                        </div>
                      </div>
                    ))
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
                <div className="space-y-3">
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
                        <div key={post.id} className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
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

      {/* 게시 상태 섹션 */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {/* 게시 대기 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">게시 대기</h2>
            <div className="space-y-3">
              {publishPending.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3 w-48">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{item.id}</span>
                    <i className="fa-solid fa-calendar-alt text-neutral-600 text-xs"></i>
                  </div>
                  <h4 className="text-sm text-neutral-800 mb-2">{item.title}</h4>
                  <p className="text-xs text-neutral-600 mb-2">게시 예정: {item.scheduledDate}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${item.avatar}`}
                        alt="User"
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-neutral-600">{item.assignee}</span>
                    </div>
                    <button className="px-2 py-1 bg-neutral-600 text-white text-xs rounded hover:bg-neutral-700">
                      즉시게시
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 게시 완료 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">게시 완료</h2>
            <div className="space-y-3">
              {publishCompleted.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3 w-48">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{item.id}</span>
                    <i className="fa-solid fa-check-circle text-neutral-600 text-xs"></i>
                  </div>
                  <h4 className="text-sm text-neutral-800 mb-2">{item.title}</h4>
                  <p className="text-xs text-neutral-600 mb-2">게시됨: {item.publishedDate}</p>
                  <div className="flex justify-between text-xs text-neutral-600 mb-2">
                    <span>조회수: {item.views?.toLocaleString()}</span>
                    <span>좋아요: {item.likes}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <img
                        src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${item.avatar}`}
                        alt="User"
                        className="w-5 h-5 rounded-full"
                      />
                      <span className="text-xs text-neutral-600">{item.assignee}</span>
                    </div>
                    <button className="px-2 py-1 bg-neutral-100 text-neutral-700 text-xs rounded hover:bg-neutral-200">
                      상세보기
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 모니터링 섹션 */}
      <div className="px-6 mb-6">
        <div className="grid grid-cols-2 gap-4">
          {/* 모니터링 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">모니터링</h2>
            <div className="space-y-3">
              {monitoring.map((item) => (
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3 w-48">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{item.id}</span>
                    <i className="fa-solid fa-chart-line text-neutral-600 text-xs"></i>
                  </div>
                  <h4 className="text-sm text-neutral-800 mb-2">{item.title}</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 mb-2">
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.views.toLocaleString()}</div>
                      <div>조회수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.likes}</div>
                      <div>좋아요</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.shares}</div>
                      <div>공유</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">성과: {item.performance}</span>
                    <span className="bg-neutral-100 text-neutral-800 px-2 py-1 rounded text-xs">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 모니터링 이슈 발생 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">모니터링 이슈 발생</h2>
            <div className="space-y-3">
              {monitoringIssues.map((item) => (
                <div key={item.id} className="bg-neutral-50 border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">{item.id}</span>
                    <i className="fa-solid fa-exclamation-triangle text-neutral-600 text-xs"></i>
                  </div>
                  <h4 className="text-sm text-neutral-800 mb-2">{item.title}</h4>
                  <div className="grid grid-cols-3 gap-2 text-xs text-neutral-600 mb-2">
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.views}</div>
                      <div>조회수</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.likes}</div>
                      <div>좋아요</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm text-neutral-900">{item.shares}</div>
                      <div>공유</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-neutral-600">성과: {item.performance}</span>
                    <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs">{item.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
