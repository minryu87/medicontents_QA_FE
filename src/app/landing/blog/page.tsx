'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getPublicPosts, getBlogCategories } from '@/services/publicApi';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

interface BlogPost {
  post_id: string;
  title: string;
  excerpt: string;
  hospital: {
    name: string;
    logo?: string;
  };
  category: string;
  treatment: string;
  published_at: string;
  image_url?: string;
}

interface Category {
  name: string;
  count: number;
}

export default function BlogPage() {
  const searchParams = useSearchParams();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');

  useEffect(() => {
    loadData();
  }, [page, selectedCategory, searchQuery]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [postsData, categoriesData] = await Promise.all([
        getPublicPosts({
          page,
          page_size: 12,
          category: selectedCategory || undefined,
          search: searchQuery || undefined
        }),
        getBlogCategories()
      ]);
      
      setPosts(postsData.items || []);
      setTotalPages(postsData.total_pages || 1);
      setCategories(categoriesData || []);
    } catch (error) {
      console.error('Error loading blog data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadData();
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setPage(1);
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold">의료 콘텐츠 블로그</h1>
          <p className="text-gray-600 mt-2">AI가 생성한 고품질 의료 정보를 확인하세요</p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <aside className="lg:w-64">
            {/* Search */}
            <div className="mb-8">
              <h3 className="font-semibold mb-4">검색</h3>
              <form onSubmit={handleSearch}>
                <Input
                  type="text"
                  placeholder="키워드 검색..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="mb-2"
                />
                <Button type="submit" className="w-full">검색</Button>
              </form>
            </div>

            {/* Categories */}
            <div>
              <h3 className="font-semibold mb-4">카테고리</h3>
              <div className="space-y-2">
                <button
                  onClick={() => handleCategoryChange('')}
                  className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                    selectedCategory === '' 
                      ? 'bg-blue-50 text-blue-600 font-semibold' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  전체 보기
                </button>
                {categories.map((category) => (
                  <button
                    key={category.name}
                    onClick={() => handleCategoryChange(category.name)}
                    className={`block w-full text-left px-3 py-2 rounded transition-colors ${
                      selectedCategory === category.name 
                        ? 'bg-blue-50 text-blue-600 font-semibold' 
                        : 'hover:bg-gray-100'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-gray-500 text-sm ml-2">({category.count})</span>
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1">
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {posts.map((post) => (
                <Card key={post.post_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  {post.image_url && (
                    <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                      <img 
                        src={post.image_url} 
                        alt={post.title}
                        className="object-cover w-full h-48"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-blue-600 font-semibold">{post.category}</span>
                      <span className="text-xs text-gray-500">
                        {new Date(post.published_at).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <h2 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h2>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {post.hospital.logo && (
                          <img 
                            src={post.hospital.logo} 
                            alt={post.hospital.name}
                            className="w-6 h-6 rounded-full"
                          />
                        )}
                        <span className="text-sm text-gray-500">{post.hospital.name}</span>
                      </div>
                      <Link href={`/blog/${post.post_id}`}>
                        <Button size="sm" variant="secondary">
                          읽기
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {/* No Results */}
            {posts.length === 0 && !loading && (
              <div className="text-center py-12">
                <p className="text-gray-500">검색 결과가 없습니다.</p>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2">
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  이전
                </Button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const pageNum = i + 1;
                  if (pageNum > totalPages) return null;
                  
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? 'primary' : 'secondary'}
                      onClick={() => setPage(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
                
                {totalPages > 5 && (
                  <>
                    <span className="px-2 py-1">...</span>
                    <Button
                      variant={page === totalPages ? 'primary' : 'secondary'}
                      onClick={() => setPage(totalPages)}
                    >
                      {totalPages}
                    </Button>
                  </>
                )}
                
                <Button
                  variant="secondary"
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                >
                  다음
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
