'use client'

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Menu,
  BookOpen,
  GraduationCap,
  Users,
  LayoutDashboard,
  Bell,
  Settings,
  LogOut,
  Calendar,
  FileText
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const NavigationDrawer = () => {
  const router = useRouter();
  const pathname = usePathname();

  const mainNavItems = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
      description: 'View your student dashboard',
      notifications: 2
    },
    {
      name: 'Academics',
      path: '/academics',
      icon: <BookOpen className="w-5 h-5 mr-2" />,
      description: 'Access your academic information',
      notifications: 0
    }
  ];

  const secondaryNavItems = [
    {
      name: 'Campus Life',
      path: '/campus-life',
      icon: <GraduationCap className="w-5 h-5 mr-2" />,
      description: 'Explore campus activities',
      notifications: 3
    },
    {
      name: 'Chats',
      path: '/chats',
      icon: <Users className="w-5 h-5 mr-2" />,
      description: 'Message your classmates',
      notifications: 5
    }
  ];

  const utilityNavItems = [
    {
      name: 'Schedule',
      path: '/schedule',
      icon: <Calendar className="w-5 h-5 mr-2" />,
      description: 'View your class schedule',
      notifications: 0
    },
    {
      name: 'Documents',
      path: '/documents',
      icon: <FileText className="w-5 h-5 mr-2" />,
      description: 'Access your documents',
      notifications: 1
    }
  ];

  const NavigationSection = ({ items }: { items: typeof mainNavItems }) => (
    <nav className="flex flex-col gap-2">
      {items.map((item) => (
        <Button
          key={item.path}
          variant={pathname === item.path ? "secondary" : "ghost"}
          className="w-full justify-start relative h-auto py-4"
          onClick={() => router.push(item.path)}
        >
          <div className="flex items-start">
            {item.icon}
            <div className="flex flex-col items-start">
              <span className="font-medium">{item.name}</span>
              <span className="text-xs text-muted-foreground">
                {item.description}
              </span>
            </div>
          </div>
          {item.notifications > 0 && (
            <Badge variant="destructive" className="absolute right-2 top-2">
              {item.notifications}
            </Badge>
          )}
        </Button>
      ))}
    </nav>
  );

  return (
    <div className="flex items-center gap-4">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <Menu className="h-6 w-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0">
          <div className="h-full flex flex-col">
            {/* Header with User Profile */}
            <div className="p-6 bg-primary/5">
              <SheetHeader className="mb-6">
                <SheetTitle className="text-2xl font-bold">Student Portal</SheetTitle>
              </SheetHeader>
              
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12">
                  <AvatarImage src="/placeholder-avatar.jpg" />
                  <AvatarFallback>SM</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="font-semibold">Student Name</span>
                  <span className="text-sm text-muted-foreground">ID: 12345678</span>
                </div>
              </div>
            </div>

            <Separator />

            {/* Navigation Items */}
            <div className="flex-1 overflow-auto px-4 py-6">
              <div className="space-y-6">
                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-2">MAIN NAVIGATION</h2>
                  <NavigationSection items={mainNavItems} />
                </div>

                <Separator />

                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-2">CAMPUS & SOCIAL</h2>
                  <NavigationSection items={secondaryNavItems} />
                </div>

                <Separator />

                <div>
                  <h2 className="text-sm font-semibold text-muted-foreground mb-2 px-2">UTILITIES</h2>
                  <NavigationSection items={utilityNavItems} />
                </div>
              </div>
            </div>

            <Separator />

            {/* Footer Actions */}
            <div className="p-6">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="icon">
                  <Bell className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Settings className="h-5 w-5" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <LogOut className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuItem className="text-destructive">
                      Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Regular Header Content */}
      <div className="flex items-center gap-2">
        <h1 className="font-semibold">Student Dashboard</h1>
        <Badge variant="outline" className="ml-2">Beta</Badge>
      </div>
    </div>
  );
};

export default NavigationDrawer;