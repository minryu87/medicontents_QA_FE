import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import dynamic from 'next/dynamic';
import './globals.css';
import DebugInfo from '@/components/shared/DebugInfo';

// 클라이언트 사이드에서만 로드되는 컴포넌트들
const WebSocketProvider = dynamic(
  () => import('@/contexts/WebSocketContext').then(mod => ({ default: mod.WebSocketProvider })),
  { ssr: false }
);

const WebSocketStatusIndicator = dynamic(
  () => import('@/contexts/WebSocketContext').then(mod => ({ default: mod.WebSocketStatusIndicator })),
  { ssr: false }
);

const NotificationProvider = dynamic(
  () => import('@/components/shared/NotificationProvider').then(mod => ({ default: mod.NotificationProvider })),
  { ssr: false }
);

const NotificationTester = dynamic(
  () => import('@/components/shared/NotificationProvider').then(mod => ({ default: mod.NotificationTester })),
  { ssr: false }
);

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Medicontents QA',
  description: '의료 콘텐츠 생성 및 관리 시스템',
  keywords: ['의료', '콘텐츠', 'AI', '치과'],
  authors: [{ name: 'Medicontents Team' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <WebSocketProvider autoConnect={true}>
          <NotificationProvider>
            <div className="min-h-screen bg-gray-50">
              {children}
              <DebugInfo />
              <WebSocketStatusIndicator />
              <NotificationTester />
            </div>
          </NotificationProvider>
        </WebSocketProvider>
      </body>
    </html>
  );
}