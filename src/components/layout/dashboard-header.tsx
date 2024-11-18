'use client'

import React, { useState, useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { 
  UserCircle, 
  Loader2,
  Menu,
  BookOpen,
  GraduationCap,
  Users,
  LayoutDashboard,
  LogOut 
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { useStudentProfileStore } from '@/lib/profile-store';
import apiClient, { AuthenticationError, clearAuthTokens } from '@/lib/clients/authenticated-api-client';
import { useToast } from '@/hooks/use-toast';
import { useHeader } from '../providers/header-provider';

interface ProfilePicture {
  id: number;
  type: string;
  temporary_url?: string;
}

interface NavigationItem {
  name: string;
  path: string;
  icon: React.ReactElement;
  description: string;
}

export const DashboardHeader = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const [isNavigating, setIsNavigating] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  const { 
    profilePicture, 
    setProfilePicture, 
    isLoadingPicture, 
    setIsLoadingPicture 
  } = useHeader();
  const profileData = useStudentProfileStore((state) => state.profileData);
  const clearProfile = useStudentProfileStore((state) => state.clearProfile);
  const fullName = profileData.name || 'Loading...';


  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 text-[#ff8a47]" />, 
      description: 'View your student dashboard',
    },
    {
      name: 'Academics',
      path: '/academics',
      icon: <BookOpen className="w-5 h-5 text-[#ff8a47]" />, 
      description: 'Access your academic information',
    },
    {
      name: 'Campus Life',
      path: '/campus-life',
      icon: <GraduationCap className="w-5 h-5 text-[#ff8a47]" />, 
      description: 'Explore campus activities',
    },
  ];
  

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        setIsLoadingPicture(true);
        const response = await apiClient.get('documents');
        const profileDoc = response.data.documents.find((doc: any) => doc.document_type === 'profile');
        
        if (profileDoc?.temporary_url) {
          setProfilePicture({
            id: profileDoc.id,
            type: 'Profile Picture',
            temporary_url: profileDoc.temporary_url
          });
        }
      } catch (error) {
        console.error('Error fetching profile picture:', error);
        if (!(error instanceof AuthenticationError)) {
          toast({
            title: "Error",
            description: "Failed to load profile picture",
            variant: "destructive",
          });
        }


      } finally {
        setIsLoadingPicture(false);
      }
    };
    
    fetchProfilePicture();
    const interval = setInterval(fetchProfilePicture, 45 * 60 * 1000);
    return () => clearInterval(interval);
  }, [toast, setProfilePicture, setIsLoadingPicture]);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const refreshToken = localStorage.getItem('refresh_token');
      
      try {
        await apiClient.post('logout', {
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

  const getPageTitle = (): string => {
    const currentItem = navigationItems.find(item => item.path === pathname);
    return currentItem?.name ?? 'Student Dashboard';
  }

  return (
    <>
      {/* Navigation Loading Overlay */}
      {(isNavigating || isLoggingOut) && (
        <div className="fixed inset-0 z-[100] bg-white/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-blue-600 animate-loading" />
          </div>
        </div>
      )}
  
      <nav className="sticky top-0 z-50 bg-[#1A2A5B] text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0 bg-[#1A2A5B]">
                  <div className="h-full flex flex-col">
                    <div className="p-6 bg-gradient-to-r from-[#1A2A5B] to-[#0A1A3B]">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold text-white">Menu</SheetTitle>
                      </SheetHeader>
  
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          {isLoadingPicture ? (
                            <div className="w-12 h-12 rounded-full bg-blue-100 animate-pulse" />
                          ) : profilePicture?.temporary_url ? (
                            <img
                              src={profilePicture.temporary_url}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-[#1A2A5B]"
                              onError={() => setProfilePicture(null)}
                            />
                          ) : (
                            <UserCircle className="w-12 h-12 text-white" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-white">{fullName}</span>
                          <span className="text-sm text-gray-300">Student</span>
                        </div>
                      </div>
                    </div>
  
                    <Separator className="bg-gray-700" />
  
                    {/* Mobile Navigation Items */}
                    <div className="flex-1 overflow-auto p-4">
                    <div className="hidden lg:flex items-center space-x-1">
                        {navigationItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={pathname === item.path ? "secondary" : "ghost"}
                            className={`
                              h-9 
                              ${pathname === item.path 
                                ? 'bg-white text-[#647441] hover:bg-[#8A9B61]' // Green when active, darker green on hover
                                : 'text-white hover:bg-gray-600'}
                            `}
                            onClick={() => handleNavigation(item.path)}
                            disabled={isNavigating}
                          >
                            {item.icon}
                            <span className="ml-2">{item.name}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
  
                    <Separator className="bg-gray-700" />
  
                    <div className="p-4">
                      <Button 
                        variant="destructive" 
                        className="w-full bg-red-500 hover:bg-red-600"
                        onClick={handleLogout}
                        disabled={isLoggingOut}
                      >
                        {isLoggingOut ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Logging out...
                          </>
                        ) : (
                          <>
                            <LogOut className="mr-2 h-4 w-4" />
                            Logout
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
  
              {/* Logo and Desktop Navigation */}
              <div className="flex items-center">
                <img 
                  src="/img/square_logo.png" 
                  alt="Logo" 
                  className="h-40 w-40 object-contain -ml-6"
                />
                <h1 className="text-xl font-bold text-white ml-10">{getPageTitle()}</h1>
              </div>

              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={pathname === item.path ? "secondary" : "ghost"}
                    className={`h-9 ${pathname === item.path ? 'bg-white/90 text-[#1A2A5B] hover:bg-white' : 'text-white hover:bg-gray-600'}`}
                    onClick={() => handleNavigation(item.path)}
                    disabled={isNavigating}
                  >
                    {item.icon}
                    <span className="ml-2">{item.name}</span>
                  </Button>
                ))}
              </div>
            </div>
  
            {/* Profile Dropdown */}
            <div className="flex items-center space-x-4">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-gray-600">
                    <div className="relative w-8 h-8">
                      {isLoadingPicture ? (
                        <div className="w-8 h-8 rounded-full bg-white/20 animate-pulse" />
                      ) : profilePicture?.temporary_url ? (
                        <img
                          src={profilePicture.temporary_url}
                          alt="Profile"
                          className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30"
                          onError={() => setProfilePicture(null)}
                        />
                      ) : (
                        <UserCircle className="w-8 h-8" />
                      )}
                    </div>
                    <span>{fullName}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 bg-[#ffffff] text-gray-200">
                  <DropdownMenuLabel className="text-[#1A2A5B]">Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-[#1A2A5B]" />
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/profile')} 
                    disabled={isNavigating || isLoggingOut}
                    className="text-[#1A2A5B] hover:text-white hover:bg-gray-700"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/settings')}
                    disabled={isNavigating || isLoggingOut}
                    className="text-[#1A2A5B] hover:text-white hover:bg-gray-700"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-[#1A2A5B]" />
                  <DropdownMenuItem 
                    className="text-red-500 hover:text-red-600 hover:bg-gray-700"
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