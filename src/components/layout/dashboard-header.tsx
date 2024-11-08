'use client'

import React, { useState, useEffect } from 'react';
import { UserCircle, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useStudentProfileStore } from '@/lib/profile-store';
import { useRouter } from 'next/navigation';
import apiClient, { clearAuthTokens } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

interface ProfilePicture {
  id: number;
  type: string;
  temporary_url?: string;
}

export const DashboardHeader = () => {
  const router = useRouter();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [profilePicture, setProfilePicture] = useState<ProfilePicture | null>(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  const profileData = useStudentProfileStore((state) => state.profileData);
  const clearProfile = useStudentProfileStore((state) => state.clearProfile);
  
  const fullName = profileData.name || 'Loading...';



  // Fetch profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        setIsLoadingPicture(true);
        const response = await apiClient.get('/documents');
        
        
        // Find the profile picture document
        const profileDoc = response.data.documents.find((doc: any) => doc.document_type === 'Profile Picture');
        console.log('Profile document:', profileDoc);
        
        if (profileDoc?.temporary_url) {
          setProfilePicture({
            id: profileDoc.id,
            type: 'Profile Picture',
            temporary_url: profileDoc.temporary_url
          });
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        toast({
          title: "Error",
          description: "Failed to load profile picture",
          variant: "destructive",
        });
      } finally {
        setIsLoadingPicture(false);
      }
    };
    
    fetchProfilePicture();
    // Refresh URL every 45 minutes to prevent expiration
    const interval = setInterval(fetchProfilePicture, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const refreshToken = localStorage.getItem('refresh_token');
      
      try {
        await apiClient.post('/logout', {
          refresh_token: refreshToken
        });
      } catch (error) {
        console.warn('Logout endpoint error:', error);
      }

      clearAuthTokens();
      clearProfile();

      toast({
        title: "Success!",
        description: "You have been successfully logged out.",
        variant: "default",
        className: "bg-green-500 text-white",
      });

      setIsNavigating(true);
      router.push('/login');
      
    } catch (error) {
      console.error('Logout error:', error);
      clearAuthTokens();
      clearProfile();
      
      toast({
        title: "Note",
        description: "You have been logged out locally.",
        variant: "default",
        className: "bg-orange-500 text-white",
      });
      
      router.push('/login');
    } finally {
      setIsLoggingOut(false);
    }
  };
  
  return (
    <>
      {/* Navigation Loading Overlay */}
      {(isNavigating || isLoggingOut) && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-orange-600 animate-loading" />
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">Student Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <div className="relative w-8 h-8">
                      {isLoadingPicture ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
                      ) : profilePicture?.temporary_url ? (
                        <img
                          src={profilePicture.temporary_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover"
                          onError={() => setProfilePicture(null)}
                        />
                      ) : (
                        <UserCircle className="w-8 h-8" />
                      )}
                    </div>
                    <span>{fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/profile')} 
                    disabled={isNavigating || isLoggingOut}
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/settings')}
                    disabled={isNavigating || isLoggingOut}
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    className="text-red-600"
                    onClick={handleLogout}
                    disabled={isNavigating || isLoggingOut}
                  >
                    {isLoggingOut ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Logging out...
                      </>
                    ) : (
                      'Logout'
                    )}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </nav>
    </>
  );
};