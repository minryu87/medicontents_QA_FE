'use client';

import React, { useState, useEffect } from 'react';
import { adminApi } from '@/services/api';

interface Platform {
  id: number;
  hospital_id: number;
  platform_name: string;
  platform_type: string;
  platform_url?: string;
  is_public: boolean;
  primary_traffic_source: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface PlatformType {
  type: string;
  name: string;
  description: string;
}

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [platformTypes, setPlatformTypes] = useState<PlatformType[]>([]);
  const [trafficSources, setTrafficSources] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlatform, setEditingPlatform] = useState<Platform | null>(null);
  const [formData, setFormData] = useState({
    platform_name: '',
    platform_type: '',
    platform_url: '',
    is_public: true,
    primary_traffic_source: '',
    is_active: true
  });

  // 플랫폼 목록 로드
  const loadPlatforms = async () => {
    try {
      const response = await adminApi.getPlatforms();
      setPlatforms(response.items || []);
    } catch (error) {
      console.error('플랫폼 로드 실패:', error);
      alert('플랫폼 목록을 불러오는데 실패했습니다.');
    }
  };

  // 플랫폼 타입 정보 로드
  const loadPlatformTypes = async () => {
    try {
      const response = await adminApi.getPlatformTypes();
      setPlatformTypes(response.platform_types || []);
      setTrafficSources(response.traffic_sources || []);
    } catch (error) {
      console.error('플랫폼 타입 로드 실패:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([loadPlatforms(), loadPlatformTypes()]);
      setLoading(false);
    };
    loadData();
  }, []);

  // 폼 초기화
  const resetForm = () => {
    setFormData({
      platform_name: '',
      platform_type: '',
      platform_url: '',
      is_public: true,
      primary_traffic_source: '',
      is_active: true
    });
    setEditingPlatform(null);
  };

  // 플랫폼 생성/수정 핸들러
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingPlatform) {
        // 수정
        await adminApi.updatePlatform(editingPlatform.id, formData);
        alert('플랫폼이 수정되었습니다.');
      } else {
        // 생성 (현재 로그인된 사용자의 병원 ID를 사용해야 함)
        // 임시로 hospital_id를 1로 설정 (실제로는 사용자 정보에서 가져와야 함)
        const platformData = { ...formData, hospital_id: 1 };
        await adminApi.createPlatform(platformData);
        alert('플랫폼이 생성되었습니다.');
      }

      await loadPlatforms();
      setShowModal(false);
      resetForm();
    } catch (error: any) {
      console.error('플랫폼 저장 실패:', error);
      alert(error.response?.data?.detail || '플랫폼 저장에 실패했습니다.');
    }
  };

  // 플랫폼 수정 시작
  const handleEdit = (platform: Platform) => {
    setEditingPlatform(platform);
    setFormData({
      platform_name: platform.platform_name,
      platform_type: platform.platform_type,
      platform_url: platform.platform_url || '',
      is_public: platform.is_public,
      primary_traffic_source: platform.primary_traffic_source,
      is_active: platform.is_active
    });
    setShowModal(true);
  };

  // 플랫폼 삭제
  const handleDelete = async (platformId: number) => {
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

  // 플랫폼 타입 이름 가져오기
  const getPlatformTypeName = (type: string) => {
    const platformType = platformTypes.find(pt => pt.type === type);
    return platformType ? platformType.name : type;
  };

  if (loading) {
    return <div className="p-6">로딩 중...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">게시 플랫폼 관리</h1>
          <p className="text-gray-600">병원별 게시 채널을 관리합니다.</p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          플랫폼 추가
        </button>
      </div>

      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h2 className="text-lg font-semibold">플랫폼 목록</h2>
          <p className="text-gray-600">등록된 게시 플랫폼 목록입니다.</p>
        </div>
        <div className="p-6">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    채널명
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    플랫폼 종류
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    유입 경로
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    공개 여부
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    상태
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    URL
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    액션
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {platforms.map((platform) => (
                  <tr key={platform.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {platform.platform_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {getPlatformTypeName(platform.platform_type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        platform.primary_traffic_source === 'google'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {platform.primary_traffic_source === 'google' ? '구글' : '네이버'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        platform.is_public
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {platform.is_public ? '공개' : '비공개'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        platform.is_active
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {platform.is_active ? '활성' : '비활성'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {platform.platform_url ? (
                        <a
                          href={platform.platform_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          링크
                        </a>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(platform)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(platform.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          삭제
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {platforms.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              등록된 플랫폼이 없습니다.
            </div>
          )}
        </div>
      </div>

      {/* 모달 */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {editingPlatform ? '플랫폼 수정' : '플랫폼 추가'}
              </h3>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    채널명
                  </label>
                  <input
                    type="text"
                    value={formData.platform_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform_name: e.target.value }))}
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
                    value={formData.platform_type}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform_type: e.target.value }))}
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
                    value={formData.platform_url}
                    onChange={(e) => setFormData(prev => ({ ...prev, platform_url: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="https://blog.naver.com/example"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    주 유입 경로
                  </label>
                  <select
                    value={formData.primary_traffic_source}
                    onChange={(e) => setFormData(prev => ({ ...prev, primary_traffic_source: e.target.value }))}
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
                    id="is_public"
                    checked={formData.is_public}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_public: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_public" className="ml-2 block text-sm text-gray-900">
                    공개 채널
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData(prev => ({ ...prev, is_active: e.target.checked }))}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                    활성화
                  </label>
                </div>

                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    {editingPlatform ? '수정' : '생성'}
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
