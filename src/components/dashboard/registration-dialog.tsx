// components/dashboard/registration-dialog.tsx
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import StudentRegistrationForm from '../forms/student-registration';

interface StudentRegistrationDialogProps {
  children: React.ReactNode;  // Changed from trigger to children
}

export const StudentRegistrationDialog: React.FC<StudentRegistrationDialogProps> = ({ 
  children 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle>Student Registration</DialogTitle>
          <DialogDescription>
            Please fill out all required information in the registration form below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto">
          <StudentRegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};