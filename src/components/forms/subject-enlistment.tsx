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

interface Subject {
  id: number;
  name: string;
  program: string | null;
  semester: number;
  employee: number;
  subject: string;
  schedule: string;
  is_active: boolean;
  is_deleted: boolean;
  is_enrolled?: boolean; // Added this field
}

export const SubjectEnlistment = () => {
  const { toast } = useToast();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState<{ [key: number]: boolean }>({});
  const [enrolledSubjects, setEnrolledSubjects] = useState<number[]>([]);

  const { 
    personal_data,
    fetchStudentData 
  } = useFullDataStore();
  const profileData = useStudentProfileStore(state => state.profileData);

  useEffect(() => {
    fetchSubjects();
    if (profileData?.profile?.student_info?.basicdata_applicant_id) {
      fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);
      fetchEnrolledSubjects();
    }
  }, [profileData, fetchStudentData]);

  const fetchEnrolledSubjects = async () => {
    const studentId = personal_data[0]?.fulldata_applicant_id;
    if (!studentId) return;

    try {
      const response = await axios.get(`https://djangoportal-backends.onrender.com/api/student-enlist/?filter=fulldata_applicant_id=${studentId}`);
      const enrolledIds = response.data.map((subject: any) => subject.class_id);
      setEnrolledSubjects(enrolledIds);
    } catch (error) {
      console.error('Failed to fetch enrolled subjects:', error);
    }
  };

  const fetchSubjects = async () => {
    try {
      const response = await axios.get('https://djangoportal-backends.onrender.com/api/class-list/');
      setSubjects(response.data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load subjects. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleEnlistment = async (subjectId: number) => {
    setLoading(prev => ({ ...prev, [subjectId]: true }));
    const studentId = personal_data[0]?.fulldata_applicant_id;

    try {
      await axios.post('https://djangoportal-backends.onrender.com/api/student-enlist/', {
        fulldata_applicant_id: studentId,
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
        text: "Enlisting...",
        disabled: true,
        variant: "outline" as const,
        className: ""
      };
    }

    if (!subject.is_active) {
      return {
        text: "Enlist",
        disabled: true,
        variant: "outline" as const,
        className: ""
      };
    }

    return {
      text: "Enlist",
      disabled: false,
      variant: "outline" as const,
      className: ""
    };
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Available Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Subject Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => {
              const buttonState = getEnrollButtonState(subject);
              return (
                <TableRow key={subject.id}>
                  <TableCell className="font-medium">{subject.name}</TableCell>
                  <TableCell>{subject.subject}</TableCell>
                  <TableCell>{subject.schedule}</TableCell>
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
                      onClick={() => handleEnlistment(subject.id)}
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