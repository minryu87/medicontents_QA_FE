'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Button } from '@/components/shared/Button';
import { Badge } from '@/components/shared/Badge';
import { clientApi } from '@/services/api';

interface BlogPost {
  id: number;
  post_id: string;
  title: string | null;
  recent_s_pipeline_id: string | null;
}

interface SamplePageProps {}

const SamplePage: React.FC<SamplePageProps> = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [showPreview, setShowPreview] = useState(false);

  // blog_posts 목록 조회
  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await clientApi.getSamplePosts({ limit: 100 });
      setPosts(data);
    } catch (error) {
      console.error('Failed to fetch posts:', error);
    } finally {
      setLoading(false);
    }
  };

  // HTML 콘텐츠 조회
  const fetchHtmlContent = async (post: BlogPost) => {
    if (!post.recent_s_pipeline_id) {
      alert('Simplified Pipeline ID가 없습니다.');
      return;
    }

    try {
      const data = await clientApi.getSampleHtmlContent(post.recent_s_pipeline_id);
      setHtmlContent(data.final_html_content || '');
      setSelectedPost(post);
      setShowPreview(true);
    } catch (error) {
      console.error('Failed to fetch HTML content:', error);
      alert('HTML 콘텐츠를 불러올 수 없습니다.');
    }
  };

  const closePreview = () => {
    setShowPreview(false);
    setSelectedPost(null);
    setHtmlContent('');
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">게시글 목록 샘플</h1>
        <p className="text-gray-600 mt-2">생성된 게시글 목록과 HTML 미리보기를 확인할 수 있습니다.</p>
      </div>

      {/* 게시글 목록 */}
      <Card>
        <CardHeader>
          <CardTitle>게시글 목록</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">순번</th>
                  <th className="text-left p-2">Post ID</th>
                  <th className="text-left p-2">제목</th>
                  <th className="text-left p-2">Pipeline ID</th>
                  <th className="text-left p-2">액션</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post, index) => (
                  <tr key={post.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{index + 1}</td>
                    <td className="p-2">
                      <Badge variant="secondary">{post.post_id}</Badge>
                    </td>
                    <td className="p-2">
                      <button
                        onClick={() => fetchHtmlContent(post)}
                        className="text-blue-600 hover:text-blue-800 hover:underline text-left"
                      >
                        {post.title || '제목 없음'}
                      </button>
                    </td>
                    <td className="p-2">
                      <Badge variant={post.recent_s_pipeline_id ? "default" : "secondary"}>
                        {post.recent_s_pipeline_id || '없음'}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <Button
                        onClick={() => fetchHtmlContent(post)}
                        disabled={!post.recent_s_pipeline_id}
                        size="sm"
                      >
                        HTML 미리보기
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* HTML 미리보기 모달 */}
      {showPreview && selectedPost && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">
                HTML 미리보기 - {selectedPost.title}
              </h2>
              <Button onClick={closePreview} variant="outline">
                닫기
              </Button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-auto">
              {htmlContent ? (
                <iframe
                  srcDoc={htmlContent}
                  className="w-full border rounded"
                  style={{ minHeight: '600px', height: '100%' }}
                  title="HTML Preview"
                />
              ) : (
                <div className="text-center text-gray-500">
                  HTML 콘텐츠가 없습니다.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SamplePage;
