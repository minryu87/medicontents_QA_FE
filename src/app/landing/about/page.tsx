'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import {
  Users,
  Target,
  Award,
  TrendingUp,
  Heart,
  Lightbulb,
  Shield,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  Star,
  Code,
  Zap
} from 'lucide-react';

interface CompanyStats {
  totalPosts: number;
  activeHospitals: number;
  avgQualityScore: number;
  yearsOfService: number;
}

interface TeamMember {
  id: number;
  name: string;
  role: string;
  bio: string;
  image?: string;
  expertise: string[];
  achievements: string[];
}

interface Milestone {
  year: number;
  title: string;
  description: string;
  impact: string;
}

const teamMembers: TeamMember[] = [
  {
    id: 1,
    name: '김철수',
    role: '대표이사 & CTO',
    bio: 'AI와 헬스케어 분야에서 15년 이상의 경험을 가진 전문가로, 의료 콘텐츠 자동화 솔루션의 선구자입니다.',
    expertise: ['AI/ML', '의료 콘텐츠', '시스템 아키텍처'],
    achievements: ['의료 AI 스타트업 창업', '특허 5건 보유', '산업통상자원부 장관상 수상']
  },
  {
    id: 2,
    name: '이영희',
    role: 'COO & 마케팅 총괄',
    bio: '헬스케어 마케팅 전문가로, 200개 이상의 병원과 협력하며 디지털 마케팅 전략을 수립해왔습니다.',
    expertise: ['의료 마케팅', '고객 성공', '사업 개발'],
    achievements: ['의료 마케팅 대행사 운영', '병원 디지털 전환 프로젝트 50+ 진행', '한국의료마케팅협회 이사']
  },
  {
    id: 3,
    name: '박민수',
    role: '헤드 오브 프로덕트',
    bio: '사용자 경험 디자인과 프로덕트 매니지먼트를 전문으로 하는 프로덕트 리더입니다.',
    expertise: ['프로덕트 전략', 'UX/UI 디자인', '데이터 분석'],
    achievements: ['헬스케어 SaaS 플랫폼 구축', '사용자 만족도 95% 달성', 'Google UX Design 인증']
  },
  {
    id: 4,
    name: '정수진',
    role: '의료 콘텐츠 전문가',
    bio: '의학박사이자 콘텐츠 전문가로, 환자와 의료진 모두가 이해하기 쉬운 콘텐츠 제작을 추구합니다.',
    expertise: ['의학 콘텐츠', 'SEO 최적화', '의료법 준수'],
    achievements: ['의학논문 20편 발표', '의료 콘텐츠 SEO 최적화 방법론 개발', '대한의사협회 의료커뮤니케이션상 수상']
  }
];

const milestones: Milestone[] = [
  {
    year: 2020,
    title: '회사 설립',
    description: '의료 콘텐츠 자동화의 필요성을 인지하고 MediContents를 설립했습니다.',
    impact: '의료 마케팅 분야의 혁신을 시작했습니다.'
  },
  {
    year: 2021,
    title: '첫 AI 모델 개발',
    description: 'GPT-3 기반의 초기 AI 콘텐츠 생성 모델을 개발했습니다.',
    impact: '콘텐츠 생성 속도를 10배 향상시켰습니다.'
  },
  {
    year: 2022,
    title: '의료법 준수 시스템 구축',
    description: '의료법 전문가들과 협력하여 자동 준수 검증 시스템을 개발했습니다.',
    impact: '콘텐츠의 법적 안정성을 95% 이상 확보했습니다.'
  },
  {
    year: 2023,
    title: '플랫폼 런칭 및 첫 고객 확보',
    description: 'MediContents QA 플랫폼을 정식 런칭하고 50개 이상의 병원과 계약했습니다.',
    impact: '의료 마케팅 시장에서 입지를 확고히 했습니다.'
  },
  {
    year: 2024,
    title: 'AI 성능 고도화 및 확장',
    description: '6개 AI 에이전트 기반의 협업 시스템을 구축하고 글로벌 시장 진출을 준비합니다.',
    impact: '전 세계 의료 기관을 대상으로 서비스를 제공할 수 있게 되었습니다.'
  }
];

