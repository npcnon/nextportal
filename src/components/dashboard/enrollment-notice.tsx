import React from 'react';
import { Check, HelpCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EnrollmentCompletionNotice: React.FC = () => {
  return (
    <div className="max-w-xl mx-auto p-4 space-y-6">
      {/* Success Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-semibold text-green-800 mb-2">
            Enrollment Complete!
          </h2>
          <p className="text-sm sm:text-base text-green-600">
            Your subjects have been successfully enlisted.
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
        <HelpCircle className="h-5 w-5 text-gray-800" />
        <div>
          <AlertTitle className="text-sm sm:text-base font-semibold">Need help?</AlertTitle>
          <AlertDescription className="text-sm text-gray-600">
            If you need to modify your subjects or have any concerns, please visit the Registrar's Office 
            or contact your Department Administrator.
          </AlertDescription>
        </div>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button variant="outline" className="w-full sm:w-auto">
          <Mail className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
        <Button className="w-full sm:w-auto">
          View Enlisted Subjects
        </Button>
      </div>
    </div>
  );
};

export default EnrollmentCompletionNotice;
