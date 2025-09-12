'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { formatDate, formatDateTime } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Post, PipelineResult } from '@/types/common';

interface ReviewData {
  review_status: 'pending' | 'approved' | 'revision_requested';
  review_notes: string;
  revision_instructions: string;
}

export default function ClientPostReview() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [pipelineResult, setPipelineResult] = useState<PipelineResult | null>(null);
  const [reviewData, setReviewData] = useState<ReviewData>({
    review_status: 'pending',
    review_notes: '',
    revision_instructions: '',
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadReviewData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [postData, pipelineResultData] = await Promise.all([
          clientApi.getPost(postId),
          clientApi.getPipelineResult(postId)
        ]);

        setPost(postData);
        setPipelineResult(pipelineResultData);
      } catch (error) {
        console.error('검토 데이터 로드 실패:', error);
        // 에러 시 null 상태로 설정
        setPost(null);
        setPipelineResult(null);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadReviewData();
    }
  }, [postId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // 실제 API 호출로 검토 결과 제출
      await clientApi.submitReview(postId, reviewData);
      
      // 성공 시 리다이렉트
      router.push('/client/posts');
    } catch (error) {
      console.error('검토 제출 실패:', error);
      alert('검토 제출에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post || !pipelineResult) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">검토할 콘텐츠를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">콘텐츠 검토</h1>
        <p className="text-gray-600">AI가 생성한 콘텐츠를 검토하고 승인 여부를 결정해주세요</p>
      </div>

      {/* 포스트 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>포스트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Post ID</label>
              <p className="mt-1 text-gray-900">{post.post_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">게시 예정일</label>
              <p className="mt-1 text-gray-900">
                {post.publish_date ? formatDate(post.publish_date) : '미정'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">품질 점수</label>
              <p className="mt-1 text-2xl font-bold text-blue-600">
                {pipelineResult.quality_score?.toFixed(1) || '0.0'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">개선률</label>
              <p className="mt-1 text-2xl font-bold text-green-600">
                {pipelineResult.improvement_rate?.toFixed(1) || '0.0'}%
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 콘텐츠 미리보기 */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>생성된 콘텐츠</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* 제목 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">제목</label>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <h2 className="text-xl font-semibold text-gray-900">
                      {pipelineResult.final_title}
                    </h2>
                  </div>
                </div>

                {/* 콘텐츠 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">본문 내용</label>
                  <div className="p-4 bg-gray-50 rounded-lg max-h-96 overflow-y-auto">
                    <div className="prose prose-sm max-w-none">
                      <div className="whitespace-pre-wrap text-gray-800">
                        {pipelineResult.final_content}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 콘텐츠 정보 */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {pipelineResult.final_content?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">본문 글자 수</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {pipelineResult.final_html_content?.length || 0}
                    </div>
                    <div className="text-sm text-gray-600">HTML 크기</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-semibold text-gray-900">
                      {pipelineResult.total_iterations}
                    </div>
                    <div className="text-sm text-gray-600">AI 수정 횟수</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 검토 폼 */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>검토 의견</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* 검토 결과 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">검토 결과</label>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="review_status"
                        value="approved"
                        checked={reviewData.review_status === 'approved'}
                        onChange={(e) => setReviewData(prev => ({ 
                          ...prev, 
                          review_status: e.target.value as 'approved' 
                        }))}
                      />
                      <span className="text-green-700 font-medium">✅ 승인</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="review_status"
                        value="revision_requested"
                        checked={reviewData.review_status === 'revision_requested'}
                        onChange={(e) => setReviewData(prev => ({ 
                          ...prev, 
                          review_status: e.target.value as 'revision_requested' 
                        }))}
                      />
                      <span className="text-orange-700 font-medium">🔄 수정 요청</span>
                    </label>
                  </div>
                </div>

                {/* 수정 지시사항 (수정 요청 시에만 표시) */}
                {reviewData.review_status === 'revision_requested' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      수정 지시사항 *
                    </label>
                    <textarea
                      value={reviewData.revision_instructions}
                      onChange={(e) => setReviewData(prev => ({ 
                        ...prev, 
                        revision_instructions: e.target.value 
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={4}
                      placeholder="수정이 필요한 부분을 구체적으로 설명해주세요."
                      required
                    />
                  </div>
                )}

                {/* 검토 노트 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    검토 노트
                  </label>
                  <textarea
                    value={reviewData.review_notes}
                    onChange={(e) => setReviewData(prev => ({ 
                      ...prev, 
                      review_notes: e.target.value 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    rows={3}
                    placeholder="검토 과정에서의 의견이나 참고사항을 작성해주세요."
                  />
                </div>

                {/* 제출 버튼 */}
                <div className="flex space-x-4 pt-4">
                  <Button 
                    type="submit" 
                    loading={submitting}
                    variant={reviewData.review_status === 'approved' ? 'primary' : 'secondary'}
                    className="flex-1"
                  >
                    {reviewData.review_status === 'approved' ? '승인하기' : '수정 요청하기'}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => router.back()}
                  >
                    취소
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 추가 정보 */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>AI 처리 정보</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">처리 완료:</span>
                  <span className="font-medium">
                    {pipelineResult.pipeline_completed_at 
                      ? formatDateTime(pipelineResult.pipeline_completed_at) 
                      : '미완료'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">AI 반복 수정:</span>
                  <span className="font-medium">{pipelineResult.total_iterations}회</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">최종 품질 점수:</span>
                  <span className="font-medium text-blue-600">
                    {pipelineResult.quality_score?.toFixed(1) || '0.0'}/100
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">개선률:</span>
                  <span className="font-medium text-green-600">
                    {pipelineResult.improvement_rate?.toFixed(1) || '0.0'}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">처리 상태:</span>
                  <Badge variant={pipelineResult.pipeline_status === 'completed' ? 'success' : 'warning'}>
                    {pipelineResult.pipeline_status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
