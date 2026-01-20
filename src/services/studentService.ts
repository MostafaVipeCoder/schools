import { supabase } from '../lib/supabase';

export interface Student {
    id?: string;
    user_id?: string;
    name: string;
    phone: string;
    email?: string;
    class_id?: string;
    guardian_name: string;
    guardian_phone: string;
    payment_status: 'regular' | 'exempt';
    status?: 'active' | 'suspended' | 'expelled';
    created_at?: string;
    updated_at?: string;
}

export const studentService = {
    /**
     * جلب جميع الطلاب مع بيانات الفصول
     */
    async getAll() {
        const { data, error } = await supabase
            .from('students')
            .select(`
        *,
        classes (
          id,
          name,
          grade_level,
          stage
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * جلب طالب واحد بواسطة ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('students')
            .select(`
        *,
        classes (
          id,
          name,
          grade_level,
          stage
        )
      `)
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إضافة طالب جديد
     */
    async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('students')
            .insert([student])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث بيانات طالب
     */
    async update(id: string, student: Partial<Student>) {
        const { data, error } = await supabase
            .from('students')
            .update({ ...student, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف طالب
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('students')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * البحث عن طلاب
     */
    async search(searchTerm: string) {
        const { data, error } = await supabase
            .from('students')
            .select(`
        *,
        classes (
          id,
          name,
          grade_level,
          stage
        )
      `)
            .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,guardian_name.ilike.%${searchTerm}%`)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
};
