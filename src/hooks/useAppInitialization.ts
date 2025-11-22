import { useEffect } from 'react';
import { logVersion } from '@/utils/version';
import { handleRuntimeError, handleUnhandledRejection } from '@/utils/errorHandler';
import { __hasWindow } from '@/config';

export const useAppInitialization = () => {
  useEffect(() => {
    logVersion();

    // Set up global error handlers
    if (__hasWindow) {
      // Handle runtime errors
      window.onerror = (message, source, lineno, colno, error) => {
        handleRuntimeError(message, source, lineno, colno, error);
        return false; // Let default error handling continue
      };

      // Handle unhandled promise rejections
      window.onunhandledrejection = (event) => {
        handleUnhandledRejection(event);
        return false; // Let default error handling continue
      };
    }

    // Cleanup
    return () => {
      if (__hasWindow) {
        window.onerror = null;
        window.onunhandledrejection = null;
      }
    };
  }, []);
};
