'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Navigation from '@/components/layout/Navigation';
import {
  Search,
  Filter,
  Star,
  Eye,
  Clock,
  Tag,
  TrendingUp,
  CheckCircle,
  SortAsc,
  SortDesc,
  Grid,
  List
} from 'lucide-react';

interface SamplePost {
  postId: string;
  title: string;
  category: string;
  excerpt: string;
  scores: {
    seo: number;
    legal: number;
  };
  tags: string[];
  createdAt: string;
  hospitalName: string;
  readTime: number;
  imageUrl?: string;
}

interface MedicalCategory {
  id: number;
  name: string;
  count: number;
  avgSeoScore: number;
  avgLegalScore: number;
}

const sortOptions = [
  { value: 'seo_score', label: 'SEO 점수순', icon: TrendingUp },
  { value: 'legal_score', label: '법적 점수순', icon: CheckCircle },
  { value: 'created_at', label: '최신순', icon: Clock },
  { value: 'title', label: '제목순', icon: SortAsc }
];

export default function SamplesPage() {
  const [posts, setPosts] = useState<SamplePost[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<SamplePost[]>([]);
  const [categories, setCategories] = useState<MedicalCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 랜딩페이지용 샘플 데이터
  const sampleData: SamplePost[] = [
    {
      postId: 'sample_001',
      title: '임플란트 치료의 모든 것: 종류부터 수술 과정까지',
      category: '치과',
      excerpt: '임플란트 치료에 대한 종합 가이드입니다. 다양한 임플란트 종류와 수술 과정을 자세히 설명합니다.',
      scores: { seo: 92, legal: 95 },
      tags: ['임플란트', '치과치료', '수술과정'],
      createdAt: '2024-09-01T10:00:00Z',
      hospitalName: '서울치과병원',
      readTime: 8
    },
    {
      postId: 'sample_002',
      title: '어린이 치아 교정의 중요성과 시기',
      category: '치과',
      excerpt: '어린이 치아 교정의 필요성과 적절한 시기에 대해 알아보세요.',
      scores: { seo: 89, legal: 94 },
      tags: ['어린이교정', '치아교정', '예방치과'],
      createdAt: '2024-09-02T10:00:00Z',
      hospitalName: '어린이치과센터',
      readTime: 6
    },
    {
      postId: 'sample_003',
      title: '피부 노화 방지를 위한 스킨케어 루틴',
      category: '피부과',
      excerpt: '나이가 들수록 달라지는 피부 변화와 효과적인 관리 방법을 소개합니다.',
      scores: { seo: 91, legal: 93 },
      tags: ['피부관리', '안티에이징', '스킨케어'],
      createdAt: '2024-09-03T10:00:00Z',
      hospitalName: '뷰티피부과',
      readTime: 7
    },
    {
      postId: 'sample_004',
      title: '비만 치료의 새로운 접근법: 약물 치료',
      category: '내과',
      excerpt: '최근 개발된 비만 치료제들의 효과와 사용법을 알아보세요.',
      scores: { seo: 88, legal: 96 },
      tags: ['비만치료', '다이어트', '약물치료'],
      createdAt: '2024-09-04T10:00:00Z',
      hospitalName: '종합내과의원',
      readTime: 9
    },
    {
      postId: 'sample_005',
      title: '라식 수술 전후 관리 가이드',
      category: '안과',
      excerpt: '라식 수술을 고려중이시라면 필수로 알아야 할 정보들입니다.',
      scores: { seo: 90, legal: 92 },
      tags: ['라식수술', '시력교정', '안과수술'],
      createdAt: '2024-09-05T10:00:00Z',
      hospitalName: '명품안과',
      readTime: 5
    },
    {
      postId: 'sample_006',
      title: '산전 검진의 중요성과 검사 항목',
      category: '산부인과',
      excerpt: '임신 계획중이시라면 반드시 알아야 할 산전 검진 정보를 제공합니다.',
      scores: { seo: 93, legal: 97 },
      tags: ['산전검진', '임신준비', '예방접종'],
      createdAt: '2024-09-06T10:00:00Z',
      hospitalName: '맘편한산부인과',
      readTime: 6
    }
  ];

  useEffect(() => {
    // 랜딩페이지용 샘플 데이터를 로드
    setPosts(sampleData);
    setFilteredPosts(sampleData);

    // 카테고리 정보 생성
    const categoryMap = new Map<string, { count: number; totalSeo: number; totalLegal: number }>();
    sampleData.forEach(post => {
      if (!categoryMap.has(post.category)) {
        categoryMap.set(post.category, { count: 0, totalSeo: 0, totalLegal: 0 });
      }
      const cat = categoryMap.get(post.category)!;
      cat.count++;
      cat.totalSeo += post.scores.seo;
      cat.totalLegal += post.scores.legal;
    });

    const categoryList: MedicalCategory[] = Array.from(categoryMap.entries()).map(([name, data], index) => ({
      id: index + 1,
      name,
      count: data.count,
      avgSeoScore: Math.round(data.totalSeo / data.count),
      avgLegalScore: Math.round(data.totalLegal / data.count)
    }));

    setCategories(categoryList);
    setLoading(false);
  }, []);

  useEffect(() => {
    let filtered = posts.filter(post => {
      const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    // 정렬
    filtered.sort((a, b) => {
      let aVal, bVal;

      switch (sortBy) {
        case 'seo_score':
          aVal = a.scores.seo;
          bVal = b.scores.seo;
          break;
        case 'legal_score':
          aVal = a.scores.legal;
          bVal = b.scores.legal;
          break;
        case 'created_at':
          aVal = new Date(a.createdAt).getTime();
          bVal = new Date(b.createdAt).getTime();
          break;
        case 'title':
          aVal = a.title.toLowerCase();
          bVal = b.title.toLowerCase();
          break;
        default:
          return 0;
      }

      if (sortOrder === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    setFilteredPosts(filtered);
  }, [posts, searchTerm, selectedCategory, sortBy, sortOrder]);

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 80) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-red-100 text-red-800 border-red-200';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return '우수';
    if (score >= 80) return '양호';
    return '개선 필요';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navigation />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* 헤더 */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            샘플 콘텐츠
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            MediContents QA로 생성된 고품질 의료 콘텐츠 샘플들을 확인해보세요
          </p>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* 검색 */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="콘텐츠 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* 카테고리 필터 */}
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                전체 ({posts.length})
              </button>
              {categories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.name)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedCategory === category.name
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category.name} ({category.count})
                </button>
              ))}
            </div>
          </div>

          {/* 정렬 및 보기 모드 */}
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-4">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {sortOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortOrder === 'asc' ? <SortAsc className="h-5 w-5" /> : <SortDesc className="h-5 w-5" />}
              </button>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 border rounded-lg ${
                  viewMode === 'grid' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Grid className="h-5 w-5" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 border rounded-lg ${
                  viewMode === 'list' ? 'bg-blue-600 text-white border-blue-600' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                <List className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* 통계 정보 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {filteredPosts.length}
            </div>
            <div className="text-gray-600">표시된 콘텐츠</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-green-600 mb-2">
              {categories.length}
            </div>
            <div className="text-gray-600">진료 과목</div>
          </Card>
          <Card className="p-6 text-center">
            <div className="text-2xl font-bold text-purple-600 mb-2">
              {Math.round(filteredPosts.reduce((sum, post) => sum + post.scores.seo, 0) / filteredPosts.length || 0)}
            </div>
            <div className="text-gray-600">평균 SEO 점수</div>
          </Card>
        </div>

        {/* 콘텐츠 목록 */}
        <div className={`grid gap-6 ${
          viewMode === 'grid'
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
            : 'grid-cols-1'
        }`}>
          {filteredPosts.map((post) => (
            <Card key={post.postId} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className="p-6">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className="inline-block px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mb-2">
                      {post.category}
                    </span>
                    <div className="flex gap-2">
                      <span className={`text-xs px-2 py-1 rounded border ${getScoreColor(post.scores.seo)}`}>
                        SEO {post.scores.seo}점 ({getScoreLabel(post.scores.seo)})
                      </span>
                      <span className={`text-xs px-2 py-1 rounded border ${getScoreColor(post.scores.legal)}`}>
                        의료법 {post.scores.legal}점 ({getScoreLabel(post.scores.legal)})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 콘텐츠 */}
                <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900 leading-tight">
                  {post.title}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                  {post.excerpt}
                </p>

                {/* 태그 */}
                <div className="flex flex-wrap gap-1 mb-4">
                  {post.tags.slice(0, 3).map(tag => (
                    <span key={tag} className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded">
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* 푸터 */}
                <div className="flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    <div>{post.hospitalName}</div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="h-3 w-3" />
                      {post.readTime}분 소요
                    </div>
                  </div>
                  <Button variant="secondary" size="sm">
                    자세히 보기 →
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {filteredPosts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              검색 결과가 없습니다
            </h3>
            <p className="text-gray-600">
              다른 검색어로 시도해보세요.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
