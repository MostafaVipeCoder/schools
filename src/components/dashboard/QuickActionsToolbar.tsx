import { Button } from '../ui/button';
import {
    CreditCard,
    CalendarCheck,
    FileText,
    Printer,
    MessageCircle
} from 'lucide-react';

interface QuickActionsToolbarProps {
    onRecordAttendance: () => void;
    onAddPayment: () => void;
    onPrintReport: () => void;
}

export default function QuickActionsToolbar({
    onRecordAttendance,
    onAddPayment,
    onPrintReport
}: QuickActionsToolbarProps) {
    return (
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2 md:pb-0">
            <Button
                onClick={onRecordAttendance}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-orange-600 shadow-sm"
            >
                <CalendarCheck className="ml-2 h-4 w-4 text-green-500" />
                تسجيل حضور يومي
            </Button>

            <Button
                onClick={onAddPayment}
                className="bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-orange-600 shadow-sm"
            >
                <CreditCard className="ml-2 h-4 w-4 text-blue-500" />
                إضافة دفعة مالية
            </Button>


            <div className="flex-1" />

            <Button
                onClick={onPrintReport}
                variant="ghost"
                className="text-gray-500 hover:text-gray-900"
            >
                <Printer className="ml-2 h-4 w-4" />
                طباعة تقرير شامل
            </Button>
        </div>
    );
}
