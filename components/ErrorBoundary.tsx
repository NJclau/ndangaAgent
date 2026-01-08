
'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { logCrashlyticsError } from '@/utils/errorHandler';

interface Props {
  children: ReactNode;
  userId?: string;
  page?: string;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const { userId, page } = this.props;
    console.error('Uncaught error:', error, errorInfo);
    logCrashlyticsError(error, { 
      userId,
      page,
      componentStack: errorInfo.componentStack 
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
          <h1 className="text-2xl font-bold text-red-600">Something went wrong.</h1>
          <p className="text-gray-700">We've been notified and are looking into it.</p>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
