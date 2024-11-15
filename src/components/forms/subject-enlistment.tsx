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
import { Loader2 } from "lucide-react"; // Add this import

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

  const fetchSchedules = async () => {
    if (!academic_background?.[0]) return;
    
    setFetchingSchedules(true);
    const { program, year_level, semester_entry } = academic_background[0];
    
    try {
      const semester_response = await axios.get(`http://127.0.0.1:8000/api/semester/?campus_id=${profileData.profile.student_info.campus}`);
      const semesters = semester_response.data.results;
      setSemester(semesters);
  
      const currentSemester = semesters.find((sem: Semester)  => sem.id === semester_entry);
      if (!currentSemester) {
        console.error('Semester not found');
        return;
      }
  
      const response = await axios.get(`http://127.0.0.1:8000/api/schedules/`, {
        params: {
          program_id: program,
          year_level: year_level,
          semester_id: semester_entry
        }
      });
      
      setSchedules(response.data.schedules);
    } catch (error) {
      console.error('Failed to fetch schedules:', error);
      toast({
        title: "Error",
        description: "Failed to load available schedules. Please try again.",
        variant: "destructive",
      });
    } finally {
      setFetchingSchedules(false);
    }
  };
  useEffect(() => {
    if (academic_background?.[0]) {
      fetchSchedules();
    }
  }, [academic_background]);

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
      await axios.post('https://node-mysql-signup-verification-api.onrender.com/enrollment/external/submit-enlistment', {
        fulldata_applicant_id: applicant_id,
        class_ids: selectedSubjects
      });
      
      toast({
        title: "Success",
        description: "Successfully submitted enlistment!",
      });

      setSelectedSubjects([]);
      fetchSchedules();
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
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Available Subjects</CardTitle>
        <Button 
          onClick={handleSubmitEnlistment}
          disabled={selectedSubjects.length === 0 || loading}
          className="ml-auto"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            `Submit Enlistment (${selectedSubjects.length})`
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {fetchingSchedules ? (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin mb-2" />
            <p className="text-sm text-muted-foreground">Loading available subjects...</p>
          </div>
        ) : schedules.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8">
            <p className="text-sm text-muted-foreground">No subjects available for enrollment at this time.</p>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={fetchSchedules} 
              className="mt-2"
            >
              Refresh
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course Code</TableHead>
                <TableHead>Course Name</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Instructor</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Units</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedules.map((schedule) => {
                const isSelected = selectedSubjects.includes(schedule.schedule_id);
                
                return (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell>{schedule.course.code}</TableCell>
                    <TableCell>{schedule.course.description}</TableCell>
                    <TableCell>{`${schedule.day} ${schedule.time.start} - ${schedule.time.end}`}</TableCell>
                    <TableCell>{`${schedule.instructor.title} ${schedule.instructor.name}`}</TableCell>
                    <TableCell>{schedule.room}</TableCell>
                    <TableCell>{schedule.course.units}</TableCell>
                    <TableCell>
                      <Button 
                        variant={isSelected ? "default" : "outline"}
                        size="sm"
                        onClick={() => handleSelectSubject(schedule.schedule_id)}
                        disabled={loading}
                      >
                        {isSelected ? "Selected" : "Select"}
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
};

export default SubjectEnlistment;