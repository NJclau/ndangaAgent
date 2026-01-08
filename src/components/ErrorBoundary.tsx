'use client';

import React, { Component, ErrorInfo } from 'react';
import { Button } from '@/components/ui/button';
import { logError } from '@/lib/crashlytics';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // You can also log the error to an error reporting service
    console.error("Uncaught error:", error, errorInfo);
    logError(error, { componentStack: errorInfo.componentStack });
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
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

export default ErrorBoundary;
