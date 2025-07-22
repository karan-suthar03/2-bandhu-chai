import { Component } from 'react';

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('Error caught by boundary:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-50">
                    <div className="text-center max-w-md mx-auto px-4">
                        <div className="bg-red-100 border border-red-400 text-red-800 px-6 py-8 rounded-lg">
                            <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <h2 className="text-2xl font-bold mb-2">Oops! Something went wrong</h2>
                            <p className="mb-6">
                                The application encountered an unexpected error. This might be due to server connectivity issues.
                            </p>
                            <div className="space-y-2">
                                <button 
                                    onClick={() => window.location.reload()}
                                    className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
                                >
                                    Refresh Page
                                </button>
                                <button 
                                    onClick={() => window.location.href = '/2-bandhu-chai/'}
                                    className="w-full bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition"
                                >
                                    Go to Homepage
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
