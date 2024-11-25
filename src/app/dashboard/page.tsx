
"use client"

import React, { useEffect, useState } from 'react';
import { StatusCards } from '@/components/dashboard/status-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectEnlistment } from '@/components/forms/subject-enlistment';
import DocumentSubmission from '@/components/files/DocumentSubmission';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from '@/hooks/use-toast'

import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StudentRegistrationForm from '@/components/forms/student-registration';
import { RegistrationButton } from '@/components/dashboard/registration-button';
import { useFullDataStore } from '@/lib/fulldata-store';
import { useStudentProfileStore } from '@/lib/profile-store';
import RegistrationRequiredNotice from '@/components/dashboard/registration-notice';
import { GraduationCap, FileText, CreditCard, X } from "lucide-react";
import { Skeleton } from '@/components/ui/skeleton';
import unauthenticatedApiClient from '@/lib/clients/unauthenticated-api-client';
import EnrollmentCompletionNotice from '@/components/dashboard/enrollment-notice';

// Types and interfaces
interface PersonalData {
  status: string;
  // Add other fields as needed
}

interface MountedComponentProps {
  show: boolean;
  personal_data?: PersonalData[];
}

interface StudentRegistrationDialogProps {
  trigger: React.ReactNode;
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}


// Mounted Components with TypeScript


