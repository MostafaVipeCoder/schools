import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Calendar } from '../ui/calendar'; // Assuming existing component or we use raw div if detailed needed
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { format, isSameDay, parseISO, getDay } from 'date-fns';
import { ar } from 'date-fns/locale';
import { CheckCircle2, XCircle, Clock, History, AlertCircle } from 'lucide-react';
import type { Attendance } from '../../services/attendanceService';
import type { Class } from '../../types';

const DAYS_MAP: Record<number, string> = {
    0: 'Sunday',
    1: 'Monday',
    2: 'Tuesday',
    3: 'Wednesday',
    4: 'Thursday',
    5: 'Friday',
    6: 'Saturday',
};
interface AttendanceTabProps {
    attendanceRecords: Attendance[];
    studentClass?: Class;
    stats: {
        total: number;
        present: number;
        rate: number;
        classRate: number;
    };
}

export default function AttendanceTab({ attendanceRecords, stats, studentClass }: AttendanceTabProps) {
    // Helper to get status for a specific day
    const getDayStatus = (day: Date) => {
        const record = attendanceRecords.find(a => isSameDay(parseISO(a.date), day));
        if (!record) return null;
        return record.present ? 'present' : 'absent';
    };

    const isUnscheduled = (dateStr: string) => {
        if (!studentClass || studentClass.attendance_type !== 'scheduled') return false;
        const date = parseISO(dateStr);
        const dayName = DAYS_MAP[getDay(date)];
        return !studentClass.attendance_days?.includes(dayName);
    };

    return (
        <div className="space-y-6">
            {/* 1. Performance Summary Stats (Top Row) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-orange-50 border-orange-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <span className="text-4xl font-bold text-orange-600 block mb-1">{stats.rate.toFixed(0)}%</span>
                            <span className="text-sm text-gray-600">نسبة الحضور العامة</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center">
                            <Clock className="h-6 w-6 text-orange-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">تفاصيل الحضور</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>أيام الحضور</span>
                                <span className="font-bold text-green-600">{stats.present} يوم</span>
                            </div>
                            <Progress value={stats.rate} className="h-2 bg-gray-100" indicatorClassName="bg-green-500" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">تفاصيل الغياب</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                                <span>أيام الغياب</span>
                                <span className="font-bold text-red-600">{stats.total - stats.present} يوم</span>
                            </div>
                            <Progress value={((stats.total - stats.present) / (stats.total || 1)) * 100} className="h-2 bg-gray-100" indicatorClassName="bg-red-500" />
                        </div>
                    </CardContent>
                </Card>
            </div>


            {/* 2. Attendance Log (Table View - Google Sheets Style) */}
            <Card className="w-full bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <History className="h-5 w-5 text-gray-500" />
                            سجل الحضور اليومي
                        </CardTitle>
                        <Badge variant="outline" className="text-gray-500 font-normal">
                            {attendanceRecords.length} سجل
                        </Badge>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4 border-b">اليوم</th>
                                    <th className="p-4 border-b">التاريخ</th>
                                    <th className="p-4 border-b">الحالة</th>
                                    <th className="p-4 border-b">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {attendanceRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-900 font-medium">
                                            {format(parseISO(record.date), 'EEEE', { locale: ar })}
                                        </td>
                                        <td className="p-4 text-gray-600 font-mono text-xs md:text-sm">
                                            {record.date}
                                        </td>
                                        <td className="p-4">
                                            <Badge
                                                variant={record.present ? 'outline' : 'destructive'}
                                                className={`
                                                    ${record.present
                                                        ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100'
                                                        : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}
                                                    shadow-none font-normal
                                                `}
                                            >
                                                {record.present ? (
                                                    <span className="flex items-center gap-1.5">
                                                        <CheckCircle2 className="h-3.5 w-3.5" />
                                                        حاضر
                                                    </span>
                                                ) : (
                                                    <span className="flex items-center gap-1.5">
                                                        <XCircle className="h-3.5 w-3.5" />
                                                        غائب
                                                    </span>
                                                )}
                                            </Badge>
                                            {isUnscheduled(record.date) && record.present && (
                                                <Badge
                                                    variant="secondary"
                                                    className="mr-2 bg-purple-50 text-purple-700 border-purple-200 text-[10px] py-0 h-5"
                                                >
                                                    <AlertCircle className="h-3 w-3 ml-1" />
                                                    يوم إضافي
                                                </Badge>
                                            )}
                                        </td>
                                        <td className="p-4 text-gray-500 max-w-xs truncate">
                                            {record.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {attendanceRecords.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="p-8 text-center text-gray-500">
                                            لا توجد سجلات مسجلة لهذا الطالب حتى الآن
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
