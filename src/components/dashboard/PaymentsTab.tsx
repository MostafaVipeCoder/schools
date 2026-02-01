import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Wallet, TrendingUp, AlertCircle, Calendar as CalendarIcon, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { ar } from 'date-fns/locale';
import type { Payment } from '../../services/paymentService';

interface PaymentsTabProps {
    payments: Payment[];
}

export default function PaymentsTab({ payments }: PaymentsTabProps) {
    // --- Stats Calculation ---
    const stats = useMemo(() => {
        const totalPaid = payments
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const totalPartial = payments
            .filter(p => p.status === 'partial')
            .reduce((sum, p) => sum + Number(p.amount), 0); // Assuming full amount is recorded here, logic might differ if amount is 'paid amount' vs 'total due'

        // For simplicity, let's assume 'amount' is what was PAID. 
        // If the system tracks "Dues", we'd need a different field or logic.
        // Based on the schema `amount`, `status`: it likely records a Transaction.
        // So `status=unpaid` might mean "A bill was generated for X amount but not paid".

        const totalUnpaid = payments
            .filter(p => p.status === 'unpaid')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        const totalTransactions = payments.length;

        return { totalPaid, totalPartial, totalUnpaid, totalTransactions };
    }, [payments]);

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'paid':
                return <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200 shadow-none gap-1"><CheckCircle2 className="w-3 h-3" /> مدفوع</Badge>;
            case 'partial':
                return <Badge variant="secondary" className="bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 shadow-none gap-1"><Clock className="w-3 h-3" /> جزئي</Badge>;
            case 'unpaid':
                return <Badge variant="destructive" className="bg-red-100 text-red-700 hover:bg-red-200 border-red-200 shadow-none gap-1"><XCircle className="w-3 h-3" /> غير مدفوع</Badge>;
            default:
                return <Badge variant="outline">{status}</Badge>;
        }
    };

    return (
        <div className="space-y-6">
            {/* 1. Financial Summary Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Total Paid */}
                <Card className="bg-green-50 border-green-100 shadow-sm">
                    <CardContent className="p-6 flex items-center justify-between">
                        <div>
                            <span className="text-4xl font-bold text-green-700 block mb-1">{stats.totalPaid.toLocaleString()}</span>
                            <span className="text-sm text-green-800 font-medium">إجمالي المدفوعات</span>
                        </div>
                        <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center border border-green-200">
                            <TrendingUp className="h-6 w-6 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                {/* Outstanding / Unpaid */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">مستحقات غير مدفوعة</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-red-600">{stats.totalUnpaid.toLocaleString()}</span>
                            <div className="h-10 w-10 rounded-full bg-red-50 flex items-center justify-center">
                                <AlertCircle className="h-5 w-5 text-red-500" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">مبالغ مستحقة الدفع</p>
                    </CardContent>
                </Card>

                {/* Transactions Count */}
                <Card className="bg-white border-gray-200 shadow-sm">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">عدد العمليات</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center justify-between">
                            <span className="text-2xl font-bold text-gray-700">{stats.totalTransactions}</span>
                            <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center">
                                <Wallet className="h-5 w-5 text-blue-500" />
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">فاتورة مسجلة</p>
                    </CardContent>
                </Card>
            </div>

            {/* 2. Payment History Table */}
            <Card className="w-full bg-white shadow-sm border border-gray-200">
                <CardHeader className="border-b border-gray-100 py-4">
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Wallet className="h-5 w-5 text-gray-500" />
                            سجل المعاملات المالية
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-right">
                            <thead className="bg-gray-50 text-gray-600 font-medium">
                                <tr>
                                    <th className="p-4 border-b">التاريخ</th>
                                    <th className="p-4 border-b">الشهر/السنة</th>
                                    <th className="p-4 border-b">المبلغ</th>
                                    <th className="p-4 border-b">الحالة</th>
                                    <th className="p-4 border-b">ملاحظات</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {payments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="p-4 text-gray-600 font-mono text-xs md:text-sm">
                                            {payment.payment_date ? format(parseISO(payment.payment_date), 'yyyy-MM-dd') : '-'}
                                        </td>
                                        <td className="p-4 text-gray-900 font-medium">
                                            {payment.month} {payment.year}
                                        </td>
                                        <td className="p-4 font-bold text-gray-700">
                                            {Number(payment.amount).toLocaleString()} ج.م
                                        </td>
                                        <td className="p-4">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                        <td className="p-4 text-gray-500 max-w-xs truncate">
                                            {payment.notes || '-'}
                                        </td>
                                    </tr>
                                ))}
                                {payments.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">
                                            لا توجد معاملات مالية مسجلة
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
