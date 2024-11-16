  import React, { useEffect, useState } from 'react';
  import { Card, CardContent } from "@/components/ui/card";
  import { Progress } from "@/components/ui/progress";
  import { useToast } from "@/hooks/use-toast";
  import apiClient from '@/lib/axios';
  import { useFullDataStore } from '@/lib/fulldata-store';
  import { useStudentProfileStore } from '@/lib/profile-store';
  import { cn } from "@/lib/utils";
  import { FiCheckCircle, FiAlertCircle, FiFileText, FiBookOpen } from 'react-icons/fi'; // Importing icons
  import { Loader2 } from 'lucide-react';

  interface Document {
    document_type: string;
  }

  type StatusType = 'officially enrolled' | 'pending' | 'rejected' | 'initially enrolled';

  interface StatusDisplay {
    gradient: string;
    textColor: string;
    label: string;
    progressColor: string;
    Icon: React.ComponentType<{ className?: string }>; // Specifies that Icon should accept className
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
    }, []);

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
        gradient: '',
        textColor: 'text-black',
        label: 'Pending',
        progressColor: '[&>div]:bg-blue-600',
        Icon: FiAlertCircle // Icon for pending status
      },
      'initially enrolled': {
        gradient: '',
        textColor: 'text-black',
        label: 'Initially Enrolled',
        progressColor: '[&>div]:bg-blue-700',
        Icon: FiCheckCircle // Icon for initially enrolled status
      },
      'officially enrolled': {
        gradient: '',
        textColor: 'text-black',
        label: 'Officially Enrolled',
        progressColor: '[&>div]:bg-blue-600',
        Icon: FiCheckCircle // Icon for officially enrolled status
      },
      'rejected': {
        gradient: '',
        textColor: 'text-red-600',
        label: 'Rejected',
        progressColor: '[&>div]:bg-red-600',
        Icon: FiAlertCircle // Icon for rejected status
      }
    };

    const LoadingState = () => (
      <div className="flex flex-col items-center justify-center py-2">
        <Loader2 className="h-6 w-6 animate-spin mb-1 text-blue-600" />
        <p className="text-sm text-black/70">Loading...</p>
      </div>
    );

    const enrollmentStatus = personal_data?.[0]?.status as StatusType || 'pending';
    const statusInfo = statusDisplay[enrollmentStatus] || statusDisplay['pending'];

    return (
      <div className="grid gap-4 md:grid-cols-3 mb-6">
        {/* Enrollment Status Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-4 flex items-center">
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <statusInfo.Icon className="text-4xl text-blue-600 animate-bounce mr-3" />
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
              </>
            )}
          </CardContent>
        </Card>

        {/* Enlisted Subjects Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-4 flex items-center">
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <FiBookOpen className="text-4xl text-blue-600 animate-bounce mr-3" />
                <div>
                  <div className="text-xl font-bold text-black mb-1">4/8</div>
                  <p className="text-sm text-black/70">Subjects selected</p>
                  <Progress 
                    value={50} 
                    className="mt-3 h-2 bg-blue-100 [&>div]:bg-blue-600"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Requirements Card */}
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300">
          <CardContent className="pt-4 flex items-center">
            {loading ? (
              <LoadingState />
            ) : (
              <>
                <FiFileText className="text-4xl text-blue-600 animate-bounce mr-3" />
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
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  };

  export default StatusCards;
