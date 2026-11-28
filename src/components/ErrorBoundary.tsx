import { Component, ErrorInfo, ReactNode } from 'react';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      message: error.message || 'An unexpected error occurred.',
    };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('Application ErrorBoundary caught:', error, info);
  }

  render(): ReactNode {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#F8F9FF] dark:bg-[#0D1117] flex items-center justify-center px-4">
          <div className="max-w-md w-full bg-white dark:bg-[#161B22] border border-slate-200 dark:border-slate-800 rounded-lg p-6">
            <h1 className="text-lg font-semibold text-[#0B1C30] dark:text-[#F8FAFC]">Something went wrong</h1>
            <p className="mt-2 text-sm text-[#464554] dark:text-slate-300">
              We hit an unexpected issue while loading this view. Please refresh the page to try again.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="mt-4 h-[38px] px-4 rounded bg-[#4648D4] dark:bg-[#6366F1] text-white text-sm font-medium hover:bg-[#4F46E5] transition-colors"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
