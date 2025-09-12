'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate } from '@/lib/utils';
import { clientApi } from '@/services/api';
import type { Hospital, User } from '@/types/common';

interface ProfileFormData {
  name: string;
  address: string;
  phone: string;
  website: string;
  description: string;
  email: string;
}

export default function ClientProfile() {
  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<ProfileFormData>({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: '',
    email: '',
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadProfileData = async () => {
      try {
        setLoading(true);
        
        // 실제 API 호출로 데이터 로드
        const profileData = await clientApi.getProfile();
        
        setHospital(profileData.hospital);
        setUser(profileData.user);
        setFormData({
          name: profileData.hospital.name,
          address: profileData.hospital.address || '',
          phone: profileData.hospital.phone || '',
          website: profileData.hospital.website || '',
          description: profileData.hospital.description || '',
          email: profileData.user.email,
        });
      } catch (error) {
        console.error('프로필 데이터 로드 실패:', error);
        // 에러 시 null 상태로 설정
        setHospital(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, []);

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // 실제 API 호출로 프로필 업데이트
      await clientApi.updateProfile(formData);
      
      // 성공 시 편집 모드 종료
      setIsEditing(false);
      
      // 업데이트된 데이터로 상태 갱신
      if (hospital && user) {
        setHospital({
          ...hospital,
          name: formData.name,
          address: formData.address,
          phone: formData.phone,
          website: formData.website,
          description: formData.description,
        });
        setUser({
          ...user,
          email: formData.email,
        });
      }
    } catch (error) {
      console.error('프로필 업데이트 실패:', error);
      alert('프로필 업데이트에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (hospital && user) {
      setFormData({
        name: hospital.name,
        address: hospital.address || '',
        phone: hospital.phone || '',
        website: hospital.website || '',
        description: hospital.description || '',
        email: user.email,
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!hospital || !user) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <p className="text-gray-500">프로필 정보를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* 헤더 */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">프로필 관리</h1>
        <p className="text-gray-600">병원 정보와 계정 설정을 관리하세요</p>
      </div>

      {/* 병원 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>병원 정보</CardTitle>
            <Button
              variant="outline"
              onClick={() => setIsEditing(!isEditing)}
            >
              {isEditing ? '취소' : '수정'}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  병원명 *
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  disabled={!isEditing}
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일 *
                </label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  disabled={!isEditing}
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
                  disabled={!isEditing}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  홈페이지
                </label>
                <Input
                  type="url"
                  value={formData.website}
                  onChange={(e) => handleInputChange('website', e.target.value)}
                  disabled={!isEditing}
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                주소 *
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleInputChange('address', e.target.value)}
                disabled={!isEditing}
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                병원 소개
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                disabled={!isEditing}
                className="w-full px-3 py-2 border border-gray-300 rounded-md disabled:bg-gray-50"
                rows={3}
                placeholder="병원의 특징이나 전문 분야를 소개해주세요."
              />
            </div>
            
            {isEditing && (
              <div className="flex space-x-4 pt-4">
                <Button type="submit" loading={saving}>
                  저장
                </Button>
                <Button type="button" variant="outline" onClick={handleCancel}>
                  취소
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* 계정 정보 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>계정 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">사용자명</label>
              <p className="mt-1 text-gray-900">{user.username}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">역할</label>
              <p className="mt-1 text-gray-900">
                {user.role === 'hospital' ? '병원 관리자' : user.role}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">가입일</label>
              <p className="mt-1 text-gray-900">{formatDate(user.created_at)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">마지막 로그인</label>
              <p className="mt-1 text-gray-900">
                {user.last_login ? formatDate(user.last_login) : '없음'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 추가 정보 */}
      <Card>
        <CardHeader>
          <CardTitle>추가 정보</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">주소 키워드</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {hospital.address_keywords?.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                )) || <span className="text-gray-500">없음</span>}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">병원 키워드</label>
              <div className="mt-1 flex flex-wrap gap-1">
                {hospital.hospital_keywords?.map((keyword, index) => (
                  <Badge key={index} variant="outline">{keyword}</Badge>
                )) || <span className="text-gray-500">없음</span>}
              </div>
            </div>
            {hospital.map_link && (
              <div>
                <label className="block text-sm font-medium text-gray-700">지도 링크</label>
                <a 
                  href={hospital.map_link} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="mt-1 text-blue-600 hover:text-blue-800 underline"
                >
                  네이버 지도에서 보기
                </a>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
