import { supabase } from '../lib/supabase';
import type { Student } from '../types';

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
     * جلب طالب واحد بواسطة ID أو Slug
     */
    async getById(identifier: string) {
        const query = supabase
            .from('students')
            .select(`
                *,
                classes (
                    id,
                    name,
                    grade_level,
                    stage
                )
            `);

        // Check if identifier is UUID
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

        const { data, error } = await (isUUID ? query.eq('id', identifier) : query.eq('slug', identifier))
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إضافة طالب جديد
     */
    async create(student: Omit<Student, 'id' | 'created_at' | 'updated_at' | 'slug'>) {
        // Get current user to ensure data ownership
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: inserted, error } = await supabase
            .from('students')
            .insert([{ ...student, user_id: user.id }])
            .select()
            .single();

        if (error) throw error;

        // Generate slug (Supabase should ideally do this via trigger, but doing it here as well for immediate use)
        const slug = student.name.toLowerCase().replace(/[^a-z0-9\u0621-\u064A]+/g, '-') + '-' + inserted.id.substring(0, 4);
        const { data, error: updateError } = await supabase
            .from('students')
            .update({ slug })
            .eq('id', inserted.id)
            .select()
            .single();

        if (updateError) console.error('Error updating slug:', updateError);
        return data || inserted;
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
