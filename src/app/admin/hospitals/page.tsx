'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { formatDate, truncateText } from '@/lib/utils';
import { adminApi } from '@/services/api';
import type { Hospital } from '@/types/common';

export default function AdminHospitals() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHospitals = async () => {
      try {
        setLoading(true);
        const hospitalsData = await adminApi.getHospitals();
        setHospitals(hospitalsData);
      } catch (error) {
        console.error('병원 목록 로드 실패:', error);
        setHospitals([]);
      } finally {
        setLoading(false);
      }
    };

    loadHospitals();
  }, []);

  const filteredHospitals = hospitals.filter(hospital =>
    hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    hospital.address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">병원 관리</h1>
          <p className="text-gray-600">등록된 병원을 관리하고 새로운 병원을 등록하세요</p>
        </div>
        <Button asChild>
          <Link href="/admin/hospitals/create">새 병원 등록</Link>
        </Button>
      </div>

      {/* 검색 */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-1">병원 검색</label>
            <Input
              placeholder="병원명 또는 주소로 검색"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* 병원 카드 그리드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredHospitals.map((hospital) => (
          <Card key={hospital.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">{hospital.name}</CardTitle>
                <Badge variant={hospital.is_active ? 'success' : 'secondary'}>
                  {hospital.is_active ? '활성' : '비활성'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {hospital.address && (
                  <div>
                    <span className="text-sm text-gray-600">주소:</span>
                    <p className="text-sm">{truncateText(hospital.address, 50)}</p>
                  </div>
                )}
                
                {hospital.phone && (
                  <div>
                    <span className="text-sm text-gray-600">전화:</span>
                    <p className="text-sm">{hospital.phone}</p>
                  </div>
                )}
                
                {hospital.website && (
                  <div>
                    <span className="text-sm text-gray-600">웹사이트:</span>
                    <a 
                      href={hospital.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 underline"
                    >
                      {truncateText(hospital.website, 30)}
                    </a>
                  </div>
                )}

                {hospital.hospital_keywords && hospital.hospital_keywords.length > 0 && (
                  <div>
                    <span className="text-sm text-gray-600 block mb-1">키워드:</span>
                    <div className="flex flex-wrap gap-1">
                      {hospital.hospital_keywords.slice(0, 3).map((keyword, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {keyword}
                        </Badge>
                      ))}
                      {hospital.hospital_keywords.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{hospital.hospital_keywords.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <span className="text-sm text-gray-600">등록일:</span>
                  <p className="text-sm">{formatDate(hospital.created_at)}</p>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" variant="outline" asChild className="flex-1">
                    <Link href={`/admin/hospitals/${hospital.id}`}>상세보기</Link>
                  </Button>
                  <Button size="sm" variant="ghost" asChild>
                    <Link href={`/admin/hospitals/${hospital.id}/edit`}>수정</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredHospitals.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">
              {searchTerm ? '검색 조건에 맞는 병원이 없습니다.' : '등록된 병원이 없습니다.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
