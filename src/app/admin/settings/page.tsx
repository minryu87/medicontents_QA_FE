'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import Button from '@/components/shared/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/shared/Tabs';
import { formatDate } from '@/lib/utils';

interface SystemStats {
  total_posts: number;
  total_hospitals: number;
  total_campaigns: number;
  total_medical_services: number;
  total_persona_styles: number;
  total_clinical_contexts: number;
}

interface PromptInfo {
  id: number;
  agent_type: string;
  prompt_name: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

interface ChecklistInfo {
  id: number;
  checklist_type: string;
  version: string;
  is_active: boolean;
  created_at: string;
}

export default function AdminSettings() {
  const [systemStats, setSystemStats] = useState<SystemStats>({
    total_posts: 0,
    total_hospitals: 0,
    total_campaigns: 0,
    total_medical_services: 0,
    total_persona_styles: 0,
    total_clinical_contexts: 0,
  });
  const [prompts, setPrompts] = useState<PromptInfo[]>([]);
  const [checklists, setChecklists] = useState<ChecklistInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettingsData = async () => {
      try {
        setLoading(true);
        
        // 시스템 통계 로드
        const [
          postsResponse,
          hospitalsResponse,
          campaignsResponse,
          servicesResponse,
          personasResponse,
          contextsResponse
        ] = await Promise.all([
          fetch('/api/v1/admin/posts').then(res => res.json()),
          fetch('/api/v1/hospitals/').then(res => res.json()),
          fetch('/api/v1/campaigns/').then(res => res.json()),
          fetch('/api/v1/medical-services/').then(res => res.json()),
          fetch('/api/v1/persona-styles/').then(res => res.json()),
          fetch('/api/v1/clinical-contexts/').then(res => res.json())
        ]);

        setSystemStats({
          total_posts: postsResponse.posts?.length || 0,
          total_hospitals: hospitalsResponse.hospitals?.length || 0,
          total_campaigns: campaignsResponse.campaigns?.length || 0,
          total_medical_services: servicesResponse.total || 0,
          total_persona_styles: personasResponse.total || 0,
          total_clinical_contexts: contextsResponse.total || 0,
        });

        // 프롬프트 및 체크리스트 정보 로드 (구현 필요)
        // setPrompts(promptsData);
        // setChecklists(checklistsData);
        
      } catch (error) {
        console.error('설정 데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSettingsData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">시스템 설정</h1>
        <p className="text-gray-600">시스템 전반의 설정을 관리하세요</p>
      </div>

      {/* 시스템 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">포스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_posts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">병원</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_hospitals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">캠페인</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_campaigns}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">진료 서비스</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_medical_services}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">페르소나</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_persona_styles}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">임상 컨텍스트</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.total_clinical_contexts}</div>
          </CardContent>
        </Card>
      </div>

      {/* 설정 탭 */}
      <Tabs defaultValue="system" className="space-y-4">
        <TabsList>
          <TabsTrigger value="system">시스템 관리</TabsTrigger>
          <TabsTrigger value="data">기본 데이터</TabsTrigger>
          <TabsTrigger value="prompts">프롬프트 관리</TabsTrigger>
          <TabsTrigger value="checklists">체크리스트 관리</TabsTrigger>
        </TabsList>

        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>시스템 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">데이터 관리</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📊 데이터베이스 백업
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🔄 캐시 초기화
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📋 로그 정리
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🧹 임시 데이터 정리
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">시스템 모니터링</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📈 성능 리포트
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🔍 시스템 상태 확인
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📊 사용량 통계
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      ⚠️ 에러 로그 확인
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>기본 데이터 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">진료 데이터</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">진료 서비스</p>
                        <p className="text-sm text-gray-600">{systemStats.total_medical_services}개</p>
                      </div>
                      <Button size="sm" variant="outline">관리</Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">페르소나 스타일</p>
                        <p className="text-sm text-gray-600">{systemStats.total_persona_styles}개</p>
                      </div>
                      <Button size="sm" variant="outline">관리</Button>
                    </div>
                    <div className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">임상 컨텍스트</p>
                        <p className="text-sm text-gray-600">{systemStats.total_clinical_contexts}개</p>
                      </div>
                      <Button size="sm" variant="outline">관리</Button>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">데이터 작업</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full justify-start">
                      📥 데이터 가져오기
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      📤 데이터 내보내기
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🔄 데이터 동기화
                    </Button>
                    <Button variant="outline" className="w-full justify-start">
                      🔧 데이터 정리
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prompts">
          <Card>
            <CardHeader>
              <CardTitle>프롬프트 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">AI 에이전트별 프롬프트를 관리합니다</p>
                  <Button>새 프롬프트 추가</Button>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  프롬프트 관리 기능은 개발 중입니다.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="checklists">
          <Card>
            <CardHeader>
              <CardTitle>평가 체크리스트 관리</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <p className="text-gray-600">SEO/Legal/Medical 평가 체크리스트를 관리합니다</p>
                  <Button>새 체크리스트 추가</Button>
                </div>
                
                <div className="text-center py-12 text-gray-500">
                  체크리스트 관리 기능은 개발 중입니다.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
