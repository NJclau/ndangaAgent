'use client';

import React, { useEffect } from 'react';
import { useCrashlytics } from '@/hooks/use-crashlytics';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ErrorDisplayProps {
  error: Error;
}

export const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  const { logError } = useCrashlytics();

  useEffect(() => {
    if (error) {
      logError(error);
    }
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
