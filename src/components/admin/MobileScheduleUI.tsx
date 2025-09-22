/**
 * 모바일 반응형 일정 UI 컴포넌트들
 * 모바일 최적화 레이아웃, 터치 인터랙션, 반응형 컴포넌트
 */

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import {
  Calendar,
  Clock,
  Bell,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  MoreVertical,
  Edit3,
  Eye,
  Smartphone,
  Tablet
} from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday, addMonths, subMonths } from 'date-fns';
import { ko } from 'date-fns/locale';
import type { PostSchedule, ScheduleNotification } from '@/types/common';

// 모바일 메뉴 컴포넌트
interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export function MobileMenu({ isOpen, onClose, children }: MobileMenuProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 md:hidden">
      <div className="fixed inset-0 bg-black bg-opacity-50" onClick={onClose} />
      <div className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-xl">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">메뉴</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// 모바일 일정 카드 컴포넌트
interface MobileScheduleCardProps {
  schedule: PostSchedule;
  onClick?: () => void;
  onEdit?: () => void;
  onView?: () => void;
}

export function MobileScheduleCard({ schedule, onClick, onEdit, onView }: MobileScheduleCardProps) {
  const getStatusColor = (deadline: string | null, completedAt: string | null) => {
    if (completedAt) return 'text-green-600';
    if (!deadline) return 'text-gray-400';

    const now = new Date();
    const deadlineDate = new Date(deadline);
    const daysDiff = Math.ceil((deadlineDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysDiff < 0) return 'text-red-600';
    if (daysDiff <= 1) return 'text-orange-600';
    if (daysDiff <= 3) return 'text-yellow-600';
    return 'text-blue-600';
  };

  const getDelayStatus = () => {
    if (schedule.delay_status === 'on_track') return { text: '정상', color: 'text-green-600' };
    if (schedule.delay_status === 'at_risk') return { text: '위험', color: 'text-orange-600' };
    return { text: '지연', color: 'text-red-600' };
  };

  const delayStatus = getDelayStatus();

  return (
    <Card className="p-4 mb-3 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              Post ID: {schedule.post_id}
            </h3>
            <Badge variant={schedule.priority > 2 ? 'error' : schedule.priority > 1 ? 'warning' : 'secondary'} size="sm">
              {schedule.priority}
            </Badge>
          </div>

          <div className="space-y-1 text-xs text-gray-600">
            <div className="flex items-center space-x-2">
              <Clock className="w-3 h-3" />
              <span>상태: <span className={delayStatus.color}>{delayStatus.text}</span></span>
            </div>

            {schedule.scheduled_date && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-3 h-3" />
                <span className={getStatusColor(schedule.scheduled_date, schedule.published_date)}>
                  게시: {format(new Date(schedule.scheduled_date), 'MM/dd HH:mm', { locale: ko })}
                </span>
              </div>
            )}

            {schedule.material_deadline && (
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-3 h-3" />
                <span className={getStatusColor(schedule.material_deadline, schedule.material_completed_at)}>
                  자료 마감: {format(new Date(schedule.material_deadline), 'MM/dd', { locale: ko })}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-1 ml-2">
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onView?.(); }}>
            <Eye className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); onEdit?.(); }}>
            <Edit3 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
}

// 모바일 알림 카드 컴포넌트
interface MobileNotificationCardProps {
  notification: ScheduleNotification;
  onClick?: () => void;
  onAcknowledge?: () => void;
}

export function MobileNotificationCard({ notification, onClick, onAcknowledge }: MobileNotificationCardProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'deadline_approaching':
        return <Clock className="w-5 h-5 text-orange-500" />;
      case 'overdue':
        return <AlertTriangle className="w-5 h-5 text-red-500" />;
      case 'priority_changed':
        return <TrendingUp className="w-5 h-5 text-purple-500" />;
      case 'stage_completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      default:
        return <Bell className="w-5 h-5 text-blue-500" />;
    }
  };

  const getTypeLabel = (type: string) => {
    const labels: { [key: string]: string } = {
      'deadline_approaching': '마감 임박',
      'overdue': '기한 초과',
      'priority_changed': '우선순위 변경',
      'stage_completed': '단계 완료'
    };
    return labels[type] || type;
  };

  return (
    <Card className="p-3 mb-2 cursor-pointer hover:shadow-md transition-shadow" onClick={onClick}>
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getIcon(notification.notification_type)}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <Badge variant={
              notification.notification_type === 'overdue' ? 'error' :
              notification.notification_type === 'deadline_approaching' ? 'warning' :
              notification.notification_type === 'priority_changed' ? 'info' : 'success'
            } size="sm">
              {getTypeLabel(notification.notification_type)}
            </Badge>

            {notification.status === 'pending' && (
              <Button size="sm" onClick={(e) => { e.stopPropagation(); onAcknowledge?.(); }}>
                확인
              </Button>
            )}
          </div>

          <h4 className="text-sm font-medium text-gray-900 mb-1 truncate">
            {notification.post_title}
          </h4>

          <div className="text-xs text-gray-500">
            {format(new Date(notification.created_at), 'MM/dd HH:mm', { locale: ko })}
          </div>
        </div>
      </div>
    </Card>
  );
}

