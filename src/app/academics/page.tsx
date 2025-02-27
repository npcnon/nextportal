"use client"
import { HTMLAttributes } from 'react';
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
  <div className="bg-white p-3 sm:p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all duration-300 mb-4">
    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
      <h3 className="font-semibold text-sm sm:text-lg text-[#1A2A5B] break-words">
        {classItem.subjectCode} - {classItem.subjectDescription}
      </h3>
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline" className="bg-blue-50 text-xs sm:text-sm">
          {classItem.unit} {classItem.unit === 1 ? 'unit' : 'units'}
        </Badge>
        <Badge variant="secondary" className="text-xs sm:text-sm">
          {classItem.semesterName} {classItem.schoolYear}
        </Badge>
      </div>
    </div>
    
    <div className="mt-2 sm:mt-3 space-y-2 text-gray-600">
      <p className="flex items-center gap-2 text-sm sm:text-base">
        <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
        <span className="font-medium">Instructor:</span> {classItem.instructorFullName}
      </p>
      <p className="flex items-center gap-2 text-sm sm:text-base">
        <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
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
const AnimatedInfoCard = ({ icon, label, value, subtext, color, onClick }) => (
  <div 
    className="bg-gray-50 rounded-lg p-3 sm:p-4 border border-gray-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1 cursor-pointer"
    onClick={onClick}
  >
    <div className="flex items-center justify-between mb-2">
      <div className="bg-white p-1.5 sm:p-2 rounded-full shadow-sm">{icon}</div>
      <Badge variant="secondary" className={`${color} text-xs sm:text-sm`}>{label}</Badge>
    </div>
    <p className="font-bold text-lg sm:text-xl">{value}</p>
    {subtext && (
      <p className="text-xs sm:text-sm text-gray-500 mt-1">{subtext}</p>
    )}
  </div>
);

