import React, { Component, ReactNode } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Button } from './button';

interface Props {
    children: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
                        <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">عذراً، حدث خطأ</h2>
                        <p className="text-gray-600 mb-4">
                            حدث خطأ غير متوقع. يرجى تحديث الصفحة والمحاولة مرة أخرى.
                        </p>
                        {this.state.error && (
                            <details className="text-right mb-4">
                                <summary className="cursor-pointer text-sm text-gray-500 hover:text-gray-700">
                                    تفاصيل الخطأ
                                </summary>
                                <pre className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                            </details>
                        )}
                        <Button
                            onClick={() => window.location.reload()}
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                        >
                            تحديث الصفحة
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
