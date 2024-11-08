import React from 'react';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const RegistrationRequiredNotice = () => {
  return (
    <div className="flex flex-col items-center justify-center p-12 space-y-6">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-5 w-5" />
        <AlertDescription className="ml-2">
          Registration must be completed before accessing this section
        </AlertDescription>
      </Alert>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-700">
          Complete Your Registration
        </h3>
        <p className="text-gray-500 max-w-sm">
          Please complete your student registration to access this section and other features.
        </p>
      </div>
    </div>
  );
};

export default RegistrationRequiredNotice;