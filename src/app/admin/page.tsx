"use client"
import React, { useState, useEffect } from 'react';

import { MessageCircle } from 'lucide-react';
import { 
  LayoutDashboard, 
  Users, 
  UserCheck, 
  UserX, 
  Calendar, 
  Mail,
  Loader2, 
  X,
  Badge,
  Filter,
  File
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import StudentEditModal from '@/components/admin/student-modal';
import StudentDocumentsModal from '@/components/admin/document-modal';
import unauthenticatedApiClient from '@/lib/clients/unauthenticated-api-client';
import apiClient from '@/lib/clients/authenticated-api-client';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AdminContactModal from '@/components/admin/contact-modal';

export default function AdminDashboard() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [isDocumentsModalOpen, setIsDocumentsModalOpen] = useState(false);
  const [selectedStudentEmail, setSelectedStudentEmail] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isUpdatingSave, setIsUpdatingSave] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [adminContacts, setAdminContacts] = useState([]);
  const [selectedContact, setSelectedContact] = useState(null);
  const [isAdminContactModalOpen, setIsAdminContactModalOpen] = useState(false);
  const [currentStatus, setCurrentStatus] = useState('All');
  const [stats, setStats] = useState({
    totalStudents: 0,
    unverifiedStudents: 0,
    pendingStudents: 0,
    officiallyEnrolledStudents: 0,
    rejectedStudents: 0,
    initiallyEnrolledStudents: 0,
    newThisWeek: 0
  });

  const handleViewDocuments = (email) => {
    setSelectedStudentEmail(email);
    setIsDocumentsModalOpen(true);
  };
  const STATUS_COLORS = {
    'unverified': 'bg-yellow-100 text-yellow-800',
    'pending': 'bg-blue-100 text-blue-800',
    'rejected': 'bg-red-100 text-red-800',
    'officially enrolled': 'bg-green-100 text-green-800',
    'initially enrolled': 'bg-purple-100 text-purple-800'
  };

  // Add a useEffect to fetch admin contacts
