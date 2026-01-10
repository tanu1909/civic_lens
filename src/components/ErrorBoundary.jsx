import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // You can log the error to an error reporting service here
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
          <div className="max-w-md w-full text-center p-8 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Something went wrong.</h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6">Our team has been notified. Please try refreshing the page.</p>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children; 
  }
}

export default ErrorBoundary;