export default function AboutPage() {
  const [stats, setStats] = useState<CompanyStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'story' | 'team' | 'tech' | 'contact'>('story');

  useEffect(() => {
    loadCompanyStats();
  }, []);

  const loadCompanyStats = async () => {
    try {
      // 실제로는 API 호출
      const mockStats: CompanyStats = {
        totalPosts: 12450,
        activeHospitals: 89,
        avgQualityScore: 91.7,
        yearsOfService: 4
      };
      setStats(mockStats);
    } catch (error) {
      console.error('Failed to load company stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white">
      {/* 히어로 섹션 */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              의료 콘텐츠의 미래를
              <br />
              <span className="text-primary-100">AI로 만들어가는 기업</span>
            </h1>
            <p className="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
              MediContents QA는 AI 기술로 의료 콘텐츠 제작의 효율성과 신뢰성을 혁신하며,
              환자들에게 정확하고 이해하기 쉬운 의료 정보를 제공하는 것을 사명으로 합니다.
            </p>

            {/* 핵심 가치 카드 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex flex-col items-center text-center">
                  <Shield className="w-6 h-6 text-white mb-2" />
                  <h3 className="font-semibold text-sm mb-1">신뢰성</h3>
                  <p className="text-xs text-primary-100 opacity-90">의료법 준수와 정확한 정보</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex flex-col items-center text-center">
                  <Zap className="w-6 h-6 text-white mb-2" />
                  <h3 className="font-semibold text-sm mb-1">효율성</h3>
                  <p className="text-xs text-primary-100 opacity-90">AI 자동화로 시간 절약</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex flex-col items-center text-center">
                  <Heart className="w-6 h-6 text-white mb-2" />
                  <h3 className="font-semibold text-sm mb-1">환자 중심</h3>
                  <p className="text-xs text-primary-100 opacity-90">환자 경험 개선 최우선</p>
                </div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex flex-col items-center text-center">
                  <Users className="w-6 h-6 text-white mb-2" />
                  <h3 className="font-semibold text-sm mb-1">협력</h3>
                  <p className="text-xs text-primary-100 opacity-90">의료 생태계와 함께 성장</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 탭 네비게이션 */}
      <div className="bg-white shadow-sm">
        <div className="container mx-auto px-4">
          <div className="flex justify-center">
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {[
                { id: 'story', label: '회사 이야기', icon: Target },
                { id: 'team', label: '팀 소개', icon: Users },
                { id: 'tech', label: '기술', icon: Code },
                { id: 'contact', label: '연락처', icon: MapPin }
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-md text-sm font-medium transition-all duration-200 ${
                    activeTab === id
                      ? 'bg-primary-600 text-white shadow-md'
                      : 'text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 콘텐츠 섹션 */}
      <div className="container mx-auto px-4 py-16">
        {/* 회사 이야기 탭 */}
        {activeTab === 'story' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">우리의 시작과 비전</h2>
              <p className="text-xl text-gray-600">AI로 의료 콘텐츠의 미래를 만들어가는 여정</p>
            </div>

            <div className="prose prose-lg mx-auto mb-12">
              <p className="text-gray-700 leading-relaxed mb-6">
                2020년, 코로나19 팬데믹이 전 세계를 강타했을 때 우리는 한 가지 중요한 사실을 깨달았습니다.
                환자들은 정확하고 신뢰할 수 있는 의료 정보를 필요로 했지만, 병원들은 콘텐츠 제작에 많은 시간과
                비용을 투자해야 했습니다.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                기존의 콘텐츠 제작 방식은 비효율적이었고, 무엇보다도 의료법 준수의 어려움으로 인해
                양질의 콘텐츠 생산이 어려운 상황이었습니다. 이러한 문제를 해결하기 위해 우리는
                AI 기술을 활용한 혁신적인 솔루션을 개발하기 시작했습니다.
              </p>

              <p className="text-gray-700 leading-relaxed mb-6">
                3년간의 연구 개발 끝에 우리는 6개의 전문 AI 에이전트로 구성된 시스템을 완성했습니다.
                이 시스템은 콘텐츠 기획부터 의료법 검토까지 모든 과정을 자동화하면서도,
                최고 수준의 품질을 유지합니다.
              </p>
            </div>

            {/* 비전과 미션 */}
            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8 text-center">
                <Target className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">비전</h3>
                <p className="text-gray-700">
                  모든 환자가 정확하고 이해하기 쉬운 의료 정보를 손쉽게 접할 수 있는
                  의료 생태계를 만들어 나가는 것
                </p>
              </Card>

              <Card className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 mb-4">미션</h3>
                <p className="text-gray-700">
                  AI 기술로 의료 콘텐츠 제작의 효율성과 신뢰성을 혁신하여
                  환자 경험을 근본적으로 개선하는 것
                </p>
              </Card>
            </div>

            {/* 연혁 타임라인 */}
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">연혁</h3>
              <div className="space-y-8">
                {milestones.map((milestone, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                        <Calendar className="w-6 h-6 text-primary-600" />
                      </div>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-2">
                        <span className="text-sm font-medium text-primary-600 bg-primary-50 px-3 py-1 rounded-full">
                          {milestone.year}년
                        </span>
                        <h4 className="text-lg font-semibold text-gray-900">{milestone.title}</h4>
                      </div>
                      <p className="text-gray-600">{milestone.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 팀 소개 탭 */}
        {activeTab === 'team' && (
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">함께하는 팀</h2>
              <p className="text-xl text-gray-600">다양한 분야의 전문가들이 모여 의료 콘텐츠 혁신을 만들어가고 있습니다</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {teamMembers.map((member) => (
                <Card key={member.id} className="p-6 text-center hover:shadow-xl transition-all duration-300">
                  <div className="w-24 h-24 bg-primary-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                    <Users className="w-12 h-12 text-primary-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{member.name}</h3>
                  <p className="text-primary-600 font-medium mb-4">{member.role}</p>
                  <p className="text-gray-600 text-sm leading-relaxed">{member.bio}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* 기술 탭 */}
        {activeTab === 'tech' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">혁신적인 기술</h2>
              <p className="text-xl text-gray-600">의료 분야 특화된 AI 기술로 차별화된 솔루션을 제공합니다</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 mb-12">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">6개 전문 AI 에이전트</h3>
                <ul className="space-y-3 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>입력 분석 에이전트:</strong> 환자 입력을 구조화하여 콘텐츠 기획의 기반을 마련합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>콘텐츠 기획 에이전트:</strong> SEO 최적화된 콘텐츠 구조를 자동으로 설계합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>제목 생성 에이전트:</strong> 클릭률이 높은 제목을 AI가 자동으로 생성합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>본문 작성 에이전트:</strong> 환자 중심의 이해하기 쉬운 콘텐츠를 작성합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>품질 평가 에이전트:</strong> SEO 점수와 의료법 준수도를 자동으로 평가합니다.</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span><strong>콘텐츠 편집 에이전트:</strong> 품질 개선을 위한 자동 편집을 수행합니다.</span>
                  </li>
                </ul>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-4">의료법 준수 시스템</h3>
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-800 mb-2">15개 의료법 체크리스트</h4>
                    <p className="text-green-700 text-sm">
                      의료법, 약사법, 의료기기법 등 모든 관련 법규를 자동으로 검토하여
                      100% 법적 준수를 보장합니다.
                    </p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-800 mb-2">실시간 검증</h4>
                    <p className="text-blue-700 text-sm">
                      콘텐츠 작성 과정에서 실시간으로 법적 검토를 수행하여
                      사전 문제 해결이 가능합니다.
                    </p>
                  </div>
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-800 mb-2">품질 점수화</h4>
                    <p className="text-purple-700 text-sm">
                      SEO 점수와 의료법 준수도를 100점 만점으로 수치화하여
                      객관적인 품질 평가가 가능합니다.
                    </p>
                  </div>
                </div>
              </Card>
            </div>

            {/* 기술 스택 */}
            <Card className="p-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">기술 스택</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Code className="w-6 h-6 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">AI/ML</h4>
                  <p className="text-sm text-gray-600">GPT-4, BERT, Custom Models</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Shield className="w-6 h-6 text-green-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">보안</h4>
                  <p className="text-sm text-gray-600">HIPAA, 개인정보 보호</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">확장성</h4>
                  <p className="text-sm text-gray-600">클라우드 네이티브, API</p>
                </div>
                <div className="text-center">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1">성능</h4>
                  <p className="text-sm text-gray-600">실시간 처리, 고가용성</p>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* 연락처 탭 */}
        {activeTab === 'contact' && (
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">연락처</h2>
              <p className="text-xl text-gray-600">궁금하신 점이 있으시면 언제든 연락주세요</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">본사 및 연락처</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="w-5 h-5 text-primary-600 mr-3 mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">주소</p>
                      <p className="text-gray-600">서울특별시 강남구 테헤란로 123</p>
                      <p className="text-gray-600">MediContents 빌딩 15층</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">전화</p>
                      <p className="text-gray-600">02-123-4567</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-primary-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">이메일</p>
                      <p className="text-gray-600">contact@medicontents.qa</p>
                    </div>
                  </div>
                </div>
              </Card>

              <Card className="p-8">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">문의 및 상담</h3>
                <div className="space-y-4 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">일반 문의</h4>
                    <p className="text-gray-600 text-sm">제품 및 서비스에 대한 일반적인 문의사항</p>
                    <p className="text-primary-600 font-medium">contact@medicontents.qa</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">기술 지원</h4>
                    <p className="text-gray-600 text-sm">기술적인 문제 및 사용법 문의</p>
                    <p className="text-primary-600 font-medium">support@medicontents.qa</p>
                  </div>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">파트너십</h4>
                    <p className="text-gray-600 text-sm">사업 제휴 및 파트너십 문의</p>
                    <p className="text-primary-600 font-medium">partnership@medicontents.qa</p>
                  </div>
                </div>

                <Link href="/contact">
                  <Button className="w-full" size="lg">
                    자세한 문의하기
                  </Button>
                </Link>
              </Card>
            </div>
          </div>
        )}
      </div>

      {/* CTA 섹션 */}
      <div className="bg-primary-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            함께 의료 콘텐츠의 미래를 만들어갈까요?
          </h2>
          <p className="text-xl mb-8 text-primary-100">
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
                상담 문의하기
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
