import { useState } from 'react';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

interface SummaryCard {
  id: string;
  title: string;
  value?: string | number;
  description?: string;
  change?: string;
  progress?: number;
  action?: string;
  activities?: Array<{ description: string; time: string }>;
  urgentTasks?: Array<{
    id: string;
    type: 'system_error' | 'failed_agent' | 'delayed_schedule';
    title: string;
    description: string;
    color: string;
    icon: string;
    postId?: string;
  }>;
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

interface CalendarEvent {
  date: Date;
  type: 'campaign_completed' | 'campaign_active' | 'campaign_scheduled' | 'post_published' | 'post_completed' | 'post_pending';
  campaign?: {
    id: string;
    name: string;
    status: string;
    start_date: string;
    end_date: string;
    description?: string;
    target_post_count?: number;
    completed_post_count?: number;
    published_post_count?: number;
    medical_service?: {
      category?: string;
      treatment?: string;
    };
    creator_username?: string;
  };
  post?: {
    id: string;
    title: string;
    status: string;
    post_type?: string;
    publish_date?: string;
    published_at?: string;
    published_url?: string;
    creator_username?: string;
  };
}

interface HospitalInfoTabProps {
  summaryCards: SummaryCard[];
  basicInfo: BasicInfo;
  campaigns: Campaign[];
  schedule: Schedule;
  calendarEvents: CalendarEvent[];
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  onUrgentTaskClick?: (task: {
    id: string;
    type: 'system_error' | 'failed_agent' | 'delayed_schedule';
    postId?: string;
  }) => void;
}

export default function HospitalInfoTab({
  summaryCards,
  basicInfo,
  campaigns,
  schedule,
  calendarEvents,
  onDateSelect,
  selectedDate,
  onUrgentTaskClick
}: HospitalInfoTabProps) {
  return (
    <>
      {/* 병원 요약 대시보드 */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-4 gap-4 mb-6">
          {summaryCards.map((card) => (
            <div key={card.id} className="bg-white border border-sky-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm text-neutral-800 font-medium">{card.title}</h3>
              </div>

              {card.id === 'urgent' ? (
                // 긴급 처리 필요 카드 - 작업 목록 표시
                <div className="space-y-1">
                  {card.urgentTasks && card.urgentTasks.length > 0 ? (
                    card.urgentTasks.slice(0, 3).map((task, index) => (
                      <div key={task.id} className="flex items-start space-x-2 p-1 bg-gray-50 rounded">
                        <div className="flex-shrink-0">
                          <i className={`fa-solid ${task.icon} text-xs`} style={{ color: task.color }}></i>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-neutral-800 truncate">{task.title}</p>
                          <p className="text-xs text-neutral-500 truncate">{task.description}</p>
                        </div>
                        <div className="flex-shrink-0">
                          <button
                            className="text-xs font-bold hover:opacity-70"
                            style={{ color: task.color }}
                            onClick={() => {
                              if (onUrgentTaskClick) {
                                onUrgentTaskClick({
                                  id: task.id,
                                  type: task.type,
                                  postId: task.postId
                                });
                              }
                            }}
                          >
                            &gt;&gt;
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-2">
                      <p className="text-xs text-neutral-500">현재 긴급한 이슈가 없습니다</p>
                    </div>
                  )}
                </div>
              ) : card.id === 'activity' ? (
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
                    <div className="w-full bg-sky-100 rounded-full h-2 mt-3">
                      <div
                        className="bg-sky-500 h-2 rounded-full transition-all duration-300"
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
        <div className="grid gap-6 mb-6" style={{ gridTemplateColumns: '1fr 1fr 2fr' }}>
          {/* 병원 기본 정보 */}
          <div className="bg-white border border-sky-200 rounded-lg p-4">
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
          <div className="bg-white border border-sky-200 rounded-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">진행 중 캠페인</h2>
            <div className="space-y-3">
              {campaigns.map((campaign) => (
                <div key={campaign.id} className="bg-white border border-sky-200 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm text-neutral-800 font-medium">{campaign.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      campaign.status === '진행중' ? 'bg-sky-100 text-sky-700' :
                      campaign.status === '완료' ? 'bg-green-100 text-green-700' :
                      'bg-neutral-100 text-neutral-700'
                    }`}>
                      {campaign.status}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mb-2">{campaign.period}</p>
                  <div className="w-full bg-sky-100 rounded-full h-2">
                    <div
                      className="bg-sky-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${campaign.progress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">진행률: {campaign.progress}%</p>
                </div>
              ))}
            </div>
          </div>

          {/* 작업 일정 */}
          <div className="bg-white border border-sky-200 rounded-lg p-4">
            <h2 className="text-lg text-neutral-900 mb-4">작업 일정</h2>
            <div className="calendar-wrapper custom-calendar" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', minHeight: '120px', padding: '0 4px' }}>
              <style jsx>{`
                .calendar-wrapper .react-calendar {formatDay
                  width: 100%;
                  max-width: 100%;
                  height: auto;
                  border: none;
                  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Pretendard', sans-serif;
                }
                .calendar-wrapper .react-calendar__tile {
                  padding: 3px 2px;
                  position: relative;
                  min-height: 24px;
                }
                .calendar-wrapper .react-calendar__tile abbr {
                  display: none; /* 기본 날짜 텍스트 완전 숨김 */
                }
                .custom-calendar .calendar-campaign-completed,
                .custom-calendar .calendar-campaign-completed.react-calendar__tile--now {
                  background-color: rgba(14, 165, 233, 0.1) !important;
                  border: 1px solid rgba(14, 165, 233, 0.2) !important;
                  position: relative;
                }
                .custom-calendar .calendar-campaign-active,
                .custom-calendar .calendar-campaign-active.react-calendar__tile--now {
                  background-color: rgba(14, 165, 233, 0.2) !important;
                  border: 1px solid rgba(14, 165, 233, 0.3) !important;
                  position: relative;
                }
                .custom-calendar .calendar-campaign-scheduled,
                .custom-calendar .calendar-campaign-scheduled.react-calendar__tile--now {
                  background-color: rgba(14, 165, 233, 0.15) !important;
                  border: 1px solid rgba(14, 165, 233, 0.25) !important;
                  position: relative;
                }
                .custom-calendar .calendar-post-published::after,
                .custom-calendar .calendar-post-completed::after,
                .custom-calendar .calendar-post-pending::after {
                  content: '';
                  position: absolute;
                  bottom: 4px;
                  left: 50%;
                  transform: translateX(-50%);
                  width: 6px;
                  height: 6px;
                  border-radius: 50%;
                  z-index: 10;
                }
                .custom-calendar .calendar-post-published::after {
                  background: #0ea5e9;
                }
                .custom-calendar .calendar-post-completed::after {
                  background: #22c55e;
                }
                .custom-calendar .calendar-post-pending::after {
                  background: #ef4444;
                }
                .calendar-wrapper .react-calendar__navigation {
                  margin-bottom: 10px;
                }
                .calendar-wrapper .react-calendar__navigation button {
                  color: #0ea5e9;
                  font-weight: 500;
                  font-size: 13px;
                  padding: 3px 7px;
                }
                .calendar-wrapper .react-calendar__month-view__weekdays {
                  font-size: 11px;
                  color: rgba(42, 72, 94, 0.7);
                  padding: 3px 0;
                }
              `}</style>
              <Calendar
                value={selectedDate || new Date()}
                onChange={(date) => {
                  if (date instanceof Date && onDateSelect) {
                    onDateSelect(date);
                  }
                }}
                formatDay={() => ''}
                tileContent={({ date, view }) => {
                  if (view === 'month') {
                    const eventsOnDate = calendarEvents.filter(event =>
                      event.date.toDateString() === date.toDateString()
                    );

                    const campaignEvent = eventsOnDate.find(event => event.type.startsWith('campaign'));
                    const postEvent = eventsOnDate.find(event => event.type.startsWith('post'));

                    // 오늘 날짜 확인
                    const today = new Date();
                    const isToday = date.toDateString() === today.toDateString();

                    let backgroundColor = 'transparent';
                    let borderColor = 'transparent';
                    let dotColor = null;

                    // 캠페인 이벤트 스타일
                    if (campaignEvent) {
                      if (campaignEvent.type === 'campaign_completed') {
                        backgroundColor = 'rgba(74, 124, 158, 0.1)';
                        borderColor = 'rgba(74, 124, 158, 0.2)';
                      } else if (campaignEvent.type === 'campaign_active') {
                        backgroundColor = 'rgba(74, 124, 158, 0.2)';
                        borderColor = 'rgba(74, 124, 158, 0.3)';
                      } else if (campaignEvent.type === 'campaign_scheduled') {
                        backgroundColor = 'rgba(74, 124, 158, 0.15)';
                        borderColor = 'rgba(74, 124, 158, 0.25)';
                      }
                    }

                    // 오늘 날짜인 경우 이벤트 색상을 우선 적용 (노란색 기본 스타일 덮어쓰기)
                    if (isToday && !campaignEvent) {
                      backgroundColor = 'rgba(255, 255, 118, 0.3)'; // 연한 노란색
                      borderColor = 'rgba(255, 255, 118, 0.5)';
                    }

                    // 포스트 이벤트 점 색상
                    if (postEvent) {
                      if (postEvent.type === 'post_published') {
                        dotColor = '#4A7C9E';
                      } else if (postEvent.type === 'post_completed') {
                        dotColor = '#6FA382';
                      } else if (postEvent.type === 'post_pending') {
                        dotColor = '#EF4444';
                      }
                    }

                    return (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          backgroundColor,
                          border: borderColor !== 'transparent' ? `1px solid ${borderColor}` : 'none',
                          borderRadius: '4px',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {date.getDate()}
                        {dotColor && (
                          <div
                            style={{
                              position: 'absolute',
                              top: '3px',
                              right: '2px',
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              backgroundColor: dotColor
                            }}
                          />
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </div>

            {/* 선택된 날짜의 상세 정보 */}
            {selectedDate && (
              <div className="mt-4 pt-4 border-t border-neutral-100">
                <h3 className="text-sm text-neutral-800 mb-3">
                  {selectedDate.toLocaleDateString('ko-KR')} 일정
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  {/* 캠페인 정보 */}
                  <div>
                    <h4 className="text-xs text-neutral-500 mb-2">캠페인</h4>
                    {calendarEvents
                      .filter(event =>
                        event.type.startsWith('campaign') &&
                        event.date.toDateString() === selectedDate.toDateString()
                      )
                      .map(event => (
                        <div key={event.campaign?.id} className="text-xs p-2 bg-neutral-50 rounded mb-1">
                          <div className="font-medium mb-1">{event.campaign?.name}</div>
                          <div className="text-neutral-600 mb-1">
                            {event.campaign?.start_date} ~ {event.campaign?.end_date}
                          </div>
                          {event.campaign?.medical_service && (
                            <div className="flex flex-wrap gap-1 mb-1">
                              {event.campaign.medical_service.category && (
                                <span className="inline-block px-2 py-0.5 bg-neutral-200 text-neutral-700 rounded-full text-xs">
                                  {event.campaign.medical_service.category}
                                </span>
                              )}
                              {event.campaign.medical_service.treatment && (
                                <span className="inline-block px-2 py-0.5 bg-neutral-300 text-neutral-800 rounded-full text-xs">
                                  {event.campaign.medical_service.treatment}
                                </span>
                              )}
                            </div>
                          )}
                          <div className="text-neutral-500">
                            목표: {event.campaign?.target_post_count}개 |
                            완료: {event.campaign?.completed_post_count}개 |
                            게시: {event.campaign?.published_post_count}개
                          </div>
                          <div className="text-neutral-500">
                            담당: {event.campaign?.creator_username || '미정'}
                          </div>
                        </div>
                      ))}
                    {calendarEvents.filter(event =>
                      event.type.startsWith('campaign') &&
                      event.date.toDateString() === selectedDate.toDateString()
                    ).length === 0 && (
                      <div className="text-xs text-neutral-400">캠페인 없음</div>
                    )}
                  </div>

                  {/* 포스트 정보 */}
                  <div>
                    <h4 className="text-xs text-neutral-500 mb-2">포스트</h4>
                    {calendarEvents
                      .filter(event =>
                        event.type.startsWith('post') &&
                        event.date.toDateString() === selectedDate.toDateString()
                      )
                      .map(event => (
                        <div key={event.post?.id} className="text-xs p-2 bg-neutral-50 rounded mb-1">
                          <div className="flex items-center mb-1">
                            <div className={`inline-block w-2 h-2 rounded-full mr-2 ${
                              event.type === 'post_published' ? 'bg-[#4A7C9E]' :
                              event.type === 'post_completed' ? 'bg-[#6FA382]' :
                              'bg-[#EF4444]'
                            }`}></div>
                            <span className="font-medium">{event.post?.title}</span>
                          </div>
                          <div className="text-neutral-600 mb-1">
                            ID: {event.post?.id} | 타입: {event.post?.post_type === 'informational' ? '정보성' : '치료사례'} | 상태: {
                              event.type === 'post_published' ? '게시완료' :
                              event.type === 'post_completed' ? '작업완료' :
                              '대기중'
                            }
                          </div>
                          <div className="text-neutral-600 mb-1">
                            게시 예정일: {event.post?.publish_date}
                          </div>
                          {event.post?.published_at && (
                            <div className="text-neutral-600 mb-1">
                              실제 게시일: {new Date(event.post.published_at).toLocaleString('ko-KR')}
                            </div>
                          )}
                          {event.post?.published_url && (
                            <div className="text-neutral-600 mb-1">
                              게시 URL: <a href={event.post.published_url} target="_blank" rel="noopener noreferrer"
                                 className="text-blue-600 hover:text-blue-800 underline">
                                {event.post.published_url}
                              </a>
                            </div>
                          )}
                          <div className="text-neutral-500">
                            담당자: {event.post?.creator_username || '미정'}
                          </div>
                        </div>
                      ))}
                    {calendarEvents.filter(event =>
                      event.type.startsWith('post') &&
                      event.date.toDateString() === selectedDate.toDateString()
                    ).length === 0 && (
                      <div className="text-xs text-neutral-400">포스트 없음</div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

