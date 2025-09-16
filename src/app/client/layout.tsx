'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const clientNavigation = [
  { name: '대시보드', href: '/client', icon: '🏠' },
  { name: '포스트 관리', href: '/client/posts', icon: '📝' },
  { name: '캠페인 현황', href: '/client/campaigns', icon: '📋' },
  { name: '성과 분석', href: '/client/analytics', icon: '📊' },
  { name: '프로필 관리', href: '/client/profile', icon: '👤' },
  { name: '알림', href: '/client/notifications', icon: '🔔' },
];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 상단 네비게이션 */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                title={isSidebarCollapsed ? "사이드바 펼치기" : "사이드바 접기"}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d={isSidebarCollapsed ? "M13 5l7 7-7 7M5 5l7 7-7 7" : "M11 19l-7-7 7-7M19 19l-7-7 7-7"}
                  />
                </svg>
              </button>
              <Link href="/client" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary-600">Medicontents QA</span>
                <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">클라이언트</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700 relative">
                🔔
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  2
                </span>
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">내</span>
                </div>
                <span className="text-sm font-medium text-gray-700">내이튼치과의원</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* 사이드바 */}
        <aside className={cn(
          "bg-white shadow-sm transition-all duration-300 ease-in-out",
          isSidebarCollapsed ? "w-16" : "w-64"
        )}>
          <nav className="mt-8 px-2">
            <ul className="space-y-2">
              {clientNavigation.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                      pathname === item.href
                        ? 'bg-green-100 text-green-700'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                      isSidebarCollapsed && 'justify-center px-2'
                    )}
                    title={isSidebarCollapsed ? item.name : undefined}
                  >
                    <span className="flex-shrink-0">{item.icon}</span>
                    {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* 메인 콘텐츠 */}
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
