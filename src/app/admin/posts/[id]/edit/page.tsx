'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { adminApi } from '@/services/api';
import type { Post, PipelineResult } from '@/types/common';

interface EditData {
  title: string;
  content: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  compliance: {
    score: number;
    issues: string[];
  };
}

export default function AdminPostEdit() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [editData, setEditData] = useState<EditData>({
    title: '',
    content: '',
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: []
    },
    compliance: {
      score: 0,
      issues: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [postData, pipelineData] = await Promise.all([
          adminApi.getPost(postId),
          adminApi.getPipelineResult(postId).catch(() => null)
        ]);

        setPost(postData);
        setPipelineResult(pipelineData);

        // 초기 데이터 설정
        if (pipelineData) {
          setEditData({
            title: pipelineData.final_title || '',
            content: pipelineData.final_content || '',
            seo: {
              metaTitle: pipelineData.final_title || '',
              metaDescription: (pipelineData.final_content || '').substring(0, 160),
              keywords: []
            },
            compliance: {
              score: pipelineData.quality_score || 0,
              issues: []
            }
          });
        }
      } catch (error) {
        console.error('데이터 로드 실패:', error);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadData();
    }
  }, [postId]);

  const handleSave = async () => {
    setSaving(true);
    try {
      // 저장 API 호출 (아직 구현되지 않음)
      console.log('저장 데이터:', editData);
      alert('저장 기능은 아직 구현되지 않았습니다.');
    } catch (error) {
      console.error('저장 실패:', error);
      alert('저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handlePreview = () => {
    // 미리보기 모달 또는 새 창으로 열기
    const previewWindow = window.open('', '_blank');
    if (previewWindow) {
      previewWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${editData.title}</title>
            <meta name="description" content="${editData.seo.metaDescription}">
            <style>
              body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
              h1 { color: #333; }
              p { line-height: 1.6; }
            </style>
          </head>
          <body>
            <h1>${editData.title}</h1>
            <div>${editData.content.replace(/\n/g, '<br>')}</div>
          </body>
        </html>
      `);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">포스트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">포스트 직접 수정</h1>
            <p className="text-gray-600">Post ID: {post.post_id}</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" onClick={() => router.back()}>
              돌아가기
            </Button>
            <Button variant="outline" onClick={handlePreview}>
              미리보기
            </Button>
            <Button onClick={handleSave} loading={saving}>
              저장
            </Button>
          </div>
        </div>
      </div>

      {/* 메인 에디터 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="content">콘텐츠 편집</TabsTrigger>
          <TabsTrigger value="seo">SEO 최적화</TabsTrigger>
          <TabsTrigger value="compliance">의료법 준수</TabsTrigger>
          <TabsTrigger value="preview">실시간 미리보기</TabsTrigger>
        </TabsList>

        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>제목</CardTitle>
            </CardHeader>
            <CardContent>
              <input
                type="text"
                value={editData.title}
                onChange={(e) => setEditData(prev => ({ ...prev, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="포스트 제목을 입력하세요"
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>본문 내용</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={editData.content}
                onChange={(e) => setEditData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-96"
                placeholder="포스트 본문을 입력하세요"
                rows={20}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="seo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>SEO 메타 정보</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메타 제목 (Meta Title)
                </label>
                <input
                  type="text"
                  value={editData.seo.metaTitle}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaTitle: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="검색 결과에 표시될 제목"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {editData.seo.metaTitle.length}/60자 (권장)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  메타 설명 (Meta Description)
                </label>
                <textarea
                  value={editData.seo.metaDescription}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    seo: { ...prev.seo, metaDescription: e.target.value }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="검색 결과에 표시될 설명"
                  rows={3}
                />
                <p className="text-sm text-gray-500 mt-1">
                  {editData.seo.metaDescription.length}/160자 (권장)
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  키워드
                </label>
                <input
                  type="text"
                  value={editData.seo.keywords.join(', ')}
                  onChange={(e) => setEditData(prev => ({
                    ...prev,
                    seo: {
                      ...prev.seo,
                      keywords: e.target.value.split(',').map(k => k.trim()).filter(k => k)
                    }
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="쉼표로 구분하여 키워드를 입력하세요"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>SEO 분석 결과</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">제목 최적화</span>
                  <Badge variant="success">양호</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">메타 설명</span>
                  <Badge variant="warning">개선 필요</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">키워드 밀도</span>
                  <Badge variant="success">적절</Badge>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">읽기 시간</span>
                  <span className="text-sm text-gray-600">약 3분</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>의료법 준수 검사</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold">전체 준수 점수</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-3">
                      <div
                        className="bg-green-600 h-3 rounded-full"
                        style={{ width: `${editData.compliance.score}%` }}
                      ></div>
                    </div>
                    <span className="font-bold text-lg">{editData.compliance.score}/100</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">준수 항목</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">과대광고 금지</span>
                      <Badge variant="success">준수</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded">
                      <span className="text-sm">비교 광고 제한</span>
                      <Badge variant="success">준수</Badge>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-yellow-50 rounded">
                      <span className="text-sm">효과 보증 문구</span>
                      <Badge variant="warning">주의</Badge>
                    </div>
                  </div>
                </div>

                {editData.compliance.issues.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-red-600">개선 필요 사항</h4>
                    <ul className="space-y-1">
                      {editData.compliance.issues.map((issue, index) => (
                        <li key={index} className="text-sm text-red-600 flex items-start">
                          <span className="mr-2">•</span>
                          {issue}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>실시간 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-6 bg-white">
                <h1 className="text-3xl font-bold mb-4">{editData.title || '제목 없음'}</h1>
                <div className="prose max-w-none">
                  {editData.content ? (
                    <div className="whitespace-pre-wrap text-gray-700">
                      {editData.content}
                    </div>
                  ) : (
                    <p className="text-gray-500 italic">본문 내용이 없습니다.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
