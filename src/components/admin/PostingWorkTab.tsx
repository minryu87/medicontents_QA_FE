import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';
import type { CompletePostingWorkflow } from '@/types/common';
import GuideProvisionTab from '@/components/admin/GuideProvisionTab';
import AIGenerationTab from '@/components/admin/AIGenerationTab';
import PipelineResultHeader from '@/components/admin/result-dashboard/PipelineResultHeader';
import HTMLPreviewPopup from '@/components/admin/result-dashboard/HTMLPreviewPopup';
import EvaluationResultsCard from '@/components/admin/result-dashboard/EvaluationResultsCard';
import IterationHistoryCard from '@/components/admin/result-dashboard/IterationHistoryCard';
import { useCompletionNotification } from '@/contexts/CompletionNotificationContext';

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
  onPostUpdate?: (updatedPost: Post) => void;
  selectedPost?: Post | null;
}

export default function PostingWorkTab({
  posts = [],
  isLoading = false,
  selectedHospitalId,
  onPostSelect,
  onPostUpdate,
  selectedPost
}: PostingWorkTabProps) {
  // 글로벌 진행/완료 알림 Context 사용 (이미지 분석/의료 리서치용)
  const { addProgressNotification, updateProgressToCompleted } = useCompletionNotification();
  
  const [activeStep, setActiveStep] = useState<string>('material-review');
  const [isWorking, setIsWorking] = useState(false);
  const [guideText, setGuideText] = useState('');
  const [publishDate, setPublishDate] = useState('');
  const [publishTime, setPublishTime] = useState('');

  // 포스트 필터링 상태
  const [postFilter, setPostFilter] = useState<string>('전체');

  // 필터 그룹 정의
  const filterGroups: Record<string, string[]> = {
    '전체': [],
    '가이드': ['병원 자료 입력 중', '병원 자료 제공 완료', '의료 리서치 완료'],
    'AI 생성': ['자료 검토 완료', '어드민 가이드 완료'],
    '생성 검토': ['AI 생성 중', 'AI 생성 완료-성공', 'AI 생성 완료-실패'],
    '최종 승인': ['어드민 검토 완료', '클라이언트 승인 완료'],
    '게시': ['최종 승인', '게시 대기', '게시 완료'],
    '기타': ['중단/취소']
  };

  // 포스트 필터링 및 정렬 함수
  const getFilteredAndSortedPosts = () => {
    let filteredPosts = posts;

    // 필터 적용
    if (postFilter !== '전체') {
      const targetStatuses = filterGroups[postFilter as keyof typeof filterGroups];
      filteredPosts = posts.filter(post => targetStatuses.includes(getStatusLabel(post.status)));
    }

    // D-day 오름차순 정렬 (마감일 가까운 순서)
    return filteredPosts.sort((a, b) => {
      const aPublishDate = a.publish_date ? new Date(a.publish_date).getTime() : Infinity;
      const bPublishDate = b.publish_date ? new Date(b.publish_date).getTime() : Infinity;
      return aPublishDate - bPublishDate;
    });
  };

  // 통합 워크플로우 데이터
  const [workflowData, setWorkflowData] = useState<CompletePostingWorkflow | null>(null);
  const [workflowLoading, setWorkflowLoading] = useState(false);

  // 콘텐츠 수정 상태
  const [editContent, setEditContent] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // 새로운 대시보드 데이터 상태
  const [pipelineResult, setPipelineResult] = useState<any>(null);
  const [evaluationData, setEvaluationData] = useState<any>(null);
  const [dashboardLoading, setDashboardLoading] = useState(false);

  // 리서치 결과 상태
  const [researchResults, setResearchResults] = useState<any>(null);
  const [researchLoading, setResearchLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [isReResearching, setIsReResearching] = useState(false);

  // HTML 미리보기 팝업 상태
  const [showHTMLPreview, setShowHTMLPreview] = useState(false);


  const steps = [
    { id: 'material-review', label: '자료 검토', icon: '📋' },
    { id: 'admin-guide', label: '가이드 제공', icon: '📖' },
    { id: 'ai-agent', label: 'AI 생성', icon: '🤖' },
    { id: 'result-review', label: '결과 검토', icon: '👁️' },
    { id: 'client-review', label: '클라이언트 검토', icon: '👤' },
    { id: 'publish-ready', label: '게시 대기', icon: '🚀' }
  ];

  // Status에 따른 활성화 가능한 step들 결정
  const getAvailableSteps = (status: string): string[] => {
    switch (status) {
      case 'initial':
        return []; // 아무것도 활성화되지 않음

      case 'hospital_completed':
        return ['material-review']; // 자료 검토만 가능

      case 'material_review_completed':
        return ['material-review', 'admin-guide']; // 자료 검토, 가이드 제공

      case 'guide_input_completed':
      case 'guide_completed':
        return ['material-review', 'admin-guide', 'ai-agent']; // 자료 검토, 가이드 제공, AI 생성

      case 'generation_started':
      case 'generation_partial':
      case 'generation_failed':
        return ['material-review', 'admin-guide', 'ai-agent']; // AI 생성 진행 중

      case 'generation_completed':
        return ['material-review', 'admin-guide', 'ai-agent', 'result-review']; // 결과 검토 추가

      case 'admin_approved':
        return ['material-review', 'admin-guide', 'ai-agent', 'result-review', 'client-review']; // 클라이언트 검토 추가

      case 'client_approved':
        return ['material-review', 'admin-guide', 'ai-agent', 'result-review', 'client-review', 'publish-ready']; // 게시 대기 추가

      case 'final_approved':
      case 'publish_scheduled':
      case 'published':
        return ['material-review', 'admin-guide', 'ai-agent', 'result-review', 'client-review', 'publish-ready']; // 모두 활성화

      default:
        return ['material-review']; // 기본적으로 자료 검토만
    }
  };

  // 현재 포스트의 활성화된 step들
  const availableSteps = selectedPost ? getAvailableSteps(selectedPost.status) : [];

  // 선택된 포스트가 변경될 때 데이터 로드
  useEffect(() => {
    if (selectedPost?.post_id) {
      loadWorkflowData(selectedPost.post_id);
    } else {
      resetWorkflowData();
    }
  }, [selectedPost]);

  // 워크플로우 데이터 로드
  // 이미지 재분석 핸들러
  const handleReanalyzeImages = async () => {
    if (!selectedPost?.post_id) return;
    
    if (!confirm('이미지를 재분석하시겠습니까? 기존 분석 결과는 이력으로 보관됩니다.')) {
      return;
    }
    
    setIsReanalyzing(true);
    try {
      const result = await adminApi.reanalyzeImages(selectedPost.post_id);
      
      // 시작 토스트 표시 (3초 후 사라짐)
      if (typeof window !== 'undefined' && (window as any).addToast) {
        (window as any).addToast({
          type: 'info',
          title: '이미지 분석 시작',
          message: `이미지 분석을 시작합니다 (버전 ${result.new_version})`,
          duration: 3000
        });
      }
      
      // 진행 중 알림 카드 표시 (완료될 때까지 지속 유지)
      addProgressNotification(`${selectedPost.post_id}_image_analysis`);
      
    } catch (error) {
      console.error('이미지 재분석 실패:', error);
      if (typeof window !== 'undefined' && (window as any).addToast) {
        (window as any).addToast({
          type: 'error',
          title: '이미지 분석 실패',
          message: '이미지 분석 요청에 실패했습니다.',
          duration: 5000
        });
      }
    } finally {
      setIsReanalyzing(false);
    }
  };

  // 의료 리서치 재실행 핸들러
  const handleReResearchMedical = async () => {
    if (!selectedPost?.post_id) return;
    
    if (!confirm('의료 리서치를 재실행하시겠습니까? 기존 리서치 결과는 이력으로 보관됩니다.')) {
      return;
    }
    
    setIsReResearching(true);
    try {
      const result = await adminApi.reResearchMedical(selectedPost.post_id);
      
      // 시작 토스트 표시 (3초 후 사라짐)
      if (typeof window !== 'undefined' && (window as any).addToast) {
        (window as any).addToast({
          type: 'info',
          title: '의료 리서치 시작',
          message: `의료 리서치를 시작합니다 (버전 ${result.new_version})`,
          duration: 3000
        });
      }
      
      // 진행 중 알림 카드 표시 (완료될 때까지 지속 유지)
      addProgressNotification(`${selectedPost.post_id}_medical_research`);
      
    } catch (error) {
      console.error('의료 리서치 재실행 실패:', error);
      if (typeof window !== 'undefined' && (window as any).addToast) {
        (window as any).addToast({
          type: 'error',
          title: '의료 리서치 실패',
          message: '의료 리서치 요청에 실패했습니다.',
          duration: 5000
        });
      }
    } finally {
      setIsReResearching(false);
    }
  };

  const loadWorkflowData = async (postId: string) => {
    setWorkflowLoading(true);
    setDashboardLoading(true);

    try {
      // 기존 워크플로우 데이터 로드
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

      // 새로운 대시보드 데이터 로드 (병렬 처리)
      try {
        const [pipelineResultData, evaluationResultData, researchResultData] = await Promise.allSettled([
          adminApi.getLatestPipelineResult(postId),
          adminApi.getEvaluationResultsDashboard(postId),
          adminApi.getResearchResults(postId)
        ]);

        if (pipelineResultData.status === 'fulfilled') {
          setPipelineResult(pipelineResultData.value);
        } else {
          console.warn('PipelineResult 로드 실패:', pipelineResultData.reason);
          setPipelineResult(null);
        }

        if (evaluationResultData.status === 'fulfilled') {
          setEvaluationData(evaluationResultData.value);
        } else {
          console.warn('EvaluationResults 로드 실패:', evaluationResultData.reason);
          setEvaluationData(null);
        }

        if (researchResultData.status === 'fulfilled') {
          setResearchResults(researchResultData.value);
        } else {
          console.warn('ResearchResults 로드 실패:', researchResultData.reason);
          setResearchResults(null);
        }
      } catch (dashboardError) {
        console.error('대시보드 데이터 로드 실패:', dashboardError);
        setPipelineResult(null);
        setEvaluationData(null);
        setResearchResults(null);
      }

    } catch (error) {
      console.error('워크플로우 데이터 로드 실패:', error);
      setWorkflowData(null);
      setPipelineResult(null);
      setEvaluationData(null);
      setResearchResults(null);
    } finally {
      setWorkflowLoading(false);
      setDashboardLoading(false);
    }
  };

  // 데이터 초기화
  const resetWorkflowData = () => {
    setWorkflowData(null);
    setPipelineResult(null);
    setEvaluationData(null);
    setResearchResults(null);
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
      case 'image_analysis_completed':
      case 'medical_research_completed': return 'bg-cyan-100 text-cyan-800';
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
      await adminApi.updatePostStatus(selectedPost.post_id, 'material_review_completed', '자료 검토 승인');
      alert('자료가 승인되었습니다.');
      setActiveStep('admin-guide');
      await loadWorkflowData(selectedPost.post_id);

      // 포스트 상태가 업데이트되었으므로 부모 컴포넌트에 알림
      if (onPostUpdate && selectedPost) {
        const updatedPost = { ...selectedPost, status: 'material_review_completed' };
        onPostUpdate(updatedPost);
      }
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
      // 초기
      case 'initial': return '초기';

      // 병원 자료 입력 중
      case 'material_started':
      case 'material_draft': return '병원 자료 입력 중';

      // 병원 자료 제공 완료
      case 'material_completed':
      case 'hospital_completed': return '병원 자료 제공 완료';

      // 의료 리서치 완료 (이미지 분석 + 의료 리서치 통합 표시)
      case 'image_analysis_completed':
      case 'medical_research_completed': return '의료 리서치 완료';

      // 자료 검토 완료
      case 'material_review_completed': return '자료 검토 완료';

      // 어드민 가이드 완료
      case 'guide_input_completed': return '어드민 가이드 완료';

      // AI 생성 중
      case 'generation_started':
      case 'ai_processing':
      case 'agent_processing': return 'AI 생성 중';

      // AI 생성 완료-성공
      case 'generation_completed':
      case 'ai_completed':
      case 'agent_completed': return 'AI 생성 완료-성공';

      // AI 생성 완료-실패
      case 'generation_partial':
      case 'generation_failed': return 'AI 생성 완료-실패';

      // 어드민 검토 완료
      case 'admin_review':
      case 'admin_approved':
      case 'admin_revision_requested': return '어드민 검토 완료';

      // 클라이언트 승인 완료
      case 'client_review':
      case 'client_approved':
      case 'client_revision_requested': return '클라이언트 승인 완료';

      // 최종 승인
      case 'final_approved':
      case 'final_revision': return '최종 승인';

      // 게시 대기
      case 'publish_scheduled': return '게시 대기';

      // 게시 완료
      case 'publishing':
      case 'published': return '게시 완료';

      // 중단/취소
      case 'paused':
      case 'aborted': return '중단/취소';

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
        <div className="w-1/5 bg-white rounded-xl shadow-lg p-4 flex flex-col" style={{ height: '1250px' }}>
          <h3 className="text-lg font-medium text-neutral-900 mb-4">작업 대상 포스트</h3>

          {/* 필터 버튼들 */}
          <div className="flex flex-wrap gap-2 mb-4">
            {Object.keys(filterGroups).map((filter) => (
              <button
                key={filter}
                onClick={() => setPostFilter(filter)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  postFilter === filter
                    ? 'bg-neutral-600 text-white'
                    : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200'
                }`}
              >
                {filter}
                {filter !== '전체' && (
                  <span className="ml-1 text-xs opacity-75">
                    ({posts.filter(post =>
                      filterGroups[filter as keyof typeof filterGroups].includes(getStatusLabel(post.status))
                    ).length})
                  </span>
                )}
              </button>
            ))}
          </div>
          {isLoading ? (
            <div className="flex items-center justify-center h-48">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-600"></div>
              <span className="ml-2 text-neutral-600">포스트 로딩 중...</span>
            </div>
          ) : getFilteredAndSortedPosts().length === 0 ? (
            <div className="text-center py-8">
              <div className="text-neutral-400 mb-2">
                <i className="fa-solid fa-folder-open text-2xl"></i>
              </div>
              <p className="text-sm text-neutral-500">
                {postFilter === '전체' ? '캠페인을 선택해주세요' : `'${postFilter}' 조건에 맞는 포스트가 없습니다`}
              </p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[1150px] overflow-y-auto">
              {getFilteredAndSortedPosts().map((post) => (
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
        <div className="w-4/5 bg-white rounded-xl shadow-lg p-4 overflow-y-auto" style={{ height: '1250px' }}>
          <h3 className="text-lg font-medium text-neutral-900 mb-4">
            {selectedPost ? `${selectedPost.title} 작업 상세` : '포스트를 선택해주세요'}
          </h3>

          {selectedPost ? (
            <div className="space-y-6">

              {/* 작업 단계 네비게이션 */}
              <div className="flex justify-between border-b border-neutral-200 pb-4">
                {steps.map((step) => {
                  const isAvailable = availableSteps.includes(step.id);
                  return (
                    <button
                      key={step.id}
                      onClick={() => isAvailable && setActiveStep(step.id)}
                      disabled={!isAvailable}
                      className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                        activeStep === step.id
                          ? 'bg-neutral-100 text-neutral-800'
                          : isAvailable
                          ? 'text-neutral-500 hover:bg-neutral-50'
                          : 'text-neutral-300 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <span className="text-xl mb-1">{step.icon}</span>
                      <span className="text-xs font-medium">{step.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* 단계별 작업 콘텐츠 */}
              <div className="min-h-[400px] bg-neutral-50 rounded-lg p-6">
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
                                          <a href={image.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
                                          <a href={image.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
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
                                          <a href={image.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
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

                        {/* 이미지 분석 및 리서치 결과 섹션 - 항상 표시 */}
                        <div className="bg-white p-4 rounded-lg border border-neutral-200 mt-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-medium text-neutral-900 flex items-center">
                              <span className="mr-2">🔬</span>
                              이미지 분석 및 리서치 결과
                            </h5>
                            
                            {/* 재실행 버튼 그룹 - 항상 표시 */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={handleReanalyzeImages}
                                disabled={isReanalyzing}
                                className="px-3 py-1.5 bg-cyan-600 text-white text-xs rounded hover:bg-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                              >
                                <i className="fa-solid fa-rotate-right"></i>
                                <span>{isReanalyzing ? '분석 중...' : (researchResults?.has_image_analysis ? '이미지 재분석' : '이미지 분석 실행')}</span>
                              </button>
                              
                              <button
                                onClick={handleReResearchMedical}
                                disabled={isReResearching}
                                className="px-3 py-1.5 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
                              >
                                <i className="fa-solid fa-rotate-right"></i>
                                <span>{isReResearching ? '리서치 중...' : (researchResults?.has_medical_research ? '의료 리서치 재실행' : '의료 리서치 실행')}</span>
                              </button>
                            </div>
                          </div>

                          {/* 결과가 없을 때 안내 메시지 */}
                          {(!researchResults || (!researchResults.has_image_analysis && !researchResults.has_medical_research)) && (
                            <div className="p-4 bg-neutral-50 rounded-lg text-center">
                              <p className="text-sm text-neutral-600">
                                아직 이미지 분석 및 의료 리서치가 실행되지 않았습니다.<br/>
                                위 버튼을 클릭하여 분석을 시작하세요.
                              </p>
                            </div>
                          )}

                          {/* 이미지 분석 결과 */}
                          {researchResults?.has_image_analysis && (
                              <div className="space-y-4 mb-6">
                                <div className="flex items-center justify-between p-3 bg-cyan-50 rounded">
                                  <span className="text-sm font-medium text-cyan-700">이미지 분석 상태:</span>
                                  <div className="flex items-center space-x-3">
                                    <span className="text-xs text-cyan-600">
                                      완료: {researchResults.image_analysis.status_summary.completed}
                                    </span>
                                    {researchResults.image_analysis.status_summary.failed > 0 && (
                                      <span className="text-xs text-red-600">
                                        실패: {researchResults.image_analysis.status_summary.failed}
                                      </span>
                                    )}
                                  </div>
                                </div>

                                {/* Before 이미지 분석 */}
                                {researchResults.image_analysis.by_stage.before.length > 0 && (
                                  <div className="space-y-2">
                                    <h6 className="text-sm font-medium text-neutral-800">치료 전 이미지 분석</h6>
                                    {researchResults.image_analysis.by_stage.before.map((analysis: any, index: number) => (
                                      <div key={index} className="p-3 bg-cyan-50 rounded border border-cyan-100">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                          <div>
                                            <span className="font-medium text-cyan-700">이미지 종류:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.image_type || '미분류'}</span>
                                          </div>
                                          <div>
                                            <span className="font-medium text-cyan-700">해부학적 위치:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.anatomical_location || '미분류'}</span>
                                          </div>
                                          {analysis.suggested_diagnosis && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">추정 진단:</span>
                                              <span className="ml-1 text-cyan-900">{analysis.suggested_diagnosis}</span>
                                            </div>
                                          )}
                                          {analysis.medical_findings && analysis.medical_findings.length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">의학적 소견:</span>
                                              <ul className="ml-4 mt-1 list-disc text-cyan-900">
                                                {analysis.medical_findings.map((finding: string, idx: number) => (
                                                  <li key={idx}>{finding}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {analysis.measurements && Object.keys(analysis.measurements).length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">측정값:</span>
                                              <div className="ml-2 mt-1 text-cyan-900">
                                                {Object.entries(analysis.measurements).map(([key, value]) => (
                                                  <div key={key}>{key}: {String(value)}</div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {analysis.clinical_significance && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">임상적 의미:</span>
                                              <p className="ml-1 text-cyan-900">{analysis.clinical_significance}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Process 이미지 분석 */}
                                {researchResults.image_analysis.by_stage.process.length > 0 && (
                                  <div className="space-y-2">
                                    <h6 className="text-sm font-medium text-neutral-800">치료 과정 이미지 분석</h6>
                                    {researchResults.image_analysis.by_stage.process.map((analysis: any, index: number) => (
                                      <div key={index} className="p-3 bg-cyan-50 rounded border border-cyan-100">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                          <div>
                                            <span className="font-medium text-cyan-700">이미지 종류:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.image_type || '미분류'}</span>
                                          </div>
                                          <div>
                                            <span className="font-medium text-cyan-700">해부학적 위치:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.anatomical_location || '미분류'}</span>
                                          </div>
                                          {analysis.suggested_diagnosis && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">추정 진단:</span>
                                              <span className="ml-1 text-cyan-900">{analysis.suggested_diagnosis}</span>
                                            </div>
                                          )}
                                          {analysis.medical_findings && analysis.medical_findings.length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">의학적 소견:</span>
                                              <ul className="ml-4 mt-1 list-disc text-cyan-900">
                                                {analysis.medical_findings.map((finding: string, idx: number) => (
                                                  <li key={idx}>{finding}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {analysis.measurements && Object.keys(analysis.measurements).length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">측정값:</span>
                                              <div className="ml-2 mt-1 text-cyan-900">
                                                {Object.entries(analysis.measurements).map(([key, value]) => (
                                                  <div key={key}>{key}: {String(value)}</div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {analysis.clinical_significance && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">임상적 의미:</span>
                                              <p className="ml-1 text-cyan-900">{analysis.clinical_significance}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* After 이미지 분석 */}
                                {researchResults.image_analysis.by_stage.after.length > 0 && (
                                  <div className="space-y-2">
                                    <h6 className="text-sm font-medium text-neutral-800">치료 후 이미지 분석</h6>
                                    {researchResults.image_analysis.by_stage.after.map((analysis: any, index: number) => (
                                      <div key={index} className="p-3 bg-cyan-50 rounded border border-cyan-100">
                                        <div className="grid grid-cols-2 gap-3 text-xs">
                                          <div>
                                            <span className="font-medium text-cyan-700">이미지 종류:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.image_type || '미분류'}</span>
                                          </div>
                                          <div>
                                            <span className="font-medium text-cyan-700">해부학적 위치:</span>
                                            <span className="ml-1 text-cyan-900">{analysis.anatomical_location || '미분류'}</span>
                                          </div>
                                          {analysis.suggested_diagnosis && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">추정 진단:</span>
                                              <span className="ml-1 text-cyan-900">{analysis.suggested_diagnosis}</span>
                                            </div>
                                          )}
                                          {analysis.medical_findings && analysis.medical_findings.length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">의학적 소견:</span>
                                              <ul className="ml-4 mt-1 list-disc text-cyan-900">
                                                {analysis.medical_findings.map((finding: string, idx: number) => (
                                                  <li key={idx}>{finding}</li>
                                                ))}
                                              </ul>
                                            </div>
                                          )}
                                          {analysis.measurements && Object.keys(analysis.measurements).length > 0 && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">측정값:</span>
                                              <div className="ml-2 mt-1 text-cyan-900">
                                                {Object.entries(analysis.measurements).map(([key, value]) => (
                                                  <div key={key}>{key}: {String(value)}</div>
                                                ))}
                                              </div>
                                            </div>
                                          )}
                                          {analysis.clinical_significance && (
                                            <div className="col-span-2">
                                              <span className="font-medium text-cyan-700">임상적 의미:</span>
                                              <p className="ml-1 text-cyan-900">{analysis.clinical_significance}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* 의료 리서치 결과 */}
                            {researchResults?.has_medical_research && researchResults.medical_research && (
                              <div className="space-y-4 border-t border-neutral-200 pt-4">
                                <div className="flex items-center justify-between p-3 bg-blue-50 rounded">
                                  <span className="text-sm font-medium text-blue-700">의료 리서치 상태:</span>
                                  <span className={`px-2 py-1 text-xs rounded ${
                                    researchResults.medical_research.research_status === 'completed'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-yellow-100 text-yellow-800'
                                  }`}>
                                    {researchResults.medical_research.research_status === 'completed' ? '완료' : '진행중'}
                                  </span>
                                </div>

                                {/* 진단 표준화 */}
                                {researchResults.medical_research.diagnosis_standardization && (
                                  <div className="p-3 bg-blue-50 rounded">
                                    <span className="text-sm font-medium text-blue-700 block mb-2">진단 표준화:</span>
                                    <pre className="text-xs text-blue-900 whitespace-pre-wrap">
                                      {JSON.stringify(researchResults.medical_research.diagnosis_standardization, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* 치료법 상세 */}
                                {researchResults.medical_research.treatment_details && (
                                  <div className="p-3 bg-blue-50 rounded">
                                    <span className="text-sm font-medium text-blue-700 block mb-2">치료법 상세:</span>
                                    <pre className="text-xs text-blue-900 whitespace-pre-wrap">
                                      {JSON.stringify(researchResults.medical_research.treatment_details, null, 2)}
                                    </pre>
                                  </div>
                                )}

                                {/* 참고 문헌 */}
                                {researchResults.medical_research.sources && researchResults.medical_research.sources.length > 0 && (
                                  <div className="p-3 bg-blue-50 rounded">
                                    <span className="text-sm font-medium text-blue-700 block mb-2">참고 문헌:</span>
                                    <ul className="space-y-1">
                                      {researchResults.medical_research.sources.map((source: any, index: number) => (
                                        <li key={index} className="text-xs text-blue-900">
                                          <a href={source.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                                            {source.title || source.url}
                                          </a>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                      </div>
                    )}

                    {activeStep === 'admin-guide' && (
                      <GuideProvisionTab
                        postId={selectedPost.post_id}
                        hospitalId={parseInt(selectedPost.id)}
                        postStatus={selectedPost.status}
                        workflowData={workflowData}
                        onGuideCompleted={async () => {
                          // 가이드 완료 시 AI 생성 탭으로 전환
                          setActiveStep('ai-agent');
                          await loadWorkflowData(selectedPost.post_id);
                          
                          // 포스트 상태 업데이트 알림
                          if (onPostUpdate && selectedPost) {
                            const updatedPost = { ...selectedPost, status: 'guide_input_completed' };
                            onPostUpdate(updatedPost);
                          }
                        }}
                      />
                    )}

                    {activeStep === 'ai-agent' && selectedPost && (
                      <AIGenerationTab
                        postId={selectedPost.post_id}
                        postStatus={selectedPost.status}
                      />
                    )}

                    {activeStep === 'result-review' && (
                      <div className="space-y-6">
                        {/* PipelineResult 헤더 */}
                        <PipelineResultHeader
                          pipelineResult={pipelineResult}
                          loading={dashboardLoading}
                        />

                        {/* 콘텐츠 미리보기 카드 */}
                        {pipelineResult && (
                          <div className="bg-white p-6 rounded-lg border border-neutral-200">
                            <div className="flex items-center justify-between mb-4">
                              <h3 className="text-lg font-semibold text-neutral-900">최종 콘텐츠</h3>
                              <button
                                onClick={() => setShowHTMLPreview(true)}
                                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
                              >
                                📱 전체 화면 미리보기
                              </button>
                            </div>

                            {pipelineResult.final_html_content ? (
                              <div className="bg-neutral-50 p-4 rounded border max-h-96 overflow-y-auto">
                                <div
                                  dangerouslySetInnerHTML={{
                                    __html: pipelineResult.final_html_content
                                  }}
                                />
                              </div>
                            ) : pipelineResult.final_content ? (
                              <div className="bg-neutral-50 p-4 rounded border max-h-96 overflow-y-auto whitespace-pre-wrap text-sm">
                                {pipelineResult.final_content}
                              </div>
                            ) : (
                              <div className="text-center py-8 text-neutral-500">
                                <p>생성된 콘텐츠가 없습니다</p>
                              </div>
                            )}
                          </div>
                        )}

                        {/* 평가 결과 */}
                        <EvaluationResultsCard
                          evaluationData={evaluationData}
                          loading={dashboardLoading}
                        />

                        {/* 반복 작업 히스토리 */}
                        <IterationHistoryCard
                          evaluationHistory={evaluationData?.evaluation_history || []}
                          loading={dashboardLoading}
                        />

                        {/* 액션 버튼들 */}
                        <div className="bg-white p-6 rounded-lg border border-neutral-200">
                          <h3 className="text-lg font-semibold text-neutral-900 mb-4">작업 액션</h3>
                          <div className="flex space-x-2">
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
                          </div>
                        </div>

                        {/* HTML 미리보기 팝업 */}
                        {pipelineResult && (
                          <HTMLPreviewPopup
                            isOpen={showHTMLPreview}
                            onClose={() => setShowHTMLPreview(false)}
                            title={pipelineResult.final_title || '제목 없음'}
                            htmlContent={pipelineResult.final_html_content || '<p>콘텐츠가 없습니다.</p>'}
                          />
                        )}
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