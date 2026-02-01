import { supabase } from '../lib/supabase';

export interface Suspension {
    id?: string;
    student_id: string;
    type: 'warning' | 'suspension' | 'expulsion' | 'parent_notification';
    duration_days?: number;
    start_date: string;
    end_date?: string;
    reason: string;
    created_at?: string;
}

export const suspensionService = {
    async getByStudentId(studentId: string) {
        const { data, error } = await supabase
            .from('suspensions')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * جلب جميع المخالفات السلوكية مع بيانات الطلاب
     */
    async getAll() {
        const { data, error } = await supabase
            .from('suspensions')
            .select(`
                *,
                students (
                    name,
                    class_id,
                    classes (
                        name
                    )
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    async create(suspension: Suspension) {
        const { data, error } = await supabase
            .from('suspensions')
            .insert([suspension])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('suspensions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
