'use client';

import { useEffect, useState } from 'react';
import { clientApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface Notification {
  id: string;
  notification_type: string;
  message: string;
  is_read: boolean;
  created_at: string;
  post_id?: string;
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAsRead, setMarkingAsRead] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const data = await clientApi.getNotifications();
      setNotifications(data);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      setMarkingAsRead(notificationId);
      await clientApi.markNotificationAsRead(notificationId);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === notificationId
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    } finally {
      setMarkingAsRead(null);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      const unreadNotifications = notifications.filter(n => !n.is_read);
      await Promise.all(
        unreadNotifications.map(n => clientApi.markNotificationAsRead(n.id))
      );

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({ ...notification, is_read: true }))
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    const icons = {
      'status_change': '📋',
      'review_request': '👀',
      'approval': '✅',
      'deadline': '⏰',
      'completion': '🎉',
      'error': '❌',
      'info': 'ℹ️'
    };
    return icons[type as keyof typeof icons] || '📢';
  };

  const getNotificationTitle = (type: string) => {
    const titles = {
      'status_change': '상태 변경',
      'review_request': '검토 요청',
      'approval': '승인 완료',
      'deadline': '마감 임박',
      'completion': '작업 완료',
      'error': '오류 발생',
      'info': '알림'
    };
    return titles[type as keyof typeof titles] || '알림';
  };

  const unreadCount = notifications.filter(n => !n.is_read).length;

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">알림</h1>
          <p className="text-gray-600 mt-2">중요한 업데이트와 알림을 확인하세요</p>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead}>
            전체 읽음 처리
          </Button>
        )}
      </div>

      {notifications.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📭</div>
          <h3 className="text-xl font-semibold mb-2">새로운 알림이 없습니다</h3>
          <p className="text-gray-600">포스트 상태 변경, 검토 요청 등의 알림이 여기에 표시됩니다.</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-6 transition-all ${
                !notification.is_read
                  ? 'border-l-4 border-l-blue-500 bg-blue-50/50'
                  : 'bg-white'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold">
                        {getNotificationTitle(notification.notification_type)}
                      </h3>
                      {!notification.is_read && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
                          새 알림
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{notification.message}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>
                        {new Date(notification.created_at).toLocaleString('ko-KR', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                      {notification.post_id && (
                        <a
                          href={`/client/posts/${notification.post_id}`}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          포스트 보기 →
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {!notification.is_read && (
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => handleMarkAsRead(notification.id)}
                    disabled={markingAsRead === notification.id}
                  >
                    {markingAsRead === notification.id ? '처리 중...' : '읽음'}
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Notification Settings */}
      <Card className="p-6 mt-8">
        <h2 className="text-xl font-semibold mb-4">알림 설정</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">포스트 상태 변경 알림</h3>
              <p className="text-sm text-gray-600">포스트 상태가 변경될 때 알림을 받습니다</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">검토 요청 알림</h3>
              <p className="text-sm text-gray-600">새로운 검토 요청이 있을 때 알림을 받습니다</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">마감 임박 알림</h3>
              <p className="text-sm text-gray-600">포스트 마감일이 임박했을 때 알림을 받습니다</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium">이메일 알림</h3>
              <p className="text-sm text-gray-600">중요한 알림을 이메일로도 받습니다</p>
            </div>
            <input type="checkbox" defaultChecked className="rounded" />
          </div>
        </div>

        <div className="mt-6">
          <Button>설정 저장</Button>
        </div>
      </Card>
    </div>
  );
}