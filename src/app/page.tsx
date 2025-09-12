'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { getPublicStats, getAgentPerformance, getSamplePosts } from '@/services/publicApi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Navigation from '@/components/layout/Navigation';

interface Stats {
  total_posts: number;
  active_hospitals: number;
  avg_seo_score: number;
  avg_legal_score: number;
}

interface AgentPerformance {
  [key: string]: {
    avg_execution_time: number;
    success_rate: number;
    total_executions: number;
  };
}

interface SamplePost {
  post_id: string;
  title: string;
  category: string;
  excerpt: string;
  scores: {
    seo: number;
    legal: number;
  };
  created_at: string;
}

// Animated counter hook
function useAnimatedCounter(endValue: number, duration: number = 2000) {
  const [currentValue, setCurrentValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    if (endValue > 0 && !hasAnimated) {
      setHasAnimated(true);
      const startTime = Date.now();
      const startValue = 0;

      const animate = () => {
        const now = Date.now();
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth animation
        const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
        const easedProgress = easeOutCubic(progress);

        setCurrentValue(Math.floor(startValue + (endValue - startValue) * easedProgress));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [endValue, duration, hasAnimated]);

  return currentValue;
}

// Animated stats card component
function StatsCard({
  value,
  label,
  suffix = ''
}: {
  value: number;
  label: string;
  suffix?: string;
}) {
  const animatedValue = useAnimatedCounter(value);

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20 transition-all duration-300 hover:bg-white/15 hover:scale-105">
      <div className="text-4xl font-bold text-white mb-2">
        {animatedValue.toLocaleString()}{suffix}
      </div>
      <div className="text-sm text-blue-100 font-medium">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance | null>(null);
  const [samplePosts, setSamplePosts] = useState<SamplePost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Cache data for 5 minutes
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setError(null);

      // Try to load from cache first
      const cachedData = loadFromCache();
      if (cachedData) {
        setStats(cachedData.stats);
        setAgentPerformance(cachedData.agentPerformance);
        setSamplePosts(cachedData.samplePosts);
        setLoading(false);
        return;
      }

      // Load fresh data - handle each API call separately to prevent one failure from blocking others
      const results = await Promise.allSettled([
        getPublicStats(),
        getAgentPerformance(),
        getSamplePosts(6)
      ]);

      const [statsResult, agentResult, samplesResult] = results;

      // Handle stats data
      let statsData = null;
      if (statsResult.status === 'fulfilled') {
        statsData = statsResult.value;
        if (statsData && typeof statsData.total_posts === 'number') {
          setStats(statsData);
        }
      } else {
        console.warn('Failed to load stats:', statsResult.reason);
      }

      // Handle agent performance data
      let agentData = null;
      if (agentResult.status === 'fulfilled') {
        agentData = agentResult.value;
        setAgentPerformance(agentData);
      } else {
        console.warn('Failed to load agent performance:', agentResult.reason);
        // Set empty agent performance data so the UI can still render
        setAgentPerformance({});
      }

      // Handle sample posts data
      let samplesData = [];
      if (samplesResult.status === 'fulfilled') {
        samplesData = samplesResult.value.samples || [];
        setSamplePosts(samplesData);
      } else {
        console.warn('Failed to load sample posts:', samplesResult.reason);
      }

      // Only cache if we have at least some successful data
      if (statsData || agentData || samplesData.length > 0) {
        saveToCache({
          stats: statsData,
          agentPerformance: agentData || {},
          samplePosts: samplesData,
          timestamp: Date.now()
        });
      }

      // If stats failed but we have cached data, still show error
      if (!statsData) {
        const cachedData = loadFromCache();
        if (cachedData) {
          setStats(cachedData.stats);
          setAgentPerformance(cachedData.agentPerformance || {});
          setSamplePosts(cachedData.samplePosts || []);
        } else {
          throw new Error('Unable to load essential data');
        }
      }

    } catch (error) {
      console.error('Error loading data:', error);
      setError('데이터를 불러오는 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.');

      // Try to load from cache as fallback
      const cachedData = loadFromCache();
      if (cachedData) {
        setStats(cachedData.stats);
        setAgentPerformance(cachedData.agentPerformance || {});
        setSamplePosts(cachedData.samplePosts || []);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadFromCache = () => {
    if (typeof window === 'undefined') return null;

    try {
      const cached = localStorage.getItem('landing_page_cache');
      if (!cached) return null;

      const data = JSON.parse(cached);
      const now = Date.now();

      // Check if cache is still valid
      if (now - data.timestamp > CACHE_DURATION) {
        localStorage.removeItem('landing_page_cache');
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error loading from cache:', error);
      localStorage.removeItem('landing_page_cache');
      return null;
    }
  };

  const saveToCache = (data: any) => {
    if (typeof window === 'undefined') return;

    try {
      localStorage.setItem('landing_page_cache', JSON.stringify(data));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto"></div>
          <p className="mt-6 text-lg text-gray-700 font-medium">MediContents QA 로딩 중...</p>
          <p className="mt-2 text-sm text-gray-500">실시간 데이터를 가져오는 중입니다</p>
        </div>
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center max-w-md mx-auto p-8">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">데이터 로드 실패</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              loadData();
            }}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navigation />

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              의료광고법 준수,<br />
              의학적으로 안전한 SEO 최적화 컨텐츠
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              병원에서 간단한 질문 답변만으로도 월 수백 건의 고품질 의료 콘텐츠를 자동 생성하세요
            </p>
            
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
                <StatsCard value={stats.total_posts} label="월간 생성량" suffix="건" />
                <StatsCard value={stats.active_hospitals} label="활성 병원" suffix="곳" />
                <StatsCard value={Math.round(stats.avg_seo_score)} label="평균 SEO 점수" suffix="점" />
                <StatsCard value={Math.round(stats.avg_legal_score)} label="의료법 준수율" suffix="%" />
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  무료 체험 시작하기
                </Button>
              </Link>
              <Link href="/samples">
                <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white/10">
                  샘플 콘텐츠 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Key Features Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold mb-4">왜 MediContents QA를 선택해야 할까요?</h2>
            <p className="text-xl text-gray-600">의료법 준수와 SEO 최적화를 동시에 만족시키는 유일한 솔루션</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <div className="text-center">
              <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">의료광고법 100% 준수</h3>
              <p className="text-gray-600">모든 생성 콘텐츠가 의료광고법을 철저히 준수하며, 법적 리스크를 완전히 제거합니다.</p>
            </div>

            <div className="text-center">
              <div className="bg-green-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">채널별 맞춤 최적화</h3>
              <p className="text-gray-600">홈페이지, 네이버 블로그, 인스타그램 등 각 채널의 특성에 맞게 자동으로 최적화합니다.</p>
            </div>

            <div className="text-center">
              <div className="bg-purple-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-3">월 수백 건 자동 생성</h3>
              <p className="text-gray-600">병원에서 간단한 질문 답변만으로 월 200건 이상의 고품질 콘텐츠를 자동 생성합니다.</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-8 mb-16">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold mb-4">간단한 입력으로 고품질 콘텐츠 생성</h3>
                <ul className="space-y-3">
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">의사 선생님의 간단한 질문 답변만으로도 완성</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">EMR 자료 연동으로 자동화된 콘텐츠 생성</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700">의학적 정확성과 SEO 최적화를 동시에 만족</span>
                  </li>
                </ul>
              </div>
              <div className="text-center">
                <div className="bg-blue-600 text-white rounded-lg p-6">
                  <div className="text-3xl font-bold mb-2">200+</div>
                  <div className="text-blue-100">월간 생성량 (건)</div>
                </div>
                <p className="text-sm text-gray-600 mt-3">
                  기존 수작업의 10배 생산성 향상
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Agent Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">의료법 준수 & 채널별 최적화 시스템</h2>
            <p className="text-xl text-gray-600">의료광고법을 철저히 준수하면서 각 채널에 최적화된 컨텐츠를 자동 생성합니다</p>
          </div>
          
          {agentPerformance && Object.keys(agentPerformance).length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(agentPerformance).slice(0, 6).map(([agent, perf]) => {
                const agentNames = {
                  'input': '의료법 검토',
                  'plan': '채널별 최적화',
                  'title': 'SEO 제목 생성',
                  'content': '의학적 정확성 검증',
                  'evaluation': '의료광고법 준수',
                  'edit': '컨텐츠 마무리'
                };

                const getStatusColor = (rate: number) => {
                  if (rate >= 95) return 'bg-green-500'; // success
                  if (rate >= 85) return 'bg-yellow-500'; // warning
                  return 'bg-red-500'; // error
                };

                const getStatusBg = (rate: number) => {
                  if (rate >= 95) return 'bg-green-50 border-green-200';
                  if (rate >= 85) return 'bg-yellow-50 border-yellow-200';
                  return 'bg-red-50 border-red-200';
                };

                return (
                  <Card key={agent} className={`p-6 transition-all duration-300 hover:shadow-lg ${getStatusBg(perf.success_rate)} border-2`}>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {agentNames[agent as keyof typeof agentNames] || agent}
                      </h3>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium text-white ${getStatusColor(perf.success_rate)}`}>
                        {perf.success_rate >= 95 ? '정상' : perf.success_rate >= 85 ? '주의' : '심각'}
                      </div>
                    </div>

                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">성공률</span>
                        <span className="font-semibold text-gray-900">{perf.success_rate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">평균 처리 시간</span>
                        <span className="font-semibold text-gray-900">{perf.avg_execution_time.toFixed(1)}초</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">총 실행 횟수</span>
                        <span className="font-semibold text-gray-900">{perf.total_executions.toLocaleString()}회</span>
                      </div>
                    </div>

                    <div className="mt-4">
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full transition-all duration-1000 ease-out ${getStatusColor(perf.success_rate)}`}
                          style={{ width: `${perf.success_rate}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>0%</span>
                        <span>{perf.success_rate}%</span>
                        <span>100%</span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Sample Posts Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">의료법 준수 인증 콘텐츠</h2>
            <p className="text-xl text-gray-600 mb-8">의료광고법을 철저히 준수하면서 SEO 최적화된 실제 생성 콘텐츠들을 확인해보세요</p>

            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {[
                { key: 'all', label: '전체', count: samplePosts.length },
                ...Array.from(new Set(samplePosts.map(p => p.category)))
                  .map(category => ({
                    key: category,
                    label: category,
                    count: samplePosts.filter(p => p.category === category).length
                  }))
              ].map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setSelectedCategory(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
                    selectedCategory === key
                      ? 'bg-blue-600 text-white shadow-md'
                      : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            {samplePosts
              .filter(post => selectedCategory === 'all' || post.category === selectedCategory)
              .slice(0, 6)
              .map((post) => {
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

                return (
                  <Card key={post.post_id} className="overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-blue-200">
                    <div className="p-6">
                      {/* Header */}
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

                      {/* Content */}
                      <h3 className="text-lg font-semibold mb-3 line-clamp-2 text-gray-900 leading-tight">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3 leading-relaxed">
                        {post.excerpt}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          {new Date(post.created_at).toLocaleDateString('ko-KR')}
                        </div>
                        <Link href={`/blog/${post.post_id}`}>
                          <Button variant="secondary" size="sm" className="hover:bg-blue-50 hover:border-blue-300">
                            자세히 보기 →
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
          </div>

          <div className="text-center">
            <Link href="/samples">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
                모든 샘플 콘텐츠 보기
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            의료법 준수 컨텐츠 자동화로<br />
            병원 마케팅의 새로운 시대를 열어보세요
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            30일 무료 체험으로 월 수백 건의 고품질 의료 콘텐츠를 자동 생성하는 시스템을 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                무료 체험 신청
              </Button>
            </Link>
            <Link href="/contact">
              <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white/10">
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}