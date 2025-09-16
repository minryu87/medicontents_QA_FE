interface PerformanceStats {
  totalViews: number;
  totalViewsChange: string;
  likes: number;
  likesChange: string;
  shares: number;
  sharesChange: string;
  engagement: string;
  engagementChange: string;
}

interface TrafficData {
  day: string;
  views: number;
}

interface TopPost {
  rank: number;
  title: string;
  publishedDate: string;
  views: number;
}

interface MonitoringTabProps {
  performanceStats: PerformanceStats;
  trafficData: TrafficData[];
  topPosts: TopPost[];
}

export default function MonitoringTab({
  performanceStats,
  trafficData,
  topPosts
}: MonitoringTabProps) {
  return (
    <>
      {/* 성과 모니터링 섹션 */}
      <div className="px-6 pb-6">
        <div className="bg-white rounded-xl shadow-lg p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-neutral-900">성과 모니터링</h2>
            <div className="flex space-x-2">
              <button className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg hover:bg-neutral-200">7일</button>
              <button className="px-3 py-1 bg-neutral-600 text-white text-xs rounded-lg">30일</button>
              <button className="px-3 py-1 bg-neutral-100 text-neutral-700 text-xs rounded-lg hover:bg-neutral-200">90일</button>
            </div>
          </div>

          {/* 4개 성과 카드 */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl text-neutral-900 mb-1">{(performanceStats.totalViews / 1000).toFixed(1)}K</div>
              <p className="text-xs text-neutral-600">총 조회수</p>
              <p className="text-xs text-green-600 mt-1">{performanceStats.totalViewsChange}</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl text-neutral-900 mb-1">{performanceStats.likes}</div>
              <p className="text-xs text-neutral-600">좋아요</p>
              <p className="text-xs text-green-600 mt-1">{performanceStats.likesChange}</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl text-neutral-900 mb-1">{performanceStats.shares}</div>
              <p className="text-xs text-neutral-600">공유</p>
              <p className="text-xs text-red-600 mt-1">{performanceStats.sharesChange}</p>
            </div>
            <div className="text-center p-3 bg-neutral-50 rounded-lg">
              <div className="text-2xl text-neutral-900 mb-1">{performanceStats.engagement}</div>
              <p className="text-xs text-neutral-600">참여율</p>
              <p className="text-xs text-green-600 mt-1">{performanceStats.engagementChange}</p>
            </div>
          </div>

          {/* 유입량 추이 그래프 */}
          <div className="mb-6">
            <h3 className="text-sm text-neutral-800 mb-3">유입량 추이</h3>
            <div className="h-64 bg-neutral-50 rounded-lg p-4 flex items-end justify-between">
              <div className="flex items-end space-x-2 w-full">
                {trafficData.map((data, index) => (
                  <div
                    key={index}
                    className="bg-neutral-600 rounded-t flex-1"
                    style={{ height: `${(data.views / 4000) * 200}px`, minWidth: '20px' }}
                  ></div>
                ))}
              </div>
            </div>
            <div className="flex justify-between mt-2 text-xs text-neutral-500">
              <span>1월 1일</span>
              <span>1월 8일</span>
              <span>1월 15일</span>
            </div>
          </div>

          {/* 인기 포스트 TOP 5 */}
          <div>
            <h3 className="text-sm text-neutral-800 mb-3">인기 포스트 TOP 5</h3>
            <div className="space-y-2">
              {topPosts.map((post) => (
                <div key={post.rank} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-6 h-6 text-white text-xs rounded-full flex items-center justify-center ${
                      post.rank === 1 ? 'bg-neutral-900' :
                      post.rank === 2 ? 'bg-neutral-700' :
                      post.rank === 3 ? 'bg-neutral-600' :
                      post.rank === 4 ? 'bg-neutral-500' :
                      'bg-neutral-400'
                    }`}>
                      {post.rank}
                    </span>
                    <div>
                      <h4 className="text-sm text-neutral-800">{post.title}</h4>
                      <p className="text-xs text-neutral-600">{post.publishedDate}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-neutral-900">{post.views.toLocaleString()}</div>
                    <div className="text-xs text-neutral-600">조회수</div>
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
