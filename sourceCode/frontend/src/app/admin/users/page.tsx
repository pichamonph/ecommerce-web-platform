'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';
import {
  Search,
  Filter,
  Ban,
  CheckCircle2,
  MoreVertical,
  UserCheck,
  UserX,
  Calendar,
  Mail,
  Phone,
  Shield,
} from 'lucide-react';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  firstName: string | null;
  lastName: string | null;
  phone: string | null;
  profileImage: string | null;
  isBanned: boolean;
  createdAt: string;
  lastLoginAt: string | null;
}

export default function UserManagementPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [actionMenuOpen, setActionMenuOpen] = useState<number | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      router.push('/');
    }
  }, [authLoading, isAdmin, router]);

  useEffect(() => {
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin, search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (roleFilter) params.append('role', roleFilter);

      const response = await api.get<User[]>(`/admin/users?${params.toString()}`);
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleBanUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/ban`);
      fetchUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Failed to ban user:', error);
    }
  };

  const handleUnbanUser = async (userId: number) => {
    try {
      await api.put(`/admin/users/${userId}/unban`);
      fetchUsers();
      setActionMenuOpen(null);
    } catch (error) {
      console.error('Failed to unban user:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      ROLE_ADMIN: 'bg-gradient-to-r from-purple-500 to-pink-500',
      ROLE_SELLER: 'bg-gradient-to-r from-blue-500 to-cyan-500',
      ROLE_USER: 'bg-gradient-to-r from-gray-500 to-gray-600',
    };
    return badges[role as keyof typeof badges] || badges.ROLE_USER;
  };

  const getRoleLabel = (role: string) => {
    const labels = {
      ROLE_ADMIN: 'Admin',
      ROLE_SELLER: 'Seller',
      ROLE_USER: 'User',
    };
    return labels[role as keyof typeof labels] || role;
  };

  if (authLoading || !isAdmin) {
    return null;
  }

  return (
    <AdminLayout>
      <div className="p-6 max-w-[1600px] mx-auto">
        {/* Header & Filters */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            {/* Search */}
            <div className="flex-1 max-w-md">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหา username, email, ชื่อ..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div className="flex items-center gap-3">
              <Filter className="h-5 w-5 text-gray-500" />
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              >
                <option value="">ทุก Role</option>
                <option value="ROLE_USER">User</option>
                <option value="ROLE_SELLER">Seller</option>
                <option value="ROLE_ADMIN">Admin</option>
              </select>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 flex gap-4 flex-wrap">
            <div className="px-4 py-2 bg-blue-50 rounded-lg">
              <span className="text-sm text-blue-700 font-medium">
                Total: <span className="font-bold">{users.length}</span>
              </span>
            </div>
            <div className="px-4 py-2 bg-red-50 rounded-lg">
              <span className="text-sm text-red-700 font-medium">
                Banned: <span className="font-bold">{users.filter(u => u.isBanned).length}</span>
              </span>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-500">กำลังโหลด...</p>
            </div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">ไม่พบผู้ใช้</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ผู้ใช้</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">ติดต่อ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">Role</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สถานะ</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-700">สร้างเมื่อ</th>
                    <th className="px-6 py-4 text-center text-sm font-semibold text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                            {user.username.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-900">{user.username}</p>
                            <p className="text-sm text-gray-500">
                              {user.firstName || user.lastName
                                ? `${user.firstName || ''} ${user.lastName || ''}`.trim()
                                : 'No name'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-4 w-4" />
                            {user.email}
                          </div>
                          {user.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-4 w-4" />
                              {user.phone}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-white text-xs font-semibold ${getRoleBadge(user.role)} shadow-lg`}>
                          <Shield className="h-3 w-3" />
                          {getRoleLabel(user.role)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        {user.isBanned ? (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold">
                            <UserX className="h-3 w-3" />
                            Banned
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                            <UserCheck className="h-3 w-3" />
                            Active
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          {new Date(user.createdAt).toLocaleDateString('th-TH')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex justify-center">
                          <div className="relative">
                            <button
                              onClick={() => setActionMenuOpen(actionMenuOpen === user.id ? null : user.id)}
                              className="p-2 hover:bg-gray-100 rounded-lg transition"
                            >
                              <MoreVertical className="h-5 w-5 text-gray-600" />
                            </button>

                            {actionMenuOpen === user.id && (
                              <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-200 z-10">
                                {user.isBanned ? (
                                  <button
                                    onClick={() => handleUnbanUser(user.id)}
                                    className="w-full px-4 py-3 text-left text-sm text-green-700 hover:bg-green-50 flex items-center gap-2 rounded-t-xl transition"
                                  >
                                    <CheckCircle2 className="h-4 w-4" />
                                    Unban User
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleBanUser(user.id)}
                                    className="w-full px-4 py-3 text-left text-sm text-red-700 hover:bg-red-50 flex items-center gap-2 rounded-t-xl transition"
                                  >
                                    <Ban className="h-4 w-4" />
                                    Ban User
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
