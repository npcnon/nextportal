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
  children: React.ReactNode;
}

export const StudentRegistrationDialog: React.FC<StudentRegistrationDialogProps> = ({ 
  children 
}) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="max-w-[95vw] md:max-w-5xl h-[95vh] md:h-[90vh] overflow-hidden mx-2 md:mx-auto">
        <DialogHeader className="space-y-2 md:space-y-3">
          <DialogTitle className="text-xl md:text-2xl">Student Registration</DialogTitle>
          <DialogDescription className="text-sm md:text-base">
            Please fill out all required information in the registration form below.
          </DialogDescription>
        </DialogHeader>
        <div className="flex-1 overflow-y-auto px-2 md:px-4">
          <StudentRegistrationForm />
        </div>
      </DialogContent>
    </Dialog>
  );
};