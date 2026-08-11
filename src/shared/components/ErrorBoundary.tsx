import { Component, type ErrorInfo, type ReactNode } from "react";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error("ErrorBoundary caught:", error, errorInfo);
  }

  handleReload = (): void => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) {
      return this.props.children;
    }

    if (this.props.fallback) {
      return this.props.fallback;
    }

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-gray-50 px-4 text-center">
        <h1 className="text-2xl font-semibold text-gray-800">Algo salió mal</h1>
        <p className="max-w-md text-sm text-gray-600">
          {this.state.error.message || "Ocurrió un error inesperado."}
        </p>
        <button
          type="button"
          onClick={this.handleReload}
          className="rounded-md bg-gray-800 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-gray-700"
        >
          Recargar
        </button>
      </main>
    );
  }
}
