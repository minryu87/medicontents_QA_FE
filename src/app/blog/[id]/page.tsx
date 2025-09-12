'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getPublicPostDetail } from '@/services/publicApi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

interface PostDetail {
  post_id: string;
  title: string;
  content: string;
  hospital: {
    name: string;
    address?: string;
    phone?: string;
    website?: string;
  };
  category: string;
  treatment: string;
  published_at: string;
  images: {
    type: string;
    url: string;
    alt_text?: string;
    description?: string;
  }[];
}

export default function BlogDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      loadPost(params.id as string);
    }
  }, [params.id]);

  const loadPost = async (postId: string) => {
    try {
      const data = await getPublicPostDetail(postId);
      setPost(data);
    } catch (error) {
      console.error('Error loading post:', error);
      router.push('/blog');
    } finally {
      setLoading(false);
    }
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
          <Link href="/blog">
            <Button>블로그 목록으로</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-gray-50 border-b">
        <div className="container mx-auto px-4 py-4">
          <Link href="/blog" className="text-blue-600 hover:text-blue-800">
            ← 블로그 목록으로
          </Link>
        </div>
      </div>

      {/* Article */}
      <article className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Title and Meta */}
        <header className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded text-sm font-semibold">
              {post.category}
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-gray-600 text-sm">
              {new Date(post.published_at).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </span>
          </div>
          <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
          <div className="text-gray-600">
            <span className="font-semibold">{post.hospital.name}</span>
            {post.treatment && <span> • {post.treatment}</span>}
          </div>
        </header>

        {/* Images */}
        {post.images.length > 0 && (
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {post.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={image.url} 
                    alt={image.alt_text || `이미지 ${index + 1}`}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  {image.description && (
                    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-sm">{image.description}</p>
                    </div>
                  )}
                  <div className="absolute top-2 left-2 bg-black/50 text-white px-2 py-1 rounded text-xs">
                    {image.type === 'before' && '치료 전'}
                    {image.type === 'process' && '치료 중'}
                    {image.type === 'after' && '치료 후'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Content */}
        <div 
          className="prose prose-lg max-w-none mb-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Hospital Info */}
        <Card className="p-6 bg-gray-50">
          <h3 className="text-lg font-semibold mb-4">병원 정보</h3>
          <div className="space-y-2">
            <p className="font-semibold">{post.hospital.name}</p>
            {post.hospital.address && (
              <p className="text-gray-600">
                <span className="font-medium">주소:</span> {post.hospital.address}
              </p>
            )}
            {post.hospital.phone && (
              <p className="text-gray-600">
                <span className="font-medium">전화:</span> {post.hospital.phone}
              </p>
            )}
            {post.hospital.website && (
              <p className="text-gray-600">
                <span className="font-medium">웹사이트:</span>{' '}
                <a 
                  href={post.hospital.website} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  {post.hospital.website}
                </a>
              </p>
            )}
          </div>
        </Card>

        {/* CTA */}
        <div className="mt-12 text-center py-8 border-t">
          <h3 className="text-2xl font-bold mb-4">
            이런 고품질 콘텐츠를 원하시나요?
          </h3>
          <p className="text-gray-600 mb-6">
            AI 기반 의료 콘텐츠 생성 시스템을 무료로 체험해보세요
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg">무료 체험 신청</Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary">문의하기</Button>
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
