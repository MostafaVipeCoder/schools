import { supabase } from '../lib/supabase';

export interface Staff {
    id: string;
    school_id: string;
    name: string;
    role: string;
    salary: number;
    phone?: string;
    email?: string;
    created_at: string;
    updated_at: string;
}

export const staffService = {
    async getAll() {
        // Automatically filtered by RLS if implemented, otherwise we'd need to filter by school_id
        const { data, error } = await supabase
            .from('staff')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data as Staff[];
    },

    async create(staff: Omit<Staff, 'id' | 'created_at' | 'updated_at'>) {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('Not authenticated');

        const { data, error } = await supabase
            .from('staff')
            .insert([{ ...staff, school_id: user.id }]) // Assuming school_id is user.id for manager
            .select()
            .single();

        if (error) throw error;
        return data as Staff;
    },

    async update(id: string, staff: Partial<Staff>) {
        const { data, error } = await supabase
            .from('staff')
            .update({ ...staff, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data as Staff;
    },

    async delete(id: string) {
        const { error } = await supabase
            .from('staff')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
