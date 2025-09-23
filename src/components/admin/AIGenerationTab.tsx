import React, { useState, useEffect } from 'react';
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
    version: string;
    category: string;
    description?: string;
    items_count?: number;
    items: Array<{
      id: string;
      name: string;
      description?: string;
      weight: number;
    }>;
    performance_score?: number;
    success_rate?: number;
  }>;
  model_settings: {
    primary_model: string;
    fallback_model: string;
    temperature: number;
    max_output_tokens: number;
    top_p: number;
    agent_configs?: Array<{
      agent_type: string;
      model: string;
      temperature: number;
      max_tokens: number;
    }>;
  };
  estimated_duration: number;
}

interface GenerationProgress {
  current_step?: string;
  progress_percent?: number;
  total_steps?: number;
  completed_steps?: number;
  steps?: Record<string, {
    status: string;
    duration?: number;
    step_name?: string;
  }>;
  currentAgent?: string;
  agentStatus?: 'pending' | 'running' | 'completed' | 'failed';
  progress?: number;
  logs?: Array<{
    timestamp: string;
    message: string;
    level: 'info' | 'warning' | 'error';
  }>;
  currentResult?: any;
  completedResults?: any[];
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

  // 팝업 상태
  const [showInputDataPopup, setShowInputDataPopup] = useState(false);
  const [inputDataDetails, setInputDataDetails] = useState<any>(null);
  const [inputDataType, setInputDataType] = useState<string>('');
  const [showChecklistPopup, setShowChecklistPopup] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<any>(null);
  const [checklistDetails, setChecklistDetails] = useState<any>(null);
  const [showPromptPopup, setShowPromptPopup] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<{key: string, data: any} | null>(null);
  const [promptDetails, setPromptDetails] = useState<any>(null);
  const [showAgentConfigs, setShowAgentConfigs] = useState(false);

  // WebSocket 및 실시간 진행 상태
  const [websocket, setWebsocket] = useState<WebSocket | null>(null);
  const [pipelineStatus, setPipelineStatus] = useState<any>(null);

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

