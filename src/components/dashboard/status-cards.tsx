import React, { useEffect, useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { AuthenticationError } from '@/lib/axios';
import { useFullDataStore } from '@/lib/fulldata-store';
import { cn } from "@/lib/utils";
import { FiCheckCircle, FiAlertCircle, FiFileText, FiBookOpen } from 'react-icons/fi';

interface Document {
  document_type: string;
}

type StatusType = 'officially enrolled' | 'pending' | 'rejected' | 'initially enrolled';

interface StatusDisplay {
  gradient: string;
  textColor: string;
  label: string;
  progressColor: string;
  Icon: React.ComponentType<{ className?: string }>;
}

const CardSkeleton = () => (
  <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg">
    <CardContent className="pt-4 flex items-center">
      <Skeleton className="h-10 w-10 rounded-full mr-3" />
      <div className="w-full">
        <Skeleton className="h-6 w-24 mb-2" />
        <Skeleton className="h-4 w-32 mb-3" />
        <Skeleton className="h-2 w-full" />
      </div>
    </CardContent>
  </Card>
);

export const StatusCards: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const totalRequiredDocuments = 5;
  
  const { personal_data, isInitialized } = useFullDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        await fetchDocuments();
      } catch (error) {
        console.error(error);
      }
    };
    fetchData();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      if (!(error instanceof AuthenticationError)) {
        toast({
          title: "Error",
          description: "Failed to load documents",
          variant: "destructive",
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const submittedDocumentsCount = documents.length;
  const documentProgress = (submittedDocumentsCount / totalRequiredDocuments) * 100;

  const statusDisplay: Record<StatusType, StatusDisplay> = {
    'pending': {
      gradient: '',
      textColor: 'text-black',
      label: 'Pending',
      progressColor: '[&>div]:bg-blue-600',
      Icon: FiAlertCircle
    },
    'initially enrolled': {
      gradient: '',
      textColor: 'text-black',
      label: 'Initially Enrolled',
      progressColor: '[&>div]:bg-blue-700',
      Icon: FiCheckCircle
    },
    'officially enrolled': {
      gradient: '',
      textColor: 'text-black',
      label: 'Officially Enrolled',
      progressColor: '[&>div]:bg-blue-600',
      Icon: FiCheckCircle
    },
    'rejected': {
      gradient: '',
      textColor: 'text-red-600',
      label: 'Rejected',
      progressColor: '[&>div]:bg-red-600',
      Icon: FiAlertCircle
    }
  };

  // Show skeletons if either documents are loading or fulldata is not initialized
  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    );
  }

  const enrollmentStatus = personal_data?.[0]?.status as StatusType || 'pending';
  const statusInfo = statusDisplay[enrollmentStatus] || statusDisplay['pending'];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Enrollment Status Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="pt-4 flex items-center">
          <statusInfo.Icon className="text-4xl text-blue-600 mr-3" />
          <div>
            <div className={cn("text-xl font-bold mb-1", statusInfo.textColor)}>
              {statusInfo.label}
            </div>
            <p className="text-sm text-black/70">Current enrollment status</p>
            <Progress 
              value={enrollmentStatus === 'officially enrolled' ? 100 : 33} 
              className={cn(
                "mt-3 h-2 bg-blue-100",
                statusInfo.progressColor
              )}
            />
          </div>
        </CardContent>
      </Card>

      {/* Enlisted Subjects Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="pt-4 flex items-center">
          <FiBookOpen className="text-4xl text-blue-600 mr-3" />
          <div>
            <div className="text-xl font-bold text-black mb-1">4/8</div>
            <p className="text-sm text-black/70">Subjects selected</p>
            <Progress 
              value={50} 
              className="mt-3 h-2 bg-blue-100 [&>div]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardContent className="pt-4 flex items-center">
          <FiFileText className="text-4xl text-blue-600 mr-3" />
          <div>
            <div className="text-xl font-bold text-black mb-1">
              {submittedDocumentsCount}/{totalRequiredDocuments}
            </div>
            <p className="text-sm text-black/70">Documents submitted</p>
            <Progress 
              value={documentProgress} 
              className="mt-3 h-2 bg-blue-100 [&>div]:bg-blue-600"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;