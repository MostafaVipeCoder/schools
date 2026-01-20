import { useState, useMemo, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import {
    User,
    Calendar,
    ArrowRight,
    TrendingUp,
    AlertTriangle,
    Phone,
    Mail,
    GraduationCap,
    History,
    ShieldAlert,
    Eye
} from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useStudents } from '../../hooks/useStudents';
import { useAttendance } from '../../hooks/useAttendance';
import { useClasses } from '../../hooks/useClasses';
import { supabase } from '../../lib/supabase';
import { type Student } from '../../services/studentService';
import { type Attendance } from '../../services/attendanceService';
import { type Class } from '../../services/classService';

interface Suspension {
    id: string;
    student_id: string;
    duration_days: number;
    reason: string;
    start_date: string;
    created_at: string;
}

export default function StudentProfile() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    const { students: rawStudents, isLoading: isStudentsLoading, updateStudent } = useStudents();
    const students = rawStudents as Student[];

    const { attendance: rawAttendance, isLoading: isAttendanceLoading } = useAttendance();
    const attendance = rawAttendance as Attendance[];

    const { classes, isLoading: isClassesLoading } = useClasses();

    const [suspensions, setSuspensions] = useState<Suspension[]>([]);
    const [isSuspendDialogOpen, setIsSuspendDialogOpen] = useState(false);
    const [suspensionForm, setSuspensionForm] = useState({
        duration_days: 1,
        reason: '',
        status: 'suspended' as 'suspended' | 'expelled'
    });

    const student = useMemo(() => students.find((s: Student) => s.id === id), [students, id]);

    const studentAttendance = useMemo(() =>
        attendance.filter((a: Attendance) => a.student_id === id),
        [attendance, id]);

    const classAttendance = useMemo(() => {
        if (!student?.class_id) return [];
        const classmates = students.filter((s: Student) => s.class_id === student.class_id).map((s: Student) => s.id);
        return attendance.filter((a: Attendance) => classmates.includes(a.student_id));
    }, [attendance, student, students]);

    const stats = useMemo(() => {
        const total = studentAttendance.length;
        const present = studentAttendance.filter((a: Attendance) => a.present).length;
        const rate = total > 0 ? (present / total) * 100 : 0;

        // Class average
        const classTotal = classAttendance.length;
        const classPresent = classAttendance.filter((a: Attendance) => a.present).length;
        const classRate = classTotal > 0 ? (classPresent / classTotal) * 100 : 0;

        return { total, present, rate, classRate };
    }, [studentAttendance, classAttendance]);

    useEffect(() => {
        if (id) fetchSuspensions();
    }, [id]);

    const fetchSuspensions = async () => {
        try {
            const { data, error } = await supabase
                .from('suspensions')
                .select('*')
                .eq('student_id', id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setSuspensions(data);
            }
        } catch (error) {
            console.error('Error fetching suspensions:', error);
        }
    };

    const handleSuspend = async () => {
        if (!id || !student) return;
        try {
            // Update student status in DB
            await updateStudent({
                id,
                data: { status: suspensionForm.status }
            });

            // Log the suspension/expulsion
            const { error } = await supabase
                .from('suspensions')
                .insert([{
                    student_id: id,
                    duration_days: suspensionForm.status === 'expelled' ? 0 : suspensionForm.duration_days,
                    reason: suspensionForm.reason,
                    start_date: new Date().toISOString().split('T')[0]
                }]);

            if (error) throw error;

            toast.success(suspensionForm.status === 'expelled' ? 'تم فصل الطالب نهائياً' : 'تم وقف الطالب مؤقتاً');
            setIsSuspendDialogOpen(false);
            setSuspensionForm({ duration_days: 1, reason: '', status: 'suspended' });
            fetchSuspensions();
        } catch (error) {
            console.error(error);
            toast.error('فشل تنفيذ الإجراء. تأكد من وجود صلاحيات كافية.');
        }
    };

    const handleReactivate = async () => {
        if (!id) return;
        if (!window.confirm('هل أنت متأكد من إعادة تفعيل هذا الطالب؟')) return;

        try {
            await updateStudent({
                id,
                data: { status: 'active' }
            });
            toast.success('تم إعادة تفعيل الطالب بنجاح');
            fetchSuspensions();
        } catch (error) {
            console.error(error);
            toast.error('فشل في إعادة التفعيل');
        }
    };

    if (isStudentsLoading || isAttendanceLoading || isClassesLoading) {
        return <div className="p-8 text-center text-gray-500">جاري التحميل...</div>;
    }

    if (!student) {
        return (
            <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">الطالب غير موجود</p>
                <Button onClick={() => navigate('/dashboard/students')}>العودة لقائمة الطلاب</Button>
            </div>
        );
    }

    const studentClass = classes.find((c: Class) => c.id === student.class_id);

    return (
        <div className="space-y-6" dir="rtl">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/students')}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{student.name}</h1>
                        <p className="text-gray-500">{studentClass?.name || 'غير محدد'} - {studentClass?.grade_level || ''}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {student.status && student.status !== 'active' ? (
                        <Button
                            variant="default"
                            onClick={handleReactivate}
                            className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        >
                            <TrendingUp className="h-4 w-4" />
                            إعادة تفعيل الطالب
                        </Button>
                    ) : (
                        <Button
                            variant="destructive"
                            onClick={() => setIsSuspendDialogOpen(true)}
                            className="flex items-center gap-2"
                        >
                            <ShieldAlert className="h-4 w-4" />
                            إجراء فصل/وقف
                        </Button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Basic Info */}
                <Card className="lg:col-span-1">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <User className="h-5 w-5 text-orange-500" />
                            البيانات الأساسية
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-blue-50 rounded-lg">
                                <Phone className="h-4 w-4 text-blue-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">رقم الهاتف</p>
                                <p className="text-sm font-medium">{student.phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-50 rounded-lg">
                                <User className="h-4 w-4 text-green-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">ولي الأمر</p>
                                <p className="text-sm font-medium">{student.guardian_name}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-orange-50 rounded-lg">
                                <Phone className="h-4 w-4 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">هاتف ولي الأمر</p>
                                <p className="text-sm font-medium">{student.guardian_phone}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-50 rounded-lg">
                                <GraduationCap className="h-4 w-4 text-purple-500" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">حالة الرسوم</p>
                                <Badge variant={student.payment_status === 'regular' ? 'default' : 'secondary'}>
                                    {student.payment_status === 'regular' ? 'منتظم' : 'معفى'}
                                </Badge>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 pt-2 border-t border-gray-50">
                            <div className={`p-2 rounded-lg ${student.status === 'suspended' ? 'bg-yellow-50' : student.status === 'expelled' ? 'bg-red-50' : 'bg-green-50'}`}>
                                <ShieldAlert className={`h-4 w-4 ${student.status === 'suspended' ? 'text-yellow-600' : student.status === 'expelled' ? 'text-red-600' : 'text-green-600'}`} />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">حالة الطالب</p>
                                <Badge className={student.status === 'suspended' ? 'bg-yellow-500 hover:bg-yellow-600' : student.status === 'expelled' ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}>
                                    {student.status === 'suspended' ? 'موقوف مؤقتاً' : student.status === 'expelled' ? 'مفصول نهائياً' : 'مقيد بنشاط'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Analytics */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <TrendingUp className="h-5 w-5 text-green-500" />
                            تحليلات الحضور
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100">
                                <p className="text-sm text-gray-600 mb-1">نسبة حضور الطالب</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-orange-600">{stats.rate.toFixed(1)}%</span>
                                </div>
                                <Progress value={stats.rate} className="h-2 mt-2" />
                            </div>
                            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100">
                                <p className="text-sm text-gray-600 mb-1">متوسط حضور الفصل</p>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-bold text-gray-700">{stats.classRate.toFixed(1)}%</span>
                                </div>
                                <Progress value={stats.classRate} className="h-2 mt-2" />
                            </div>
                        </div>

                        <div className="flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                            <AlertTriangle className="h-4 w-4" />
                            {stats.rate >= stats.classRate
                                ? "أداء الطالب في الحضور أعلى من متوسط الفصل، أحسنت!"
                                : "حضور الطالب أقل من متوسط الفصل، يرجى المتابعة."}
                        </div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="attendance" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
                    <TabsTrigger value="attendance" className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        سجل الحضور
                    </TabsTrigger>
                    <TabsTrigger value="suspensions" className="flex items-center gap-2">
                        <History className="h-4 w-4" />
                        سجل القرارات ({suspensions.length})
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="attendance" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">آخر سجلات الحضور</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">التاريخ</TableHead>
                                        <TableHead className="text-right">الحالة</TableHead>
                                        <TableHead className="text-right">وقت التسجيل</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {studentAttendance.length > 0 ? (
                                        studentAttendance.slice(0, 10).map((record: Attendance) => (
                                            <TableRow key={record.id}>
                                                <TableCell>{record.date}</TableCell>
                                                <TableCell>
                                                    <Badge variant={record.present ? "default" : "destructive"}>
                                                        {record.present ? "حاضر" : "غائب"}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell dir="ltr">{record.created_at ? format(new Date(record.created_at), 'hh:mm a') : '-'}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={3} className="text-center text-gray-500 py-4">
                                                لا توجد سجلات حضور حالياً
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="suspensions" className="mt-4">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-md">سجل الفصل من المدرسة</CardTitle>
                            <CardDescription>عرض جميع قرارات الفصل السابقة والمدة والسبب</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead className="text-right">تاريخ البدء</TableHead>
                                        <TableHead className="text-right">المدة (أيام)</TableHead>
                                        <TableHead className="text-right">السبب</TableHead>
                                        <TableHead className="text-right">تاريخ القرار</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {suspensions.length > 0 ? (
                                        suspensions.map((s) => (
                                            <TableRow key={s.id}>
                                                <TableCell>{s.start_date}</TableCell>
                                                <TableCell>{s.duration_days}</TableCell>
                                                <TableCell className="max-w-[300px] truncate">{s.reason || '-'}</TableCell>
                                                <TableCell dir="ltr">{format(new Date(s.created_at), 'yyyy-MM-dd')}</TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center text-gray-500 py-4">
                                                لا يوجد سجل للفصل حالياً
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Suspend Dialog */}
            <Dialog open={isSuspendDialogOpen} onOpenChange={setIsSuspendDialogOpen}>
                <DialogContent className="sm:max-w-[425px]" onInteractOutside={(e: any) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>تسجيل قرار فصل طالب</DialogTitle>
                        <DialogDescription>
                            يرجى تحديد مدة الفصل وسبب هذا الإجراء الإداري للطالب {student.name}.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="status">نوع الإجراء *</Label>
                            <select
                                id="status"
                                className="w-full p-2 border rounded-md"
                                value={suspensionForm.status}
                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setSuspensionForm({ ...suspensionForm, status: e.target.value as any })}
                            >
                                <option value="suspended">وقف مؤقت (Suspension)</option>
                                <option value="expelled">فصل نهائي (Expulsion)</option>
                            </select>
                        </div>
                        {suspensionForm.status === 'suspended' && (
                            <div className="space-y-2">
                                <Label htmlFor="duration">مدة الوقف (بالأيام) *</Label>
                                <Input
                                    id="duration"
                                    type="number"
                                    min="1"
                                    value={suspensionForm.duration_days}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSuspensionForm({ ...suspensionForm, duration_days: parseInt(e.target.value) })}
                                />
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="reason">السبب *</Label>
                            <textarea
                                id="reason"
                                className="w-full p-2 border rounded-md h-24"
                                value={suspensionForm.reason}
                                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setSuspensionForm({ ...suspensionForm, reason: e.target.value })}
                                placeholder="مثال: مخالفة القواعد المدرسية أو عدم سداد الرسوم"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsSuspendDialogOpen(false)}>إلغاء</Button>
                        <Button
                            onClick={handleSuspend}
                            disabled={!suspensionForm.reason}
                            className={`${suspensionForm.status === 'expelled' ? 'bg-red-600 hover:bg-red-700' : 'bg-orange-600 hover:bg-orange-700'} text-white`}
                        >
                            تأكيد وحفظ الإجراء
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
