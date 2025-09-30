'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminApi, clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  CheckCircle,
  XCircle,
  Edit,
  Eye,
  FileText,
  AlertTriangle,
  Clock,
  User,
  Calendar,
  Target,
  MessageSquare
} from 'lucide-react';

interface PostData {
  id: number;
  postId: string;
  title: string;
  status: string;
  createdAt: string;
  hospitalName: string;
  medicalService: string;
}

interface ContentData {
  title: string;
  content: string;
  sections: any[];
}

interface EvaluationData {
  seoScore: number;
  legalScore: number;
  seoChecklist: Array<{
    rule: string;
    score: number;
    passed: boolean;
    details: string;
  }>;
  legalChecklist: Array<{
    rule: string;
    score: number;
    passed: boolean;
    details: string;
  }>;
}

interface ReviewSubmission {
  action: 'approve' | 'reject' | 'revision';
  feedback?: string;
  revisionInstructions?: {
    targetSections: string[];
    specificInstructions: string;
  };
}

export default function AdminPostReviewPage() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;

  // 테스트: 페이지 로드 확인
  console.log('🚀 결과 검토 페이지 렌더링 시작, postId:', postId);
  console.log('📋 params:', params);

  const [postData, setPostData] = useState<PostData | null>(null);
  const [contentData, setContentData] = useState<ContentData | null>(null);
  const [evaluationData, setEvaluationData] = useState<EvaluationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [reviewAction, setReviewAction] = useState<'approve' | 'reject' | 'revision' | null>(null);
  const [feedback, setFeedback] = useState('');
  const [revisionInstructions, setRevisionInstructions] = useState('');
  const [selectedSections, setSelectedSections] = useState<string[]>([]);

  // 파이프라인 상태 관련 상태
  const [pipelineStatus, setPipelineStatus] = useState<'running' | 'completed' | 'none' | null>(null);
  const [pipelineRunning, setPipelineRunning] = useState(false);
  const [noPipeline, setNoPipeline] = useState(false);

  useEffect(() => {
    console.log('📋 결과 검토 페이지 마운트, postId:', postId);
    loadPipelineData();
  }, [postId]);

  // 파이프라인 상태 체크 및 데이터 로드
  const loadPipelineData = async () => {
    try {
      console.log('🚀 loadPipelineData 시작');
      setLoading(true);

      // 1. 가장 최근 파이프라인 상태 확인
      console.log('🔍 파이프라인 상태 확인:', postId);
      console.log('🔧 adminApi.getLatestPipelineStatus 존재:', typeof (adminApi as any).getLatestPipelineStatus);

      const pipelineResponse = await (adminApi as any).getLatestPipelineStatus(postId);
      console.log('📊 파이프라인 상태 응답:', pipelineResponse);

      const status = pipelineResponse.status;
      setPipelineStatus(status);

      if (status === 'completed') {
        console.log('✅ 파이프라인이 완료됨 - 데이터 로드 시작');
        // 완료된 파이프라인이 있으면 기존 로직으로 데이터 로드
        await loadPostData();
        console.log('✅ 데이터 로드 완료');
      } else if (status === 'running') {
        // 진행 중인 파이프라인이 있으면 진행 중 메시지 표시
        setPipelineRunning(true);
        // 기본 포스트 정보만 로드
        await loadBasicPostData();
      } else {
        // 파이프라인이 없으면 아직 생성되지 않음 메시지 표시
        setNoPipeline(true);
        // 기본 포스트 정보만 로드
        await loadBasicPostData();
      }

    } catch (error) {
      console.error('Failed to load pipeline data:', error);
      // 에러 시에도 기본 포스트 정보는 표시
      try {
        await loadBasicPostData();
      } catch (basicError) {
        console.error('Failed to load basic post data:', basicError);
      }
    } finally {
      setLoading(false);
    }
  };

  // 기본 포스트 정보만 로드 (파이프라인 상태와 무관)
  const loadBasicPostData = async () => {
    try {
      const postsResponse = await adminApi.getPosts({ search: postId });
      const post = postsResponse.posts.find((p: any) => p.id.toString() === postId || p.post_id === postId);
      if (post) {
        setPostData({
          id: post.id,
          postId: post.post_id,
          title: post.title || '제목 없음',
          status: post.status,
          createdAt: post.created_at,
          hospitalName: '병원명', // TODO: 실제 병원명 조회
          medicalService: '진료과목' // TODO: 실제 진료과목 조회
        });
      }
    } catch (error) {
      console.error('Failed to load basic post data:', error);
    }
  };

  // 완료된 파이프라인의 전체 데이터 로드
  const loadPostData = async () => {
    console.log('📥 loadPostData 시작');
    try {
      // 콘텐츠 데이터
      try {
        console.log('🔄 clientApi.getPostMaterials 호출:', postId);
        const contentResponse = await clientApi.getPostMaterials(postId);
        console.log('📄 콘텐츠 데이터 응답:', contentResponse);
        setContentData(contentResponse);
        console.log('✅ 콘텐츠 데이터 설정 완료');
      } catch (error) {
        console.warn('❌ Content not available:', error);
      }

      // 평가 데이터 (임시로 주석 처리)
      // try {
      //   const evaluationResponse = await adminApi.getPostEvaluation(postId);
      //   setEvaluationData(evaluationResponse);
      // } catch (error) {
      //   console.warn('Evaluation not available:', error);
      // }

      console.log('✅ loadPostData 완료');
    } catch (error) {
      console.error('❌ Failed to load post data:', error);
    }
  };

  const handleReviewSubmit = async () => {
    if (!reviewAction) return;

    try {
      setSubmitting(true);

      const submission: ReviewSubmission = {
        action: reviewAction,
        feedback: feedback || undefined
      };

      if (reviewAction === 'revision') {
        submission.revisionInstructions = {
          targetSections: selectedSections,
          specificInstructions: revisionInstructions
        };
      }

      await adminApi.submitPostReview(postId, submission);

      // 성공 후 리다이렉트
      router.push('/admin/posts');

    } catch (error) {
      console.error('Failed to submit review:', error);
      alert('검토 제출에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'client_review': return 'text-yellow-600 bg-yellow-100';
      case 'admin_approved': return 'text-green-600 bg-green-100';
      case 'published': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'client_review': return '검토 대기';
      case 'admin_approved': return '관리자 승인';
      case 'published': return '게시됨';
      default: return status;
    }
  };

  // 테스트: 로딩 상태에서도 메시지 표시
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">결과 검토 페이지 로딩 중...</h2>
          <p className="text-gray-600">Post ID: {postId}</p>
          <p className="text-sm text-gray-500 mt-4">페이지가 정상적으로 로드되었습니다!</p>
        </div>
      </div>
    );
  }

  if (!postData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">포스트를 찾을 수 없습니다</h2>
          <p className="text-gray-600">존재하지 않는 포스트이거나 접근 권한이 없습니다.</p>
        </div>
      </div>
    );
  }

  // 파이프라인 상태별 UI 표시
  console.log('🎨 UI 렌더링 - pipelineStatus:', pipelineStatus, 'pipelineRunning:', pipelineRunning, 'noPipeline:', noPipeline, 'contentData:', !!contentData);

  if (pipelineRunning) {
    console.log('🔄 진행 중 UI 표시');
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">포스트 검토</h1>
              <p className="text-gray-600">포스트 ID: {postData.postId}</p>
            </div>
          </div>
        </div>

        {/* 포스트 정보 */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">포스트 정보</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(postData.status)}`}>
              {getStatusText(postData.status)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-600">병원:</span>
              <span className="ml-2 font-medium">{postData.hospitalName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-600">생성일:</span>
              <span className="ml-2 font-medium">
                {new Date(postData.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </Card>

        {/* 진행 중 메시지 */}
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <Clock className="w-20 h-20 text-blue-500 mx-auto mb-6 animate-spin" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">생성이 진행 중입니다</h2>
            <p className="text-lg text-gray-600 mb-6">
              AI가 콘텐츠를 생성하고 있습니다. 잠시 후 다시 확인해주세요.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/posts/${postId}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                포스트 상세보기
              </Button>
              <Button
                variant="primary"
                onClick={() => window.location.reload()}
              >
                새로고침
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (noPipeline) {
    console.log('❌ 파이프라인 없음 UI 표시');
    return (
      <div className="container mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">포스트 검토</h1>
              <p className="text-gray-600">포스트 ID: {postData.postId}</p>
            </div>
          </div>
        </div>

        {/* 포스트 정보 */}
        <Card className="p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">포스트 정보</h2>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(postData.status)}`}>
              {getStatusText(postData.status)}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center">
              <User className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-600">병원:</span>
              <span className="ml-2 font-medium">{postData.hospitalName}</span>
            </div>
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-gray-400 mr-2" />
              <span className="text-gray-600">생성일:</span>
              <span className="ml-2 font-medium">
                {new Date(postData.createdAt).toLocaleDateString('ko-KR')}
              </span>
            </div>
          </div>
        </Card>

        {/* 아직 생성되지 않음 메시지 */}
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <FileText className="w-20 h-20 text-gray-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">아직 AI 생성이 진행되지 않았습니다</h2>
            <p className="text-lg text-gray-600 mb-6">
              AI 생성 탭에서 콘텐츠를 생성한 후 결과를 검토할 수 있습니다.
            </p>
            <div className="flex justify-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => router.push(`/admin/posts/${postId}`)}
              >
                <Eye className="w-4 h-4 mr-2" />
                포스트 상세보기
              </Button>
              <Button
                variant="primary"
                onClick={() => router.push(`/admin/hospital-work`)}
              >
                <Target className="w-4 h-4 mr-2" />
                AI 생성하기
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log('📋 기본 콘텐츠 UI 표시');
  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">포스트 검토</h1>
            <p className="text-gray-600">포스트 ID: {postData.postId}</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="secondary"
              onClick={() => router.push(`/admin/posts/${postId}`)}
            >
              <Eye className="w-4 h-4 mr-2" />
              상세보기
            </Button>
            <Button
              variant="secondary"
              onClick={() => router.push(`/admin/posts/${postId}/edit`)}
            >
              <Edit className="w-4 h-4 mr-2" />
              직접 수정
            </Button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 메인 콘텐츠 영역 */}
        <div className="lg:col-span-2 space-y-6">
          {/* 포스트 정보 */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">포스트 정보</h2>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(postData.status)}`}>
                {getStatusText(postData.status)}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="flex items-center">
                <User className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">병원:</span>
                <span className="ml-2 font-medium">{postData.hospitalName}</span>
              </div>
              <div className="flex items-center">
                <FileText className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">진료과목:</span>
                <span className="ml-2 font-medium">{postData.medicalService}</span>
              </div>
              <div className="flex items-center">
                <Calendar className="w-5 h-5 text-gray-400 mr-2" />
                <span className="text-gray-600">생성일:</span>
                <span className="ml-2 font-medium">
                  {new Date(postData.createdAt).toLocaleDateString('ko-KR')}
                </span>
              </div>
            </div>

            <div>
              <h3 className="font-medium text-gray-900 mb-2">제목</h3>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{postData.title}</p>
            </div>
          </Card>

          {/* 생성된 콘텐츠 */}
          {contentData && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">생성된 콘텐츠</h2>

              <div className="space-y-4">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">최종 제목</h3>
                  <p className="text-gray-700 bg-gray-50 p-3 rounded-lg font-medium">
                    {contentData.title}
                  </p>
                </div>

                <div>
                  <h3 className="font-medium text-gray-900 mb-2">콘텐츠 내용</h3>
                  <div className="bg-gray-50 p-4 rounded-lg max-h-96 overflow-y-auto">
                    <div
                      className="prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{ __html: contentData.content }}
                    />
                  </div>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* 사이드바 */}
        <div className="space-y-6">
          {/* 평가 결과 */}
          {evaluationData && (
            <Card className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">품질 평가</h2>

              <div className="space-y-4">
                {/* 점수 표시 */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Target className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-blue-600">
                      {evaluationData.seoScore}
                    </div>
                    <div className="text-sm text-blue-600">SEO 점수</div>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                    <div className="text-2xl font-bold text-green-600">
                      {evaluationData.legalScore}
                    </div>
                    <div className="text-sm text-green-600">의료법 점수</div>
                  </div>
                </div>

                {/* 체크리스트 요약 */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">SEO 체크리스트</h3>
                    <div className="space-y-1">
                      {evaluationData.seoChecklist.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{item.rule}</span>
                          <span className={`font-medium ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {item.passed ? '✓' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-medium text-gray-900 mb-2">의료법 체크리스트</h3>
                    <div className="space-y-1">
                      {evaluationData.legalChecklist.slice(0, 3).map((item, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 truncate">{item.rule}</span>
                          <span className={`font-medium ${item.passed ? 'text-green-600' : 'text-red-600'}`}>
                            {item.passed ? '✓' : '✗'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* 검토 액션 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">검토 액션</h2>

            {!reviewAction ? (
              <div className="space-y-3">
                <Button
                  variant="primary"
                  className="w-full"
                  onClick={() => setReviewAction('approve')}
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  승인하기
                </Button>
                <Button
                  variant="secondary"
                  className="w-full"
                  onClick={() => setReviewAction('revision')}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  수정 요청
                </Button>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setReviewAction('reject')}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  거부하기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    {reviewAction === 'approve' && '승인하기'}
                    {reviewAction === 'revision' && '수정 요청'}
                    {reviewAction === 'reject' && '거부하기'}
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setReviewAction(null);
                      setFeedback('');
                      setRevisionInstructions('');
                      setSelectedSections([]);
                    }}
                  >
                    취소
                  </Button>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    검토 의견 (선택사항)
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                    rows={3}
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="검토 의견을 입력하세요..."
                  />
                </div>

                {reviewAction === 'revision' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        수정 지시사항
                      </label>
                      <textarea
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                        rows={4}
                        value={revisionInstructions}
                        onChange={(e) => setRevisionInstructions(e.target.value)}
                        placeholder="구체적인 수정 지시사항을 입력하세요..."
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        대상 섹션 (선택사항)
                      </label>
                      <div className="space-y-2">
                        {['제목', '서론', '본론', '결론', 'SEO 최적화'].map((section) => (
                          <label key={section} className="flex items-center">
                            <input
                              type="checkbox"
                              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                              checked={selectedSections.includes(section)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedSections([...selectedSections, section]);
                                } else {
                                  setSelectedSections(selectedSections.filter(s => s !== section));
                                }
                              }}
                            />
                            <span className="ml-2 text-sm text-gray-700">{section}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleReviewSubmit}
                  disabled={submitting || (reviewAction === 'revision' && !revisionInstructions.trim())}
                >
                  {submitting ? (
                    <>
                      <Clock className="w-4 h-4 mr-2 animate-spin" />
                      처리중...
                    </>
                  ) : (
                    <>
                      <MessageSquare className="w-4 h-4 mr-2" />
                      검토 제출
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
