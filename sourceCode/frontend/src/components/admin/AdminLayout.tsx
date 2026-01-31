'use client';

import { ReactNode, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard,
  Users,
  Store,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from 'lucide-react';

interface MenuItem {
  name: string;
  icon: any;
  href: string;
  badge?: number;
}

interface AdminLayoutProps {
  children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const menuItems: MenuItem[] = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin/dashboard' },
    { name: 'User Management', icon: Users, href: '/admin/users' },
    { name: 'Shop Management', icon: Store, href: '/admin/shops' },
    { name: 'Settings', icon: Settings, href: '/admin/settings' },
  ];

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-72' : 'w-20'
        } bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white transition-all duration-300 flex flex-col shadow-2xl relative`}
      >
        {/* Decorative gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 pointer-events-none"></div>

        {/* Logo & Toggle */}
        <div className="h-20 flex items-center justify-between px-5 border-b border-white/10 relative z-10">
          {sidebarOpen && (
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Admin Panel
                </h1>
                <p className="text-xs text-gray-400">ระบบจัดการ</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50 mx-auto">
              <Shield className="w-6 h-6 text-white" />
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className={`p-2.5 rounded-lg hover:bg-white/10 transition-all hover:scale-110 ${!sidebarOpen && 'absolute -right-3 top-1/2 -translate-y-1/2 bg-slate-800 shadow-lg'}`}
          >
            {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto relative z-10">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative overflow-hidden ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : 'text-gray-300 hover:bg-white/5 hover:text-white hover:scale-105'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-xl"></div>
                )}
                <div className={`relative z-10 ${isActive ? 'scale-110' : 'group-hover:scale-110'} transition-transform`}>
                  <Icon size={22} className="flex-shrink-0" strokeWidth={isActive ? 2.5 : 2} />
                </div>
                {sidebarOpen && (
                  <>
                    <span className={`flex-1 font-semibold relative z-10 ${isActive ? 'text-white' : 'text-gray-300 group-hover:text-white'}`}>
                      {item.name}
                    </span>
                    {item.badge && (
                      <span className="relative z-10 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow-lg shadow-red-500/50 animate-pulse">
                        {item.badge}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && item.badge && (
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Info & Logout */}
        <div className="p-4 border-t border-white/10 space-y-3 relative z-10">
          {sidebarOpen && (
            <div className="px-4 py-3 bg-gradient-to-br from-white/5 to-white/10 rounded-xl border border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {user?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-400">ผู้ดูแลระบบ</p>
                  <p className="font-semibold truncate text-white">{user?.username}</p>
                </div>
              </div>
              <p className="text-xs text-gray-400 truncate bg-black/20 px-2 py-1 rounded">{user?.email}</p>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg mx-auto">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-4 py-3 text-gray-300 hover:bg-gradient-to-r hover:from-red-600 hover:to-pink-600 hover:text-white rounded-xl transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-red-500/30 group ${
              !sidebarOpen && 'justify-center'
            }`}
          >
            <LogOut size={20} className="group-hover:rotate-12 transition-transform" />
            {sidebarOpen && <span className="font-semibold">ออกจากระบบ</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-20 bg-white/80 backdrop-blur-xl border-b border-gray-200/50 flex items-center justify-between px-8 shadow-sm">
          <div>
            <div className="flex items-center gap-3">
              {menuItems.find((item) => item.href === pathname)?.icon && (
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                  {(() => {
                    const Icon = menuItems.find((item) => item.href === pathname)?.icon;
                    return Icon ? <Icon className="w-5 h-5 text-white" strokeWidth={2.5} /> : null;
                  })()}
                </div>
              )}
              <div>
                <h2 className="text-2xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                  {menuItems.find((item) => item.href === pathname)?.name || 'Admin Dashboard'}
                </h2>
                <p className="text-sm text-gray-500">จัดการและควบคุมระบบ E-Commerce</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right px-4 py-2 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
              <p className="text-sm font-semibold text-gray-800">{user?.username}</p>
              <p className="text-xs text-gray-500 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent font-medium">
                {user?.role}
              </p>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </main>
      </div>
    </div>
  );
}
