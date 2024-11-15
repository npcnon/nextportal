"use client"

import React, { useEffect, useState } from 'react';
import { StatusCards } from '@/components/dashboard/status-cards';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubjectEnlistment } from '@/components/forms/subject-enlistment';
import DocumentUploadManager from '@/components/files/DocumentSubmission';
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
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
import { GraduationCap, FileText, CreditCard } from "lucide-react";

interface StudentRegistrationDialogProps {
    trigger: React.ReactNode;
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

export default function StudentDashboard(): React.JSX.Element {
  const [isLoading, setIsLoading] = useState(true);
  
  const { 
    personal_data,
    fetchStudentData 
  } = useFullDataStore();
  const profileData = useStudentProfileStore(state => state.profileData);

  useEffect(() => {
    const fetchData = async () => {
      if (profileData?.profile?.student_info?.basicdata_applicant_id) {
        await fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);
        setIsLoading(false);
      }
    };
    fetchData();
  }, [profileData, fetchStudentData]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white">
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold text-indigo-900 tracking-tight">Student Dashboard</h1>
            <p className="text-indigo-600/70">Manage your academic journey</p>
          </div>
          {isLoading ? (
            <StudentRegistrationDialog 
              trigger={<RegistrationButton status="loading" />}
            />
          ) : (
            <StudentRegistrationDialog 
              trigger={personal_data.length === 0 ? (
                <RegistrationButton status="required" />
              ) : (
                <RegistrationButton status="complete" disabled />
              )}
            />
          )}
        </div>

        <StatusCards />
        
        <div className="mt-8 bg-white rounded-xl shadow-lg border border-indigo-100 overflow-hidden">
          <Tabs defaultValue="enlistment" className="space-y-4">
            <ScrollArea className="w-full border-b border-indigo-100">
              <div className="px-6">
                <TabsList className="h-16">
                  <TabsTrigger 
                    value="enlistment"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 
                             data-[state=active]:text-white hover:bg-indigo-50 data-[state=active]:hover:from-indigo-700 
                             data-[state=active]:hover:to-blue-700 transition-all duration-300 px-6 gap-2"
                  >
                    <GraduationCap className="w-4 h-4" />
                    Subject Enlistment
                  </TabsTrigger>
                  <TabsTrigger 
                    value="requirements"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 
                             data-[state=active]:text-white hover:bg-indigo-50 data-[state=active]:hover:from-indigo-700 
                             data-[state=active]:hover:to-blue-700 transition-all duration-300 px-6 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    Requirements
                  </TabsTrigger>
                  <TabsTrigger 
                    value="payment"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 
                             data-[state=active]:text-white hover:bg-indigo-50 data-[state=active]:hover:from-indigo-700 
                             data-[state=active]:hover:to-blue-700 transition-all duration-300 px-6 gap-2"
                  >
                    <CreditCard className="w-4 h-4" />
                    Payment
                  </TabsTrigger>
                </TabsList>
              </div>
            </ScrollArea>
            
            <div className="p-6">
              <TabsContent 
                value="enlistment" 
                className="bg-white rounded-xl"
              >
                <SubjectEnlistment />
              </TabsContent>

              <TabsContent 
                value="requirements"
                className="bg-white rounded-xl"
              >
                <div className="space-y-6">
                  {personal_data.length > 0 && personal_data[0].status === 'initially enrolled' 
                    ? <DocumentUploadManager/> 
                    : <RegistrationRequiredNotice />
                  }
                </div>
              </TabsContent>

              <TabsContent 
                value="payment"
                className="bg-white rounded-xl"
              >
                <TabContent className="text-indigo-600/70">
                  <div className="flex flex-col items-center justify-center py-12 space-y-4">
                    <CreditCard className="w-16 h-16 text-indigo-300" />
                    <h3 className="text-xl font-semibold text-indigo-900">Payment Section Coming Soon</h3>
                    <p className="text-indigo-600/70 max-w-md text-center">
                      We're working on bringing you a seamless payment experience. Check back soon!
                    </p>
                  </div>
                </TabContent>
              </TabsContent>
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
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden bg-gradient-to-br from-white to-indigo-50/30 border border-indigo-100 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white p-8 rounded-t-lg">
          <DialogTitle className="text-2xl font-bold tracking-tight">Student Information</DialogTitle>
          <DialogDescription className="text-indigo-100 mt-2">
            Please complete all required fields in the registration form below to proceed with your enrollment.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto p-8">
          <StudentRegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TabContent: React.FC<TabContentProps> = ({ children, className }) => (
  <div className={`p-8 rounded-xl ${className}`}>
    {children}
  </div>
);