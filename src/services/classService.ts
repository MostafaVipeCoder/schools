import { supabase } from '../lib/supabase';

export interface Class {
    id?: string;
    user_id?: string;
    name: string;
    grade_level: string;
    stage: string;
    capacity?: number;
    teacher_name?: string;
    grade_id?: string;
    created_at?: string;
    updated_at?: string;
}

export const classService = {
    /**
     * جلب جميع الفصول
     */
    async getAll() {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * جلب فصل واحد بواسطة ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('classes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إضافة فصل جديد
     */
    async create(classData: Omit<Class, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('classes')
            .insert([classData])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث بيانات فصل
     */
    async update(id: string, classData: Partial<Class>) {
        const { data, error } = await supabase
            .from('classes')
            .update({ ...classData, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف فصل
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('classes')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * جلب عدد الطلاب في فصل
     */
    async getStudentCount(classId: string) {
        const { count, error } = await supabase
            .from('students')
            .select('*', { count: 'exact', head: true })
            .eq('class_id', classId);

        if (error) throw error;
        return count || 0;
    }
};
