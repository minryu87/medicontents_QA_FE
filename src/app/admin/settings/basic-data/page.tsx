'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminApi } from '@/services/api';

interface MedicalService {
  id: number;
  symptom: string;
  procedure: string;
  treatment: string;
  category: string;
  created_at: string;
}

interface PersonaStyle {
  id: number;
  persona_type: string;
  writing_style: string;
  tone_description: string;
  target_audience: string;
  example_content: string;
  created_at: string;
}

interface ClinicalContext {
  id: number;
  context_type: string;
  context_key: string;
  context_value: string;
  description: string;
  created_at: string;
}

export default function BasicDataSettings() {
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [personaStyles, setPersonaStyles] = useState<PersonaStyle[]>([]);
  const [clinicalContexts, setClinicalContexts] = useState<ClinicalContext[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('medical-services');

  // New item forms
  const [newMedicalService, setNewMedicalService] = useState({
    symptom: '',
    procedure: '',
    treatment: '',
    category: ''
  });

  const [newPersonaStyle, setNewPersonaStyle] = useState({
    persona_type: '',
    writing_style: '',
    tone_description: '',
    target_audience: '',
    example_content: ''
  });

  const [newClinicalContext, setNewClinicalContext] = useState({
    context_type: '',
    context_key: '',
    context_value: '',
    description: ''
  });

  useEffect(() => {
    loadAllData();
  }, []);

  const loadAllData = async () => {
    try {
      setLoading(true);
      // 실제 API 호출로 데이터 로드 (현재는 샘플 데이터 사용)
      await loadMedicalServices();
      await loadPersonaStyles();
      await loadClinicalContexts();
    } catch (error) {
      console.error('데이터 로드 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMedicalServices = async () => {
    try {
      // 실제로는 API 호출
      const sampleData: MedicalService[] = [
        {
          id: 1,
          symptom: '치아 통증',
          procedure: '충치 치료',
          treatment: '레진 충전',
          category: '보존',
          created_at: '2024-01-01T00:00:00Z'
        },
        {
          id: 2,
          symptom: '잇몸 염증',
          procedure: '스케일링',
          treatment: '초음파 세척',
          category: '예방',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      setMedicalServices(sampleData);
    } catch (error) {
      console.error('Medical services 로드 실패:', error);
    }
  };

  const loadPersonaStyles = async () => {
    try {
      const sampleData: PersonaStyle[] = [
        {
          id: 1,
          persona_type: '전문의',
          writing_style: '학술적이고 전문적',
          tone_description: '신뢰할 수 있고 권위 있는 톤',
          target_audience: '의료 종사자',
          example_content: '치료 과정에 대한 상세한 의학적 설명',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      setPersonaStyles(sampleData);
    } catch (error) {
      console.error('Persona styles 로드 실패:', error);
    }
  };

  const loadClinicalContexts = async () => {
    try {
      const sampleData: ClinicalContext[] = [
        {
          id: 1,
          context_type: '진단 코드',
          context_key: 'K02.1',
          context_value: '치아 법랑질 우식',
          description: '충치 초기 단계',
          created_at: '2024-01-01T00:00:00Z'
        }
      ];
      setClinicalContexts(sampleData);
    } catch (error) {
      console.error('Clinical contexts 로드 실패:', error);
    }
  };

  const addMedicalService = async () => {
    if (!newMedicalService.symptom || !newMedicalService.procedure || !newMedicalService.treatment) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    try {
      // 실제로는 API 호출
      const newService: MedicalService = {
        id: Date.now(),
        ...newMedicalService,
        created_at: new Date().toISOString()
      };

      setMedicalServices([...medicalServices, newService]);
      setNewMedicalService({
        symptom: '',
        procedure: '',
        treatment: '',
        category: ''
      });
    } catch (error) {
      console.error('Medical service 추가 실패:', error);
      alert('추가 중 오류가 발생했습니다.');
    }
  };

  const addPersonaStyle = async () => {
    if (!newPersonaStyle.persona_type || !newPersonaStyle.writing_style) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    try {
      const newStyle: PersonaStyle = {
        id: Date.now(),
        ...newPersonaStyle,
        created_at: new Date().toISOString()
      };

      setPersonaStyles([...personaStyles, newStyle]);
      setNewPersonaStyle({
        persona_type: '',
        writing_style: '',
        tone_description: '',
        target_audience: '',
        example_content: ''
      });
    } catch (error) {
      console.error('Persona style 추가 실패:', error);
      alert('추가 중 오류가 발생했습니다.');
    }
  };

  const addClinicalContext = async () => {
    if (!newClinicalContext.context_type || !newClinicalContext.context_key) {
      alert('필수 필드를 입력해주세요.');
      return;
    }

    try {
      const newContext: ClinicalContext = {
        id: Date.now(),
        ...newClinicalContext,
        created_at: new Date().toISOString()
      };

      setClinicalContexts([...clinicalContexts, newContext]);
      setNewClinicalContext({
        context_type: '',
        context_key: '',
        context_value: '',
        description: ''
      });
    } catch (error) {
      console.error('Clinical context 추가 실패:', error);
      alert('추가 중 오류가 발생했습니다.');
    }
  };

  const deleteMedicalService = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      setMedicalServices(medicalServices.filter(service => service.id !== id));
    } catch (error) {
      console.error('Medical service 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const deletePersonaStyle = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      setPersonaStyles(personaStyles.filter(style => style.id !== id));
    } catch (error) {
      console.error('Persona style 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const deleteClinicalContext = async (id: number) => {
    if (!confirm('정말로 삭제하시겠습니까?')) return;

    try {
      setClinicalContexts(clinicalContexts.filter(context => context.id !== id));
    } catch (error) {
      console.error('Clinical context 삭제 실패:', error);
      alert('삭제 중 오류가 발생했습니다.');
    }
  };

  const generateSymptomProcedureTreatment = async () => {
    try {
      // 실제로는 백엔드 API 호출로 클러스터링 수행
      alert('키워드 테이블 생성을 시작합니다. 이 작업은 몇 분 정도 소요될 수 있습니다.');
      // 클러스터링 로직 구현 필요
    } catch (error) {
      console.error('키워드 생성 실패:', error);
      alert('키워드 생성 중 오류가 발생했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">시스템 기본 데이터 설정</h1>
        <p className="text-gray-600 mt-2">
          AI 콘텐츠 생성을 위한 기본 데이터를 설정합니다. 이 데이터들은 시스템의 핵심 기능 동작에 필수적입니다.
        </p>
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center">
            <span className="text-yellow-600 text-lg mr-2">⚠️</span>
            <div>
              <h3 className="font-medium text-yellow-800">중요 안내</h3>
              <p className="text-yellow-700 text-sm mt-1">
                이 페이지의 데이터는 AI 에이전트의 정확한 작동을 위해 반드시 설정되어야 합니다.
                데이터가 불완전할 경우 콘텐츠 생성 품질이 저하될 수 있습니다.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="medical-services">진료 서비스</TabsTrigger>
          <TabsTrigger value="persona-styles">페르소나 스타일</TabsTrigger>
          <TabsTrigger value="clinical-contexts">임상 컨텍스트</TabsTrigger>
          <TabsTrigger value="auto-generation">자동 생성</TabsTrigger>
        </TabsList>

        {/* 진료 서비스 관리 */}
        <TabsContent value="medical-services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>진료 서비스 데이터</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    증상 → 진료 → 치료의 매핑 데이터를 관리합니다. ({medicalServices.length}개 항목)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 추가 폼 */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">새 진료 서비스 추가</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    placeholder="증상 (예: 치아 통증)"
                    value={newMedicalService.symptom}
                    onChange={(e) => setNewMedicalService(prev => ({ ...prev, symptom: e.target.value }))}
                  />
                  <Input
                    placeholder="진료 (예: 충치 치료)"
                    value={newMedicalService.procedure}
                    onChange={(e) => setNewMedicalService(prev => ({ ...prev, procedure: e.target.value }))}
                  />
                  <Input
                    placeholder="치료 (예: 레진 충전)"
                    value={newMedicalService.treatment}
                    onChange={(e) => setNewMedicalService(prev => ({ ...prev, treatment: e.target.value }))}
                  />
                  <Input
                    placeholder="카테고리 (예: 보존)"
                    value={newMedicalService.category}
                    onChange={(e) => setNewMedicalService(prev => ({ ...prev, category: e.target.value }))}
                  />
                </div>
                <div className="mt-3">
                  <Button onClick={addMedicalService}>추가</Button>
                </div>
              </div>

              {/* 데이터 목록 */}
              <div className="space-y-3">
                {medicalServices.map((service) => (
                  <div key={service.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">증상</span>
                        <p className="font-medium">{service.symptom}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">진료</span>
                        <p>{service.procedure}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">치료</span>
                        <p>{service.treatment}</p>
                      </div>
                      <div>
                        <Badge variant="outline">{service.category}</Badge>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteMedicalService(service.id)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 페르소나 스타일 관리 */}
        <TabsContent value="persona-styles" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>페르소나 스타일 데이터</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    페르소나 유형별 글쓰기 스타일을 정의합니다. ({personaStyles.length}개 항목)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 추가 폼 */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">새 페르소나 스타일 추가</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <Input
                    placeholder="페르소나 유형 (예: 전문의)"
                    value={newPersonaStyle.persona_type}
                    onChange={(e) => setNewPersonaStyle(prev => ({ ...prev, persona_type: e.target.value }))}
                  />
                  <Input
                    placeholder="글쓰기 스타일 (예: 학술적이고 전문적)"
                    value={newPersonaStyle.writing_style}
                    onChange={(e) => setNewPersonaStyle(prev => ({ ...prev, writing_style: e.target.value }))}
                  />
                  <Input
                    placeholder="톤 설명 (예: 신뢰할 수 있고 권위 있는 톤)"
                    value={newPersonaStyle.tone_description}
                    onChange={(e) => setNewPersonaStyle(prev => ({ ...prev, tone_description: e.target.value }))}
                  />
                  <Input
                    placeholder="타겟 청중 (예: 의료 종사자)"
                    value={newPersonaStyle.target_audience}
                    onChange={(e) => setNewPersonaStyle(prev => ({ ...prev, target_audience: e.target.value }))}
                  />
                  <div className="md:col-span-2">
                    <textarea
                      placeholder="예시 콘텐츠"
                      value={newPersonaStyle.example_content}
                      onChange={(e) => setNewPersonaStyle(prev => ({ ...prev, example_content: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md"
                      rows={3}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <Button onClick={addPersonaStyle}>추가</Button>
                </div>
              </div>

              {/* 데이터 목록 */}
              <div className="space-y-3">
                {personaStyles.map((style) => (
                  <div key={style.id} className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h4 className="font-medium">{style.persona_type}</h4>
                        <p className="text-sm text-gray-600">{style.writing_style}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="danger"
                        onClick={() => deletePersonaStyle(style.id)}
                      >
                        삭제
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-500">톤:</span> {style.tone_description}
                      </div>
                      <div>
                        <span className="font-medium text-gray-500">청중:</span> {style.target_audience}
                      </div>
                      {style.example_content && (
                        <div className="md:col-span-2">
                          <span className="font-medium text-gray-500">예시:</span>
                          <p className="mt-1 text-gray-700">{style.example_content}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 임상 컨텍스트 관리 */}
        <TabsContent value="clinical-contexts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>임상 컨텍스트 데이터</CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    임상 상황별 컨텍스트 정보를 관리합니다. ({clinicalContexts.length}개 항목)
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* 추가 폼 */}
              <div className="mb-6 p-4 border rounded-lg bg-gray-50">
                <h3 className="font-medium mb-3">새 임상 컨텍스트 추가</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <Input
                    placeholder="컨텍스트 타입 (예: 진단 코드)"
                    value={newClinicalContext.context_type}
                    onChange={(e) => setNewClinicalContext(prev => ({ ...prev, context_type: e.target.value }))}
                  />
                  <Input
                    placeholder="키 (예: K02.1)"
                    value={newClinicalContext.context_key}
                    onChange={(e) => setNewClinicalContext(prev => ({ ...prev, context_key: e.target.value }))}
                  />
                  <Input
                    placeholder="값 (예: 치아 법랑질 우식)"
                    value={newClinicalContext.context_value}
                    onChange={(e) => setNewClinicalContext(prev => ({ ...prev, context_value: e.target.value }))}
                  />
                  <Input
                    placeholder="설명 (예: 충치 초기 단계)"
                    value={newClinicalContext.description}
                    onChange={(e) => setNewClinicalContext(prev => ({ ...prev, description: e.target.value }))}
                  />
                </div>
                <div className="mt-3">
                  <Button onClick={addClinicalContext}>추가</Button>
                </div>
              </div>

              {/* 데이터 목록 */}
              <div className="space-y-3">
                {clinicalContexts.map((context) => (
                  <div key={context.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1 grid grid-cols-1 md:grid-cols-4 gap-2">
                      <div>
                        <span className="text-sm font-medium text-gray-500">타입</span>
                        <p className="font-medium">{context.context_type}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">키</span>
                        <p className="font-mono text-sm">{context.context_key}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">값</span>
                        <p>{context.context_value}</p>
                      </div>
                      <div>
                        <span className="text-sm font-medium text-gray-500">설명</span>
                        <p className="text-sm">{context.description}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => deleteClinicalContext(context.id)}
                    >
                      삭제
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 자동 생성 */}
        <TabsContent value="auto-generation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>키워드 테이블 자동 생성</CardTitle>
              <p className="text-sm text-gray-600 mt-1">
                위의 데이터를 기반으로 증상-진료-치료 간의 관계를 분석하여 키워드 테이블을 생성합니다.
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="p-6 border rounded-lg bg-blue-50 border-blue-200">
                  <div className="flex items-start">
                    <span className="text-blue-600 text-2xl mr-4">🤖</span>
                    <div className="flex-1">
                      <h3 className="font-medium text-blue-800 mb-2">클러스터링 기반 키워드 생성</h3>
                      <p className="text-blue-700 text-sm mb-4">
                        입력된 진료 서비스 데이터를 분석하여 증상, 진료, 치료 간의 의미적 관계를 파악하고,
                        자동으로 키워드 클러스터를 생성합니다. 이 과정은 AI가 수행하며 몇 분 정도 소요될 수 있습니다.
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-800">현재 데이터</div>
                          <div className="text-blue-600">{medicalServices.length}개 진료 서비스</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-800">예상 생성</div>
                          <div className="text-green-600">~{Math.max(10, medicalServices.length * 3)}개 키워드 클러스터</div>
                        </div>
                        <div className="bg-white p-3 rounded border">
                          <div className="font-medium text-gray-800">처리 시간</div>
                          <div className="text-orange-600">2-5분</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center">
                  <Button
                    onClick={generateSymptomProcedureTreatment}
                    className="px-8 py-3"
                    disabled={medicalServices.length === 0}
                  >
                    키워드 테이블 생성 시작
                  </Button>
                </div>

                {medicalServices.length === 0 && (
                  <div className="text-center py-8">
                    <div className="text-yellow-600 text-4xl mb-4">⚠️</div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">진료 서비스 데이터가 필요합니다</h3>
                    <p className="text-gray-600">
                      키워드 생성을 위해서는 먼저 진료 서비스 데이터를 입력해야 합니다.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
