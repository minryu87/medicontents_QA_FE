'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientApi, adminApi } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import { Badge } from '@/components/shared/Badge';
import { Button } from '@/components/shared/Button';
import { FileText, Users, Calendar, ArrowLeft, ArrowRight, Upload, X, CheckCircle, AlertTriangle } from 'lucide-react';

interface Post {
  post_id: string;
  title?: string;
  campaign?: {
    id: number;
    name: string;
  };
  publish_date?: string;
}

interface MedicalServicesData {
  treatments: any[];
  symptoms: string[];
  procedures: string[];
}

interface PersonaStyle {
  id: number;
  representative_persona: string;
  persona_description?: string;
}

// 입력 방식 타입
type InputMethod = 'manual' | 'emr';

export default function MaterialsProvisionPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [medicalServices, setMedicalServices] = useState<MedicalServicesData | null>(null);
  const [personaStyles, setPersonaStyles] = useState<PersonaStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // 입력 방식 선택
  const [selectedInputMethod, setSelectedInputMethod] = useState<InputMethod>('manual');
  const [currentStep, setCurrentStep] = useState(1);

  // EMR 관련 상태
  const [emrSearch, setEMRSearch] = useState({ type: 'name' as 'name' | 'id' | 'phone', query: '' });
  const [searching, setSearching] = useState(false);
  const [emrPatients, setEMRPatients] = useState<any[]>([]);
  const [selectedEMRPatient, setSelectedEMRPatient] = useState<any>(null);
  const [emrTreatments, setEMRTreatments] = useState<any[]>([]);
  const [selectedEMRTreatment, setSelectedEMRTreatment] = useState<any>(null);
  const [loadingTreatments, setLoadingTreatments] = useState(false);
  const [treatmentImages, setTreatmentImages] = useState<any[]>([]);
  const [imageClassifications, setImageClassifications] = useState<Record<number, { type: string; description: string }>>({});

  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Treatment info
    selected_symptom: '',
    selected_procedure: '',
    selected_treatment: '',
    tooth_numbers: [] as string[],
    
    // Step 2: Persona
    representative_persona: '',
    
    // Step 3: Content details
    concept_message: '',
    patient_condition: '',
    treatment_process: '',
    treatment_result: '',
    additional_message: '',

    // EMR Additional info (제거됨)
    // emphasis_points: '',
    // avoid_topics: '',
    // target_audience: '',
    
    // Step 4: Images
    before_images: [] as File[],
    process_images: [] as File[],
    after_images: [] as File[]
  });

  useEffect(() => {
    if (params.id) {
      loadData(params.id as string);
    }
  }, [params.id]);

  const loadData = async (postId: string) => {
    try {
      // 포스트 데이터와 SPT 키워드를 동시에 가져옴
      const [postData, sptData, personasData] = await Promise.all([
        clientApi.getPost(postId),
        clientApi.getSPTKeywords(postId),
        clientApi.getPersonaStyles()
      ]);
      
      setPost(postData);
      setMedicalServices({
        treatments: sptData.treatments,
        symptoms: sptData.symptoms,
        procedures: sptData.procedures
      });
      setPersonaStyles(personasData);
    } catch (error) {
      console.error('Error loading data:', error);
      router.push('/client/posts');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      
      const submitData = new FormData();
      
      // Add all form fields with proper field name mapping (excluding unnecessary fields)
      const excludedFields = ['emphasis_points', 'avoid_topics', 'target_audience'];

      Object.entries(formData).forEach(([key, value]) => {
        // Skip excluded fields
        if (excludedFields.includes(key)) {
          return;
        }

        if (key.includes('images')) {
          // Handle file arrays
          const files = value as File[];
          files.forEach(file => submitData.append(key, file));
        } else if (Array.isArray(value)) {
          // Handle arrays
          submitData.append(key, JSON.stringify(value));
        } else {
          // Handle regular fields with API field name mapping
          let apiKey = key;
          if (key === 'treatment_process') {
            apiKey = 'treatment_process_message';
          } else if (key === 'treatment_result') {
            apiKey = 'treatment_result_message';
          }

          submitData.append(apiKey, value as string);
        }
      });

      // Set default representative_persona if not set
      if (!formData.representative_persona) {
        submitData.append('representative_persona', '전문의');
      }
      
      await clientApi.submitMaterials(params.id as string, submitData);
      
      alert('자료가 성공적으로 제출되었습니다!');
      router.push('/client/posts');
    } catch (error) {
      console.error('Error submitting materials:', error);
      alert('자료 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleImageUpload = (type: 'before' | 'process' | 'after', files: FileList | null) => {
    if (!files) return;
    
    const fileArray = Array.from(files).slice(0, 5); // Max 5 images
    setFormData(prev => ({
      ...prev,
      [`${type}_images`]: fileArray
    }));
  };

  // EMR 환자 검색
  const searchEMRPatients = async () => {
    if (!emrSearch.query.trim()) return;

    try {
      setSearching(true);
      const patients = await clientApi.searchEMRPatients(emrSearch.query, emrSearch.type);
      setEMRPatients(patients);
    } catch (error) {
      console.error('EMR 환자 검색 실패:', error);
      setEMRPatients([]);
    } finally {
      setSearching(false);
    }
  };

  // EMR 환자 선택
  const selectEMRPatient = async (patient: any) => {
    setSelectedEMRPatient(patient);

    // 선택된 환자의 치료 기록 로드
    try {
      setLoadingTreatments(true);
      const treatments = await clientApi.getEMRPatientTreatments(patient.patient_id);
      setEMRTreatments(treatments);
    } catch (error) {
      console.error('치료 기록 로드 실패:', error);
      setEMRTreatments([]);
    } finally {
      setLoadingTreatments(false);
    }
  };

  // EMR 치료 기록 선택
  const selectEMRTreatment = async (treatment: any) => {
    setSelectedEMRTreatment(treatment);

    // 선택된 치료 기록의 이미지 로드
    try {
      const images = await clientApi.getEMRTreatmentImages(treatment.id);
      setTreatmentImages(images);
    } catch (error) {
      console.error('치료 기록 이미지 로드 실패:', error);
      setTreatmentImages([]);
    }
  };

  // 이미지 분류 업데이트
  const updateImageClassification = (imageId: number, type: string, description: string) => {
    setImageClassifications(prev => ({
      ...prev,
      [imageId]: { type, description }
    }));
  };

  // 단계별 텍스트 표시 함수
  const getStepText = () => {
    console.log('getStepText called:', { currentStep, selectedInputMethod });

    switch (currentStep) {
      case 1:
        console.log('Returning: 입력 방식 선택');
        return '입력 방식 선택';
      case 2:
        const text2 = selectedInputMethod === 'manual' ? '치료 정보 입력' : '환자 검색';
        console.log('Returning for step 2:', text2);
        return text2;
      case 3:
        const text3 = selectedInputMethod === 'manual' ? '상세 내용 작성' : '치료 기록 선택';
        console.log('Returning for step 3:', text3);
        return text3;
      case 4:
        const text4 = selectedInputMethod === 'manual' ? '치아 번호 선택' : '이미지 분류';
        console.log('Returning for step 4:', text4);
        return text4;
      case 5:
        const text5 = selectedInputMethod === 'manual' ? '이미지 업로드' : '추가 정보 입력';
        console.log('Returning for step 5:', text5);
        return text5;
      case 6:
        console.log('Returning: 최종 확인');
        return '최종 확인';
      default:
        console.log('Returning default: empty string');
        return '';
    }
  };

  // 이미지 타입 라벨 변환
  const getImageTypeLabel = (type: string) => {
    const labels = {
      before_treatment: '치료 전',
      during_treatment: '치료 중',
      after_treatment: '치료 후',
      diagnosis: '진단 관련',
      wound: '상처 사진',
      xray: 'X-ray/CT',
      other: '기타'
    };
    return labels[type as keyof typeof labels] || type;
  };

  // EMR 자료 제출
  const handleEMRSubmit = async () => {
    try {
      setSubmitting(true);

      const submitData = new FormData();

      // EMR 데이터 추가
      submitData.append('input_method', 'emr');
      submitData.append('emr_patient_id', selectedEMRPatient?.id?.toString() || '');
      submitData.append('emr_treatment_id', selectedEMRTreatment?.id?.toString() || '');

      // 이미지 분류 데이터
      submitData.append('image_classifications', JSON.stringify(imageClassifications));

      // 추가 정보 (불필요한 필드 제외)
      Object.entries(formData).forEach(([key, value]) => {
        if (key.includes('additional_message')) {
          submitData.append(key, value as string);
        }
      });

      await clientApi.submitMaterials(params.id as string, submitData);

      alert('EMR 자료가 성공적으로 제출되었습니다!');
      router.push('/client/posts');
    } catch (error) {
      console.error('EMR 자료 제출 실패:', error);
      alert('EMR 자료 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const toothNumbers = [
    '11', '12', '13', '14', '15', '16', '17', '18',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '31', '32', '33', '34', '35', '36', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48'
  ];

  // 입력 방식 선택 컴포넌트
  const renderInputMethodSelection = () => (
    <div className="space-y-4">
      <div
        onClick={() => setSelectedInputMethod('manual')}
        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
          selectedInputMethod === 'manual'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedInputMethod === 'manual' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
          }`}>
            {selectedInputMethod === 'manual' && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">수동 입력</h3>
            <p className="text-sm text-gray-600 mt-1">직접 입력하여 자료를 제공합니다</p>
          </div>
          <FileText className={`w-6 h-6 ${selectedInputMethod === 'manual' ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
      </div>

      <div
        onClick={() => setSelectedInputMethod('emr')}
        className={`cursor-pointer rounded-2xl p-6 border-2 transition-all duration-200 ${
          selectedInputMethod === 'emr'
            ? 'border-blue-600 bg-blue-50'
            : 'border-gray-200 bg-white hover:border-blue-300 hover:shadow-md'
        }`}
      >
        <div className="flex items-center gap-4">
          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
            selectedInputMethod === 'emr' ? 'border-blue-600 bg-blue-600' : 'border-gray-300'
          }`}>
            {selectedInputMethod === 'emr' && <CheckCircle className="w-3 h-3 text-white" />}
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-gray-800">EMR 연동</h3>
            <p className="text-sm text-gray-600 mt-1">기존 환자 데이터를 활용합니다</p>
          </div>
          <Users className={`w-6 h-6 ${selectedInputMethod === 'emr' ? 'text-blue-600' : 'text-gray-400'}`} />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          onClick={() => setCurrentStep(2)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
        >
          다음
          <ArrowRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
          </div>
          <p className="text-sm font-medium text-gray-700">자료 제공 페이지 로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 헤더 영역 */}
      <div className="bg-white rounded-3xl mx-6 mt-6 p-8 shadow-lg">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-gray-800 mb-2">자료 제공</h1>
            <p className="text-sm text-gray-600">콘텐츠 생성을 위한 정보를 입력해주세요</p>
          </div>
          <Button
            onClick={() => router.push('/client/posts')}
            variant="outline"
            className="border-2 border-blue-200 text-blue-700 hover:bg-blue-50 px-4 py-2 rounded-2xl flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            목록으로
          </Button>
        </div>
      </div>

      <div className="mx-6 mt-6 space-y-6">
        {/* 포스트 정보 */}
      {post && (
          <Card className="rounded-3xl shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-600" />
                포스트 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-50 rounded-xl p-4">
                  <p className="text-xs text-gray-600 mb-1">Post ID</p>
                  <p className="text-sm font-bold text-gray-800">{post.post_id}</p>
            </div>
            {post.campaign && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      캠페인
                    </p>
                    <p className="text-sm font-bold text-gray-800">{post.campaign.name}</p>
              </div>
            )}
            {post.publish_date && (
                  <div className="bg-gray-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      게시 예정일
                    </p>
                    <p className="text-sm font-bold text-gray-800">
                      {new Date(post.publish_date).toLocaleDateString('ko-KR')}
                    </p>
              </div>
            )}
          </div>
            </CardContent>
        </Card>
      )}

        {/* 단계 진행 표시 */}
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              {(() => {
                const stepData = selectedInputMethod === 'manual' ? [
                  { step: 1, name: '입력 방식 선택' },
                  { step: 2, name: '치료 정보 입력' },
                  { step: 3, name: '상세 내용 작성' },
                  { step: 4, name: '치아 번호 선택' },
                  { step: 5, name: '이미지 업로드' },
                  { step: 6, name: '최종 확인' }
                ] : [
                  { step: 1, name: '입력 방식 선택' },
                  { step: 2, name: '환자 검색' },
                  { step: 3, name: '치료 기록 선택' },
                  { step: 4, name: '이미지 분류' },
                  { step: 5, name: '추가 정보 입력' },
                  { step: 6, name: '최종 확인' }
                ];
                return stepData.map((item, index) => (
                <div key={item.step} className="flex items-center">
                  {/* 화살표 모양의 단계 표시 */}
                  <div className="relative">
                    <div
                      className={`relative px-4 py-2 text-xs font-bold rounded-lg transition-all duration-200 ${
                        currentStep > item.step
                          ? 'bg-blue-600 text-white' // 진행 완료
                          : currentStep === item.step
                          ? 'bg-blue-100 text-gray-900 border-2 border-blue-200' // 진행 중
                          : 'bg-gray-100 text-gray-600' // 진행 예정
                      }`}
                      style={{
                        clipPath: index < 5 ? 'polygon(0% 0%, 85% 0%, 100% 50%, 85% 100%, 0% 100%)' : 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)'
                      }}
                    >
                      <span className="whitespace-nowrap">{item.name}</span>
            </div>
                    </div>
                    {/* 화살표 연결선 */}
                    {index < 5 && (
                      <div className={`w-6 h-0.5 mx-1 transition-all duration-200 ${
                        currentStep > item.step ? 'bg-blue-600' : 'bg-gray-300'
                      }`} />
            )}
          </div>
                ));
              })()}
      </div>
          </CardContent>
        </Card>

        {/* 단계별 콘텐츠 */}
        <Card className="rounded-3xl shadow-lg">
          <CardContent className="p-8">
            {/* 단계 1: 입력 방식 선택 */}
      {currentStep === 1 && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-blue-600" />
                  입력 방식 선택
                </h2>
                {renderInputMethodSelection()}
              </div>
            )}

            {/* 단계 2: 치료 정보 입력 (수동 입력만) */}
            {currentStep === 2 && selectedInputMethod === 'manual' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  치료 정보 입력
                </h2>
          
          <div className="space-y-6">
                  {/* 치료 방법 선택 (첫 번째 단계) */}
            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">치료 방법 선택</label>
              <select
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 bg-white"
                      value={formData.selected_treatment}
                      onChange={(e) => {
                        setFormData(prev => ({
                          ...prev,
                          selected_treatment: e.target.value,
                          selected_symptom: '', // 치료 변경 시 증상 초기화
                          selected_procedure: '' // 치료 변경 시 진료 초기화
                        }))
                      }}
                    >
                      <option value="">치료 방법을 선택하세요</option>
                      {medicalServices?.treatments?.map((treatment: string) => (
                        <option key={treatment} value={treatment}>{treatment}</option>
                ))}
              </select>
            </div>

                  {/* 증상 선택 (치료 선택 후) */}
                  {formData.selected_treatment && (
            <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">증상 선택</label>
              <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 bg-white"
                value={formData.selected_symptom}
                        onChange={(e) => {
                          setFormData(prev => ({
                            ...prev,
                            selected_symptom: e.target.value,
                            selected_procedure: '' // 증상 변경 시 진료 초기화
                          }))
                        }}
                      >
                        <option value="">증상을 선택하세요</option>
                        {medicalServices?.symptoms?.filter((symptom: string) =>
                          // TODO: 선택된 치료에 맞는 증상만 필터링하는 로직 구현 필요
                          true
                        ).map((symptom: string) => (
                  <option key={symptom} value={symptom}>{symptom}</option>
                ))}
              </select>
            </div>
                  )}

                  {/* 진단 내용 선택 (증상 선택 후) */}
                  {formData.selected_symptom && (
            <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">진단 내용</label>
              <select
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 bg-white"
                value={formData.selected_procedure}
                onChange={(e) => setFormData(prev => ({ ...prev, selected_procedure: e.target.value }))}
              >
                        <option value="">진단 내용을 선택하세요</option>
                        {medicalServices?.procedures?.filter((procedure: string) =>
                          // TODO: 선택된 치료+증상에 맞는 진료만 필터링하는 로직 구현 필요
                          true
                        ).map((procedure: string) => (
                  <option key={procedure} value={procedure}>{procedure}</option>
                ))}
              </select>
            </div>
                  )}

          </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => {
                      // SPT 정보 검증
                      if (!formData.selected_treatment || !formData.selected_symptom || !formData.selected_procedure) {
                        alert('치료 방법, 증상, 진단 내용을 모두 선택해주세요.');
                        return;
                      }
                      setCurrentStep(3);
                    }}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
            </div>
              </div>
            )}

            {/* 단계 2: EMR 환자 검색 */}
            {currentStep === 2 && selectedInputMethod === 'emr' && (
            <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  환자 검색
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      검색 방식 선택
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {[
                        { key: 'name', label: '이름으로 검색', placeholder: '환자 이름을 입력하세요' },
                        { key: 'id', label: '환자번호로 검색', placeholder: '환자 번호를 입력하세요' },
                        { key: 'phone', label: '연락처로 검색', placeholder: '연락처를 입력하세요' }
                      ].map((option) => (
                  <button
                          key={option.key}
                          onClick={() => setEMRSearch({ ...emrSearch, type: option.key as any })}
                          className={`p-4 border-2 rounded-2xl text-left transition-all duration-200 ${
                            emrSearch.type === option.key
                              ? 'border-blue-600 bg-blue-50'
                              : 'border-gray-200 bg-white hover:border-blue-300'
                          }`}
                        >
                          <div className="text-sm font-bold text-gray-800">{option.label}</div>
                          <div className="text-xs text-gray-600 mt-1">{option.placeholder}</div>
                  </button>
                ))}
              </div>
            </div>

            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      검색어 입력
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="text"
                        value={emrSearch.query}
                        onChange={(e) => setEMRSearch({ ...emrSearch, query: e.target.value })}
                        placeholder={
                          emrSearch.type === 'name' ? '환자 이름을 입력하세요' :
                          emrSearch.type === 'id' ? '환자 번호를 입력하세요' :
                          '연락처를 입력하세요'
                        }
                        className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0"
                      />
                      <Button
                        onClick={searchEMRPatients}
                        disabled={!emrSearch.query.trim() || searching}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium"
                      >
                        {searching ? '검색 중...' : '검색'}
                      </Button>
            </div>
          </div>

                  {/* 검색 결과 */}
                  {emrPatients.length > 0 && (
                    <div>
                      <h3 className="text-sm font-bold text-gray-700 mb-4">검색 결과</h3>
                      <div className="space-y-3 max-h-64 overflow-y-auto">
                        {emrPatients.map((patient) => (
                          <div
                            key={patient.id}
                            onClick={() => selectEMRPatient(patient)}
                            className={`p-4 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                              selectedEMRPatient?.id === patient.id
                                ? 'border-blue-600 bg-blue-50'
                                : 'border-gray-200 bg-white hover:border-blue-300'
                            }`}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-bold text-gray-800">{patient.name}</div>
                                <div className="text-sm text-gray-600">
                                  환자번호: {patient.patient_id}
                                  {patient.birth_date && (
                                    <span className="ml-4">
                                      생년월일: {new Date(patient.birth_date).toLocaleDateString('ko-KR')}
                                    </span>
                                  )}
          </div>
                                {patient.phone && (
                                  <div className="text-sm text-gray-600">
                                    연락처: {patient.phone}
                                  </div>
                                )}
                              </div>
                              {selectedEMRPatient?.id === patient.id && (
                                <CheckCircle className="w-6 h-6 text-blue-600" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {emrSearch.query && !searching && emrPatients.length === 0 && (
                    <div className="text-center py-8">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-sm text-gray-600">검색 결과가 없습니다.</p>
                    </div>
                  )}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(1)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(3)}
                    disabled={!selectedEMRPatient}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 단계 3: EMR 치료 기록 선택 */}
            {currentStep === 3 && selectedInputMethod === 'emr' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  치료 기록 선택
                </h2>

                {selectedEMRPatient && (
                  <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Users className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-bold text-gray-800">{selectedEMRPatient.name}</div>
                        <div className="text-sm text-gray-600">
                          환자번호: {selectedEMRPatient.patient_id}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {loadingTreatments ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-sm text-gray-600">치료 기록을 불러오는 중...</p>
                  </div>
                ) : emrTreatments.length > 0 ? (
          <div className="space-y-4">
                    <h3 className="text-sm font-bold text-gray-700">치료 기록 선택</h3>
                    {emrTreatments.map((treatment) => (
                      <div
                        key={treatment.id}
                        onClick={() => selectEMRTreatment(treatment)}
                        className={`p-6 border-2 rounded-2xl cursor-pointer transition-all duration-200 ${
                          selectedEMRTreatment?.id === treatment.id
                            ? 'border-blue-600 bg-blue-50'
                            : 'border-gray-200 bg-white hover:border-blue-300'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-3">
                              <div className="text-sm font-bold text-gray-800">
                                {treatment.visit_date ? new Date(treatment.visit_date).toLocaleDateString('ko-KR') : '날짜 미정'}
                              </div>
                              {selectedEMRTreatment?.id === treatment.id && (
                                <CheckCircle className="w-5 h-5 text-blue-600" />
                              )}
                            </div>

                            {treatment.chief_complaint && (
                              <div className="mb-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">주 호소</div>
                                <div className="text-sm text-gray-800">{treatment.chief_complaint}</div>
                              </div>
                            )}

                            {treatment.diagnosis && treatment.diagnosis.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">진단</div>
                                <div className="flex flex-wrap gap-2">
                                  {treatment.diagnosis.map((diag: string, index: number) => (
                                    <Badge key={index} variant="secondary" className="text-xs">
                                      {diag}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {treatment.treatments && treatment.treatments.length > 0 && (
                              <div className="mb-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">치료</div>
                                <div className="flex flex-wrap gap-2">
                                  {treatment.treatments.map((treat: string, index: number) => (
                                    <Badge key={index} variant="outline" className="text-xs">
                                      {treat}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}

                            {treatment.outcomes && (
                              <div className="mb-3">
                                <div className="text-xs font-bold text-gray-600 mb-1">치료 결과</div>
                                <div className="text-sm text-gray-800">{treatment.outcomes}</div>
                              </div>
                            )}

                            {treatment.images_count > 0 && (
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                <Upload className="w-4 h-4" />
                                이미지 {treatment.images_count}장
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : selectedEMRPatient ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">치료 기록이 없습니다.</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">먼저 환자를 선택해주세요.</p>
                  </div>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => {
                      setCurrentStep(2);
                      setSelectedEMRTreatment(null);
                    }}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => {
                      // 이미지가 있으면 이미지 분류 단계로, 없으면 추가 정보 단계로
                      if (treatmentImages.length > 0) {
                        setCurrentStep(4);
                      } else {
                        setCurrentStep(5);
                      }
                    }}
                    disabled={!selectedEMRTreatment}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 단계 4: EMR 이미지 분류 */}
            {currentStep === 4 && selectedInputMethod === 'emr' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  이미지 분류
                </h2>

                {selectedEMRPatient && selectedEMRTreatment && (
                  <div className="bg-blue-50 rounded-2xl p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="font-bold text-gray-800">{selectedEMRPatient.name}</div>
                        <div className="text-sm text-gray-600">환자번호: {selectedEMRPatient.patient_id}</div>
                      </div>
                      <div>
                        <div className="font-bold text-gray-800">
                          {selectedEMRTreatment.visit_date ? new Date(selectedEMRTreatment.visit_date).toLocaleDateString('ko-KR') : '날짜 미정'}
                        </div>
                        <div className="text-sm text-gray-600">치료 기록</div>
                      </div>
                    </div>
                  </div>
                )}

                {treatmentImages.length > 0 ? (
                  <div className="space-y-6">
                    <h3 className="text-sm font-bold text-gray-700">이미지를 분류해주세요</h3>

                    {treatmentImages.map((image) => (
                      <div key={image.id} className="border-2 border-gray-200 rounded-2xl p-6">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* 이미지 미리보기 */}
                          <div className="flex-shrink-0">
                            <div className="w-32 h-32 bg-gray-100 rounded-xl flex items-center justify-center">
                              <Upload className="w-8 h-8 text-gray-400" />
                            </div>
                            <p className="text-xs text-gray-500 mt-2 text-center">
                              {image.taken_date ? new Date(image.taken_date).toLocaleDateString('ko-KR') : '촬영일 미정'}
                            </p>
                          </div>

                          {/* 분류 옵션 */}
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 mb-4">이미지 타입 선택</h4>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
                              {[
                                { value: 'before_treatment', label: '치료 전' },
                                { value: 'during_treatment', label: '치료 중' },
                                { value: 'after_treatment', label: '치료 후' },
                                { value: 'diagnosis', label: '진단 관련' },
                                { value: 'wound', label: '상처 사진' },
                                { value: 'xray', label: 'X-ray/CT' },
                                { value: 'other', label: '기타' }
                              ].map((option) => (
              <label
                                  key={option.value}
                                  className={`block p-3 border-2 rounded-xl cursor-pointer transition-all duration-200 text-center ${
                                    imageClassifications[image.id]?.type === option.value
                                      ? 'border-blue-600 bg-blue-50 text-blue-700'
                                      : 'border-gray-200 bg-white hover:border-blue-300'
                }`}
              >
                <input
                  type="radio"
                                    name={`image-type-${image.id}`}
                                    value={option.value}
                                    checked={imageClassifications[image.id]?.type === option.value}
                                    onChange={(e) => updateImageClassification(image.id, e.target.value, imageClassifications[image.id]?.description || '')}
                  className="sr-only"
                />
                                  <div className="text-sm font-medium">{option.label}</div>
              </label>
            ))}
          </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                이미지 설명 (선택사항)
                              </label>
                              <input
                                type="text"
                                value={imageClassifications[image.id]?.description || ''}
                                onChange={(e) => updateImageClassification(
                                  image.id,
                                  imageClassifications[image.id]?.type || '',
                                  e.target.value
                                )}
                                placeholder="이미지에 대한 추가 설명을 입력하세요"
                                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl text-sm focus:border-blue-500 focus:ring-0"
                              />
            </div>
          </div>
                        </div>
                      </div>
                    ))}

                    {/* 분류 완료 상태 표시 */}
                    <div className="bg-green-50 rounded-2xl p-4">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600" />
                        <div>
                          <div className="text-sm font-bold text-green-800">
                            {Object.keys(imageClassifications).length} / {treatmentImages.length} 개 이미지 분류 완료
          </div>
                          <div className="text-xs text-green-600">
                            모든 이미지에 타입을 지정해주세요
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-sm text-gray-600">분류할 이미지가 없습니다.</p>
                  </div>
                )}

          <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    disabled={treatmentImages.length > 0 && Object.keys(imageClassifications).length !== treatmentImages.length}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
          </div>
              </div>
            )}

            {/* 단계 5: EMR 추가 정보 입력 */}
            {currentStep === 5 && selectedInputMethod === 'emr' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  추가 정보 입력
                </h2>
          
          <div className="space-y-6">
            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      특별한 요청사항
                    </label>
              <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                      rows={4}
                      placeholder="콘텐츠 생성 시 특별히 고려해야 할 사항이 있다면 작성해주세요."
                      value={formData.additional_message}
                      onChange={(e) => setFormData(prev => ({ ...prev, additional_message: e.target.value }))}
                    />
                  </div>

                  {/* 불필요한 필드들 제거됨 */}
                  {/* 강조하고 싶은 부분들, 피하고 싶은 주제들, 대상 독자층 필드 제거 */}
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(treatmentImages.length > 0 ? 4 : 3)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(6)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 단계 3: 상세 내용 작성 */}
            {currentStep === 3 && selectedInputMethod === 'manual' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  상세 내용 작성
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      질환 개념 및 강조 메시지
                    </label>
                    <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                      rows={4}
                placeholder="치료에 대한 전반적인 개념과 강조하고 싶은 메시지를 작성해주세요."
                value={formData.concept_message}
                onChange={(e) => setFormData(prev => ({ ...prev, concept_message: e.target.value }))}
              />
            </div>

            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      내원 당시 환자 상태
                    </label>
              <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                      rows={4}
                placeholder="환자가 처음 내원했을 때의 상태를 구체적으로 설명해주세요."
                value={formData.patient_condition}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_condition: e.target.value }))}
              />
            </div>

            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      치료 과정
                    </label>
              <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                      rows={4}
                placeholder="실제 치료 과정에서 진행된 내용을 설명해주세요."
                value={formData.treatment_process}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_process: e.target.value }))}
              />
            </div>

            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      치료 결과
                    </label>
              <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                      rows={4}
                placeholder="치료 후 환자의 상태 변화와 결과를 설명해주세요."
                value={formData.treatment_result}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_result: e.target.value }))}
              />
            </div>

            <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      추가 메시지 (선택사항)
                    </label>
              <textarea
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-2xl text-sm focus:border-blue-500 focus:ring-0 resize-none"
                rows={3}
                placeholder="추가로 전달하고 싶은 메시지가 있다면 작성해주세요."
                value={formData.additional_message}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_message: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(2)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(4)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
          </div>
          </div>
            )}

            {/* 단계 6: EMR 최종 확인 */}
            {currentStep === 6 && selectedInputMethod === 'emr' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                  최종 확인
                </h2>

                {/* 환자 정보 */}
                <Card className="rounded-3xl shadow-lg mb-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <Users className="w-5 h-5 text-blue-600" />
                      환자 정보
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">환자명</div>
                        <div className="text-sm font-bold text-gray-800">{selectedEMRPatient?.name}</div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-600 mb-1">환자번호</div>
                        <div className="text-sm font-bold text-gray-800">{selectedEMRPatient?.patient_id}</div>
                      </div>
                      {selectedEMRPatient?.birth_date && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">생년월일</div>
                          <div className="text-sm font-bold text-gray-800">
                            {new Date(selectedEMRPatient.birth_date).toLocaleDateString('ko-KR')}
                          </div>
                        </div>
                      )}
                      {selectedEMRPatient?.phone && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">연락처</div>
                          <div className="text-sm font-bold text-gray-800">{selectedEMRPatient.phone}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
        </Card>

                {/* 치료 기록 정보 */}
                <Card className="rounded-3xl shadow-lg mb-6">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                      <FileText className="w-5 h-5 text-blue-600" />
                      치료 기록
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-4">
                      <div>
                        <div className="text-xs text-gray-600 mb-1">진료일</div>
                        <div className="text-sm font-bold text-gray-800">
                          {selectedEMRTreatment?.visit_date ? new Date(selectedEMRTreatment.visit_date).toLocaleDateString('ko-KR') : '날짜 미정'}
                        </div>
                      </div>

                      {selectedEMRTreatment?.chief_complaint && (
                        <div>
                          <div className="text-xs text-gray-600 mb-1">주 호소</div>
                          <div className="text-sm text-gray-800">{selectedEMRTreatment.chief_complaint}</div>
                        </div>
                      )}

                      {selectedEMRTreatment?.diagnosis && selectedEMRTreatment.diagnosis.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-2">진단</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedEMRTreatment.diagnosis.map((diag: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {diag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedEMRTreatment?.treatments && selectedEMRTreatment.treatments.length > 0 && (
                        <div>
                          <div className="text-xs text-gray-600 mb-2">치료</div>
                          <div className="flex flex-wrap gap-2">
                            {selectedEMRTreatment.treatments.map((treat: string, index: number) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {treat}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* 이미지 분류 정보 */}
                {treatmentImages.length > 0 && (
                  <Card className="rounded-3xl shadow-lg mb-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-600" />
                        이미지 분류
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-3">
                        {treatmentImages.map((image) => {
                          const classification = imageClassifications[image.id];
                          return (
                            <div key={image.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-gray-200 rounded-lg flex items-center justify-center">
                                  <Upload className="w-4 h-4 text-gray-600" />
                                </div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">
                                    {classification?.type ? getImageTypeLabel(classification.type) : '미분류'}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    촬영일: {image.taken_date ? new Date(image.taken_date).toLocaleDateString('ko-KR') : '미정'}
                                  </div>
                                </div>
                              </div>
                              {classification?.description && (
                                <div className="text-xs text-gray-600 max-w-xs truncate">
                                  {classification.description}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* 추가 정보 */}
                {formData.additional_message && (
                  <Card className="rounded-3xl shadow-lg mb-6">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-base font-bold text-gray-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-blue-600" />
                        추가 정보
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="space-y-4">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">특별한 요청사항</div>
                          <div className="text-sm text-gray-800 bg-gray-50 rounded-lg p-3">{formData.additional_message}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(5)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={handleEMRSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      <>
                        자료 제출
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}

            {/* 단계 4: 치아 번호 선택 */}
            {currentStep === 4 && selectedInputMethod === 'manual' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  치아 번호 선택
                </h2>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">치아 번호 (선택사항)</label>
                    <div className="grid grid-cols-8 gap-2">
                      {toothNumbers.map(number => (
                        <button
                          key={number}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              tooth_numbers: prev.tooth_numbers.includes(number)
                                ? prev.tooth_numbers.filter(n => n !== number)
                                : [...prev.tooth_numbers, number]
                            }));
                          }}
                          className={`p-3 text-sm font-bold border-2 rounded-xl transition-all duration-200 ${
                            formData.tooth_numbers.includes(number)
                              ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                              : 'bg-white hover:bg-blue-50 border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          {number}
                        </button>
                      ))}
                    </div>
                    {formData.tooth_numbers.length > 0 && (
                      <p className="text-xs text-gray-600 mt-2">
                        선택된 치아: {formData.tooth_numbers.join(', ')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(3)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={() => setCurrentStep(5)}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    다음
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* 단계 5: 이미지 업로드 */}
            {currentStep === 5 && selectedInputMethod === 'manual' && (
              <div>
                <h2 className="text-base font-bold text-gray-800 mb-6 flex items-center gap-2">
                  <Upload className="w-5 h-5 text-blue-600" />
                  이미지 업로드
                </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-4">치료 전 이미지</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('before', e.target.files)}
                  className="hidden"
                  id="before-images"
                />
                <label htmlFor="before-images" className="cursor-pointer text-center block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-600 mb-1">치료 전 이미지</div>
                        <div className="text-xs text-gray-500">최대 5장 • 클릭하여 업로드</div>
                </label>
                {formData.before_images.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {formData.before_images.length}개 선택됨
                          </span>
                  </div>
                )}
              </div>
            </div>

            <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-4">치료 과정 이미지</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('process', e.target.files)}
                  className="hidden"
                  id="process-images"
                />
                <label htmlFor="process-images" className="cursor-pointer text-center block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-600 mb-1">치료 과정 이미지</div>
                        <div className="text-xs text-gray-500">최대 5장 • 클릭하여 업로드</div>
                </label>
                {formData.process_images.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {formData.process_images.length}개 선택됨
                          </span>
                  </div>
                )}
              </div>
            </div>

            <div>
                    <h3 className="text-sm font-bold text-gray-700 mb-4">치료 후 이미지</h3>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 hover:border-blue-400 transition-colors">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('after', e.target.files)}
                  className="hidden"
                  id="after-images"
                />
                <label htmlFor="after-images" className="cursor-pointer text-center block">
                        <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <div className="text-sm font-medium text-gray-600 mb-1">치료 후 이미지</div>
                        <div className="text-xs text-gray-500">최대 5장 • 클릭하여 업로드</div>
                </label>
                {formData.after_images.length > 0 && (
                        <div className="mt-4 flex items-center justify-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-600" />
                          <span className="text-sm text-green-600 font-medium">
                            {formData.after_images.length}개 선택됨
                          </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
                  <Button
                    onClick={() => setCurrentStep(4)}
                    variant="outline"
                    className="border-2 border-gray-200 text-gray-600 hover:bg-gray-50 px-6 py-3 rounded-2xl flex items-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    이전
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-2xl font-medium flex items-center gap-2"
                  >
                    {submitting ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        제출 중...
                      </>
                    ) : (
                      <>
                        자료 제출
                        <CheckCircle className="w-4 h-4" />
                      </>
                    )}
            </Button>
          </div>
              </div>
      )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
