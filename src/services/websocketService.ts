/**
 * WebSocket 실시간 연결 서비스
 * 백엔드 WebSocket API와의 실시간 통신 관리
 */

import config from '../lib/config';

export interface WebSocketMessage {
  type: string;
  data?: any;
  timestamp?: string;
  message?: string;
}

export interface ScheduleNotification {
  type: 'schedule_notification';
  data: {
    post_id: string;
    type: 'deadline_approaching' | 'overdue' | 'priority_changed' | 'stage_completed';
    stage?: string;
    delay_days?: number;
    hours_remaining?: number;
    urgency?: 'low' | 'medium' | 'high';
    message: string;
  };
}

export interface PipelineUpdate {
  type: 'pipeline_update';
  data: {
    post_id: string;
    agent_type: string;
    status: 'pending' | 'running' | 'completed' | 'failed';
    execution_time?: number;
    error_message?: string;
  };
}

export interface SystemAlert {
  type: 'system_alert';
  data: {
    alert_type: string;
    message: string;
    level?: 'info' | 'warning' | 'critical';
  };
}

export interface PongMessage {
  type: 'pong';
  data?: any;
}

export type WebSocketEvent = ScheduleNotification | PipelineUpdate | SystemAlert | PongMessage;

export class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000; // 3초
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private url: string;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat = Date.now();

  // 이벤트 리스너들
  private eventListeners: Map<string, Set<(data: any) => void>> = new Map();

  constructor() {
    // URL은 getWebSocketUrl()에서 동적으로 설정 - SSR 문제 방지
    this.url = '';
  }

  private getWebSocketUrl(): string {
    if (typeof window === 'undefined') {
      return '';
    }

    // config.apiUrl을 기반으로 WebSocket URL 생성
    const apiUrl = config.apiUrl;

    // HTTPS이면 WSS, HTTP이면 WS 사용
    const protocol = apiUrl.startsWith('https://') ? 'wss://' : 'ws://';

    // 호스트 부분 추출 (예: https://medicontents-qa-be-u45006.vm.elestio.app → medicontents-qa-be-u45006.vm.elestio.app)
    const host = apiUrl.replace(/^https?:\/\//, '');

    const wsUrl = `${protocol}${host}/api/v1/ws`;
    console.log('WebSocket URL generated:', wsUrl, 'from API URL:', apiUrl);

    return wsUrl;
  }

  /**
   * WebSocket 연결
   */
  async connect(): Promise<void> {
    if (this.ws?.readyState === WebSocket.OPEN || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.url = this.getWebSocketUrl();
      this.ws = new WebSocket(this.url);

      return new Promise((resolve, reject) => {
        if (!this.ws) return reject(new Error('WebSocket instance not created'));

        this.ws.onopen = () => {
          console.log('WebSocket connected');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.startHeartbeat();
          this.emit('connected', { timestamp: new Date().toISOString() });
          resolve();
        };

        this.ws.onmessage = (event) => {
          try {
            const message: WebSocketEvent = JSON.parse(event.data);
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnecting = false;
          this.stopHeartbeat();
          this.emit('disconnected', { code: event.code, reason: event.reason });

          // 정상적인 종료가 아닌 경우 재연결 시도
          if (event.code !== 1000) {
            this.scheduleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          this.emit('error', error);
        };

        // 연결 타임아웃 설정 (10초)
        setTimeout(() => {
          if (this.ws?.readyState === WebSocket.CONNECTING) {
            this.ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000);
      });

    } catch (error) {
      this.isConnecting = false;
      console.error('WebSocket connection failed:', error);
      this.scheduleReconnect();
      throw error;
    }
  }

  /**
   * WebSocket 연결 해제
   */
  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    this.stopHeartbeat();

    if (this.ws) {
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }

    this.emit('disconnected', { code: 1000, reason: 'Client disconnect' });
  }

  /**
   * 재연결 스케줄링
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached', {});
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectInterval * this.reconnectAttempts; // 점진적 증가

    console.log(`Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnection failed:', error);
      });
    }, delay);
  }

  /**
   * Heartbeat 시작 (연결 상태 확인)
   */
  private startHeartbeat(): void {
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.ws.send(JSON.stringify({ type: 'ping', timestamp: Date.now() }));
        this.lastHeartbeat = Date.now();
      }
    }, 30000); // 30초마다 heartbeat
  }

  /**
   * Heartbeat 중지
   */
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  /**
   * 메시지 처리
   */
  private handleMessage(message: WebSocketEvent): void {
    console.log('WebSocket message received:', message);

    // 특정 이벤트 타입에 대한 처리
    switch (message.type) {
      case 'schedule_notification':
        this.emit('schedule_notification', message.data);
        break;
      case 'pipeline_update':
        this.emit('pipeline_update', message.data);
        break;
      case 'system_alert':
        this.emit('system_alert', message.data);
        break;
      case 'pong':
        // Heartbeat 응답
        this.lastHeartbeat = Date.now();
        break;
      default:
        // 일반 메시지
        this.emit('message', message);
    }
  }

  /**
   * 이벤트 리스너 등록
   */
  on(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(callback);
  }

  /**
   * 이벤트 리스너 제거
   */
  off(event: string, callback?: (data: any) => void): void {
    if (!this.eventListeners.has(event)) return;

    if (callback) {
      this.eventListeners.get(event)!.delete(callback);
    } else {
      this.eventListeners.delete(event);
    }
  }

  /**
   * 이벤트 발생
   */
  private emit(event: string, data: any): void {
    if (!this.eventListeners.has(event)) return;

    this.eventListeners.get(event)!.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('Event callback error:', error);
      }
    });
  }

  /**
   * 메시지 전송
   */
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  /**
   * 특정 포스트 구독
   */
  subscribeToPost(postId: string): void {
    this.send({
      type: 'subscribe_post',
      data: { post_id: postId }
    });
  }

  /**
   * 포스트 구독 해제
   */
  unsubscribeFromPost(postId: string): void {
    this.send({
      type: 'unsubscribe_post',
      data: { post_id: postId }
    });
  }

  /**
   * 캠페인 구독
   */
  subscribeToCampaign(campaignId: string): void {
    this.send({
      type: 'subscribe_campaign',
      data: { campaign_id: campaignId }
    });
  }

  /**
   * 캠페인 구독 해제
   */
  unsubscribeFromCampaign(campaignId: string): void {
    this.send({
      type: 'unsubscribe_campaign',
      data: { campaign_id: campaignId }
    });
  }

  /**
   * 연결 상태 확인
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * 연결 상태 상세 정보
   */
  getConnectionStatus(): {
    isConnected: boolean;
    readyState: number;
    reconnectAttempts: number;
    lastHeartbeat: number;
  } {
    return {
      isConnected: this.isConnected,
      readyState: this.ws?.readyState ?? -1,
      reconnectAttempts: this.reconnectAttempts,
      lastHeartbeat: this.lastHeartbeat
    };
  }
}

// 클라이언트 사이드에서만 싱글톤 인스턴스 생성
let websocketService: WebSocketService | null = null;

const createWebSocketService = (): WebSocketService => {
  if (typeof window === 'undefined') {
    throw new Error('WebSocketService can only be created on the client side');
  }
  return new WebSocketService();
};

const getWebSocketService = (): WebSocketService => {
  if (!websocketService) {
    websocketService = createWebSocketService();
  }
  return websocketService;
};

export { getWebSocketService };
export default getWebSocketService;
