"use client"

import React, { useState, useEffect } from 'react';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from "@/components/ui/tabs";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import axios from 'axios';
import apiClient from '@/lib/clients/authenticated-api-client';
import GradeHistory from '@/components/Academics/grade-history';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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



const ClassCard = ({ classItem }) => (
  <div className="bg-white p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 mb-4">
    <div className="flex justify-between items-start">
      <h3 className="font-semibold text-lg text-[#1A2A5B]">
        {classItem.subjectCode} - {classItem.subjectDescription}
      </h3>
      <div className="flex gap-2">
        <Badge variant="outline" className="bg-blue-50">
          {classItem.unit} {classItem.unit === 1 ? 'unit' : 'units'}
        </Badge>
        <Badge variant="secondary">
          {classItem.semesterName} {classItem.schoolYear}
        </Badge>
      </div>
    </div>
    
    <div className="mt-3 space-y-2 text-gray-600">
      <p className="flex items-center gap-2">
        <User className="h-4 w-4 text-blue-500" />
        <span className="font-medium">Instructor:</span> {classItem.instructorFullName}
      </p>
      <p className="flex items-center gap-2">
        <MapPin className="h-4 w-4 text-red-500" />
        <span className="font-medium">Room:</span> {classItem.roomInfo.room_number}
      </p>
    </div>
  </div>
);

const EnrolledClassesDialog = ({ 
  isOpen, 
  onClose, 
  classes, 
  title, 
  description 
}) => (
  <Dialog open={isOpen} onOpenChange={onClose}>
    <DialogContent className="max-w-3xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle className="text-2xl font-bold">{title}</DialogTitle>
        <p className="text-gray-500">{description}</p>
      </DialogHeader>
      <ScrollArea className="h-[60vh] pr-4">
        <div className="space-y-4">
          {classes.map((classItem) => (
            <ClassCard key={classItem.student_class_id} classItem={classItem} />
          ))}
        </div>
      </ScrollArea>
    </DialogContent>
  </Dialog>
);

