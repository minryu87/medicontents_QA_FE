/**
 * WebSocket Context Provider
 * 앱 전체에서 WebSocket 연결 상태를 공유
 */

'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface WebSocketContextType {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  connect: () => Promise<void>;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
  autoConnect?: boolean; // 페이지 로드 시 자동 연결 여부
}

export function WebSocketProvider({ children, autoConnect = true }: WebSocketProviderProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // WebSocket 이벤트 핸들러 설정
  useEffect(() => {
    // 클라이언트 사이드에서만 WebSocket 서비스 사용
    if (typeof window === 'undefined') return;

    const initWebSocket = async () => {
      try {
        // 동적 import로 SSR 문제 해결
        const { getWebSocketService } = await import('@/services/websocketService');
        const websocketService = getWebSocketService();

        const handleConnected = () => {
          setIsConnected(true);
          setIsConnecting(false);
          setError(null);
          console.log('WebSocket connected via context');
        };

        const handleDisconnected = () => {
          setIsConnected(false);
          setIsConnecting(false);
          console.log('WebSocket disconnected via context');
        };

        const handleError = (errorData: any) => {
          setError(new Error(errorData.message || 'WebSocket connection error'));
          setIsConnecting(false);
          console.error('WebSocket error via context:', errorData);
        };

        // 이벤트 리스너 등록
        websocketService.on('connected', handleConnected);
        websocketService.on('disconnected', handleDisconnected);
        websocketService.on('error', handleError);

        // 초기 연결 상태 확인
        const status = websocketService.getConnectionStatus();
        setIsConnected(status.isConnected);

        // 자동 연결 (선택적)
        if (autoConnect && !status.isConnected) {
          connect();
        }

        // 클린업 함수 반환
        return () => {
          websocketService.off('connected', handleConnected);
          websocketService.off('disconnected', handleDisconnected);
          websocketService.off('error', handleError);
        };
      } catch (error) {
        console.error('Failed to initialize WebSocket:', error);
      }
    };

    const cleanup = initWebSocket();

    return () => {
      cleanup?.then(cleanupFn => cleanupFn?.());
    };
  }, [autoConnect]);

  const connect = async () => {
    if (isConnected || isConnecting) return;

    setIsConnecting(true);
    setError(null);

    try {
      const { getWebSocketService } = await import('@/services/websocketService');
      const websocketService = getWebSocketService();
      await websocketService.connect();
    } catch (err) {
      setError(err as Error);
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    try {
      const { getWebSocketService } = await import('@/services/websocketService');
      const websocketService = getWebSocketService();
      websocketService.disconnect();
    } catch (err) {
      console.error('Failed to disconnect WebSocket:', err);
    }
  };

  const value: WebSocketContextType = {
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
}

export function useWebSocketContext() {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
}

// Connection Status Indicator Component
export function WebSocketStatusIndicator() {
  const { isConnected, isConnecting, error } = useWebSocketContext();

  if (error) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-red-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-red-300 rounded-full animate-pulse"></div>
          <span className="text-sm">연결 오류</span>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-yellow-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-300 rounded-full animate-pulse"></div>
          <span className="text-sm">연결 중...</span>
        </div>
      </div>
    );
  }

  if (isConnected) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-300 rounded-full"></div>
          <span className="text-sm">실시간 연결됨</span>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <div className="bg-gray-500 text-white px-3 py-2 rounded-lg shadow-lg flex items-center space-x-2">
        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
        <span className="text-sm">연결되지 않음</span>
      </div>
    </div>
  );
}