export default function StudentDashboard(): JSX.Element {
  const { isLoading,isEnlistedThisSemester, isInitialized, personal_data = []} = useFullDataStore();
  const [activeTab, setActiveTab] = useState<'enlistment' | 'requirements' | 'payment'>('enlistment');
  const {isLoadingProfile} = useStudentProfileStore();
  const [isLoadingCourse, setIsLoadingCourse] = useState(false);

  const { toast } = useToast()

  const MountedComponents = {
    Enlistment: ({ show, personal_data = [] }: MountedComponentProps) => {
      if (!Array.isArray(personal_data)) return null; // Add safety check
      return (
        <div style={{ display: show ? 'block' : 'none' }}>
          {personal_data && personal_data.length > 0 && 
             isEnlistedThisSemester
              ?  <EnrollmentCompletionNotice />
              : <SubjectEnlistment />
            }
          
        </div>
      );
    },
  
    Requirements: ({ show, personal_data= [] }: MountedComponentProps) => {
      if (!Array.isArray(personal_data)) return null; // Add safety check
      return (
        <div style={{ display: show ? 'block' : 'none' }}>
          <div className="space-y-6">
            {personal_data && personal_data.length > 0
              ? <DocumentSubmission /> 
              : <RegistrationRequiredNotice />
            }
          </div>
        </div>
      );
    },
  
    Payment: ({ show }: MountedComponentProps) => (
      <div style={{ display: show ? 'block' : 'none' }}>
        <TabContent className="text-[#1A2A5B]/70">
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <CreditCard className="w-16 h-16 text-[#1A2A5B]/50" />
            <h3 className="text-xl font-semibold text-[#1A2A5B]">
              Payment Section Coming Soon
            </h3>
            <p className="text-[#1A2A5B]/70 max-w-md text-center">
              We're working on bringing you a seamless payment experience. Check back soon!
            </p>
          </div>
        </TabContent>
      </div>
    )
  };

  // Add useEffect to handle the initial mounting state
  // useEffect(() => {
  //   const timer = setTimeout(() => {
  //     setIsMounting(false);
  //   }, 2000); // You can adjust this timeout as needed

  //   return () => clearTimeout(timer);
  // }, []);

  // //TODO: fix loading stuff
  // if (isMounting || isLoading || isLoadingProfile) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
  //       <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
  //         {/* Skeleton loading state */}
  //         <div className="mb-8 flex items-center justify-between">
  //           <div className="space-y-1">
  //             <Skeleton className="h-8 w-64" />
  //             <Skeleton className="h-4 w-48" />
  //           </div>
  //           <Skeleton className="h-10 w-32" />
  //         </div>

  //         <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  //           {[1, 2, 3, 4].map((i) => (
  //             <Skeleton key={i} className="h-32 w-full rounded-xl" />
  //           ))}
  //         </div>

  //         <div className="mt-8 bg-white rounded-xl shadow-lg border border-[#1A2A5B]/20 overflow-hidden">
  //           <div className="h-16 px-6 border-b border-[#1A2A5B]/20">
  //             <div className="flex gap-4 h-full items-center">
  //               {[1, 2, 3].map((i) => (
  //                 <Skeleton key={i} className="h-8 w-32" />
  //               ))}
  //             </div>
  //           </div>
            
  //           <div className="p-6">
  //             <Skeleton className="h-[400px] w-full rounded-xl" />
  //           </div>
  //         </div>
  //       </main>
  //     </div>
  //   );
  // }
  
  const handleTabChange = (value: string) => {
    // Type guard to ensure value is TabValue
    if (value === 'enlistment' || value === 'requirements' || value === 'payment') {
      setActiveTab(value);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <main className="max-w-7xl mx-auto py-4 sm:py-8 px-3 sm:px-6 lg:px-8">
        {/* Responsive header section */}
        <div className="mb-4 sm:mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
          <div className="space-y-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 tracking-tight">
              Student Dashboard
            </h1>
            <p className="text-sm sm:text-base text-gray-600">Manage your academic journey</p>
          </div>
          <StudentRegistrationDialog 
            trigger={
              isLoading || isLoadingProfile || isLoadingCourse ? (
                <RegistrationButton status="loading" />
              ) : personal_data.length === 0 ? (
                <RegistrationButton status="required" />
              ) : (
                <RegistrationButton status="complete" disabled />
              )
            }
          />
        </div>

        <StatusCards />
        
        {/* Responsive tabs container */}
        <div className="mt-4 sm:mt-8 bg-white rounded-xl shadow-lg border border-[#1A2A5B]/20 overflow-hidden">
          <Tabs 
            defaultValue="enlistment" 
            className="space-y-4"
            onValueChange={handleTabChange}
          >
            {isLoading || isLoadingProfile || isLoadingCourse ? (
              <ScrollArea className="w-full border-b border-[#1A2A5B]/20">
                <div className="px-3 sm:px-6">
                  <div className="h-16 flex items-center gap-2">
                    <Skeleton className="h-10 w-32 sm:w-40 rounded-md" />
                    <Skeleton className="h-10 w-28 sm:w-36 rounded-md" />
                    <Skeleton className="h-10 w-24 sm:w-32 rounded-md" />
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <ScrollArea className="w-full border-b border-[#1A2A5B]/20">
                <div className="px-3 sm:px-6">
                  <TabsList className="h-16 w-full flex flex-wrap justify-start sm:justify-start overflow-x-auto">
                    <TabsTrigger 
                      value="enlistment"
                      className="flex-1 sm:flex-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1A2A5B] 
                              data-[state=active]:to-[#1A2A5B] data-[state=active]:text-white hover:bg-[#1A2A5B]/10 
                              data-[state=active]:hover:from-[#1A2A5B] data-[state=active]:hover:to-[#1A2A5B]/90 
                              transition-all duration-300 px-3 sm:px-6 gap-2 text-sm sm:text-base"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span className="hidden sm:inline">Subject</span> Enlistment
                    </TabsTrigger>
                    <TabsTrigger 
                      value="requirements"
                      className="flex-1 sm:flex-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1A2A5B] 
                              data-[state=active]:to-[#1A2A5B] data-[state=active]:text-white hover:bg-[#1A2A5B]/10 
                              data-[state=active]:hover:from-[#1A2A5B] data-[state=active]:hover:to-[#1A2A5B]/90 
                              transition-all duration-300 px-3 sm:px-6 gap-2 text-sm sm:text-base"
                    >
                      <FileText className="w-4 h-4" />
                      Requirements
                    </TabsTrigger>
                    <TabsTrigger 
                      value="payment"
                      className="flex-1 sm:flex-none data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#1A2A5B] 
                              data-[state=active]:to-[#1A2A5B] data-[state=active]:text-white hover:bg-[#1A2A5B]/10 
                              data-[state=active]:hover:from-[#1A2A5B] data-[state=active]:hover:to-[#1A2A5B]/90 
                              transition-all duration-300 px-3 sm:px-6 gap-2 text-sm sm:text-base"
                    >
                      <CreditCard className="w-4 h-4" />
                      Payment
                    </TabsTrigger>
                  </TabsList>
                </div>
              </ScrollArea>
            )}

            <div className="p-3 sm:p-6">
              {/* [MountedComponents remain the same] */}
              <MountedComponents.Enlistment 
                show={activeTab === 'enlistment'}
                personal_data={Array.isArray(personal_data) ? personal_data : []}
              />
              <MountedComponents.Requirements 
                show={activeTab === 'requirements'}
                personal_data={Array.isArray(personal_data) ? personal_data : []}
              />
              <MountedComponents.Payment 
                show={activeTab === 'payment'}
              />
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
const StudentRegistrationDialog: React.FC<StudentRegistrationDialogProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] sm:max-w-5xl h-[90vh] flex flex-col bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 shadow-xl mx-2">
        <DialogHeader className="bg-gradient-to-r from-[#1A2A5B] to-[#142247] text-white p-3 sm:p-4 rounded-t-lg mt-4 flex-shrink-0">
          <DialogTitle className="text-xl sm:text-2xl font-bold tracking-tight">
            Student Information
          </DialogTitle>
          <DialogDescription className="text-indigo-100 mt-2 text-sm sm:text-base">
            Please complete all required fields in the registration form below to proceed with your enrollment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 relative">
          <StudentRegistrationForm />
        </div>
        <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
          <X className="h-4 w-4 text-white" />
          <span className="sr-only">Close</span>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};

const TabContent: React.FC<TabContentProps> = ({ children, className }) => (
  <div className={`p-4 sm:p-8 rounded-xl ${className}`}>
    {children}
  </div>
);