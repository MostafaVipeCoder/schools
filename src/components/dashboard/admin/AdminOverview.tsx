import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { Users, GraduationCap, DollarSign, School, TrendingUp } from 'lucide-react';
import { adminService } from '../../../services/adminService';
import type { AdminStats } from '../../../types';

export default function AdminOverview() {
    const [stats, setStats] = useState<AdminStats | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const [dbHealth, setDbHealth] = useState<{ status: 'healthy' | 'unhealthy', latency: number } | null>(null);

    useEffect(() => {
        adminService.getGlobalStats()
            .then(setStats)
            .finally(() => setIsLoading(false));

        const checkHealth = () => {
            adminService.checkDatabaseHealth().then(result => setDbHealth(result as { status: 'healthy' | 'unhealthy', latency: number }));
        };

        checkHealth();
        const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, []);

    if (isLoading) {
        return <div className="animate-pulse space-y-4">
            <div className="h-32 bg-gray-200 rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => <div key={i} className="h-24 bg-gray-200 rounded-lg"></div>)}
            </div>
        </div>;
    }

    return (
        <div className="space-y-6 text-right" dir="rtl">
            <div>
                <h2 className="text-2xl font-bold text-gray-900">نظرة عامة على النظام</h2>
                <p className="text-gray-500 text-sm">إحصائيات حية لجميع المدارس والمستخدمين</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="bg-white border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي المدارس</CardTitle>
                        <School className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalSchools || 0}</div>
                        <p className="text-xs text-gray-500">منصة نشطة</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي الطلاب</CardTitle>
                        <GraduationCap className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalStudents || 0}</div>
                        <p className="text-xs text-gray-500">طالب مضاف</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">إجمالي المستخدمين</CardTitle>
                        <Users className="h-4 w-4 text-orange-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</div>
                        <p className="text-xs text-gray-500">حساب مسجل</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-orange-500/20 shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">الدخل الشهري المتوقع</CardTitle>
                        <DollarSign className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">{stats?.monthlyRevenue || 0} جنية</div>
                        <p className="text-xs text-green-500 flex items-center gap-1">
                            <TrendingUp className="h-3 w-3" />
                            بناءً على الباقات الحالية
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader>
                        <CardTitle className="text-gray-900">حالة النظام</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className={`h-3 w-3 rounded-full ${dbHealth?.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}></div>
                                <span className="text-gray-700 font-medium">
                                    {dbHealth?.status === 'healthy' ? 'اتصال قاعدة البيانات مستقر' : 'يوجد مشاكل في الاتصال'}
                                </span>
                            </div>
                            {dbHealth && (
                                <span className="text-xs text-gray-500 dir-ltr font-mono">
                                    {dbHealth.latency}ms
                                </span>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
