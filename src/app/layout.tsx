import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import DebugInfo from '@/components/ui/DebugInfo';

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
        <div className="min-h-screen bg-gray-50">
          {children}
          <DebugInfo />
        </div>
      </body>
    </html>
  );
}