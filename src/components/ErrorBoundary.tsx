import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  ErrorBoundaryState
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      errorMessage: error?.message || 'Error inesperado en la aplicación.',
    };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Application ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#1C060B] text-[#FDF8F0] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#24070F] border border-[#801C2E] rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-500/60 flex items-center justify-center mx-auto mb-4 text-rose-300">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-2xl font-bold text-white mb-2">
              Algo salió mal
            </h2>
            <p className="text-xs text-[#F4D9C6]/80 mb-5 leading-relaxed">
              Ocurrió un inconveniente al sincronizar los datos de Stella Polaris. Puedes recargar la página para continuar.
            </p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#E25822] hover:bg-[#F16E28] text-white text-xs font-semibold rounded-md transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Recargar Página</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
