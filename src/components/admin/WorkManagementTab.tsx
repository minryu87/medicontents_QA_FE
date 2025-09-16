interface WaitingTask {
  id: string;
  title: string;
  description: string;
  assignee: string;
  priority: string;
  type: string;
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
}

export default function WorkManagementTab({
  waitingTasks,
  publishPending,
  publishCompleted,
  monitoring,
  monitoringIssues
}: WorkManagementTabProps) {
  return (
    <>
      {/* 작업 대기 섹션 */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg text-neutral-900 mb-4">작업 대기</h2>
          <div className="flex space-x-4 overflow-x-auto pb-2">
            {waitingTasks.map((task) => (
              <div key={task.id} className="bg-white border border-neutral-200 rounded-lg p-3 min-w-64 flex-shrink-0">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                    {task.id}
                  </span>
                  <i className="fa-solid fa-clock text-neutral-400 text-xs"></i>
                </div>
                <h4 className="text-sm text-neutral-800 mb-2">{task.title}</h4>
                <p className="text-xs text-neutral-600 mb-2">{task.description}</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1">
                    <img
                      src={`https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=${task.assignee}`}
                      alt="User"
                      className="w-5 h-5 rounded-full"
                    />
                    <span className="text-xs text-neutral-600">{task.assignee}</span>
                  </div>
                  <span className="text-xs text-neutral-500">대기중</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 칸반 보드 (진행 중 캠페인 포스트 현황) */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <h2 className="text-lg text-neutral-900 mb-4">진행 중 캠페인 포스트 현황 (칸반)</h2>

          {/* 정상 진행 섹션 */}
          <div className="mb-4">
            <h3 className="text-md text-neutral-800 mb-3">정상 진행</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* 자료 제공 완료 */}
              <div className="bg-neutral-50 rounded-lg p-4 min-w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">1. 자료 제공 완료</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">2</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border border-neutral-200 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">POST-011</span>
                      <i className="fa-solid fa-check text-neutral-600 text-xs"></i>
                    </div>
                    <h5 className="text-sm text-neutral-800 mb-2">관절 영양제 정보</h5>
                    <p className="text-xs text-neutral-600 mb-2">자료 제공 완료</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=김의사" alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-neutral-600">김의사</span>
                      </div>
                      <span className="text-xs text-neutral-500">완료</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* AI 생성 성공 */}
              <div className="bg-neutral-50 rounded-lg p-4 min-w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">3. AI 생성_성공</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border-l-4 border-neutral-600 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">POST-014</span>
                      <i className="fa-solid fa-robot text-neutral-600 text-xs"></i>
                    </div>
                    <h5 className="text-sm text-neutral-800 mb-2">척추 건강 체크</h5>
                    <p className="text-xs text-neutral-600 mb-2">AI 생성 완료</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=AI Agent" alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-neutral-600">AI Agent</span>
                      </div>
                      <span className="text-xs text-neutral-500">생성완료</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 어드민 사후 검토 중 */}
              <div className="bg-neutral-50 rounded-lg p-4 min-w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">4. 어드민 사후 검토 중</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">POST-016</span>
                      <i className="fa-solid fa-search text-neutral-600 text-xs"></i>
                    </div>
                    <h5 className="text-sm text-neutral-800 mb-2">스포츠 부상 예방</h5>
                    <p className="text-xs text-neutral-600 mb-2">사후 검토 중</p>
                    <div className="flex items-center justify-between">
                      <button className="px-2 py-1 bg-neutral-600 text-white text-xs rounded hover:bg-neutral-700">승인</button>
                      <button className="px-2 py-1 bg-neutral-600 text-white text-xs rounded hover:bg-neutral-700">반려</button>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=관리자" alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-neutral-600">관리자</span>
                      </div>
                      <span className="text-xs text-neutral-500">검토중</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 이슈 발생 섹션 */}
          <div>
            <h3 className="text-md text-neutral-800 mb-3">이슈 발생</h3>
            <div className="flex space-x-4 overflow-x-auto pb-2">
              {/* AI 생성 실패 */}
              <div className="bg-neutral-50 rounded-lg p-4 min-w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">3. AI 생성_실패</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">FAIL-001</span>
                      <i className="fa-solid fa-times-circle text-neutral-600 text-xs"></i>
                    </div>
                    <h5 className="text-sm text-neutral-800 mb-2">관절염 진단법</h5>
                    <p className="text-xs text-neutral-600 mb-2">AI 생성 실패</p>
                    <button className="px-2 py-1 bg-neutral-600 text-white text-xs rounded hover:bg-neutral-700 mb-2">재시도</button>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=AI Agent" alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-neutral-600">AI Agent</span>
                      </div>
                      <span className="text-xs text-neutral-500">실패</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 고객 검토 지연 */}
              <div className="bg-neutral-50 rounded-lg p-4 min-w-56 flex-shrink-0">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm text-neutral-800">5. 고객 검토 지연</h4>
                  <span className="bg-neutral-200 text-neutral-700 px-2 py-1 rounded text-xs">1</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white p-3 rounded-lg border-l-4 border-neutral-500 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">DELAY-001</span>
                      <i className="fa-solid fa-clock text-neutral-600 text-xs"></i>
                    </div>
                    <h5 className="text-sm text-neutral-800 mb-2">환자 교육 자료</h5>
                    <p className="text-xs text-neutral-600 mb-2">검토 기한 초과</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <img src="https://api.dicebear.com/7.x/notionists/svg?scale=200&seed=이간호사" alt="User" className="w-5 h-5 rounded-full" />
                        <span className="text-xs text-neutral-600">이간호사</span>
                      </div>
                      <span className="text-xs text-neutral-500">지연</span>
                    </div>
                  </div>
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
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3">
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
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3">
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
                <div key={item.id} className="bg-white border border-neutral-200 rounded-lg p-3">
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
