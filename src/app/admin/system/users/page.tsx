'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import {
  Users,
  UserPlus,
  Edit,
  Trash,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Key,
  Mail,
  Phone,
  Building,
  Calendar,
  MoreVertical,
  CheckCircle,
  XCircle
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: 'admin' | 'operator' | 'support' | 'hospital_admin' | 'hospital_user';
  hospitalId?: number;
  hospitalName?: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  permissions: string[];
}

interface Role {
  id: string;
  name: string;
  description: string;
  permissions: string[];
  userCount: number;
}

const roleLabels = {
  admin: '시스템 관리자',
  operator: '운영 담당자',
  support: '고객 지원',
  hospital_admin: '병원 관리자',
  hospital_user: '병원 사용자'
};

const roleColors = {
  admin: 'text-red-600 bg-red-100',
  operator: 'text-blue-600 bg-blue-100',
  support: 'text-green-600 bg-green-100',
  hospital_admin: 'text-purple-600 bg-purple-100',
  hospital_user: 'text-gray-600 bg-gray-100'
};

const permissions = {
  posts: {
    create: '포스트 생성',
    read: '포스트 조회',
    update: '포스트 수정',
    delete: '포스트 삭제',
    approve: '포스트 승인',
    publish: '포스트 게시'
  },
  campaigns: {
    create: '캠페인 생성',
    read: '캠페인 조회',
    update: '캠페인 수정',
    delete: '캠페인 삭제'
  },
  hospitals: {
    create: '병원 등록',
    read: '병원 조회',
    update: '병원 수정',
    delete: '병원 삭제'
  },
  users: {
    create: '사용자 생성',
    read: '사용자 조회',
    update: '사용자 수정',
    delete: '사용자 삭제'
  },
  system: {
    read: '시스템 조회',
    update: '시스템 설정',
    maintain: '시스템 유지보수'
  }
};

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('all');

  useEffect(() => {
    loadUsers();
    loadRoles();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      // 실제로는 API 호출
      const mockUsers: User[] = [
        {
          id: 1,
          username: 'admin',
          email: 'admin@medicontents.com',
          role: 'admin',
          isActive: true,
          lastLogin: '2024-01-20T09:30:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          permissions: ['posts.*', 'campaigns.*', 'hospitals.*', 'users.*', 'system.*']
        },
        {
          id: 2,
          username: 'operator1',
          email: 'operator@medicontents.com',
          role: 'operator',
          isActive: true,
          lastLogin: '2024-01-19T16:45:00Z',
          createdAt: '2024-01-05T00:00:00Z',
          permissions: ['posts.*', 'campaigns.*', 'hospitals.read', 'users.read', 'system.read']
        },
        {
          id: 3,
          username: 'hospital_admin',
          email: 'admin@hospital1.com',
          role: 'hospital_admin',
          hospitalId: 1,
          hospitalName: 'A치과병원',
          isActive: true,
          lastLogin: '2024-01-18T14:20:00Z',
          createdAt: '2024-01-10T00:00:00Z',
          permissions: ['posts.read', 'posts.update', 'campaigns.read', 'users.read']
        },
        {
          id: 4,
          username: 'support_team',
          email: 'support@medicontents.com',
          role: 'support',
          isActive: false,
          createdAt: '2024-01-15T00:00:00Z',
          permissions: ['posts.read', 'hospitals.read', 'users.read', 'system.read']
        }
      ];
      setUsers(mockUsers);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadRoles = async () => {
    // 실제로는 API 호출
    const mockRoles: Role[] = [
      {
        id: 'admin',
        name: '시스템 관리자',
        description: '모든 시스템 기능에 대한 완전한 접근 권한',
        permissions: ['posts.*', 'campaigns.*', 'hospitals.*', 'users.*', 'system.*'],
        userCount: 1
      },
      {
        id: 'operator',
        name: '운영 담당자',
        description: '콘텐츠 생성 및 캠페인 운영 관리',
        permissions: ['posts.*', 'campaigns.*', 'hospitals.read', 'users.read', 'system.read'],
        userCount: 2
      },
      {
        id: 'support',
        name: '고객 지원',
        description: '병원 지원 및 문의 처리',
        permissions: ['posts.read', 'hospitals.read', 'users.read', 'system.read'],
        userCount: 1
      },
      {
        id: 'hospital_admin',
        name: '병원 관리자',
        description: '자신의 병원 콘텐츠 및 사용자 관리',
        permissions: ['posts.read', 'posts.update', 'campaigns.read', 'users.read'],
        userCount: 5
      },
      {
        id: 'hospital_user',
        name: '병원 사용자',
        description: '기본적인 콘텐츠 조회 및 자료 제공',
        permissions: ['posts.read', 'posts.create'],
        userCount: 15
      }
    ];
    setRoles(mockRoles);
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = selectedRole === 'all' || user.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  const handleCreateUser = () => {
    setEditingUser(null);
    setShowUserModal(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setShowUserModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (confirm('이 사용자를 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      // API 호출
      setUsers(prev => prev.filter(u => u.id !== userId));
    }
  };

  const handleToggleUserStatus = async (userId: number) => {
    // API 호출
    setUsers(prev => prev.map(user =>
      user.id === userId ? { ...user, isActive: !user.isActive } : user
    ));
  };

  const formatPermission = (permission: string) => {
    const [resource, action] = permission.split('.');
    if (action === '*') {
      return `${resource} 전체`;
    }
    return permission; // 임시로 간단하게 수정
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* 헤더 */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">사용자 및 권한 관리</h1>
            <p className="text-gray-600">
              시스템 사용자 계정과 접근 권한을 관리합니다.
            </p>
          </div>
          <Button onClick={handleCreateUser}>
            <UserPlus className="w-4 h-4 mr-2" />
            새 사용자
          </Button>
        </div>
      </div>

      {/* 통계 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center">
            <Users className="w-8 h-8 text-blue-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">총 사용자</p>
              <p className="text-2xl font-bold text-gray-900">{users.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <CheckCircle className="w-8 h-8 text-green-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">활성 사용자</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.isActive).length}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-purple-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">역할 수</p>
              <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <ShieldCheck className="w-8 h-8 text-orange-500 mr-3" />
            <div>
              <p className="text-sm font-medium text-gray-600">관리자 수</p>
              <p className="text-2xl font-bold text-gray-900">
                {users.filter(u => u.role === 'admin').length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 사용자 목록 */}
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold text-gray-900">사용자 목록</h2>
              <div className="flex gap-3">
                <input
                  type="text"
                  placeholder="사용자 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="all">모든 역할</option>
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {filteredUsers.map((user) => (
                <div key={user.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center mr-3">
                        <span className="text-primary-600 font-medium">
                          {user.username.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">{user.username}</h3>
                        <p className="text-sm text-gray-600">{user.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${roleColors[user.role]}`}>
                        {roleLabels[user.role]}
                      </span>
                      {user.isActive ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                      <div className="relative">
                        <button className="p-1 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {/* 드롭다운 메뉴 (간단 구현) */}
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10 hidden">
                          <button
                            onClick={() => handleEditUser(user)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            <Edit className="w-4 h-4 inline mr-2" />
                            편집
                          </button>
                          <button
                            onClick={() => handleToggleUserStatus(user.id)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100"
                          >
                            {user.isActive ? '비활성화' : '활성화'}
                          </button>
                          <button
                            onClick={() => handleDeleteUser(user.id)}
                            className="block w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-600"
                          >
                            <Trash className="w-4 h-4 inline mr-2" />
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                    {user.hospitalName && (
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-1" />
                        {user.hospitalName}
                      </div>
                    )}
                    {user.lastLogin && (
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        마지막 로그인: {new Date(user.lastLogin).toLocaleDateString('ko-KR')}
                      </div>
                    )}
                    <div className="flex items-center">
                      <Key className="w-4 h-4 mr-1" />
                      권한: {user.permissions.length}개
                    </div>
                    <div className="flex items-center">
                      <Shield className="w-4 h-4 mr-1" />
                      생성일: {new Date(user.createdAt).toLocaleDateString('ko-KR')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* 역할 및 권한 */}
        <div>
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">역할별 권한</h2>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-gray-900">{role.name}</h3>
                    <span className="text-sm text-gray-500">{role.userCount}명</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-3">{role.description}</p>
                  <div className="space-y-1">
                    <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide">
                      주요 권한
                    </h4>
                    {role.permissions.slice(0, 3).map((permission, index) => (
                      <div key={index} className="text-xs text-gray-600 flex items-center">
                        <CheckCircle className="w-3 h-3 text-green-500 mr-2" />
                        {formatPermission(permission)}
                      </div>
                    ))}
                    {role.permissions.length > 3 && (
                      <div className="text-xs text-gray-500">
                        외 {role.permissions.length - 3}개 권한
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* 최근 활동 */}
          <Card className="p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">최근 활동</h2>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">새 사용자 등록</p>
                  <p className="text-xs text-gray-600">support_team 계정이 생성되었습니다.</p>
                  <p className="text-xs text-gray-500">2시간 전</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">권한 변경</p>
                  <p className="text-xs text-gray-600">operator1의 캠페인 권한이 업데이트되었습니다.</p>
                  <p className="text-xs text-gray-500">5시간 전</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 mr-3"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">로그인 실패</p>
                  <p className="text-xs text-gray-600">알 수 없는 IP에서 로그인 시도가 있었습니다.</p>
                  <p className="text-xs text-gray-500">1일 전</p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* 사용자 생성/편집 모달 (간단한 구현) */}
      {showUserModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">
                {editingUser ? '사용자 편집' : '새 사용자 생성'}
              </h2>
              <Button variant="outline" onClick={() => setShowUserModal(false)}>
                닫기
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  사용자명
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="사용자명을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이메일
                </label>
                <input
                  type="email"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                  placeholder="이메일을 입력하세요"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  역할
                </label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md">
                  {Object.entries(roleLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <Button variant="primary">
                  {editingUser ? '저장' : '생성'}
                </Button>
                <Button variant="outline" onClick={() => setShowUserModal(false)}>
                  취소
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
