import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import apiClient from '@/lib/axios';
import { useFullDataStore } from '@/lib/fulldata-store';
import { useStudentProfileStore } from '@/lib/profile-store';

// Define Document type for documents fetched from API
interface Document {
  document_type: string;
  // Add other properties of Document if needed
}

// Define possible status types
type StatusType = 'officially enrolled' | 'pending' | 'rejected' | 'initially enrolled';

// Define type for color and label
interface StatusDisplay {
  color: string;
  label: string;
}

export const StatusCards: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();
  const totalRequiredDocuments = 5;
  const profileData = useStudentProfileStore(state => state.profileData);

  const { 
    personal_data,
    fetchStudentData 
  } = useFullDataStore();


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
      setLoading(true)
      const response = await apiClient.get('/documents');
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      
    }
  };



  const submittedDocumentsCount = documents.length;
  const documentProgress = (submittedDocumentsCount / totalRequiredDocuments) * 100;

  // Map statuses to colors and display names
  const statusDisplay: Record<StatusType, StatusDisplay> = {
    'pending': { color: 'text-orange-500', label: 'Pending' },
    'initially enrolled': { color: 'text-yellow-500', label: 'Initially Enrolled' },
    'officially enrolled': { color: 'text-green-500', label: 'Officially Enrolled' },
    'rejected': { color: 'text-red-500', label: 'Rejected' },
  };

  const enrollmentStatus = personal_data?.[0]?.status as StatusType || 'pending';
  const statusInfo = statusDisplay[enrollmentStatus] || statusDisplay['pending'];

  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      {/* Enrollment Status Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrollment Status</CardTitle>
          <Clock className={`h-4 w-4 ${statusInfo.color}`} />
        </CardHeader>
        <CardContent>
        {loading ? (
            <div className="text-2xl font-bold">Loading...</div>
          ) : (
            <>
              <div className={`text-2xl font-bold ${statusInfo.color}`}>{statusInfo.label}</div>
              <p className="text-xs text-gray-500">Current enrollment status</p>
              <Progress value={enrollmentStatus === 'officially enrolled' ? 100 : 33} className="mt-2" />
            </>
          )}
          </CardContent>
      </Card>

      {/* Enlisted Subjects Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enlisted Subjects</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4/8</div>
          <p className="text-xs text-gray-500">Subjects selected</p>
          <Progress value={50} className="mt-2" />
        </CardContent>
      </Card>

      {/* Requirements Card */}
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requirements</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-2xl font-bold">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {submittedDocumentsCount}/{totalRequiredDocuments}
              </div>
              <p className="text-xs text-gray-500">Documents submitted</p>
              <Progress value={documentProgress} className="mt-2" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
