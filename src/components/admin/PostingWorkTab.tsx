import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import type { CompletePostingWorkflow } from '@/types/common';
import GuideProvisionTab from '@/components/admin/GuideProvisionTab';

interface Post {
  id: string;
  post_id: string;
  title: string;
  status: string;
  post_type: string;
  publish_date?: string;
  created_at?: string;
  creator_name?: string;
  campaign_id?: number;
}

interface PostingWorkTabProps {
  posts?: Post[];
  isLoading?: boolean;
  selectedHospitalId?: number;
  onPostSelect?: (post: Post | null) => void;
  selectedPost?: Post | null;
}

export default function PostingWorkTab({
  posts = [],
  isLoading = false,
  selectedHospitalId,
  onPostSelect,
  selectedPost
}: PostingWorkTabProps) {
  const [activeStep, setActiveStep] = useState<string>('material-review');
  const [isWorking, setIsWorking] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');

  // 통합 워크플로우 데이터
  const [workflowData, setWorkflowData] = useState<CompletePostingWorkflow | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // 콘텐츠 수정 상태
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);


  const steps = [
    { id: 'material-review', label: '자료 검토', icon: '📋' },
    { id: 'admin-guide', label: '가이드 제공', icon: '📖' },
    { id: 'ai-agent', label: 'AI 생성', icon: '🤖' },
    { id: 'result-review', label: '결과 검토', icon: '👁️' },
    { id: 'client-review', label: '클라이언트 검토', icon: '👤' },
    { id: 'publish-ready', label: '게시 대기', icon: '🚀' }
  ];

  // 선택된 포스트가 변경될 때 데이터 로드
  useEffect(() => {
    if (selectedPost?.post_id) {
      loadWorkflowData(selectedPost.post_id);
    } else {
      resetWorkflowData();
    }
  }, [selectedPost]);

  // 워크플로우 데이터 로드
  const loadWorkflowData = async (postId: string) => {
    setWorkflowLoading(true);
    try {
      const data = await adminApi.getCompletePostingWorkflow(postId);
      setWorkflowData(data);

      // 가이드 텍스트 초기화
      setGuideText(data.guide_provision?.writing_guide || '');

      // 게시 일정 초기화
      if (data.publish_ready?.scheduled_date) {
        const date = new Date(data.publish_ready.scheduled_date);
        setPublishDate(date.toISOString().split('T')[0]);
        setPublishTime(date.toTimeString().split(' ')[0].substring(0, 5));
      } else {
        setPublishDate('');
        setPublishTime('');
      }

      // 콘텐츠 편집 초기화
      setEditContent(data.result_review?.content?.content || '');
      setIsEditing(false);

    } catch (error) {
      console.error('워크플로우 데이터 로드 실패:', error);
      setWorkflowData(null);
    } finally {
      setWorkflowLoading(false);
    }
  };

  // 데이터 초기화
  const resetWorkflowData = () => {
    setWorkflowData(null);
    setGuideText('');
    setEditContent('');
    setIsEditing(false);
    setPublishDate('');
    setPublishTime('');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'initial': return 'bg-gray-100 text-gray-800';
      case 'material_completed': return 'bg-blue-100 text-blue-800';
      case 'guide_completed': return 'bg-green-100 text-green-800';
      case 'agent_processing': return 'bg-yellow-100 text-yellow-800';
      case 'agent_completed': return 'bg-purple-100 text-purple-800';
      case 'admin_review': return 'bg-orange-100 text-orange-800';
      case 'client_review': return 'bg-pink-100 text-pink-800';
      case 'client_approved': return 'bg-teal-100 text-teal-800';
      case 'final_revision': return 'bg-indigo-100 text-indigo-800';
      case 'publish_scheduled': return 'bg-emerald-100 text-emerald-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // 자료 검토 승인
  const approveMaterials = async () => {
    if (!selectedPost) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostMaterialsStatus(selectedPost.post_id, 'completed');
      await adminApi.updatePostStatus(selectedPost.post_id, 'material_completed', '자료 검토 승인');
      alert('자료가 승인되었습니다.');
      setActiveStep('admin-guide');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('자료 승인 실패:', error);
      alert('자료 승인에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 자료 검토 반려
  const rejectMaterials = async () => {
    if (!selectedPost) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostStatus(selectedPost.post_id, 'initial', '자료 검토 반려 - 수정 필요');
      alert('자료가 반려되었습니다.');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('자료 반려 실패:', error);
      alert('자료 반려에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 가이드 저장
  const saveGuide = async () => {
    if (!selectedPost || !guideText.trim()) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostKeywordsGuide(Number(selectedPost.id), {
        writing_guide: guideText,
        is_completed: true
      });
      await adminApi.updatePostStatus(selectedPost.post_id, 'guide_completed', '어드민 가이드 제공 완료');
      alert('가이드가 저장되었습니다.');
      setActiveStep('ai-agent');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('가이드 저장 실패:', error);
      alert('가이드 저장에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // AI 파이프라인 실행
  const executeAIPipeline = async () => {
    if (!selectedPost?.post_id) return;
    setIsWorking(true);
    try {
      await adminApi.executeAIPipeline(selectedPost.post_id);
      alert('AI 파이프라인이 실행되었습니다.');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('AI 파이프라인 실행 실패:', error);
      alert('AI 파이프라인 실행에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 결과 승인
  const approveResult = async () => {
    if (!selectedPost) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostStatus(selectedPost.post_id, 'admin_approved', '어드민 검토 승인');
      alert('결과가 승인되었습니다.');
      setActiveStep('client-review');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('결과 승인 실패:', error);
      alert('결과 승인에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 콘텐츠 수정 저장
  const saveEditedContent = async () => {
    if (!selectedPost?.post_id) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostContent(selectedPost.post_id, { content: editContent });
      setIsEditing(false);
      alert('콘텐츠가 수정되었습니다.');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('콘텐츠 수정 실패:', error);
      alert('콘텐츠 수정에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 클라이언트 검토 완료
  const markClientReviewComplete = async () => {
    if (!selectedPost?.post_id) return;
    setIsWorking(true);
    try {
      await adminApi.updatePostStatus(selectedPost.post_id, 'client_approved', '클라이언트 검토 완료');
      alert('클라이언트 검토가 완료되었습니다.');
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('클라이언트 검토 완료 실패:', error);
      alert('클라이언트 검토 완료 처리에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  // 게시 대기 전환
  const schedulePublish = async () => {
    if (!selectedPost || !publishDate) return;
    setIsWorking(true);
    try {
      const publishDateTime = publishTime ? `${publishDate}T${publishTime}` : `${publishDate}T09:00`;
      await adminApi.updatePostStatus(selectedPost.post_id, 'publish_scheduled', `게시 일정 설정: ${publishDateTime}`);
      alert('게시 대기로 전환되었습니다.');
      setActiveStep('material-review');
      if (onPostSelect) onPostSelect(null);
      await loadWorkflowData(selectedPost.post_id);
    } catch (error) {
      console.error('게시 대기 전환 실패:', error);
      alert('게시 대기 전환에 실패했습니다.');
    } finally {
      setIsWorking(false);
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'initial': return '초기';
      case 'material_completed': return '자료 완료';
      case 'guide_completed': return '가이드 완료';
      case 'agent_processing': return 'AI 처리중';
      case 'agent_completed': return 'AI 완료';
      case 'admin_review': return '어드민 검토';
      case 'admin_approved': return '어드민 승인';
      case 'client_review': return '클라이언트 검토';
      case 'client_approved': return '클라이언트 승인';
      case 'final_revision': return '최종 수정';
      case 'publish_scheduled': return '게시 대기';
      default: return '알 수 없음';
    }
  };

  const calculateDDay = (publishDate: string | null | undefined) => {
    if (!publishDate) return '미정';
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const publish = new Date(publishDate);
    publish.setHours(0, 0, 0, 0);
    const diffTime = publish.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 'D-DAY' : diffDays > 0 ? `D-${diffDays}` : `D+${Math.abs(diffDays)}`;
  };


  return (
    <div className="px-6 py-4">
      <div className="flex space-x-6">
        {/* 왼쪽 패널: 작업 대상 포스트 목록 */}
        <div className="w-1/3 bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">작업 대상 포스트</h3>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
              <span className="ml-2 text-neutral-600">포스트 로딩 중...</span>
            </div>
          ) : posts.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-400 mb-2">
                <i className="fa-solid fa-folder-open text-2xl"></i>
              </div>
              <p className="text-sm text-neutral-500">캠페인을 선택해주세요</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {posts.map((post) => (
                <div
                  key={post.id}
                  onClick={() => {
                    if (onPostSelect) onPostSelect(post);
                    setActiveStep('material-review');
                  }}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedPost?.id === post.id
                      ? 'border-neutral-600 bg-neutral-50'
                      : 'border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                      {post.post_id}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded ${getStatusColor(post.status)}`}>
                      {getStatusLabel(post.status)}
                    </span>
                  </div>
                  <h4 className="text-sm text-neutral-800 mb-2 line-clamp-2">{post.title}</h4>
                  <div className="text-xs text-neutral-600">
                    {calculateDDay(post.publish_date)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽 패널: 작업 상세 */}
        <div className="w-2/3 bg-white rounded-xl shadow-lg p-4">
          <h3 className="text-lg font-medium text-neutral-900 mb-4">
            {selectedPost ? `${selectedPost.title} 작업 상세` : '포스트를 선택해주세요'}
          </h3>

          {selectedPost ? (
            <div className="space-y-6">

              {/* 작업 단계 네비게이션 */}
              <div className="flex justify-between border-b border-neutral-200 pb-4">
                {steps.map((step) => (
                  <button
                    key={step.id}
                    onClick={() => setActiveStep(step.id)}
                    className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                      activeStep === step.id
                        ? 'bg-neutral-100 text-neutral-800'
                        : 'text-neutral-500 hover:bg-neutral-50'
                    }`}
                  >
                    <span className="text-xl mb-1">{step.icon}</span>
                    <span className="text-xs font-medium">{step.label}</span>
                  </button>
                ))}
              </div>

              {/* 단계별 작업 콘텐츠 */}
              <div className="min-h-[400px] bg-neutral-50 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-neutral-900 mb-4">
                  {steps.find(s => s.id === activeStep)?.label}
                </h4>

                {workflowLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600 mx-auto"></div>
                    <p className="text-sm text-neutral-600 mt-2">데이터 로딩 중...</p>
                  </div>
                ) : !workflowData ? (
                  <div className="text-center py-8 text-neutral-500">
                    <p className="text-sm">워크플로우 데이터를 불러올 수 없습니다</p>
                  </div>
                ) : (
                  <>
                    {activeStep === 'material-review' && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-neutral-200">
                          <h5 className="font-medium text-neutral-900 mb-4">고객 제공 자료 검토</h5>

                          {workflowData.material_review.materials ? (
                            <div className="space-y-4">
                              {/* 자료 상태 */}
                              <div className="flex items-center justify-between p-3 bg-green-50 rounded">
                                <span className="text-sm font-medium text-green-700">자료 상태:</span>
                                <span className={`px-2 py-1 text-xs rounded ${
                                  workflowData.material_review.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : workflowData.material_review.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : workflowData.material_review.status === 'processing'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {workflowData.material_review.status === 'completed' ? '완료' :
                                   workflowData.material_review.status === 'pending' ? '대기' :
                                   workflowData.material_review.status === 'processing' ? '처리중' :
                                   workflowData.material_review.status || '알 수 없음'}
                                </span>
                              </div>

                              {/* spt 선택 정보 | 치아 번호 */}
                              <div className="grid grid-cols-2 gap-4">
                                {/* SPT 정보 */}
                                <div className="space-y-2">
                                  {workflowData.guide_provision?.spt_info?.selected_symptom_keyword && (
                                    <div className="p-2 bg-red-50 rounded text-xs">
                                      <span className="font-medium text-red-700">증상:</span>
                                      <span className="text-red-800 ml-1">{workflowData.guide_provision.spt_info.selected_symptom_keyword}</span>
                                    </div>
                                  )}
                                  {workflowData.guide_provision?.spt_info?.selected_procedure_keyword && (
                                    <div className="p-2 bg-blue-50 rounded text-xs">
                                      <span className="font-medium text-blue-700">진단:</span>
                                      <span className="text-blue-800 ml-1">{workflowData.guide_provision.spt_info.selected_procedure_keyword}</span>
                                    </div>
                                  )}
                                  {workflowData.guide_provision?.spt_info?.selected_treatment_keyword && (
                                    <div className="p-2 bg-green-50 rounded text-xs">
                                      <span className="font-medium text-green-700">치료:</span>
                                      <span className="text-green-800 ml-1">{workflowData.guide_provision.spt_info.selected_treatment_keyword}</span>
                                    </div>
                                  )}
                                </div>

                                {/* 치아 번호 */}
                                <div className="p-3 bg-blue-50 rounded">
                                  <span className="text-sm font-medium text-blue-700 block mb-2">치아 번호:</span>
                                  <div className="flex flex-wrap gap-1">
                                    {workflowData.material_review.materials.tooth_numbers?.map((tooth: string, index: number) => (
                                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                        {tooth}
                                      </span>
                                    )) || <span className="text-xs text-blue-600">없음</span>}
                                  </div>
                                </div>
                              </div>

                              {/* 컨셉 메시지 */}
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">컨셉 메시지:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {workflowData.material_review.materials?.treatment_info?.concept_message || '없음'}
                                </p>
                              </div>

                              {/* 환자 상태 */}
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">환자 상태:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {workflowData.material_review.materials?.treatment_info?.patient_condition || '없음'}
                                </p>
                              </div>

                              {/* 치료 전 이미지 */}
                              {workflowData.material_review.materials.images?.before?.length > 0 && (
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-neutral-800">치료 전 이미지</h6>
                                  <div className="grid grid-cols-2 gap-2">
                                    {workflowData.material_review.materials.images.before.map((image: any, index: number) => (
                                      <div key={index} className="p-2 bg-white border rounded">
                                        <div className="text-xs text-neutral-600 mb-1">
                                          <i className="fa-solid fa-image mr-1"></i>
                                          {image.filename}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          <a href={image.path} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            이미지 링크
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {workflowData.material_review.materials?.before_images_texts && (
                                    <div className="p-3 bg-gray-50 rounded">
                                      <span className="text-sm font-medium text-gray-700">설명:</span>
                                      <p className="text-sm text-gray-600 mt-1">{workflowData.material_review.materials.before_images_texts}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 치료 과정 메시지 */}
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">치료 과정 메시지:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {workflowData.material_review.materials?.treatment_info?.treatment_process_message || '없음'}
                                </p>
                              </div>

                              {/* 치료 과정 이미지 */}
                              {workflowData.material_review.materials.images?.process?.length > 0 && (
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-neutral-800">치료 과정 이미지</h6>
                                  <div className="grid grid-cols-2 gap-2">
                                    {workflowData.material_review.materials.images.process.map((image: any, index: number) => (
                                      <div key={index} className="p-2 bg-white border rounded">
                                        <div className="text-xs text-neutral-600 mb-1">
                                          <i className="fa-solid fa-image mr-1"></i>
                                          {image.filename}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          <a href={image.path} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            이미지 링크
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {workflowData.material_review.materials?.process_images_texts && (
                                    <div className="p-3 bg-gray-50 rounded">
                                      <span className="text-sm font-medium text-gray-700">설명:</span>
                                      <p className="text-sm text-gray-600 mt-1">{workflowData.material_review.materials.process_images_texts}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 치료 결과 메시지 */}
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">치료 결과 메시지:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {workflowData.material_review.materials?.treatment_info?.treatment_result_message || '없음'}
                                </p>
                              </div>

                              {/* 치료 후 이미지 */}
                              {workflowData.material_review.materials.images?.after?.length > 0 && (
                                <div className="space-y-2">
                                  <h6 className="text-sm font-medium text-neutral-800">치료 후 이미지</h6>
                                  <div className="grid grid-cols-2 gap-2">
                                    {workflowData.material_review.materials.images.after.map((image: any, index: number) => (
                                      <div key={index} className="p-2 bg-white border rounded">
                                        <div className="text-xs text-neutral-600 mb-1">
                                          <i className="fa-solid fa-image mr-1"></i>
                                          {image.filename}
                                        </div>
                                        <div className="text-xs text-blue-600">
                                          <a href={image.path} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            이미지 링크
                                          </a>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                  {workflowData.material_review.materials?.after_images_texts && (
                                    <div className="p-3 bg-gray-50 rounded">
                                      <span className="text-sm font-medium text-gray-700">설명:</span>
                                      <p className="text-sm text-gray-600 mt-1">{workflowData.material_review.materials.after_images_texts}</p>
                                    </div>
                                  )}
                                </div>
                              )}

                              {/* 추가 메시지 */}
                              {workflowData.material_review.materials?.treatment_info?.additional_message && (
                                <div className="p-3 bg-neutral-50 rounded">
                                  <span className="text-sm font-medium text-neutral-700">추가 메시지:</span>
                                  <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">
                                    {workflowData.material_review.materials.treatment_info.additional_message}
                                  </p>
                                </div>
                              )}

                              {/* 자료 품질 평가 */}
                              <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                                <span className="text-sm font-medium text-blue-700">자료 품질 평가:</span>
                                <span className="text-sm font-medium text-blue-700">
                                  {workflowData.material_review.materials.quality_score ?
                                    `${workflowData.material_review.materials.quality_score}/100` : '평가 전'}
                                </span>
                              </div>

                              <div className="flex space-x-2">
                                <button
                                  onClick={approveMaterials}
                                  disabled={isWorking}
                                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isWorking ? '처리중...' : '승인'}
                                </button>
                                <button
                                  onClick={rejectMaterials}
                                  disabled={isWorking}
                                  className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isWorking ? '처리중...' : '반려'}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-neutral-500">
                              <p className="text-sm">제공된 자료가 없습니다</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeStep === 'admin-guide' && (
                      <GuideProvisionTab
                        postId={selectedPost.post_id}
                        hospitalId={parseInt(selectedPost.id)}
                      />
                    )}

                    {activeStep === 'ai-agent' && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-neutral-200">
                          <h5 className="font-medium text-neutral-900 mb-4">AI 에이전트 실행 현황</h5>

                          <div className="space-y-4">
                            {/* 전체 진행률 */}
                            <div className="p-3 bg-blue-50 rounded">
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-blue-700">전체 진행률</span>
                                <span className="text-sm font-medium text-blue-700">
                                  {workflowData.ai_generation.progress || 0}%
                                </span>
                              </div>
                              <div className="w-full bg-blue-200 rounded-full h-2">
                                <div
                                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                  style={{width: `${workflowData.ai_generation.progress || 0}%`}}
                                ></div>
                              </div>
                              <div className="text-xs text-blue-600 mt-1">
                                {workflowData.ai_generation.current_step || '준비 중'}
                              </div>
                            </div>

                            {/* 각 에이전트 상태 */}
                            <div className="space-y-3">
                              <h6 className="text-sm font-medium text-neutral-700">에이전트별 진행 상황</h6>

                              {workflowData.ai_generation.agents.map((agent, index: number) => (
                                <div key={index} className="border border-neutral-200 rounded p-3">
                                  <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium text-neutral-800">
                                      {agent.name || `에이전트 ${index + 1}`}
                                    </span>
                                    <span className={`text-xs px-2 py-1 rounded ${
                                      agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                                      agent.status === 'running' ? 'bg-blue-100 text-blue-800' :
                                      agent.status === 'failed' ? 'bg-red-100 text-red-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {agent.status === 'completed' ? '완료' :
                                       agent.status === 'running' ? '실행중' :
                                       agent.status === 'failed' ? '실패' : '대기중'}
                                    </span>
                                  </div>

                                  {agent.start_time && (
                                    <div className="text-xs text-neutral-600 mb-1">
                                      시작: {new Date(agent.start_time).toLocaleString()}
                                    </div>
                                  )}
                                  {agent.end_time && (
                                    <div className="text-xs text-neutral-600 mb-1">
                                      완료: {new Date(agent.end_time).toLocaleString()}
                                    </div>
                                  )}

                                  <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                                    <div
                                      className={`h-1.5 rounded-full transition-all duration-300 ${
                                        agent.status === 'completed' ? 'bg-green-500' :
                                        agent.status === 'running' ? 'bg-blue-500' :
                                        agent.status === 'failed' ? 'bg-red-500' : 'bg-gray-400'
                                      }`}
                                      style={{width: `${agent.progress}%`}}
                                    ></div>
                                  </div>

                                  {agent.output && (
                                    <div className="mt-2 p-2 bg-neutral-50 rounded text-xs">
                                      <div className="text-neutral-700 mb-1">결과:</div>
                                      <div className="text-neutral-600 whitespace-pre-wrap max-h-20 overflow-y-auto">
                                        {agent.output.length > 100 ? `${agent.output.substring(0, 100)}...` : agent.output}
                                      </div>
                                    </div>
                                  )}

                                  {agent.error && (
                                    <div className="mt-2 p-2 bg-red-50 rounded text-xs">
                                      <div className="text-red-700 mb-1">오류:</div>
                                      <div className="text-red-600">{agent.error}</div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>

                            {/* 실행 제어 버튼들 */}
                            <div className="flex space-x-2">
                              {workflowData.ai_generation.agents.some(a => a.status === 'completed') && (
                                <button
                                  onClick={() => setActiveStep('result-review')}
                                  className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                                >
                                  결과 검토
                                </button>
                              )}

                              {!workflowData.ai_generation.agents.some(a => a.status === 'running') && (
                                <button
                                  onClick={executeAIPipeline}
                                  disabled={isWorking}
                                  className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isWorking ? '실행중...' : '파이프라인 실행'}
                                </button>
                              )}

                              <button
                                onClick={() => loadWorkflowData(selectedPost.post_id)}
                                className="px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700"
                              >
                                새로고침
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 'result-review' && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-neutral-200">
                          <h5 className="font-medium text-neutral-900 mb-4">AI 생성 결과 검토</h5>

                          {workflowData.result_review.content ? (
                            <div className="space-y-4">
                              {/* 콘텐츠 정보 */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-neutral-50 rounded">
                                  <span className="text-sm font-medium text-neutral-700">생성 일시:</span>
                                  <p className="text-sm text-neutral-600 mt-1">
                                    {workflowData.result_review.content.created_at ?
                                      new Date(workflowData.result_review.content.created_at).toLocaleString() : '알 수 없음'}
                                  </p>
                                </div>
                                <div className="p-3 bg-neutral-50 rounded">
                                  <span className="text-sm font-medium text-neutral-700">최종 수정:</span>
                                  <p className="text-sm text-neutral-600 mt-1">
                                    {workflowData.result_review.content.updated_at ?
                                      new Date(workflowData.result_review.content.updated_at).toLocaleString() : '없음'}
                                  </p>
                                </div>
                              </div>

                              {/* 콘텐츠 미리보기 및 편집 */}
                              <div>
                                <div className="flex items-center justify-between mb-2">
                                  <label className="text-sm font-medium text-neutral-700">콘텐츠 내용</label>
                                  <button
                                    onClick={() => setIsEditing(!isEditing)}
                                    className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                                  >
                                    {isEditing ? '편집 취소' : '편집'}
                                  </button>
                                </div>

                                {isEditing ? (
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full h-64 p-3 border border-neutral-300 rounded resize-none text-sm"
                                    placeholder="콘텐츠를 수정하세요..."
                                  />
                                ) : (
                                  <div className="bg-white p-4 rounded border text-sm max-h-64 overflow-y-auto whitespace-pre-wrap">
                                    {workflowData.result_review.content.content || '생성된 콘텐츠가 없습니다.'}
                                  </div>
                                )}
                              </div>

                              {/* 메타데이터 */}
                              {workflowData.result_review.content.metadata && (
                                <div className="p-3 bg-neutral-50 rounded">
                                  <span className="text-sm font-medium text-neutral-700">메타데이터:</span>
                                  <div className="mt-2 text-xs text-neutral-600">
                                    <div>단어 수: {workflowData.result_review.content.metadata.word_count || 0}</div>
                                    <div>읽기 시간: {workflowData.result_review.content.metadata.read_time || 0}분</div>
                                    <div>품질 점수: {workflowData.result_review.content.metadata.quality_score || 0}/100</div>
                                  </div>
                                </div>
                              )}

                              {/* 액션 버튼들 */}
                              <div className="flex space-x-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      onClick={saveEditedContent}
                                      disabled={isWorking}
                                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isWorking ? '저장중...' : '수정 저장'}
                                    </button>
                                    <button
                                      onClick={() => {
                                        setIsEditing(false);
                                        setEditContent(workflowData.result_review.content?.content || '');
                                      }}
                                      className="px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700"
                                    >
                                      취소
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button
                                      onClick={approveResult}
                                      disabled={isWorking}
                                      className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isWorking ? '처리중...' : '승인'}
                                    </button>
                                    <button
                                      onClick={() => setActiveStep('admin-guide')}
                                      className="px-4 py-2 bg-yellow-600 text-white text-sm rounded hover:bg-yellow-700"
                                    >
                                      수정 요청
                                    </button>
                                    <button
                                      onClick={executeAIPipeline}
                                      disabled={isWorking}
                                      className="px-4 py-2 bg-red-600 text-white text-sm rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      {isWorking ? '재생성중...' : '재생성'}
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="text-center py-8 text-neutral-500">
                              <p className="text-sm">생성된 콘텐츠가 없습니다</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {activeStep === 'client-review' && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-neutral-200">
                          <h5 className="font-medium text-neutral-900 mb-4">클라이언트 검토 및 피드백 반영</h5>

                          <div className="space-y-4">
                            {/* 검토 상태 및 정보 */}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">검토 상태:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  <span className={`px-2 py-1 rounded text-xs ${
                                    workflowData.client_review.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    workflowData.client_review.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    workflowData.client_review.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {workflowData.client_review.status === 'pending' ? '대기중' :
                                     workflowData.client_review.status === 'in_progress' ? '진행중' :
                                     workflowData.client_review.status === 'completed' ? '완료됨' : '알 수 없음'}
                                  </span>
                                </p>
                              </div>
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">요청 일시:</span>
                                <p className="text-sm text-neutral-600 mt-1">
                                  {workflowData.client_review.reviews[0]?.reviewed_at ?
                                    new Date(workflowData.client_review.reviews[0].reviewed_at).toLocaleString() : '알 수 없음'}
                                </p>
                              </div>
                            </div>

                            {/* 클라이언트 피드백 내용 */}
                            {workflowData.client_review.reviews[0]?.review_notes && (
                              <div className="p-3 bg-neutral-50 rounded">
                                <span className="text-sm font-medium text-neutral-700">클라이언트 피드백:</span>
                                <div className="mt-2 p-3 bg-white rounded border text-sm whitespace-pre-wrap">
                                  {workflowData.client_review.reviews[0].review_notes}
                                </div>
                              </div>
                            )}

                            {/* 액션 버튼들 */}
                            <div className="flex space-x-2">
                              {workflowData.client_review.status !== 'completed' && (
                                <>
                                  <button
                                    onClick={() => setActiveStep('result-review')}
                                    className="px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                                  >
                                    피드백 반영
                                  </button>
                                  <button
                                    onClick={markClientReviewComplete}
                                    disabled={isWorking}
                                    className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                  >
                                    {isWorking ? '처리중...' : '검토 완료'}
                                  </button>
                                </>
                              )}

                              <button
                                onClick={() => loadWorkflowData(selectedPost.post_id)}
                                className="px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700"
                              >
                                새로고침
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {activeStep === 'publish-ready' && (
                      <div className="space-y-4">
                        <div className="bg-white p-4 rounded-lg border border-neutral-200">
                          <h5 className="font-medium text-neutral-900 mb-4">게시 대기 상태 전환</h5>

                          <div className="space-y-4">
                            {/* 기존 게시 정보 표시 */}
                            {workflowData.publish_ready.status !== 'not_scheduled' && (
                              <div className="space-y-3">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="p-3 bg-neutral-50 rounded">
                                    <span className="text-sm font-medium text-neutral-700">현재 상태:</span>
                                    <p className="text-sm text-neutral-600 mt-1">
                                      <span className={`px-2 py-1 rounded text-xs ${
                                        workflowData.publish_ready.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                        workflowData.publish_ready.status === 'ready' ? 'bg-green-100 text-green-800' :
                                        workflowData.publish_ready.status === 'delayed' ? 'bg-red-100 text-red-800' :
                                        'bg-gray-100 text-gray-800'
                                      }`}>
                                        {workflowData.publish_ready.status === 'scheduled' ? '게시 예정' :
                                         workflowData.publish_ready.status === 'ready' ? '게시 준비 완료' :
                                         workflowData.publish_ready.status === 'delayed' ? '지연됨' : '준비 중'}
                                      </span>
                                    </p>
                                  </div>
                                  <div className="p-3 bg-neutral-50 rounded">
                                    <span className="text-sm font-medium text-neutral-700">예정 게시일:</span>
                                    <p className="text-sm text-neutral-600 mt-1">
                                      {workflowData.publish_ready.scheduled_date ?
                                        new Date(workflowData.publish_ready.scheduled_date).toLocaleString() : '미정'}
                                    </p>
                                  </div>
                                  {workflowData.publish_ready.published_date && (
                                    <div className="p-3 bg-neutral-50 rounded">
                                      <span className="text-sm font-medium text-neutral-700">실제 게시일:</span>
                                      <p className="text-sm text-neutral-600 mt-1">
                                        {new Date(workflowData.publish_ready.published_date).toLocaleString()}
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {workflowData.publish_ready.platforms && workflowData.publish_ready.platforms.length > 0 && (
                                  <div className="p-3 bg-neutral-50 rounded">
                                    <span className="text-sm font-medium text-neutral-700">게시 채널:</span>
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      {workflowData.publish_ready.platforms.map((platform: string, index: number) => (
                                        <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                                          {platform}
                                        </span>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {workflowData.publish_ready.notes && (
                                  <div className="p-3 bg-neutral-50 rounded">
                                    <span className="text-sm font-medium text-neutral-700">게시 메모:</span>
                                    <p className="text-sm text-neutral-600 mt-1 whitespace-pre-wrap">
                                      {workflowData.publish_ready.notes}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 게시 일정 설정 */}
                            <div className="border-t pt-4">
                              <h6 className="text-sm font-medium text-neutral-700 mb-3">게시 일정 설정</h6>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    게시 예정일
                                  </label>
                                  <input
                                    type="date"
                                    value={publishDate}
                                    onChange={(e) => setPublishDate(e.target.value)}
                                    className="w-full p-2 border border-neutral-300 rounded"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-neutral-700 mb-1">
                                    게시 예정시간
                                  </label>
                                  <input
                                    type="time"
                                    value={publishTime}
                                    onChange={(e) => setPublishTime(e.target.value)}
                                    className="w-full p-2 border border-neutral-300 rounded"
                                  />
                                </div>
                              </div>
                            </div>

                            {/* 상태 표시 */}
                            <div className="flex items-center p-3 bg-green-50 rounded">
                              <div className="text-sm text-green-700">
                                ✅ 모든 검토 과정이 완료되었습니다. 게시를 위한 준비가 완료되었습니다.
                              </div>
                            </div>

                            {/* 액션 버튼들 */}
                            <div className="flex space-x-2">
                              <button
                                onClick={schedulePublish}
                                disabled={isWorking || !publishDate}
                                className="px-4 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                {isWorking ? '전환중...' : '게시 대기로 전환'}
                              </button>
                              <button
                                onClick={() => setActiveStep('material-review')}
                                className="px-4 py-2 bg-neutral-600 text-white text-sm rounded hover:bg-neutral-700"
                              >
                                취소
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-neutral-400 mb-4">
                <i className="fa-solid fa-arrow-left text-5xl"></i>
              </div>
              <p className="text-lg text-neutral-600">왼쪽에서 포스트를 선택하여 작업을 시작하세요.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}