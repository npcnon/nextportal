import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import axios from 'axios';
import { useFullDataStore } from '@/lib/fulldata-store';
import { useStudentProfileStore } from '@/lib/profile-store';
import { Loader2, RefreshCw } from "lucide-react";
import apiClient from '@/lib/clients/authenticated-api-client';
import { BookOpenCheck } from "lucide-react"; 
import RegistrationRequiredNotice from '../dashboard/registration-notice';
interface Program {
  id: number
  code: string
  description: string
  is_active: boolean
  department_id: number
}
interface Semester {
  id: number
  campus_id: number
  semester_name: string
  school_year: string
  is_active: boolean;
}
interface Employee {
  id: number;
  role: string;
  title: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  qualifications: string | null;
  gender: string;
  contact_number: string;
  is_active: boolean;
  campus: number | null;
  department: number | null;
}

interface Subject {
  id: number;
  room: string;
  start_time: string;
  end_time: string;
  day: string;
  is_active: boolean;
  is_deleted: boolean;
  employee: number;
  course: number;
  semester: number | null;
  is_enrolled?: boolean;
}
interface Course {
  id: number;
  code: string;
  description: string;
  units: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  program: number;
  department_id: number | null;
}

interface Schedule {
  schedule_id: number;
  course: {
    id: number;
    code: string;
    description: string;
    units: number;
  };
  instructor: {
    name: string;
    title: string;
  };
  room: string;
  day: string;
  time: {
    start: string;
    end: string;
  };
}
interface Semester {
  id: number
  campus_id: number
  semester_name: string
  school_year: string
}

