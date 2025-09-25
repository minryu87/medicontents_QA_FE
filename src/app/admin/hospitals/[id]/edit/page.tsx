'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';
import { adminApi } from '@/services/api';
import type { Hospital } from '@/types/common';

interface Platform {
  id: number;
  platform_name: string;
  platform_type: string;
  platform_url?: string;
  is_public: boolean;
  primary_traffic_source: string;
  is_active: boolean;
}

export default function AdminHospitalEdit() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // 폼 데이터
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    is_active: true,
    address_keywords: [] as string[],
    hospital_keywords: [] as string[],
    business_card_image: '',
    logo_image: '',
    map_link: ''
  });

  // 플랫폼 폼 데이터
  const [platformFormData, setPlatformFormData] = useState({
    platform_name: '',
    platform_type: '',
    platform_url: '',
    is_public: true,
    primary_traffic_source: '',
    is_active: true
  });

  const [showPlatformModal, setShowPlatformModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [platformTypes, setPlatformTypes] = useState<any[]>([]);
  const [trafficSources, setTrafficSources] = useState<string[]>([]);

  useEffect(() => {
    loadData();
  }, [hospitalId]);

  const loadData = async () => {
    try {
      setLoading(true);

      // 병원 정보 로드
      const hospitalsData = await adminApi.getHospitals();
      const hospitalData = hospitalsData.hospitals?.find((h: Hospital) => h.id.toString() === hospitalId);

      if (!hospitalData) {
        alert('병원을 찾을 수 없습니다.');
        router.push('/admin/hospitals');
        return;
      }

      setHospital(hospitalData);
      setFormData({
        name: hospitalData.name || '',
        address: hospitalData.address || '',
        phone: hospitalData.phone || '',
        website: hospitalData.website || '',
        description: hospitalData.description || '',
        is_active: hospitalData.is_active ?? true,
        address_keywords: hospitalData.address_keywords || [],
        hospital_keywords: hospitalData.hospital_keywords || [],
        business_card_image: hospitalData.business_card_image || '',
        logo_image: hospitalData.logo_image || '',
        map_link: hospitalData.map_link || ''
      });

      // 플랫폼 정보 로드
      await loadPlatforms();
      await loadPlatformTypes();

    } catch (error) {
      console.error('데이터 로드 실패:', error);
      alert('데이터 로드에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const loadPlatforms = async () => {
    try {
      const response = await adminApi.getPlatforms({ hospital_id: parseInt(hospitalId) });
      setPlatforms(response.items || []);
    } catch (error) {
      console.error('플랫폼 로드 실패:', error);
    }
  };

  const loadPlatformTypes = async () => {
    try {
      const response = await adminApi.getPlatformTypes();
      setPlatformTypes(response.platform_types || []);
      setTrafficSources(response.traffic_sources || []);
    } catch (error) {
      console.error('플랫폼 타입 로드 실패:', error);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePlatformSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPlatform) {
        // 플랫폼 수정
        await adminApi.updatePlatform(editingPlatform.id, platformFormData);
        alert('플랫폼이 수정되었습니다.');
      } else {
        // 플랫폼 생성
        const newPlatformData = { ...platformFormData, hospital_id: parseInt(hospitalId) };
        await adminApi.createPlatform(newPlatformData);
        alert('플랫폼이 추가되었습니다.');
      }

      await loadPlatforms();
      setShowPlatformModal(false);
      resetPlatformForm();
    } catch (error: any) {
      console.error('플랫폼 저장 실패:', error);
      alert(error.response?.data?.detail || '플랫폼 저장에 실패했습니다.');
    }
  };

  const handlePlatformEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setPlatformFormData({
      platform_name: platform.platform_name,
      platform_type: platform.platform_type,
      platform_url: platform.platform_url || '',
      is_public: platform.is_public,
      primary_traffic_source: platform.primary_traffic_source,
      is_active: platform.is_active
    });
    setShowPlatformModal(true);
  };

  const handlePlatformDelete = async (platformId: number) => {
    if (!confirm('정말로 이 플랫폼을 삭제하시겠습니까?')) return;

    try {
      await adminApi.deletePlatform(platformId);
      alert('플랫폼이 삭제되었습니다.');
      await loadPlatforms();
    } catch (error: any) {
      console.error('플랫폼 삭제 실패:', error);
      alert(error.response?.data?.detail || '플랫폼 삭제에 실패했습니다.');
    }
  };

  const resetPlatformForm = () => {
    setPlatformFormData({
      platform_name: '',
      platform_type: '',
      platform_url: '',
      is_public: true,
      primary_traffic_source: '',
      is_active: true
    });
    setEditingPlatform(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      await adminApi.updateHospital(parseInt(hospitalId), formData);
      alert('병원 정보가 저장되었습니다.');
      router.push(`/admin/hospitals/${hospitalId}`);
    } catch (error: any) {
      console.error('병원 정보 저장 실패:', error);
      alert(error.response?.data?.detail || '병원 정보 저장에 실패했습니다.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">병원을 찾을 수 없습니다</h2>
          <Button onClick={() => router.push('/admin/hospitals')} className="mt-4">
            병원 목록으로 돌아가기
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">병원 정보 수정</h1>
          <p className="text-gray-600">{hospital.name}</p>
        </div>
        <div className="space-x-4">
          <Button variant="outline" onClick={() => router.push(`/admin/hospitals/${hospitalId}`)}>
            취소
          </Button>
          <Button onClick={handleSubmit} loading={saving}>
            저장
          </Button>
        </div>
      </div>

      {/* 기본 정보 수정 */}
      <Card>
        <CardHeader>
          <CardTitle>기본 정보</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                병원명 *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소
              </label>
              <Input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
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
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="병원에 대한 설명을 입력하세요"
            />
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
              활성화
            </label>
          </div>
        </CardContent>
      </Card>

      {/* 게시 플랫폼 설정 */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>게시 플랫폼 설정</CardTitle>
            <Button onClick={() => setShowPlatformModal(true)}>
              플랫폼 추가
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {platforms.length > 0 ? (
            <div className="space-y-4">
              {platforms.map((platform) => (
                <div key={platform.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h4 className="font-medium">{platform.platform_name}</h4>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          platform.is_active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {platform.is_active ? '활성' : '비활성'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">타입:</span>
                          <span className="ml-1">
                            {platform.platform_type === 'naver_blog' && '네이버 블로그'}
                            {platform.platform_type === 'tistory' && '티스토리'}
                            {platform.platform_type === 'homepage_public' && '홈페이지 공개'}
                            {platform.platform_type === 'homepage_private' && '홈페이지 비공개'}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium">유입경로:</span>
                          <span className={`ml-1 ${
                            platform.primary_traffic_source === 'google' ? 'text-green-600' : 'text-blue-600'
                          }`}>
                            {platform.primary_traffic_source === 'google' ? '구글' : '네이버'}
                          </span>
                        </div>

                        <div>
                          <span className="font-medium">공개여부:</span>
                          <span className={`ml-1 ${
                            platform.is_public ? 'text-blue-600' : 'text-gray-600'
                          }`}>
                            {platform.is_public ? '공개' : '비공개'}
                          </span>
                        </div>

                        {platform.platform_url && (
                          <div>
                            <span className="font-medium">URL:</span>
                            <a
                              href={platform.platform_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="ml-1 text-blue-600 hover:underline"
                            >
                              링크
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlatformEdit(platform)}
                      >
                        수정
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handlePlatformDelete(platform.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        삭제
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>등록된 플랫폼이 없습니다.</p>
              <p className="text-sm mt-1">플랫폼을 추가하여 게시 채널을 설정하세요.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 플랫폼 추가/수정 모달 */}
      {showPlatformModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPlatform ? '플랫폼 수정' : '플랫폼 추가'}
              </h3>

              <form onSubmit={handlePlatformSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    채널명
                  </label>
                  <input
                    type="text"
                    value={platformFormData.platform_name}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, platform_name: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 메인 블로그"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    플랫폼 종류
                  </label>
                  <select
                    value={platformFormData.platform_type}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, platform_type: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">플랫폼 종류 선택</option>
                    {platformTypes.map((type) => (
                      <option key={type.type} value={type.type}>
                        {type.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    채널 URL
                  </label>
                  <input
                    type="url"
                    value={platformFormData.platform_url}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, platform_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://blog.naver.com/example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주 유입 경로
                  </label>
                  <select
                    value={platformFormData.primary_traffic_source}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, primary_traffic_source: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">유입 경로 선택</option>
                    {trafficSources.map((source) => (
                      <option key={source} value={source}>
                        {source === 'google' ? '구글' : '네이버'}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="platform_is_public"
                    checked={platformFormData.is_public}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="platform_is_public" className="ml-2 block text-sm text-gray-900">
                    공개 채널
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="platform_is_active"
                    checked={platformFormData.is_active}
                    onChange={(e) => setPlatformFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="platform_is_active" className="ml-2 block text-sm text-gray-900">
                    활성화
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowPlatformModal(false);
                      resetPlatformForm();
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingPlatform ? '수정' : '추가'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
