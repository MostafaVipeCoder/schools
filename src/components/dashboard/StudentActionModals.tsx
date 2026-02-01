import { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { useAttendance } from '../../hooks/useAttendance';
import { paymentService } from '../../services/paymentService'; // Assuming hook exists or using service directly
import { format } from 'date-fns';

// --- Types ---
interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentId: string;
    studentName: string;
    onSuccess?: () => void;
}

// --- Attendance Modal ---
const attendanceSchema = z.object({
    date: z.string(),
    status: z.enum(['present', 'absent', 'late']),
    notes: z.string().optional(),
});

export function RecordAttendanceModal({ isOpen, onClose, studentId, studentName, onSuccess }: ModalProps) {
    const { markAttendance } = useAttendance();
    const form = useForm<z.infer<typeof attendanceSchema>>({
        resolver: zodResolver(attendanceSchema),
        defaultValues: {
            date: format(new Date(), 'yyyy-MM-dd'),
            status: 'present',
            notes: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof attendanceSchema>) => {
        try {
            await markAttendance({
                student_id: studentId,
                date: values.date,
                present: values.status === 'present',
                notes: values.notes
            });
            toast.success(`تم تسجيل حضور ${studentName} بنجاح`);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('فشل تسجيل الحضور');
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>تسجيل حضور: {studentName}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>التاريخ</FormLabel>
                                    <FormControl><Input type="date" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="status"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>الحالة</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            <SelectItem value="present">حاضر</SelectItem>
                                            <SelectItem value="absent">غائب</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                            <Button type="submit">حفظ</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}

// --- Payment Modal ---
const paymentSchema = z.object({
    amount: z.coerce.number().min(1, 'المبلغ يجب أن يكون أكبر من 0'),
    month: z.string(),
    year: z.coerce.number(),
    status: z.enum(['paid', 'partial', 'unpaid']),
    notes: z.string().optional()
});

export function AddPaymentModal({ isOpen, onClose, studentId, studentName, onSuccess }: ModalProps) {
    const form = useForm<z.infer<typeof paymentSchema>>({
        resolver: zodResolver(paymentSchema),
        defaultValues: {
            amount: 0,
            month: format(new Date(), 'MMMM'),
            year: new Date().getFullYear(),
            status: 'paid',
            notes: ''
        }
    });

    const onSubmit = async (values: z.infer<typeof paymentSchema>) => {
        try {
            await paymentService.create({
                student_id: studentId,
                amount: values.amount,
                month: values.month,
                year: values.year,
                status: values.status,
                notes: values.notes,
                payment_date: new Date().toISOString()
            });
            toast.success(`تم إضافة دفعة لـ ${studentName}`);
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error('فشل إضافة الدفعة');
            console.error(error);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>إضافة دفعة مالية: {studentName}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>المبلغ</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>حالة الدفع</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="paid">مدفوع بالكامل</SelectItem>
                                                <SelectItem value="partial">مدفوع جزئياً</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="month"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>عن شهر</FormLabel>
                                        <FormControl><Input placeholder="يناير" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="year"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>السنة</FormLabel>
                                        <FormControl><Input type="number" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>ملاحظات</FormLabel>
                                    <FormControl><Input {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button type="button" variant="outline" onClick={onClose}>إلغاء</Button>
                            <Button type="submit">تسجيل الدفعة</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}
