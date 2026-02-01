import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserPlus, DollarSign, CheckCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ar } from 'date-fns/locale';

interface Activity {
    id: string;
    type: 'student' | 'payment' | 'attendance' | 'alert';
    title: string;
    description: string;
    timestamp: Date;
}

export default function RecentActivity() {
    // Mock data - في التطبيق الحقيقي، سيتم جلب هذه البيانات من API
    const activities: Activity[] = [
        {
            id: '1',
            type: 'student',
            title: 'طالب جديد',
            description: 'تم إضافة أحمد محمد إلى الصف 1-أ',
            timestamp: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
        },
        {
            id: '2',
            type: 'payment',
            title: 'دفعة جديدة',
            description: 'تم استلام دفعة 500 جنيه من فاطمة علي',
            timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
            id: '3',
            type: 'attendance',
            title: 'تسجيل حضور',
            description: 'تم تسجيل حضور 45 طالب في الصف 2-ب',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
        },
        {
            id: '4',
            type: 'alert',
            title: 'تنبيه',
            description: '3 طلاب لديهم مدفوعات متأخرة',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
        },
    ];

    const getIcon = (type: Activity['type']) => {
        switch (type) {
            case 'student':
                return <UserPlus className="h-5 w-5 text-orange-500" />;
            case 'payment':
                return <DollarSign className="h-5 w-5 text-green-500" />;
            case 'attendance':
                return <CheckCircle className="h-5 w-5 text-blue-500" />;
            case 'alert':
                return <AlertCircle className="h-5 w-5 text-red-500" />;
        }
    };

    const getBgColor = (type: Activity['type']) => {
        switch (type) {
            case 'student':
                return 'bg-orange-50';
            case 'payment':
                return 'bg-green-50';
            case 'attendance':
                return 'bg-blue-50';
            case 'alert':
                return 'bg-red-50';
        }
    };

}