// Modified AnimatedInfoCard to handle click
const AnimatedInfoCard = ({ 
  icon, 
  label, 
  value, 
  subtext,
  color,
  onClick 
}) => (
  <div 
    className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="bg-white p-2 rounded-full shadow-sm">{icon}</div>
      <Badge variant="secondary" className={`${color}`}>{label}</Badge>
    </div>
    <p className="font-bold text-xl">{value}</p>
    {subtext && (
      <p className="text-sm text-gray-500 mt-1">{subtext}</p>
    )}
  </div>
);
export default function AcademicsView() {
  const { isLoadingProfile, profileData } = useStudentProfileStore();
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [currentSemesterUnits, setCurrentSemesterUnits] = useState(0);
  const [totalUnitsAllSemesters, setTotalUnitsAllSemesters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    classes: [],
    title: '',
    description: ''
  });

  const handleShowCurrentClasses = () => {
    // Filter classes for current semester only
    const currentClasses = enrolledClasses.filter(
      classItem => classItem.semester_id === currentSemester?.id
    );
    setDialogContent({
      classes: currentClasses,
      title: 'Current Semester Classes',
      description: `${currentSemester?.semester_name} ${currentSemester?.school_year}`
    });
    setDialogOpen(true);
  };

  const handleShowAllClasses = () => {
    // Show all classes across all semesters
    setDialogContent({
      classes: enrolledClasses,
      title: 'All Enrolled Classes',
      description: 'Complete academic history'
    });
    setDialogOpen(true);
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

          // Fetch All Schedules first
          const schedulesResponse = await apiClient.post(`proxy`, {
            url: 'https://benedicto-scheduling-backend.onrender.com/teachers/all-subjects'
          });
          const allSchedules = schedulesResponse.data;
          
          // Fetch enrolled classes
          const enrolledClassesResponse = await axios.get(
            `https://node-mysql-signup-verification-api.onrender.com/enrollment/external/all-enrolled-classes`
          );
          
          // Filter enrolled classes for current student
          const studentEnrolledClasses = enrolledClassesResponse.data.filter(
            (classItem: EnrolledClass) => classItem.student_id === profileData.student_id
          );

          // Enrich enrolled classes with scheduling data
          const enrichedClasses = studentEnrolledClasses.map((classItem: EnrolledClass) => {
            const scheduleData = allSchedules.find(
              (schedule: ClassSchedule) => 
                schedule.id === classItem.class_id &&
                schedule.subject_code === classItem.subjectCode
            );
            
            return {
              ...classItem,
              unit: scheduleData ? scheduleData.units : classItem.unit,
              schedulingData: scheduleData
            };
          });

          setEnrolledClasses(enrichedClasses);

          // Calculate current semester units
          const currentSemesterClasses = enrichedClasses.filter(
            (classItem: EnrolledClass) => classItem.semester_id === activeSemester.id
          );
          
          const currentUnits = currentSemesterClasses.reduce(
            (total: number, classItem: EnrolledClass) => total + (classItem.unit || 0),
            0
          );
          setCurrentSemesterUnits(currentUnits);

          // Calculate total units for ALL semesters
          const allUnits = enrichedClasses.reduce(
            (total: number, classItem: EnrolledClass) => total + (classItem.unit || 0),
            0
          );
          setTotalUnitsAllSemesters(allUnits);

          setClassSchedules(allSchedules);

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
                icon={<BookOpen className="text-green-500" />} 
                label="Current Units" 
                value={`${currentSemesterUnits}`}
                subtext={`${currentSemester?.semester_name} ${currentSemester?.school_year}`} 
                color="text-green-600"
                onClick={handleShowCurrentClasses}
              />
              <AnimatedInfoCard 
                icon={<BarChart2 className="text-blue-500" />} 
                label="Total Units" 
                value={`${totalUnitsAllSemesters}`}
                subtext="All Semesters Combined" 
                color="text-blue-600"
                onClick={handleShowAllClasses}
              />
              <EnrolledClassesDialog
                isOpen={dialogOpen}
                onClose={() => setDialogOpen(false)}
                classes={dialogContent.classes}
                title={dialogContent.title}
                description={dialogContent.description}
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

          {/* Content for each tab */}
          <TabsContent value="dynamicGrades">
            {currentSemester && (
              <GradesView 
                semesterName={currentSemester.semester_name}
                schoolYear={currentSemester.school_year}
              />
            )}
          </TabsContent>

          <TabsContent value="schedule">
            <div className="space-y-4">
              {enrolledClasses
                // Filter to show only current semester classes
                .filter((classItem) => classItem.semester_id === currentSemester?.id)
                .map((classItem) => {
                  // Find matching schedule for this class
                  const schedule = classSchedules.find(
                    (sch) => sch.subject_code === classItem.subjectCode
                  );

                  return (
                    <div key={classItem.student_class_id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition-all duration-300">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-lg text-[#1A2A5B]">
                          {classItem.subjectCode} - {classItem.subjectDescription}
                        </h3>
                        <Badge variant="outline" className="bg-blue-50">
                          {classItem.unit} {classItem.unit === 1 ? 'unit' : 'units'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-center gap-2">
                            <User className="h-4 w-4 text-blue-500" />
                            <span className="font-medium">Instructor:</span> {classItem.instructorFullName}
                          </p>
                          <p className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-red-500" />
                            <span className="font-medium">Room:</span> {classItem.roomInfo.room_number}
                          </p>
                        </div>

                        {schedule && (
                          <div className="space-y-2 text-gray-600">
                            <p className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-green-500" />
                              <span className="font-medium">Day:</span> {getDayFullName(schedule.day)}
                            </p>
                            <p className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-purple-500" />
                              <span className="font-medium">Time:</span> 
                              {formatTime(schedule.start)} - {formatTime(schedule.end)}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </TabsContent>

          <TabsContent value="history">
            <GradeHistory />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Animated Info Card Component

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