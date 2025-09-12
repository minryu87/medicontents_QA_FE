'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './Card';
import config from '@/lib/config';

export default function DebugInfo() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // 개발 환경에서만 표시
    setIsVisible(config.isDevelopment);
  }, []);

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 z-50 bg-yellow-50 border-yellow-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm text-yellow-800">🔧 Debug Info</CardTitle>
      </CardHeader>
      <CardContent className="text-xs text-yellow-700">
        <div className="space-y-1">
          <p><strong>API URL:</strong> {config.apiUrl}</p>
          <p><strong>Environment:</strong> {process.env.NODE_ENV}</p>
          <p><strong>Is Production:</strong> {config.isProduction ? 'Yes' : 'No'}</p>
          <p><strong>App Name:</strong> {config.appName}</p>
        </div>
      </CardContent>
    </Card>
  );
}
