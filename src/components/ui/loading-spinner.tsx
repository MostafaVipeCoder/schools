import { Loader2 } from 'lucide-react';

export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50">
            <div className="text-center">
                <Loader2 className="h-12 w-12 animate-spin text-orange-500 mx-auto mb-4" />
                <p className="text-gray-600">جاري التحميل...</p>
            </div>
        </div>
    );
}