export const SubjectEnlistment = () => {
  const { toast } = useToast();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [fetchingSchedules, setFetchingSchedules] = useState<boolean>(true);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const [available_semester, setSemester] = useState<Semester[]>([]);
// Add this state at the beginning of your component
const [isEnrolling, setIsEnrolling] = useState(false);
  const [showEnlistment, setShowEnlistment] = useState<boolean>(false);
  const formatTime = (timeString: string) => {
    const date = new Date(timeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit', 
      minute: '2-digit', 
      hour12: true
    });
  };
  const { 
    personal_data,
    academic_background,
    isLoading,
    currentSemester
  } = useFullDataStore();
  const {profileData, isLoadingProfile} = useStudentProfileStore();
  useEffect(() => {
    if (available_semester.length > 0 ) {
      console.log(`available semester:${JSON.stringify(available_semester)}`);
    }
  }, [available_semester]);
  useEffect(() => {
    // Only fetch schedules if all conditions are met
    if (
      !isLoading && 
      personal_data && 
      personal_data.length > 0 && 
      personal_data[0].status != 'pending' && 
      personal_data[0].status != 'unverified' && 
      academic_background?.[0] &&
      profileData?.profile?.student_info?.campus
    ) {
      fetchSchedules();
    }
  }, [isLoading, personal_data, academic_background, profileData]);

  const fetchSchedules = async () => {
    setFetchingSchedules(true);
    console.log('fetching schedules#################### ')
    try {
      const { program, year_level, semester_entry } = academic_background[0];
      
      const semester_response = await apiClient.get(`semester/?campus_id=${profileData.profile.student_info.campus}`);
      const semesters = semester_response.data.results;
      setSemester(semesters);

      const response = await apiClient.get(`schedules/`, {
        params: {
          program_id: program,
          year_level: year_level,
          semester_id: semester_entry
        }
      });
      
      setSchedules(response.data.schedules || []);

      console.log(`schedules: ${schedules}`)
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load available schedules. Please try again.",
          variant: "destructive",
        });
      }
      setSchedules([]);
    } finally {
      setFetchingSchedules(false);
    }
  };

  const handleSelectSubject = (scheduleId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(scheduleId) 
        ? prev.filter(id => id !== scheduleId)
        : [...prev, scheduleId]
    );
  };

  const handleSubmitEnlistment = async () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "Warning",
        description: "Please select subjects to enlist first.",
        variant: "destructive",
      });
      return;
    }

    const applicant_id = personal_data[0]?.fulldata_applicant_id;
    if (!applicant_id) {
      toast({
        title: "Error",
        description: "Student ID not found.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await apiClient.post('schedules/', {
        fulldata_applicant_id: applicant_id,
        class_ids: selectedSubjects
      });
        
      toast({
        title: "Success",
        description: "Successfully submitted enlistment!",
      });
      setTimeout(() => {
        window.location.href = window.location.href;
        // OR
        // window.location.replace(window.location.href);
      }, 1500);
      await apiClient.post('enlisted-students/', {
        fulldata_applicant_id: applicant_id,
        semester_id: academic_background[0].semester_entry
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to submit enlistment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const SubjectTableSkeleton = () => (
    <div className="space-y-4">
      <div className="border border-indigo-100 rounded-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-50 to-blue-50 p-4">
          <div className="grid grid-cols-7 gap-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-6 bg-blue-200/50 rounded animate-pulse" />
            ))}
          </div>
        </div>
        
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-indigo-100 p-4">
            <div className="grid grid-cols-7 gap-4">
              {[...Array(7)].map((_, j) => (
                <div key={j} className="h-5 bg-blue-50 rounded animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // If global loading is happening
  if (isLoading || isLoadingProfile) {
    console.log("subject enlstment loading")
    return <SubjectTableSkeleton />;
  }
//TODO: email already exist error
  // If student is not initially enrolled
  if (!(personal_data && personal_data.length > 0) || (personal_data[0].status !== 'initially enrolled' && personal_data[0].status !== 'officially enrolled')) {
    return <RegistrationRequiredNotice />;
  }

  // If no academic background
  if (!academic_background || academic_background.length === 0) {
    return <SubjectTableSkeleton />;
  }

// Modify the handleNewSemesterClick function
const handleNewSemesterClick = async () => {
  setIsEnrolling(true); // Set loading state to true when clicked
  try {
    const semesterResponse = await apiClient.get(`semester/`, {
      params: { campus_id: profileData.profile.student_info.campus }
    });
    const activeSemester = semesterResponse.data.results.find((sem: Semester) => sem.is_active) || semesterResponse.data.results[0];
    if (activeSemester.semester_name = "1st Semester"){
      if(academic_background[0].year_level == "First Year")
      {
        academic_background[0].year_level = "Second Year"
      }
      else if(academic_background[0].year_level="Second Year")
      {
        academic_background[0].year_level = "Third Year"
      }
      else if(academic_background[0].year_level="Third Year")
      {
        academic_background[0].year_level = "Fourth Year"
      }
      else if(academic_background[0].year_level="Fourth Year")
      {
        academic_background[0].year_level = "Graduated"
      }
      await apiClient.put(`deactivate_or_modify_stdntacademicbackground/${personal_data[0]?.fulldata_applicant_id}/False`, {
      "year_level": academic_background[0].year_level
      });
   
    }
    await axios.post('https://node-mysql-signup-verification-api.onrender.com/students/external/add-enrollment', {
      "fulldata_applicant_id": personal_data[0]?.fulldata_applicant_id,
      "semester_id": activeSemester.id,
    });
    
    setShowEnlistment(true);


    toast({
      title: "Success",
      description: "You can now proceed with subject enlistment.",
    });
    setTimeout(() => {
      window.location.href = window.location.href;
    }, 1500);
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to process semester enrollment. Please try again.",
      variant: "destructive",
    });
    setIsEnrolling(false); // Reset loading state on error
  }
};
  // If student is not initially enrolled
  if (!(personal_data && personal_data.length > 0) || (personal_data[0].status !== 'initially enrolled' && personal_data[0].status !== 'officially enrolled')) {
    return <RegistrationRequiredNotice />;
  }

  // If no academic background
  if (!academic_background || academic_background.length === 0) {
    return <SubjectTableSkeleton />;
  }

  if (!showEnlistment && personal_data.length > 0 && currentSemester != undefined && academic_background[0].semester_entry < currentSemester ) {
    return (
      <Card className="w-full bg-gradient-to-br from-white to-blue-50 border-none shadow-lg">
        <CardHeader className="flex flex-col items-center justify-center bg-gradient-to-r from-[#1A2A5B] to-[#2a3c6d] text-white rounded-t-xl p-12">
          <CardTitle className="text-2xl font-bold tracking-tight mb-4">New Semester Available</CardTitle>
          <p className="text-center text-gray-200 mb-6">
            A new semester is now open for enrollment. Click below to start your subject enlistment process.
          </p>
          <Button
            onClick={handleNewSemesterClick}
            disabled={isEnrolling}
            className="bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all duration-300 font-semibold"
          >
            {isEnrolling ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              "Start Subject Enlistment"
            )}
          </Button>
        </CardHeader>
      </Card>
    );
  }

  const MobileScheduleCard = ({ schedule }: { schedule: Schedule }) => {
    const isSelected = selectedSubjects.includes(schedule.schedule_id);
    
    return (
      <div className="bg-white p-4 rounded-lg shadow-sm border border-[#1A2A5B]/10 mb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-semibold text-[#1A2A5B]">{schedule.course.code}</h3>
              <p className="text-sm text-[#1A2A5B]/90">{schedule.course.description}</p>
            </div>
            <span className="text-sm font-medium text-[#1A2A5B]/90">{schedule.course.units} units</span>
          </div>
          
          <div className="text-sm text-[#1A2A5B]/90">
            <p className="flex items-center gap-2">
              <span className="font-medium">Schedule:</span>
              {`${schedule.day} ${formatTime(schedule.time.start)} - ${formatTime(schedule.time.end)}`}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Instructor:</span>
              {`${schedule.instructor.title} ${schedule.instructor.name}`}
            </p>
            <p className="flex items-center gap-2">
              <span className="font-medium">Room:</span>
              {schedule.room}
            </p>
          </div>
          
          <Button 
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={() => handleSelectSubject(schedule.schedule_id)}
            disabled={loading}
            className={`
              w-full mt-2 transition-all duration-300 font-medium
              ${isSelected
                ? "bg-gradient-to-r from-[#1A2A5B] to-[#1A2A5B] hover:from-[#1A2A5B] hover:to-[#1A2A5B]/90 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                : "border-2 border-[#1A2A5B]/20 text-[#1A2A5B] hover:bg-[#1A2A5B]/5 hover:border-[#1A2A5B]/30"
              }
            `}
          >
            {isSelected ? "Selected ✓" : "Select"}
          </Button>
        </div>
      </div>
    );
  };
  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50 border-none shadow-lg">
      <CardHeader className="flex flex-col sm:flex-row items-center justify-between bg-gradient-to-r from-[#1A2A5B] to-[#2a3c6d] text-white rounded-t-xl p-6">
        {fetchingSchedules ? (
          <div className="flex items-center space-x-3">
            <BookOpenCheck className="h-6 w-6 text-[#A9664E] animate-bounce" />
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight">Loading Subjects...</CardTitle>
          </div>
        ) : (
          <>
            <CardTitle className="text-xl sm:text-2xl font-bold tracking-tight mb-4 sm:mb-0">Available Subjects</CardTitle>
            {schedules.length > 0 && (
              <Button 
                onClick={handleSubmitEnlistment}
                disabled={selectedSubjects.length === 0 || loading}
                className="w-full sm:w-auto bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all duration-300 font-semibold"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enrolling...
                  </>
                ) : (
                  <>
                    Submit Enlistment
                    {selectedSubjects.length > 0 && (
                      <span className="ml-2 bg-blue-600 text-white rounded-full px-2 py-0.5 text-xs">
                        {selectedSubjects.length}
                      </span>
                    )}
                  </>
                )}
              </Button>
            )}
          </>
        )}
      </CardHeader>

      <CardContent className="p-4 sm:p-6">
        {fetchingSchedules ? (
          <SubjectTableSkeleton />
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="text-center space-y-4">
              <h3 className="font-bold text-xl text-[#1A2A5B]">No Subjects Available</h3>
              <p className="text-[#1A2A5B]/70 max-w-md px-4">
                There are currently no subjects available for enrollment in this semester. 
                Please check back later or contact your administrator.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={fetchSchedules} 
              className="mt-6 border-2 border-[#1A2A5B]/20 text-[#1A2A5B] hover:bg-[#1A2A5B]/5 hover:border-[#1A2A5B]/30 transition-all duration-300 font-semibold group"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh List
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop view */}
            <div className="hidden sm:block rounded-xl overflow-hidden border border-[#1A2A5B]/10 shadow-sm">
              <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-[#1A2A5B]/5 to-[#1A2A5B]/10">
                  <TableHead className="font-bold text-[#1A2A5B] py-4">Course Code</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Course Name</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Schedule</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Instructor</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Room</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Units</TableHead>
                  <TableHead className="font-bold text-[#1A2A5B]">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const isSelected = selectedSubjects.includes(schedule.schedule_id);
                  
                  return (
                    <TableRow 
                      key={schedule.schedule_id}
                      className="hover:bg-[#1A2A5B]/5 transition-colors duration-200"
                    >
                      <TableCell className="font-semibold text-[#1A2A5B]">{schedule.course.code}</TableCell>
                      <TableCell className="text-[#1A2A5B]/90">{schedule.course.description}</TableCell>
                      <TableCell className="text-[#1A2A5B]/90">
                        {`${schedule.day} ${formatTime(schedule.time.start)} - ${formatTime(schedule.time.end)}`}
                      </TableCell>                      
                      <TableCell className="text-[#1A2A5B]/90">{`${schedule.instructor.title} ${schedule.instructor.name}`}</TableCell>
                      <TableCell className="text-[#1A2A5B]/90">{schedule.room}</TableCell>
                      <TableCell className="text-[#1A2A5B]/90">{schedule.course.units}</TableCell>
                      <TableCell>
                        <Button 
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectSubject(schedule.schedule_id)}
                          disabled={loading}
                          className={`
                            transition-all duration-300 font-medium px-4
                            ${isSelected
                              ? "bg-gradient-to-r from-[#1A2A5B] to-[#1A2A5B] hover:from-[#1A2A5B] hover:to-[#1A2A5B]/90 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              : "border-2 border-[#1A2A5B]/20 text-[#1A2A5B] hover:bg-[#1A2A5B]/5 hover:border-[#1A2A5B]/30"
                            }
                          `}
                        >
                          {isSelected ? "Selected ✓" : "Select"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
              </Table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden">
              {schedules.map((schedule) => (
                <MobileScheduleCard key={schedule.schedule_id} schedule={schedule} />
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectEnlistment;