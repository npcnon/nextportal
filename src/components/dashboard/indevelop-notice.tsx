import React, { useState } from 'react';
import { Check, HelpCircle, CreditCard } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import InDevelopmentNotice from "@/components/dashboard/indevelop-notice";



const EnrollmentCompletionNotice: React.FC = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className="max-w-xl mx-auto p-6 space-y-7 bg-white shadow-sm rounded-xl">
      {/* Success Card */}
      <Card className="border-orange-100 bg-orange-50 shadow-md">
        <CardContent className="pt-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="rounded-full bg-orange-100 p-4 shadow-sm">
              <Check className="h-10 w-10 text-orange-600" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-orange-800 mb-3 tracking-tight">
            Enrollment Completed
          </h2>
          <p className="text-base text-orange-700 font-medium">
            Your subjects have been successfully registered. Please complete your payment to finalize enrollment.
          </p>
        </CardContent>
      </Card>

      {/* Help Section */}
      <Alert className="border-gray-200 bg-gray-50 flex items-center gap-4 rounded-lg shadow-sm">
        <HelpCircle className="h-6 w-6 text-gray-700" />
        <div>
          <AlertTitle className="text-base font-semibold text-gray-800">Need Assistance?</AlertTitle>
          <AlertDescription className="text-sm text-gray-600">
            For subject modifications or enrollment inquiries, please contact the Registrar's Office 
            or your Department Administrator.
          </AlertDescription>
        </div>
      </Alert>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-center gap-4">
        <Button 
          onClick={() => setIsDialogOpen(true)}
          className="w-full sm:w-auto bg-[#D44D00] hover:bg-[#B83D00] transition-colors"
        >
          <CreditCard className="mr-2 h-4 w-4" />
          Pay Online
        </Button>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="text-orange-800">Payment System</DialogTitle>
              <DialogDescription className="text-gray-600">
                Online payment options are coming soon.
              </DialogDescription>
            </DialogHeader>
            <InDevelopmentNotice />
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default EnrollmentCompletionNotice;