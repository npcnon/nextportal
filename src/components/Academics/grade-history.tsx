// grade-history.tsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStudentProfileStore } from '@/lib/profile-store';
import { GradeEntry, GradeType } from './grade-types';
import { 
  BookOpen, 
  Calendar, 
  TrendingUp, 
  Award, 
  ChevronDown,
  Star,
  BookOpenCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge } from '@/components/ui/badge';

interface SubjectGrades {
  subjectcode: string;
  grades: Record<GradeType, string | null>;
}

interface SemesterGrades {
  semester: string;
  year: string;
  subjects: SubjectGrades[];
  gpa: string;
}

interface GroupedGrades {
  [key: string]: SemesterGrades;
}

const getGPAColor = (gpa: string): string => {
  const gpaNum = parseFloat(gpa);
  if (gpaNum >= 1.0 && gpaNum <= 1.5) return 'bg-green-100 text-green-800';
  if (gpaNum > 1.5 && gpaNum <= 2.0) return 'bg-blue-100 text-blue-800';
  if (gpaNum > 2.0 && gpaNum <= 2.5) return 'bg-yellow-100 text-yellow-800';
  return 'bg-red-100 text-red-800';
};

const getGradeColor = (grade: string | null): string => {
  if (!grade) return 'text-gray-500';
  const gradeNum = parseFloat(grade);
  if (gradeNum >= 1.0 && gradeNum <= 1.5) return 'text-green-600';
  if (gradeNum > 1.5 && gradeNum <= 2.0) return 'text-blue-600';
  if (gradeNum > 2.0 && gradeNum <= 2.5) return 'text-yellow-600';
  return 'text-red-600';
};

export const GradeHistory: React.FC = () => {
  const { profileData, isLoadingProfile } = useStudentProfileStore();
  const [groupedGrades, setGroupedGrades] = useState<GroupedGrades>({});
  const [isLoading, setIsLoading] = useState(true);
  const [expandedSemester, setExpandedSemester] = useState<string | null>(null);

  const calculateSemesterGPA = (subjects: SubjectGrades[]): string => {
    let totalGradePoints = 0;
    let totalSubjects = 0;

    subjects.forEach(subject => {
      const finalGrade = subject.grades.Final;
      if (finalGrade) {
        totalGradePoints += parseFloat(finalGrade);
        totalSubjects++;
      }
    });

    if (totalSubjects === 0) return 'N/A';
    return (totalGradePoints / totalSubjects).toFixed(2);
  };

  useEffect(() => {
    const fetchGradeHistory = async () => {
      if (!isLoadingProfile && profileData.student_id) {
        try {
          const response = await axios.get(
            `https://xavgrading-api.onrender.com/external/get-grades-of-students-by-studentid/${profileData.student_id}`
          );

          const grouped = response.data.students.reduce((acc: GroupedGrades, grade: GradeEntry) => {
            const key = `${grade.semester}-${grade.year}`;
            
            if (!acc[key]) {
              acc[key] = {
                semester: grade.semester,
                year: grade.year,
                subjects: [],
                gpa: '0.00'
              };
            }

            acc[key].subjects.push({
              subjectcode: grade.subjectcode,
              grades: {
                Prelim: grade.grades.Prelim || null,
                Midterm: grade.grades.Midterm || null,
                Final: grade.grades.Final || null
              }
            });

            // Calculate GPA after adding all subjects
            acc[key].gpa = calculateSemesterGPA(acc[key].subjects);

            return acc;
          }, {});

          setGroupedGrades(grouped);
        } catch (error) {
          console.error('Failed to fetch grade history:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchGradeHistory();
  }, [profileData.student_id, isLoadingProfile]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        >
          <BookOpen className="w-8 h-8 text-blue-500" />
        </motion.div>
      </div>
    );
  }

  if (Object.keys(groupedGrades).length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center py-8 space-y-4"
      >
        <BookOpenCheck className="w-16 h-16 text-gray-400 mx-auto" />
        <p className="text-gray-600">No grade history available.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      {Object.entries(groupedGrades)
        .sort((a, b) => b[0].localeCompare(a[0]))
        .map(([key, semesterData]) => (
          <motion.div
            key={key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <CardHeader 
                className="bg-gradient-to-r from-[#1A2A5B] to-[#142247] text-white cursor-pointer"
                onClick={() => setExpandedSemester(expandedSemester === key ? null : key)}
              >
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5" />
                    <CardTitle className="text-lg font-semibold">
                      {semesterData.semester} {semesterData.year}
                    </CardTitle>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Badge className={`${getGPAColor(semesterData.gpa)} flex items-center space-x-1`}>
                      <Star className="h-3 w-3" />
                      <span>GPA: {semesterData.gpa}</span>
                    </Badge>
                    <motion.div
                      animate={{ rotate: expandedSemester === key ? 180 : 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <ChevronDown className="h-5 w-5" />
                    </motion.div>
                  </div>
                </div>
              </CardHeader>
              
              <AnimatePresence>
                {expandedSemester === key && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <CardContent className="mt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {semesterData.subjects.map((subject, index) => (
                          <motion.div
                            key={`${subject.subjectcode}-${index}`}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-300"
                          >
                            <div className="flex items-center space-x-2 mb-3">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                              <h4 className="font-medium">{subject.subjectcode}</h4>
                            </div>
                            <div className="grid grid-cols-3 gap-4">
                              {(['Prelim', 'Midterm', 'Final'] as GradeType[]).map((period) => (
                                <div key={period} className="text-center">
                                  <p className="text-xs text-gray-500 mb-1">{period}</p>
                                  <p className={`font-semibold ${getGradeColor(subject.grades[period])}`}>
                                    {subject.grades[period] || 'N/A'}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Card>
          </motion.div>
        ))}
    </motion.div>
  );
};

export default GradeHistory;