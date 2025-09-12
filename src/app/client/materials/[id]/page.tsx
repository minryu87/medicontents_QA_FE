'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { clientApi } from '@/services/api';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';

interface Post {
  post_id: string;
  title?: string;
  campaign?: {
    id: number;
    name: string;
  };
  publish_date?: string;
}

interface MedicalService {
  id: number;
  category: string;
  treatment: string;
  symptom?: string;
  procedure?: string;
}

interface PersonaStyle {
  id: number;
  representative_persona: string;
  persona_description?: string;
}

export default function MaterialsProvisionPage() {
  const params = useParams();
  const router = useRouter();
  const [post, setPost] = useState<Post | null>(null);
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [personaStyles, setPersonaStyles] = useState<PersonaStyle[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

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
      const [postData, servicesData, personasData] = await Promise.all([
        clientApi.getPost(postId),
        clientApi.getMedicalServices(),
        clientApi.getPersonaStyles()
      ]);
      
      setPost(postData);
      setMedicalServices(servicesData);
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
      
      // Add all form fields
      Object.entries(formData).forEach(([key, value]) => {
        if (key.includes('images')) {
          // Handle file arrays
          const files = value as File[];
          files.forEach(file => submitData.append(key, file));
        } else if (Array.isArray(value)) {
          // Handle arrays
          submitData.append(key, JSON.stringify(value));
        } else {
          // Handle regular fields
          submitData.append(key, value as string);
        }
      });
      
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

  const toothNumbers = [
    '11', '12', '13', '14', '15', '16', '17', '18',
    '21', '22', '23', '24', '25', '26', '27', '28',
    '31', '32', '33', '34', '35', '36', '37', '38',
    '41', '42', '43', '44', '45', '46', '47', '48'
  ];

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
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">자료 제공</h1>
        <p className="text-gray-600 mt-2">콘텐츠 생성을 위한 정보를 입력해주세요</p>
      </div>

      {/* Post Info */}
      {post && (
        <Card className="p-6 mb-8 bg-gray-50">
          <h2 className="text-lg font-semibold mb-4">포스트 정보</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-gray-600">Post ID</p>
              <p className="font-medium">{post.post_id}</p>
            </div>
            {post.campaign && (
              <div>
                <p className="text-sm text-gray-600">캠페인</p>
                <p className="font-medium">{post.campaign.name}</p>
              </div>
            )}
            {post.publish_date && (
              <div>
                <p className="text-sm text-gray-600">게시 예정일</p>
                <p className="font-medium">{new Date(post.publish_date).toLocaleDateString('ko-KR')}</p>
              </div>
            )}
          </div>
        </Card>
      )}

      {/* Progress Steps */}
      <div className="flex items-center justify-between mb-8">
        {[1, 2, 3, 4].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`
              w-10 h-10 rounded-full flex items-center justify-center font-semibold
              ${currentStep >= step ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'}
            `}>
              {step}
            </div>
            {step < 4 && (
              <div className={`w-full h-1 mx-2 ${currentStep > step ? 'bg-blue-600' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Treatment Info */}
      {currentStep === 1 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">치료 정보 선택</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">증상</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.selected_symptom}
                onChange={(e) => setFormData(prev => ({ ...prev, selected_symptom: e.target.value }))}
              >
                <option value="">선택하세요</option>
                {Array.from(new Set(medicalServices.map(s => s.symptom))).map(symptom => (
                  <option key={symptom} value={symptom}>{symptom}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">진료</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.selected_procedure}
                onChange={(e) => setFormData(prev => ({ ...prev, selected_procedure: e.target.value }))}
              >
                <option value="">선택하세요</option>
                {Array.from(new Set(medicalServices.map(s => s.procedure))).map(procedure => (
                  <option key={procedure} value={procedure}>{procedure}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">치료</label>
              <select
                className="w-full p-2 border rounded"
                value={formData.selected_treatment}
                onChange={(e) => setFormData(prev => ({ ...prev, selected_treatment: e.target.value }))}
              >
                <option value="">선택하세요</option>
                {medicalServices.map(service => (
                  <option key={service.id} value={service.treatment}>{service.treatment}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">치아 번호 (선택사항)</label>
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
                    className={`p-2 text-sm border rounded ${
                      formData.tooth_numbers.includes(number)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end mt-8">
            <Button onClick={() => setCurrentStep(2)}>다음</Button>
          </div>
        </Card>
      )}

      {/* Step 2: Persona */}
      {currentStep === 2 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">페르소나 선택</h2>
          
          <div className="space-y-4">
            {personaStyles.map(persona => (
              <label
                key={persona.id}
                className={`block p-4 border rounded cursor-pointer transition-colors ${
                  formData.representative_persona === persona.representative_persona
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="persona"
                  value={persona.representative_persona}
                  checked={formData.representative_persona === persona.representative_persona}
                  onChange={(e) => setFormData(prev => ({ ...prev, representative_persona: e.target.value }))}
                  className="sr-only"
                />
                <div className="font-medium">{persona.representative_persona}</div>
                {persona.persona_description && (
                  <p className="text-sm text-gray-600 mt-1">{persona.persona_description}</p>
                )}
              </label>
            ))}
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="secondary" onClick={() => setCurrentStep(1)}>이전</Button>
            <Button onClick={() => setCurrentStep(3)}>다음</Button>
          </div>
        </Card>
      )}

      {/* Step 3: Content Details */}
      {currentStep === 3 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">상세 내용</h2>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium mb-2">질환 개념 및 강조 메시지</label>
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="치료에 대한 전반적인 개념과 강조하고 싶은 메시지를 작성해주세요."
                value={formData.concept_message}
                onChange={(e) => setFormData(prev => ({ ...prev, concept_message: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">내원 당시 환자 상태</label>
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="환자가 처음 내원했을 때의 상태를 구체적으로 설명해주세요."
                value={formData.patient_condition}
                onChange={(e) => setFormData(prev => ({ ...prev, patient_condition: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">치료 과정</label>
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="실제 치료 과정에서 진행된 내용을 설명해주세요."
                value={formData.treatment_process}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_process: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">치료 결과</label>
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="치료 후 환자의 상태 변화와 결과를 설명해주세요."
                value={formData.treatment_result}
                onChange={(e) => setFormData(prev => ({ ...prev, treatment_result: e.target.value }))}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">추가 메시지 (선택사항)</label>
              <textarea
                className="w-full p-3 border rounded"
                rows={3}
                placeholder="추가로 전달하고 싶은 메시지가 있다면 작성해주세요."
                value={formData.additional_message}
                onChange={(e) => setFormData(prev => ({ ...prev, additional_message: e.target.value }))}
              />
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="secondary" onClick={() => setCurrentStep(2)}>이전</Button>
            <Button onClick={() => setCurrentStep(4)}>다음</Button>
          </div>
        </Card>
      )}

      {/* Step 4: Images */}
      {currentStep === 4 && (
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-6">이미지 업로드</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-medium mb-2">치료 전 이미지</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('before', e.target.files)}
                  className="hidden"
                  id="before-images"
                />
                <label htmlFor="before-images" className="cursor-pointer text-center block">
                  <div className="text-gray-600">클릭하여 업로드</div>
                  <div className="text-sm text-gray-500 mt-1">최대 5장</div>
                </label>
                {formData.before_images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.before_images.length}개 파일 선택됨
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">치료 과정 이미지</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('process', e.target.files)}
                  className="hidden"
                  id="process-images"
                />
                <label htmlFor="process-images" className="cursor-pointer text-center block">
                  <div className="text-gray-600">클릭하여 업로드</div>
                  <div className="text-sm text-gray-500 mt-1">최대 5장</div>
                </label>
                {formData.process_images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.process_images.length}개 파일 선택됨
                  </div>
                )}
              </div>
            </div>

            <div>
              <h3 className="font-medium mb-2">치료 후 이미지</h3>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload('after', e.target.files)}
                  className="hidden"
                  id="after-images"
                />
                <label htmlFor="after-images" className="cursor-pointer text-center block">
                  <div className="text-gray-600">클릭하여 업로드</div>
                  <div className="text-sm text-gray-500 mt-1">최대 5장</div>
                </label>
                {formData.after_images.length > 0 && (
                  <div className="mt-2 text-sm text-gray-600">
                    {formData.after_images.length}개 파일 선택됨
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-between mt-8">
            <Button variant="secondary" onClick={() => setCurrentStep(3)}>이전</Button>
            <Button onClick={handleSubmit} disabled={submitting}>
              {submitting ? '제출 중...' : '자료 제출'}
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
