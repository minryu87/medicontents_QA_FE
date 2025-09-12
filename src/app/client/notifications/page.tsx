'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDateTime } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Notification } from '@/types/common';

export default function ClientNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadNotifications = async () => {
      try {
        setLoading(true);
        const notificationsData = await clientApi.getNotifications();
        setNotifications(notificationsData);
      } catch (error) {
        console.error('알림 데이터 로드 실패:', error);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, []);

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      await clientApi.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(notification => 
          notification.id === notificationId 
            ? { ...notification, is_read: true }
            : notification
        )
      );
    } catch (error) {
      console.error('알림 읽음 처리 실패:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'status_change': return '🔄';
      case 'review_request': return '👀';
      case 'approval': return '✅';
      default: return '📢';
    }
  };

  const getNotificationTypeText = (type: string) => {
    switch (type) {
      case 'status_change': return '상태 변경';
      case 'review_request': return '검토 요청';
      case 'approval': return '승인 알림';
      default: return '일반 알림';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">알림</h1>
        <p className="text-gray-600">포스트 관련 알림을 확인하세요</p>
      </div>

      {/* 알림 목록 */}
      <div className="space-y-4">
        {notifications.map((notification) => (
          <Card 
            key={notification.id} 
            className={`hover:shadow-md transition-shadow ${
              !notification.is_read ? 'border-l-4 border-l-blue-500' : ''
            }`}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  <div className="text-2xl">
                    {getNotificationIcon(notification.notification_type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <Badge variant="outline">
                        {getNotificationTypeText(notification.notification_type)}
                      </Badge>
                      {!notification.is_read && (
                        <Badge variant="info">새 알림</Badge>
                      )}
                    </div>
                    <p className="font-medium text-gray-900 mb-1">
                      {notification.message}
                    </p>
                    <p className="text-sm text-gray-500">
                      {formatDateTime(notification.created_at)}
                    </p>
                    {notification.post_id && (
                      <div className="mt-2">
                        <Button size="sm" variant="link" asChild className="p-0 h-auto">
                          <a href={`/client/posts/${notification.post_id}`}>
                            포스트 보기 →
                          </a>
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex space-x-2">
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      읽음
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {notifications.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <div className="text-6xl mb-4">🔔</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">새로운 알림이 없습니다</h3>
            <p className="text-gray-600">
              포스트 상태 변경이나 검토 요청이 있을 때 알림을 받을 수 있습니다.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
