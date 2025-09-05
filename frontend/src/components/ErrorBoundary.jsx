import React from "react";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (process.env.NODE_ENV !== "production") {
      // eslint-disable-next-line no-console
      console.error("ErrorBoundary caught:", error, info);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) this.props.onReset();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="mt-3 max-w-md text-sm text-gray-600">
            An unexpected error occurred while rendering the page. You can try reloading.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              className="rounded-md border border-gray-300 px-4 py-2 text-sm hover:bg-gray-50"
              onClick={() => window.location.reload()}
            >
              Reload
            </button>
            <button
              className="rounded-md bg-indigo-600 px-4 py-2 text-sm text-white hover:bg-indigo-700"
              onClick={this.handleReset}
            >
              Try again
            </button>
          </div>
          {process.env.NODE_ENV !== "production" && this.state.error && (
            <pre className="mt-6 max-w-2xl overflow-auto rounded-md bg-gray-100 p-3 text-left text-xs text-red-700">
              {String(this.state.error?.stack || this.state.error)}
            </pre>
          )}
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
