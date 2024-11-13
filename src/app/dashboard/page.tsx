// app/(dashboard)/page.tsx
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
import InDevelopmentNotice from '@/components/dashboard/indevelop-notice';

interface StudentRegistrationDialogProps {
    trigger: React.ReactNode;
}

interface TabContentProps {
  children: React.ReactNode;
  className?: string;
}

const StudentRegistrationDialog: React.FC<StudentRegistrationDialogProps> = ({ trigger }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Student Information</DialogTitle>
          <DialogDescription>
            Please fill out all required information in the registration form below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
        {/* <InDevelopmentNotice/> */}
          <StudentRegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};

const TabContent: React.FC<TabContentProps> = ({ children, className }) => (
  <div className={`p-4 text-center text-gray-500 ${className}`}>
    {children}
  </div>
);


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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold text-gray-900">Student Dashboard</h1>
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
        
        <div className="mt-6 bg-white rounded-lg shadow">
          <Tabs defaultValue="enlistment" className="space-y-4">
            <ScrollArea className="w-full border-b">
              <div className="px-4">
                <TabsList className="h-14">
                  <TabsTrigger value="enlistment">Subject Enlistment</TabsTrigger>
                  <TabsTrigger value="requirements">Requirements</TabsTrigger>
                  <TabsTrigger value="payment">Payment</TabsTrigger>
                </TabsList>
              </div>
            </ScrollArea>
            
            <div className="p-4">
              <TabsContent value="enlistment">
              <InDevelopmentNotice/>
              {/* <SubjectEnlistment />  */}
              {/* {personal_data.length? <SubjectEnlistment /> : <RegistrationRequiredNotice />} */}
              </TabsContent>

              <TabsContent value="requirements">
                <div className="space-y-6">
                {/* <InDevelopmentNotice/> */}
                {/* <DocumentUploadManager/> */}
                {personal_data.length > 0 && personal_data[0].status === 'initially enrolled'? <DocumentUploadManager/> : <RegistrationRequiredNotice />}
                </div>
              </TabsContent>

              <TabsContent value="payment">
                <TabContent>
                  Payment section coming soon
                </TabContent>
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </main>
    </div>
  );
}