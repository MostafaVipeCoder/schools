// Database Types
export interface Profile {
    id: string;
    school_id: string;
    role: 'admin' | 'manager' | 'staff' | 'accountant';
    full_name: string;
    email: string;
    created_at: string;
    permissions?: string[];
}

export interface SchoolSettings {
    school_id: string;
    school_name: string;
    subscription_type: string;
    status: 'active' | 'suspended';
    created_at: string;
    updated_at: string;
}

export interface Grade {
    id: string;
    user_id?: string;
    school_id?: string;
    name: string;
    stage: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface Class {
    id: string;
    user_id?: string;
    school_id?: string;
    name: string;
    grade_level: string;
    stage: string;
    capacity: number;
    teacher_name?: string;
    grade_id?: string;
    slug?: string;
    attendance_type?: 'daily' | 'scheduled';
    attendance_days?: string[];
    created_at: string;
    updated_at: string;
    grade?: Grade;
}

export interface Student {
    id: string;
    user_id?: string;
    school_id?: string;
    name: string;
    phone: string;
    email?: string;
    class_id?: string;
    guardian_name: string;
    guardian_phone: string;
    payment_status: 'regular' | 'exempt';
    slug?: string;
    status?: 'active' | 'suspended' | 'expelled';
    created_at: string;
    updated_at: string;
    class?: Class;
}

export interface Attendance {
    id: string;
    user_id: string;
    student_id: string;
    date: string;
    present: boolean;
    notes?: string;
    created_at: string;
}

export interface Payment {
    id: string;
    user_id: string;
    student_id: string;
    amount: number;
    month: string;
    year: number;
    status: 'paid' | 'unpaid' | 'partial';
    payment_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

// Admin Types
export interface AdminStats {
    totalSchools: number;
    totalStudents: number;
    totalUsers: number;
    monthlyRevenue: number;
}

export interface SchoolOverview {
    id: string;
    school_id: string;
    school_name: string;
    owner_name: string;
    owner_email: string;
    student_count: number;
    subscription_type: string;
    status: 'active' | 'suspended';
    created_at: string;
    discount?: number;
}

// UI Types
export type UserRole = 'admin' | 'manager' | 'staff' | 'accountant';

export interface MenuItem {
    name: string;
    icon: any; // lucide-react icon component
    path: string;
    roles?: UserRole[];
}
