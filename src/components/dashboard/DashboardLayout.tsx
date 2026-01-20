import { ReactNode, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from '../ui/button';
import { GraduationCap, Users, School, Award, FileText, LogOut, Menu, X, User, DollarSign, QrCode, Settings } from 'lucide-react';
import ProtectedOverlay from './ProtectedOverlay';
import { useSettings } from '@/hooks/useSettings';
import { Badge } from '../ui/badge';

interface DashboardLayoutProps {
  children: ReactNode;
  onLogout: () => void;
  isVerified: boolean;
  userEmail: string;
  onVerify: () => void;
}

export default function DashboardLayout({ children, onLogout, isVerified, userEmail, onVerify }: DashboardLayoutProps) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { name: 'جميع الطلاب', icon: Users, path: '/dashboard/students' },
    { name: 'الفصول', icon: School, path: '/dashboard/classes' },
    { name: 'المراحل الدراسية', icon: Award, path: '/dashboard/grades' },
    { name: 'المدفوعات', icon: DollarSign, path: '/dashboard/payments' },
    { name: 'تقارير الحضور', icon: FileText, path: '/dashboard/reports' },
    { name: 'مسح QR', icon: QrCode, path: '/dashboard/qr-scanner' },
    { name: 'إعدادات المدرسة', icon: Settings, path: '/dashboard/settings' },
  ];

  const { settings } = useSettings();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:right-0 lg:flex lg:w-64 lg:flex-col bg-black border-l border-orange-500/20">
        <div className="flex flex-col flex-1 min-h-0">
          {/* Logo */}
          <div className="flex items-center h-16 flex-shrink-0 px-4 bg-black border-b border-orange-500/20">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-orange-500 p-2 rounded-lg shrink-0">
                <GraduationCap className="h-6 w-6 text-black" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-white font-bold text-sm leading-tight">منصة التعليم</span>
                <span className="text-orange-400 text-[10px] truncate leading-tight">{settings.school_name}</span>
              </div>
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path ||
                (item.path === '/dashboard/students' && location.pathname === '/dashboard');

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                    ? 'bg-orange-500 text-black'
                    : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                    }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="flex-shrink-0 border-t border-orange-500/20 p-4">
            <div className="flex items-center gap-3 mb-3 px-2">
              <div className="bg-orange-500 p-2 rounded-full">
                <User className="h-5 w-5 text-black" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">
                  {userEmail || 'المستخدم'}
                </p>
                <div className="flex items-center gap-2">
                  <p className={`text-[10px] ${isVerified ? 'text-green-400' : 'text-orange-400'}`}>
                    {isVerified ? 'حساب مفعل' : 'في انتظار التفعيل'}
                  </p>
                  {isVerified && (
                    <Badge variant="outline" className="text-[9px] py-0 h-4 border-orange-500/50 text-orange-400 bg-transparent">
                      {settings.subscription_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <Button
              onClick={onLogout}
              variant="outline"
              className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
            >
              <LogOut className="ml-2 h-4 w-4" />
              تسجيل الخروج
            </Button>
          </div>
        </div>
      </aside>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="lg:hidden">
          <div className="fixed inset-0 z-40 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="fixed inset-y-0 right-0 z-50 w-64 bg-black border-l border-orange-500/20 flex flex-col">
            <div className="flex items-center justify-between h-16 px-4 border-b border-orange-500/20">
              <Link to="/" className="flex items-center gap-2">
                <div className="bg-orange-500 p-2 rounded-lg shrink-0">
                  <GraduationCap className="h-6 w-6 text-black" />
                </div>
                <div className="flex flex-col min-w-0 text-right">
                  <span className="text-white font-bold text-sm leading-tight">منصة التعليم</span>
                  <span className="text-orange-400 text-[10px] truncate leading-tight">{settings.school_name}</span>
                </div>
              </Link>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path ||
                  (item.path === '/dashboard/students' && location.pathname === '/dashboard');

                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                      ? 'bg-orange-500 text-black'
                      : 'text-gray-300 hover:bg-gray-900 hover:text-white'
                      }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="flex-shrink-0 border-t border-orange-500/20 p-4">
              <div className="flex items-center gap-3 mb-3 px-2">
                <div className="bg-orange-500 p-2 rounded-full">
                  <User className="h-5 w-5 text-black" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {userEmail || 'المستخدم'}
                  </p>
                  <p className={`text-xs ${isVerified ? 'text-green-400' : 'text-orange-400'}`}>
                    {isVerified ? 'حساب مفعل' : 'في انتظار التفعيل'}
                  </p>
                </div>
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-black"
              >
                <LogOut className="ml-2 h-4 w-4" />
                تسجيل الخروج
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="lg:pr-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-gray-200 h-16 flex items-center px-4 lg:px-8">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden ml-4 text-gray-600 hover:text-black"
          >
            <Menu className="h-6 w-6" />
          </button>

          <div className="flex-1">
            <h1 className="text-xl text-black">
              {menuItems.find(item =>
                location.pathname === item.path ||
                (item.path === '/dashboard/students' && location.pathname === '/dashboard')
              )?.name || 'لوحة التحكم'}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {!isVerified && (
              <span className="hidden sm:inline-block text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-full">
                يرجى تفعيل حسابك
              </span>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>

      {/* Protected Overlay */}
      {!isVerified && (
        <ProtectedOverlay
          email={userEmail}
          onVerify={onVerify}
        />
      )}
    </div>
  );
}
