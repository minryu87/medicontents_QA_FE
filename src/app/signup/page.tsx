'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Navigation from '@/components/layout/Navigation';

interface SignupData {
  // 병원 정보
  hospitalName: string;
  hospitalAddress: string;
  hospitalPhone: string;
  medicalServices: string[];

  // 사용자 정보
  name: string;
  email: string;
  phone: string;
  position: string;

  // 서비스 선택
  planType: 'starter' | 'pro' | 'enterprise';

  // 약관 동의
  agreeTerms: boolean;
  agreePrivacy: boolean;
  agreeMarketing: boolean;
}

const STEPS = [
  { id: 1, title: '병원 정보', description: '병원 기본 정보를 입력해주세요' },
  { id: 2, title: '담당자 정보', description: '담당자 정보를 입력해주세요' },
  { id: 3, title: '서비스 선택', description: '사용하실 플랜을 선택해주세요' },
  { id: 4, title: '약관 동의', description: '이용약관에 동의해주세요' },
];

const MEDICAL_SERVICES = [
  '치과', '성형외과', '피부과', '안과', '내과', '산부인과', '정형외과', '신경외과', '흉부외과', '이비인후과', '비뇨기과', '재활의학과'
];

export default function SignupPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [signupData, setSignupData] = useState<SignupData>({
    hospitalName: '',
    hospitalAddress: '',
    hospitalPhone: '',
    medicalServices: [],
    name: '',
    email: '',
    phone: '',
    position: '',
    planType: 'starter',
    agreeTerms: false,
    agreePrivacy: false,
    agreeMarketing: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateSignupData = (field: keyof SignupData, value: any) => {
    setSignupData(prev => ({ ...prev, [field]: value }));
  };

  const toggleMedicalService = (service: string) => {
    setSignupData(prev => ({
      ...prev,
      medicalServices: prev.medicalServices.includes(service)
        ? prev.medicalServices.filter(s => s !== service)
        : [...prev.medicalServices, service]
    }));
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!signupData.agreeTerms || !signupData.agreePrivacy) {
      alert('필수 약관에 동의해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: 실제 회원가입 API 호출
      console.log('회원가입 데이터:', signupData);

      // 임시로 성공 처리
      alert('회원가입이 완료되었습니다! 로그인 페이지로 이동합니다.');
      window.location.href = '/login';

    } catch (error) {
      console.error('회원가입 실패:', error);
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1:
        return signupData.hospitalName && signupData.hospitalAddress && signupData.medicalServices.length > 0;
      case 2:
        return signupData.name && signupData.email && signupData.phone;
      case 3:
        return signupData.planType;
      case 4:
        return signupData.agreeTerms && signupData.agreePrivacy;
      default:
        return false;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />

      <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {STEPS.map((step) => (
              <div key={step.id} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step.id <= currentStep
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step.id}
                </div>
                {step.id < STEPS.length && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">
              {STEPS[currentStep - 1].title}
            </h2>
            <p className="text-gray-600 mt-1">
              {STEPS[currentStep - 1].description}
            </p>
          </div>
        </div>

        <Card className="p-8">
          {/* Step 1: 병원 정보 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  병원명 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signupData.hospitalName}
                  onChange={(e) => updateSignupData('hospitalName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="병원명을 입력해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  병원 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signupData.hospitalAddress}
                  onChange={(e) => updateSignupData('hospitalAddress', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="병원 주소를 입력해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  병원 전화번호
                </label>
                <input
                  type="tel"
                  value={signupData.hospitalPhone}
                  onChange={(e) => updateSignupData('hospitalPhone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="02-123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  진료 과목 <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {MEDICAL_SERVICES.map((service) => (
                    <label key={service} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={signupData.medicalServices.includes(service)}
                        onChange={() => toggleMedicalService(service)}
                        className="mr-2 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{service}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: 담당자 정보 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  담당자 이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={signupData.name}
                  onChange={(e) => updateSignupData('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="담당자 이름을 입력해주세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소 <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={signupData.email}
                  onChange={(e) => updateSignupData('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="email@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  전화번호 <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={signupData.phone}
                  onChange={(e) => updateSignupData('phone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="010-1234-5678"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직책/역할
                </label>
                <select
                  value={signupData.position}
                  onChange={(e) => updateSignupData('position', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">선택해주세요</option>
                  <option value="원장">원장</option>
                  <option value="부원장">부원장</option>
                  <option value="과장">과장</option>
                  <option value="팀장">팀장</option>
                  <option value="담당자">담당자</option>
                  <option value="기타">기타</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 3: 서비스 선택 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  서비스 플랜을 선택해주세요
                </h3>
                <p className="text-gray-600">
                  30일 무료 체험 기간이 제공됩니다
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {/* Starter Plan */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    signupData.planType === 'starter'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => updateSignupData('planType', 'starter')}
                >
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Starter</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-4">₩99,000<span className="text-sm font-normal">/월</span></div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 월 50개 콘텐츠 생성</li>
                      <li>• 기본 AI 에이전트</li>
                      <li>• 이메일 지원</li>
                      <li>• 기본 분석 리포트</li>
                    </ul>
                  </div>
                </div>

                {/* Pro Plan */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    signupData.planType === 'pro'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => updateSignupData('planType', 'pro')}
                >
                  <div className="text-center">
                    <div className="bg-blue-600 text-white text-xs px-2 py-1 rounded mb-2 inline-block">추천</div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Pro</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-4">₩199,000<span className="text-sm font-normal">/월</span></div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 월 200개 콘텐츠 생성</li>
                      <li>• 고급 AI 에이전트</li>
                      <li>• 우선 지원</li>
                      <li>• 고급 분석 리포트</li>
                      <li>• 커스텀 템플릿</li>
                    </ul>
                  </div>
                </div>

                {/* Enterprise Plan */}
                <div
                  className={`border-2 rounded-lg p-6 cursor-pointer transition-all ${
                    signupData.planType === 'enterprise'
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                  onClick={() => updateSignupData('planType', 'enterprise')}
                >
                  <div className="text-center">
                    <h4 className="text-lg font-semibold text-gray-900 mb-2">Enterprise</h4>
                    <div className="text-2xl font-bold text-blue-600 mb-4">별도 문의</div>
                    <ul className="text-sm text-gray-600 space-y-1 mb-4">
                      <li>• 무제한 콘텐츠 생성</li>
                      <li>• 프리미엄 AI 에이전트</li>
                      <li>• 전담 매니저</li>
                      <li>• 맞춤 솔루션</li>
                      <li>• SLA 보장</li>
                      <li>• 온프레미스 배포</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: 약관 동의 */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="text-center mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  이용약관 동의
                </h3>
                <p className="text-gray-600">
                  서비스 이용을 위해 아래 약관에 동의해주세요
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={signupData.agreeTerms}
                    onChange={(e) => updateSignupData('agreeTerms', e.target.checked)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      이용약관 동의 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      MediContents QA 서비스 이용약관에 동의합니다.
                      <Link href="/terms" className="text-blue-600 hover:underline ml-1">약관 보기</Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={signupData.agreePrivacy}
                    onChange={(e) => updateSignupData('agreePrivacy', e.target.checked)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      개인정보 처리방침 동의 <span className="text-red-500">*</span>
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      개인정보 수집 및 이용에 동의합니다.
                      <Link href="/privacy" className="text-blue-600 hover:underline ml-1">개인정보처리방침 보기</Link>
                    </p>
                  </div>
                </div>

                <div className="flex items-start">
                  <input
                    type="checkbox"
                    checked={signupData.agreeMarketing}
                    onChange={(e) => updateSignupData('agreeMarketing', e.target.checked)}
                    className="mt-1 mr-3 text-blue-600 focus:ring-blue-500"
                  />
                  <div>
                    <label className="text-sm font-medium text-gray-700">
                      마케팅 정보 수신 동의 (선택)
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      이벤트 및 프로모션 정보를 이메일로 받아보실 수 있습니다.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-blue-50 rounded-lg">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">입력 정보 확인</h4>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">병원명:</span>
                    <span className="ml-2 text-gray-900">{signupData.hospitalName}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">담당자:</span>
                    <span className="ml-2 text-gray-900">{signupData.name}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">이메일:</span>
                    <span className="ml-2 text-gray-900">{signupData.email}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">플랜:</span>
                    <span className="ml-2 text-gray-900">
                      {signupData.planType === 'starter' ? 'Starter' :
                       signupData.planType === 'pro' ? 'Pro' : 'Enterprise'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <Button
              variant="secondary"
              onClick={prevStep}
              disabled={currentStep === 1}
              className="px-6"
            >
              이전
            </Button>

            {currentStep < STEPS.length ? (
              <Button
                onClick={nextStep}
                disabled={!isStepValid()}
                className="px-6"
              >
                다음
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!isStepValid() || isSubmitting}
                className="px-6"
              >
                {isSubmitting ? '처리중...' : '회원가입 완료'}
              </Button>
            )}
          </div>
        </Card>

        <div className="text-center mt-8">
          <p className="text-gray-600">
            이미 계정이 있으신가요?{' '}
            <Link href="/login" className="text-blue-600 hover:underline font-medium">
              로그인하기
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
