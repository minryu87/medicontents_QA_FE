'use client';

import { useEffect, useState } from 'react';
import { clientApi } from '@/services/api';
import { Card } from '@/components/shared/Card';
import Button from '@/components/shared/Button';
import Input from '@/components/shared/Input';

interface HospitalProfile {
  id: number;
  name: string;
  address?: string;
  phone?: string;
  website?: string;
  description?: string;
  business_card_image?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  last_login?: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<HospitalProfile | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    phone: '',
    website: '',
    description: ''
  });

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const [profileData, userData] = await Promise.all([
        clientApi.getHospitalProfile(),
        clientApi.getCurrentUser()
      ]);

      setProfile(profileData);
      setUser(userData);
      setFormData({
        name: profileData.name,
        address: profileData.address || '',
        phone: profileData.phone || '',
        website: profileData.website || '',
        description: profileData.description || ''
      });
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      await clientApi.updateHospitalProfile(formData);
      setEditing(false);
      await loadProfile(); // Reload data
      alert('프로필이 성공적으로 업데이트되었습니다.');
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('프로필 저장 중 오류가 발생했습니다.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name,
        address: profile.address || '',
        phone: profile.phone || '',
        website: profile.website || '',
        description: profile.description || ''
      });
    }
    setEditing(false);
  };

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
        <h1 className="text-3xl font-bold">병원 프로필 관리</h1>
        <p className="text-gray-600 mt-2">병원 정보를 관리하고 업데이트하세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hospital Profile */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">병원 정보</h2>
              {!editing ? (
                <Button onClick={() => setEditing(true)}>수정</Button>
              ) : (
                <div className="flex gap-2">
                  <Button onClick={handleSave} disabled={saving}>
                    {saving ? '저장 중...' : '저장'}
                  </Button>
                  <Button variant="secondary" onClick={handleCancel}>
                    취소
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">병원명</label>
                  {editing ? (
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      required
                    />
                  ) : (
                    <p className="text-gray-900 p-2 border rounded bg-gray-50">{profile?.name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">전화번호</label>
                  {editing ? (
                    <Input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    />
                  ) : (
                    <p className="text-gray-900 p-2 border rounded bg-gray-50">{profile?.phone || '미등록'}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium mb-2">주소</label>
                  {editing ? (
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      required
                    />
                  ) : (
                    <p className="text-gray-900 p-2 border rounded bg-gray-50">{profile?.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">웹사이트</label>
                  {editing ? (
                    <Input
                      type="url"
                      value={formData.website}
                      onChange={(e) => setFormData(prev => ({ ...prev, website: e.target.value }))}
                      placeholder="https://"
                    />
                  ) : (
                    <p className="text-gray-900 p-2 border rounded bg-gray-50">
                      {profile?.website ? (
                        <a
                          href={profile.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800"
                        >
                          {profile.website}
                        </a>
                      ) : (
                        '미등록'
                      )}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">병원 소개</label>
                {editing ? (
                  <textarea
                    className="w-full p-3 border rounded"
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="병원에 대한 간단한 소개를 작성해주세요."
                  />
                ) : (
                  <p className="text-gray-900 p-3 border rounded bg-gray-50 min-h-[100px]">
                    {profile?.description || '병원 소개가 없습니다.'}
                  </p>
                )}
              </div>

              {profile?.business_card_image && (
                <div>
                  <label className="block text-sm font-medium mb-2">병원 로고</label>
                  <img
                    src={profile.business_card_image}
                    alt="병원 로고"
                    className="w-32 h-32 object-cover rounded border"
                  />
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Account Info */}
        <div>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">계정 정보</h2>
            {user && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">사용자명</label>
                  <p className="text-gray-900 p-2 border rounded bg-gray-50">{user.username}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">이메일</label>
                  <p className="text-gray-900 p-2 border rounded bg-gray-50">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">역할</label>
                  <p className="text-gray-900 p-2 border rounded bg-gray-50 capitalize">{user.role}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">마지막 로그인</label>
                  <p className="text-gray-900 p-2 border rounded bg-gray-50">
                    {user.last_login
                      ? new Date(user.last_login).toLocaleString('ko-KR')
                      : '로그인 기록 없음'
                    }
                  </p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">계정 설정</h2>
            <div className="space-y-4">
              <Button variant="secondary" className="w-full">
                비밀번호 변경
              </Button>
              <Button variant="secondary" className="w-full">
                알림 설정
              </Button>
              <Button variant="outline" className="w-full text-red-600 border-red-600 hover:bg-red-50">
                계정 탈퇴
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}