// Update the main AcademicsView component
export default function AcademicsView() {
  const { isLoadingProfile, profileData } = useStudentProfileStore();
  const [currentSemester, setCurrentSemester] = useState<Semester | null>(null);
  const [enrolledClasses, setEnrolledClasses] = useState<EnrolledClass[]>([]);
  const [allEnrolledClasses, setAllEnrolledClasses] = useState<EnrolledClass[]>([]);

  const [classSchedules, setClassSchedules] = useState<ClassSchedule[]>([]);
  const [totalUnits, setTotalUnits] = useState(0);
  const [currentSemesterUnits, setCurrentSemesterUnits] = useState(0);
  const [totalUnitsAllSemesters, setTotalUnitsAllSemesters] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogContent, setDialogContent] = useState({
    classes: [],
    title: '',
    description: ''
  });

  const academicRecord = {
    gpa: '1.50',
    standing: 'Good Standing',
    terms: [
      { term: '1st Semester 2023-2024', gpa: '1.50' },
      { term: '2nd Semester 2022-2023', gpa: '1.75' },
      { term: '1st Semester 2022-2023', gpa: '1.25' },
    ]
  };
  const handleShowCurrentClasses = () => {
    const currentClasses = enrolledClasses;  // These are already current semester classes
    setDialogContent({
      classes: currentClasses,
      title: 'Current Semester Classes',
      description: `${currentSemester?.semester_name} ${currentSemester?.school_year}`
    });
    setDialogOpen(true);
  };
  
  const handleShowAllClasses = () => {
    // You'll need to fetch all classes again or store them in state


    setDialogContent({
      classes: allEnrolledClasses,
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
      if (!isLoadingProfile && profileData?.profile?.student_info?.campus) {
        try {
          setIsLoading(true);
  
          // Fetch Semester
          const semesterResponse = await apiClient.get(`semester/`, {
            params: { campus_id: profileData.profile.student_info.campus }
          });
          const activeSemester = semesterResponse.data.results.find((sem: Semester) => sem.is_active) || semesterResponse.data.results[0];
          setCurrentSemester(activeSemester);
  
          const enrolledClassesResponse = await apiClient.post(`proxy`,
            {
              url : `https://node-mysql-signup-verification-api.onrender.com/enrollment/external/all-enrolled-classes`
            }
          )
          
          const currentSemesterId = activeSemester.id;
          
          // Filter all classes for this student
          const studentAllEnrolledClasses: EnrolledClass[] = enrolledClassesResponse.data.filter(
            (classItem: EnrolledClass) => classItem.student_id === profileData.student_id
          );
  
          // Get classes for current semester
          const studentCurrentSemesterClasses: EnrolledClass[] = studentAllEnrolledClasses.filter(
            (classItem: EnrolledClass) => classItem.semester_id === currentSemesterId
          );
  
          // Set filtered enrolled classes
          setEnrolledClasses(studentCurrentSemesterClasses);
          setAllEnrolledClasses(studentAllEnrolledClasses);
          console.log(`all enrolled classes: ${studentAllEnrolledClasses}`)
          // Calculate current semester units
          const currentSemUnits = studentCurrentSemesterClasses.reduce(
            (total: number, classItem: EnrolledClass) => total + classItem.unit,
            0
          );
          setCurrentSemesterUnits(currentSemUnits);
  
          // Calculate total units across all semesters
          const totalUnits = studentAllEnrolledClasses.reduce(
            (total: number, classItem: EnrolledClass) => total + classItem.unit,
            0
          );
          setTotalUnitsAllSemesters(totalUnits);
  
          // Fetch All Schedules
          const schedulesResponse = await apiClient.post(`proxy`,
            {
              url : 'https://benedicto-scheduling-backend.onrender.com/teachers/all-subjects'
            }
          )
  
          // Filter schedules based on enrolled class IDs
          const enrolledClassIds = studentCurrentSemesterClasses.map((ec: EnrolledClass) => ec.class_id);
          const filteredSchedules = schedulesResponse.data.filter((schedule: ClassSchedule) => 
            enrolledClassIds.includes(schedule.id)
          );
          setClassSchedules(filteredSchedules);
          console.log('filtered schedules: ', filteredSchedules)
  
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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-white py-4 sm:py-8 px-2 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg border border-[#1A2A5B]/10 overflow-hidden mb-4 sm:mb-8">
          <div className="bg-gradient-to-r from-[#1A2A5B] to-[#142247] px-4 sm:px-8 py-6 sm:py-12">
            <div className="flex items-center gap-3 sm:gap-6">
              <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center border-4 border-white/30">
                <GraduationCap className="h-8 w-8 sm:h-12 sm:w-12 text-white" />
              </div>
              <div>
                <h1 className="text-xl sm:text-3xl font-bold text-white tracking-tight">Academic Journey</h1>
                <p className="text-blue-100 mt-1 flex items-center gap-2 text-sm sm:text-base">
                  <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                  {currentSemester 
                    ? `${currentSemester.semester_name} ${currentSemester.school_year}` 
                    : 'Current Term: Not Available'}
                </p>
              </div>
            </div>
          </div>

          {/* Academic Summary */}
          <div className="px-4 sm:px-8 py-4 sm:py-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
          <AnimatedInfoCard 
            icon={<BookOpen className="text-green-500" />} 
            label="Current Units" 
            value={`${currentSemesterUnits}`}
            subtext={`This Semester`} 
            color="text-green-600"
            onClick={handleShowCurrentClasses}
          />
          <AnimatedInfoCard 
            icon={<BarChart2 className="text-blue-500" />} 
            label="Total Units" 
            value={`${totalUnitsAllSemesters}`}
            subtext="All Semesters" 
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
        <Tabs defaultValue="dynamicGrades" className="bg-white rounded-xl shadow-lg border border-[#1A2A5B]/10 p-3 sm:p-6">
          <TabsList className="grid w-full grid-cols-3 mb-4 sm:mb-6 bg-gray-100">
            <TabsTrigger 
              value="dynamicGrades" 
              className="text-xs sm:text-sm data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white px-2 py-1 sm:px-4 sm:py-2"
            >
              Current Grades
            </TabsTrigger>
            <TabsTrigger 
              value="schedule"
              className="text-xs sm:text-sm data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white px-2 py-1 sm:px-4 sm:py-2"
            >
              Class Schedule
            </TabsTrigger>
            <TabsTrigger 
              value="history"
              className="text-xs sm:text-sm data-[state=active]:bg-[#1A2A5B] data-[state=active]:text-white px-2 py-1 sm:px-4 sm:py-2"
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
          {/* Schedule Tab Content */}
          <TabsContent value="schedule">
            <div className="space-y-3 sm:space-y-4">
              {enrolledClasses.map((classItem) => {
                const schedule = classSchedules.find(
                  (sch) => sch.subject_code === classItem.subjectCode
                );

                return (
                  <div key={classItem.student_class_id} className="bg-white p-3 sm:p-4 rounded-lg shadow hover:shadow-md transition-all duration-300">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0">
                      <h3 className="font-semibold text-sm sm:text-lg text-[#1A2A5B] break-words">
                        {classItem.subjectCode} - {classItem.subjectDescription}
                      </h3>
                      <Badge variant="outline" className="bg-blue-50 text-xs sm:text-sm">
                        {classItem.unit} {classItem.unit === 1 ? 'unit' : 'units'}
                      </Badge>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <div className="space-y-2 text-gray-600">
                        <p className="flex items-center gap-2 text-sm sm:text-base">
                          <User className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
                          <span className="font-medium">Instructor:</span> {classItem.instructorFullName}
                        </p>
                        <p className="flex items-center gap-2 text-sm sm:text-base">
                          <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
                          <span className="font-medium">Room:</span> {classItem.roomInfo.room_number}
                        </p>
                      </div>

                      {schedule && (
                        <div className="space-y-2 text-gray-600">
                          <p className="flex items-center gap-2 text-sm sm:text-base">
                            <Calendar className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
                            <span className="font-medium">Day:</span> {getDayFullName(schedule.day)}
                          </p>
                          <p className="flex items-center gap-2 text-sm sm:text-base">
                            <Clock className="h-3 w-3 sm:h-4 sm:w-4 text-purple-500" />
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