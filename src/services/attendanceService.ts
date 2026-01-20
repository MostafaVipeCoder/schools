import { supabase } from '../lib/supabase';

export interface Attendance {
    id?: string;
    user_id?: string;
    student_id: string;
    date: string;
    present: boolean;
    notes?: string;
    created_at?: string;
}

export const attendanceService = {
    /**
     * جلب سجلات الحضور لطالب معين
     */
    async getByStudentId(studentId: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * جلب جميع سجلات الحضور
     */
    async getAll() {
        const { data, error } = await supabase
            .from('attendance')
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
            .order('date', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * تسجيل حضور
     */
    async markAttendance(attendance: Omit<Attendance, 'id' | 'created_at'>) {
        const { data, error } = await supabase
            .from('attendance')
            .upsert([attendance], { onConflict: 'student_id, date' })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث سجل حضور
     */
    async update(id: string, attendance: Partial<Attendance>) {
        const { data, error } = await supabase
            .from('attendance')
            .update(attendance)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف سجل حضور
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * جلب إحصائيات الحضور لطالب
     */
    async getStats(studentId: string, startDate: string, endDate: string) {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('student_id', studentId)
            .gte('date', startDate)
            .lte('date', endDate);

        if (error) throw error;

        const total = data?.length || 0;
        const present = data?.filter(a => a.present).length || 0;

        return {
            total,
            present,
            absent: total - present,
            percentage: total > 0 ? (present / total) * 100 : 0
        };
    }
};
