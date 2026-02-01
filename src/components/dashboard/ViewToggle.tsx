import { Button } from '../ui/button';
import { LayoutGrid, LayoutList } from 'lucide-react';

interface ViewToggleProps {
    view: 'table' | 'cards';
    onViewChange: (view: 'table' | 'cards') => void;
}

export default function ViewToggle({ view, onViewChange }: ViewToggleProps) {
    return (
        <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-lg">
            <Button
                size="sm"
                variant={view === 'table' ? 'default' : 'ghost'}
                onClick={() => onViewChange('table')}
                className={`${view === 'table'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
            >
                <LayoutList className="h-4 w-4 ml-1" />
                جدول
            </Button>
            <Button
                size="sm"
                variant={view === 'cards' ? 'default' : 'ghost'}
                onClick={() => onViewChange('cards')}
                className={`${view === 'cards'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
            >
                <LayoutGrid className="h-4 w-4 ml-1" />
                بطاقات
            </Button>
        </div>
    );
}
