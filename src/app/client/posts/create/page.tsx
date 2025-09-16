'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';

export default function ClientCreatePost() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleContactAdmin = async () => {
    setLoading(true);
    try {
      // TODO: 어드민에게 포스트 생성 요청 알림 전송
      alert('어드민에게 새 포스트 생성 요청이 전송되었습니다.');
      router.push('/client/posts');
    } catch (error) {
      console.error('요청 전송 실패:', error);
      alert('요청 전송에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 포스트 요청</h1>
        <p className="text-gray-600">새로운 포스트 생성을 요청하세요</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>포스트 생성 요청</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">포스트 생성 프로세스</h3>
              <ol className="text-sm text-blue-800 space-y-1">
                <li>1. 어드민이 캠페인을 생성하고 포스트를 할당합니다</li>
                <li>2. 병원에서 치료 사례 자료를 제공합니다</li>
                <li>3. AI가 자동으로 콘텐츠를 생성합니다</li>
                <li>4. 병원에서 생성된 콘텐츠를 검토하고 승인합니다</li>
                <li>5. 최종 승인 후 게시됩니다</li>
              </ol>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg">
              <h3 className="font-medium text-yellow-900 mb-2">참고사항</h3>
              <ul className="text-sm text-yellow-800 space-y-1">
                <li>• 포스트 생성은 어드민이 직접 수행합니다</li>
                <li>• 캠페인과 연결된 포스트가 우선적으로 생성됩니다</li>
                <li>• 생성 요청 후 1-2일 내에 포스트가 할당됩니다</li>
              </ul>
            </div>

            <div className="text-center pt-4">
              <Button onClick={handleContactAdmin} loading={loading} size="lg">
                어드민에게 포스트 생성 요청
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
