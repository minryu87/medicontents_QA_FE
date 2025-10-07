'use client';

import { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';

interface QueueStatus {
  max_concurrent_pipelines: number;
  running_count: number;
  queued_count: number;
  completed_count_1h: number;
  total_processed: number;
  total_failed: number;
  running_jobs: RunningJob[];
  queued_jobs: QueuedJob[];
  completed_jobs_1h: CompletedJob[];
}

interface RunningJob {
  post_id: string;
  pipeline_id: string;
  started_at: string;
  elapsed_seconds: number;
}

interface QueuedJob {
  post_id: string;
  pipeline_id: string;
  queued_at: string;
  wait_seconds: number;
  position: number;
}

interface CompletedJob {
  post_id: string;
  pipeline_id: string;
  started_at: string;
  completed_at: string;
  duration: number;
  status: string;
  error?: string;
}

interface Metrics {
  avg_duration_seconds: number;
  avg_duration_minutes: number;
  theoretical_jobs_per_hour: number;
  actual_jobs_per_hour: number;
  success_rate: number;
  total_processed: number;
  total_failed: number;
  current_concurrent: number;
  max_concurrent: number;
}

interface PipelineLane {
  laneNumber: number;
  job: RunningJob | null;
  status: 'idle' | 'running';
  detailedStatus?: {
    current_stage: string;
    current_action: string;
    loop_info: { current: number; max: number } | null;
    completed_stages: string[];
    progress_percentage: number;
  };
}

export default function PipelineManagementPage() {
  const [queueStatus, setQueueStatus] = useState<QueueStatus | null>(null);
  const [metrics, setMetrics] = useState<Metrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [maxConcurrent, setMaxConcurrent] = useState(3);
  const [isUpdating, setIsUpdating] = useState(false);
  const [lanes, setLanes] = useState<PipelineLane[]>([]);

  // 파이프라인 레인 생성
  const createLanes = (maxConcurrent: number, runningJobs: RunningJob[]): PipelineLane[] => {
    const newLanes: PipelineLane[] = [];
    
    for (let i = 0; i < maxConcurrent; i++) {
      const job = runningJobs[i] || null;
      newLanes.push({
        laneNumber: i + 1,
        job,
        status: job ? 'running' : 'idle'
      });
    }
    
    return newLanes;
  };

  // 진행률 계산 (평균 소요 시간 기반)
  const calculateProgress = (elapsedSeconds: number, avgDurationSeconds: number): number => {
    if (!avgDurationSeconds || avgDurationSeconds === 0) return 0;
    const progress = (elapsedSeconds / avgDurationSeconds) * 100;
    return Math.min(Math.max(progress, 0), 100);
  };

  // 데이터 로드
  const loadData = async () => {
    try {
      const [statusRes, metricsRes, detailedRes] = await Promise.all([
        (adminApi as any).getPipelineQueueStatus(),
        (adminApi as any).getPipelineQueueMetrics(),
        (adminApi as any).getPipelineQueueDetailedStatus(),
      ]);

      if (statusRes.success && statusRes.data) {
        setQueueStatus(statusRes.data);
        setMaxConcurrent(statusRes.data.max_concurrent_pipelines);
        
        // 상세 정보와 함께 레인 생성
        const newLanes: PipelineLane[] = [];
        for (let i = 0; i < statusRes.data.max_concurrent_pipelines; i++) {
          const job = statusRes.data.running_jobs[i] || null;
          const detailedStatus = detailedRes.success && detailedRes.data 
            ? detailedRes.data.find((d: any) => d.pipeline_id === job?.pipeline_id)
            : null;
          
          newLanes.push({
            laneNumber: i + 1,
            job,
            status: job ? 'running' : 'idle',
            detailedStatus: detailedStatus ? {
              current_stage: detailedStatus.current_stage,
              current_action: detailedStatus.current_action,
              loop_info: detailedStatus.loop_info,
              completed_stages: detailedStatus.completed_stages,
              progress_percentage: detailedStatus.progress_percentage
            } : undefined
          });
        }
        setLanes(newLanes);
      }

      if (metricsRes.success && metricsRes.data) {
        setMetrics(metricsRes.data);
      }

      setLoading(false);
    } catch (error) {
      console.error('데이터 로드 실패:', error);
      setLoading(false);
    }
  };

  // 자동 새로고침 (3초마다)
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 3000);
    return () => clearInterval(interval);
  }, []);

  // 동시 실행 수 변경
  const handleUpdateMaxConcurrent = async () => {
    if (maxConcurrent < 1 || maxConcurrent > 10) {
      alert('1-10 사이의 값을 입력해주세요.');
      return;
    }

    setIsUpdating(true);
    try {
      const res = await (adminApi as any).updatePipelineQueueConfig(maxConcurrent);
      if (res.success) {
        alert(`최대 동시 실행 수가 ${maxConcurrent}개로 변경되었습니다.`);
        await loadData();
      }
    } catch (error) {
      console.error('설정 변경 실패:', error);
      alert('설정 변경에 실패했습니다.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">파이프라인 관리</h1>
          <p className="mt-2 text-gray-600">AI 생성 파이프라인의 큐와 성능을 모니터링하고 관리합니다</p>
        </div>
        <button
          onClick={loadData}
          className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          🔄 새로고침
        </button>
      </div>

      {/* 설정 카드 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚙️ 큐 설정</h2>
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              최대 동시 실행 수
            </label>
            <input
              type="number"
              min="1"
              max="10"
              value={maxConcurrent}
              onChange={(e) => setMaxConcurrent(parseInt(e.target.value) || 1)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="mt-1 text-sm text-gray-500">
              동시에 실행할 수 있는 파이프라인의 최대 개수 (1-10)
            </p>
          </div>
          <button
            onClick={handleUpdateMaxConcurrent}
            disabled={isUpdating}
            className="mt-6 px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:bg-gray-400 transition-colors"
          >
            {isUpdating ? '변경 중...' : '변경'}
          </button>
        </div>
      </div>

      {/* 현황 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">실행 중</p>
              <p className="mt-2 text-3xl font-bold text-blue-600">
                {queueStatus?.running_count || 0}
              </p>
            </div>
            <div className="text-4xl">⚡</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            / {queueStatus?.max_concurrent_pipelines || 0}개
          </p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">대기 중</p>
              <p className="mt-2 text-3xl font-bold text-yellow-600">
                {queueStatus?.queued_count || 0}
              </p>
            </div>
            <div className="text-4xl">⏳</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">큐에 대기 중인 작업</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">완료 (1시간)</p>
              <p className="mt-2 text-3xl font-bold text-green-600">
                {queueStatus?.completed_count_1h || 0}
              </p>
            </div>
            <div className="text-4xl">✅</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">최근 1시간 내 완료</p>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">성공률</p>
              <p className="mt-2 text-3xl font-bold text-purple-600">
                {metrics?.success_rate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="text-4xl">📊</div>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            총 {metrics?.total_processed || 0}개 처리
          </p>
        </div>
      </div>

      {/* 성능 지표 */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 성능 지표</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <p className="text-sm font-medium text-gray-600">평균 처리 시간</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {metrics?.avg_duration_minutes?.toFixed(1) || 0} 분
            </p>
            <p className="mt-1 text-sm text-gray-500">
              ({metrics?.avg_duration_seconds?.toFixed(0) || 0}초)
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">이론적 시간당 처리량</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {metrics?.theoretical_jobs_per_hour?.toFixed(1) || 0} 개
            </p>
            <p className="mt-1 text-sm text-gray-500">
              현재 설정 기준
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">실제 시간당 처리량</p>
            <p className="mt-2 text-2xl font-bold text-gray-900">
              {metrics?.actual_jobs_per_hour || 0} 개
            </p>
            <p className="mt-1 text-sm text-gray-500">
              최근 1시간 기준
            </p>
          </div>
        </div>
      </div>

      {/* 🛤️ 파이프라인 레인 (핵심 UI) */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🛤️ 병렬 라인 상태</h2>
        <div className="space-y-4">
          {lanes.map((lane) => (
            <div
              key={lane.laneNumber}
              className={`relative p-6 rounded-xl border-2 transition-all duration-300 ${
                lane.status === 'running'
                  ? 'bg-gradient-to-r from-green-50 to-blue-50 border-green-300 shadow-md'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              {/* 레인 헤더 */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-white ${
                    lane.status === 'running' ? 'bg-green-500 animate-pulse' : 'bg-gray-400'
                  }`}>
                    {lane.laneNumber}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-700">라인 {lane.laneNumber}</p>
                    <p className={`text-xs font-medium ${
                      lane.status === 'running' ? 'text-green-600' : 'text-gray-500'
                    }`}>
                      {lane.status === 'running' ? '🟢 실행 중' : '⚪ 유휴'}
                    </p>
                  </div>
                </div>
                
                {lane.job && (
                  <div className="text-right">
                    <p className="text-lg font-bold text-green-600">
                      {Math.floor(lane.job.elapsed_seconds / 60)}분 {Math.floor(lane.job.elapsed_seconds % 60)}초
                    </p>
                    <p className="text-xs text-gray-500">경과 시간</p>
                  </div>
                )}
              </div>

              {/* 작업 정보 */}
              {lane.job ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xl font-bold text-gray-900">📝 {lane.job.post_id}</p>
                      <p className="text-sm text-gray-600 mt-1 font-mono">
                        {lane.job.pipeline_id}
                      </p>
                    </div>
                  </div>

                  {/* 현재 단계 표시 (상세 정보) */}
                  {lane.detailedStatus && (
                    <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl">📍</span>
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-blue-900">
                            {lane.detailedStatus.current_stage}
                          </p>
                          <p className="text-xs text-blue-600">
                            {lane.detailedStatus.current_action}
                          </p>
                        </div>
                      </div>
                      
                      {/* Loop 정보 */}
                      {lane.detailedStatus.loop_info && (
                        <div className="mt-2 flex items-center space-x-2">
                          <span className="text-xs font-medium text-blue-700">
                            🔄 Loop {lane.detailedStatus.loop_info.current}/{lane.detailedStatus.loop_info.max}
                          </span>
                          <div className="flex-1 bg-blue-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all"
                              style={{
                                width: `${(lane.detailedStatus.loop_info.current / lane.detailedStatus.loop_info.max) * 100}%`
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* 완료된 단계 표시 */}
                  {lane.detailedStatus && lane.detailedStatus.completed_stages.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-medium text-gray-600 mb-2">진행 단계:</p>
                      <div className="flex flex-wrap gap-2">
                        {lane.detailedStatus.completed_stages.map((stage, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full"
                          >
                            ✅ {stage}
                          </span>
                        ))}
                        {lane.detailedStatus.current_stage !== 'Unknown' && (
                          <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full animate-pulse">
                            🔄 {lane.detailedStatus.current_stage.split(' ')[0]}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 진행률 바 */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-gray-700">전체 진행률</p>
                      <p className="text-sm font-bold text-green-600">
                        {lane.detailedStatus?.progress_percentage || calculateProgress(lane.job.elapsed_seconds, metrics?.avg_duration_seconds || 300).toFixed(0)}%
                      </p>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all duration-1000 ease-out"
                        style={{
                          width: `${lane.detailedStatus?.progress_percentage || calculateProgress(lane.job.elapsed_seconds, metrics?.avg_duration_seconds || 300)}%`
                        }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      시작: {new Date(lane.job.started_at).toLocaleTimeString('ko-KR')}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-4xl mb-2">💤</p>
                  <p className="text-sm text-gray-500">대기 중인 작업 없음</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 대기 중인 작업 */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">⏳ 대기열</h2>
          <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-semibold">
            {queueStatus?.queued_count || 0}개 대기 중
          </span>
        </div>
        
        {queueStatus && queueStatus.queued_jobs.length > 0 ? (
          <div className="space-y-3">
            {queueStatus.queued_jobs.map((job, index) => (
              <div
                key={job.pipeline_id}
                className="relative flex items-center p-4 bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 rounded-lg hover:shadow-md transition-all"
              >
                {/* 순서 배지 */}
                <div className="absolute -left-3 -top-3 flex items-center justify-center w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 text-white rounded-full font-bold text-lg shadow-lg">
                  {job.position}
                </div>
                
                <div className="flex-1 ml-6">
                  <p className="text-lg font-bold text-gray-900">📝 {job.post_id}</p>
                  <p className="text-sm text-gray-600 font-mono mt-1">{job.pipeline_id}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-bold text-yellow-700">
                    ⏱️ {Math.floor(job.wait_seconds / 60)}분 {Math.floor(job.wait_seconds % 60)}초
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    대기 시작: {new Date(job.queued_at).toLocaleTimeString('ko-KR')}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-4xl mb-2">✨</p>
            <p className="text-sm text-gray-500">대기 중인 작업이 없습니다</p>
          </div>
        )}
      </div>

      {/* 완료된 작업 (최근 1시간) */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">✅ 최근 완료 (1시간 이내)</h2>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
            {queueStatus?.completed_count_1h || 0}개 완료
          </span>
        </div>
        
        {queueStatus && queueStatus.completed_jobs_1h.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {queueStatus.completed_jobs_1h.slice(0, 10).map((job) => (
              <div
                key={job.pipeline_id}
                className={`p-4 rounded-lg border-2 transition-all hover:shadow-md ${
                  job.status === 'success'
                    ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-300'
                    : 'bg-gradient-to-r from-red-50 to-pink-50 border-red-300'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <p className="font-bold text-gray-900">📝 {job.post_id}</p>
                    <p className="text-xs text-gray-600 font-mono mt-1 truncate">
                      {job.pipeline_id}
                    </p>
                  </div>
                  <div className={`text-2xl ${
                    job.status === 'success' ? '' : 'animate-pulse'
                  }`}>
                    {job.status === 'success' ? '✅' : '❌'}
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-600">소요 시간</span>
                    <span className="font-semibold text-gray-900">
                      {Math.floor(job.duration / 60)}분 {Math.floor(job.duration % 60)}초
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-xs mt-1">
                    <span className="text-gray-600">완료 시각</span>
                    <span className="font-medium text-gray-700">
                      {new Date(job.completed_at).toLocaleTimeString('ko-KR')}
                    </span>
                  </div>
                  {job.error && (
                    <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-700">
                      ⚠️ {job.error}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-lg">
            <p className="text-4xl mb-2">📭</p>
            <p className="text-sm text-gray-500">최근 1시간 내 완료된 작업이 없습니다</p>
          </div>
        )}
      </div>

      {/* 빈 상태 */}
      {queueStatus && 
       queueStatus.running_jobs.length === 0 && 
       queueStatus.queued_jobs.length === 0 && 
       queueStatus.completed_jobs_1h.length === 0 && (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <div className="text-6xl mb-4">💤</div>
          <p className="text-xl font-medium text-gray-900 mb-2">현재 실행 중인 작업이 없습니다</p>
          <p className="text-gray-600">포스트 관리 페이지에서 AI 생성을 시작해보세요</p>
        </div>
      )}
    </div>
  );
}
