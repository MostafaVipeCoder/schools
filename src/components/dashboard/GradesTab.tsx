import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { GraduationCap, BookOpen, AlertCircle, FileBarChart, Trophy } from 'lucide-react';

export default function GradesTab() {
    // Mock Data for UI Visualization
    const grades = [
        { id: 1, subject: 'الرياضيات', exam: 'منتصف الفصل', score: 45, maxScore: 50, date: '2023-10-15', status: 'pass' },
        { id: 2, subject: 'العلوم', exam: 'منتصف الفصل', score: 42, maxScore: 50, date: '2023-10-18', status: 'pass' },
        { id: 3, subject: 'اللغة العربية', exam: 'منتصف الفصل', score: 38, maxScore: 50, date: '2023-10-20', status: 'pass' },
        { id: 4, subject: 'اللغة الإنجليزية', exam: 'منتصف الفصل', score: 22, maxScore: 50, date: '2023-10-22', status: 'fail' }, // Low score example
        { id: 5, subject: 'الدراسات الاجتماعية', exam: 'منتصف الفصل', score: 48, maxScore: 50, date: '2023-10-25', status: 'excellent' },
    ];

    // Card Stats
    const stats = {
        gpa: '3.8',
        average: '78%',
        failed: 1,
        examsCount: 5
    };

    const getGradeColor = (status: string) => {
        if (status === 'excellent') return 'bg-green-100 text-green-700 border-green-200';
        if (status === 'pass') return 'bg-blue-50 text-blue-700 border-blue-200';
        if (status === 'fail') return 'bg-red-50 text-red-700 border-red-200';
        return 'bg-gray-100 text-gray-700';
    };

    return (
        <div className="space-y-6">
            {/* 1. Academic Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-purple-50 border-purple-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <span className="text-4xl font-bold text-purple-700 block mb-1">{stats.average}</span>
                            <span className="text-sm text-purple-800 font-medium">المعدل العام</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-purple-100 flex items-center justify-center border border-purple-200">
                            <Trophy className="h-6 w-6 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">عدد الاختبارات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-700">{stats.examsCount}</span>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <FileBarChart className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">اختبار تم رصده</p>
                    </CardContent>
                </Card>

                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">مواد بحاجة لمتابعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-red-600">{stats.failed}</span>
                            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">راسب / ضعيف</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Grades Table */}
            <Card className="w-full bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-gray-500" />
                            سجل الدرجات
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4 border-b">المادة</th>
                                    <th className="p-4 border-b">الاختبار</th>
                                    <th className="p-4 border-b">الدرجة</th>
                                    <th className="p-4 border-b">النسبة</th>
                                    <th className="p-4 border-b">التقييم</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {grades.map((grade) => {
                                    const percentage = (grade.score / grade.maxScore) * 100;
                                    return (
                                        <tr key={grade.id} className="hover:bg-gray-50/50 transition-colors">
                                            <td className="p-4 text-gray-900 font-medium flex items-center gap-2">
                                                <BookOpen className="h-4 w-4 text-gray-400" />
                                                {grade.subject}
                                            </td>
                                            <td className="p-4 text-gray-600">
                                                {grade.exam}
                                                <span className="block text-xs text-gray-400 mt-0.5">{grade.date}</span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-800">
                                                {grade.score} <span className="text-gray-400 font-normal text-xs">/ {grade.maxScore}</span>
                                            </td>
                                            <td className="p-4 w-32">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium w-8">{percentage.toFixed(0)}%</span>
                                                    <Progress value={percentage} className="h-1.5 flex-1" indicatorClassName={percentage < 50 ? 'bg-red-500' : percentage >= 90 ? 'bg-green-500' : 'bg-blue-500'} />
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <Badge variant="outline" className={`${getGradeColor(grade.status)} shadow-none border`}>
                                                    {grade.status === 'excellent' ? 'ممتاز' : grade.status === 'pass' ? 'ناجح' : 'راسب'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
