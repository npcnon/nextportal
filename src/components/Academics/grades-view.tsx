import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  GradeEntry, 
  GradeType, 
  normalizeGrades, 
  isGradeAvailable, 
  getGradeStatus,
  transformGradesData 
} from './grade-types';
import { useStudentProfileStore } from '@/lib/profile-store';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BookOpen } from 'lucide-react';
import { motion } from 'framer-motion';

// API utility function
const fetchStudentGrades = async (studentId: string) => {
  if (!studentId) return [];

  try {
    const response = await axios.get(
      `https://xavgrading-api.onrender.com/external/get-grades-of-students-by-studentid/${studentId}`
    );
    return response.data.students as GradeEntry[];
  } catch (error) {
    console.error('Failed to fetch grades:', error);
    return [];
  }
};

// Grade Status Badge Component
const GradeStatusBadge: React.FC<{ status: 'pending' | 'graded' }> = ({ status }) => {
  return (
    <Badge 
      variant={status === 'pending' ? 'secondary' : 'default'}
      className={`
        ${status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}
        text-xs sm:text-sm
      `}
    >
      {status === 'pending' ? 'Pending' : 'Graded'}
    </Badge>
  );
};

// Updated Subject Grade Component
const SubjectGrade: React.FC<{ entry: GradeEntry }> = ({ entry }) => {
  const gradeStatus = getGradeStatus(entry.grades);

  return (
    <Card className="mb-4 w-full">
      <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-2 sm:space-y-0 pb-2">
        <CardTitle className="text-sm sm:text-base font-medium break-words">{entry.subjectcode}</CardTitle>
        <GradeStatusBadge status={gradeStatus.Prelim} />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {(['Prelim', 'Midterm', 'Final'] as GradeType[]).map((gradeType) => (
            <div key={gradeType} className="text-center p-2">
              <p className="text-xs sm:text-sm text-muted-foreground">{gradeType}</p>
              <p className="text-sm sm:text-base font-bold">
                {isGradeAvailable(entry.grades[gradeType]) 
                  ? entry.grades[gradeType] 
                  : 'Not Available'}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface GradesViewProps {
  semesterName: string;
  schoolYear: string;
}

// Main Grades View Component
export const GradesView: React.FC<GradesViewProps> = ({ semesterName, schoolYear }) => {
  const { profileData, isLoadingProfile } = useStudentProfileStore();
  const [grades, setGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadGrades = async () => {
      if (!isLoadingProfile && profileData.student_id) {
        setIsLoading(true);
        try {
          // Fetch all grades first
          const allGrades = await fetchStudentGrades(profileData.student_id);
          
          // Filter by semester and year
          const filteredGrades = allGrades.filter(grade => 
            grade.semester === semesterName && 
            grade.year === schoolYear
          );
          
          const transformedGrades = transformGradesData(filteredGrades);
          setGrades(transformedGrades);
        } catch (error) {
          console.error('Error loading grades:', error);
          setGrades([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadGrades();
  }, [profileData.student_id, isLoadingProfile, semesterName, schoolYear]);

  // Loading state
  if (isLoadingProfile || isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className="w-6 sm:w-8 h-6 sm:h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (grades.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-sm sm:text-base">No grades available at the moment.</p>
      </div>
    );
  }

  const totalSubjects = grades.length;
  const gradedSubjects = grades.filter(entry => 
    isGradeAvailable(entry.grades.Prelim) && 
    isGradeAvailable(entry.grades.Midterm) && 
    isGradeAvailable(entry.grades.Final)
  ).length;

  return (
    <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
      <div className="bg-white shadow rounded-lg p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <h2 className="text-lg sm:text-xl font-semibold">Grades Overview</h2>
          <p className="text-xs sm:text-sm text-gray-500">
            {gradedSubjects} of {totalSubjects} subjects fully graded
          </p>
        </div>
      </div>

      <div className="space-y-3 sm:space-y-4">
        {grades.map((entry) => (
          <SubjectGrade key={entry.studentgradeid} entry={entry} />
        ))}
      </div>
    </div>
  );
};

export default GradesView;