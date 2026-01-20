
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService, Payment } from '../services/paymentService';
import { toast } from 'sonner';

export const usePayments = () => {
    const queryClient = useQueryClient();

    const paymentsQuery = useQuery({
        queryKey: ['payments'],
        queryFn: () => paymentService.getAll(),
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    const statsQuery = useQuery({
        queryKey: ['payments-stats'],
        queryFn: () => paymentService.getStats(),
        staleTime: 1000 * 60 * 5,
    });

    const createPaymentMutation = useMutation({
        mutationFn: (newPayment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'students'>) =>
            paymentService.create(newPayment),
        onSuccess: () => {
            toast.success('تم إضافة الفاتورة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payments-stats'] });
        },
        onError: () => {
            toast.error('حدث خطأ في إنشاء الفاتورة');
        },
    });

    const updatePaymentMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Payment> }) =>
            paymentService.update(id, data),
        onSuccess: () => {
            toast.success('تم تحديث حالة الفاتورة');
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payments-stats'] });
        },
        onError: () => {
            toast.error('فشل تحديث الحالة');
        },
    });

    const deletePaymentMutation = useMutation({
        mutationFn: (id: string) => paymentService.delete(id),
        onSuccess: () => {
            toast.success('تم حذف الفاتورة بنجاح');
            queryClient.invalidateQueries({ queryKey: ['payments'] });
            queryClient.invalidateQueries({ queryKey: ['payments-stats'] });
        },
        onError: () => {
            toast.error('فشل حذف الفاتورة');
        },
    });

    return {
        payments: paymentsQuery.data || [],
        stats: statsQuery.data,
        isLoading: paymentsQuery.isLoading || statsQuery.isLoading,
        isError: paymentsQuery.isError || statsQuery.isError,
        createPayment: createPaymentMutation.mutateAsync,
        updatePayment: updatePaymentMutation.mutateAsync,
        deletePayment: deletePaymentMutation.mutateAsync,
    };
};
