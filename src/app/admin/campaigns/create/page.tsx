'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
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
}

interface MedicalService {
  id: number;
  category: string;
  treatment: string;
  description: string;
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
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [medicalServices, setMedicalServices] = useState<MedicalService[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setDataLoading(true);
        const [hospitalsData, servicesData] = await Promise.all([
          adminApi.getHospitals(),
          fetch('/api/v1/medical-services/').then(res => res.json())
        ]);

        setHospitals(hospitalsData);
        setMedicalServices(servicesData.services || []);
      } catch (error) {
        console.error('폼 데이터 로드 실패:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = (field: keyof CampaignFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const campaignData = {
        ...formData,
        hospital_id: parseInt(formData.hospital_id),
        medical_service_id: parseInt(formData.medical_service_id),
        completed_post_count: 0,
        published_post_count: 0,
        status: 'active',
        created_by: 0 // 시스템 어드민
      };

      await fetch('/api/v1/campaigns/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData)
      });

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
                      {service.category} - {service.treatment}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            
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