      // 잠시 기다렸다가 WebSocket을 통해 파이프라인 시작
      setTimeout(() => {
        if (websocket && websocket.readyState === WebSocket.OPEN) {
          websocket.send(JSON.stringify({
            type: 'start_pipeline',
            input_data: {},
            config: { websocket_enabled: true }
          }));
        } else {
          // WebSocket 연결 실패 시 REST API로 폴백
          console.log('WebSocket 연결 실패, REST API로 폴백');
          adminApi.controlGeneration(postId, {
            action: 'start',
            parameters: {}
          }).catch(err => {
            console.error('생성 시작 실패:', err);
            setError('생성 시작에 실패했습니다');
            setCurrentState('idle');
          });
        }
      }, 1000); // WebSocket 연결 대기

    } catch (err) {
      setError('생성 시작 실패');
      setCurrentState('idle');
      console.error(err);
      setLoading(false);
    }
  };

  const setupWebSocket = () => {
    try {
      // 기존 연결이 있으면 닫기
      if (websocket) {
        websocket.close();
      }

      // WebSocket 연결
      const wsUrl = `ws://localhost:8000/api/v1/pipeline/ws/posts/${postId}/generation`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('WebSocket 연결됨');
        setWebsocket(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log('WebSocket 메시지 수신:', data);

          if (data.type === 'pipeline_status') {
            setPipelineStatus(data.data);
            updateProgressFromPipelineStatus(data.data);
          } else if (data.type === 'step_started') {
            // 단계 시작 알림
            console.log(`${data.data.step_name} 시작: ${data.data.description}`);
            updateStepStatus(data.data.step, 'running', data.data.step_name);
          } else if (data.type === 'step_completed') {
            // 단계 완료 알림
            console.log(`${data.data.step_name} 완료: ${data.data.duration?.toFixed(1)}초`);
            updateStepStatus(data.data.step, 'completed', data.data.step_name, data.data.duration);
          } else if (data.type === 'pipeline_completed') {
            // 파이프라인 완료
            console.log('파이프라인 완료:', data.data);

            // 생성 결과 가져오기 (비동기 함수로 분리)
            const loadResult = async () => {
              try {
                const result = await adminApi.getGenerationResults(postId);
                setResult(result);
              } catch (error) {
                console.error('결과 조회 실패:', error);
                // WebSocket 데이터에서 기본 결과 생성
                setResult({
                  post_id: postId,
                  overall_status: 'completed',
                  total_duration: data.data.total_duration || 0,
                  successful_agents: 6,
                  total_agents: 6,
                  agent_results: data.data.results || {},
                  created_at: new Date().toISOString()
                });
              }
            };

            loadResult();
            setCurrentState('completed');
          } else if (data.type === 'pipeline_result') {
            setCurrentState('completed');
            setResult(data.data);
          } else if (data.type === 'error') {
            setError(data.message);
            setCurrentState('idle');
          }
        } catch (error) {
          console.error('WebSocket 메시지 파싱 실패:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket 오류:', error);
        setError('실시간 모니터링 연결에 실패했습니다');
      };

      ws.onclose = () => {
        console.log('WebSocket 연결 종료');
        setWebsocket(null);
      };

    } catch (error) {
      console.error('WebSocket 설정 실패:', error);
      setError('실시간 모니터링 연결에 실패했습니다');
    }
  };

  const updateProgressFromPipelineStatus = (pipelineData: any) => {
    if (!pipelineData || !pipelineData.steps) return;

    const steps = pipelineData.steps;
    const totalSteps = Object.keys(steps).length;
    let completedSteps = 0;
    let currentStep = '';

    // 각 단계의 상태 확인
    Object.entries(steps).forEach(([agentType, stepData]: [string, any]) => {
      if (stepData.status === 'completed') {
        completedSteps++;
      } else if (stepData.status === 'running') {
        currentStep = agentType;
      }
    });

    const progressPercent = Math.round((completedSteps / totalSteps) * 100);

    setProgress({
      current_step: currentStep || '진행 중',
      progress_percent: progressPercent,
      total_steps: totalSteps,
      completed_steps: completedSteps,
      steps: steps
    });
  };

  const updateStepStatus = (step: string, status: string, stepName?: string, duration?: number) => {
    setProgress(prevProgress => {
      if (!prevProgress) {
        // 초기 progress 객체가 없을 때
        return {
          current_step: step,
          progress_percent: 0,
          total_steps: 6,
          completed_steps: status === 'completed' ? 1 : 0,
          steps: {
            [step]: {
              status,
              duration,
              step_name: stepName
            }
          }
        };
      }

      const updatedSteps = { ...prevProgress.steps };
      updatedSteps[step] = {
        status,
        duration,
        step_name: stepName
      };

      // 완료된 단계 수 계산
      let completedSteps = 0;
      Object.values(updatedSteps).forEach((stepData: any) => {
        if (stepData.status === 'completed') {
          completedSteps++;
        }
      });

      const progressPercent = prevProgress.total_steps ? Math.round((completedSteps / prevProgress.total_steps) * 100) : 0;

      return {
        ...prevProgress,
        current_step: status === 'running' ? step : prevProgress.current_step,
        progress_percent: progressPercent,
        completed_steps: completedSteps,
        steps: updatedSteps
      };
    });
  };

  // 팝업 핸들러
  const handleInputDataClick = async (dataType: string) => {
    try {
      const data = await adminApi.getPostInputData(postId);
      setInputDataDetails(data);
      setInputDataType(dataType);
      setShowInputDataPopup(true);
    } catch (error) {
      console.error('입력 데이터 조회 실패:', error);
    }
  };

  const handleChecklistClick = async (checklist: any) => {
    try {
      const details = await adminApi.getChecklistDetails(postId, checklist.name);
      setSelectedChecklist(checklist);
      setChecklistDetails(details);
      setShowChecklistPopup(true);
    } catch (error) {
      console.error('체크리스트 상세 조회 실패:', error);
      setError('체크리스트 데이터를 불러올 수 없습니다. 실제 데이터베이스에 데이터가 존재하는지 확인해주세요.');
    }
  };

  const handlePromptClick = async (key: string, data: any) => {
    try {
      const details = await adminApi.getPromptDetails(postId, key);
      setSelectedPrompt({ key, data });
      setPromptDetails(details);
      setShowPromptPopup(true);
    } catch (error) {
      console.error('프롬프트 상세 조회 실패:', error);
      setError('프롬프트 데이터를 불러올 수 없습니다. 실제 데이터베이스에 데이터가 존재하는지 확인해주세요.');
    }
  };

  const closePopups = () => {
    setShowInputDataPopup(false);
    setInputDataDetails(null);
    setInputDataType('');
    setShowChecklistPopup(false);
    setSelectedChecklist(null);
    setChecklistDetails(null);
    setShowPromptPopup(false);
    setSelectedPrompt(null);
    setPromptDetails(null);
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
          onInputDataClick={handleInputDataClick}
          onChecklistClick={handleChecklistClick}
          onPromptClick={handlePromptClick}
          showAgentConfigs={showAgentConfigs}
          onToggleAgentConfigs={() => setShowAgentConfigs(!showAgentConfigs)}
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

      {/* 팝업 모달들 */}
      {showInputDataPopup && inputDataDetails && (
        <InputDataPopup
          data={inputDataDetails}
          dataType={inputDataType}
          onClose={closePopups}
        />
      )}

      {showChecklistPopup && selectedChecklist && (
        <ChecklistPopup
          checklist={selectedChecklist}
          details={checklistDetails}
          onClose={closePopups}
        />
      )}

      {showPromptPopup && selectedPrompt && (
        <PromptPopup
          promptKey={selectedPrompt.key}
          promptData={selectedPrompt.data}
          details={promptDetails}
          onClose={closePopups}
        />
      )}
    </div>
  );
}

