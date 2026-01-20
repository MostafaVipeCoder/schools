import { supabase } from '../lib/supabase';

export interface Payment {
    id?: string;
    user_id?: string;
    student_id: string;
    amount: number;
    month: string;
    year: number;
    status: 'paid' | 'unpaid' | 'partial';
    payment_date?: string;
    notes?: string;
    created_at?: string;
    updated_at?: string;
    students?: {
        name: string;
        class_id: string;
    };
}

export const paymentService = {
    /**
     * جلب جميع المدفوعات
     */
    async getAll() {
        const { data, error } = await supabase
            .from('payments')
            .select(`
        *,
        students (
          name,
          class_id
        )
      `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * جلب مدفوعات طالب معين
     */
    async getByStudentId(studentId: string) {
        const { data, error } = await supabase
            .from('payments')
            .select('*')
            .eq('student_id', studentId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    },

    /**
     * إضافة عملية دفع جديدة
     */
    async create(payment: Omit<Payment, 'id' | 'created_at' | 'updated_at' | 'students'>) {
        const { data, error } = await supabase
            .from('payments')
            .insert([payment])
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * تحديث عملية دفع
     */
    async update(id: string, payment: Partial<Payment>) {
        const { data, error } = await supabase
            .from('payments')
            .update({ ...payment, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    /**
     * حذف عملية دفع
     */
    async delete(id: string) {
        const { error } = await supabase
            .from('payments')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    /**
     * جلب الإحصائيات المالية
     */
    async getStats() {
        const { data, error } = await supabase
            .from('payments')
            .select('amount, status');

        if (error) throw error;

        const totalAmount = data.reduce((sum, p) => sum + Number(p.amount), 0);
        const collectedAmount = data
            .filter(p => p.status === 'paid')
            .reduce((sum, p) => sum + Number(p.amount), 0);
        const pendingAmount = data
            .filter(p => p.status === 'unpaid')
            .reduce((sum, p) => sum + Number(p.amount), 0);

        return {
            totalAmount,
            collectedAmount,
            pendingAmount,
            collectionRate: totalAmount > 0 ? (collectedAmount / totalAmount) * 100 : 0
        };
    }
};
