import React from 'react';
import { Construction, AlertCircle, ShieldAlert } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

interface InDevelopmentNoticeProps {
  title?: string;
  description?: string;
  showBackButton?: boolean;
  onBack?: () => void;
}

const InDevelopmentNotice: React.FC<InDevelopmentNoticeProps> = ({ 
  title = "Section Under Development",
  description = "This section is currently being built and tested.",
  showBackButton = true,
  onBack
}) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] p-8 space-y-8">
      <div className="relative">
        <Construction className="h-16 w-16 text-yellow-500 animate-pulse" />
        <ShieldAlert className="h-8 w-8 text-orange-500 absolute -bottom-2 -right-2" />
      </div>
      
      <Alert variant="default" className="max-w-md border-yellow-500 bg-yellow-50">
        <AlertCircle className="h-5 w-5 text-yellow-600" />
        <AlertTitle className="ml-2 text-yellow-700">Development in Progress</AlertTitle>
        <AlertDescription className="ml-2 text-yellow-600">
          This feature is not yet available and may cause unexpected behavior
        </AlertDescription>
      </Alert>
      
      <div className="text-center space-y-4 max-w-md">
        <h3 className="text-xl font-semibold text-gray-800">
          {title}
        </h3>
        <p className="text-gray-600">
          {description}
        </p>
        <p className="text-sm text-gray-500 italic">
          Our team is working hard to complete this feature. Please check back later.
        </p>
      </div>
      
      {showBackButton && (
        <Button
          variant="outline"
          onClick={onBack}
          className="mt-6 group hover:border-yellow-500 hover:text-yellow-700"
        >
          <AlertCircle className="mr-2 h-4 w-4 group-hover:text-yellow-500" />
          Return to Previous Page
        </Button>
      )}
    </div>
  );
};

export default InDevelopmentNotice;