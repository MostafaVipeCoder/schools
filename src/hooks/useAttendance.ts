
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { attendanceService, Attendance } from '../services/attendanceService';
import { toast } from 'sonner';

export const useAttendance = () => {
    const queryClient = useQueryClient();

    const attendanceQuery = useQuery({
        queryKey: ['attendance'],
        queryFn: () => attendanceService.getAll(),
        staleTime: 1000 * 60 * 2, // 2 minutes
    });

    const markAttendanceMutation = useMutation({
        mutationFn: (attendance: Omit<Attendance, 'id' | 'created_at'>) =>
            attendanceService.markAttendance(attendance),
        onSuccess: () => {
            // We don't necessarily show toast here as it might be called from QR Scanner rapidly
            queryClient.invalidateQueries({ queryKey: ['attendance'] });
        },
        onError: (error: any) => {
            console.error('Error marking attendance:', error);
        },
    });

    return {
        attendance: attendanceQuery.data || [],
        isLoading: attendanceQuery.isLoading,
        isError: attendanceQuery.isError,
        markAttendance: markAttendanceMutation.mutateAsync,
    };
};
