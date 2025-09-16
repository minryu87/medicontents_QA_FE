'use client';

import { useState, useEffect } from 'react';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  Mail,
  Phone,
  MapPin,
  Send,
  CheckCircle,
  AlertCircle,
  User,
  Building,
  MessageSquare,
  Calendar,
  Clock,
  Star,
  Users,
  Briefcase,
  Lightbulb
} from 'lucide-react';

interface ContactFormData {
  inquiryType: 'general' | 'demo' | 'support' | 'partnership';
  name: string;
  email: string;
  phone: string;
  hospitalName: string;
  hospitalSize: string;
  interests: string[];
  message: string;
}

interface HospitalSuggestion {
  id: number;
  name: string;
  address: string;
  phone?: string;
}

const inquiryTypes = [
  {
    id: 'general',
    title: '일반 문의',
    description: '제품 및 서비스에 대한 일반적인 문의사항',
    icon: MessageSquare,
    color: 'bg-blue-50 border-blue-200 text-blue-700'
  },
  {
    id: 'demo',
    title: '데모 요청',
    description: '무료 데모 및 제품 체험을 희망하시는 경우',
    icon: Star,
    color: 'bg-purple-50 border-purple-200 text-purple-700'
  },
  {
    id: 'support',
    title: '기술 지원',
    description: '기술적인 문제 해결 및 사용법 문의',
    icon: Users,
    color: 'bg-green-50 border-green-200 text-green-700'
  },
  {
    id: 'partnership',
    title: '파트너십',
    description: '사업 제휴 및 파트너십 관련 문의',
    icon: Briefcase,
    color: 'bg-orange-50 border-orange-200 text-orange-700'
  }
];

const hospitalSizes = [
  '1-5명',
  '6-10명',
  '11-20명',
  '21-50명',
  '51명 이상'
];

const interests = [
  '콘텐츠 자동화',
  'SEO 최적화',
  '의료법 준수',
  '품질 관리',
  '데이터 분석',
  'API 연동',
  '맞춤 개발'
];

