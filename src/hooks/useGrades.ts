
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { gradeService, Grade } from '../services/gradeService';
import { toast } from 'sonner';

export const useGrades = () => {
    const queryClient = useQueryClient();

    const gradesQuery = useQuery({
        queryKey: ['grades'],
        queryFn: gradeService.getAll,
        staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
    });

    const addGradeMutation = useMutation({
        mutationFn: gradeService.create,
        // Optimistic Update
        onMutate: async (newGrade) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['grades'] });

            // Snapshot previous value
            const previousGrades = queryClient.getQueryData<Grade[]>(['grades']);

            // Optimistically update to the new value
            queryClient.setQueryData<Grade[]>(['grades'], (old) => {
                const tempId = Math.random().toString();
                const optimisticGrade: Grade = {
                    ...newGrade,
                    id: tempId,
                    created_at: new Date().toISOString(),
                    classCount: 0
                } as Grade;
                return old ? [optimisticGrade, ...old] : [optimisticGrade];
            });

            return { previousGrades };
        },
        onError: (err, newGrade, context) => {
            toast.error('فشل إضافة المرحلة الدراسية');
            // Rollback on error
            if (context?.previousGrades) {
                queryClient.setQueryData(['grades'], context.previousGrades);
            }
        },
        onSuccess: () => {
            toast.success('تم إضافة المرحلة الدراسية بنجاح');
        },
        onSettled: () => {
            // Always refetch after error or success to ensure data sync
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
    });

    const updateGradeMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<Grade> }) =>
            gradeService.update(id, data),
        onSuccess: () => {
            toast.success('تم تعديل المرحلة الدراسية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
        onError: () => {
            toast.error('فشل تعديل المرحلة الدراسية');
        }
    });

    const deleteGradeMutation = useMutation({
        mutationFn: gradeService.delete,
        onSuccess: () => {
            toast.success('تم حذف المرحلة الدراسية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
        onError: () => {
            toast.error('فشل حذف المرحلة الدراسية');
        }
    });

    return {
        grades: gradesQuery.data || [],
        isLoading: gradesQuery.isLoading,
        isError: gradesQuery.isError,
        addGrade: addGradeMutation.mutateAsync, // Expose async for form handling if needed
        updateGrade: updateGradeMutation.mutateAsync,
        deleteGrade: deleteGradeMutation.mutateAsync,
    };
};
