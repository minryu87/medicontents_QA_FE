import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Medicontents QA
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            의료 콘텐츠 생성 및 관리 시스템
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
          <Link 
            href="/admin"
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                관리자 패널
              </h2>
              <p className="text-gray-600">
                시스템 관리, 포스트 관리, 에이전트 설정
              </p>
            </div>
          </Link>
          
          <Link 
            href="/client"
            className="card hover:shadow-md transition-shadow duration-200"
          >
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">
                클라이언트 패널
              </h2>
              <p className="text-gray-600">
                포스트 생성, 캠페인 관리, 프로필 설정
              </p>
            </div>
          </Link>
        </div>
        
        <div className="mt-12 text-sm text-gray-500">
          <p>© 2024 Medicontents QA. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}