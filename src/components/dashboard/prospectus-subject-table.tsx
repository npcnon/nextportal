'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useStudentProfileStore } from '@/lib/profile-store';
import { useProspectusStore } from '@/lib/prospectus-store';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  FiBook, 
  FiClock, 
  FiList, 
  FiBookOpen 
} from 'react-icons/fi';
import { ProspectusSubject } from '@/types/prospectus';
import { Button } from '../ui/button';
import unauthenticatedApiClient from '@/lib/clients/unauthenticated-api-client';

export function ProspectusSubjectCard() {
  const { 
    prospectusSubjects, 
    isLoading 
  } = useProspectusStore();
  const [isProspectusModalOpen, setIsProspectusModalOpen] = React.useState(false);

  return (
    <Dialog open={isProspectusModalOpen} onOpenChange={setIsProspectusModalOpen}>
      <DialogTrigger asChild>
        <Card className="group relative overflow-hidden bg-gradient-to-br from-blue-50/50 via-blue-50/50 to-white border-blue-100 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer">
          <CardContent className="pt-4 flex items-center">
            <FiBookOpen className="text-4xl text-blue-600 mr-3" />
            <div>
              <div className="text-xl font-bold text-black mb-1">
                {prospectusSubjects.length}/8
              </div>
              <p className="text-sm text-black/70">Prospectus Subjects</p>
              <Progress 
                value={(prospectusSubjects.length / 8) * 100} 
                className="mt-3 h-2 bg-blue-100 [&>div]:bg-blue-600"
              />
            </div>
          </CardContent>
        </Card>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Prospectus Subjects</DialogTitle>
        </DialogHeader>
        <ProspectusSubjectTable />
      </DialogContent>
    </Dialog>
  );
}

export function ProspectusSubjectTable() {
    const { profileData } = useStudentProfileStore();
    const { 
      prospectusSubjects, 
      isLoading, 
      fetchProspectusSubjects 
    } = useProspectusStore();
    const [selectedSubject, setSelectedSubject] = useState<ProspectusSubject | null>(null);
  
    useEffect(() => {
      const fetchProgramCode = async () => {
        const campusId = profileData.profile.student_info.campus;
        const programId = profileData.profile.student_info.program;
    
        try {
          const response = await unauthenticatedApiClient.get(`program/?campus_id=${campusId}`);
          const programs = response.data.results;
    
          const matchedProgram = programs.find(program => program.id === programId);
    
          if (matchedProgram) {
            fetchProspectusSubjects(matchedProgram.code);
          }
        } catch (error) {
          console.error('Error fetching program code:', error);
        }
      };
    
      fetchProgramCode();
    }, [profileData]);
  
    const groupedSubjects = useMemo(() => {
      return prospectusSubjects.reduce((acc, subject) => {
        const key = subject.yearLevel;
        if (!acc[key]) {
          acc[key] = {};
        }
        const semesterKey = subject.semesterName;
        if (!acc[key][semesterKey]) {
          acc[key][semesterKey] = [];
        }
        acc[key][semesterKey].push(subject);
        return acc;
      }, {} as Record<string, Record<string, ProspectusSubject[]>>);
    }, [prospectusSubjects]);
  
    const getYearLevelColor = (yearLevel: string) => {
      const colors = {
        '1': 'bg-blue-100 text-blue-800',
        '2': 'bg-green-100 text-green-800',
        '3': 'bg-yellow-100 text-yellow-800',
        '4': 'bg-purple-100 text-purple-800',
      };
      return colors[yearLevel] || 'bg-gray-100 text-gray-800';
    };
  
    const handlePrerequisiteClick = (subject: ProspectusSubject) => {
      setSelectedSubject(subject);
    };
  
    if (isLoading) {
      return (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      );
    }
  
    return (
      <div className="space-y-8">
        {Object.entries(groupedSubjects).map(([yearLevel, semesters]) => (
          <div key={yearLevel} className="bg-white rounded-lg shadow-md">
            <div className={`p-4 ${getYearLevelColor(yearLevel)} rounded-t-lg`}>
              <h2 className="text-2xl font-bold"> {yearLevel}</h2>
            </div>
            <div className="p-4 space-y-6">
              {Object.entries(semesters).map(([semester, subjects]) => (
                <div key={semester}>
                  <h3 className="text-lg font-semibold text-gray-700 mb-4">
                    {semester}
                  </h3>
                  <div className="space-y-4">
                    {subjects.map((subject) => (
                      <Card 
                        key={subject.prospectus_subject_id} 
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <CardContent className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 space-y-2 md:space-y-0">
                          <div className="flex items-center space-x-4 w-full md:w-auto">
                            <div>
                              <div className="font-bold">{subject.courseCode}</div>
                              <div className="text-sm text-gray-600">
                                {subject.courseDescription}
                              </div>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center justify-between w-full md:w-auto space-x-2">
                            <Badge variant="secondary" className="flex items-center">
                              <FiClock className="mr-1" /> {subject.unit} Units
                            </Badge>
                            {subject.prerequisites.length > 0 && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => handlePrerequisiteClick(subject)}
                                className="whitespace-nowrap"
                              >
                                View Prerequisites
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
  
        {selectedSubject && (
          <Dialog 
            open={!!selectedSubject} 
            onOpenChange={() => setSelectedSubject(null)}
          >
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  Prerequisites for {selectedSubject.courseCode}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {selectedSubject.prerequisites.map((prereq) => (
                  <Card key={prereq.pre_requisite_id}>
                    <CardContent className="p-4">
                      <div className="font-bold">{prereq.courseCode}</div>
                      <div className="text-sm text-gray-600">
                        {prereq.courseDescription}
                      </div>
                      <Badge variant="secondary" className="mt-2">
                        <FiClock className="mr-1" /> {prereq.unit} Units
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    );
  }