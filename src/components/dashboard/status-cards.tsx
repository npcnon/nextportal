import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, CheckCircle2, Loader2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import apiClient from '@/lib/axios';
import { useFullDataStore } from '@/lib/fulldata-store';
import { useStudentProfileStore } from '@/lib/profile-store';
import { cn } from "@/lib/utils";

interface Document {
  document_type: string;
}

type StatusType = 'officially enrolled' | 'pending' | 'rejected' | 'initially enrolled';

interface StatusDisplay {
  gradient: string;
  textColor: string;
  label: string;
  progressColor: string;
}

export const StatusCards: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const totalRequiredDocuments = 5;
  const profileData = useStudentProfileStore(state => state.profileData);
  
  const { personal_data, fetchStudentData } = useFullDataStore();

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (profileData?.profile?.student_info?.basicdata_applicant_id) {
          await fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);
          await fetchDocuments();
        }
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [profileData, fetchStudentData]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    }
  };

  const submittedDocumentsCount = documents.length;
  const documentProgress = (submittedDocumentsCount / totalRequiredDocuments) * 100;

  const statusDisplay: Record<StatusType, StatusDisplay> = {
    'pending': {
      gradient: 'from-indigo-600 to-blue-600',
      textColor: 'text-indigo-600',
      label: 'Pending',
      progressColor: '[&>div]:bg-indigo-600'
    },
    'initially enrolled': {
      gradient: 'from-indigo-700 to-blue-700',
      textColor: 'text-indigo-700',
      label: 'Initially Enrolled',
      progressColor: '[&>div]:bg-indigo-700'
    },
    'officially enrolled': {
      gradient: 'from-green-600 to-green-700',
      textColor: 'text-green-600',
      label: 'Officially Enrolled',
      progressColor: '[&>div]:bg-green-600'
    },
    'rejected': {
      gradient: 'from-red-600 to-red-700',
      textColor: 'text-red-600',
      label: 'Rejected',
      progressColor: '[&>div]:bg-red-600'
    }
  };

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center py-4">
      <Loader2 className="h-8 w-8 animate-spin mb-2 text-indigo-600" />
      <p className="text-sm text-indigo-600/70">Loading...</p>
    </div>
  );

  const enrollmentStatus = personal_data?.[0]?.status as StatusType || 'pending';
  const statusInfo = statusDisplay[enrollmentStatus] || statusDisplay['pending'];

  return (
    <div className="grid gap-6 md:grid-cols-3 mb-8">
      {/* Enrollment Status Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-blue-50/50 to-white border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className={cn(
          "flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r",
          statusInfo.gradient
        )}>
          <CardTitle className="text-sm font-medium text-white">Enrollment Status</CardTitle>
          <Clock className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className={cn("text-2xl font-bold mb-1", statusInfo.textColor)}>
                {statusInfo.label}
              </div>
              <p className="text-sm text-indigo-600/70">Current enrollment status</p>
              <Progress 
                value={enrollmentStatus === 'officially enrolled' ? 100 : 33} 
                className={cn(
                  "mt-4 h-2 bg-indigo-100",
                  statusInfo.progressColor
                )}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Enlisted Subjects Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-blue-50/50 to-white border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-600 to-blue-600">
          <CardTitle className="text-sm font-medium text-white">Enlisted Subjects</CardTitle>
          <BookOpen className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className="text-2xl font-bold text-indigo-600 mb-1">4/8</div>
              <p className="text-sm text-indigo-600/70">Subjects selected</p>
              <Progress 
                value={50} 
                className="mt-4 h-2 bg-indigo-100 [&>div]:bg-indigo-600"
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="group relative overflow-hidden bg-gradient-to-br from-indigo-50/50 via-blue-50/50 to-white border-indigo-100 shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-gradient-to-r from-indigo-600 to-blue-600">
          <CardTitle className="text-sm font-medium text-white">Requirements</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-white" />
        </CardHeader>
        <CardContent className="pt-6">
          {loading ? (
            <LoadingState />
          ) : (
            <>
              <div className="text-2xl font-bold text-indigo-600 mb-1">
                {submittedDocumentsCount}/{totalRequiredDocuments}
              </div>
              <p className="text-sm text-indigo-600/70">Documents submitted</p>
              <Progress 
                value={documentProgress} 
                className="mt-4 h-2 bg-indigo-100 [&>div]:bg-indigo-600"
              />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default StatusCards;