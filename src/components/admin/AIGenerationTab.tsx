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
  postStatus?: string;
}

export default function AIGenerationTab({ postId, postStatus }: AIGenerationTabProps) {
  const [currentState, setCurrentState] = useState<'idle' | 'running' | 'completed'>('idle');
  const [preGenerationData, setPreGenerationData] = useState<PreGenerationView | null>(null);
  const [progress, setProgress] = useState<GenerationProgress | null>(null);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 포스트 상태에 따라 초기 상태 설정
  useEffect(() => {
    if (postStatus === 'generation_completed') {
      setCurrentState('completed');
    } else {
      setCurrentState('idle');
    }
  }, [postStatus]);

  // 완료 상태일 때 결과 데이터 로드
  useEffect(() => {
    if (currentState === 'completed' && postId) {
      loadGenerationResult();
    }
  }, [currentState, postId]);

  // 생성 전 데이터 로드
  useEffect(() => {
    if (postId && currentState === 'idle') {
      loadPreGenerationData();
    }
  }, [postId, currentState]);

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

  const loadGenerationResult = async () => {
    try {
      setLoading(true);
      const data = await adminApi.getGenerationResults(postId);
      setResult(data);
    } catch (err) {
      setError('생성 결과 로드 실패');
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
        <h2 className="text-xl font-semibold" style={{color: '#2A485E'}}>AI 콘텐츠 생성</h2>
        <div className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
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
      {/* 활용 데이터 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>활용 데이터</h3>
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
            <span className={data.input_data_summary.has_medical_service_info ? 'text-green-600' : 'text-gray-400'}>
              ⚕️
            </span>
            <span className="text-sm">의료 서비스</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_post_materials ? 'text-green-600' : 'text-gray-400'}>
              📄
            </span>
            <span className="text-sm">포스트 자료</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_keywords_guide ? 'text-green-600' : 'text-gray-400'}>
              🔍
            </span>
            <span className="text-sm">키워드 가이드</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.has_clinical_context ? 'text-green-600' : 'text-gray-400'}>
              🏥
            </span>
            <span className="text-sm">임상 맥락</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={(data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count) > 0 ? 'text-green-600' : 'text-gray-400'}>
              📷
            </span>
            <span className="text-sm">이미지 ({data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count}장)</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className={data.input_data_summary.cache_hit ? 'text-blue-600' : 'text-gray-400'}>
              💾
            </span>
            <span className="text-sm">캐시 히트</span>
          </div>
        </div>
      </div>

      {/* 활용 체크리스트 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>활용 체크리스트</h3>
        <div className="space-y-4">
          {data.checklists_preview && data.checklists_preview.length > 0 ? (
            data.checklists_preview.map((checklist, index) => (
              <div key={index} className="border rounded-lg p-4" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
                <h4 className="text-md font-medium mb-3" style={{color: '#2A485E'}}>{checklist.name}</h4>
                <ul className="space-y-2">
                  {checklist.criteria && checklist.criteria.length > 0 ? (
                    checklist.criteria.map((criterion, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="mt-1" style={{color: '#4A9E8C'}}>✓</span>
                        <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>{criterion}</span>
                      </li>
                    ))
                  ) : (
                    <li className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>체크리스트 항목이 없습니다.</li>
                  )}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>체크리스트 데이터가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 활용 프롬프트 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>활용 프롬프트</h3>
        <div className="space-y-4">
          {data.prompts_preview && Object.keys(data.prompts_preview).length > 0 ? (
            Object.entries(data.prompts_preview).map(([key, prompt]) => (
              <div key={key} className="border rounded-lg p-4" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
                <h4 className="text-md font-medium mb-2" style={{color: '#2A485E'}}>{key}</h4>
                <div className="p-3 rounded text-sm whitespace-pre-wrap" style={{backgroundColor: 'rgba(74, 124, 158, 0.1)', color: 'rgba(42, 72, 94, 0.7)'}}>
                  {typeof prompt === 'string' ? prompt : JSON.stringify(prompt, null, 2)}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>프롬프트 데이터가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 모델 설정 및 예상 소요 시간 */}
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>모델 설정</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>모델:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>GPT-4</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>온도:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>0.7</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>최대 토큰:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>4000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>품질 모드:</span>
              <span className="text-sm font-medium" style={{color: '#4A7C9E'}}>고품질</span>
            </div>
          </div>
        </div>

        <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>예상 소요 시간</h3>
          <div className="text-center">
            <div className="text-3xl font-bold mb-2" style={{color: '#4A7C9E'}}>
              {Math.round(data.estimated_duration / 60)}분
            </div>
            <div className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
              ({data.estimated_duration}초)
            </div>
            <div className="text-xs mt-2" style={{color: 'rgba(42, 72, 94, 0.3)'}}>
              {data.agent_sequence.length}개 에이전트 실행
            </div>
          </div>
        </div>
      </div>

      {/* 에이전트 실행 순서 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>실행 순서</h3>
        <div className="space-y-3">
          {data.agent_sequence && data.agent_sequence.length > 0 ? (
            data.agent_sequence.map((agent) => (
              <div key={agent.step} className="flex items-center justify-between p-3 rounded-lg" style={{backgroundColor: 'rgba(74, 124, 158, 0.1)'}}>
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium" style={{color: 'rgba(42, 72, 94, 0.7)'}}>#{agent.step}</span>
                  <span className="text-sm font-medium" style={{color: '#2A485E'}}>{agent.name}</span>
                  <span className="text-xs" style={{color: 'rgba(42, 72, 94, 0.7)'}}>{agent.description}</span>
                </div>
                <span className="text-xs" style={{color: 'rgba(42, 72, 94, 0.3)'}}>{agent.estimated_duration}초</span>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>에이전트 실행 순서 데이터가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 실행 버튼 */}
      <div className="flex justify-center">
        <button
          onClick={onStart}
          disabled={loading}
          className="px-6 py-3 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            backgroundColor: '#4A7C9E',
            color: 'white'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a6478';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A7C9E';
          }}
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#4A7C9E'}}></div>
        <h3 className="text-lg font-medium" style={{color: '#2A485E'}}>AI 생성 진행 중</h3>
        <p className="text-sm mt-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>콘텐츠를 생성하고 있습니다...</p>
      </div>

      {/* 진행 상태 (임시) */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h4 className="text-md font-medium mb-4" style={{color: '#2A485E'}}>진행 상태</h4>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>데이터 집계</span>
            <span className="text-sm" style={{color: '#4A9E8C'}}>완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>입력 검증</span>
            <span className="text-sm" style={{color: '#4A9E8C'}}>완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>계획 수립</span>
            <span className="text-sm" style={{color: '#4A9E8C'}}>완료</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>제목 생성</span>
            <span className="text-sm" style={{color: '#4A7C9E'}}>진행 중...</span>
          </div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <button
          onClick={onStop}
          className="px-4 py-2 rounded-lg text-white"
          style={{
            backgroundColor: '#dc2626'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#b91c1c';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#dc2626';
          }}
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
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium" style={{color: '#2A485E'}}>생성 결과</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium`} style={{
            backgroundColor: result.overall_status === 'completed' ? 'rgba(74, 158, 140, 0.1)' : 'rgba(220, 38, 38, 0.1)',
            color: result.overall_status === 'completed' ? '#4A9E8C' : '#dc2626'
          }}>
            {result.overall_status === 'completed' ? '성공' : '실패'}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>총 소요 시간</span>
            <p className="text-lg font-medium" style={{color: '#2A485E'}}>{Math.round(result.total_duration)}초</p>
          </div>
          <div>
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>성공한 에이전트</span>
            <p className="text-lg font-medium" style={{color: '#2A485E'}}>{result.successful_agents}/{result.total_agents}</p>
          </div>
        </div>

        {/* 평가 점수 */}
        {result.evaluation_scores && (
          <div className="pt-4" style={{borderTopColor: 'rgba(74, 124, 158, 0.3)', borderTopWidth: '1px'}}>
            <h4 className="text-sm font-medium mb-2" style={{color: '#2A485E'}}>평가 점수</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-xs" style={{color: 'rgba(42, 72, 94, 0.7)'}}>SEO 점수</span>
                <p className="text-sm font-medium" style={{color: '#2A485E'}}>{result.evaluation_scores.seo_score || 'N/A'}</p>
              </div>
              <div>
                <span className="text-xs" style={{color: 'rgba(42, 72, 94, 0.7)'}}>법률 준수</span>
                <p className="text-sm font-medium" style={{color: '#2A485E'}}>{result.evaluation_scores.legal_score || 'N/A'}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 최종 콘텐츠 */}
      {result.final_content && (
        <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
          <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>최종 콘텐츠</h3>

          {result.final_content.title && (
            <div className="mb-4">
              <h4 className="text-sm font-medium mb-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>제목</h4>
              <p className="text-md font-medium" style={{color: '#2A485E'}}>{result.final_content.title}</p>
            </div>
          )}

          {result.final_content.content && (
            <div>
              <h4 className="text-sm font-medium mb-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>본문</h4>
              <div className="text-sm whitespace-pre-wrap max-h-64 overflow-y-auto border rounded p-3" style={{
                color: 'rgba(42, 72, 94, 0.7)',
                borderColor: 'rgba(74, 124, 158, 0.3)',
                backgroundColor: 'rgba(74, 124, 158, 0.1)'
              }}>
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
          className="px-4 py-2 rounded-lg text-white"
          style={{
            backgroundColor: '#4A7C9E'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a6478';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A7C9E';
          }}
        >
          재생성
        </button>
        <button
          className="px-4 py-2 rounded-lg text-white"
          style={{
            backgroundColor: '#4A9E8C'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#3a8576';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#4A9E8C';
          }}
        >
          승인
        </button>
      </div>
    </div>
  );
}
