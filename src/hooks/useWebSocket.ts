/**
 * WebSocket 연결을 위한 React Hook
 * 실시간 데이터 수신 및 연결 상태 관리
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getWebSocketService } from '@/services/websocketService';

export interface WebSocketHookState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionStatus: {
    isConnected: boolean;
    readyState: number;
    reconnectAttempts: number;
    lastHeartbeat: number;
  };
  error: Error | null;
}

export interface WebSocketHookActions {
  connect: () => Promise<void>;
  disconnect: () => void;
  subscribeToPost: (postId: string) => void;
  unsubscribeFromPost: (postId: string) => void;
  subscribeToCampaign: (campaignId: string) => void;
  unsubscribeFromCampaign: (campaignId: string) => void;
}

export function useWebSocket(): WebSocketHookState & WebSocketHookActions {
  const websocketService = getWebSocketService();

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState(websocketService.getConnectionStatus());
  const [error, setError] = useState<Error | null>(null);

  // 이벤트 리스너들을 저장하기 위한 ref
  const eventListenersRef = useRef<Map<string, (data: any) => void>>(new Map());

  // 연결 상태 업데이트
  const updateConnectionStatus = useCallback(() => {
    setConnectionStatus(websocketService.getConnectionStatus());
    setIsConnected(websocketService.isConnected);
  }, []);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    const handleConnected = () => {
      setIsConnected(true);
      setIsConnecting(false);
      setError(null);
      updateConnectionStatus();
    };

    const handleDisconnected = () => {
      setIsConnected(false);
      setIsConnecting(false);
      updateConnectionStatus();
    };

    const handleError = (errorData: any) => {
      setError(new Error(errorData.message || 'WebSocket connection error'));
      setIsConnecting(false);
      updateConnectionStatus();
    };

    // 이벤트 리스너 등록
    websocketService.on('connected', handleConnected);
    websocketService.on('disconnected', handleDisconnected);
    websocketService.on('error', handleError);

    // 초기 상태 설정
    updateConnectionStatus();

    // 클린업
    return () => {
      websocketService.off('connected', handleConnected);
      websocketService.off('disconnected', handleDisconnected);
      websocketService.off('error', handleError);

      // 등록된 모든 이벤트 리스너 제거
      eventListenersRef.current.forEach((listener, event) => {
        websocketService.off(event, listener);
      });
      eventListenersRef.current.clear();
    };
  }, [updateConnectionStatus]);

  // 연결 함수
  const connect = useCallback(async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      await websocketService.connect();
    } catch (err) {
      setError(err as Error);
      setIsConnecting(false);
    }
  }, [isConnected, isConnecting]);

  // 연결 해제 함수
  const disconnect = useCallback(() => {
    websocketService.disconnect();
  }, []);

  // 포스트 구독 함수
  const subscribeToPost = useCallback((postId: string) => {
    if (isConnected) {
      websocketService.subscribeToPost(postId);
    }
  }, [isConnected]);

  // 포스트 구독 해제 함수
  const unsubscribeFromPost = useCallback((postId: string) => {
    if (isConnected) {
      websocketService.unsubscribeFromPost(postId);
    }
  }, [isConnected]);

  // 캠페인 구독 함수
  const subscribeToCampaign = useCallback((campaignId: string) => {
    if (isConnected) {
      websocketService.subscribeToCampaign(campaignId);
    }
  }, [isConnected]);

  // 캠페인 구독 해제 함수
  const unsubscribeFromCampaign = useCallback((campaignId: string) => {
    if (isConnected) {
      websocketService.unsubscribeFromCampaign(campaignId);
    }
  }, [isConnected]);

  return {
    // 상태
    isConnected,
    isConnecting,
    connectionStatus,
    error,

    // 액션
    connect,
    disconnect,
    subscribeToPost,
    unsubscribeFromPost,
    subscribeToCampaign,
    unsubscribeFromCampaign,
  };
}

/**
 * 특정 이벤트에 대한 WebSocket hook
 */
export function useWebSocketEvent<T = any>(
  event: string,
  callback?: (data: T) => void
): {
  data: T | null;
  isListening: boolean;
} {
  const [data, setData] = useState<T | null>(null);
  const [isListening, setIsListening] = useState(false);
  const callbackRef = useRef(callback);
  const websocketService = getWebSocketService();

  // 콜백 함수 업데이트
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleEvent = (eventData: T) => {
      setData(eventData);
      if (callbackRef.current) {
        callbackRef.current(eventData);
      }
    };

    websocketService.on(event, handleEvent);
    setIsListening(true);

    return () => {
      websocketService.off(event, handleEvent);
      setIsListening(false);
    };
  }, [event, websocketService]);

  return { data, isListening };
}

/**
 * 일정 알림을 위한 특화된 hook
 */
export function useScheduleNotifications() {
  const { data: notification, isListening } = useWebSocketEvent<{
    post_id: string;
    type: 'deadline_approaching' | 'overdue' | 'priority_changed' | 'stage_completed';
    stage?: string;
    delay_days?: number;
    hours_remaining?: number;
    urgency?: 'low' | 'medium' | 'high';
    message: string;
  }>('schedule_notification');

  return {
    notification,
    isListening,
  };
}

/**
 * 파이프라인 업데이트를 위한 특화된 hook
 */
export function usePipelineUpdates() {
  const { data: update, isListening } = useWebSocketEvent<{
    post_id: string;
    agent_type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    execution_time?: number;
    error_message?: string;
  }>('pipeline_update');

  return {
    update,
    isListening,
  };
}

/**
 * 시스템 알림을 위한 특화된 hook
 */
export function useSystemAlerts() {
  const { data: alert, isListening } = useWebSocketEvent<{
    alert_type: string;
    message: string;
    level?: 'info' | 'warning' | 'critical';
  }>('system_alert');

  return {
    alert,
    isListening,
  };
}
