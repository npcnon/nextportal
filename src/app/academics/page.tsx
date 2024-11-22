"use client"

import React, { useState, useEffect } from 'react';
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "@/components/ui/tabs"
import { 
  GraduationCap, 
  Clock, 
  MapPin, 
  User, 
  Star, 
  BookOpen, 
  BarChart2, 
  Calendar 
} from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import GradesView from '@/components/Academics/grades-view';
import { useStudentProfileStore } from '@/lib/profile-store';
import axios from 'axios';
import apiClient from '@/lib/clients/authenticated-api-client';

interface Semester {
  id: number;
  semester_name: string;
  school_year: string;
  is_active: boolean;
}

interface EnrolledClass {
  student_class_id: number;
  student_id: string;  // Add this if not already in the interface
  semester_id: number;
  class_id: number;
  subjectCode: string;
  subjectDescription: string;
  className: string;
  unit: number;
  roomInfo: { room_number: string };
  instructorFullName: string;
}

interface ClassSchedule {
  id: number;
  subject_code: string;
  subject: string;
  teacher: string;
  room: string;
  start: string;
  end: string;
  day: string;
  units: number;
}

export default function AcademicsView() {
  const { isLoadingProfile, profileData } = useStudentProfileStore();
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [isLoading, setIsLoading] = useState(true);


  const academicRecord = {
    gpa: '1.50',
    standing: 'Good Standing',
    terms: [
      { term: '1st Semester 2023-2024', gpa: '1.50' },
      { term: '2nd Semester 2022-2023', gpa: '1.75' },
      { term: '1st Semester 2022-2023', gpa: '1.25' },
    ]
  };

  // Helper function to convert day abbreviation to full day name
  const getDayFullName = (dayAbbr: string) => {
    const days: { [key: string]: string } = {
      'M': 'Monday',
      'T': 'Tuesday',
      'W': 'Wednesday',
      'Th': 'Thursday',
      'F': 'Friday',
      'S': 'Saturday',
      'Su': 'Sunday'
    };
    return days[dayAbbr] || dayAbbr;
  };

  // Helper function to format time
  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  useEffect(() => {
    const fetchData = async () => {
      if (!isLoadingProfile && profileData.profile.student_info.campus) {
        try {
          setIsLoading(true);

          // Fetch Semester
          const semesterResponse = await apiClient.get(`semester/`, {
            params: { campus_id: profileData.profile.student_info.campus }
          });
          const activeSemester = semesterResponse.data.results.find((sem: Semester) => sem.is_active) || semesterResponse.data.results[0];
          setCurrentSemester(activeSemester);

          // Fetch All Enrolled Classes
          const enrolledClassesResponse = await axios.get(
            `https://node-mysql-signup-verification-api.onrender.com/enrollment/external/all-enrolled-classes`
          );
          const currentSemesterId = activeSemester.id;
          // Filter enrolled classes for the specific student
          const studentEnrolledClasses = enrolledClassesResponse.data.filter(
            (classItem: EnrolledClass) => 
              classItem.student_id === profileData.student_id && 
              classItem.semester_id === currentSemesterId
          );

          console.log('Raw Enrolled Classes:', enrolledClassesResponse.data);
          console.log('Filtered Enrolled Classes:', studentEnrolledClasses);

          // Set filtered enrolled classes
          setEnrolledClasses(studentEnrolledClasses);

          // Calculate total units from filtered classes
          const calculatedTotalUnits = studentEnrolledClasses.reduce(
            (total: number, classItem: EnrolledClass) => total + classItem.unit, 
            0
          );

          console.log(`Calculated Total Units: ${calculatedTotalUnits}`);
          setTotalUnits(calculatedTotalUnits);

          // Fetch All Schedules
          const schedulesResponse = await axios.get(
            `https://benedicto-scheduling-backend.onrender.com/teachers/all-subjects`
          );

          // Filter schedules based on enrolled class IDs
          const enrolledClassIds = studentEnrolledClasses.map((ec: EnrolledClass) => ec.class_id);
          const filteredSchedules = schedulesResponse.data.filter((schedule: ClassSchedule) => 
            enrolledClassIds.includes(schedule.id)
          );
          setClassSchedules(filteredSchedules);

        } catch (error) {
          console.error('Error fetching data:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchData();
  }, [isLoadingProfile, profileData]);

 if (isLoading) {
    return <AcademicsViewSkeleton />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-[#1A2A5B]/10 overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-[#1A2A5B] to-[#142247] px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <GraduationCap className="h-12 w-12 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white tracking-tight">Academic Journey</h1>
                <p className="text-blue-100 mt-1 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  {currentSemester 
                    ? `${currentSemester.semester_name} ${currentSemester.school_year}` 
                    : 'Current Term: Not Available'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Academic Summary */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <AnimatedInfoCard 
                icon={<Star className="text-yellow-500" />} 
                label="GPA" 
                value={academicRecord.gpa} 
                color="text-yellow-600"
              />
              <AnimatedInfoCard 
                icon={<BookOpen className="text-green-500" />} 
                label="Total Units" 
                value={totalUnits.toString()} 
                color="text-green-600"
              />
              <AnimatedInfoCard 
                icon={<BarChart2 className="text-blue-500" />} 
                label="Academic Standing" 
                value={academicRecord.standing} 
                color="text-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="dynamicGrades" className="bg-white rounded-xl shadow-lg border border-[#1A2A5B]/10 p-6">
          <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100">
            <TabsTrigger 
              value="dynamicGrades" 
              className="data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white"
            >
              Current Grades
            </TabsTrigger>
            <TabsTrigger 
              value="schedule"
              className="data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white"
            >
              Class Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white"
            >
              Grade History
            </TabsTrigger>
          </TabsList>

          {/* Existing TabsContent remains the same */}
        </Tabs>
      </div>
    </div>
  );
}

// Animated Info Card Component
const AnimatedInfoCard = ({ 
  icon, 
  label, 
  value, 
  color 
}: { 
  icon: React.ReactNode, 
  label: string, 
  value: string, 
  color?: string 
}) => (
  <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
    <div className="flex items-center justify-between mb-2">
      <div className="bg-white p-2 rounded-full shadow-sm">{icon}</div>
      <Badge variant="secondary" className={`${color}`}>{label}</Badge>
    </div>
    <p className="font-bold text-xl">{value}</p>
  </div>
);

// Skeleton Loading Component
const AcademicsViewSkeleton = () => (
  <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-8 px-4 sm:px-6 lg:px-8">
    <div className="max-w-7xl mx-auto">
      {/* Header Skeleton */}
      <div className="bg-white rounded-xl shadow-lg mb-8">
        <div className="bg-gradient-to-r from-[#1A2A5B] to-[#142247] px-8 py-12">
          <div className="flex items-center gap-6">
            <Skeleton className="h-24 w-24 rounded-full" />
            <div className="space-y-2 w-full">
              <Skeleton className="h-8 w-1/2" />
              <Skeleton className="h-4 w-1/3" />
            </div>
          </div>
        </div>
        
        <div className="px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map((item) => (
              <Skeleton key={item} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </div>
      </div>

      {/* Tabs Skeleton */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[1, 2, 3].map((item) => (
            <Skeleton key={item} className="h-10 w-full" />
          ))}
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    </div>
  </div>
);