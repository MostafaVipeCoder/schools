import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { suspensionService, Suspension } from '../services/suspensionService';
import { toast } from 'sonner';

export const useSuspensions = (studentId?: string) => {
    const queryClient = useQueryClient();

    const suspensionsQuery = useQuery({
        queryKey: ['suspensions', studentId],
        queryFn: () => studentId ? suspensionService.getByStudentId(studentId) : suspensionService.getAll(),
    });

    const addSuspensionMutation = useMutation({
        mutationFn: suspensionService.create,
        onSuccess: () => {
            toast.success('تم تسجيل المخالفة السلوكية بنجاح');
            queryClient.invalidateQueries({ queryKey: ['suspensions'] });
        },
        onError: (error) => {
            console.error(error);
            toast.error('فشل تسجيل المخالفة');
        }
    });

    return {
        suspensions: suspensionsQuery.data || [],
        isLoading: suspensionsQuery.isLoading,
        addSuspension: addSuspensionMutation.mutateAsync,
    };
};
