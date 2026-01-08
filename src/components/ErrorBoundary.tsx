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
  // We can't use the hook directly here because this is a functional component that renders a class component.
  // We'll pass the logError function down as a prop.
  return <ErrorBoundary logErrorHook={useCrashlytics}>{children}</ErrorBoundary>;
};


class ErrorBoundary extends Component<Props & { logErrorHook: typeof useCrashlytics }, State> {
  private logError: (error: Error, context?: Record<string, any>) => void;
  
  constructor(props: Props & { logErrorHook: typeof useCrashlytics }) {
    super(props);
    this.state = { hasError: false, error: null };
    // Initialize logError with a dummy function. It will be replaced by the real one from the hook in a wrapper.
    this.logError = () => {}; 
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
    // The actual logging will be done via the hook, but we need a component to call it.
  }

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorDisplay error={this.state.error} logErrorHook={this.props.logErrorHook} />;
    }

    return this.props.children;
  }
}

// A new functional component to use the hook and log the error
const ErrorDisplay = ({ error, logErrorHook }: { error: Error, logErrorHook: typeof useCrashlytics}) => {
    const { logError } = logErrorHook();

    useEffect(() => {
        logError(error);
    }, [error, logError]);


    return (
        <div className="flex h-full w-full flex-col items-center justify-center bg-background p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-destructive mb-4" />
            <h1 className="text-2xl font-bold font-headline text-destructive">Oops! Something went wrong.</h1>
            <p className="mt-2 text-muted-foreground">
                We've been notified of the issue and are working to fix it. Please try refreshing the page.
            </p>
            <p className="mt-4 text-sm text-destructive/80 bg-destructive/10 p-2 rounded-md">
                Error: {error.message}
            </p>
            <Button
                onClick={() => window.location.reload()}
                className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground"
            >
                Refresh Page
            </Button>
        </div>
    );
};


export default ErrorBoundaryWrapper;