// 모바일 캘린더 컴포넌트
interface MobileCalendarProps {
  schedules?: PostSchedule[];
  onDateSelect?: (date: Date) => void;
  onScheduleClick?: (schedule: PostSchedule) => void;
  className?: string;
}

export function MobileCalendar({
  schedules = [],
  onDateSelect,
  onScheduleClick,
  className = ''
}: MobileCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    onDateSelect?.(date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev =>
      direction === 'next' ? addMonths(prev, 1) : subMonths(prev, 1)
    );
  };

  return (
    <Card className={`p-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigateMonth('prev')}>
          <ChevronLeft className="w-4 h-4" />
        </Button>

        <h3 className="text-lg font-semibold text-gray-900">
          {format(currentDate, 'yyyy년 MM월', { locale: ko })}
        </h3>

        <Button variant="ghost" size="sm" onClick={() => navigateMonth('next')}>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>

      {/* 요일 헤더 */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {['일', '월', '화', '수', '목', '금', '토'].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* 날짜 그리드 */}
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map(day => {
          const events = getEventsForDate(day);
          const hasEvents = events.length > 0;
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isTodayDate = isToday(day);
          const isSelected = selectedDate && isSameDay(day, selectedDate);

          return (
            <button
              key={day.toISOString()}
              onClick={() => handleDateClick(day)}
              className={`
                h-10 w-10 text-sm rounded-lg transition-colors relative
                ${!isCurrentMonth ? 'text-gray-400' : 'text-gray-900'}
                ${isTodayDate ? 'bg-blue-100 text-blue-600 font-bold' : ''}
                ${isSelected ? 'bg-green-100 text-green-600' : ''}
                ${hasEvents ? 'bg-yellow-50 border border-yellow-200' : 'hover:bg-gray-100'}
              `}
            >
              {format(day, 'd')}

              {hasEvents && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1 h-1 bg-yellow-500 rounded-full"></div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* 선택된 날짜의 일정들 */}
      {selectedDate && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {format(selectedDate, 'MM월 dd일', { locale: ko })} 일정
          </h4>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {getEventsForDate(selectedDate).map((schedule, index) => (
              <div
                key={schedule.id}
                className="p-2 bg-gray-50 rounded text-xs cursor-pointer hover:bg-gray-100"
                onClick={() => onScheduleClick?.(schedule)}
              >
                <div className="font-medium text-gray-900">Post ID: {schedule.post_id}</div>
                <div className="text-gray-600">우선순위: {schedule.priority}</div>
              </div>
            ))}

            {getEventsForDate(selectedDate).length === 0 && (
              <div className="text-center text-gray-500 text-sm py-4">
                일정이 없습니다
              </div>
            )}
          </div>
        </div>
      )}
    </Card>
  );
}

// 모바일 대시보드 컴포넌트
interface MobileScheduleDashboardProps {
  schedules?: PostSchedule[];
  notifications?: ScheduleNotification[];
  onScheduleClick?: (schedule: PostSchedule) => void;
  onNotificationClick?: (notification: ScheduleNotification) => void;
  className?: string;
}

export function MobileScheduleDashboard({
  schedules = [],
  notifications = [],
  onScheduleClick,
  onNotificationClick,
  className = ''
}: MobileScheduleDashboardProps) {
  const [activeTab, setActiveTab] = useState<'calendar' | 'list' | 'notifications'>('calendar');
  const [menuOpen, setMenuOpen] = useState(false);

  const urgentNotifications = notifications.filter(n =>
    n.notification_type === 'overdue' && n.status === 'pending'
  );

  const pendingNotifications = notifications.filter(n => n.status === 'pending');

  return (
    <div className={`min-h-screen bg-gray-50 ${className}`}>
      {/* 모바일 헤더 */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <Smartphone className="w-5 h-5 text-blue-600" />
          <h1 className="text-lg font-semibold text-gray-900">일정 관리</h1>
        </div>

        <div className="flex items-center space-x-2">
          {urgentNotifications.length > 0 && (
            <Badge variant="error" size="sm">
              {urgentNotifications.length}
            </Badge>
          )}

          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(true)}>
            <Menu className="w-5 h-5" />
          </Button>
        </div>
      </div>

      {/* 탭 네비게이션 */}
      <div className="bg-white border-b border-gray-200 px-4 py-2 sticky top-[57px] z-30">
        <div className="flex space-x-1">
          {[
            { id: 'calendar', label: '캘린더', icon: Calendar },
            { id: 'list', label: '목록', icon: Clock },
            { id: 'notifications', label: '알림', icon: Bell },
          ].map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id as any)}
              className={`
                flex-1 flex items-center justify-center space-x-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors
                ${activeTab === id
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100'
                }
              `}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
              {id === 'notifications' && pendingNotifications.length > 0 && (
                <Badge variant="error" size="sm" className="ml-1">
                  {pendingNotifications.length}
                </Badge>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* 메인 컨텐츠 */}
      <div className="p-4 pb-20">
        {activeTab === 'calendar' && (
          <MobileCalendar
            schedules={schedules}
            onDateSelect={(date) => {
              // 날짜 선택 시 처리
              console.log('Selected date:', date);
            }}
            onScheduleClick={onScheduleClick}
          />
        )}

        {activeTab === 'list' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">일정 목록</h2>
            <div className="space-y-2">
              {schedules.map((schedule) => (
                <MobileScheduleCard
                  key={schedule.id}
                  schedule={schedule}
                  onClick={() => onScheduleClick?.(schedule)}
                  onEdit={() => console.log('Edit schedule:', schedule.id)}
                  onView={() => onScheduleClick?.(schedule)}
                />
              ))}

              {schedules.length === 0 && (
                <Card className="p-8 text-center">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">등록된 일정이 없습니다</p>
                </Card>
              )}
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">알림</h2>
            <div className="space-y-2">
              {notifications.map((notification) => (
                <MobileNotificationCard
                  key={notification.id}
                  notification={notification}
                  onClick={() => onNotificationClick?.(notification)}
                  onAcknowledge={() => console.log('Acknowledge notification:', notification.id)}
                />
              ))}

              {notifications.length === 0 && (
                <Card className="p-8 text-center">
                  <Bell className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">새로운 알림이 없습니다</p>
                </Card>
              )}
            </div>
          </div>
        )}
      </div>

      {/* 모바일 메뉴 */}
      <MobileMenu isOpen={menuOpen} onClose={() => setMenuOpen(false)}>
        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">빠른 액션</h3>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                새 일정 추가
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Filter className="w-4 h-4 mr-2" />
                필터 설정
              </Button>
              <Button variant="outline" className="w-full justify-start" size="sm">
                <Search className="w-4 h-4 mr-2" />
                일정 검색
              </Button>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">통계</h3>
            <div className="space-y-2 text-sm text-gray-600">
              <div className="flex justify-between">
                <span>총 일정:</span>
                <span>{schedules.length}개</span>
              </div>
              <div className="flex justify-between">
                <span>미확인 알림:</span>
                <span>{pendingNotifications.length}개</span>
              </div>
              <div className="flex justify-between">
                <span>긴급 알림:</span>
                <span>{urgentNotifications.length}개</span>
              </div>
            </div>
          </div>
        </div>
      </MobileMenu>

      {/* 모바일용 하단 네비게이션 (필요시) */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 md:hidden">
        <div className="flex justify-around">
          <Button
            variant={activeTab === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('calendar')}
          >
            <Calendar className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTab === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('list')}
          >
            <Clock className="w-4 h-4" />
          </Button>
          <Button
            variant={activeTab === 'notifications' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('notifications')}
          >
            <Bell className="w-4 h-4" />
            {pendingNotifications.length > 0 && (
              <Badge variant="error" size="sm" className="absolute -top-2 -right-2">
                {pendingNotifications.length}
              </Badge>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// 반응형 컨테이너 컴포넌트
interface ResponsiveScheduleContainerProps {
  children: React.ReactNode;
  mobileComponent?: React.ReactNode;
}

export function ResponsiveScheduleContainer({
  children,
  mobileComponent
}: ResponsiveScheduleContainerProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []);

  if (isMobile && mobileComponent) {
    return <>{mobileComponent}</>;
  }

  return <>{children}</>;
}

// 터치 친화적 버튼 컴포넌트
interface TouchButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export function TouchButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...props
}: TouchButtonProps) {
  const baseClasses = 'rounded-lg font-medium transition-all active:scale-95 select-none touch-manipulation';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 active:bg-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm min-h-[44px]',
    md: 'px-4 py-3 text-base min-h-[48px]',
    lg: 'px-6 py-4 text-lg min-h-[56px]'
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
