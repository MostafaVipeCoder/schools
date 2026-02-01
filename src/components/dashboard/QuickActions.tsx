import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { UserPlus, CheckCircle, DollarSign, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'إضافة طالب',
            icon: UserPlus,
            color: 'bg-orange-500 hover:bg-orange-600',
            onClick: () => navigate('/dashboard/students'),
        },
        {
            label: 'تسجيل حضور',
            icon: CheckCircle,
            color: 'bg-green-500 hover:bg-green-600',
            onClick: () => navigate('/dashboard/qr-scanner'),
        },
        {
            label: 'إضافة دفعة',
            icon: DollarSign,
            color: 'bg-blue-500 hover:bg-blue-600',
            onClick: () => navigate('/dashboard/payments'),
        },
        {
            label: 'عرض التقارير',
            icon: FileText,
            color: 'bg-purple-500 hover:bg-purple-600',
            onClick: () => navigate('/dashboard/reports'),
        },
    ];

    return (
        <Card className="bg-white border-gray-200">
            <CardHeader>
                <CardTitle className="text-lg text-gray-900">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {actions.map((action) => {
                        const Icon = action.icon;
                        return (
                            <Button
                                key={action.label}
                                onClick={action.onClick}
                                className={`${action.color} text-white flex flex-col items-center gap-2 h-auto py-4 transition-transform hover:scale-105`}
                            >
                                <Icon className="h-6 w-6" />
                                <span className="text-sm">{action.label}</span>
                            </Button>
                        );
                    })}
                </div>
            </CardContent>
        </Card>
    );
}
