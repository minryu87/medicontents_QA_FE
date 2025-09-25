'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { adminApi } from '@/services/api';
import type { Hospital } from '@/types/common';

interface CampaignFormData {
  name: string;
  description: string;
  hospital_id: string;
  medical_service_id: string;
  start_date: string;
  end_date: string;
  target_post_count: number;
  selected_platforms?: number[]; // 선택된 플랫폼 ID들
}

interface Platform {
  id: number;
  platform_name: string;
  platform_type: string;
  platform_url?: string;
  is_public: boolean;
  primary_traffic_source: string;
  is_active: boolean;
}

interface MedicalService {
  id: number;
  medical_service: {
    id: number;
    category: string;
    treatment: string;
    description: string;
    is_active: boolean;
  };
  hospital_service: {
    id: number;
    hospital_id: number;
    medical_service_id: number;
    specific_treatments: string[];
    treatment_description?: string;
    special_equipment: string[];
  };
}

export default function CreateCampaign() {
  const router = useRouter();
  const [formData, setFormData] = useState<CampaignFormData>({
    name: '',
    description: '',
    hospital_id: '',
    medical_service_id: '',
    start_date: '',
    end_date: '',
    target_post_count: 10,
    selected_platforms: [],
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setDataLoading(true);
        const hospitalsData = await adminApi.getHospitals();

        setHospitals(hospitalsData.hospitals || []);
        setMedicalServices([]); // 초기에는 빈 배열
      } catch (error) {
        console.error('병원 데이터 로드 실패:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = async (field: keyof CampaignFormData, value: string | number | number[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // 병원이 선택되면 해당 병원의 진료 서비스와 플랫폼 로드
    if (field === 'hospital_id' && value) {
      try {
        setDataLoading(true);
        const [servicesData, platformsData] = await Promise.all([
          adminApi.getHospitalMedicalServices(parseInt(value.toString())),
          adminApi.getPlatforms({ hospital_id: parseInt(value.toString()) })
        ]);
        setMedicalServices(servicesData || []);
        setPlatforms(platformsData.items || []);
        // 선택 초기화
        setFormData(prev => ({
          ...prev,
          medical_service_id: '',
          selected_platforms: []
        }));
      } catch (error) {
        console.error('데이터 로드 실패:', error);
        setMedicalServices([]);
        setPlatforms([]);
      } finally {
        setDataLoading(false);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        ...formData,
        hospital_id: parseInt(formData.hospital_id),
        medical_service_id: parseInt(formData.medical_service_id),
        selected_platforms: formData.selected_platforms,
        completed_post_count: 0,
        published_post_count: 0,
        status: 'draft',
        created_by: 0 // 시스템 어드민
      };

      await adminApi.createCampaign(campaignData);

      router.push('/admin/campaigns');
    } catch (error) {
      console.error('캠페인 생성 실패:', error);
      alert('캠페인 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  if (dataLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 캠페인 생성</h1>
        <p className="text-gray-600">새로운 마케팅 캠페인을 생성하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  캠페인명 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="예: 내이튼치과_디지털 임플란트 캠페인"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원 선택 *
                </label>
                <select
                  value={formData.hospital_id}
                  onChange={(e) => handleInputChange('hospital_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">병원을 선택하세요</option>
                  {hospitals.map((hospital) => (
                    <option key={hospital.id} value={hospital.id.toString()}>
                      {hospital.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  진료 서비스 *
                </label>
                <select
                  value={formData.medical_service_id}
                  onChange={(e) => handleInputChange('medical_service_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="">진료 서비스를 선택하세요</option>
                  {medicalServices.map((service) => (
                    <option key={service.id} value={service.id.toString()}>
                      {service.medical_service.category} - {service.medical_service.treatment}
                      {service.hospital_service.specific_treatments.length > 0 &&
                        ` (${service.hospital_service.specific_treatments[0]})`
                      }
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* 선택된 진료 서비스 상세 정보 */}
            {formData.medical_service_id && medicalServices.length > 0 && (
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 mb-2">진료 서비스 상세 정보</h4>
                {(() => {
                  const selectedService = medicalServices.find(s => s.id.toString() === formData.medical_service_id);
                  if (!selectedService) return null;

                  return (
                    <div className="space-y-2">
                      <p className="text-sm text-blue-800">
                        <strong>기본 정보:</strong> {selectedService.medical_service.description}
                      </p>

                      {selectedService.hospital_service.specific_treatments.length > 0 && (
                        <div className="text-sm text-blue-800">
                          <strong>구체적인 진료:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {selectedService.hospital_service.specific_treatments.map((treatment, idx) => (
                              <li key={idx}>{treatment}</li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {selectedService.hospital_service.treatment_description && (
                        <p className="text-sm text-blue-800">
                          <strong>병원별 설명:</strong> {selectedService.hospital_service.treatment_description}
                        </p>
                      )}

                      {selectedService.hospital_service.special_equipment.length > 0 && (
                        <div className="text-sm text-blue-800">
                          <strong>특수 장비:</strong>
                          <ul className="list-disc list-inside ml-4 mt-1">
                            {selectedService.hospital_service.special_equipment.map((equipment, idx) => (
                              <li key={idx}>{equipment}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })()}
              </div>
            )}

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                캠페인 설명
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="캠페인의 목적과 내용을 설명해주세요"
              />
            </div>
          </CardContent>
        </Card>

        {/* 기간 및 목표 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>기간 및 목표 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  시작일 *
                </label>
                <Input
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => handleInputChange('start_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종료일 *
                </label>
                <Input
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => handleInputChange('end_date', e.target.value)}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  목표 포스트 수 *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="100"
                  value={formData.target_post_count}
                  onChange={(e) => handleInputChange('target_post_count', parseInt(e.target.value) || 0)}
                  required
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 게시 플랫폼 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>게시 플랫폼 설정</CardTitle>
          </CardHeader>
          <CardContent>
            {formData.hospital_id ? (
              platforms.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="border rounded-lg p-4">
                      <div className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          id={`platform-${platform.id}`}
                          checked={formData.selected_platforms?.includes(platform.id) || false}
                          onChange={(e) => {
                            const currentIds = formData.selected_platforms || [];
                            const newIds = e.target.checked
                              ? [...currentIds, platform.id]
                              : currentIds.filter(id => id !== platform.id);
                            handleInputChange('selected_platforms' as any, newIds);
                          }}
                          className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div className="flex-1">
                          <label
                            htmlFor={`platform-${platform.id}`}
                            className="text-sm font-medium text-gray-900 cursor-pointer"
                          >
                            {platform.platform_name}
                          </label>
                          <div className="mt-1 space-y-1">
                            <p className="text-xs text-gray-500">
                              {platform.platform_type === 'naver_blog' && '네이버 블로그'}
                              {platform.platform_type === 'tistory' && '티스토리'}
                              {platform.platform_type === 'homepage_public' && '홈페이지 공개'}
                              {platform.platform_type === 'homepage_private' && '홈페이지 비공개'}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                platform.primary_traffic_source === 'google'
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}>
                                {platform.primary_traffic_source === 'google' ? '구글' : '네이버'}
                              </span>
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                platform.is_public
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {platform.is_public ? '공개' : '비공개'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <p>등록된 플랫폼이 없습니다.</p>
                  <p className="text-sm mt-1">
                    플랫폼 관리를 통해 게시 채널을 먼저 등록해주세요.
                  </p>
                </div>
              )
            ) : (
              <div className="text-center py-8 text-gray-500">
                병원을 먼저 선택해주세요.
              </div>
            )}
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            캠페인 생성
          </Button>
        </div>
      </form>
    </div>
  );
}
