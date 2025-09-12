'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Check, Star, Zap, Crown } from 'lucide-react';

interface PricingPlan {
  name: string;
  price: number;
  originalPrice?: number;
  features: string[];
  limits: {
    postsPerMonth: number;
    campaigns: number;
    users: number;
  };
  recommended?: boolean;
  icon: React.ReactNode;
  buttonText: string;
  buttonVariant: 'primary' | 'secondary';
}

const pricingPlans: PricingPlan[] = [
  {
    name: '스타터',
    price: 29,
    originalPrice: 39,
    features: [
      '월 10개 포스트 생성',
      '기본 SEO 최적화',
      '의료법 기본 검토',
      '이메일 지원',
      '기본 통계 리포트'
    ],
    limits: {
      postsPerMonth: 10,
      campaigns: 1,
      users: 2
    },
    icon: <Zap className="w-8 h-8 text-primary-500" />,
    buttonText: '무료 체험 시작',
    buttonVariant: 'secondary'
  },
  {
    name: '프로',
    price: 79,
    features: [
      '월 50개 포스트 생성',
      '고급 SEO 최적화',
      '의료법 심층 검토',
      '우선 고객 지원',
      '상세 분석 리포트',
      'API 연동 지원',
      '커스텀 브랜딩'
    ],
    limits: {
      postsPerMonth: 50,
      campaigns: 3,
      users: 5
    },
    recommended: true,
    icon: <Star className="w-8 h-8 text-primary-500" />,
    buttonText: '프로 플랜 시작',
    buttonVariant: 'primary'
  },
  {
    name: '엔터프라이즈',
    price: 199,
    features: [
      '무제한 포스트 생성',
      '프리미엄 SEO 최적화',
      '전문 의료법 검토',
      '24/7 전화 지원',
      '실시간 모니터링',
      '화이트 라벨 솔루션',
      '맞춤 개발 지원',
      '전용 계정 매니저'
    ],
    limits: {
      postsPerMonth: -1, // 무제한
      campaigns: -1, // 무제한
      users: -1 // 무제한
    },
    icon: <Crown className="w-8 h-8 text-primary-500" />,
    buttonText: '문의하기',
    buttonVariant: 'secondary'
  }
];

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const formatLimit = (limit: number) => {
    return limit === -1 ? '무제한' : limit.toString();
  };

  const calculateYearlyPrice = (monthlyPrice: number) => {
    return Math.round(monthlyPrice * 12 * 0.8); // 20% 할인
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 헤더 섹션 */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center max-w-4xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            합리적인 가격으로
            <br />
            <span className="text-primary-600">전문적인 콘텐츠 제작</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            AI가 만드는 의료 콘텐츠, 이제 시작하세요.
            <br />
            투명한 가격과 확실한 품질 보장
          </p>

          {/* 청구 주기 토글 */}
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1 mb-8">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors ${
                billingCycle === 'monthly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              월간 결제
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-colors relative ${
                billingCycle === 'yearly'
                  ? 'bg-white text-primary-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              연간 결제
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                20% 할인
              </span>
            </button>
          </div>
        </div>

        {/* 가격 플랜 카드들 */}
        <div className="grid md:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {pricingPlans.map((plan, index) => (
            <div key={plan.name} className="relative">
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-full text-sm font-medium shadow-lg">
                    추천 플랜
                  </div>
                </div>
              )}

              <Card
                className={`relative p-8 h-full transition-all duration-300 hover:shadow-xl ${
                  plan.recommended
                    ? 'border-primary-300 shadow-lg scale-105'
                    : 'border-gray-200 hover:border-primary-200'
                }`}
              >
                {/* 플랜 아이콘과 이름 */}
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
                    {plan.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {plan.name}
                  </h3>
                </div>

                {/* 가격 */}
                <div className="text-center mb-8">
                  <div className="flex items-center justify-center mb-2">
                    {plan.originalPrice && billingCycle === 'monthly' && (
                      <span className="text-lg text-gray-500 line-through mr-2">
                        ₩{plan.originalPrice.toLocaleString()}
                      </span>
                    )}
                    <span className="text-4xl font-bold text-gray-900">
                      ₩{billingCycle === 'yearly'
                        ? calculateYearlyPrice(plan.price).toLocaleString()
                        : plan.price.toLocaleString()
                      }
                    </span>
                    <span className="text-gray-600 ml-2">
                      /{billingCycle === 'yearly' ? '년' : '월'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && (
                    <p className="text-sm text-gray-600">
                      월 ₩{Math.round(calculateYearlyPrice(plan.price) / 12).toLocaleString()} 계산
                    </p>
                  )}
                </div>

                {/* 기능 목록 */}
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start">
                      <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* 제한사항 */}
                <div className="border-t border-gray-200 pt-6 mb-8">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">제한사항</h4>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex justify-between">
                      <span>월 포스트 생성</span>
                      <span className="font-medium">{formatLimit(plan.limits.postsPerMonth)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>동시 캠페인</span>
                      <span className="font-medium">{formatLimit(plan.limits.campaigns)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>사용자 수</span>
                      <span className="font-medium">{formatLimit(plan.limits.users)}</span>
                    </div>
                  </div>
                </div>

                {/* CTA 버튼 */}
                <div className="text-center">
                  {plan.buttonText === '문의하기' ? (
                    <Link href="/contact" className="block">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full"
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  ) : (
                    <Link href="/signup" className="block">
                      <Button
                        variant={plan.buttonVariant}
                        className="w-full"
                        size="lg"
                      >
                        {plan.buttonText}
                      </Button>
                    </Link>
                  )}
                </div>
              </Card>
            </div>
          ))}
        </div>

        {/* 추가 정보 */}
        <div className="text-center mt-16 max-w-4xl mx-auto">
          <div className="bg-gray-50 rounded-2xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              모든 플랜에 포함되는 혜택
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">무료 체험</h3>
                <p className="text-sm text-gray-600">14일 무료 체험 기간</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">언제든 취소</h3>
                <p className="text-sm text-gray-600">부담 없는 구독</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">24시간 지원</h3>
                <p className="text-sm text-gray-600">빠른 기술 지원</p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Check className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">데이터 보안</h3>
                <p className="text-sm text-gray-600">의료 데이터 보호</p>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ 섹션 */}
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">
            자주 묻는 질문
          </h2>
          <div className="max-w-3xl mx-auto text-left">
            <div className="space-y-6">
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  무료 체험 기간이 끝나면 어떻게 되나요?
                </h3>
                <p className="text-gray-600">
                  14일 무료 체험 기간 종료 후 자동으로 선택하신 플랜으로 전환됩니다.
                  언제든 취소하실 수 있습니다.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  플랜 변경은 어떻게 하나요?
                </h3>
                <p className="text-gray-600">
                  관리자 페이지에서 언제든 플랜을 업그레이드 또는 다운그레이드하실 수 있습니다.
                  변경사항은 다음 결제 주기부터 적용됩니다.
                </p>
              </div>
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  환불 정책은 어떻게 되나요?
                </h3>
                <p className="text-gray-600">
                  서비스 이용에 불만족하실 경우 30일 이내 전액 환불을 보장합니다.
                  자세한 사항은 이용약관을 참고해주세요.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA 섹션 */}
        <div className="text-center mt-16 bg-primary-500 rounded-2xl p-12 text-white">
          <h2 className="text-3xl font-bold mb-4">
            지금 바로 시작하세요
          </h2>
          <p className="text-xl mb-8 opacity-90">
            14일 무료 체험으로 MediContents QA의 모든 기능을 경험해보세요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button variant="secondary" size="lg" className="bg-white text-primary-600 hover:bg-gray-50">
                무료 체험 시작하기
              </Button>
            </Link>
            <Link href="/contact">
              <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-primary-600">
                문의하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
