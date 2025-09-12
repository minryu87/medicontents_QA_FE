'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Post } from '@/types/common';

interface MaterialsFormData {
  selected_symptom: string;
  selected_procedure: string;
  selected_treatment: string;
  tooth_numbers: string[];
  representative_persona: string;
  concept_message: string;
  patient_condition: string;
  treatment_process_message: string;
  treatment_result_message: string;
  additional_message: string;
  before_images: File[];
  process_images: File[];
  after_images: File[];
}

interface MedicalService {
  id: number;
  category: string;
  treatment: string;
  symptom: string;
  procedure: string;
}

interface PersonaStyle {
  id: number;
  persona_name: string;
  persona_description: string;
}

export default function ProvideMaterials() {
  const params = useParams();
  const router = useRouter();
  const postId = params.id as string;
  
  const [post, setPost] = useState<Post | null>(null);
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [personaStyles, setPersonaStyles] = useState<PersonaStyle[]>([]);
  const [formData, setFormData] = useState<MaterialsFormData>({
    selected_symptom: '',
    selected_procedure: '',
    selected_treatment: '',
    tooth_numbers: [],
    representative_persona: '',
    concept_message: '',
    patient_condition: '',
    treatment_process_message: '',
    treatment_result_message: '',
    additional_message: '',
    before_images: [],
    process_images: [],
    after_images: [],
  });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadMaterialsData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const [
          postData,
          medicalServicesData,
          personaStylesData
        ] = await Promise.all([
          clientApi.getPost(postId),
          clientApi.getMedicalServices(),
          clientApi.getPersonaStyles()
        ]);

        setPost(postData);
        setMedicalServices(medicalServicesData);
        setPersonaStyles(personaStylesData);
      } catch (error) {
        console.error('자료 제공 데이터 로드 실패:', error);
        // 에러 시 null/빈 상태로 설정
        setPost(null);
        setMedicalServices([]);
        setPersonaStyles([]);
      } finally {
        setLoading(false);
      }
    };

    if (postId) {
      loadMaterialsData();
    }
  }, [postId]);

  const handleInputChange = (field: keyof MaterialsFormData, value: string | string[] | File[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleImageUpload = (field: 'before_images' | 'process_images' | 'after_images', files: FileList) => {
    const fileArray = Array.from(files);
    setFormData(prev => ({ ...prev, [field]: fileArray }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      // FormData 생성
      const formDataToSubmit = new FormData();
      
      // 텍스트 데이터 추가
      Object.entries(formData).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          if (key === 'tooth_numbers') {
            formDataToSubmit.append(key, JSON.stringify(value));
          } else if (key.includes('_images')) {
            // 파일 배열 처리
            (value as File[]).forEach((file, index) => {
              formDataToSubmit.append(`${key}[${index}]`, file);
            });
          }
        } else {
          formDataToSubmit.append(key, value as string);
        }
      });
      
      // 실제 API 호출로 자료 제출
      await clientApi.submitMaterials(postId, formDataToSubmit);
      
      // 성공 시 리다이렉트
      router.push('/client/posts');
    } catch (error) {
      console.error('자료 제출 실패:', error);
      alert('자료 제출에 실패했습니다. 다시 시도해주세요.');
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

  const toggleToothNumber = (number: string) => {
    setFormData(prev => ({
      ...prev,
      tooth_numbers: prev.tooth_numbers.includes(number)
        ? prev.tooth_numbers.filter(n => n !== number)
        : [...prev.tooth_numbers, number]
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">포스트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">자료 제공</h1>
        <p className="text-gray-600">치료 사례에 대한 자세한 정보를 제공해주세요</p>
      </div>

      {/* 포스트 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>포스트 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Post ID</label>
              <p className="mt-1 text-gray-900">{post.post_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">포스트 타입</label>
              <p className="mt-1 text-gray-900">
                {post.post_type === 'informational' ? '정보성 포스팅' : '사례 연구'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">게시 예정일</label>
              <p className="mt-1 text-gray-900">
                {post.publish_date ? formatDate(post.publish_date) : '미정'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 치료 정보 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>치료 정보 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">증상</label>
                <select
                  value={formData.selected_symptom}
                  onChange={(e) => handleInputChange('selected_symptom', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">증상을 선택하세요</option>
                  {medicalServices.map(service => (
                    <option key={`symptom-${service.id}`} value={service.symptom}>
                      {service.symptom}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">진료</label>
                <select
                  value={formData.selected_procedure}
                  onChange={(e) => handleInputChange('selected_procedure', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">진료를 선택하세요</option>
                  {medicalServices.map(service => (
                    <option key={`procedure-${service.id}`} value={service.procedure}>
                      {service.procedure}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">치료</label>
                <select
                  value={formData.selected_treatment}
                  onChange={(e) => handleInputChange('selected_treatment', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">치료를 선택하세요</option>
                  {medicalServices.map(service => (
                    <option key={`treatment-${service.id}`} value={service.treatment}>
                      {service.treatment}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 치아 번호 선택 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">치아 번호 (선택사항)</label>
              <div className="grid grid-cols-8 gap-2">
                {toothNumbers.map(number => (
                  <button
                    key={number}
                    type="button"
                    onClick={() => toggleToothNumber(number)}
                    className={`p-2 text-sm border rounded ${
                      formData.tooth_numbers.includes(number)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {number}
                  </button>
                ))}
              </div>
              {formData.tooth_numbers.length > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  선택된 치아: {formData.tooth_numbers.join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 페르소나 선택 */}
        <Card>
          <CardHeader>
            <CardTitle>페르소나 선택</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {personaStyles.map(style => (
                <label key={style.id} className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="representative_persona"
                    value={style.persona_name}
                    checked={formData.representative_persona === style.persona_name}
                    onChange={(e) => handleInputChange('representative_persona', e.target.value)}
                    className="mt-1"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{style.persona_name}</p>
                    <p className="text-sm text-gray-600">{style.persona_description}</p>
                  </div>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 상세 내용 */}
        <Card>
          <CardHeader>
            <CardTitle>상세 내용</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  질환 개념 및 강조 메시지 *
                </label>
                <textarea
                  value={formData.concept_message}
                  onChange={(e) => handleInputChange('concept_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="치료에 대한 전반적인 개념과 강조하고 싶은 메시지를 작성해주세요."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  내원 당시 환자 상태 *
                </label>
                <textarea
                  value={formData.patient_condition}
                  onChange={(e) => handleInputChange('patient_condition', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="환자가 처음 내원했을 때의 상태를 구체적으로 설명해주세요."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  치료 과정 메시지 *
                </label>
                <textarea
                  value={formData.treatment_process_message}
                  onChange={(e) => handleInputChange('treatment_process_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="실제 치료 과정에서 진행된 내용을 설명해주세요."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  치료 결과 메시지 *
                </label>
                <textarea
                  value={formData.treatment_result_message}
                  onChange={(e) => handleInputChange('treatment_result_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={3}
                  placeholder="치료 후 환자의 상태 변화와 결과를 설명해주세요."
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  추가 메시지
                </label>
                <textarea
                  value={formData.additional_message}
                  onChange={(e) => handleInputChange('additional_message', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  rows={2}
                  placeholder="추가로 전달하고 싶은 메시지가 있다면 작성해주세요."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이미지 업로드 */}
        <Card>
          <CardHeader>
            <CardTitle>이미지 업로드</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* 치료 전 이미지 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-4">치료 전 이미지</h3>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload('before_images', e.target.files)}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">최대 5개, 각 10MB 이하</p>
                {formData.before_images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.before_images.length}개 파일 선택됨
                  </p>
                )}
              </div>

              {/* 치료 과정 이미지 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-4">치료 과정 이미지</h3>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload('process_images', e.target.files)}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">최대 5개, 각 10MB 이하</p>
                {formData.process_images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.process_images.length}개 파일 선택됨
                  </p>
                )}
              </div>

              {/* 치료 후 이미지 */}
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
                <h3 className="font-medium mb-4">치료 후 이미지</h3>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload('after_images', e.target.files)}
                  className="w-full text-sm"
                />
                <p className="text-xs text-gray-500 mt-2">최대 5개, 각 10MB 이하</p>
                {formData.after_images.length > 0 && (
                  <p className="text-sm text-green-600 mt-2">
                    {formData.after_images.length}개 파일 선택됨
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="button" variant="secondary">
            임시 저장
          </Button>
          <Button type="submit" loading={submitting}>
            자료 제출
          </Button>
        </div>
      </form>
    </div>
  );
}
