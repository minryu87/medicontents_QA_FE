/**
 * 완료 알림 Context Provider
 * AI 생성 완료 시 글로벌 알림 카드를 표시
 */

'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// 진행/완료 알림 카드 타입
interface ProgressCard {
  id: string;
  postId: string;
  status: 'running' | 'completed';
  timestamp: Date;
  acknowledged: boolean;
}

// 진행/완료 알림 Context 타입
interface CompletionNotificationContextType {
  progressCards: ProgressCard[];
  addProgressNotification: (postId: string) => void;
  updateProgressToCompleted: (postId: string) => void;
  removeProgressNotification: (id: string) => void;
  acknowledgeProgressNotification: (id: string) => void;
}

// 완료 알림 Context
const CompletionNotificationContext = createContext<CompletionNotificationContextType | null>(null);

// 진행/완료 알림 Provider 컴포넌트
export function CompletionNotificationProvider({ children }: { children: React.ReactNode }) {
  const [progressCards, setProgressCards] = useState<ProgressCard[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 초기 로딩 시 저장된 알림 불러오기
  useEffect(() => {
    const loadSavedNotifications = async () => {
      try {
        console.log('📥 CompletionNotificationContext: 저장된 알림 불러오기');
        // 현재 사용자(임시로 1)의 읽지 않은 AI 생성 관련 알림만 불러오기
        const response = await import('@/services/api').then(mod => (mod.adminApi as any).getNotifications({
          user_id: 1, // 임시 사용자 ID
          is_read: false,
          limit: 20 // 최근 20개만 불러오기
        }));

        if (response.items) {
          // generation, image_analysis, medical_research 관련 알림 필터링
          const relevantNotifications = response.items.filter((item: any) =>
            item.notification_type === 'generation_progress' ||
            item.notification_type === 'generation_completed' ||
            item.notification_type === 'image_analysis_started' ||
            item.notification_type === 'image_analysis_completed' ||
            item.notification_type === 'medical_research_started' ||
            item.notification_type === 'medical_research_completed'
          );

          const savedCards: ProgressCard[] = relevantNotifications.map((item: any) => ({
            id: `db_${item.id}`,
            postId: item.post_id,
            status: (
              item.notification_type === 'generation_completed' ||
              item.notification_type === 'image_analysis_completed' ||
              item.notification_type === 'medical_research_completed'
            ) ? 'completed' : 'running',
            timestamp: new Date(item.created_at),
            acknowledged: false
          }));

          setProgressCards(savedCards);
          console.log('✅ CompletionNotificationContext: 저장된 알림 로드 완료', savedCards.length, '개');
        }
      } catch (error) {
        console.error('❌ CompletionNotificationContext: 저장된 알림 로드 실패', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSavedNotifications();
  }, []);

  // 진행 중 알림 추가 (시작 시 호출) - DB에도 저장
  const addProgressNotification = async (postId: string) => {
    console.log('🚀 addProgressNotification 시작:', postId);

    try {
      const id = `progress_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const newCard: ProgressCard = {
        id,
        postId,
        status: 'running',
        timestamp: new Date(),
        acknowledged: false
      };

      console.log('🎯 CompletionNotificationContext: 진행 중 알림 카드 추가', newCard);
      setProgressCards(prev => [...prev, newCard]);

      console.log('📡 API 호출 시작...');
      // DB에 저장
      const apiModule = await import('@/services/api');
      console.log('📦 API 모듈 로드 완료:', !!apiModule.adminApi);

      const result = await (apiModule.adminApi as any).createNotification({
        user_id: 1, // 임시 사용자 ID
        post_id: postId,
        notification_type: 'generation_progress',
        message: `포스트 ${postId} AI 생성 진행 중`,
        is_read: false
      });

      console.log('✅ API 호출 성공:', result);
      console.log('💾 CompletionNotificationContext: 알림 DB 저장 완료');
    } catch (error) {
      console.error('❌ CompletionNotificationContext: 알림 DB 저장 실패', error);
      const errorDetails = error as any;
      console.error('❌ 에러 상세:', errorDetails?.response?.data || errorDetails?.message || error);
    }
  };

  // 진행 중 → 완료로 상태 변경
  const updateProgressToCompleted = async (postId: string) => {
    try {
      console.log('✅ CompletionNotificationContext: 진행 중 카드 → 완료로 업데이트', postId);

      // 로컬 상태 업데이트
      setProgressCards(prev => prev.map(card =>
        card.postId === postId ? { ...card, status: 'completed' } : card
      ));

      // DB에 완료 알림 추가
      await import('@/services/api').then(mod => (mod.adminApi as any).createNotification({
        user_id: 1, // 임시 사용자 ID
        post_id: postId,
        notification_type: 'generation_completed',
        message: `포스트 ${postId} AI 생성 완료`,
        is_read: false
      }));

      console.log('💾 CompletionNotificationContext: 완료 알림 DB 저장 완료');
    } catch (error) {
      console.error('❌ CompletionNotificationContext: 완료 알림 DB 저장 실패', error);
    }
  };

  // 진행/완료 알림 제거
  const removeProgressNotification = (id: string) => {
    console.log('🗑️ CompletionNotificationContext: 진행/완료 알림 카드 제거', id);
    setProgressCards(prev => prev.filter(card => card.id !== id));
  };

  // 진행/완료 알림 확인
  const acknowledgeProgressNotification = async (id: string) => {
    try {
      console.log('✅ CompletionNotificationContext: 진행/완료 알림 카드 확인', id);

      // 로컬 상태 업데이트
      setProgressCards(prev => prev.map(card =>
        card.id === id ? { ...card, acknowledged: true } : card
      ));

      // DB에 읽음 표시 (DB에서 온 알림인 경우)
      if (id.startsWith('db_')) {
        const notificationId = parseInt(id.replace('db_', ''));
        await import('@/services/api').then(mod => (mod.adminApi as any).markNotificationAsRead(notificationId));
        console.log('💾 CompletionNotificationContext: 알림 읽음 표시 DB 업데이트 완료');
      }
    } catch (error) {
      console.error('❌ CompletionNotificationContext: 알림 읽음 표시 실패', error);
    }
  };

  return (
    <CompletionNotificationContext.Provider value={{
      progressCards,
      addProgressNotification,
      updateProgressToCompleted,
      removeProgressNotification,
      acknowledgeProgressNotification
    }}>
      {children}
    </CompletionNotificationContext.Provider>
  );
}

// 완료 알림 Hook
export function useCompletionNotification() {
  const context = useContext(CompletionNotificationContext);
  if (!context) {
    throw new Error('useCompletionNotification must be used within CompletionNotificationProvider');
  }
  return context;
}

// 진행/완료 알림 카드 컴포넌트 (다중 카드 지원)
export function CompletionNotificationCard() {
  const { progressCards, removeProgressNotification, acknowledgeProgressNotification } = useCompletionNotification();

  if (progressCards.length === 0) return null;

  console.log('✅ CompletionNotificationCard: 다중 진행/완료 카드 렌더링', progressCards.length);

  return (
    <>
      {progressCards.map((card, index) => (
        <ProgressCardItem
          key={card.id}
          card={card}
          index={index}
          onRemove={removeProgressNotification}
          onAcknowledge={acknowledgeProgressNotification}
        />
      ))}
    </>
  );
}

// 개별 진행/완료 알림 카드 컴포넌트
function ProgressCardItem({
  card,
  index,
  onRemove,
  onAcknowledge
}: {
  card: ProgressCard;
  index: number;
  onRemove: (id: string) => void;
  onAcknowledge: (id: string) => void;
}) {
  const handleClose = () => {
    onAcknowledge(card.id); // 확인 표시
    onRemove(card.id); // 제거
  };

  const handleGoToResult = () => {
    console.log('📍 결과 검토 페이지로 이동:', card.postId);
    onAcknowledge(card.id); // 확인 표시
    onRemove(card.id); // 제거

    // Next.js router를 사용한 실제 라우팅
    if (typeof window !== 'undefined') {
      // 현재는 post_id를 사용해 결과 검토 페이지로 이동
      // 추후 action_url 필드가 추가되면 해당 URL 사용 가능
      const resultUrl = `/admin/posts/${card.postId}/review`;
      console.log('🚀 라우팅:', resultUrl);
      window.location.href = resultUrl; // 임시로 location.href 사용, 실제로는 useRouter 사용 권장
    }
  };

  // 진행 중 상태일 때는 닫기 버튼만 표시, 완료 상태일 때는 바로가기 버튼도 표시
  const getIcon = () => {
    if (card.status === 'running') {
      return (
        <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse flex items-center justify-center">
          <svg className="w-3 h-3 text-white animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      );
    } else {
      return (
        <div className="w-5 h-5 bg-green-500 rounded-full animate-pulse flex items-center justify-center">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </div>
      );
    }
  };

  const getBorderColor = () => card.status === 'running' ? 'border-l-blue-500 bg-blue-50' : 'border-l-green-500 bg-green-50';

  const getTitle = () => card.status === 'running' ? 'AI 생성 진행 중' : 'AI 생성 완료';

  const getMessage = () => {
    if (card.status === 'running') {
      return 'AI 콘텐츠 생성이 진행 중입니다.';
    } else {
      return 'AI 콘텐츠 생성이 완료되었습니다.';
    }
  };

  return (
    <div
      className={`
        fixed z-50 transition-all duration-300 ease-in-out
        opacity-100 translate-x-0
        max-w-sm w-full
      `}
      style={{
        right: '1rem',
        top: `${4 + (index * 4.5)}rem`, // 여러 카드를 겹치지 않게 배치
        zIndex: 50 + index,
      }}
    >
      <div className={`
        border-l-4 shadow-lg rounded-lg p-4
        ${getBorderColor()}
        backdrop-blur-sm bg-white/95
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 w-0 flex-1">
            <p className="text-sm font-medium text-gray-900">
              {getTitle()}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              포스트: {card.postId}
            </p>
            <p className="mt-1 text-sm text-gray-500">
              {getMessage()}
            </p>
            {card.status === 'completed' && (
              <button
                onClick={handleGoToResult}
                className="mt-2 text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none focus:underline"
              >
                바로가기
              </button>
            )}
          </div>
          <div className="ml-4 flex-shrink-0 flex">
            <button
              onClick={handleClose}
              className="inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
