import { supabase } from '../lib/supabase';
import type { AdminStats, SchoolOverview, SchoolSettings } from '../types';

export const adminService = {
    async getGlobalStats(): Promise<AdminStats> {
        try {
            const { count: managerCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .eq('role', 'manager');

            const { count: studentCount } = await supabase
                .from('students')
                .select('*', { count: 'exact', head: true });

            const { count: nonAdminUserCount } = await supabase
                .from('profiles')
                .select('*', { count: 'exact', head: true })
                .neq('role', 'admin');

            // Calculate real revenue from paid invoices
            const { data: invoices } = await supabase
                .from('school_invoices')
                .select('amount')
                .eq('status', 'paid');

            const revenue = invoices?.reduce((sum, inv) => sum + Number(inv.amount), 0) || 0;

            return {
                totalSchools: managerCount || 0,
                totalStudents: studentCount || 0,
                totalUsers: nonAdminUserCount || 0,
                monthlyRevenue: revenue
            };
        } catch (error) {
            console.error('Error fetching global stats:', error);
            return { totalSchools: 0, totalStudents: 0, totalUsers: 0, monthlyRevenue: 0 };
        }
    },

    async getAllSchools(): Promise<SchoolOverview[]> {
        const { data: profiles } = await supabase
            .from('profiles')
            .select(`
        id,
        full_name,
        email,
        school_id,
        created_at,
        school_settings (
          school_name,
          subscription_type,
          status
        )
      `)
            .eq('role', 'manager');

        const { data: studentCounts } = await supabase.rpc('get_school_student_counts');
        const countMap = new Map((studentCounts as any[])?.map(item => [item.school_id, item.student_count]) || []);

        return (profiles || []).map(p => {
            // Handle cases where school_settings could be an array or a single object
            const settingsRaw = p.school_settings;
            const settings = Array.isArray(settingsRaw) ? (settingsRaw[0] || {}) : (settingsRaw || {});

            return {
                id: p.id,
                school_id: p.school_id,
                school_name: settings.school_name || 'مدرسة غير مسمى',
                owner_name: p.full_name || 'غير معروف',
                owner_email: p.email || '',
                student_count: countMap.get(p.school_id) || 0,
                subscription_type: settings.subscription_type || 'باقة أساسية',
                status: settings.status || 'active',
                created_at: p.created_at
            };
        });
    },

    async getAvailablePackages() {
        const { data, error } = await supabase
            .from('subscription_packages')
            .select('*')
            .order('price', { ascending: true });

        if (error) throw error;
        return data;
    },

    async toggleSchoolStatus(schoolId: string, status: 'active' | 'suspended') {
        const { error } = await supabase
            .from('school_settings')
            .update({ status })
            .eq('school_id', schoolId);

        if (error) throw error;
    },

    async updateSubscription(schoolId: string, packageType: string) {
        const { error } = await supabase
            .from('school_settings')
            .update({ subscription_type: packageType })
            .eq('school_id', schoolId);

        if (error) throw error;
    },

    async checkDatabaseHealth() {
        try {
            const start = performance.now();
            const { error } = await supabase.from('subscription_packages').select('count', { count: 'exact', head: true });
            const end = performance.now();
            if (error) throw error;
            return { status: 'healthy', latency: Math.round(end - start) };
        } catch (error) {
            console.error('Database health check failed:', error);
            return { status: 'unhealthy', latency: 0 };
        }
    },

    async getPlatformSettings() {
        const { data, error } = await supabase
            .from('platform_settings')
            .select('*')
            .single();

        if (error) throw error;
        return data;
    },

    async updatePlatformSettings(settings: any) {
        const { error } = await supabase
            .from('platform_settings')
            .update({
                ...settings,
                updated_at: new Date().toISOString()
            })
            .eq('id', settings.id);

        if (error) throw error;
    },

    async applyDiscount(schoolId: string, percentage: number, expiryDays: number) {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + expiryDays);

        const { error } = await supabase
            .from('school_discounts')
            .insert({
                school_id: schoolId,
                discount_percentage: percentage,
                expiry_date: expiryDate.toISOString()
            });

        if (error) throw error;
    }
};
