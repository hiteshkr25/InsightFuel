import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Dashboard Widget caught error:', error, errorInfo);
    // Integration Hook: sends error details to existing backend telemetry APIs
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center space-y-3 flex flex-col items-center justify-center min-h-[200px]">
          <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
            <AlertTriangle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-red-800">Widget rendering failed</h3>
            <p className="text-red-600 text-xs mt-1">An internal UI script error occurred.</p>
          </div>
          <button 
            onClick={this.handleReset}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-red-600 hover:bg-red-750 text-white rounded text-xs font-semibold shadow-sm transition-colors"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Reload Widget</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
