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
import apiClient from '@/lib/axios';

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
  program: number | null;
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
  const { 
    personal_data,
    academic_background,
    fetchStudentData 
  } = useFullDataStore();
  const profileData = useStudentProfileStore(state => state.profileData);
  const { program, year_level, semester_entry } = academic_background[0];
  useEffect(() => {
    if (academic_background?.[0]) {
      fetchSchedules();
    }
  }, [academic_background]);
  if (!academic_background?.[0]) return;
  
  setFetchingSchedules(true);
  
  const fetchSchedules = async () => {

    
    try {
      const semester_response = await apiClient.get(`/semester/?campus_id=${profileData.profile.student_info.campus}`);
      const semesters = semester_response.data.results;
      setSemester(semesters);
  
      const currentSemester = semesters.find((sem: Semester)  => sem.id === semester_entry);

      if (!currentSemester) {
        setSchedules([]); // Set empty schedules instead of throwing error
        return;
      }
      
      const response = await apiClient.get(`/schedules/`, {
        params: {
          program_id: program,
          year_level: year_level,
          semester_id: semester_entry
        }
      });
      
      // If schedules exist in response, set them, otherwise set empty array
      setSchedules(response.data.schedules || []);
  
    } catch (error) {
      // Only show error toast for actual API failures
      if (axios.isAxiosError(error) && error.response?.status !== 404) {
        toast({
          title: "Error",
          description: "Failed to load available schedules. Please try again.",
          variant: "destructive",
        });
      }
      setSchedules([]); // Set empty schedules on error
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

    console.log(`selected subjects: ${selectedSubjects}`);
    console.log(`Posting data: { fulldata_applicant_id: ${applicant_id}, class_ids: ${JSON.stringify(selectedSubjects)} }`);

    setLoading(true);
    try {
      await axios.post('https://djangoportal-backends.onrender.com/api/schedules/', {
            fulldata_applicant_id: applicant_id,
            class_ids: selectedSubjects
        });
        
        toast({
            title: "Success",
            description: "Successfully submitted enlistment!",
        });
    
        await axios.post('https://djangoportal-backends.onrender.com/api/enlisted-students/', {
          fulldata_applicant_id: applicant_id,
          semester_id: semester_entry
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

  return (
    <Card className="w-full bg-gradient-to-br from-white to-blue-50 border-none shadow-lg">
        <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-[#1A2A5B] to-[#2a3c6d] text-white rounded-t-xl p-6">

        <CardTitle className="text-2xl font-bold tracking-tight">Available Subjects</CardTitle>
        <Button 
          onClick={handleSubmitEnlistment}
          disabled={selectedSubjects.length === 0 || loading}
          className="ml-auto bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 shadow-lg transition-all duration-300 font-semibold"
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
      </CardHeader>
      <CardContent className="p-6">
        {fetchingSchedules ? (
          <div className="flex flex-col items-center justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin mb-4 text-indigo-600" />
            <p className="text-lg text-indigo-600/70 font-medium">Loading available subjects...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 space-y-6">
            <div className="text-center space-y-4">
              <h3 className="font-bold text-xl text-indigo-900">No Subjects Available</h3>
              <p className="text-indigo-600/70 max-w-md">
                There are currently no subjects available for enrollment in this semester. 
                Please check back later or contact your administrator.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="lg"
              onClick={fetchSchedules} 
              className="mt-6 border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-300 font-semibold group"
            >
              <RefreshCw className="w-5 h-5 mr-2 group-hover:rotate-180 transition-transform duration-500" />
              Refresh List
            </Button>
          </div>
        ) : (
          <div className="rounded-xl overflow-hidden border border-indigo-100 shadow-sm">
            <Table>
              <TableHeader>
                <TableRow className="bg-gradient-to-r from-indigo-50 to-blue-50">
                  <TableHead className="font-bold text-indigo-900 py-4">Course Code</TableHead>
                  <TableHead className="font-bold text-indigo-900">Course Name</TableHead>
                  <TableHead className="font-bold text-indigo-900">Schedule</TableHead>
                  <TableHead className="font-bold text-indigo-900">Instructor</TableHead>
                  <TableHead className="font-bold text-indigo-900">Room</TableHead>
                  <TableHead className="font-bold text-indigo-900">Units</TableHead>
                  <TableHead className="font-bold text-indigo-900">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => {
                  const isSelected = selectedSubjects.includes(schedule.schedule_id);
                  
                  return (
                    <TableRow 
                      key={schedule.schedule_id}
                      className="hover:bg-blue-50/50 transition-colors duration-200"
                    >
                      <TableCell className="font-semibold text-indigo-900">{schedule.course.code}</TableCell>
                      <TableCell className="text-indigo-800">{schedule.course.description}</TableCell>
                      <TableCell className="text-indigo-800">{`${schedule.day} ${schedule.time.start} - ${schedule.time.end}`}</TableCell>
                      <TableCell className="text-indigo-800">{`${schedule.instructor.title} ${schedule.instructor.name}`}</TableCell>
                      <TableCell className="text-indigo-800">{schedule.room}</TableCell>
                      <TableCell className="text-indigo-800">{schedule.course.units}</TableCell>
                      <TableCell>
                        <Button 
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleSelectSubject(schedule.schedule_id)}
                          disabled={loading}
                          className={`
                            transition-all duration-300 font-medium px-4
                            ${isSelected
                              ? "bg-gradient-to-r from-[#1A2A5B] to-[#1A2A5B] hover:from-[#1A2A5B] hover:to-[#1A2A5B] text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                              : "border-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50 hover:border-indigo-300"
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
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectEnlistment;
