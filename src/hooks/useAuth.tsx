import { useState, useEffect, createContext, useContext } from 'react';
import { supabase } from '../lib/supabase';
import { authService, UserProfile } from '../services/authService';
import { Session } from '@supabase/supabase-js';

interface AuthContextType {
    session: Session | null;
    profile: UserProfile | null;
    loading: boolean;
    isAdmin: boolean;
    isAccountant: boolean;
    isStaff: boolean;
}

const AuthContext = createContext<AuthContextType>({
    session: null,
    profile: null,
    loading: true,
    isAdmin: false,
    isAccountant: false,
    isStaff: false,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [session, setSession] = useState<Session | null>(null);
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initial check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            if (session) {
                fetchProfile();
            } else {
                setLoading(false);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            if (session) {
                fetchProfile();
            } else {
                setProfile(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const fetchProfile = async () => {
        try {
            const up = await authService.getCurrentProfile();
            setProfile(up);
        } catch (e) {
            console.error('Error in fetchProfile:', e);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        session,
        profile,
        loading,
        isAdmin: profile?.role === 'manager',
        isAccountant: profile?.role === 'accountant',
        isStaff: profile?.role === 'staff',
    };

    return <AuthContext.Provider value={value}> {children} </AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