// 체크리스트 팝업 컴포넌트
function ChecklistPopup({ checklist, details, onClose }: { checklist: any; details: any; onClose: () => void }) {
  // ESC 키와 배경 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // checklist_items가 JSON 문자열인 경우 파싱 (useMemo로 변경하여 렌더링 중 setState 방지)
  const checklistItems = React.useMemo(() => {
    if (!details?.checklist_items) {
      return [];
    }

    try {
      if (typeof details.checklist_items === 'string') {
        const parsed = JSON.parse(details.checklist_items);
        return Array.isArray(parsed) ? parsed : [];
      } else if (Array.isArray(details.checklist_items)) {
        return details.checklist_items;
      } else {
        return [];
      }
    } catch (error) {
      console.error('체크리스트 아이템 파싱 실패:', error);
      return [];
    }
  }, [details?.checklist_items]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b" style={{borderBottomColor: 'rgba(74, 124, 158, 0.3)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold" style={{color: '#2A485E'}}>{checklist.name}</h2>
              <span className="text-sm px-2 py-1 rounded text-white" style={{backgroundColor: '#4A7C9E'}}>
                v{checklist.version}
              </span>
              <span className="text-sm px-2 py-1 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                {checklist.category}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          {checklist.description && (
            <p className="text-sm mt-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>{checklist.description}</p>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <h3 className="text-md font-medium mb-4" style={{color: '#2A485E'}}>체크리스트 항목</h3>
          <div className="space-y-3">
            {checklistItems && checklistItems.length > 0 ? (
              checklistItems.map((item: any, idx: number) => (
                <div key={idx} className="border rounded-lg p-4" style={{borderColor: 'rgba(74, 124, 158, 0.2)'}}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <span className="text-xs font-mono px-2 py-1 rounded" style={{backgroundColor: 'rgba(74, 124, 158, 0.1)', color: '#4A7C9E'}}>
                          {item.id}
                        </span>
                        <span className="font-medium" style={{color: '#2A485E'}}>{item.name}</span>
                        <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                          가중치: {item.weight}
                        </span>
                      </div>
                      {item.description && (
                        <p className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>{item.description}</p>
                      )}
                    </div>
                    <span className="text-green-600 ml-4 text-lg">✓</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>체크리스트 항목이 없습니다.</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// 입력 데이터 팝업 컴포넌트
function InputDataPopup({ data, dataType, onClose }: { data: any; dataType?: string; onClose: () => void }) {
  // ESC 키와 배경 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  const renderJsonData = (obj: any, title: string) => {
    if (!obj || (typeof obj === 'object' && Object.keys(obj).length === 0)) {
      return (
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-3" style={{color: '#2A485E'}}>{title}</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>데이터가 없습니다.</span>
          </div>
        </div>
      );
    }

    let displayText = '';
    try {
      if (typeof obj === 'string') {
        displayText = obj;
      } else if (typeof obj === 'object') {
        displayText = JSON.stringify(obj, null, 2);
      } else {
        displayText = String(obj);
      }
    } catch (error) {
      displayText = '데이터를 표시할 수 없습니다.';
    }

    return (
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-3" style={{color: '#2A485E'}}>{title}</h3>
        <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
          <pre className="text-sm whitespace-pre-wrap font-mono" style={{color: '#2A485E'}}>
            {displayText}
          </pre>
        </div>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        <div className="p-6 border-b" style={{borderBottomColor: 'rgba(74, 124, 158, 0.3)'}}>
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{color: '#2A485E'}}>
              {dataType === 'hospital_info' && '병원 정보 상세'}
              {dataType === 'treatment_info' && '치료 정보 상세'}
              {dataType === 'medical_service_info' && '의료 서비스 정보 상세'}
              {dataType === 'post_materials' && '포스트 자료 상세'}
              {dataType === 'keywords_guide' && '키워드 가이드 상세'}
              {dataType === 'clinical_context' && '임상 맥락 상세'}
              {!dataType && '활용 데이터 상세'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {dataType === 'hospital_info' && (
            <div>
              {renderJsonData(data.hospital_info, "병원 정보")}
            </div>
          )}

          {dataType === 'treatment_info' && (
            <div>
              {renderJsonData(data.treatment_info, "치료 정보")}
            </div>
          )}

          {dataType === 'medical_service_info' && (
            <div>
              {renderJsonData(data.medical_service_info, "의료 서비스 정보")}
            </div>
          )}

          {dataType === 'post_materials' && (
            <div>
              {renderJsonData(data.post_materials, "포스트 자료")}
            </div>
          )}

          {dataType === 'keywords_guide' && (
            <div>
              {renderJsonData(data.keywords_guide, "키워드 가이드")}
            </div>
          )}

          {dataType === 'clinical_context' && (
            <div>
              <div className="bg-gray-50 rounded-lg p-4">
                {data.clinical_context && typeof data.clinical_context === 'object' ? (
                  <div className="space-y-4">
                    {data.clinical_context.symptom_description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>증상 설명</h4>
                        <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                          {String(data.clinical_context.symptom_description)}
                        </p>
                      </div>
                    )}
                    {data.clinical_context.procedure_description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>진단 과정</h4>
                        <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                          {String(data.clinical_context.procedure_description)}
                        </p>
                      </div>
                    )}
                    {data.clinical_context.treatment_description && (
                      <div>
                        <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>치료 과정</h4>
                        <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                          {String(data.clinical_context.treatment_description)}
                        </p>
                      </div>
                    )}
                    {data.clinical_context.updated_at && (
                      <div>
                        <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>최종 업데이트</h4>
                        <p className="text-sm" style={{color: '#2A485E'}}>
                          {(() => {
                            try {
                              return new Date(data.clinical_context.updated_at).toLocaleString('ko-KR');
                            } catch {
                              return String(data.clinical_context.updated_at);
                            }
                          })()}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                    {typeof data.clinical_context === 'string' ? data.clinical_context : "임상 맥락 데이터가 없습니다."}
                  </p>
                )}
              </div>
            </div>
          )}

          {!dataType && (
            <>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {renderJsonData(data.hospital_info, "병원 정보")}
                {renderJsonData(data.treatment_info, "치료 정보")}
                {renderJsonData(data.medical_service_info, "의료 서비스 정보")}
                {renderJsonData(data.post_materials, "포스트 자료")}
                {renderJsonData(data.keywords_guide, "키워드 가이드")}
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3" style={{color: '#2A485E'}}>임상 맥락</h3>
                <div className="bg-gray-50 rounded-lg p-4">
                  {data.clinical_context && typeof data.clinical_context === 'object' ? (
                    <div className="space-y-4">
                      {data.clinical_context.symptom_description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>증상 설명</h4>
                          <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                            {String(data.clinical_context.symptom_description)}
                          </p>
                        </div>
                      )}
                      {data.clinical_context.procedure_description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>진단 과정</h4>
                          <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                            {String(data.clinical_context.procedure_description)}
                          </p>
                        </div>
                      )}
                      {data.clinical_context.treatment_description && (
                        <div>
                          <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>치료 과정</h4>
                          <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                            {String(data.clinical_context.treatment_description)}
                          </p>
                        </div>
                      )}
                      {data.clinical_context.updated_at && (
                        <div>
                          <h4 className="text-sm font-medium mb-1" style={{color: '#4A7C9E'}}>최종 업데이트</h4>
                          <p className="text-sm" style={{color: '#2A485E'}}>
                            {(() => {
                              try {
                                return new Date(data.clinical_context.updated_at).toLocaleString('ko-KR');
                              } catch {
                                return String(data.clinical_context.updated_at);
                              }
                            })()}
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <p className="text-sm whitespace-pre-wrap" style={{color: '#2A485E'}}>
                      {typeof data.clinical_context === 'string' ? data.clinical_context : "임상 맥락 데이터가 없습니다."}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <h3 className="text-lg font-medium mb-3" style={{color: '#2A485E'}}>이미지 정보</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">🏥</div>
                    <div className="text-sm font-medium" style={{color: '#2A485E'}}>병원 이미지</div>
                    <div className="text-lg font-bold" style={{color: '#4A7C9E'}}>{data.universal_images?.hospital_images_count || 0}장</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="text-2xl mb-2">📄</div>
                    <div className="text-sm font-medium" style={{color: '#2A485E'}}>포스트 이미지</div>
                    <div className="text-lg font-bold" style={{color: '#4A9E8C'}}>{data.universal_images?.post_images_count || 0}장</div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// 프롬프트 팝업 컴포넌트
function PromptPopup({ promptKey, promptData, details, onClose }: { promptKey: string; promptData: any; details: any; onClose: () => void }) {
  // ESC 키와 배경 클릭으로 닫기
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={handleBackdropClick}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-hidden">
        <div className="p-6 border-b" style={{borderBottomColor: 'rgba(74, 124, 158, 0.3)'}}>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <h2 className="text-lg font-semibold capitalize" style={{color: '#2A485E'}}>
                {promptKey.replace('_', ' ')} 프롬프트
              </h2>
              {promptData.version && (
                <span className="text-sm px-2 py-1 rounded text-white" style={{backgroundColor: '#4A7C9E'}}>
                  v{promptData.version}
                </span>
              )}
              {promptData.is_active && (
                <span className="text-sm px-2 py-1 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                  활성
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-xl font-bold"
            >
              ×
            </button>
          </div>
          {promptData.description && (
            <p className="text-sm mt-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>{promptData.description}</p>
          )}
        </div>

        <div className="p-6 overflow-y-auto max-h-96">
          <div className="bg-gray-50 rounded-lg p-4">
            <pre className="text-sm whitespace-pre-wrap font-mono" style={{color: '#2A485E'}}>
              {details?.prompt_text || '프롬프트 텍스트를 불러올 수 없습니다.'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}

// 생성 전 뷰 컴포넌트
function PreGenerationView({
  data,
  onStart,
  loading,
  onInputDataClick,
  onChecklistClick,
  onPromptClick,
  showAgentConfigs,
  onToggleAgentConfigs
}: {
  data: PreGenerationView;
  onStart: () => void;
  loading: boolean;
  onInputDataClick: (dataType: string) => void;
  onChecklistClick: (checklist: any) => void;
  onPromptClick: (key: string, data: any) => void;
  showAgentConfigs: boolean;
  onToggleAgentConfigs: () => void;
}) {
  return (
    <div className="space-y-6">
      {/* 활용 데이터 */}
      <div
        className="bg-white border rounded-lg p-6"
        style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}
      >
        <div className="mb-4">
          <h3 className="text-lg font-medium" style={{color: '#2A485E'}}>활용 데이터</h3>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('hospital_info')}
          >
            <span className={data.input_data_summary.has_hospital_info ? 'text-green-600' : 'text-gray-400'}>
              🏥
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>병원 정보</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_hospital_info ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_hospital_info ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('treatment_info')}
          >
            <span className={data.input_data_summary.has_treatment_info ? 'text-green-600' : 'text-gray-400'}>
              🦷
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>치료 정보</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_treatment_info ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_treatment_info ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('medical_service_info')}
          >
            <span className={data.input_data_summary.has_medical_service_info ? 'text-green-600' : 'text-gray-400'}>
              ⚕️
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>의료 서비스</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_medical_service_info ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_medical_service_info ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('post_materials')}
          >
            <span className={data.input_data_summary.has_post_materials ? 'text-green-600' : 'text-gray-400'}>
              📄
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>포스트 자료</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_post_materials ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_post_materials ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('keywords_guide')}
          >
            <span className={data.input_data_summary.has_keywords_guide ? 'text-green-600' : 'text-gray-400'}>
              🔍
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>키워드 가이드</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_keywords_guide ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_keywords_guide ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div
            className="flex items-center space-x-2 p-2 rounded cursor-pointer hover:shadow-sm transition-shadow"
            style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}
            onClick={() => onInputDataClick('clinical_context')}
          >
            <span className={data.input_data_summary.has_clinical_context ? 'text-green-600' : 'text-gray-400'}>
              🏥
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>임상 맥락</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.has_clinical_context ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.has_clinical_context ? '있음' : '없음'}
            </span>
            <span className="text-xs ml-auto" style={{color: '#4A7C9E'}}>→</span>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded" style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}>
            <span className={(data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count) > 0 ? 'text-green-600' : 'text-gray-400'}>
              📷
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>이미지</span>
            <span className={`text-xs px-2 py-1 rounded ${
              (data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count) > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.hospital_images_count + data.input_data_summary.post_images_count}장
            </span>
          </div>
          <div className="flex items-center space-x-2 p-2 rounded" style={{backgroundColor: 'rgba(74, 124, 158, 0.05)'}}>
            <span className={data.input_data_summary.cache_hit ? 'text-blue-600' : 'text-gray-400'}>
              💾
            </span>
            <span className="text-sm font-medium" style={{color: '#2A485E'}}>캐시 히트</span>
            <span className={`text-xs px-2 py-1 rounded ${
              data.input_data_summary.cache_hit ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-600'
            }`}>
              {data.input_data_summary.cache_hit ? '적용' : '미적용'}
            </span>
          </div>
        </div>
      </div>

      {/* 활용 체크리스트 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>활용 체크리스트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.checklists_preview && data.checklists_preview.length > 0 ? (
            data.checklists_preview.map((checklist, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}
                onClick={() => onChecklistClick(checklist)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium truncate" style={{color: '#2A485E'}}>{checklist.name}</h4>
                  <div className="flex items-center space-x-1 ml-2">
                    <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{backgroundColor: '#4A7C9E'}}>
                      v{checklist.version}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                    {checklist.category}
                  </span>
                  <span className="text-xs" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
                    {checklist.items_count || 0}개 항목
                  </span>
                </div>

                {checklist.description && (
                  <p className="text-xs mt-2 line-clamp-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
                    {checklist.description}
                  </p>
                )}

                <div className="mt-2 flex justify-end">
                  <span className="text-xs font-medium" style={{color: '#4A7C9E'}}>자세히 보기 →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.5)'}}>체크리스트 데이터가 없습니다.</span>
            </div>
          )}
        </div>
      </div>

      {/* 활용 프롬프트 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h3 className="text-lg font-medium mb-4" style={{color: '#2A485E'}}>활용 프롬프트</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.prompts_preview && Object.keys(data.prompts_preview).length > 0 ? (
            Object.entries(data.prompts_preview).map(([key, prompt]) => (
              <div
                key={key}
                className="border rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
                style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}
                onClick={() => onPromptClick(key, prompt)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-medium capitalize" style={{color: '#2A485E'}}>{key.replace('_', ' ')}</h4>
                  <div className="flex items-center space-x-1">
                    {prompt.version && (
                      <span className="text-xs px-1.5 py-0.5 rounded text-white" style={{backgroundColor: '#4A7C9E'}}>
                        v{prompt.version}
                      </span>
                    )}
                    {prompt.is_active && (
                      <span className="text-xs px-1.5 py-0.5 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                        활성
                      </span>
                    )}
                  </div>
                </div>

                {prompt.description && (
                  <p className="text-xs mb-2 line-clamp-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
                    {prompt.description}
                  </p>
                )}

                {prompt.sample_text && (
                  <div className="text-xs line-clamp-3" style={{color: 'rgba(42, 72, 94, 0.6)'}}>
                    {prompt.sample_text}
                  </div>
                )}

                <div className="mt-2 flex justify-end">
                  <span className="text-xs font-medium" style={{color: '#4A7C9E'}}>전문 보기 →</span>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-8">
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
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>기본 모델:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>{data.model_settings?.primary_model || 'gemini-2.5-pro'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>폴백 모델:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>{data.model_settings?.fallback_model || 'gemini-2.5-flash-lite'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>온도:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>{data.model_settings?.temperature || 1.0}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>최대 토큰:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>{data.model_settings?.max_output_tokens || 32768}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>Top-P:</span>
              <span className="text-sm font-medium" style={{color: '#2A485E'}}>{data.model_settings?.top_p || 1.0}</span>
            </div>
          </div>

          {/* 에이전트별 모델 설정 */}
          {data.model_settings?.agent_configs && data.model_settings.agent_configs.length > 0 && (
            <div className="mt-4">
              <button
                onClick={onToggleAgentConfigs}
                className="flex items-center justify-between w-full text-left"
              >
                <h4 className="text-sm font-medium" style={{color: '#2A485E'}}>
                  에이전트별 설정 ({data.model_settings.agent_configs.length}개)
                </h4>
                <span className="text-sm" style={{color: '#4A7C9E'}}>
                  {showAgentConfigs ? '접기 ▲' : '펼치기 ▼'}
                </span>
              </button>

              {showAgentConfigs && (
                <div className="mt-3 pt-3 border-t space-y-2" style={{borderTopColor: 'rgba(74, 124, 158, 0.3)'}}>
                  {data.model_settings.agent_configs.map((config: any, index: number) => (
                    <div key={index} className="flex justify-between items-center py-1">
                      <span className="text-xs font-medium capitalize" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
                        {config.agent_type.replace('_', ' ')}:
                      </span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs" style={{color: '#2A485E'}}>{config.model}</span>
                        <span className="text-xs px-1.5 py-0.5 rounded" style={{backgroundColor: 'rgba(74, 158, 140, 0.1)', color: '#4A9E8C'}}>
                          T:{config.temperature}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
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
  // 에이전트 타입을 한글로 변환
  const getAgentDisplayName = (agentType: string) => {
    const nameMap: Record<string, string> = {
      'input': '데이터 집계',
      'plan': '콘텐츠 계획',
      'title': '제목 생성',
      'content': '본문 생성',
      'evaluation': '품질 평가',
      'edit': '콘텐츠 편집'
    };
    return nameMap[agentType] || agentType;
  };

  // 상태에 따른 색상과 텍스트
  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'completed':
        return { text: '완료', color: '#4A9E8C' };
      case 'running':
        return { text: '진행 중...', color: '#4A7C9E' };
      case 'failed':
        return { text: '실패', color: '#dc2626' };
      case 'pending':
        return { text: '대기 중', color: '#6b7280' };
      default:
        return { text: '알 수 없음', color: '#6b7280' };
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{borderColor: '#4A7C9E'}}></div>
        <h3 className="text-lg font-medium" style={{color: '#2A485E'}}>AI 생성 진행 중</h3>
        <p className="text-sm mt-2" style={{color: 'rgba(42, 72, 94, 0.7)'}}>
          {progress?.current_step ? `${getAgentDisplayName(progress.current_step)} 단계 진행 중` : '콘텐츠를 생성하고 있습니다...'}
        </p>
        {progress && (
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress.progress_percent}%` }}
              ></div>
            </div>
            <p className="text-xs mt-1" style={{color: 'rgba(42, 72, 94, 0.6)'}}>
              {progress.completed_steps}/{progress.total_steps} 단계 완료 ({progress.progress_percent}%)
            </p>
          </div>
        )}
      </div>

      {/* 진행 상태 */}
      <div className="bg-white border rounded-lg p-6" style={{borderColor: 'rgba(74, 124, 158, 0.3)'}}>
        <h4 className="text-md font-medium mb-4" style={{color: '#2A485E'}}>에이전트별 진행 상태</h4>
        <div className="space-y-3">
          {progress?.steps ? (
            Object.entries(progress.steps).map(([agentType, stepData]: [string, any]) => {
              const displayName = getAgentDisplayName(agentType);
              const statusDisplay = getStatusDisplay(stepData.status);

              return (
                <div key={agentType} className="flex items-center justify-between p-3 border rounded-lg" style={{borderColor: 'rgba(74, 124, 158, 0.1)'}}>
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: statusDisplay.color}}></div>
                    <span className="text-sm font-medium" style={{color: '#2A485E'}}>{displayName}</span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <span className="text-sm" style={{color: statusDisplay.color}}>
                      {statusDisplay.text}
                    </span>
                    {stepData.duration && (
                      <span className="text-xs text-gray-500">
                        {stepData.duration.toFixed(1)}초
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            // 기본 진행 상태 (실시간 데이터가 없을 때)
            <>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>데이터 집계</span>
                <span className="text-sm" style={{color: '#4A9E8C'}}>완료</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>콘텐츠 계획</span>
                <span className="text-sm" style={{color: '#4A9E8C'}}>완료</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>제목 생성</span>
                <span className="text-sm" style={{color: '#4A7C9E'}}>진행 중...</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>본문 생성</span>
                <span className="text-sm" style={{color: '#6b7280'}}>대기 중</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>품질 평가</span>
                <span className="text-sm" style={{color: '#6b7280'}}>대기 중</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm" style={{color: 'rgba(42, 72, 94, 0.7)'}}>콘텐츠 편집</span>
                <span className="text-sm" style={{color: '#6b7280'}}>대기 중</span>
              </div>
            </>
          )}
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
