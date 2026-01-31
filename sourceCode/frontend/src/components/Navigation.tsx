'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  ShoppingBag,
  User,
  LogOut,
  Settings,
  Store,
  Heart,
  ShoppingCart,
  Menu,
  X,
  MessageCircle,
} from 'lucide-react';

export default function Navigation() {
  const { user, logout, isAuthenticated, isSeller } = useAuth();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  const getImageUrl = (url: string | undefined) => {
    if (!url) return '';
    if (url.startsWith('http')) return url;
    if (url.startsWith('/')) {
      return `http://localhost:8080/api${url}`;
    }
    return url;
  };

  // Close profile menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Don't show navigation on auth pages and seller pages
  const hideNavigation = pathname?.startsWith('/login') ||
                         pathname?.startsWith('/register') ||
                         pathname?.startsWith('/forgot') ||
                         pathname?.startsWith('/seller');

  if (hideNavigation) {
    return null;
  }

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
              <ShoppingBag className="h-6 w-6 text-white" />
            </div>
            <span className="text-xl font-bold text-gray-900">E-Shop</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            {isAuthenticated ? (
              <>
                {/* Navigation Links */}
                <Link
                  href="/products"
                  className="text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  สินค้า
                </Link>
                <Link
                  href="/wishlist"
                  className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-1"
                >
                  <Heart className="h-5 w-5" />
                  <span>รายการโปรด</span>
                </Link>
                <Link
                  href="/cart"
                  className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-1"
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>ตะกร้า</span>
                </Link>
                <Link
                  href="/chat"
                  className="text-gray-700 hover:text-blue-600 font-medium transition flex items-center gap-1"
                >
                  <MessageCircle className="h-5 w-5" />
                  <span>แชท</span>
                </Link>

                {/* Seller Link */}
                {isSeller && (
                  <Link
                    href="/seller/dashboard"
                    className="flex items-center gap-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-medium hover:from-purple-700 hover:to-pink-700 transition"
                  >
                    <Store className="h-5 w-5" />
                    <span>ร้านค้าของฉัน</span>
                  </Link>
                )}

                {/* Profile Dropdown */}
                <div className="relative" ref={profileMenuRef}>
                  <button
                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                  >
                    <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center overflow-hidden">
                      {user?.profileImage ? (
                        <img
                          src={getImageUrl(user.profileImage)}
                          alt={user.username}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <span className="font-medium text-gray-900">{user?.username}</span>
                  </button>

                  {/* Dropdown Menu */}
                  {showProfileMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 py-2">
                      <div className="px-4 py-3 border-b border-gray-200">
                        <p className="text-sm font-medium text-gray-900">{user?.username}</p>
                        <p className="text-sm text-gray-500">{user?.email}</p>
                      </div>

                      <Link
                        href="/profile"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <User className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">โปรไฟล์</span>
                      </Link>

                      <Link
                        href="/orders"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <ShoppingBag className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">คำสั่งซื้อของฉัน</span>
                      </Link>

                      {!isSeller && (
                        <Link
                          href="/become-seller"
                          className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                          onClick={() => setShowProfileMenu(false)}
                        >
                          <Store className="h-5 w-5 text-gray-600" />
                          <span className="text-gray-700">เปิดร้านค้า</span>
                        </Link>
                      )}

                      <Link
                        href="/settings"
                        className="flex items-center gap-3 px-4 py-2 hover:bg-gray-50 transition"
                        onClick={() => setShowProfileMenu(false)}
                      >
                        <Settings className="h-5 w-5 text-gray-600" />
                        <span className="text-gray-700">ตั้งค่า</span>
                      </Link>

                      <hr className="my-2" />

                      <button
                        onClick={() => {
                          setShowProfileMenu(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 hover:bg-red-50 transition text-red-600"
                      >
                        <LogOut className="h-5 w-5" />
                        <span>ออกจากระบบ</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition"
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition"
                >
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition"
          >
            {showMobileMenu ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="md:hidden py-4 border-t border-gray-200">
            {isAuthenticated ? (
              <div className="space-y-2">
                <Link
                  href="/products"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  สินค้า
                </Link>
                <Link
                  href="/wishlist"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  รายการโปรด
                </Link>
                <Link
                  href="/cart"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  ตะกร้า
                </Link>
                <Link
                  href="/chat"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  แชท
                </Link>
                {isSeller && (
                  <Link
                    href="/seller/dashboard"
                    className="block px-4 py-2 bg-purple-50 text-purple-700 rounded-lg font-medium transition"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    ร้านค้าของฉัน
                  </Link>
                )}
                <hr className="my-2" />
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  โปรไฟล์
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  คำสั่งซื้อของฉัน
                </Link>
                {!isSeller && (
                  <Link
                    href="/become-seller"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    เปิดร้านค้า
                  </Link>
                )}
                <button
                  onClick={() => {
                    setShowMobileMenu(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                >
                  ออกจากระบบ
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <Link
                  href="/login"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-50 rounded-lg transition"
                  onClick={() => setShowMobileMenu(false)}
                >
                  เข้าสู่ระบบ
                </Link>
                <Link
                  href="/register"
                  className="block px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium text-center"
                  onClick={() => setShowMobileMenu(false)}
                >
                  สมัครสมาชิก
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
