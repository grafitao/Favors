"use client";

import React, { Component } from 'react';
import { AlertCircle } from 'lucide-react';

export class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black p-6 text-center">
          <div className="w-20 h-20 bg-[#121212] rounded-3xl flex items-center justify-center text-red-500 mb-8 shadow-xl shadow-red-500/10 border border-white/5">
            <AlertCircle size={40} />
          </div>
          <h1 className="text-2xl font-black text-white mb-4 tracking-tight">Ops! Algo deu errado.</h1>
          <p className="text-[#666666] mb-10 max-w-xs leading-relaxed">
            Ocorreu um erro inesperado na aplicação. Por favor, tente recarregar a página.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full max-w-xs bg-[#00E5FF] text-black py-5 rounded-2xl font-bold text-lg shadow-xl shadow-[#00E5FF]/20 active:scale-[0.98] transition-all"
          >
            Recarregar App
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
