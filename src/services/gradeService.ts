import { supabase } from '../lib/supabase';

export interface Grade {
    id?: string;
    user_id?: string;
    name: string;
    stage: string;
    description?: string;
    created_at?: string;
    updated_at?: string;
}

export const gradeService = {
    /**
     * جلب جميع المراحل الدراسية مع إحصائيات الفصول والطلاب
     */
    async getAll() {
        // Fetch grades and their classes
        const { data: grades, error: gradesError } = await supabase
            .from('grades')
            .select('*, classes:classes(id)')
            .order('created_at', { ascending: false });

        if (gradesError) throw gradesError;

        // Fetch students and their class_id
        const { data: students, error: studentsError } = await supabase
            .from('students')
            .select('class_id');

        if (studentsError) throw studentsError;

        // Fetch classes to map to grades
        const { data: classes, error: classesError } = await supabase
            .from('classes')
            .select('id, grade_id');

        if (classesError) throw classesError;

        const classToGradeMap = new Map();
        classes.forEach(c => classToGradeMap.set(c.id, c.grade_id));

        const studentCountByGrade = new Map();
        students.forEach(s => {
            if (s.class_id) {
                const gradeId = classToGradeMap.get(s.class_id);
                if (gradeId) {
                    studentCountByGrade.set(gradeId, (studentCountByGrade.get(gradeId) || 0) + 1);
                }
            }
        });

        return grades.map(grade => ({
            ...grade,
            classCount: grade.classes?.length || 0,
            studentCount: studentCountByGrade.get(grade.id) || 0
        }));
    },

    /**
     * جلب مرحلة واحدة بواسطة ID
     */
    async getById(id: string) {
        const { data, error } = await supabase
            .from('grades')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * إضافة مرحلة دراسية جديدة
     */
    async create(grade: Omit<Grade, 'id' | 'created_at' | 'updated_at'>) {
        const { data, error } = await supabase
            .from('grades')
            .insert([grade])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث بيانات مرحلة دراسية
     */
    async update(id: string, grade: Partial<Grade>) {
        const { data, error } = await supabase
            .from('grades')
            .update(grade)
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف مرحلة دراسية
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('grades')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return true;
    }
};
