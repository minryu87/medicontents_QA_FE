'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getPublicStats, getAgentPerformance, getSamplePosts } from '@/services/publicApi';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';

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

export default function LandingPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [agentPerformance, setAgentPerformance] = useState<AgentPerformance | null>(null);
  const [samplePosts, setSamplePosts] = useState<SamplePost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsData, agentData, samplesData] = await Promise.all([
        getPublicStats(),
        getAgentPerformance(),
        getSamplePosts(6)
      ]);
      
      setStats(statsData);
      setAgentPerformance(agentData);
      setSamplePosts(samplesData.samples || []);
    } catch (error) {
      console.error('Error loading data:', error);
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

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6">
              AI가 만드는 의료 콘텐츠,<br />
              의료법도 SEO도 완벽하게
            </h1>
            <p className="text-xl mb-8 text-blue-100">
              매월 고품질 의료 콘텐츠를 자동으로 생성하고 관리하세요
            </p>
            
            {/* Stats */}
            {stats && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">{stats.total_posts.toLocaleString()}</div>
                  <div className="text-sm text-blue-100">생성된 콘텐츠</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">{stats.active_hospitals}</div>
                  <div className="text-sm text-blue-100">활성 병원</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">{stats.avg_seo_score}</div>
                  <div className="text-sm text-blue-100">평균 SEO 점수</div>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <div className="text-3xl font-bold">{stats.avg_legal_score}</div>
                  <div className="text-sm text-blue-100">평균 의료법 점수</div>
                </div>
              </div>
            )}
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
                  무료 체험 시작하기
                </Button>
              </Link>
              <Link href="/blog">
                <Button size="lg" variant="secondary" className="border-white text-white hover:bg-white/10">
                  샘플 콘텐츠 보기
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">강력한 AI 에이전트 시스템</h2>
            <p className="text-xl text-gray-600">6개의 전문 AI가 협업하여 완벽한 콘텐츠를 생성합니다</p>
          </div>
          
          {agentPerformance && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {Object.entries(agentPerformance).map(([agent, perf]) => (
                <Card key={agent} className="p-6">
                  <h3 className="text-xl font-semibold mb-4 capitalize">{agent} Agent</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">성공률</span>
                      <span className="font-semibold">{perf.success_rate}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">평균 처리 시간</span>
                      <span className="font-semibold">{perf.avg_execution_time.toFixed(1)}초</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">총 실행 횟수</span>
                      <span className="font-semibold">{perf.total_executions.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${perf.success_rate}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sample Posts Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">실제 생성된 콘텐츠 예시</h2>
            <p className="text-xl text-gray-600">높은 품질 점수를 받은 실제 콘텐츠들을 확인해보세요</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {samplePosts.map((post) => (
              <Card key={post.post_id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm text-blue-600 font-semibold">{post.category}</span>
                    <div className="flex gap-2">
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        SEO {post.scores.seo}
                      </span>
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        Legal {post.scores.legal}
                      </span>
                    </div>
                  </div>
                  <h3 className="text-lg font-semibold mb-2 line-clamp-2">{post.title}</h3>
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">{post.excerpt}</p>
                  <Link href={`/blog/${post.post_id}`}>
                    <Button variant="secondary" size="sm" className="w-full">
                      자세히 보기
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="text-center">
            <Link href="/blog">
              <Button size="lg">모든 샘플 보기</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 text-blue-100">
            30일 무료 체험으로 AI 콘텐츠 생성의 힘을 경험해보세요
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