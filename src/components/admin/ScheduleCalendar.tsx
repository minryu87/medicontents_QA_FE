/**
 * 일정 캘린더 컴포넌트
 * 게시 일정 시각화, 마감일 표시, 일정 조정 드래그 앤 드롭
 */

import React, { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle,
  Move,
  Edit3,
  Eye,
  Filter
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, addMonths, subMonths, isToday, isBefore, isAfter } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { PostSchedule, PostScheduleDetail } from '@/types/common';

interface CalendarEvent {
  id: string;
  postId: string;
  title: string;
  date: Date;
  type: 'publish' | 'deadline' | 'material' | 'guide' | 'ai' | 'admin_review' | 'client_review' | 'final_revision';
  status: 'completed' | 'pending' | 'overdue' | 'due_soon';
  priority: number;
  isDraggable: boolean;
}

interface ScheduleCalendarProps {
  schedules?: PostSchedule[];
  onScheduleUpdate?: (postId: string, updates: Partial<PostSchedule>) => Promise<void>;
  onScheduleClick?: (schedule: PostSchedule) => void;
  className?: string;
}

export function ScheduleCalendar({
  schedules = [],
  onScheduleUpdate,
  onScheduleClick,
  className = ''
}: ScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [draggedEvent, setDraggedEvent] = useState<CalendarEvent | null>(null);
  const [dragOverDate, setDragOverDate] = useState<Date | null>(null);
  const [viewMode, setViewMode] = useState<'month' | 'week'>('month');
  const [filterType, setFilterType] = useState<string>('all');
  const calendarRef = useRef<HTMLDivElement>(null);

  // 일정 데이터를 캘린더 이벤트로 변환
  const calendarEvents = React.useMemo(() => {
    const events: CalendarEvent[] = [];

    schedules.forEach(schedule => {
      // 게시 일정
      if (schedule.scheduled_date) {
        events.push({
          id: `${schedule.post_id}-publish`,
          postId: schedule.post_id,
          title: '게시 예정',
          date: new Date(schedule.scheduled_date),
          type: 'publish',
          status: schedule.published_date ? 'completed' :
                  isBefore(new Date(schedule.scheduled_date), new Date()) ? 'overdue' : 'pending',
          priority: schedule.priority,
          isDraggable: !schedule.published_date, // 게시 완료된 일정은 드래그 불가
        });
      }

      // 단계별 마감일
      const deadlines = [
        { key: 'material', label: '자료 수집 마감', field: 'material_deadline' },
        { key: 'guide', label: '가이드 제공 마감', field: 'guide_deadline' },
        { key: 'ai', label: 'AI 생성 마감', field: 'ai_deadline' },
        { key: 'admin_review', label: '관리자 검토 마감', field: 'admin_review_deadline' },
        { key: 'client_review', label: '클라이언트 검토 마감', field: 'client_review_deadline' },
        { key: 'final_revision', label: '최종 수정 마감', field: 'final_revision_deadline' },
      ];

      deadlines.forEach(({ key, label, field }) => {
        const deadline = schedule[field as keyof PostSchedule] as string | null;
        const completedAt = schedule[`${key}_completed_at` as keyof PostSchedule] as string | null;

        if (deadline) {
          let status: 'completed' | 'pending' | 'overdue' | 'due_soon' = 'pending';

          if (completedAt) {
            status = 'completed';
          } else {
            const deadlineDate = new Date(deadline);
            const now = new Date();
            const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

            if (daysDiff < 0) {
              status = 'overdue';
            } else if (daysDiff <= 1) {
              status = 'due_soon';
            }
          }

          events.push({
            id: `${schedule.post_id}-${key}`,
            postId: schedule.post_id,
            title: label,
            date: new Date(deadline),
            type: key as any,
            status,
            priority: schedule.priority,
            isDraggable: !completedAt, // 완료된 마감일은 드래그 불가
          });
        }
      });
    });

    return events;
  }, [schedules]);

  // 현재 월의 날짜들 계산
  const monthDays = React.useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  // 필터링된 이벤트들
  const filteredEvents = React.useMemo(() => {
    return calendarEvents.filter(event => {
      if (filterType === 'all') return true;
      if (filterType === 'publish') return event.type === 'publish';
      if (filterType === 'deadlines') return event.type !== 'publish';
      return event.type === filterType;
    });
  }, [calendarEvents, filterType]);

  // 드래그 시작
  const handleDragStart = (e: React.DragEvent, event: CalendarEvent) => {
    if (!event.isDraggable) {
      e.preventDefault();
      return;
    }
    setDraggedEvent(event);
    e.dataTransfer.effectAllowed = 'move';
  };

  // 드래그 오버
  const handleDragOver = (e: React.DragEvent, date: Date) => {
    e.preventDefault();
    if (draggedEvent) {
      setDragOverDate(date);
    }
  };

  // 드래그 드롭
  const handleDrop = async (e: React.DragEvent, date: Date) => {
    e.preventDefault();

    if (!draggedEvent || !onScheduleUpdate) {
      setDraggedEvent(null);
      setDragOverDate(null);
      return;
    }

    try {
      const updates: Partial<PostSchedule> = {};

      if (draggedEvent.type === 'publish') {
        updates.scheduled_date = date.toISOString();
      } else {
        // 마감일 필드 결정
        const deadlineFields: { [key: string]: string } = {
          material: 'material_deadline',
          guide: 'guide_deadline',
          ai: 'ai_deadline',
          admin_review: 'admin_review_deadline',
          client_review: 'client_review_deadline',
          final_revision: 'final_revision_deadline',
        };

        const fieldName = deadlineFields[draggedEvent.type];
        if (fieldName) {
          updates[fieldName as keyof PostSchedule] = date.toISOString();
        }
      }

      if (Object.keys(updates).length > 0) {
        await onScheduleUpdate(draggedEvent.postId, updates);
      }
    } catch (error) {
      console.error('일정 업데이트 실패:', error);
    }

    setDraggedEvent(null);
    setDragOverDate(null);
  };

  // 날짜별 이벤트 그룹화
  const getEventsForDate = (date: Date) => {
    return filteredEvents.filter(event => isSameDay(event.date, date));
  };

  // 이벤트 타입별 스타일
  const getEventTypeStyles = (type: string, status: string) => {
    const baseStyles = 'text-xs px-2 py-1 rounded-full font-medium cursor-pointer transition-all';

    let typeColor = '';
    switch (type) {
      case 'publish':
        typeColor = 'bg-purple-100 text-purple-800 hover:bg-purple-200';
        break;
      case 'material':
        typeColor = 'bg-blue-100 text-blue-800 hover:bg-blue-200';
        break;
      case 'guide':
        typeColor = 'bg-green-100 text-green-800 hover:bg-green-200';
        break;
      case 'ai':
        typeColor = 'bg-indigo-100 text-indigo-800 hover:bg-indigo-200';
        break;
      case 'admin_review':
        typeColor = 'bg-orange-100 text-orange-800 hover:bg-orange-200';
        break;
      case 'client_review':
        typeColor = 'bg-pink-100 text-pink-800 hover:bg-pink-200';
        break;
      case 'final_revision':
        typeColor = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
        break;
      default:
        typeColor = 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    }

    let statusStyles = '';
    switch (status) {
      case 'overdue':
        statusStyles = 'ring-2 ring-red-400 bg-red-50 text-red-800';
        break;
      case 'due_soon':
        statusStyles = 'ring-2 ring-yellow-400 bg-yellow-50 text-yellow-800';
        break;
      case 'completed':
        statusStyles = 'opacity-75';
        break;
    }

    return `${baseStyles} ${typeColor} ${statusStyles}`;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  return (
    <Card className={`p-6 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <Calendar className="w-6 h-6 text-blue-600" />
          <h3 className="text-xl font-semibold text-gray-900">
            일정 캘린더
          </h3>
        </div>

        {/* 필터 및 뷰 모드 */}
        <div className="flex items-center space-x-2">
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">전체 보기</option>
            <option value="publish">게시 일정</option>
            <option value="deadlines">마감 일정</option>
            <option value="material">자료 수집</option>
            <option value="guide">가이드 제공</option>
            <option value="ai">AI 생성</option>
            <option value="admin_review">관리자 검토</option>
            <option value="client_review">클라이언트 검토</option>
            <option value="final_revision">최종 수정</option>
          </select>

          <div className="flex border border-gray-300 rounded-md">
            <button
              onClick={() => setViewMode('month')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'month' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              월
            </button>
            <button
              onClick={() => setViewMode('week')}
              className={`px-3 py-1 text-sm ${
                viewMode === 'week' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              주
            </button>
          </div>
        </div>
      </div>

      {/* 캘린더 네비게이션 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <h4 className="text-lg font-semibold text-gray-900 min-w-[200px] text-center">
            {format(currentDate, 'yyyy년 MM월', { locale: ko })}
          </h4>

          <button
            onClick={() => navigateMonth('next')}
            className="p-1 hover:bg-gray-100 rounded-md"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        <Button onClick={goToToday} variant="outline" size="sm">
          오늘
        </Button>
      </div>

      {/* 캘린더 그리드 */}
      <div className="grid grid-cols-7 gap-1 mb-4">
        {/* 요일 헤더 */}
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 bg-gray-50 rounded">
            {day}
          </div>
        ))}

        {/* 날짜 셀들 */}
        {monthDays.map(day => {
          const dayEvents = getEventsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = selectedDate && isSameDay(day, selectedDate);
          const isTodayDate = isToday(day);
          const isDragOver = dragOverDate && isSameDay(day, dragOverDate);

          return (
            <div
              key={day.toISOString()}
              className={`
                min-h-[120px] p-2 border border-gray-200 rounded-lg transition-all
                ${!isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'}
                ${isTodayDate ? 'ring-2 ring-blue-500' : ''}
                ${isSelected ? 'ring-2 ring-green-500' : ''}
                ${isDragOver ? 'ring-2 ring-purple-500 bg-purple-50' : ''}
                ${draggedEvent ? 'hover:bg-gray-50' : ''}
              `}
              onClick={() => setSelectedDate(day)}
              onDragOver={(e) => handleDragOver(e, day)}
              onDrop={(e) => handleDrop(e, day)}
            >
              <div className={`text-sm font-medium mb-2 ${isTodayDate ? 'text-blue-600' : ''}`}>
                {format(day, 'd')}
              </div>

              {/* 이벤트들 */}
              <div className="space-y-1 max-h-[80px] overflow-y-auto">
                {dayEvents.slice(0, 3).map(event => (
                  <div
                    key={event.id}
                    draggable={event.isDraggable}
                    onDragStart={(e) => handleDragStart(e, event)}
                    onClick={(e) => {
                      e.stopPropagation();
                      const schedule = schedules.find(s => s.post_id === event.postId);
                      if (schedule && onScheduleClick) {
                        onScheduleClick(schedule);
                      }
                    }}
                    className={`
                      ${getEventTypeStyles(event.type, event.status)}
                      ${event.isDraggable ? 'cursor-move' : 'cursor-pointer'}
                      flex items-center space-x-1
                    `}
                    title={`${event.title} - ${event.postId}`}
                  >
                    {event.type === 'publish' && <Calendar className="w-3 h-3" />}
                    {event.status === 'overdue' && <AlertTriangle className="w-3 h-3" />}
                    {event.status === 'completed' && <CheckCircle className="w-3 h-3" />}
                    <span className="truncate">
                      {event.title.length > 8 ? `${event.title.slice(0, 8)}...` : event.title}
                    </span>
                    {event.priority > 1 && (
                      <Badge variant="error" size="sm" className="text-xs">
                        {event.priority}
                      </Badge>
                    )}
                  </div>
                ))}

                {dayEvents.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayEvents.length - 3}개 더보기
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 범례 */}
      <div className="flex flex-wrap gap-4 text-xs">
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-purple-100 rounded"></div>
          <span>게시 일정</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-blue-100 rounded"></div>
          <span>자료 수집</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-green-100 rounded"></div>
          <span>가이드 제공</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-indigo-100 rounded"></div>
          <span>AI 생성</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-orange-100 rounded"></div>
          <span>관리자 검토</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-pink-100 rounded"></div>
          <span>클라이언트 검토</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 bg-gray-100 rounded"></div>
          <span>최종 수정</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 ring-2 ring-red-400 bg-red-50 rounded"></div>
          <span>기한 초과</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className="w-3 h-3 ring-2 ring-yellow-400 bg-yellow-50 rounded"></div>
          <span>마감 임박</span>
        </div>
      </div>

      {/* 드래그 힌트 */}
      {draggedEvent && (
        <div className="fixed bottom-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Move className="w-4 h-4" />
            <span className="text-sm">
              {draggedEvent.title} 드래그 중 - 놓을 날짜를 선택하세요
            </span>
          </div>
        </div>
      )}
    </Card>
  );
}

// 간단한 미니 캘린더 컴포넌트
interface MiniScheduleCalendarProps {
  schedules?: PostSchedule[];
  onDateClick?: (date: Date) => void;
  className?: string;
}

export function MiniScheduleCalendar({
  schedules = [],
  onDateClick,
  className = ''
}: MiniScheduleCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthDays = React.useMemo(() => {
    const start = startOfMonth(currentDate);
    const end = endOfMonth(currentDate);
    return eachDayOfInterval({ start, end });
  }, [currentDate]);

  const getEventsForDate = (date: Date) => {
    return schedules.filter(schedule => {
      if (schedule.scheduled_date && isSameDay(new Date(schedule.scheduled_date), date)) {
        return true;
      }

      const deadlines = [
        schedule.material_deadline,
        schedule.guide_deadline,
        schedule.ai_deadline,
        schedule.admin_review_deadline,
        schedule.client_review_deadline,
        schedule.final_revision_deadline,
      ];

      return deadlines.some(deadline =>
        deadline && isSameDay(new Date(deadline), date)
      );
    });
  };

  return (
    <Card className={`p-4 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h4 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'yyyy년 MM월', { locale: ko })}
        </h4>
        <div className="flex space-x-1">
          <button
            onClick={() => setCurrentDate(prev => subMonths(prev, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => setCurrentDate(prev => addMonths(prev, 1))}
            className="p-1 hover:bg-gray-100 rounded"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center text-sm">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="p-2 font-medium text-gray-600">
            {day}
          </div>
        ))}

        {monthDays.map(day => {
          const events = getEventsForDate(day);
          const hasEvents = events.length > 0;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);

          return (
            <button
              key={day.toISOString()}
              onClick={() => onDateClick?.(day)}
              className={`
                p-2 text-sm rounded hover:bg-gray-100 transition-colors
                ${!isCurrentMonth ? 'text-gray-400' : ''}
                ${isTodayDate ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                ${hasEvents ? 'bg-yellow-100' : ''}
              `}
            >
              {format(day, 'd')}
              {hasEvents && (
                <div className="w-1 h-1 bg-yellow-500 rounded-full mx-auto mt-1"></div>
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
