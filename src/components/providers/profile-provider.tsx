'use client';

import React, { useEffect, useState } from 'react';
import { useStudentProfileStore } from '@/lib/profile-store';
import { useFullDataStore } from '@/lib/fulldata-store';
import apiClient, { AuthenticationError, NetworkError } from '@/lib/clients/authenticated-api-client';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { WifiOff, AlertCircle } from 'lucide-react';

interface ProfileProviderProps {
  children: React.ReactNode;
}

const ToastTitle = ({ icon: Icon, text }: { icon: React.ElementType; text: string }) => (
  <>
    <Icon className="h-4 w-4" />
    <span>{text}</span>
  </>
);

const RetryDescription = ({ retryCount, maxRetries }: { retryCount: number; maxRetries: number }) => (
  <div className="flex flex-col gap-2">
    <p>Having trouble connecting. Retrying...</p>
    <p className="text-sm text-muted-foreground">
      Attempt {retryCount + 1} of {maxRetries}
    </p>
  </div>
);

export function ProfileProvider({ children }: ProfileProviderProps) {
  const setProfile = useStudentProfileStore(state => state.setProfile);
  const fetchStudentData = useFullDataStore(state => state.fetchStudentData);
  const router = useRouter();
  const profileData = useStudentProfileStore(state => state.profileData);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (!refreshToken) {
          throw new AuthenticationError('Please log in to access your dashboard');
        }

        const userResponse = await apiClient.get("user");
        setProfile(userResponse.data);
        await fetchStudentData(profileData.fulldata_applicant_id);
        setRetryCount(0);

      } catch (error) {
        console.error("Failed to fetch profile:", error);

        if (error instanceof NetworkError) {
          if (retryCount < MAX_RETRIES) {
            toast({
              title: "Connection Error",
              description: (
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    <WifiOff className="h-4 w-4" />
                    <span>Having trouble connecting. Retrying...</span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Attempt {retryCount + 1} of {MAX_RETRIES}
                  </p>
                </div>
              )
            });
            
            const timeout = Math.min(1000 * Math.pow(2, retryCount), 10000);
            setTimeout(() => {
              setRetryCount(prev => prev + 1);
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
      }
    };

    fetchProfile();
  }, [setProfile, fetchStudentData, router, retryCount, profileData.fulldata_applicant_id, toast]);

  if (retryCount >= MAX_RETRIES) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center max-w-md text-center space-y-4">
          <WifiOff className="h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-gray-600">
            We're having trouble connecting to our servers. This might be due to:
          </p>
          <ul className="text-sm text-gray-500 list-disc text-left">
            <li>Your internet connection</li>
            <li>A temporary server issue</li>
            <li>Your network firewall or security settings</li>
          </ul>
          <button
            onClick={() => setRetryCount(0)}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}