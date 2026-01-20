import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { settingsService, type SchoolSettings } from '../services/settingsService';
import { toast } from 'sonner';

export function useSettings() {
    const queryClient = useQueryClient();

    const { data: settings, isLoading, error } = useQuery({
        queryKey: ['school-settings'],
        queryFn: () => settingsService.getSettings(),
        staleTime: Infinity, // Settings usually don't change often
    });

    const updateSettingsMutation = useMutation({
        mutationFn: (newSettings: Partial<SchoolSettings>) => settingsService.updateSettings(newSettings),
        onSuccess: (data) => {
            queryClient.setQueryData(['school-settings'], data);
            toast.success('تم حفظ الإعدادات بنجاح');
        },
        onError: (error: any) => {
            console.error('Error updating settings:', error);
            toast.error('فشل حفظ الإعدادات');
        }
    });

    return {
        settings: settings || settingsService.getDefaultSettings(),
        isLoading,
        error,
        updateSettings: updateSettingsMutation.mutate,
        isUpdating: updateSettingsMutation.isPending
    };
}