export default function ContactPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    inquiryType: 'general',
    name: '',
    email: '',
    phone: '',
    hospitalName: '',
    hospitalSize: '',
    interests: [],
    message: ''
  });

  const [hospitalSuggestions, setHospitalSuggestions] = useState<HospitalSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<Partial<ContactFormData>>({});

  // 병원명 자동완성
  useEffect(() => {
    if (formData.hospitalName.length >= 2) {
      // 실제로는 API 호출
      const mockSuggestions: HospitalSuggestion[] = [
        { id: 1, name: '서울대학교병원', address: '서울특별시 종로구 대학로 101' },
        { id: 2, name: '세브란스병원', address: '서울특별시 서대문구 연세로 50-1' },
        { id: 3, name: '삼성서울병원', address: '서울특별시 강남구 일원로 81' },
        { id: 4, name: '아산병원', address: '서울특별시 송파구 올림픽로43길 88' },
        { id: 5, name: '강남세브란스병원', address: '서울특별시 강남구 언주로 211' }
      ].filter(hospital =>
        hospital.name.toLowerCase().includes(formData.hospitalName.toLowerCase())
      );
      setHospitalSuggestions(mockSuggestions);
      setShowSuggestions(true);
    } else {
      setHospitalSuggestions([]);
      setShowSuggestions(false);
    }
  }, [formData.hospitalName]);

  const validateForm = (): boolean => {
    const newErrors: Partial<ContactFormData> = {};

    if (!formData.name.trim()) newErrors.name = '이름을 입력해주세요';
    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = '유효한 이메일 주소를 입력해주세요';
    }
    if (!formData.phone.trim()) newErrors.phone = '연락처를 입력해주세요';
    if (!formData.hospitalName.trim()) newErrors.hospitalName = '병원명을 입력해주세요';
    if (!formData.hospitalSize) newErrors.hospitalSize = '병원 규모를 선택해주세요';
    if (!formData.message.trim()) newErrors.message = '문의 내용을 입력해주세요';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      // 실제로는 API 호출
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 성공 처리
      setSubmitStatus('success');

      // 폼 초기화
      setFormData({
        inquiryType: 'general',
        name: '',
        email: '',
        phone: '',
        hospitalName: '',
        hospitalSize: '',
        interests: [],
        message: ''
      });

    } catch (error) {
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof ContactFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 클리어
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleInterestToggle = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const selectHospital = (hospital: HospitalSuggestion) => {
    setFormData(prev => ({ ...prev, hospitalName: hospital.name }));
    setShowSuggestions(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 헤더 섹션 */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              언제든 문의하세요
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              MediContents QA에 대해 궁금하신 점이 있으시면
              <br />
              언제든 연락주세요. 24시간 내에 답변드리겠습니다.
            </p>

            {/* 연락 정보 */}
            <div className="grid md:grid-cols-3 gap-6 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Phone className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-semibold mb-2">전화 상담</h3>
                <p className="text-primary-100 text-sm">02-123-4567</p>
                <p className="text-primary-100 text-xs opacity-75">평일 09:00 - 18:00</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <Mail className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-semibold mb-2">이메일 문의</h3>
                <p className="text-primary-100 text-sm">contact@medicontents.qa</p>
                <p className="text-primary-100 text-xs opacity-75">24시간 접수</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6 border border-white/20">
                <MapPin className="w-8 h-8 text-white mx-auto mb-4" />
                <h3 className="font-semibold mb-2">방문 상담</h3>
                <p className="text-primary-100 text-sm">서울 강남구 테헤란로 123</p>
                <p className="text-primary-100 text-xs opacity-75">사전 예약 필수</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 문의 유형 선택 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">어떤 도움이 필요하신가요?</h2>
              <p className="text-xl text-gray-600">문의 유형을 선택하시면 더 정확한 답변을 드릴 수 있습니다</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
              {inquiryTypes.map((type) => {
                const IconComponent = type.icon;
                return (
                  <button
                    key={type.id}
                    onClick={() => handleInputChange('inquiryType', type.id)}
                    className={`p-6 rounded-lg border-2 transition-all duration-200 text-left ${
                      formData.inquiryType === type.id
                        ? 'border-primary-500 bg-primary-50 shadow-md'
                        : 'border-gray-200 bg-white hover:border-primary-300 hover:shadow-sm'
                    }`}
                  >
                    <IconComponent className={`w-8 h-8 mb-4 ${
                      formData.inquiryType === type.id ? 'text-primary-600' : 'text-gray-600'
                    }`} />
                    <h3 className={`text-lg font-semibold mb-2 ${
                      formData.inquiryType === type.id ? 'text-primary-900' : 'text-gray-900'
                    }`}>
                      {type.title}
                    </h3>
                    <p className={`text-sm ${
                      formData.inquiryType === type.id ? 'text-primary-700' : 'text-gray-600'
                    }`}>
                      {type.description}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 문의 폼 */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <Card className="p-8">
              {submitStatus === 'success' ? (
                <div className="text-center py-12">
                  <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">문의가 성공적으로 접수되었습니다!</h3>
                  <p className="text-gray-600 mb-6">
                    24시간 내에 담당자가 연락드리겠습니다.
                    <br />
                    문의하신 내용에 대해 신속하고 정확한 답변을 준비하겠습니다.
                  </p>
                  <Button
                    onClick={() => setSubmitStatus('idle')}
                    variant="secondary"
                  >
                    추가 문의하기
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">문의 정보 입력</h3>

                  {/* 기본 정보 */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이름 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => handleInputChange('name', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.name ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="담당자명을 입력해주세요"
                        />
                      </div>
                      {errors.name && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        이메일 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleInputChange('email', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.email ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="이메일 주소를 입력해주세요"
                        />
                      </div>
                      {errors.email && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        연락처 <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                        <input
                          type="tel"
                          value={formData.phone}
                          onChange={(e) => handleInputChange('phone', e.target.value)}
                          className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                            errors.phone ? 'border-red-300' : 'border-gray-300'
                          }`}
                          placeholder="010-1234-5678"
                        />
                      </div>
                      {errors.phone && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.phone}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        병원 규모 <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={formData.hospitalSize}
                        onChange={(e) => handleInputChange('hospitalSize', e.target.value)}
                        className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.hospitalSize ? 'border-red-300' : 'border-gray-300'
                        }`}
                      >
                        <option value="">병원 규모를 선택해주세요</option>
                        {hospitalSizes.map(size => (
                          <option key={size} value={size}>{size}</option>
                        ))}
                      </select>
                      {errors.hospitalSize && (
                        <p className="mt-1 text-sm text-red-600 flex items-center">
                          <AlertCircle className="w-4 h-4 mr-1" />
                          {errors.hospitalSize}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* 병원명 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      병원명 <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type="text"
                        value={formData.hospitalName}
                        onChange={(e) => handleInputChange('hospitalName', e.target.value)}
                        className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                          errors.hospitalName ? 'border-red-300' : 'border-gray-300'
                        }`}
                        placeholder="근무하시는 병원명을 입력해주세요"
                      />
                    </div>
                    {errors.hospitalName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.hospitalName}
                      </p>
                    )}

                    {/* 병원명 자동완성 */}
                    {showSuggestions && hospitalSuggestions.length > 0 && (
                      <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                        {hospitalSuggestions.map((hospital) => (
                          <button
                            key={hospital.id}
                            type="button"
                            onClick={() => selectHospital(hospital)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                          >
                            <div className="font-medium text-gray-900">{hospital.name}</div>
                            <div className="text-sm text-gray-600">{hospital.address}</div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 관심 분야 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-4">
                      관심 분야 (복수 선택 가능)
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {interests.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => handleInterestToggle(interest)}
                          className={`p-3 text-left border rounded-lg transition-all duration-200 ${
                            formData.interests.includes(interest)
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-primary-300'
                          }`}
                        >
                          <div className="flex items-center">
                            <div className={`w-4 h-4 rounded border-2 mr-3 ${
                              formData.interests.includes(interest)
                                ? 'bg-primary-500 border-primary-500'
                                : 'border-gray-300'
                            }`} />
                            <span className="text-sm">{interest}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 문의 내용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      문의 내용 <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                        errors.message ? 'border-red-300' : 'border-gray-300'
                      }`}
                      placeholder="문의하실 내용을 자세히 적어주세요. 구체적인 답변을 위해 최대한 상세히 작성해주시면 도움이 됩니다."
                    />
                    {errors.message && (
                      <p className="mt-1 text-sm text-red-600 flex items-center">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        {errors.message}
                      </p>
                    )}
                  </div>

                  {/* 제출 버튼 */}
                  <div className="pt-6">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      size="lg"
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          문의 접수 중...
                        </div>
                      ) : (
                        <div className="flex items-center justify-center">
                          <Send className="w-5 h-5 mr-2" />
                          문의 접수하기
                        </div>
                      )}
                    </Button>
                  </div>

                  {submitStatus === 'error' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center">
                        <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                        <div>
                          <h4 className="text-sm font-medium text-red-800">문의 접수 실패</h4>
                          <p className="text-sm text-red-700 mt-1">
                            일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              )}
            </Card>
          </div>
        </div>
      </section>

      {/* 추가 정보 */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">빠른 답변을 위해</h2>
            <p className="text-xl text-gray-600 mb-12">
              더 정확한 상담을 위해 아래 정보를 함께 보내주시면 도움이 됩니다
            </p>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building className="w-8 h-8 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">병원 정보</h3>
                <p className="text-gray-600 text-sm">
                  병원명, 규모, 현재 사용중인 시스템 등을 알려주시면
                  더 적합한 솔루션을 제안해드릴 수 있습니다.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Lightbulb className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">구체적인 니즈</h3>
                <p className="text-gray-600 text-sm">
                  현재 겪고 있는 문제점이나 이루고 싶은 목표를
                  구체적으로 말씀해주시면 실질적인 도움이 됩니다.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Calendar className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">일정 및 예산</h3>
                <p className="text-gray-600 text-sm">
                  도입 희망 시기와 예산 범위를 알려주시면
                  최적의 플랜을 함께 고민할 수 있습니다.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
