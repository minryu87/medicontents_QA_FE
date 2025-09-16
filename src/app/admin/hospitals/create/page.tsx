'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { adminApi } from '@/services/api';

interface HospitalFormData {
  name: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  business_card_image: string;
  map_link: string;
  address_keywords: string;
  hospital_keywords: string;
}

export default function CreateHospital() {
  const router = useRouter();
  const [formData, setFormData] = useState<HospitalFormData>({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    business_card_image: '',
    map_link: '',
    address_keywords: '',
    hospital_keywords: '',
  });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (field: keyof HospitalFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 키워드 배열 변환
      const hospitalData = {
        ...formData,
        address_keywords: formData.address_keywords 
          ? formData.address_keywords.split(',').map(k => k.trim()) 
          : [],
        hospital_keywords: formData.hospital_keywords 
          ? formData.hospital_keywords.split(',').map(k => k.trim()) 
          : [],
        is_active: true
      };

      // API 호출 (구현 필요)
      await fetch('/api/v1/hospitals/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(hospitalData)
      });

      router.push('/admin/hospitals');
    } catch (error) {
      console.error('병원 생성 실패:', error);
      alert('병원 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">새 병원 등록</h1>
        <p className="text-gray-600">병원 정보를 입력하여 새로운 병원을 등록하세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* 기본 정보 */}
        <Card>
          <CardHeader>
            <CardTitle>기본 정보</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원명 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="예: 내이튼치과의원"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  전화번호
                </label>
                <Input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                  placeholder="예: 031-123-4567"
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 *
                </label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="예: 경기 화성시 동탄대로 537 라스플로레스 B동 507호"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  웹사이트
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  placeholder="예: https://natenclinic.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  네이버 지도 링크
                </label>
                <Input
                  type="url"
                  value={formData.map_link}
                  onChange={(e) => handleInputChange('map_link', e.target.value)}
                  placeholder="네이버 지도 공유 링크"
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                병원 소개
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
                placeholder="병원의 특징이나 전문 분야를 소개해주세요"
              />
            </div>
          </CardContent>
        </Card>

        {/* 키워드 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>키워드 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소 키워드
                </label>
                <Input
                  value={formData.address_keywords}
                  onChange={(e) => handleInputChange('address_keywords', e.target.value)}
                  placeholder="동탄역, 화성시, 동탄2 (쉼표로 구분)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  지역 관련 키워드를 쉼표로 구분하여 입력하세요
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원 키워드
                </label>
                <Input
                  value={formData.hospital_keywords}
                  onChange={(e) => handleInputChange('hospital_keywords', e.target.value)}
                  placeholder="치과, 임플란트, 보존과 전문의 (쉼표로 구분)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  병원 특징 키워드를 쉼표로 구분하여 입력하세요
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 이미지 설정 */}
        <Card>
          <CardHeader>
            <CardTitle>이미지 설정</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                명함 이미지 URL
              </label>
              <Input
                type="url"
                value={formData.business_card_image}
                onChange={(e) => handleInputChange('business_card_image', e.target.value)}
                placeholder="https://example.com/business_card.jpg"
              />
              <p className="text-xs text-gray-500 mt-1">
                병원 명함이나 대표 이미지의 URL을 입력하세요
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            병원 등록
          </Button>
        </div>
      </form>
    </div>
  );
}
