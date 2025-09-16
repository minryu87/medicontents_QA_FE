'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';

interface Post {
  post_id: string;
  title?: string;
  status: string;
}

interface ContentResults {
  title: string;
  assembled_html: string;
  sections: any[];
}

interface EvaluationResults {
  seo_score: number;
  medical_score: number;
  seo_checklist: any[];
  medical_checklist: any[];
}

export default function PostReviewPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [content, setContent] = useState<ContentResults | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [reviewData, setReviewData] = useState({
    review_status: 'pending' as 'approved' | 'revision_requested',
    review_notes: '',
    revision_instructions: ''
  });

  useEffect(() => {
    if (params.id) {
      loadReviewData(params.id as string);
    }
  }, [params.id]);

  const loadReviewData = async (postId: string) => {
    try {
      const [postData, contentData, evalData] = await Promise.all([
        clientApi.getPost(postId),
        clientApi.getContentResults(postId),
        clientApi.getEvaluationResults(postId)
      ]);

      setPost(postData);
      setContent(contentData);
      setEvaluation(evalData);
    } catch (error) {
      console.error('Error loading review data:', error);
      router.push('/client/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!post) return;

    try {
      setSubmitting(true);
      await clientApi.submitReview(post.post_id, reviewData);
      alert('검토가 완료되었습니다!');
      router.push('/client/posts');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('검토 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  if (!post || !content || !evaluation) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">데이터를 불러올 수 없습니다</h2>
          <Button onClick={() => router.push('/client/posts')}>목록으로</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">콘텐츠 검토</h1>
        <p className="text-gray-600 mt-2">AI 생성 콘텐츠를 검토하고 승인 또는 수정 요청을 해주세요</p>
      </div>

      {/* Post Info */}
      <Card className="p-6 mb-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-sm text-gray-600">Post ID</p>
            <p className="font-medium">{post.post_id}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">제목</p>
            <p className="font-medium">{content.title}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">SEO 점수</p>
            <p className="font-medium text-blue-600">{evaluation.seo_score}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">의료법 점수</p>
            <p className="font-medium text-green-600">{evaluation.medical_score}</p>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Content Preview */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">콘텐츠 미리보기</h2>
            <div
              className="prose prose-sm max-w-none border rounded p-4 bg-gray-50"
              dangerouslySetInnerHTML={{ __html: content.assembled_html }}
            />
          </Card>
        </div>

        {/* Evaluation & Review */}
        <div className="space-y-6">
          {/* SEO Evaluation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">SEO 평가 결과</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-blue-600">{evaluation.seo_score}</div>
              <div className="text-sm text-gray-600">점수</div>
            </div>
            <div className="space-y-2">
              {evaluation.seo_checklist?.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className={`font-medium ${item.score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.score}/5
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Medical Evaluation */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">의료법 평가 결과</h3>
            <div className="text-center mb-4">
              <div className="text-3xl font-bold text-green-600">{evaluation.medical_score}</div>
              <div className="text-sm text-gray-600">점수</div>
            </div>
            <div className="space-y-2">
              {evaluation.medical_checklist?.slice(0, 5).map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <span className="truncate">{item.name}</span>
                  <span className={`font-medium ${item.score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.score}/5
                  </span>
                </div>
              ))}
            </div>
          </Card>

          {/* Review Form */}
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">검토 의견</h3>
            <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">검토 결과</label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="approved"
                      checked={reviewData.review_status === 'approved'}
                      onChange={(e) => setReviewData(prev => ({
                        ...prev,
                        review_status: e.target.value as 'approved' | 'revision_requested'
                      }))}
                      className="mr-2"
                    />
                    <span className="text-green-600 font-medium">승인</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="status"
                      value="revision_requested"
                      checked={reviewData.review_status === 'revision_requested'}
                      onChange={(e) => setReviewData(prev => ({
                        ...prev,
                        review_status: e.target.value as 'approved' | 'revision_requested'
                      }))}
                      className="mr-2"
                    />
                    <span className="text-orange-600 font-medium">수정 요청</span>
                  </label>
                </div>
              </div>

              {reviewData.review_status === 'revision_requested' && (
                <div>
                  <label className="block text-sm font-medium mb-2">수정 지시사항</label>
                  <textarea
                    className="w-full p-3 border rounded"
                    rows={4}
                    placeholder="수정이 필요한 부분을 구체적으로 설명해주세요."
                    value={reviewData.revision_instructions}
                    onChange={(e) => setReviewData(prev => ({
                      ...prev,
                      revision_instructions: e.target.value
                    }))}
                    required
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-2">검토 노트</label>
                <textarea
                  className="w-full p-3 border rounded"
                  rows={3}
                  placeholder="검토 과정에서의 의견이나 참고사항을 작성해주세요."
                  value={reviewData.review_notes}
                  onChange={(e) => setReviewData(prev => ({
                    ...prev,
                    review_notes: e.target.value
                  }))}
                />
              </div>

              <div className="flex gap-3">
                <Button type="submit" disabled={submitting} className="flex-1">
                  {submitting ? '제출 중...' : reviewData.review_status === 'approved' ? '승인' : '수정 요청'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => router.push('/client/posts')}
                >
                  취소
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}