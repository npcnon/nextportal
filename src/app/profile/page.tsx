// app/profile/page.tsx
"use client"
// components/student/ProfileView.tsx
import { useEffect, useState } from 'react';
import { useFullDataStore } from '@/lib/fulldata-store';
import { format } from 'date-fns';
import { Loading } from '@/components/ui/loading';
import { Mail, Phone, Map, User, Calendar, Book, School, Home } from 'lucide-react';
import { useStudentProfileStore } from '@/lib/profile-store';
import { useToast } from '@/hooks/use-toast';
import apiClient, { AuthenticationError } from '@/lib/axios';

export default function StudentProfile(){

    // In StudentProfile.tsx, add these at the top
const [profilePicture, setProfilePicture] = useState<{
  id: number;
  type: string;
  temporary_url?: string;
} | null>(null);
const [isLoadingPicture, setIsLoadingPicture] = useState(true);
const { toast } = useToast();

// Add this useEffect after your existing useEffect
useEffect(() => {
  const fetchProfilePicture = async () => {
    try {
      setIsLoadingPicture(true);
      const response = await apiClient.get('/documents');
      const profileDoc = response.data.documents.find(
        (doc: any) => doc.document_type === 'profile'
      );
      
      if (profileDoc?.temporary_url) {
        setProfilePicture({
          id: profileDoc.id,
          type: 'profile',
          temporary_url: profileDoc.temporary_url
        });
      }
    } catch (error) {
      console.error('Error fetching profile picture:', error);
      if (!(error instanceof AuthenticationError)) {
        toast({
          title: "Error",
          description: "Failed to load profile picture",
          variant: "destructive",
        });
      }


    } finally {
      setIsLoadingPicture(false);
    }
  };
  
  fetchProfilePicture();
  const interval = setInterval(fetchProfilePicture, 45 * 60 * 1000);
  return () => clearInterval(interval);
}, [toast]);

    const { 
      personal_data, 
      add_personal_data,
      academic_background,
      academic_history,
      family_background,
      isLoading,
      isInitialized,
      error,
      fetchStudentData 
    } = useFullDataStore();
    const profileData = useStudentProfileStore(state => state.profileData);
    useEffect(() => {
      if (profileData?.profile?.student_info?.basicdata_applicant_id) {
          fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);
      }
  }, [profileData, fetchStudentData]);
  
    // Show loading only during initial load or explicit loading states
    if (!isInitialized || isLoading) {
      return <Loading />;
    }
  
    if (error) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
            <div className="text-red-500 text-center">
              <svg
                className="mx-auto h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <h3 className="mt-4 text-lg font-medium">Error Loading Profile</h3>
              <p className="mt-2 text-sm text-gray-600">{error}</p>
              <button
                onClick={() => fetchStudentData(profileData.fulldata_applicant_id)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      );
    }
  
    // Only show no data message if we're initialized and have no data
    if (!personal_data.length) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-500 bg-white p-8 rounded-lg shadow-sm">
            <div className="text-center">
              <User className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900">No Student Data</h3>
              <p className="mt-2 text-sm text-gray-500">
                No student profile information is available.
              </p>
              <button
                onClick={() => fetchStudentData(profileData.profile.student_info.basicdata_applicant_id)}
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
              >
                Refresh Data
              </button>
            </div>
          </div>
        </div>
      );
    }

  const student = personal_data[0];
  const additionalInfo = add_personal_data[0];
  const academics = academic_background[0];
  const history = academic_history[0];
  const family = family_background[0];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 rounded-full bg-white overflow-hidden flex items-center justify-center">
              {isLoadingPicture ? (
                <div className="w-24 h-24 bg-gray-200 animate-pulse" />
              ) : profilePicture?.temporary_url ? (
                <img
                  src={profilePicture.temporary_url}
                  alt="Profile"
                  className="w-24 h-24 object-cover"
                  onError={() => setProfilePicture(null)}
                />
              ) : (
                <User className="h-12 w-12 text-blue-500" />
              )}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                {student.f_name} {student.m_name} {student.l_name} {student.suffix}
              </h1>
              <p className="text-blue-100 mt-1">Student ID: {profileData.student_id ? profileData.student_id: "N/A"}</p>
            </div>
          </div>
        </div>
          
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <InfoCard icon={<Mail />} label="Email" value={student.email} />
              <InfoCard icon={<Phone />} label="Contact" value={additionalInfo?.contact_number} />
              <InfoCard icon={<Map />} label="Address" value={additionalInfo?.city_address} />
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <Section title="Current Academic Status">
            <div className="space-y-4">
              <InfoRow label="Student Type" value={academics?.student_type} />
              <InfoRow label="Year Level" value={academics?.year_level} />
              <InfoRow label="Entry Year" value={academics?.year_entry.toString()} />
              <InfoRow label="Expected Graduation" value={academics?.year_graduate.toString()} />
              <InfoRow label="Application Type" value={academics?.application_type} />
            </div>
          </Section>

          <Section title="Personal Information">
            <div className="space-y-4">
              <InfoRow label="Sex" value={student.sex} />
              <InfoRow label="Birth Date" value={format(new Date(student.birth_date), 'MMMM dd, yyyy')} />
              <InfoRow label="Citizenship" value={additionalInfo?.citizenship} />
              <InfoRow label="Religion" value={student.religion} />
              <InfoRow label="Marital Status" value={student.marital_status} />
            </div>
          </Section>
        </div>

        {/* Educational Background */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold mb-6">Educational Background</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <EducationCard 
                level="Senior High School"
                school={history?.senior_highschool}
                year={history?.senior_graduate}
                honors={history?.senior_honors}
              />
              <EducationCard 
                level="Junior High School"
                school={history?.junior_highschool}
                year={history?.junior_graduate}
                honors={history?.junior_honors}
              />
              <EducationCard 
                level="Elementary"
                school={history?.elementary_school}
                year={history?.elementary_graduate}
                honors={history?.elementary_honors}
              />
            </div>
          </div>
        </div>

        {/* Family Background */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-8 py-6">
            <h2 className="text-xl font-semibold mb-6">Family Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-medium mb-4">Father's Information</h3>
                <div className="space-y-4">
                  <InfoRow label="Name" value={`${family?.father_fname} ${family?.father_lname}`} />
                  <InfoRow label="Contact" value={family?.father_contact_number || 'N/A'} />
                  <InfoRow label="Occupation" value={family?.father_occupation || 'N/A'} />
                  <InfoRow label="Company" value={family?.father_company || 'N/A'} />
                </div>
              </div>
              <div>
                <h3 className="text-lg font-medium mb-4">Mother's Information</h3>
                <div className="space-y-4">
                  <InfoRow label="Name" value={`${family?.mother_fname || 'N/A'} ${family?.mother_lname || ''}`} />
                  <InfoRow label="Contact" value={family?.mother_contact_number || 'N/A'} />
                  <InfoRow label="Occupation" value={family?.mother_occupation || 'N/A'} />
                  <InfoRow label="Company" value={family?.mother_company || 'N/A'} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const InfoCard = ({ icon, label, value }: { icon: React.ReactNode, label: string, value?: string }) => (
  <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg">
    <div className="flex-shrink-0 text-blue-500">
      {icon}
    </div>
    <div>
      <p className="text-sm text-gray-500">{label}</p>
      <p className="font-medium">{value || 'N/A'}</p>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="bg-white rounded-xl shadow-sm overflow-hidden">
    <div className="px-8 py-6">
      <h2 className="text-xl font-semibold mb-6">{title}</h2>
      {children}
    </div>
  </div>
);

const InfoRow = ({ label, value }: { label: string, value?: string }) => (
  <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
    <span className="text-gray-600">{label}</span>
    <span className="font-medium">{value || 'N/A'}</span>
  </div>
);

const EducationCard = ({ 
  level, 
  school, 
  year, 
  honors 
}: { 
  level: string;
  school?: string;
  year?: number;
  honors?: string;
}) => (
  <div className="bg-gray-50 rounded-lg p-6">
    <div className="flex items-center space-x-3 mb-4">
      <School className="h-6 w-6 text-blue-500" />
      <h3 className="font-medium">{level}</h3>
    </div>
    <div className="space-y-2">
      <p className="text-sm text-gray-600">School: {school || 'N/A'}</p>
      <p className="text-sm text-gray-600">Year: {year || 'N/A'}</p>
      <p className="text-sm text-gray-600">Honors: {honors || 'None'}</p>
    </div>
  </div>
);

