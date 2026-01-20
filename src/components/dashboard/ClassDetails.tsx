import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Search, Plus, Edit, Trash2, UserPlus, Check, X, ArrowRight, QrCode, UserCheck, UserX } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '../ui/pagination';
import StudentQRCode from './StudentQRCode';
import { useStudents } from '../../hooks/useStudents';
import { useClasses } from '../../hooks/useClasses';
import { useAttendance } from '../../hooks/useAttendance';
import { type Student as StudentType } from '../../services/studentService';
import { cn } from '../ui/utils';

interface Student extends StudentType {
    classes?: {
        id: string;
        name: string;
        grade_level: string;
        stage?: string;
    };
}

export default function ClassDetails() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { students: allStudents, isLoading: isStudentsLoading, addStudent, updateStudent, deleteStudent } = useStudents();
    const { classes, isLoading: isClassesLoading } = useClasses();
    const { attendance, isLoading: isAttendanceLoading, markAttendance } = useAttendance();

    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 10;

    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        email: '',
        class_id: id || '',
        guardian_name: '',
        guardian_phone: '',
        payment_status: 'regular' as 'regular' | 'exempt'
    });

    const selectedClass = useMemo(() => classes.find(c => c.id === id), [classes, id]);

    const classStudents = useMemo(() =>
        (allStudents as Student[]).filter(s => s.class_id === id),
        [allStudents, id]
    );

    const todayStr = new Date().toISOString().split('T')[0];
    const todayAttendance = useMemo(() =>
        attendance.filter(a => a.date === todayStr),
        [attendance, todayStr]
    );

    const stats = useMemo(() => {
        const total = classStudents.length;
        const present = classStudents.filter(s =>
            todayAttendance.some(a => a.student_id === s.id && a.present)
        ).length;
        const absent = total - present;
        const percentage = total > 0 ? (present / total) * 100 : 0;

        return { total, present, absent, percentage };
    }, [classStudents, todayAttendance]);

    const filteredStudents = classStudents.filter(student =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (student.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        student.phone.includes(searchTerm) ||
        (student.guardian_name || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
    const currentStudents = filteredStudents.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const handleAddStudent = async () => {
        if (!formData.name || !formData.phone || !formData.guardian_name || !formData.guardian_phone) {
            toast.error('الرجاء ملء جميع الحقول المطلوبة');
            return;
        }

        try {
            await addStudent({
                ...formData,
                email: formData.email || undefined,
                class_id: id,
            });

            setIsAddDialogOpen(false);
            resetForm();
        } catch (error) {
            console.error(error);
        }
    };

    const handleEditStudent = async () => {
        if (!selectedStudent || !selectedStudent.id) return;

        try {
            await updateStudent({
                id: selectedStudent.id,
                data: {
                    ...formData,
                    email: formData.email || undefined,
                    class_id: formData.class_id || id,
                }
            });

            setIsEditDialogOpen(false);
        } catch (error) {
            console.error(error);
        }
    };

    const handleDeleteStudent = async (studentId: string) => {
        if (window.confirm('هل أنت متأكد من حذف هذا الطالب؟')) {
            try {
                await deleteStudent(studentId);
            } catch (error) {
                console.error(error);
            }
        }
    };

    const handleToggleAttendance = async (studentId: string, currentPresent: boolean) => {
        try {
            await markAttendance({
                student_id: studentId,
                date: todayStr,
                present: !currentPresent,
                notes: 'تحديث يدوي من صفحة الفصل'
            });
            toast.success(!currentPresent ? 'تم تسجيل الحضور' : 'تم تسجيل الغياب');
        } catch (error) {
            console.error(error);
            toast.error('حدث خطأ أثناء تحديث الحضور');
        }
    };

    const resetForm = () => {
        setFormData({
            name: '',
            phone: '',
            email: '',
            class_id: id || '',
            guardian_name: '',
            guardian_phone: '',
            payment_status: 'regular'
        });
    };

    const openEditDialog = (student: Student) => {
        setSelectedStudent(student);
        setFormData({
            name: student.name,
            phone: student.phone,
            email: student.email || '',
            class_id: student.class_id || id || '',
            guardian_name: student.guardian_name,
            guardian_phone: student.guardian_phone,
            payment_status: student.payment_status
        });
        setIsEditDialogOpen(true);
    };

    if (isStudentsLoading || isClassesLoading || isAttendanceLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
                    <p className="text-gray-600">جاري تحميل البيانات...</p>
                </div>
            </div>
        );
    }

    if (!selectedClass) {
        return (
            <div className="text-center py-12">
                <h2 className="text-xl font-bold mb-4">الفصل غير موجود</h2>
                <Button onClick={() => navigate('/dashboard/classes')}>العودة للفصول</Button>
            </div>
        );
    }

    return (
        <div className="space-y-6" dir="rtl">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard/classes')}>
                        <ArrowRight className="h-5 w-5" />
                    </Button>
                    <div>
                        <h2 className="text-2xl font-bold text-black mb-1">
                            {selectedClass.name} - {selectedClass.grade_level}
                        </h2>
                        <p className="text-gray-600">طلاب الفصل وإحصائيات الحضور</p>
                    </div>
                </div>
                <Button onClick={() => { resetForm(); setIsAddDialogOpen(true); }} className="bg-orange-500 hover:bg-orange-600 text-black">
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة طالب للفصل
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>إجمالي الطلاب</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.total}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-green-600">
                        <CardDescription className="text-green-600">حاضر اليوم</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.present}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2 text-red-600">
                        <CardDescription className="text-red-600">غائب اليوم</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.absent}</CardTitle>
                    </CardHeader>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardDescription>نسبة الحضور</CardDescription>
                        <CardTitle className="text-3xl font-bold">{stats.percentage.toFixed(1)}%</CardTitle>
                    </CardHeader>
                </Card>
            </div>

            {/* Search & Table */}
            <Card>
                <CardHeader className="pb-0 pt-6 px-6">
                    <div className="relative">
                        <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="ابحث عن طالب..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pr-10"
                        />
                    </div>
                </CardHeader>
                <CardContent className="p-0 mt-4">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="text-right">اسم الطالب</TableHead>
                                    <TableHead className="text-right">ولي الأمر</TableHead>
                                    <TableHead className="text-right">رقم الهاتف</TableHead>
                                    <TableHead className="text-right">حالة الرسوم</TableHead>
                                    <TableHead className="text-right">حضور اليوم</TableHead>
                                    <TableHead className="text-center">الإجراءات</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {currentStudents.length > 0 ? (
                                    currentStudents.map((student) => {
                                        const isPresentToday = todayAttendance.some(a => a.student_id === student.id && a.present);
                                        return (
                                            <TableRow key={student.id}>
                                                <TableCell className="font-medium">{student.name}</TableCell>
                                                <TableCell>{student.guardian_name}</TableCell>
                                                <TableCell dir="ltr" className="text-right">{student.phone}</TableCell>
                                                <TableCell>
                                                    <Badge variant={student.payment_status === 'regular' ? 'default' : 'secondary'}>
                                                        {student.payment_status === 'regular' ? 'منتظم' : 'معفى'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Button
                                                            size="sm"
                                                            variant={isPresentToday ? "default" : "outline"}
                                                            className={cn(
                                                                "h-8 flex-1 gap-1",
                                                                isPresentToday ? "bg-green-600 hover:bg-green-700 text-white" : "text-gray-500 hover:text-green-600 border-gray-200"
                                                            )}
                                                            onClick={() => handleToggleAttendance(student.id!, isPresentToday)}
                                                        >
                                                            <UserCheck className="h-3.5 w-3.5" />
                                                            {isPresentToday ? "حاضر" : "تسجيل حضور"}
                                                        </Button>
                                                        {isPresentToday && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                className="h-8 w-8 p-0 text-red-500 hover:text-red-600 border-red-100 hover:bg-red-50"
                                                                onClick={() => handleToggleAttendance(student.id!, true)}
                                                                title="تسجيل غياب"
                                                            >
                                                                <UserX className="h-4 w-4" />
                                                            </Button>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="ghost" size="icon" onClick={() => openEditDialog(student)}>
                                                            <Edit className="h-4 w-4 text-blue-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => { setSelectedStudent(student); setIsQRDialogOpen(true); }}>
                                                            <QrCode className="h-4 w-4 text-purple-500" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" onClick={() => handleDeleteStudent(student.id || '')}>
                                                            <Trash2 className="h-4 w-4 text-red-500" />
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })
                                ) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                                            لا توجد نتائج
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="p-4 border-t">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                            className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                                        <PaginationItem key={page}>
                                            <PaginationLink
                                                isActive={currentPage === page}
                                                onClick={() => setCurrentPage(page)}
                                                className="cursor-pointer"
                                            >
                                                {page}
                                            </PaginationLink>
                                        </PaginationItem>
                                    ))}
                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                            className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Add Student Dialog */}
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>إضافة طالب جديد للفصل</DialogTitle>
                        <DialogDescription>
                            أدخل بيانات الطالب الجديد أدناه. سيتم تعيينه لهذا الفصل تلقائياً.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">اسم الطالب *</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="الاسم الثلاثي"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">رقم الهاتف *</Label>
                                <Input
                                    id="phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">البريد الإلكتروني</Label>
                            <Input
                                id="email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="example@email.com"
                                dir="ltr"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="guardianName">اسم ولي الأمر *</Label>
                                <Input
                                    id="guardianName"
                                    value={formData.guardian_name}
                                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                    placeholder="اسم ولي الأمر"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="guardianPhone">هاتف ولي الأمر *</Label>
                                <Input
                                    id="guardianPhone"
                                    value={formData.guardian_phone}
                                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                    placeholder="05xxxxxxxx"
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="paymentStatus">حالة الرسوم</Label>
                            <Select
                                value={formData.payment_status}
                                onValueChange={(value: 'regular' | 'exempt') => setFormData({ ...formData, payment_status: value })}
                            >
                                <SelectTrigger id="paymentStatus">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="regular">منتظم</SelectItem>
                                    <SelectItem value="exempt">معفى</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleAddStudent} className="bg-orange-500 hover:bg-orange-600 text-black">
                            حفظ الطالب
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Student Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" onInteractOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>تعديل بيانات الطالب</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">اسم الطالب *</Label>
                                <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-phone">رقم الهاتف *</Label>
                                <Input
                                    id="edit-phone"
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-email">البريد الإلكتروني</Label>
                            <Input
                                id="edit-email"
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                dir="ltr"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianName">اسم ولي الأمر *</Label>
                                <Input
                                    id="edit-guardianName"
                                    value={formData.guardian_name}
                                    onChange={(e) => setFormData({ ...formData, guardian_name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-guardianPhone">هاتف ولي الأمر *</Label>
                                <Input
                                    id="edit-guardianPhone"
                                    value={formData.guardian_phone}
                                    onChange={(e) => setFormData({ ...formData, guardian_phone: e.target.value })}
                                    dir="ltr"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-paymentStatus">حالة الرسوم</Label>
                                <Select
                                    value={formData.payment_status}
                                    onValueChange={(value: 'regular' | 'exempt') => setFormData({ ...formData, payment_status: value })}
                                >
                                    <SelectTrigger id="edit-paymentStatus">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="regular">منتظم</SelectItem>
                                        <SelectItem value="exempt">معفى</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-class">الفصل</Label>
                                <Select
                                    value={formData.class_id}
                                    onValueChange={(value) => setFormData({ ...formData, class_id: value })}
                                >
                                    <SelectTrigger id="edit-class">
                                        <SelectValue placeholder="اختر الفصل" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls) => (
                                            <SelectItem key={cls.id} value={cls.id || ''}>
                                                {cls.name} ({cls.grade_level})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>إلغاء</Button>
                        <Button onClick={handleEditStudent} className="bg-orange-500 hover:bg-orange-600 text-black">
                            حفظ التغييرات
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* QR Code Dialog */}
            {selectedStudent && (
                <StudentQRCode
                    open={isQRDialogOpen}
                    onOpenChange={setIsQRDialogOpen}
                    student={{
                        id: selectedStudent.id || '',
                        name: selectedStudent.name,
                        classes: selectedStudent.classes,
                        phone: selectedStudent.phone
                    }}
                />
            )}
        </div>
    );
}
