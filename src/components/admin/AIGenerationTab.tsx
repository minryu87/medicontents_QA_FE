import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';

interface PreGenerationView {
  post_id: string;
  input_data_summary: {
    has_hospital_info: boolean;
    has_treatment_info: boolean;
    has_medical_service_info: boolean;
    has_post_materials: boolean;
    has_keywords_guide: boolean;
    has_clinical_context: boolean;
    hospital_images_count: number;
    post_images_count: number;
    cache_hit: boolean;
  };
  agent_sequence: Array<{
    step: number;
    agent_type: string;
    name: string;
    description: string;
    estimated_duration: number;
  }>;
  prompts_preview: Record<string, any>;
  checklists_preview: Array<{
    name: string;
    criteria: string[];
  }>;
  estimated_duration: number;
}

interface GenerationProgress {
  currentAgent: string;
  agentStatus: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  logs: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error';
  }>;
  currentResult?: any;
  completedResults: any[];
}

interface GenerationResult {
  post_id: string;
  overall_status: string;
  total_duration: number;
  successful_agents: number;
  total_agents: number;
  agent_results: Array<{
    agent_type: string;
    status: string;
    duration?: number;
    result_count: number;
    has_content: boolean;
  }>;
  final_content?: {
    title?: string;
    content?: string;
    html_content?: string;
    markdown_content?: string;
  };
  evaluation_scores?: {
    seo_score?: number;
    legal_score?: number;
    medical_score?: number;
    overall_score?: number;
  };
  created_at: string;
}

interface AIGenerationTabProps {
  postId: string;
}

export default function AIGenerationTab({ postId }: AIGenerationTabProps) {
  const [currentState, setCurrentState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [preGenerationData, setPreGenerationData] = useState<PreGenerationView | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 생성 전 데이터 로드
  useEffect(() => {
    if (postId) {
      loadPreGenerationData();
    }
  }, [postId]);

  const loadPreGenerationData = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getGenerationPreview(postId);
      setPreGenerationData(data);
    } catch (err) {
      setError('생성 전 데이터 로드 실패');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const startGeneration = async () => {
    try {
      setLoading(true);
      setError(null);
      setCurrentState('running');

      // WebSocket 연결 설정 (실시간 모니터링)
      setupWebSocket();

      // 생성 시작 API 호출
      await adminApi.controlGeneration(postId, {
        action: 'start',
        parameters: {}
      });

    } catch (err) {
      setError('생성 시작 실패');
      setCurrentState('idle');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    // WebSocket 연결 로직 (향후 구현)
    console.log('WebSocket 연결 설정');
  };

  const loadGenerationResult = async () => {
    try {
      const data = await adminApi.getGenerationResults(postId);
      setResult(data);
      setCurrentState('completed');
    } catch (err) {
      setError('결과 로드 실패');
      console.error(err);
    }
  };

  // 컴포넌트 렌더링
  if (loading && !preGenerationData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">데이터 로드 중...</p>
        </div>
      </div>
    );
  }

  if (error && currentState === 'idle') {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 mb-4">{error}</p>
        <button
          onClick={loadPreGenerationData}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">AI 콘텐츠 생성</h2>
        <div className="text-sm text-gray-500">
          Post ID: {postId}
        </div>
      </div>

      {/* 상태별 콘텐츠 */}
      {currentState === 'idle' && preGenerationData && (
        <PreGenerationView
          data={preGenerationData}
          onStart={startGeneration}
          loading={loading}
        />
      )}

      {currentState === 'running' && (
        <GenerationProgressView
          progress={progress}
          onStop={() => setCurrentState('idle')}
        />
      )}

      {currentState === 'completed' && result && (
        <GenerationResultView
          result={result}
          onRestart={startGeneration}
        />
      )}

      {/* 에러 표시 */}
      {error && currentState !== 'idle' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-red-600">{error}</p>
        </div>
      )}
    </div>
  );
}

