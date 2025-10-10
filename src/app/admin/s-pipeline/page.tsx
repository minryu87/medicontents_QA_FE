'use client';

import { useState, useEffect } from 'react';
import config from '@/lib/config';

interface Post {
  id: number;
  post_id: string;
  hospital_id: number;
  hospital_service_id: number | null;
  status: string;
  title: string | null;
  created_at: string;
  has_s_pipeline_result: boolean;
  latest_s_pipeline_id: string | null;
}

interface ExecutionResult {
  success: boolean;
  post_id: string;
  s_pipeline_id?: string;
  error?: string;
}

export default function SimplifiedPipelinePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [selectedPostIds, setSelectedPostIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResults, setExecutionResults] = useState<Map<string, ExecutionResult>>(new Map());
  const [previewHtml, setPreviewHtml] = useState<string | null>(null);
  const [previewPostId, setPreviewPostId] = useState<string | null>(null);

  // 포스트 목록 로드
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${config.apiUrl}/api/v1/admin/s-pipeline/posts`, {
        credentials: 'include',
      });
      
      if (!response.ok) {
        throw new Error('포스트 목록 조회 실패');
      }
      
      const data = await response.json();
      setPosts(data);
    } catch (error) {
      console.error('포스트 로드 에러:', error);
      alert('포스트 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  // 체크박스 토글
  const togglePostSelection = (postId: string) => {
    setSelectedPostIds(prev =>
      prev.includes(postId)
        ? prev.filter(id => id !== postId)
        : [...prev, postId]
    );
  };

  // 전체 선택/해제
  const toggleSelectAll = () => {
    if (selectedPostIds.length === posts.length) {
      setSelectedPostIds([]);
    } else {
      setSelectedPostIds(posts.map(p => p.post_id));
    }
  };

  // 파이프라인 실행
  const executePipeline = async () => {
    if (selectedPostIds.length === 0) {
      alert('실행할 포스트를 선택해주세요.');
      return;
    }

    try {
      setExecuting(true);
      const response = await fetch(`${config.apiUrl}/api/v1/admin/s-pipeline/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          post_ids: selectedPostIds,
        }),
      });

      if (!response.ok) {
        throw new Error('파이프라인 실행 실패');
      }

      const data = await response.json();
      
      alert(data.message + '\n\n백그라운드에서 처리 중입니다. 완료 후 수동으로 새로고침 버튼을 눌러주세요.');
      
      // 선택 해제
      setSelectedPostIds([]);
      
    } catch (error) {
      console.error('파이프라인 실행 에러:', error);
      alert('파이프라인 실행에 실패했습니다.');
    } finally {
      setExecuting(false);
    }
  };

  // HTML 미리보기
  const showPreview = async (sPipelineId: string, postId: string) => {
    try {
      const response = await fetch(`${config.apiUrl}/api/v1/admin/s-pipeline/results/${sPipelineId}`, {
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('결과 조회 실패');
      }

      const data = await response.json();
      setPreviewHtml(data.final_html_content);
      setPreviewPostId(postId);
    } catch (error) {
      console.error('미리보기 에러:', error);
      alert('결과를 불러오는데 실패했습니다.');
    }
  };

  // 미리보기 닫기
  const closePreview = () => {
    setPreviewHtml(null);
    setPreviewPostId(null);
  };

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        {/* 헤더 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">심플 파이프라인</h1>
            <p className="text-gray-600 mt-2">
              자료 제공이 완료된 포스트(hospital_completed 이상)에 대해 간소화된 파이프라인을 실행합니다
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={fetchPosts}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              {loading ? '로딩 중...' : '새로고침'}
            </button>
            <button
              onClick={executePipeline}
              disabled={selectedPostIds.length === 0 || executing}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {executing ? '실행 중...' : `파이프라인 실행 (${selectedPostIds.length}개)`}
            </button>
          </div>
        </div>

        {/* 통계 */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">전체 포스트</div>
            <div className="text-2xl font-bold text-gray-900">{posts.length}개</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">선택된 포스트</div>
            <div className="text-2xl font-bold text-blue-600">{selectedPostIds.length}개</div>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-sm text-gray-600">결과 생성 완료</div>
            <div className="text-2xl font-bold text-green-600">
              {posts.filter(p => p.has_s_pipeline_result).length}개
            </div>
          </div>
        </div>

        {/* 포스트 목록 */}
        <div className="bg-white rounded-lg border shadow-sm">
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <input
                type="checkbox"
                checked={posts.length > 0 && selectedPostIds.length === posts.length}
                onChange={toggleSelectAll}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700">전체 선택</span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-gray-500">로딩 중...</div>
          ) : posts.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              실행 가능한 포스트가 없습니다 (자료 제공 완료 이후 단계)
            </div>
          ) : (
            <div className="divide-y">
              {posts.map((post) => {
                const executionResult = executionResults.get(post.post_id);
                
                return (
                  <div
                    key={post.id}
                    className="p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedPostIds.includes(post.post_id)}
                          onChange={() => togglePostSelection(post.post_id)}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-3">
                            <span className="text-sm font-mono text-gray-600">
                              {post.post_id}
                            </span>
                            {post.title && (
                              <span className="text-sm text-gray-900 font-medium">
                                {post.title}
                              </span>
                            )}
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                              {post.status}
                            </span>
                          </div>
                          <div className="mt-1 text-xs text-gray-500">
                            생성일: {new Date(post.created_at).toLocaleString('ko-KR')}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        {/* 실행 결과 상태 */}
                        {executionResult && (
                          <div>
                            {executionResult.success ? (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                ✓ 완료
                              </span>
                            ) : (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                                ✗ 실패
                              </span>
                            )}
                          </div>
                        )}

                        {/* 기존 결과 상태 */}
                        {post.has_s_pipeline_result && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            결과 있음
                          </span>
                        )}

                        {/* 결과보기 버튼 */}
                        {post.latest_s_pipeline_id && (
                          <button
                            onClick={() => showPreview(post.latest_s_pipeline_id!, post.post_id)}
                            className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 rounded hover:bg-blue-700"
                          >
                            결과보기
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* HTML 미리보기 모달 */}
        {previewHtml && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col">
              {/* 모달 헤더 */}
              <div className="p-6 border-b flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">HTML 미리보기</h3>
                  <p className="text-sm text-gray-600 mt-1">Post ID: {previewPostId}</p>
                </div>
                <button
                  onClick={closePreview}
                  className="text-gray-400 hover:text-gray-600 text-2xl"
                >
                  ×
                </button>
              </div>

              {/* 모달 내용 */}
              <div className="flex-1 overflow-auto p-6">
                <iframe
                  srcDoc={previewHtml}
                  className="w-full h-full border rounded"
                  style={{ minHeight: '600px' }}
                  title="HTML Preview"
                />
              </div>

              {/* 모달 푸터 */}
              <div className="p-6 border-t flex justify-end space-x-3">
                <button
                  onClick={closePreview}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  닫기
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

