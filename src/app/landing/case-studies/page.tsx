'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { getCaseStudies } from '@/services/publicApi';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import { TrendingUp, Users, Calendar, Award, Quote, ArrowUp } from 'lucide-react';

interface CaseStudy {
  id: number;
  hospital_name: string;
  category: string;
  metrics: {
    before_score: number;
    after_score: number;
    posts_count: number;
    duration: string;
  };
  testimonial?: string;
  featured_post?: any;
}

export default function CaseStudiesPage() {
  const [caseStudies, setCaseStudies] = useState<CaseStudy[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCaseStudies();
  }, []);

  const loadCaseStudies = async () => {
    try {
      const data = await getCaseStudies();
      setCaseStudies(data);
    } catch (error) {
      console.error('Failed to load case studies:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 헤더 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            실제 성과로
            <br />
            <span className="text-primary-600">검증된 결과</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            다양한 의료기관에서 MediContents QA를 통해 달성한
            <br />
            실제 성과 사례를 확인하세요
          </p>

          {/* 전체 통계 */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <Users className="w-8 h-8 text-primary-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">{caseStudies.length}</div>
              <div className="text-sm text-gray-600">성공 사례</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {caseStudies.length > 0
                  ? Math.round(caseStudies.reduce((sum, cs) => sum + cs.metrics.after_score, 0) / caseStudies.length)
                  : 0}
              </div>
              <div className="text-sm text-gray-600">평균 SEO 점수</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <Calendar className="w-8 h-8 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {caseStudies.reduce((sum, cs) => sum + cs.metrics.posts_count, 0)}
              </div>
              <div className="text-sm text-gray-600">총 콘텐츠 수</div>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-8 h-8 text-yellow-500" />
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {caseStudies.length > 0
                  ? Math.round(caseStudies.reduce((sum, cs) => sum + (cs.metrics.after_score - cs.metrics.before_score), 0) / caseStudies.length)
                  : 0}점
              </div>
              <div className="text-sm text-gray-600">평균 개선도</div>
            </div>
          </div>
        </div>

        {/* 성공 사례 그리드 */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {caseStudies.map((caseStudy, index) => (
            <Card key={caseStudy.id} className="p-6 hover:shadow-xl transition-all duration-300">
              {/* 헤더 */}
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-medium">
                    {caseStudy.category}
                  </span>
                  <div className="flex items-center text-green-600">
                    <ArrowUp className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">
                      +{Math.round(caseStudy.metrics.after_score - caseStudy.metrics.before_score)}점
                    </span>
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-1">
                  {caseStudy.hospital_name}
                </h3>
                <p className="text-gray-600 text-sm">
                  {caseStudy.metrics.duration}간 {caseStudy.metrics.posts_count}개 콘텐츠 생성
                </p>
              </div>

              {/* 성과 지표 */}
              <div className="mb-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-500 mb-1">
                      {caseStudy.metrics.before_score}
                    </div>
                    <div className="text-xs text-gray-600">개선 전</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600 mb-1">
                      {caseStudy.metrics.after_score}
                    </div>
                    <div className="text-xs text-gray-600">개선 후</div>
                  </div>
                </div>

                {/* 개선도 시각화 */}
                <div className="mt-4">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>SEO 점수 개선</span>
                    <span>{Math.round(caseStudy.metrics.after_score - caseStudy.metrics.before_score)}점 상승</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-primary-400 to-primary-600 h-2 rounded-full transition-all duration-1000"
                      style={{
                        width: `${Math.min(100, ((caseStudy.metrics.after_score - caseStudy.metrics.before_score) / 30) * 100)}%`
                      }}
                    ></div>
                  </div>
                </div>
              </div>

              {/* 고객 후기 */}
              {caseStudy.testimonial && (
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <Quote className="w-5 h-5 text-primary-400 mr-2 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-700 text-sm italic">
                      "{caseStudy.testimonial}"
                    </p>
                  </div>
                </div>
              )}

              {/* 추가 정보 */}
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>생성 콘텐츠:</span>
                  <span className="font-medium">{caseStudy.metrics.posts_count}개</span>
                </div>
                <div className="flex justify-between">
                  <span>운영 기간:</span>
                  <span className="font-medium">{caseStudy.metrics.duration}</span>
                </div>
                <div className="flex justify-between">
                  <span>현재 SEO 점수:</span>
                  <span className="font-medium text-green-600">{caseStudy.metrics.after_score}점</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA 섹션 */}
        <div className="text-center mt-16 bg-primary-500 rounded-2xl p-12 text-white max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            귀 기관의 성공 사례를
            <br />
            다음으로 만들어보세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            AI 기반 콘텐츠 자동화로 효율성과 품질을 동시에 달성하세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                무료 체험 시작하기
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                상담 문의하기
              </Button>
            </Link>
          </div>
        </div>

        {/* 추가 정보 섹션 */}
        <div className="mt-16 text-center max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            왜 MediContents QA를 선택할까요?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                검증된 성과
              </h3>
              <p className="text-gray-600 text-sm">
                실제 의료기관에서의 평균 SEO 점수 향상이
                <br />
                <span className="font-semibold text-primary-600">25점 이상</span> 입증되었습니다
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Award className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                의료법 준수
              </h3>
              <p className="text-gray-600 text-sm">
                모든 콘텐츠가 전문 의료법 검토를 통과하며
                <br />
                <span className="font-semibold text-primary-600">법적 안정성</span>을 보장합니다
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                시간 절약
              </h3>
              <p className="text-gray-600 text-sm">
                콘텐츠 제작 시간을 <span className="font-semibold text-primary-600">80% 이상</span> 단축시키며
                <br />
                효율적인 마케팅을 지원합니다
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
