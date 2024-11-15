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
import apiClient, { clearAuthTokens } from '@/lib/axios';
import { useToast } from '@/hooks/use-toast';

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
  const [profilePicture, setProfilePicture] = useState<ProfilePicture | null>(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);

  const profileData = useStudentProfileStore((state) => state.profileData);
  const clearProfile = useStudentProfileStore((state) => state.clearProfile);
  const fullName = profileData.name || 'Loading...';

  const navigationItems: NavigationItem[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5" />,
      description: 'View your student dashboard',
    },
    {
      name: 'Academics',
      path: '/academics',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Access your academic information',
    },
    {
      name: 'Campus Life',
      path: '/campus-life',
      icon: <GraduationCap className="w-5 h-5" />,
      description: 'Explore campus activities',
    },
    {
      name: 'Chats',
      path: '/chats',
      icon: <Users className="w-5 h-5" />,
      description: 'Message your classmates',
    }
  ];

  const handleNavigation = (path: string) => {
    setIsNavigating(true);
    router.push(path);
  };

  // Fetch profile picture
  useEffect(() => {
    const fetchProfilePicture = async () => {
      try {
        setIsLoadingPicture(true);
        const response = await apiClient.get('/documents');
        const profileDoc = response.data.documents.find((doc: any) => doc.document_type === 'Profile Picture');
        
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

  // Get the current page title based on the pathname
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
            <div className="h-full bg-indigo-600 animate-loading" />
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 to-blue-600 text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden text-white hover:bg-white/10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80 p-0">
                  <div className="h-full flex flex-col">
                    {/* Mobile Navigation Profile Section */}
                    <div className="p-6 bg-gradient-to-r from-indigo-50 via-blue-50 to-white">
                      <SheetHeader className="mb-6">
                        <SheetTitle className="text-2xl font-bold text-indigo-900">Menu</SheetTitle>
                      </SheetHeader>
                      
                      <div className="flex items-center gap-4">
                        <div className="relative w-12 h-12">
                          {isLoadingPicture ? (
                            <div className="w-12 h-12 rounded-full bg-indigo-100 animate-pulse" />
                          ) : profilePicture?.temporary_url ? (
                            <img
                              src={profilePicture.temporary_url}
                              alt="Profile"
                              className="w-12 h-12 rounded-full object-cover ring-2 ring-indigo-200"
                              onError={() => setProfilePicture(null)}
                            />
                          ) : (
                            <UserCircle className="w-12 h-12 text-indigo-600" />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold text-indigo-900">{fullName}</span>
                          <span className="text-sm text-indigo-600/70">Student</span>
                        </div>
                      </div>
                    </div>

                    <Separator className="bg-indigo-100" />

                    {/* Mobile Navigation Items */}
                    <div className="flex-1 overflow-auto p-4">
                      <div className="space-y-2">
                        {navigationItems.map((item) => (
                          <Button
                            key={item.path}
                            variant={pathname === item.path ? "secondary" : "ghost"}
                            className={`w-full justify-start h-auto py-3 ${
                              pathname === item.path 
                                ? 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100' 
                                : 'hover:bg-indigo-50 text-indigo-600/70'
                            }`}
                            onClick={() => handleNavigation(item.path)}
                            disabled={isNavigating}
                          >
                            <div className="flex items-center gap-3">
                              {item.icon}
                              <div className="flex flex-col items-start">
                                <span className="font-medium">{item.name}</span>
                                <span className="text-xs text-indigo-600/50">
                                  {item.description}
                                </span>
                              </div>
                            </div>
                          </Button>
                        ))}
                      </div>
                    </div>

                    <Separator className="bg-indigo-100" />

                    {/* Mobile Navigation Footer */}
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

              {/* Desktop Navigation */}
              <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
              <div className="hidden lg:flex items-center space-x-1">
                {navigationItems.map((item) => (
                  <Button
                    key={item.path}
                    variant={pathname === item.path ? "secondary" : "ghost"}
                    className={`h-9 ${
                      pathname === item.path 
                        ? 'bg-white/90 text-indigo-600 hover:bg-white' 
                        : 'text-white hover:bg-white/10'
                    }`}
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
                  <Button variant="ghost" className="flex items-center space-x-2 text-white hover:bg-white/10">
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
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="text-indigo-900">Account</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/profile')} 
                    disabled={isNavigating || isLoggingOut}
                    className="text-indigo-600/70 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleNavigation('/settings')}
                    disabled={isNavigating || isLoggingOut}
                    className="text-indigo-600/70 hover:text-indigo-600 hover:bg-indigo-50"
                  >
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-indigo-100" />
                  <DropdownMenuItem 
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
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