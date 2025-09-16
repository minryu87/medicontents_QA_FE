'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { Tabs } from '@/components/shared/Tabs';
import type { Post as BasePost } from '@/types/common';

interface Post extends BasePost {
  medical_service?: {
    category: string;
    treatment: string;
  };
  campaign?: {
    id: number;
    name: string;
  };
  seo_score?: number;
  legal_score?: number;
}

interface Materials {
  concept_message?: string;
  patient_condition?: string;
  treatment_process_message?: string;
  treatment_result_message?: string;
  additional_message?: string;
  before_images?: string[];
  process_images?: string[];
  after_images?: string[];
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

interface AgentLog {
  agent_type: string;
  execution_status: string;
  created_at: string;
  execution_time?: number;
  error_message?: string;
}

interface Review {
  id: number;
  review_status: string;
  review_notes?: string;
  revision_instructions?: string;
  reviewed_at: string;
}

export default function PostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [materials, setMaterials] = useState<Materials | null>(null);
  const [content, setContent] = useState<ContentResults | null>(null);
  const [evaluation, setEvaluation] = useState<EvaluationResults | null>(null);
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  useEffect(() => {
    if (params.id) {
      loadPostDetail(params.id as string);
    }
  }, [params.id]);

  const loadPostDetail = async (postId: string) => {
    try {
      const [
        postData,
        materialsData,
        contentData,
        evalData,
        logsData,
        reviewsData
      ] = await Promise.all([
        clientApi.getPost(postId),
        clientApi.getPostMaterials(postId),
        clientApi.getContentResults(postId),
        clientApi.getEvaluationResults(postId),
        clientApi.getAgentExecutionLogs(postId),
        clientApi.getPostReviews(postId)
      ]);

      setPost(postData as Post);
      setMaterials(materialsData);
      setContent(contentData);
      setEvaluation(evalData);
      setAgentLogs(logsData);
      setReviews(reviewsData);
    } catch (error) {
      console.error('Error loading post detail:', error);
      router.push('/client/posts');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'initial': 'bg-gray-100 text-gray-800',
      'hospital_completed': 'bg-blue-100 text-blue-800',
      'agent_processing': 'bg-yellow-100 text-yellow-800',
      'agent_completed': 'bg-purple-100 text-purple-800',
      'client_review': 'bg-indigo-100 text-indigo-800',
      'client_approved': 'bg-teal-100 text-teal-800',
      'published': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts: { [key: string]: string } = {
      'initial': '자료 대기',
      'hospital_completed': '자료 완료',
      'agent_processing': 'AI 처리 중',
      'agent_completed': 'AI 처리 완료',
      'client_review': '검토 필요',
      'client_approved': '승인됨',
      'published': '게시됨'
    };
    return texts[status] || status;
  };

  const getAgentStatusColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'pending': 'bg-gray-100 text-gray-800',
      'running': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'failed': 'bg-red-100 text-red-800',
      'timeout': 'bg-orange-100 text-orange-800',
      'cancelled': 'bg-yellow-100 text-yellow-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
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

  if (!post) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">포스트를 찾을 수 없습니다</h2>
          <Link href="/client/posts">
            <Button>목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold">
              {content?.title || post.title || `포스트 ${post.post_id}`}
            </h1>
            <p className="text-gray-600 mt-2">Post ID: {post.post_id}</p>
          </div>
          <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(post.status)}`}>
            {getStatusText(post.status)}
          </span>
        </div>

        {/* Post Meta */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {post.medical_service && (
            <div>
              <p className="text-sm text-gray-600">진료 정보</p>
              <p className="font-medium">{post.medical_service.category}</p>
              <p className="text-sm text-gray-600">{post.medical_service.treatment}</p>
            </div>
          )}
          {post.campaign && (
            <div>
              <p className="text-sm text-gray-600">캠페인</p>
              <p className="font-medium">{post.campaign.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm text-gray-600">생성일</p>
            <p className="font-medium">
              {new Date(post.created_at).toLocaleDateString('ko-KR')}
            </p>
          </div>
          {(post.seo_score || post.legal_score) && (
            <div>
              <p className="text-sm text-gray-600">평가 점수</p>
              <div className="flex gap-4">
                {post.seo_score && (
                  <span className="text-blue-600 font-medium">SEO: {post.seo_score}</span>
                )}
                {post.legal_score && (
                  <span className="text-green-600 font-medium">Legal: {post.legal_score}</span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Link href="/client/posts">
            <Button variant="secondary">목록으로</Button>
          </Link>
          {post.status === 'initial' && (
            <Link href={`/client/materials/${post.post_id}`}>
              <Button>자료 제공</Button>
            </Link>
          )}
          {post.status === 'client_review' && (
            <Link href={`/client/posts/${post.post_id}/review`}>
              <Button>검토하기</Button>
            </Link>
          )}
        </div>
      </div>

      {/* Content Tabs */}
      <div className="bg-white rounded-lg shadow">
        <div className="border-b border-gray-200">
          <nav className="flex">
            {[
              { key: 'content', label: '콘텐츠' },
              { key: 'materials', label: '제공 자료' },
              { key: 'logs', label: '처리 로그' },
              { key: 'reviews', label: '검토 내역' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Content Tab */}
          {activeTab === 'content' && (
            <div className="space-y-6">
              {content ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4">생성된 콘텐츠</h3>
                  <div
                    className="prose prose-sm max-w-none border rounded p-4 bg-gray-50"
                    dangerouslySetInnerHTML={{ __html: content.assembled_html }}
                  />
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">콘텐츠가 아직 생성되지 않았습니다.</p>
              )}

              {evaluation && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">SEO 평가 결과</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-2">{evaluation.seo_score}</div>
                    <div className="space-y-1">
                      {evaluation.seo_checklist?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{item.name}</span>
                          <span className={`font-medium ${item.score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.score}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card className="p-4">
                    <h4 className="font-semibold mb-3">의료법 평가 결과</h4>
                    <div className="text-2xl font-bold text-green-600 mb-2">{evaluation.medical_score}</div>
                    <div className="space-y-1">
                      {evaluation.medical_checklist?.slice(0, 3).map((item: any, index: number) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="truncate">{item.name}</span>
                          <span className={`font-medium ${item.score >= 3 ? 'text-green-600' : 'text-red-600'}`}>
                            {item.score}/5
                          </span>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              )}
            </div>
          )}

          {/* Materials Tab */}
          {activeTab === 'materials' && (
            <div className="space-y-6">
              {materials ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">콘텐츠 메시지</h4>
                      {materials.concept_message && (
                        <p className="text-sm text-gray-700">{materials.concept_message}</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">환자 상태</h4>
                      {materials.patient_condition && (
                        <p className="text-sm text-gray-700">{materials.patient_condition}</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">치료 과정</h4>
                      {materials.treatment_process_message && (
                        <p className="text-sm text-gray-700">{materials.treatment_process_message}</p>
                      )}
                    </Card>

                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">치료 결과</h4>
                      {materials.treatment_result_message && (
                        <p className="text-sm text-gray-700">{materials.treatment_result_message}</p>
                      )}
                    </Card>

                    {materials.additional_message && (
                      <Card className="p-4">
                        <h4 className="font-semibold mb-3">추가 메시지</h4>
                        <p className="text-sm text-gray-700">{materials.additional_message}</p>
                      </Card>
                    )}
                  </div>

                  <div className="space-y-4">
                    <Card className="p-4">
                      <h4 className="font-semibold mb-3">이미지</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {materials.before_images?.map((img, index) => (
                          <img key={`before-${index}`} src={img} alt={`치료 전 ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        ))}
                        {materials.process_images?.map((img, index) => (
                          <img key={`process-${index}`} src={img} alt={`치료 중 ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        ))}
                        {materials.after_images?.map((img, index) => (
                          <img key={`after-${index}`} src={img} alt={`치료 후 ${index + 1}`} className="w-full h-20 object-cover rounded" />
                        ))}
                      </div>
                    </Card>
                  </div>
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">제공된 자료가 없습니다.</p>
              )}
            </div>
          )}

          {/* Logs Tab */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <h4 className="font-semibold">AI 에이전트 처리 로그</h4>
              {agentLogs.length > 0 ? (
                <div className="space-y-2">
                  {agentLogs.map((log, index) => (
                    <Card key={index} className="p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{log.agent_type} Agent</span>
                            <span className={`px-2 py-1 rounded text-xs font-medium ${getAgentStatusColor(log.execution_status)}`}>
                              {log.execution_status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mt-1">
                            {new Date(log.created_at).toLocaleString('ko-KR')}
                          </p>
                          {log.execution_time && (
                            <p className="text-sm text-gray-600">
                              실행 시간: {log.execution_time}ms
                            </p>
                          )}
                        </div>
                        {log.error_message && (
                          <div className="text-red-600 text-sm max-w-xs">
                            {log.error_message}
                          </div>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">처리 로그가 없습니다.</p>
              )}
            </div>
          )}

          {/* Reviews Tab */}
          {activeTab === 'reviews' && (
            <div className="space-y-4">
              <h4 className="font-semibold">검토 내역</h4>
              {reviews.length > 0 ? (
                <div className="space-y-2">
                  {reviews.map((review) => (
                    <Card key={review.id} className="p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          review.review_status === 'approved' ? 'bg-green-100 text-green-800' :
                          review.review_status === 'revision_requested' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {review.review_status === 'approved' ? '승인' :
                           review.review_status === 'revision_requested' ? '수정 요청' :
                           review.review_status}
                        </span>
                        <span className="text-sm text-gray-600">
                          {new Date(review.reviewed_at).toLocaleDateString('ko-KR')}
                        </span>
                      </div>
                      {review.review_notes && (
                        <div className="mb-2">
                          <p className="text-sm font-medium">검토 노트:</p>
                          <p className="text-sm text-gray-700">{review.review_notes}</p>
                        </div>
                      )}
                      {review.revision_instructions && (
                        <div>
                          <p className="text-sm font-medium">수정 지시사항:</p>
                          <p className="text-sm text-gray-700">{review.revision_instructions}</p>
                        </div>
                      )}
                    </Card>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">검토 내역이 없습니다.</p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}