// 생성 전 뷰 컴포넌트
function PreGenerationView({
  data,
  onStart,
  loading
}: {
  data: PreGenerationView;
  onStart: () => void;
  loading: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* 활용 데이터 프리뷰 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">활용 데이터</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_hospital_info ? 'text-green-600' : 'text-gray-400'}>
              🏥
            </span>
            <span className="text-sm">병원 정보</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_treatment_info ? 'text-green-600' : 'text-gray-400'}>
              🦷
            </span>
            <span className="text-sm">치료 정보</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_keywords_guide ? 'text-green-600' : 'text-gray-400'}>
              🔍
            </span>
            <span className="text-sm">키워드 가이드</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={(data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count) > 0 ? 'text-green-600' : 'text-gray-400'}>
              📷
            </span>
            <span className="text-sm">이미지 ({data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count}장)</span>
          </div>
        </div>
      </div>

      {/* 에이전트 실행 순서 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">실행 순서</h3>
        <div className="space-y-3">
          {data.agent_sequence.map((agent) => (
            <div key={agent.step} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <span className="text-sm font-medium text-gray-500">#{agent.step}</span>
                <span className="text-sm font-medium">{agent.name}</span>
                <span className="text-xs text-gray-600">{agent.description}</span>
              </div>
              <span className="text-xs text-gray-500">{agent.estimated_duration}초</span>
            </div>
          ))}
        </div>
      </div>

      {/* 실행 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={onStart}
          disabled={loading}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '시작 중...' : 'AI 생성 시작'}
        </button>
      </div>
    </div>
  );
}

// 실행 중 뷰 컴포넌트
function GenerationProgressView({
  progress,
  onStop
}: {
  progress: GenerationProgress | null;
  onStop: () => void;
}) {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <h3 className="text-lg font-medium text-gray-900">AI 생성 진행 중</h3>
        <p className="text-sm text-gray-600 mt-2">콘텐츠를 생성하고 있습니다...</p>
      </div>

      {/* 진행 상태 (임시) */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <h4 className="text-md font-medium text-gray-900 mb-4">진행 상태</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">데이터 집계</span>
            <span className="text-sm text-green-600">완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">입력 검증</span>
            <span className="text-sm text-green-600">완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">계획 수립</span>
            <span className="text-sm text-green-600">완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">제목 생성</span>
            <span className="text-sm text-blue-600">진행 중...</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onStop}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          중단
        </button>
      </div>
    </div>
  );
}

// 완료 뷰 컴포넌트
function GenerationResultView({
  result,
  onRestart
}: {
  result: GenerationResult;
  onRestart: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* 결과 요약 */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">생성 결과</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            result.overall_status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {result.overall_status === 'completed' ? '성공' : '실패'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm text-gray-600">총 소요 시간</span>
            <p className="text-lg font-medium">{Math.round(result.total_duration)}초</p>
          </div>
          <div>
            <span className="text-sm text-gray-600">성공한 에이전트</span>
            <p className="text-lg font-medium">{result.successful_agents}/{result.total_agents}</p>
          </div>
        </div>

        {/* 평가 점수 */}
        {result.evaluation_scores && (
          <div className="border-t pt-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">평가 점수</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs text-gray-600">SEO 점수</span>
                <p className="text-sm font-medium">{result.evaluation_scores.seo_score || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs text-gray-600">법률 준수</span>
                <p className="text-sm font-medium">{result.evaluation_scores.legal_score || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 최종 콘텐츠 */}
      {result.final_content && (
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">최종 콘텐츠</h3>

          {result.final_content.title && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2">제목</h4>
              <p className="text-md font-medium text-gray-900">{result.final_content.title}</p>
            </div>
          )}

          {result.final_content.content && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">본문</h4>
              <div className="text-sm text-gray-700 whitespace-pre-wrap max-h-64 overflow-y-auto border rounded p-3 bg-gray-50">
                {result.final_content.content}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 액션 버튼 */}
      <div className="flex justify-center space-x-4">
        <button
          onClick={onRestart}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          재생성
        </button>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          승인
        </button>
      </div>
    </div>
  );
}
