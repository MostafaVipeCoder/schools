import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
    label: string;
    value: number | string;
    change?: number;
    icon: LucideIcon;
    color: 'orange' | 'green' | 'red' | 'blue';
    suffix?: string;
}

export default function KPICard({ label, value, change, icon: Icon, color, suffix = '' }: KPICardProps) {
    const colorClasses = {
        orange: 'text-orange-500 bg-orange-50',
        green: 'text-green-500 bg-green-50',
        red: 'text-red-500 bg-red-50',
        blue: 'text-blue-500 bg-blue-50',
    };

    const changeColor = change && change > 0 ? 'text-green-600' : change && change < 0 ? 'text-red-600' : 'text-gray-600';

    return (
        <Card className="bg-white border-gray-200 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">{label}</CardTitle>
                <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
                    <Icon className="h-5 w-5" />
                </div>
            </CardHeader>
            <CardContent>
                <div className="text-3xl font-bold text-gray-900">
                    {value}{suffix}
                </div>
                {change !== undefined && (
                    <p className={`text-xs mt-1 flex items-center gap-1 ${changeColor}`}>
                        {change > 0 ? '↑' : change < 0 ? '↓' : '→'} {Math.abs(change)}%
                        <span className="text-gray-500">عن الشهر الماضي</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
