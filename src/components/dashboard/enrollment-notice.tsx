import React from 'react';
import { Check, HelpCircle, Mail } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

const EnrollmentCompletionNotice: React.FC = () => {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      {/* Success Card */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-green-100 p-3">
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </div>
          
          <h2 className="text-2xl font-semibold text-green-800 mb-2">
            Enrollment Complete!
          </h2>
          <p className="text-green-600">
            Your subjects have been successfully enlisted
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert>
        <HelpCircle className="h-4 w-4" />
        <AlertTitle>Need help?</AlertTitle>
        <AlertDescription>
          If you need to modify your subjects or have any concerns, please visit the Registrar's Office 
          or contact your Department Administrator.
        </AlertDescription>
      </Alert>

      {/* Action Buttons */}
      <div className="flex justify-center gap-4">
        <Button variant="outline">
          <Mail className="mr-2 h-4 w-4" />
          Contact Support
        </Button>
        <Button>
          View Enlisted Subjects
        </Button>
      </div>
    </div>
  );
};

export default EnrollmentCompletionNotice;