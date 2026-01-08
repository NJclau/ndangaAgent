'use client';

import React, { Component, ErrorInfo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useCrashlytics } from '@/hooks/use-crashlytics';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

const ErrorBoundaryWrapper = ({ children }: Props) => {
  const { logError } = useCrashlytics();

  return <ErrorBoundary logError={logError}>{children}</ErrorBoundary>;
};


class ErrorBoundary extends Component<Props & { logError: (error: Error, context?: Record<string, any>) => void }, State> {
  constructor(props: Props & { logError: (error: Error, context?: Record<string, any>) => void }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    this.props.logError(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-background p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold font-headline text-destructive">Oops! Something went wrong.</h1>
            <p className="mt-2 text-muted-foreground">
                We've been notified of the issue and are working to fix it. Please try refreshing the page.
            </p>
            <Button
                onClick={() => window.location.reload()}
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
                Refresh Page
            </Button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundaryWrapper;
