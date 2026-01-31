'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { ShopProvider, useShop } from '@/contexts/ShopContext';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Star,
  Store,
  LogOut,
  Menu,
  X,
  Home,
  MessageCircle
} from 'lucide-react';
import { useState } from 'react';

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isSeller, logout, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    // Only redirect after loading is complete and user is not authenticated
    if (!loading && (!user || !isSeller)) {
      router.push('/login');
    }
  }, [user, isSeller, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto mb-4"></div>
          <p className="text-white text-lg font-medium">กำลังตรวจสอบสิทธิ์...</p>
        </div>
      </div>
    );
  }

  // After loading, if not authenticated, return null (will redirect)
  if (!user || !isSeller) {
    return null;
  }

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <ShopProvider>
      <SellerLayoutContent
        user={user}
        pathname={pathname}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      >
        {children}
      </SellerLayoutContent>
    </ShopProvider>
  );
}

function SellerLayoutContent({
  user,
  pathname,
  sidebarOpen,
  setSidebarOpen,
  handleLogout,
  children
}: {
  user: any;
  pathname: string;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  handleLogout: () => void;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { shop, loading: shopLoading } = useShop();

  // Navigation items when user has a shop
  const navItemsWithShop = [
    {
      name: 'แดชบอร์ด',
      href: '/seller/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'จัดการสินค้า',
      href: '/seller/products',
      icon: Package,
    },
    {
      name: 'คำสั่งซื้อ',
      href: '/seller/order',
      icon: ShoppingBag,
    },
    {
      name: 'แชทกับลูกค้า',
      href: '/seller/chat',
      icon: MessageCircle,
    },
    {
      name: 'รีวิว',
      href: '/seller/reviews',
      icon: Star,
    },
    {
      name: 'ร้านค้า',
      href: '/seller/shop',
      icon: Store,
    },
  ];

  // Navigation items when user doesn't have a shop yet
  const navItemsWithoutShop = [
    {
      name: 'สร้างร้านค้า',
      href: '/seller/create-shop',
      icon: Store,
    },
  ];

  // Use appropriate nav items based on shop status
  const navItems = !shopLoading && shop ? navItemsWithShop : navItemsWithoutShop;

  const NavLink = ({ item }: { item: typeof navItems[0] }) => {
    const isActive = pathname === item.href;
    const Icon = item.icon;

    return (
      <button
        onClick={() => {
          router.push(item.href);
          setSidebarOpen(false);
        }}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all ${
          isActive
            ? 'bg-white text-blue-600 shadow-lg'
            : 'text-white/80 hover:bg-white/10 hover:text-white'
        }`}
      >
        <Icon className="h-5 w-5" />
        <span>{item.name}</span>
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-purple-600 to-pink-500">
        {/* Mobile Header */}
        <div className="lg:hidden fixed top-0 left-0 right-0 bg-white/10 backdrop-blur-md border-b border-white/20 z-50">
          <div className="flex items-center justify-between p-4">
            <h1 className="text-xl font-bold text-white">Seller Center</h1>
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20"
            >
              {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Sidebar Overlay (Mobile) */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 h-screen w-72 bg-gradient-to-b from-gray-900 to-gray-800 border-r border-white/10 shadow-2xl z-50 transition-transform duration-300 ${
            sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="p-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Store className="h-7 w-7 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-white">Seller Center</h1>
                  <p className="text-xs text-white/60">จัดการร้านค้าของคุณ</p>
                </div>
              </div>
            </div>

            {/* User Info */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 px-2">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username?.[0]?.toUpperCase() || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {user.username}
                  </p>
                  <p className="text-xs text-white/60 truncate">{user.email}</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              {navItems.map((item) => (
                <NavLink key={item.href} item={item} />
              ))}
            </nav>

            {/* Footer Buttons */}
            <div className="p-4 border-t border-white/10 space-y-2">
              <button
                onClick={() => router.push('/')}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-white/80 hover:bg-blue-500/20 hover:text-blue-400 transition-all"
              >
                <Home className="h-5 w-5" />
                <span>กลับหน้าหลัก</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-white/80 hover:bg-red-500/20 hover:text-red-400 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>ออกจากระบบ</span>
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content */}
        <main className="lg:ml-72 min-h-screen p-4 lg:p-8 pt-20 lg:pt-8">
          <div className="h-full">
            {children}
          </div>
        </main>
      </div>
  );
}
