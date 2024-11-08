// components/academics/AcademicsView.tsx
"use client"

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"

import {  GraduationCap } from 'lucide-react';

export default function AcademicsView() {
  // Dummy data
  const currentGrades = [
    { subject: 'Computer Programming II (Lec) - A', code: 'IT121', units: 3, grade: '1.25', term: 'Midterm' },
    { subject: 'Data Structures & Algorithm (Lec)', code: 'IT210', units: 3, grade: '1.50', term: 'Midterm' },
    { subject: 'Systems Administration & Maintenance', code: 'IT412', units: 3, grade: '1.75', term: 'Midterm' },
  ];

  const schedule = [
    { subject: 'Computer Programming II (Lec) - A', code: 'IT121', schedule: 'Monday, Wednesday - 9:00 AM to 10:30 AM', room: 'Room 301' },
    { subject: 'Data Structures & Algorithm (Lec)', code: 'IT210', schedule: 'Monday, Wednesday - 2:00 AM to 3:00 AM', room: 'Room 302' },
    { subject: 'Systems Administration & Maintenance', code: 'IT412', schedule: 'Friday - 9:00 AM to 1:00 PM', room: 'Computer Lab 1' },
  ];

  const academicRecord = {
    gpa: '1.50',
    totalUnits: '98',
    completedUnits: '76',
    remainingUnits: '22',
    standing: 'Good Standing',
    terms: [
      { term: '1st Semester 2023-2024', gpa: '1.50' },
      { term: '2nd Semester 2022-2023', gpa: '1.75' },
      { term: '1st Semester 2022-2023', gpa: '1.25' },
    ]
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-8 py-12">
            <div className="flex items-center gap-6">
              <div className="h-24 w-24 rounded-full bg-white flex items-center justify-center">
                <GraduationCap className="h-12 w-12 text-blue-500" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Academic Records</h1>
                <p className="text-blue-100 mt-1">Current Term: 1st Semester 2023-2024</p>
              </div>
            </div>
          </div>
          
          {/* Academic Summary */}
          <div className="px-8 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <InfoCard label="GPA" value={academicRecord.gpa} />
              <InfoCard label="Total Units" value={academicRecord.totalUnits} />
              <InfoCard label="Completed Units" value={academicRecord.completedUnits} />
              <InfoCard label="Academic Standing" value={academicRecord.standing} />
            </div>
          </div>
        </div>

        {/* Tabs Section */}
        <Tabs defaultValue="grades" className="bg-white rounded-xl shadow-sm p-6">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="grades">Current Grades</TabsTrigger>
            <TabsTrigger value="schedule">Class Schedule</TabsTrigger>
            <TabsTrigger value="history">Grade History</TabsTrigger>
          </TabsList>

          {/* Grades Tab */}
          <TabsContent value="grades">
            <div className="rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Grade</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Term</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentGrades.map((grade, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{grade.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{grade.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{grade.units}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          parseFloat(grade.grade) <= 1.5 ? 'bg-green-100 text-green-800' :
                          parseFloat(grade.grade) <= 2.0 ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {grade.grade}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{grade.term}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule">
            <div className="rounded-lg border">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Schedule</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Room</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {schedule.map((class_, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{class_.subject}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{class_.code}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{class_.schedule}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">{class_.room}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history">
            <div className="space-y-6">
              {academicRecord.terms.map((term, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-medium">{term.term}</h3>
                    <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-sm">
                      GPA: {term.gpa}
                    </span>
                  </div>
                  {/* You could add more term details here */}
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

const InfoCard = ({ label, value }: { label: string; value: string }) => (
  <div className="flex flex-col space-y-1 p-4 bg-gray-50 rounded-lg">
    <p className="text-sm text-gray-500">{label}</p>
    <p className="font-medium text-lg">{value}</p>
  </div>
);
