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

export const SubjectEnlistment = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [enrolledSubjects, setEnrolledSubjects] = useState<number[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedSubjects, setSelectedSubjects] = useState<number[]>([]);
  const { 
    personal_data,
    fetchStudentData 
  } = useFullDataStore();
  const profileData = useStudentProfileStore(state => state.profileData);

  const campusId = profileData.profile.student_info.campus
  const fetchAcademicData = async (campus: number) => {
    try {
      const [programsResponse, semestersResponse] = await Promise.all([
        axios.get(`https://djangoportal-backends.onrender.com/api/program/?campus_id=${campus}`),
        axios.get(`https://djangoportal-backends.onrender.com/api/semester/?campus_id=${campus}`)
      ]);

      setPrograms(programsResponse.data.results);
      setSemesters(semestersResponse.data.results);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load required data. Please try again.",
        variant: "destructive",
      });
    } finally {

    }
  };

  useEffect(() => {
    if (campusId) {
      fetchAcademicData(campusId);
    }
  }, [campusId]);


  useEffect(() => {
    fetchSubjects();
    if (profileData?.profile?.student_info?.basicdata_applicant_id) {
      fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);
      fetchEnrolledSubjects();
    }
  }, [profileData, fetchStudentData]);

  const fetchEnrolledSubjects = async () => {
    const applicant_id = personal_data[0]?.fulldata_applicant_id;
    if (!applicant_id) return;

    try {
      const response = await axios.get(`https://djangoportal-backends.onrender.com/api/student-enlist/?filter=fulldata_applicant_id=${applicant_id}`);
      const enrolledIds = response.data.map((subject: any) => subject.class_id);
      setEnrolledSubjects(enrolledIds);
    } catch (error) {
      console.error('Failed to fetch enrolled subjects:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const [subjectsResponse, employeesResponse] = await Promise.all([
        axios.get('https://djangoportal-backends.onrender.com/api/class-list/?latest_n=5'),
        axios.get('https://djangoportal-backends.onrender.com/api/employee/')
      ]);
  
      const subjects = subjectsResponse.data;
      
      // Get unique course IDs
      const courseIds = [...new Set(subjects.map((subject: Subject) => subject.course))];
      
      // Fetch courses in parallel
      const coursePromises = courseIds.map(id => 
        axios.get(`https://djangoportal-backends.onrender.com/api/course/?filter=id=${id}`)
      );
      
      const courseResponses = await Promise.all(coursePromises);
      const courses = courseResponses.flatMap(response => response.data);
  
      setSubjects(subjects);
      setCourses(courses);
      setEmployees(employeesResponse.data);
  
    } catch (error) {
      console.error('Failed to fetch data:', error);
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive",
      });
    }
  };
  const handleEnlistment = async (subjectId: number) => {
    setLoading(prev => ({ ...prev, [subjectId]: true }));
    const applicant_id = personal_data[0]?.fulldata_applicant_id;

    try {
      await axios.post('https://djangoportal-backends.onrender.com/api/student-enlist/', {
        fulldata_applicant_id: applicant_id,
        class_id: subjectId
      });
      
      toast({
        title: "Success",
        description: "Successfully enlisted in the subject!",
      });
      
      // Update the enrolled subjects list
      setEnrolledSubjects(prev => [...prev, subjectId]);
      fetchSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enlist in the subject. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => ({ ...prev, [subjectId]: false }));
    }
  };

  const handleSelectSubject = (subjectId: number) => {
    setSelectedSubjects(prev => 
      prev.includes(subjectId) 
        ? prev.filter(id => id !== subjectId)
        : [...prev, subjectId]
    );
  };
  
  const handleBulkEnlistment = async () => {
    if (selectedSubjects.length === 0) {
      toast({
        title: "Warning",
        description: "Please select subjects to enlist first.",
        variant: "destructive",
      });
      return;
    }
  
    const applicant_id = personal_data[0]?.fulldata_applicant_id;
    if (!applicant_id) return;
  
    try {
      setLoading(prev => {
        const newLoading = { ...prev };
        selectedSubjects.forEach(id => {
          newLoading[id] = true;
        });
        return newLoading;
      });
  
      await Promise.all(
        selectedSubjects.map(subjectId => 
          axios.post('https://djangoportal-backends.onrender.com/api/student-enlist/', {
            fulldata_applicant_id: applicant_id,
            class_id: subjectId
          })
        )
      );
      
      toast({
        title: "Success",
        description: "Successfully enlisted in selected subjects!",
      });
      
      setEnrolledSubjects(prev => [...prev, ...selectedSubjects]);
      setSelectedSubjects([]);
      fetchSubjects();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to enlist in some subjects. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(prev => {
        const newLoading = { ...prev };
        selectedSubjects.forEach(id => {
          newLoading[id] = false;
        });
        return newLoading;
      });
    }
  };

  const getEnrollButtonState = (subject: Subject) => {
    if (enrolledSubjects.includes(subject.id)) {
      return {
        text: "Enlisted",
        disabled: true,
        variant: "ghost" as const,
        className: "bg-blue-50 text-blue-600 hover:bg-blue-100 hover:text-blue-700"
      };
    }
  
    if (loading[subject.id]) {
      return {
        text: "Processing...",
        disabled: true,
        variant: "outline" as const,
        className: ""
      };
    }
  
    if (!subject.is_active) {
      return {
        text: "Select",
        disabled: true,
        variant: "outline" as const,
        className: ""
      };
    }
  
    // Define the return type explicitly
    return {
      text: selectedSubjects.includes(subject.id) ? "Selected" : "Select",
      disabled: false,
      variant: selectedSubjects.includes(subject.id) ? "default" : "outline",
      className: ""
    } as const;
  };
  
  // You can also create a type for the button state if you want to be more explicit:
  type ButtonState = {
    text: string;
    disabled: boolean;
    variant: "link" | "ghost" | "outline" | "default" | "destructive" | "secondary" | null | undefined;
    className: string;
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Available Subjects</CardTitle>
      <Button 
        onClick={handleBulkEnlistment}
        disabled={selectedSubjects.length === 0}
        className="ml-auto"
      >
        Submit Enlistment ({selectedSubjects.length})
      </Button>
    </CardHeader>
      <CardContent>
        <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Course Code</TableHead>
            <TableHead>Course Name</TableHead>
            <TableHead>Schedule</TableHead>
            <TableHead>Instructor</TableHead>
            <TableHead>Room</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {subjects.map((subject) => {
            const course = courses.find(c => c.id === subject.course);
            const employee = employees.find(e => e.id === subject.employee);
            const buttonState = getEnrollButtonState(subject);
            const scheduleString = `${subject.day} ${subject.start_time.slice(0, 5)} - ${subject.end_time.slice(0, 5)}`;
            
            return (
              <TableRow key={subject.id}>
                <TableCell>{course?.code || 'N/A'}</TableCell>
                <TableCell>{course?.description || 'N/A'}</TableCell>
                <TableCell>{scheduleString}</TableCell>
                <TableCell>
                  {employee ? `${employee.first_name} ${employee.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>{subject.room}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    subject.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {subject.is_active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                <Button 
                  variant={buttonState.variant}
                  size="sm"
                  onClick={() => handleSelectSubject(subject.id)}
                  disabled={buttonState.disabled}
                  className={buttonState.className}
                >
                  {buttonState.text}
                </Button>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default SubjectEnlistment;