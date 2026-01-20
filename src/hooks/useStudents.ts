
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { toast } from 'sonner';

// Reusing interfaces from the component file or defining them here if needed clearer separation
// For now, simpler to rely on supabase types or simple interfaces
interface Student {
    id?: string;
    name: string;
    phone: string;
    email?: string;
    payment_status: 'regular' | 'exempt';
    status?: 'active' | 'suspended' | 'expelled';
    guardian_name: string;
    guardian_phone: string;
    class_id?: string;
    created_at?: string;
    classes?: {
        id: string;
        name: string;
        grade_level: string;
    };
}

export const useStudents = () => {
    const queryClient = useQueryClient();

    const studentsQuery = useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('students')
                .select(`
          *,
          classes (
            id,
            name,
            grade_level
          )
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data as Student[];
        },
        staleTime: 1000 * 60 * 5,
    });

    const addStudentMutation = useMutation({
        mutationFn: async (studentData: any) => {
            const { data, error } = await supabase
                .from('students')
                .insert([studentData])
                .select(`
          *,
          classes (
            id,
            name,
            grade_level
          )
        `)
                .single();

            if (error) throw error;
            return data;
        },
        onMutate: async (newStudent) => {
            await queryClient.cancelQueries({ queryKey: ['students'] });
            const previousStudents = queryClient.getQueryData<Student[]>(['students']);

            queryClient.setQueryData<Student[]>(['students'], (old) => {
                const tempId = Math.random().toString();
                const optimisticStudent: Student = {
                    ...newStudent,
                    id: tempId,
                    created_at: new Date().toISOString(),
                    classes: { id: newStudent.class_id, name: '...', grade_level: '...' } // Placeholder
                } as Student;
                return old ? [optimisticStudent, ...old] : [optimisticStudent];
            });

            return { previousStudents };
        },
        onError: (err, newStudent, context) => {
            toast.error('فشل إضافة الطالب');
            if (context?.previousStudents) {
                queryClient.setQueryData(['students'], context.previousStudents);
            }
        },
        onSuccess: () => {
            toast.success('تم أضافة الطالب بنجاح');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['students'] });
            // Invalidate classes/grades if student count affects them (often does)
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
    });

    const updateStudentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => {
            const { error } = await supabase
                .from('students')
                .update(data)
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('تم تعديل بيانات الطالب بنجاح');
            // Invalidate all related queries to ensure counts are updated
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
        onError: () => {
            toast.error('فشل تعديل بيانات الطالب');
        }
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('students')
                .delete()
                .eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            toast.success('تم حذف الطالب بنجاح');
            queryClient.invalidateQueries({ queryKey: ['students'] });
            queryClient.invalidateQueries({ queryKey: ['classes'] });
            queryClient.invalidateQueries({ queryKey: ['grades'] });
        },
        onError: () => {
            toast.error('فشل حذف الطالب');
        }
    });

    return {
        students: studentsQuery.data || [],
        isLoading: studentsQuery.isLoading,
        isError: studentsQuery.isError,
        addStudent: addStudentMutation.mutateAsync,
        updateStudent: updateStudentMutation.mutateAsync,
        deleteStudent: deleteStudentMutation.mutateAsync,
    };
};
