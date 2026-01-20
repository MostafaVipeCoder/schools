import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Search, Download, UserCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from '../ui/badge';
import StudentAttendanceReport from './StudentAttendanceReport';
import { useAttendance } from '../../hooks/useAttendance';
import { useStudents } from '../../hooks/useStudents';
import { format } from 'date-fns';

// UI Interface matching our table needs, derived from DB data
interface AttendanceRecord {
  id: string;
  studentName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  status: 'present' | 'absent' | 'late';
  class: string;
}

export default function Reports() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDate, setFilterDate] = useState('');
  const [filterStudent, setFilterStudent] = useState('all');
  const [filterClass, setFilterClass] = useState('all');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);

  const { attendance, isLoading: isAttendanceLoading } = useAttendance();
  const { students, isLoading: isStudentsLoading } = useStudents();

  // Transform Supabase data to UI format
  const formattedAttendance: AttendanceRecord[] = (attendance || []).map((record: any) => ({
    id: record.id,
    studentName: record.students?.name || 'Unknown',
    date: record.date,
    checkIn: record.created_at ? format(new Date(record.created_at), 'HH:mm') : '-',
    checkOut: '-',
    status: record.present ? 'present' : 'absent',
    class: record.students?.classes?.name || '-'
  }));

  const filteredAttendance = formattedAttendance.filter(record => {
    const matchesSearch = record.studentName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStudent = filterStudent === 'all' || record.studentName === filterStudent;
    const matchesClass = filterClass === 'all' || record.class === filterClass;
    const matchesDate = !filterDate || record.date === filterDate;

    return matchesSearch && matchesStudent && matchesClass && matchesDate;
  });

  const handleExportPDF = () => {
    toast.success('جاري تصدير التقرير إلى PDF... (ميزة تجريبية)');
  };

  const handleExportCSV = () => {
    toast.success('جاري تصدير التقرير إلى CSV... (ميزة تجريبية)');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'present':
        return <Badge className="bg-green-500">حاضر</Badge>;
      case 'late':
        return <Badge className="bg-yellow-500">متأخر</Badge>;
      case 'absent':
        return <Badge className="bg-red-500">غائب</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const presentCount = filteredAttendance.filter(a => a.status === 'present').length;
  const lateCount = filteredAttendance.filter(a => a.status === 'late').length;
  const absentCount = filteredAttendance.filter(a => a.status === 'absent').length;
  const attendanceRate = filteredAttendance.length > 0
    ? (((presentCount + lateCount) / filteredAttendance.length) * 100).toFixed(1)
    : '0';

  // Get unique students for filter
  const uniqueStudents = Array.from(new Set(formattedAttendance.map(a => a.studentName)));
  const uniqueClasses = Array.from(new Set(formattedAttendance.map(a => a.class).filter(c => c !== '-')));

  const handleStudentClick = (studentName: string) => {
    const student = students.find(s => s.name === studentName);
    if (student?.id) {
      setSelectedStudentId(student.id);
      setIsReportDialogOpen(true);
    }
  };

  // Find the actual student object for the report
  const selectedStudent = students.find(s => s.id === selectedStudentId) || null;

  if (isAttendanceLoading || isStudentsLoading) {
    return <div className="p-8 text-center">جاري تحميل التقارير...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl text-black mb-1">تقارير الحضور</h2>
          <p className="text-gray-600">عرض وتصدير تقارير حضور الطلاب</p>
        </div>
        <div className="flex items-center gap-2">
          <UserCheck className="h-6 w-6 text-orange-500" />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>إجمالي السجلات</CardDescription>
            <CardTitle className="text-3xl text-black">{filteredAttendance.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>الحضور</CardDescription>
            <CardTitle className="text-3xl text-green-600">{presentCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>التأخير</CardDescription>
            <CardTitle className="text-3xl text-yellow-600">{lateCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>الغياب</CardDescription>
            <CardTitle className="text-3xl text-red-600">{absentCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters and Export */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="ابحث عن طالب..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pr-10"
              />
            </div>
            <div>
              <Select value={filterStudent} onValueChange={setFilterStudent}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الطلاب" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الطلاب</SelectItem>
                  {uniqueStudents.map((student) => (
                    <SelectItem key={student} value={student}>
                      {student}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={filterClass} onValueChange={setFilterClass}>
                <SelectTrigger>
                  <SelectValue placeholder="جميع الصفوف" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الصفوف</SelectItem>
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                placeholder="التاريخ"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportPDF}
              >
                <Download className="ml-2 h-4 w-4" />
                PDF
              </Button>
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleExportCSV}
              >
                <Download className="ml-2 h-4 w-4" />
                CSV
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الحضور</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">نسبة الحضور الإجمالية</span>
              <span className="text-2xl text-orange-500">{attendanceRate}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-orange-500 h-3 rounded-full transition-all duration-300"
                style={{ width: `${attendanceRate}%` }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">الطالب</TableHead>
                  <TableHead className="text-right">الصف</TableHead>
                  <TableHead className="text-right">التاريخ</TableHead>
                  <TableHead className="text-right">وقت الحضور</TableHead>
                  <TableHead className="text-right">وقت الانصراف</TableHead>
                  <TableHead className="text-center">الحالة</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttendance.length > 0 ? (
                  filteredAttendance.map((record) => (
                    <TableRow key={record.id} className="hover:bg-gray-50">
                      <TableCell
                        className="cursor-pointer text-orange-600 hover:text-orange-700 hover:underline transition-colors"
                        onClick={() => handleStudentClick(record.studentName)}
                        title="اضغط لعرض تقرير الطالب الكامل"
                      >
                        {record.studentName}
                      </TableCell>
                      <TableCell>{record.class}</TableCell>
                      <TableCell dir="ltr" className="text-right">{record.date}</TableCell>
                      <TableCell dir="ltr" className="text-right">{record.checkIn}</TableCell>
                      <TableCell dir="ltr" className="text-right">{record.checkOut}</TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(record.status)}
                      </TableCell>
                    </TableRow>
                  ))
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
        </CardContent>
      </Card>

      {/* Student Attendance Report Dialog */}
      <StudentAttendanceReport
        student={selectedStudent}
        open={isReportDialogOpen}
        onOpenChange={setIsReportDialogOpen}
      />
    </div>
  );
}
