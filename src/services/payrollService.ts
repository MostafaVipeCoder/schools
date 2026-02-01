import { supabase } from '../lib/supabase';

export interface Payroll {
    id: string;
    staff_id: string;
    amount: number;
    month: string;
    year: number;
    status: 'paid' | 'unpaid' | 'pending';
    payment_date?: string;
    created_at: string;
    updated_at: string;
    staff?: {
        name: string;
        role: string;
    }
}

export const payrollService = {
    async getAll() {
        const { data, error } = await supabase
            .from('payroll')
            .select(`
                *,
                staff (
                    name,
                    role
                )
            `)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Payroll[];
    },

    async getByStaffId(staffId: string) {
        const { data, error } = await supabase
            .from('payroll')
            .select('*')
            .eq('staff_id', staffId)
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Payroll[];
    },

    async create(payroll: Omit<Payroll, 'id' | 'created_at' | 'updated_at' | 'staff'>) {
        const { data, error } = await supabase
            .from('payroll')
            .insert([payroll])
            .select()
            .single();

        if (error) throw error;
        return data as Payroll;
    },

    async markAsPaid(id: string) {
        const { data, error } = await supabase
            .from('payroll')
            .update({
                status: 'paid',
                payment_date: new Date().toISOString().split('T')[0],
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Payroll;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('payroll')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