useEffect(() => {
  const fetchAdminContacts = async () => {
    try {
      const response = await unauthenticatedApiClient.get('admin-contacts/');
      console.log(`admin contacts: ${JSON.stringify(response.data)}`)
      setAdminContacts(response.data);
    } catch (error) {
      console.error('Failed to fetch admin contacts:', error);
    }
  };

  fetchAdminContacts();
}, []);
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setIsLoading(true);
        const response = await unauthenticatedApiClient.get('full-student-data/');
        const data = await response.data;
        
        const processedStudents = data.personal_data.map((personal, index) => ({
          fulldata_applicant_id: personal.fulldata_applicant_id,
          personal_data: personal,
          add_personal_data: data.add_personal_data[index],
          academic_background: data.academic_background[index],
          academic_history: data.academic_history[index],
          family_background: data.family_background[index]
        }));
        
        setStudents(processedStudents);
        setFilteredStudents(processedStudents);
        
        // Calculate stats
        setStats({
          totalStudents: processedStudents.length,
          unverifiedStudents: processedStudents.filter(s => s.personal_data.status === 'unverified').length,
          pendingStudents: processedStudents.filter(s => s.personal_data.status === 'pending').length,
          officiallyEnrolledStudents: processedStudents.filter(s => s.personal_data.status === 'officially enrolled').length,
          rejectedStudents: processedStudents.filter(s => s.personal_data.status === 'rejected').length,
          initiallyEnrolledStudents: processedStudents.filter(s => s.personal_data.status === 'initially enrolled').length,
          newThisWeek: processedStudents.filter(
            student => new Date(student.personal_data.created_at) > 
              new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          ).length
        });
      } catch (error) {
        console.error('Failed to fetch students:', error);
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchStudents();
  }, []);

  const filterStudents = (status) => {
    setCurrentStatus(status);
    if (status === 'All') {
      setFilteredStudents(students);
    } else {
      setFilteredStudents(
        students.filter(student => student.personal_data.status === status)
      );
    }
  };

  const handleEditStudent = (student) => {
    setSelectedStudent(student);
    setIsModalOpen(true);
  };

  const NoStudentsFound = () => (
    <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-lg">
      <div className="w-64 h-64 mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
        <Users className="w-32 h-32 text-gray-400 animate-pulse" />
      </div>
      <h2 className="text-2xl font-bold text-gray-800 mb-2">
        No Students Found
      </h2>
      <p className="text-gray-600 text-center mb-4">
        There are no students in the {currentStatus} category at the moment.
      </p>
      <Button 
        variant="outline" 
        onClick={() => filterStudents('All')}
      >
        <X className="mr-2 h-4 w-4" /> Clear Filter
      </Button>
    </div>
  );
  const handleSaveStudent = async (updatedStudent) => {
    try {
      setIsUpdatingSave(true);
      // Personal Student Data
      await unauthenticatedApiClient.put(`deactivate_or_modify_personal-student-data/${updatedStudent.fulldata_applicant_id}/False`, {
        "f_name": updatedStudent.personal_data.f_name,
        "m_name": updatedStudent.personal_data.m_name,
        "l_name": updatedStudent.personal_data.l_name,
        "suffix": updatedStudent.personal_data.suffix,
        "sex": updatedStudent.personal_data.sex,
        "birth_date": updatedStudent.personal_data.birth_date,
        "birth_place": updatedStudent.personal_data.birth_place,
        "marital_status": updatedStudent.personal_data.marital_status,
        "religion": updatedStudent.personal_data.religion,
        "country": updatedStudent.personal_data.country,
        "email": updatedStudent.personal_data.email,
        "status": updatedStudent.personal_data.status,
        "acr": updatedStudent.personal_data.acr
      });
  
      // Additional Personal Data
      await unauthenticatedApiClient.put(`deactivate_or_modify_addstdntinfo/${updatedStudent.fulldata_applicant_id}/False`, {
        "city_address": updatedStudent.add_personal_data.city_address,
        "province_address": updatedStudent.add_personal_data.province_address,
        "contact_number": updatedStudent.add_personal_data.contact_number,
        "city_contact_number": updatedStudent.add_personal_data.city_contact_number,
        "province_contact_number": updatedStudent.add_personal_data.province_contact_number,
        "citizenship": updatedStudent.add_personal_data.citizenship
      });
  
      // Family Background
      await unauthenticatedApiClient.put(`deactivate_or_modify_stdntfamily/${updatedStudent.fulldata_applicant_id}/False`, {
        "father_fname": updatedStudent.family_background.father_fname ,
        "father_mname": updatedStudent.family_background.father_mname,
        "father_lname": updatedStudent.family_background.father_lname,
        "father_contact_number": updatedStudent.family_background.father_contact_number,
        "father_email": updatedStudent.family_background.father_email,
        "father_occupation": updatedStudent.family_background.father_occupation,
        "father_income": updatedStudent.family_background.father_income,
        "father_company": updatedStudent.family_background.father_company,
        "mother_fname": updatedStudent.family_background.mother_fname,
        "mother_mname": updatedStudent.family_background.mother_mname,
        "mother_lname": updatedStudent.family_background.mother_lname,
        "mother_contact_number": updatedStudent.family_background.mother_contact_number,
        "mother_email": updatedStudent.family_background.mother_email,
        "mother_occupation": updatedStudent.family_background.mother_occupation,
        "mother_income": updatedStudent.family_background.mother_income,
        "mother_company": updatedStudent.family_background.mother_company,
        "guardian_fname": updatedStudent.family_background.guardian_fname,
        "guardian_mname": updatedStudent.family_background.guardian_mname,
        "guardian_lname": updatedStudent.family_background.guardian_lname,
        "guardian_relation": updatedStudent.family_background.guardian_relation,
        "guardian_contact_number": updatedStudent.family_background.guardian_contact_number,
        "guardian_email": updatedStudent.family_background.guardian_email
      });
  
      // Academic Background
      await unauthenticatedApiClient.put(`deactivate_or_modify_stdntacademicbackground/${updatedStudent.fulldata_applicant_id}/False`, {
        "program": updatedStudent.academic_background.program,
        "major_in": updatedStudent.academic_background.major_in,
        "student_type": updatedStudent.academic_background.student_type,
        "semester_entry": updatedStudent.academic_background.semester_entry,
        "year_level": updatedStudent.academic_background.year_level,
        "year_entry": updatedStudent.academic_background.year_entry,
        "year_graduate": updatedStudent.academic_background.year_graduate,
        "application_type": updatedStudent.academic_background.application_type
      });
  
      // Academic History
      await unauthenticatedApiClient.put(`deactivate_or_modify_stdntacademichistory/${updatedStudent.fulldata_applicant_id}/False`, {
        "elementary_school": updatedStudent.academic_history.elementary_school,
        "elementary_address": updatedStudent.academic_history.elementary_address,
        "elementary_honors": updatedStudent.academic_history.elementary_honors,
        "elementary_graduate": updatedStudent.academic_history.elementary_graduate,
        "junior_highschool": updatedStudent.academic_history.junior_highschool,
        "junior_address": updatedStudent.academic_history.junior_address,
        "junior_honors": updatedStudent.academic_history.junior_honors,
        "junior_graduate": updatedStudent.academic_history.junior_graduate,
        "senior_highschool": updatedStudent.academic_history.senior_highschool,
        "senior_address": updatedStudent.academic_history.senior_address,
        "senior_honors": updatedStudent.academic_history.senior_honors,
        "senior_graduate": updatedStudent.academic_history.senior_graduate,
        "ncae_grade": updatedStudent.academic_history.ncae_grade,
        "ncae_year_taken": updatedStudent.academic_history.ncae_year_taken,
        "latest_college": updatedStudent.academic_history.latest_college,
        "college_address": updatedStudent.academic_history.college_address,
        "college_honors": updatedStudent.academic_history.college_honors,
        "program": updatedStudent.academic_history.program
      });
      
       // Update the local state to reflect changes
    const updatedStudents = students.map(s => 
      s.fulldata_applicant_id === updatedStudent.fulldata_applicant_id 
        ? updatedStudent 
        : s
    );
    
    setStudents(updatedStudents);
    setFilteredStudents(
      currentStatus === 'All' 
        ? updatedStudents 
        : updatedStudents.filter(student => student.personal_data.status === currentStatus)
    );

    // Recalculate stats
    setStats({
      totalStudents: updatedStudents.length,
      unverifiedStudents: updatedStudents.filter(s => s.personal_data.status === 'unverified').length,
      pendingStudents: updatedStudents.filter(s => s.personal_data.status === 'pending').length,
      officiallyEnrolledStudents: updatedStudents.filter(s => s.personal_data.status === 'officially enrolled').length,
      rejectedStudents: updatedStudents.filter(s => s.personal_data.status === 'rejected').length,
      initiallyEnrolledStudents: updatedStudents.filter(s => s.personal_data.status === 'initially enrolled').length,
      newThisWeek: updatedStudents.filter(
        student => new Date(student.personal_data.created_at) > 
          new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      ).length
    });

    setIsModalOpen(false);
  } catch (error) {
    console.error('Failed to save student:', error);
    // Optionally show an error toast or message
  } finally {
    setIsUpdatingSave(false);
    window.location.reload();
  }
};
  // Super Aesthetic Loading Component
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl">
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden">
            <div className="p-8 flex flex-col items-center justify-center space-y-6">
              {/* Animated Loading Graphic */}
              <div className="relative w-32 h-32">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-4 bg-blue-500/40 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-16 w-16 text-blue-600 animate-spin" />
                </div>
              </div>

              {/* Loading Text with Animated Gradient */}
              <div className="text-center">
                <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 
                  text-transparent bg-clip-text animate-gradient-x">
                  Loading Dashboard
                </h2>
                <p className="text-gray-600 mt-2 animate-pulse">
                  Preparing your student management system...
                </p>
              </div>

              {/* Skeleton Preview */}
              <div className="w-full grid grid-cols-4 gap-4 mt-8">
                {[...Array(4)].map((_, index) => (
                  <div 
                    key={index} 
                    className="bg-gray-100/50 rounded-xl p-4 space-y-2 animate-pulse"
                  >
                    <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>

              {/* Additional Loading Indicators */}
              <div className="w-full bg-gray-100/50 rounded-xl p-4 space-y-4 animate-pulse">
                {[...Array(3)].map((_, index) => (
                  <div 
                    key={index} 
                    className="h-12 bg-gray-200 rounded w-full"
                  ></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <p className="text-gray-500">Student Management System</p>
        </div>
        
        <div className="flex items-center space-x-4">
          <Avatar>
            <AvatarImage src="/placeholder-admin.jpg" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-semibold">Admin User</p>
            <p className="text-sm text-gray-500">System Administrator</p>
          </div>
        </div>
      </div>

      {/* Expanded Stats Cards and Status Legend */}
      <div className="mb-8">
        <div className="grid grid-cols-6 gap-4">
          {[
            { 
              label: 'Total Students', 
              value: stats.totalStudents, 
              Icon: Users,
              color: 'bg-gray-100 text-gray-800 border-gray-300',
              description: 'All registered students'
            },
            { 
              label: 'Unverified', 
              value: stats.unverifiedStudents,
              Icon: UserX, 
              color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
              description: 'Students awaiting initial verification'
            },
            { 
              label: 'Pending', 
              value: stats.pendingStudents,
              Icon: LayoutDashboard, 
              color: 'bg-blue-100 text-blue-800 border-blue-300',
              description: 'Applications under review'
            },
            { 
              label: 'Initially Enrolled', 
              value: stats.initiallyEnrolledStudents,
              Icon: UserCheck, 
              color: 'bg-purple-100 text-purple-800 border-purple-300',
              description: 'Students in initial enrollment phase'
            },
            { 
              label: 'Officially Enrolled', 
              value: stats.officiallyEnrolledStudents,
              Icon: UserCheck, 
              color: 'bg-green-100 text-green-800 border-green-300',
              description: 'Students fully confirmed and enrolled'
            },
            { 
              label: 'Rejected', 
              value: stats.rejectedStudents,
              Icon: X, 
              color: 'bg-red-100 text-red-800 border-red-300',
              description: 'Applications not accepted'
            }
          ].map(({ label, value, color, Icon, description }, index) => (
            <div 
              key={index} 
              className={`
                ${color} 
                rounded-xl 
                p-4 
                shadow-md 
                hover:shadow-lg 
                transition-all 
                duration-300 
                ease-in-out 
                transform 
                hover:-translate-y-1 
                border-l-4 
                flex 
                flex-col 
                justify-between
              `}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <Icon className="h-6 w-6 opacity-70" />
                  <span className="font-semibold text-sm">{label}</span>
                </div>
                <div className="text-2xl font-bold">{value}</div>
              </div>
              <p className="text-xs opacity-70">{description}</p>
            </div>
          ))}
        </div>
      </div>
      {/* Students Section with Tabs */}
      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
          <CardTitle>Student Management</CardTitle>
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Showing: {currentStatus}
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="All">
            <TabsList className="grid grid-cols-6 mb-4">
              {['All', 'Unverified', 'Pending', 'Officially Enrolled', 'Initially Enrolled', 'Rejected'].map((status) => (
                <TabsTrigger 
                  key={status} 
                  value={status} 
                  onClick={() => filterStudents(status === 'All' ? 'All' : status.toLowerCase())}
                >
                  {status}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {filteredStudents.length === 0 ? (
              <NoStudentsFound />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Birth Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredStudents.map((student) => (
                    <TableRow key={student.fulldata_applicant_id}>
                      <TableCell>
                        {`${student.personal_data.f_name} ${student.personal_data.l_name}`}
                      </TableCell>
                      <TableCell>{student.personal_data.email}</TableCell>
                      <TableCell>{student.personal_data.birth_date}</TableCell>
                      <TableCell>
                        <Badge 
                          className={`${STATUS_COLORS[student.personal_data.status]} rounded-full`}
                        >
                          {student.personal_data.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            onClick={() => handleEditStudent(student)}
                          >
                            Review
                          </Button>
                          <Button 
                            variant="secondary" 
                            onClick={() => handleViewDocuments(student.personal_data.email)}
                          >
                            <File className="mr-2 h-4 w-4" /> Documents
                          </Button>
                          {currentStatus === 'unverified' && student.personal_data.status === 'unverified' && (
                            <Button 
                              variant="default" 
                              disabled={isUpdatingStatus}
                              onClick={async () => {
                                try {
                                  setIsUpdatingStatus(true);
                                  await unauthenticatedApiClient.put(`deactivate_or_modify_personal-student-data/${student.fulldata_applicant_id}/False`, {
                                    "status": "pending"
                                  });
                                  
                                  // Update local state
                                  setStudents(students.map(s => 
                                    s.fulldata_applicant_id === student.fulldata_applicant_id 
                                      ? {...s, personal_data: {...s.personal_data, status: 'pending'}} 
                                      : s
                                  ));
                                  filterStudents(currentStatus);
                                } catch (error) {
                                  console.error('Failed to update student status:', error);
                                } finally {
                                  setIsUpdatingStatus(false);
                                  window.location.reload();
                                }
                              }}
                            >
                              {isUpdatingStatus ? (
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Updating...
                                </div>
                              ) : (
                                "Update Status"
                              )}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Tabs>
        </CardContent>
      </Card>
        {/* Admin Contacts Section */}
<Card className="mt-8">
  <CardHeader className="flex flex-row justify-between items-center">
    <CardTitle>Admin Contact Requests</CardTitle>
    <div className="flex items-center space-x-2">
      <Mail className="h-4 w-4 text-gray-500" />
      <span className="text-sm text-gray-600">
        Total Requests: {adminContacts.length}
      </span>
    </div>
  </CardHeader>
  <CardContent>
    {adminContacts.length === 0 ? (
      <div className="text-center py-8 text-gray-500">
        No admin contact requests at the moment
      </div>
    ) : (
      <div className="space-y-4">
        {adminContacts.map((contact) => (
          <div 
            key={contact.id} 
            className="bg-gray-100 p-4 rounded-lg hover:bg-gray-200 transition-colors cursor-pointer"
            onClick={() => {
              setSelectedContact(contact);
              setIsAdminContactModalOpen(true);
            }}
          >
            <div className="flex justify-between items-center">
              <div>
                <p className="text-sm text-gray-800 line-clamp-2">
                  {contact.message}
                </p>
                <div className="flex items-center space-x-2 mt-2">
                  <span className="text-xs text-gray-500">
                    {new Date(contact.created_at).toLocaleString()}
                  </span>
                  {contact.document_count > 0 && (
                    <Badge>
                      {contact.document_count} Attachment{contact.document_count !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
              </div>
              <MessageCircle className="h-5 w-5 text-gray-500" />
            </div>
          </div>
        ))}
      </div>
    )}
  </CardContent>
</Card>

{/* Admin Contact Modal */}
{isAdminContactModalOpen && selectedContact && (
  <AdminContactModal 
    contact={selectedContact} 
    onClose={() => setIsAdminContactModalOpen(false)} 
  />
)}  
      {/* Student Edit Modal remains the same */}
      {selectedStudent && (
        <StudentEditModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          studentData={selectedStudent}
          onSave={handleSaveStudent}
        />
      )}
      {/* Student Documents Modal */}
      {isDocumentsModalOpen && selectedStudentEmail && (
        <StudentDocumentsModal 
          isOpen={isDocumentsModalOpen}
          onClose={() => setIsDocumentsModalOpen(false)}
          email={selectedStudentEmail}
        />
      )}
      {isUpdatingSave && (
        <div className="fixed inset-0 bg-gradient-to-br from-blue-500/40 to-purple-600/40 backdrop-blur-sm flex items-center justify-center z-[100]">
          <div className="bg-white/90 p-8 rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full">
            <div className="flex flex-col items-center space-y-6">
              {/* Animated Loading Spinner */}
              <div className="relative w-24 h-24">
                <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-pulse"></div>
                <div className="absolute inset-2 bg-blue-500/30 rounded-full animate-ping"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                </div>
              </div>

              {/* Animated Text */}
              <div className="text-center">
                <h3 className="text-2xl font-bold text-gray-800 mb-2 animate-pulse">
                  Updating Student Data
                </h3>
                <p className="text-gray-600 text-sm animate-bounce">
                  Please wait while we save your changes...
                </p>
              </div>

              {/* Progress Indicator */}
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full animate-progress-pulse" 
                  style={{width: '75%'}}
                ></div>
              </div>

              {/* Optional Subtle Tip */}
              <div className="text-xs text-gray-500 text-center">
                Do not close or refresh the page
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}