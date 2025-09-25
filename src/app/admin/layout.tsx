'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const adminNavigation = [
  { name: '대시보드', href: '/admin', icon: '🏠' },
  { name: '병원별 작업 관리', href: '/admin/hospital-work', icon: '🏥' },
  { name: '포스트 관리', href: '/admin/posts', icon: '📝' },
  { name: '캠페인 관리', href: '/admin/campaigns', icon: '📋' },
  { name: '플랫폼 관리', href: '/admin/platforms', icon: '🌐' },
  { name: '병원 관리', href: '/admin/hospitals', icon: '🏥' },
  {
    name: 'AI 에이전트',
    href: '#',
    icon: '🤖',
    children: [
      { name: '모니터링', href: '/admin/agents' },
      { name: '성능 분석', href: '/admin/agents/performance' },
      { name: '프롬프트 관리', href: '/admin/agents/prompts' },
      { name: '체크리스트', href: '/admin/agents/checklists' },
    ]
  },
  { name: '데이터베이스 관리', href: '/admin/database', icon: '🗄️' },
  {
    name: '시스템 관리',
    href: '#',
    icon: '⚙️',
    children: [
      { name: '시스템 로그', href: '/admin/system/logs' },
      { name: '사용자 관리', href: '/admin/system/users' },
      { name: '시스템 상태', href: '/admin/system/health' },
      { name: '분석 및 보고', href: '/admin/analytics' },
    ]
  },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleMenu = (menuName: string) => {
    const newExpanded = new Set(expandedMenus);
    if (newExpanded.has(menuName)) {
      newExpanded.delete(menuName);
    } else {
      newExpanded.add(menuName);
    }
    setExpandedMenus(newExpanded);
  };

  const isMenuExpanded = (menuName: string) => expandedMenus.has(menuName);

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
              <Link href="/admin" className="flex items-center space-x-2">
                <span className="text-xl font-bold text-primary-600">Medicontents QA</span>
                <span className="text-sm bg-primary-100 text-primary-800 px-2 py-1 rounded">관리자</span>
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <button className="text-gray-500 hover:text-gray-700">
                🔔
              </button>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">관리자</span>
                </div>
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
              {adminNavigation.map((item) => (
                <li key={item.name}>
                  {item.children ? (
                    <div>
                      <button
                        onClick={() => toggleMenu(item.name)}
                        className={cn(
                          'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors w-full text-left',
                          'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                          isSidebarCollapsed && 'justify-center px-2'
                        )}
                        title={isSidebarCollapsed ? item.name : undefined}
                      >
                        <span className="flex-shrink-0">{item.icon}</span>
                        {!isSidebarCollapsed && (
                          <>
                            <span className="ml-3">{item.name}</span>
                            <span className="ml-auto">
                              {isMenuExpanded(item.name) ? '▼' : '▶'}
                            </span>
                          </>
                        )}
                      </button>
                      {isMenuExpanded(item.name) && !isSidebarCollapsed && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {item.children.map((child) => (
                            <li key={child.name}>
                              <Link
                                href={child.href}
                                className={cn(
                                  'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                                  pathname === child.href
                                    ? 'bg-primary-100 text-primary-700'
                                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                                )}
                              >
                                {child.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      href={item.href}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
                        pathname === item.href
                          ? 'bg-primary-100 text-primary-700'
                          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                        isSidebarCollapsed && 'justify-center px-2'
                      )}
                      title={isSidebarCollapsed ? item.name : undefined}
                    >
                      <span className="flex-shrink-0">{item.icon}</span>
                      {!isSidebarCollapsed && <span className="ml-3">{item.name}</span>}
                    </Link>
                  )}
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
