'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { adminApi } from '@/services/api';
import type { Hospital, Campaign } from '@/types/common';

interface PostFormData {
  hospital_id: string;
  campaign_id: string;
  post_type: 'informational' | 'case_study';
  publish_date: string;
  target_post_count: number;
}

export default function CreatePosts() {
  const router = useRouter();
  const [formData, setFormData] = useState<PostFormData>({
    hospital_id: '',
    campaign_id: '',
    post_type: 'case_study',
    publish_date: '',
    target_post_count: 1,
  });
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setDataLoading(true);
        const [hospitalsData, campaignsData] = await Promise.all([
          adminApi.getHospitals(),
          adminApi.getCampaigns()
        ]);

        setHospitals(hospitalsData);
        setCampaigns(campaignsData);
      } catch (error) {
        console.error('폼 데이터 로드 실패:', error);
      } finally {
        setDataLoading(false);
      }
    };

    loadFormData();
  }, []);

  const handleInputChange = (field: keyof PostFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const selectedCampaign = campaigns.find(c => c.id.toString() === formData.campaign_id);
      const selectedHospital = hospitals.find(h => h.id.toString() === formData.hospital_id);

      if (!selectedCampaign || !selectedHospital) {
        throw new Error('캠페인 또는 병원 정보를 찾을 수 없습니다.');
      }

      // 포스트 일괄 생성 API 호출
      const createPromises = [];
      for (let i = 1; i <= formData.target_post_count; i++) {
        const postId = `${formData.hospital_id}-${formData.campaign_id}-${i.toString().padStart(3, '0')}`;
        
        const postData = {
          post_id: postId,
          campaign_id: parseInt(formData.campaign_id),
          hospital_id: parseInt(formData.hospital_id),
          medical_service_id: selectedCampaign.medical_service_id,
          title: '제목 생성 전',
          status: 'initial',
          post_type: formData.post_type,
          publish_date: formData.publish_date,
          is_campaign_post: true,
          created_by: 0 // 시스템 어드민
        };

        createPromises.push(
          fetch('/api/v1/blog-posts/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(postData)
          })
        );
      }

      await Promise.all(createPromises);
      
      alert(`${formData.target_post_count}개의 포스트가 성공적으로 생성되었습니다.`);
      router.push('/admin/posts');
    } catch (error) {
      console.error('포스트 생성 실패:', error);
      alert('포스트 생성에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  };

  const filteredCampaigns = campaigns.filter(campaign => 
    !formData.hospital_id || campaign.hospital_id.toString() === formData.hospital_id
  );

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
        <h1 className="text-2xl font-bold text-gray-900">새 포스트 생성</h1>
        <p className="text-gray-600">캠페인용 포스트를 일괄 생성하세요</p>
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
                  캠페인 선택 *
                </label>
                <select
                  value={formData.campaign_id}
                  onChange={(e) => handleInputChange('campaign_id', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                  disabled={!formData.hospital_id}
                >
                  <option value="">캠페인을 선택하세요</option>
                  {filteredCampaigns.map((campaign) => (
                    <option key={campaign.id} value={campaign.id.toString()}>
                      {campaign.name}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  포스트 타입 *
                </label>
                <select
                  value={formData.post_type}
                  onChange={(e) => handleInputChange('post_type', e.target.value as 'informational' | 'case_study')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="informational">정보성 포스팅</option>
                  <option value="case_study">사례 연구</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  생성할 포스트 수 *
                </label>
                <Input
                  type="number"
                  min="1"
                  max="50"
                  value={formData.target_post_count}
                  onChange={(e) => handleInputChange('target_post_count', parseInt(e.target.value) || 1)}
                  required
                />
              </div>
            </div>
            
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                기본 게시 예정일
              </label>
              <Input
                type="date"
                value={formData.publish_date}
                onChange={(e) => handleInputChange('publish_date', e.target.value)}
                placeholder="개별 포스트에서 조정 가능"
              />
              <p className="text-xs text-gray-500 mt-1">
                기본 게시일을 설정하면 순차적으로 날짜가 할당됩니다
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 생성 미리보기 */}
        {formData.hospital_id && formData.campaign_id && (
          <Card>
            <CardHeader>
              <CardTitle>생성 미리보기</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700 mb-2">
                  <strong>생성될 포스트 ID 패턴:</strong>
                </p>
                <div className="font-mono text-sm bg-white p-2 rounded border">
                  {formData.hospital_id}-{formData.campaign_id}-001 ~ {formData.hospital_id}-{formData.campaign_id}-{formData.target_post_count.toString().padStart(3, '0')}
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  총 {formData.target_post_count}개의 포스트가 생성됩니다
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 제출 버튼 */}
        <div className="flex justify-end space-x-4">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" loading={loading}>
            {formData.target_post_count}개 포스트 생성
          </Button>
        </div>
      </form>
    </div>
  );
}
