import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

export class AppErrorBoundary extends Component<Props, State> {
  public state: State = { hasError: false };

  public static getDerivedStateFromError() {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Unhandled UI error', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-6">
          <div className="max-w-md bg-gray-800 border border-gray-700 rounded-xl p-6">
            <h1 className="text-xl font-semibold mb-2">Ocurrio un error inesperado</h1>
            <p className="text-gray-300 text-sm mb-4">
              Recarga la pagina. Si el problema persiste, contacta al administrador.
            </p>
            <button
              className="bg-indigo-600 hover:bg-indigo-700 px-4 py-2 rounded-lg"
              onClick={() => window.location.reload()}
            >
              Recargar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

