// hooks/use-error-handler.ts
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { WifiOff, AlertCircle } from 'lucide-react';
import { NetworkError, AuthenticationError } from '@/lib/axios';
import { useRouter } from 'next/navigation';

export function useErrorHandler(maxRetries: number = 3) {
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const router = useRouter();

  const handleError = async (error: unknown, retryFn?: () => Promise<void>) => {
    if (error instanceof NetworkError) {
      if (retryCount < maxRetries && retryFn) {
        toast({
          title: "Connection Error",
          description: (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <WifiOff className="h-4 w-4" />
                <span>Having trouble connecting. Retrying...</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Attempt {retryCount + 1} of {maxRetries}
              </p>
            </div>
          )
        });
        
        const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
        setTimeout(async () => {
          setRetryCount(prev => prev + 1);
          await retryFn();
        }, timeout);
        
        return;
      }
      
      toast({
        variant: "destructive",
        title: "Connection Failed",
        description: (
          <div className="flex items-center gap-2">
            <WifiOff className="h-4 w-4" />
            <span>Please check your internet connection and refresh the page.</span>
          </div>
        )
      });
      
      return;
    }

    if (error instanceof AuthenticationError) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      router.push(`/login?message=${encodeURIComponent(error.message)}`);
      return;
    }

    toast({
      variant: "destructive",
      title: "Error",
      description: (
        <div className="flex items-center gap-2">
          <AlertCircle className="h-4 w-4" />
          <span>Something went wrong. Please try again later.</span>
        </div>
      )
    });
  };

  return {
    handleError,
    retryCount,
    resetRetryCount: () => setRetryCount(0),
    isMaxRetries: retryCount >= maxRetries
  };
}