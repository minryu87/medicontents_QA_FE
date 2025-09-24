import React from 'react';

interface PipelineResultData {
  post_id: string;
  pipeline_id: string;
  pipeline_started_at: string | null;
  pipeline_completed_at: string | null;
  pipeline_status: string;
  final_title: string;
  final_html_content: string;
  quality_score: number | null;
  total_iterations: number;
}

interface PipelineResultHeaderProps {
  pipelineResult: PipelineResultData | null;
  loading?: boolean;
}

export default function PipelineResultHeader({ pipelineResult, loading = false }: PipelineResultHeaderProps) {
  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '알 수 없음';
    try {
      const date = new Date(dateString);
      return date.toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
      });
    } catch {
      return '알 수 없음';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return '완료';
      case 'failed':
        return '실패';
      case 'running':
        return '실행중';
      case 'pending':
        return '대기중';
      default:
        return '알 수 없음';
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="animate-pulse">
          <div className="h-6 bg-neutral-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-neutral-200 rounded w-3/4"></div>
            <div className="h-4 bg-neutral-200 rounded w-1/2"></div>
            <div className="h-4 bg-neutral-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pipelineResult) {
    return (
      <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
        <div className="text-center text-neutral-500">
          <p>파이프라인 결과를 불러올 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg border border-neutral-200 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-neutral-900">파이프라인 실행 결과</h3>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(pipelineResult.pipeline_status)}`}>
          {getStatusLabel(pipelineResult.pipeline_status)}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="bg-neutral-50 p-3 rounded">
          <div className="text-sm text-neutral-600 mb-1">포스트 ID</div>
          <div className="font-mono text-sm text-neutral-900">{pipelineResult.post_id}</div>
        </div>

        <div className="bg-neutral-50 p-3 rounded">
          <div className="text-sm text-neutral-600 mb-1">파이프라인 ID</div>
          <div className="font-mono text-xs text-neutral-900 break-all">{pipelineResult.pipeline_id}</div>
        </div>

        <div className="bg-neutral-50 p-3 rounded">
          <div className="text-sm text-neutral-600 mb-1">시작 시간</div>
          <div className="text-sm text-neutral-900">{formatDateTime(pipelineResult.pipeline_started_at)}</div>
        </div>

        <div className="bg-neutral-50 p-3 rounded">
          <div className="text-sm text-neutral-600 mb-1">완료 시간</div>
          <div className="text-sm text-neutral-900">{formatDateTime(pipelineResult.pipeline_completed_at)}</div>
        </div>
      </div>

      {/* 추가 메트릭 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 p-3 rounded">
          <div className="text-sm text-blue-600 mb-1">품질 점수</div>
          <div className="text-lg font-semibold text-blue-900">
            {pipelineResult.quality_score ? `${pipelineResult.quality_score}/100` : 'N/A'}
          </div>
        </div>

        <div className="bg-green-50 p-3 rounded">
          <div className="text-sm text-green-600 mb-1">반복 횟수</div>
          <div className="text-lg font-semibold text-green-900">{pipelineResult.total_iterations}</div>
        </div>

        <div className="bg-purple-50 p-3 rounded">
          <div className="text-sm text-purple-600 mb-1">제목</div>
          <div className="text-sm font-medium text-purple-900 line-clamp-2">
            {pipelineResult.final_title || '제목 없음'}
          </div>
        </div>
      </div>
    </div>
  );
}
