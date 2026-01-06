'use client';
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  override componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
          <h1 className="text-2xl font-bold text-white mb-4">Oups ! Une erreur est survenue</h1>
          <p className="text-white/70 mb-6">Nous travaillons pour résoudre ce problème.</p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary"
          >
            Réessayer
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
