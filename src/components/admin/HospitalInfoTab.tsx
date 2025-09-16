interface SummaryCard {
  id: string;
  title: string;
  value?: string | number;
  description?: string;
  change?: string;
  progress?: number;
  action?: string;
  activities?: Array<{ description: string; time: string }>;
}

interface BasicInfo {
  name: string;
  specialty: string;
  logoImage?: string;
  manager: string;
  joinDate: string;
  contact: string;
  address?: string;
  website?: string;
  mapLink?: string;
  description?: string;
  status: string;
}

interface Campaign {
  id: string;
  name: string;
  status: string;
  period: string;
  progress: number;
}

interface Schedule {
  month: string;
  events: Array<{ day: number; hasEvent: boolean; type: string }>;
}

interface HospitalInfoTabProps {
  summaryCards: SummaryCard[];
  basicInfo: BasicInfo;
  campaigns: Campaign[];
  schedule: Schedule;
}

export default function HospitalInfoTab({
  summaryCards,
  basicInfo,
  campaigns,
  schedule
}: HospitalInfoTabProps) {
  return (
    <>
      {/* 병원 요약 대시보드 */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div key={card.id} className="bg-white rounded-xl shadow-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm text-neutral-900">{card.title}</h2>
                {card.id === 'urgent' && (
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-exclamation text-neutral-600 text-xs"></i>
                  </div>
                )}
                {card.id === 'progress' && (
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-chart-line text-neutral-600 text-xs"></i>
                  </div>
                )}
                {card.id === 'performance' && (
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-eye text-neutral-600 text-xs"></i>
                  </div>
                )}
                {card.id === 'activity' && (
                  <div className="w-6 h-6 bg-neutral-100 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-clock text-neutral-600 text-xs"></i>
                  </div>
                )}
              </div>

              {card.id === 'activity' ? (
                <div className="space-y-2">
                  {card.activities?.map((activity, index) => (
                    <div key={index}>
                      <div className="text-xs text-neutral-800">{activity.description}</div>
                      <div className="text-xs text-neutral-500">{activity.time}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <div className="text-2xl text-neutral-900 mb-1">{card.value}</div>
                  <p className="text-xs text-neutral-600">{card.description}</p>
                  {card.change && (
                    <p className="text-xs text-neutral-600 mt-1">{card.change}</p>
                  )}
                  {card.progress !== undefined && (
                    <div className="w-full bg-neutral-200 rounded-full h-1 mt-3">
                      <div
                        className="bg-neutral-600 h-1 rounded-full transition-all duration-300"
                        style={{ width: `${card.progress}%` }}
                      ></div>
                    </div>
                  )}
                  {card.action && (
                    <button className="w-full mt-3 px-3 py-2 bg-neutral-600 text-white text-xs rounded-lg hover:bg-neutral-700">
                      {card.action}
                    </button>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 병원 상세 정보 */}
      <div className="px-6">
        <div className="grid grid-cols-3 gap-6 mb-6">
          {/* 병원 기본 정보 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">병원 기본 정보</h2>
            <div className="space-y-4">
              {/* 로고 이미지와 병원명 */}
              <div className="flex items-center space-x-3">
                {basicInfo.logoImage ? (
                  <img
                    src={basicInfo.logoImage.replace('@', '')}
                    alt={`${basicInfo.name} 로고`}
                    className="w-24 h-12 rounded-lg object-contain bg-white border"
                  />
                ) : (
                  <div className="w-24 h-12 rounded-lg bg-neutral-100 flex items-center justify-center">
                    <i className="fa-solid fa-hospital text-neutral-600"></i>
                  </div>
                )}
                <div>
                  <h3 className="text-neutral-800 text-base font-medium">{basicInfo.name}</h3>
                  <p className="text-xs text-neutral-600">{basicInfo.specialty}</p>
                </div>
              </div>

              {/* 상세 정보 2column */}
              <div className="border-t border-neutral-100 pt-3">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-neutral-500 block mb-1">담당자</span>
                    <p className="text-neutral-800">{basicInfo.manager || '미정'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">가입일</span>
                    <p className="text-neutral-800">{basicInfo.joinDate || '미정'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">연락처</span>
                    <p className="text-neutral-800">{basicInfo.contact || '미정'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">주소</span>
                    <p className="text-neutral-800">{basicInfo.address || '미정'}</p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">웹사이트</span>
                    <p className="text-neutral-800">
                      {basicInfo.website ? (
                        <a href={basicInfo.website} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline">
                          {basicInfo.website}
                        </a>
                      ) : '미정'}
                    </p>
                  </div>
                  <div>
                    <span className="text-neutral-500 block mb-1">지도 링크</span>
                    <p className="text-neutral-800">
                      {basicInfo.mapLink ? (
                        <a href={basicInfo.mapLink} target="_blank" rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline">
                          지도 보기
                        </a>
                      ) : '미정'}
                    </p>
                  </div>
                </div>
              </div>

              {/* 병원 설명 1column */}
              {basicInfo.description && (
                <div className="border-t border-neutral-100 pt-3">
                  <span className="text-neutral-500 text-xs block mb-2">병원 소개</span>
                  <p className="text-neutral-800 text-sm leading-relaxed">{basicInfo.description}</p>
                </div>
              )}

              <button className="w-full mt-4 px-3 py-2 bg-neutral-600 text-white text-sm rounded-lg hover:bg-neutral-700">
                병원 정보 수정
              </button>
            </div>
          </div>

          {/* 진행 중 캠페인 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">진행 중 캠페인</h2>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="border border-neutral-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-neutral-800">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded text-xs ${
                      campaign.status === '진행중' ? 'bg-neutral-100 text-neutral-800' :
                      campaign.status === '완료' ? 'bg-green-100 text-green-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-2">{campaign.period}</p>
                  <div className="w-full bg-neutral-200 rounded-full h-1">
                    <div
                      className="bg-neutral-600 h-1 rounded-full transition-all duration-300"
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">진행률: {campaign.progress}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* 작업 일정 */}
          <div className="bg-white rounded-xl shadow-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">작업 일정</h2>
            <div className="mb-3">
              <h3 className="text-sm text-neutral-800 mb-2">{schedule.month}</h3>
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['일', '월', '화', '수', '목', '금', '토'].map((day) => (
                  <div key={day} className="text-center text-xs text-neutral-500 py-1">
                    {day}
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-1">
                {/* 빈 칸들 (1일 이전) */}
                {Array.from({ length: 14 }, (_, i) => (
                  <div key={`empty-${i}`} className="text-center py-1 text-xs text-neutral-400"></div>
                ))}
                {/* 날짜들 */}
                {Array.from({ length: 31 }, (_, day) => {
                  const dayNumber = day + 1;
                  const event = schedule.events.find(e => e.day === dayNumber);
                  return (
                    <div
                      key={dayNumber}
                      className={`text-center py-1 text-xs text-neutral-700 relative ${
                        dayNumber === 15 ? 'bg-neutral-600 text-white rounded-full' : ''
                      }`}
                    >
                      {dayNumber}
                      {event && (
                        <div className={`w-1 h-1 rounded-full mx-auto mt-1 ${
                          event.type === 'post' ? 'bg-neutral-600' :
                          event.type === 'review' ? 'bg-blue-600' :
                          'bg-green-600'
                        }`}></div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

