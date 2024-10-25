// components/forms/subject-registration.tsx

"use client";

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { UserCircle, Home, Users, GraduationCap, School } from "lucide-react";
import { useToast } from "@/hooks/use-toast"; // Updated import path
import { useStudentProfileStore } from '@/lib/profile-store';

// TypeScript Interfaces
interface PersonalData {
  basicdata_applicant_id:number;
  f_name: string;
  m_name?: string;
  suffix?: string;
  l_name: string;
  sex: string;
  birth_date: string;
  birth_place: string;
  marital_status: string;
  religion: string;
  country: string;
  email: string;
  acr?: string;
}

interface AddPersonalData {
  city_address: string;
  province_address?: string;
  contact_number: string;
  city_contact_number?: string;
  province_contact_number?: string;
  citizenship: string;
}

interface FamilyBackground {
  father_fname?: string;
  father_mname?: string;
  father_lname?: string;
  father_contact_number?: string;
  father_email?: string;
  father_occupation?: string;
  father_income?: number;
  father_company?: string;
  mother_fname?: string;
  mother_mname?: string;
  mother_lname?: string;
  mother_contact_number?: string;
  mother_email?: string;
  mother_occupation?: string;
  mother_income?: string;
  mother_company?: string;
  guardian_fname?: string;
  guardian_mname?: string;
  guardian_lname?: string;
  guardian_relation?: string;
  guardian_contact_number?: string;
  guardian_email?: string;
}

interface AcademicBackground {
  program: number;
  major_in?: string;
  student_type: string;
  semester_entry: number;
  year_level: string;
  year_entry: number;
  year_graduate: number;
  application_type: string;
}

interface AcademicHistory {
  elementary_school: string;
  elementary_address: string;
  elementary_honors?: string;
  elementary_graduate?: number;
  junior_highschool: string;
  junior_address: string;
  junior_honors?: string;
  junior_graduate?: number;
  senior_highschool: string;
  senior_address: string;
  senior_honors?: string;
  senior_graduate?: number;
  ncae_grade?: string;
  ncae_year_taken?: number;
  latest_college?: string;
  college_address?: string;
  college_honors?: string;
  program?: string;
}

interface StudentFormData {
  personal_data: PersonalData;
  add_personal_data: AddPersonalData;
  family_background: FamilyBackground;
  academic_background: AcademicBackground;
  academic_history: AcademicHistory;
}

const initialFormState: StudentFormData = {
  personal_data: {
    basicdata_applicant_id:0,
    f_name: "",
    m_name:"",
    suffix:"",
    l_name: "",
    sex: "",
    birth_date: "",
    birth_place: "",
    marital_status: "",
    religion: "",
    country: "",
    email: "",
    acr:"",
  },
  add_personal_data: {
    city_address: "",
    province_address: "",
    contact_number: "",
    city_contact_number: "",
    province_contact_number: "",
    citizenship: "",
  
  },
  family_background: {},
  academic_background: {
    program: 0,
    student_type: "",
    semester_entry: 0,
    year_level: "",
    year_entry: new Date().getFullYear(),
    year_graduate: new Date().getFullYear() + 4,
    application_type: "New",
  },
  academic_history: {
    elementary_school: "Not Provided",
    elementary_address: "Not Provided",
    junior_highschool: "Not Provided",
    junior_address: "Not Provided",
    senior_highschool: "Not Provided",
    senior_address: "Not Provided",
  }
};
const PersonalInfoForm: React.FC<{
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}> = ({ formData, setFormData }) => {
  const profileData = useStudentProfileStore(state => state.profileData);

  useEffect(() => {
    // Populate form with profile data when component mounts
    setFormData(prev => ({
      ...prev,
      personal_data: {
        ...prev.personal_data,
        basicdata_applicant_id: profileData.profile.student_info.basicdata_applicant_id,
        f_name: profileData.profile.student_info.first_name,
        m_name: profileData.profile.student_info.middle_name,
        l_name: profileData.profile.student_info.last_name,
        suffix: profileData.profile.student_info.suffix || '',
        sex: profileData.profile.student_info.sex,
        birth_date: profileData.profile.student_info.birth_date,
        email: profileData.profile.student_info.email,
        birth_place: prev.personal_data.birth_place,
        marital_status: prev.personal_data.marital_status,
        religion: prev.personal_data.religion,
        country: prev.personal_data.country,
      }
    }));
  }, [profileData, setFormData]);

  const handlePersonalChange = (field: keyof PersonalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      personal_data: { ...prev.personal_data, [field]: value }
    }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UserCircle className="h-5 w-5" />
          Personal Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="f_name">First Name*</Label>
            <Input 
              id="f_name"
              value={formData.personal_data.f_name}
              onChange={(e) => handlePersonalChange('f_name', e.target.value)}
              placeholder="Enter first name"
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="m_name">Middle Name</Label>
            <Input 
              id="m_name"
              value={formData.personal_data.m_name}
              onChange={(e) => handlePersonalChange('m_name', e.target.value)}
              placeholder="Enter middle name"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="l_name">Last Name*</Label>
            <Input 
              id="l_name"
              value={formData.personal_data.l_name}
              onChange={(e) => handlePersonalChange('l_name', e.target.value)}
              placeholder="Enter last name"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input 
              id="suffix"
              value={formData.personal_data.suffix}
              onChange={(e) => handlePersonalChange('suffix', e.target.value)}
              placeholder="Enter suffix (if any)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex*</Label>
            <Select 
              value={formData.personal_data.sex}
              onValueChange={(value) => handlePersonalChange('sex', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select sex" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Male">Male</SelectItem>
                <SelectItem value="Female">Female</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date*</Label>
            <Input 
              id="birth_date"
              type="date"
              value={formData.personal_data.birth_date}
              onChange={(e) => handlePersonalChange('birth_date', e.target.value)}
              required
            />
          </div>          
          <div className="space-y-2">
            <Label htmlFor="birth_place">Birth Place*</Label>
            <Input 
              id="birth_place"
              value={formData.personal_data.birth_place}
              onChange={(e) => handlePersonalChange('birth_place', e.target.value)}
              placeholder="Enter birth place"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status*</Label>
            <Select 
              value={formData.personal_data.marital_status}
              onValueChange={(value) => handlePersonalChange('marital_status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select marital status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Single">Single</SelectItem>
                <SelectItem value="Married">Married</SelectItem>
                <SelectItem value="Divorced">Divorced</SelectItem>
                <SelectItem value="Widowed">Widowed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Religion*</Label>
            <Input 
              id="religion"
              value={formData.personal_data.religion}
              onChange={(e) => handlePersonalChange('religion', e.target.value)}
              placeholder="Enter religion"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country*</Label>
            <Input 
              id="country"
              value={formData.personal_data.country}
              onChange={(e) => handlePersonalChange('country', e.target.value)}
              placeholder="Enter country"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input 
              id="email"
              type="email"
              value={formData.personal_data.email}
              readOnly
              className="bg-gray-100"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContactInfoForm: React.FC<{
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}> = ({ formData, setFormData }) => {

  const profileData = useStudentProfileStore(state => state.profileData);

  useEffect(() => {
    // Populate form with profile data when component mounts
    setFormData(prev => ({
      ...prev,
      add_personal_data: {
        ...prev.add_personal_data,
        city_address: profileData.profile.student_info.address,
        contact_number: profileData.profile.student_info.contact_number,
      }
    }));
  }, [profileData, setFormData]);

  const handleContactChange = (field: keyof AddPersonalData, value: string) => {
    setFormData(prev => ({
      ...prev,
      add_personal_data: { ...prev.add_personal_data, [field]: value }
    }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Home className="h-5 w-5" />
          Contact Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city_address">Current Address*</Label>
            <Textarea 
              id="city_address"
              value={formData.add_personal_data.city_address}
              onChange={(e) => handleContactChange('city_address', e.target.value)}
              placeholder="Enter your current address"
              required
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="province_address">Provincial Address</Label>
            <Textarea 
              id="province_address"
              value={formData.add_personal_data.province_address}
              onChange={(e) => handleContactChange('province_address', e.target.value)}
              placeholder="Enter your provincial address (if any)"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Primary Contact Number*</Label>
            <Input 
              id="contact_number"
              value={formData.add_personal_data.contact_number}
              onChange={(e) => handleContactChange('contact_number', e.target.value)}
              placeholder="Enter contact number"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="city_contact_number">Alternative Contact Number</Label>
            <Input 
              id="city_contact_number"
              value={formData.add_personal_data.city_contact_number}
              onChange={(e) => handleContactChange('city_contact_number', e.target.value)}
              placeholder="Enter alternative contact number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="province_contact_number">Provincial Contact Number</Label>
            <Input 
              id="province_contact_number"
              value={formData.add_personal_data.province_contact_number}
              onChange={(e) => handleContactChange('province_contact_number', e.target.value)}
              placeholder="Enter provincial contact number"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="citizenship">Citizenship*</Label>
            <Input 
              id="citizenship"
              value={formData.add_personal_data.citizenship}
              onChange={(e) => handleContactChange('citizenship', e.target.value)}
              placeholder="Enter citizenship"
              required
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};  


const FamilyBackgroundForm: React.FC<{
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}> = ({ formData, setFormData }) => {
  const handleFamilyChange = (field: keyof FamilyBackground, value: string) => {
    setFormData(prev => ({
      ...prev,
      family_background: { ...prev.family_background, [field]: value }
    }));
  };

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <Users className="h-5 w-5" />
          Family Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Father's Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Father's Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="father_fname">First Name</Label>
              <Input 
                id="father_fname"
                value={formData.family_background.father_fname || ''}
                onChange={(e) => handleFamilyChange('father_fname', e.target.value)}
                placeholder="Enter father's first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_mname">Middle Name</Label>
              <Input 
                id="father_mname"
                value={formData.family_background.father_mname || ''}
                onChange={(e) => handleFamilyChange('father_mname', e.target.value)}
                placeholder="Enter father's middle name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_lname">Last Name</Label>
              <Input 
                id="father_lname"
                value={formData.family_background.father_lname || ''}
                onChange={(e) => handleFamilyChange('father_lname', e.target.value)}
                placeholder="Enter father's last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_contact_number">Contact Number</Label>
              <Input 
                id="father_contact_number"
                value={formData.family_background.father_contact_number || ''}
                onChange={(e) => handleFamilyChange('father_contact_number', e.target.value)}
                placeholder="Enter father's contact number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_email">Email Address</Label>
              <Input 
                id="father_email"
                type="email"
                value={formData.family_background.father_email || ''}
                onChange={(e) => handleFamilyChange('father_email', e.target.value)}
                placeholder="Enter father's email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_occupation">Occupation</Label>
              <Input 
                id="father_occupation"
                value={formData.family_background.father_occupation || ''}
                onChange={(e) => handleFamilyChange('father_occupation', e.target.value)}
                placeholder="Enter father's occupation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_company">Company/Employer</Label>
              <Input 
                id="father_company"
                value={formData.family_background.father_company || ''}
                onChange={(e) => handleFamilyChange('father_company', e.target.value)}
                placeholder="Enter father's company/employer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_income">Monthly Income</Label>
              <Input 
                id="father_income"
                type="number"
                value={formData.family_background.father_income || ''}
                onChange={(e) => handleFamilyChange('father_income', e.target.value)}
                placeholder="Enter father's monthly income"
              />
            </div>
          </div>
        </div>

        {/* Mother's Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Mother's Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="mother_fname">First Name</Label>
              <Input 
                id="mother_fname"
                value={formData.family_background.mother_fname || ''}
                onChange={(e) => handleFamilyChange('mother_fname', e.target.value)}
                placeholder="Enter mother's first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_mname">Middle Name</Label>
              <Input 
                id="mother_mname"
                value={formData.family_background.mother_mname || ''}
                onChange={(e) => handleFamilyChange('mother_mname', e.target.value)}
                placeholder="Enter mother's middle name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_lname">Last Name</Label>
              <Input 
                id="mother_lname"
                value={formData.family_background.mother_lname || ''}
                onChange={(e) => handleFamilyChange('mother_lname', e.target.value)}
                placeholder="Enter mother's last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_contact_number">Contact Number</Label>
              <Input 
                id="mother_contact_number"
                value={formData.family_background.mother_contact_number || ''}
                onChange={(e) => handleFamilyChange('mother_contact_number', e.target.value)}
                placeholder="Enter mother's contact number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_email">Email Address</Label>
              <Input 
                id="mother_email"
                type="email"
                value={formData.family_background.mother_email || ''}
                onChange={(e) => handleFamilyChange('mother_email', e.target.value)}
                placeholder="Enter mother's email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_occupation">Occupation</Label>
              <Input 
                id="mother_occupation"
                value={formData.family_background.mother_occupation || ''}
                onChange={(e) => handleFamilyChange('mother_occupation', e.target.value)}
                placeholder="Enter mother's occupation"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_company">Company/Employer</Label>
              <Input 
                id="mother_company"
                value={formData.family_background.mother_company || ''}
                onChange={(e) => handleFamilyChange('mother_company', e.target.value)}
                placeholder="Enter mother's company/employer"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_income">Monthly Income</Label>
              <Input 
                id="mother_income"
                value={formData.family_background.mother_income || ''}
                onChange={(e) => handleFamilyChange('mother_income', e.target.value)}
                placeholder="Enter mother's monthly income"
              />
            </div>
          </div>
        </div>

        {/* Guardian's Information */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Guardian's Information (If different from parents)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="guardian_fname">First Name</Label>
              <Input 
                id="guardian_fname"
                value={formData.family_background.guardian_fname || ''}
                onChange={(e) => handleFamilyChange('guardian_fname', e.target.value)}
                placeholder="Enter guardian's first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_mname">Middle Name</Label>
              <Input 
                id="guardian_mname"
                value={formData.family_background.guardian_mname || ''}
                onChange={(e) => handleFamilyChange('guardian_mname', e.target.value)}
                placeholder="Enter guardian's middle name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_lname">Last Name</Label>
              <Input 
                id="guardian_lname"
                value={formData.family_background.guardian_lname || ''}
                onChange={(e) => handleFamilyChange('guardian_lname', e.target.value)}
                placeholder="Enter guardian's last name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_relation">Relationship to Student</Label>
              <Input 
                id="guardian_relation"
                value={formData.family_background.guardian_relation || ''}
                onChange={(e) => handleFamilyChange('guardian_relation', e.target.value)}
                placeholder="Enter relationship to student"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_contact_number">Contact Number</Label>
              <Input 
                id="guardian_contact_number"
                value={formData.family_background.guardian_contact_number || ''}
                onChange={(e) => handleFamilyChange('guardian_contact_number', e.target.value)}
                placeholder="Enter guardian's contact number"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_email">Email Address</Label>
              <Input 
                id="guardian_email"
                type="email"
                value={formData.family_background.guardian_email || ''}
                onChange={(e) => handleFamilyChange('guardian_email', e.target.value)}
                placeholder="Enter guardian's email"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const AcademicBackgroundForm: React.FC<{
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}> = ({ formData, setFormData }) => {

  const profileData = useStudentProfileStore(state => state.profileData);
  useEffect(() => {
    if (profileData.profile.student_info.is_transferee) {
      setFormData(prev => ({
        ...prev,
        academic_background: {
          ...prev.academic_background,
          application_type: "Transferee", // Automatically set as Transferee
          campus: profileData.profile.student_info.campus,
        }
      }));
    } else {
      // Optional: Reset the application type if not a transferee
      setFormData(prev => ({
        ...prev,
        academic_background: {
          ...prev.academic_background,
          campus: profileData.profile.student_info.campus,
          program: profileData.profile.student_info.program,
          year_level: profileData.profile.student_info.year_level,
        }
      }));
    }
  }, [profileData, setFormData]);
  


  const handleAcademicChange = (field: keyof AcademicBackground, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      academic_background: { ...prev.academic_background, [field]: value }
    }));
  };

  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => currentYear + i);

  return (
    <Card className="border-0 shadow-none">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <GraduationCap className="h-5 w-5" />
          Academic Information
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="program">Program*</Label>
            <Select 
              value={formData.academic_background.program.toString()}
              onValueChange={(value) => handleAcademicChange('program', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select program" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">BS Computer Science</SelectItem>
                <SelectItem value="2">BS Information Technology</SelectItem>
                <SelectItem value="3">BS Information Systems</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="major_in">Major/Specialization</Label>
            <Input 
              id="major_in"
              value={formData.academic_background.major_in || ''}
              onChange={(e) => handleAcademicChange('major_in', e.target.value)}
              placeholder="Enter major/specialization"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="application_type">Application Type*</Label>
            <Select
              value={formData.academic_background.application_type || ''}
              onValueChange={(value) => handleAcademicChange('application_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select application type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="New Student">New Student</SelectItem>
                <SelectItem value="Old Studend">Old Student</SelectItem>
                <SelectItem value="Transferee">Transferee</SelectItem>
                <SelectItem value="Cross-Enrollee">Cross-Enrollee</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="student_type">Student Type*</Label>
            <Select 
              value={formData.academic_background.student_type}
              onValueChange={(value) => handleAcademicChange('student_type', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select student type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Graduate">Graduate</SelectItem>
                <SelectItem value="Undergraduate">Undergraduate</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="semester_entry">Entry Semester*</Label>
            <Select 
              value={formData.academic_background.semester_entry.toString()}
              onValueChange={(value) => handleAcademicChange('semester_entry', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entry semester" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">First Semester</SelectItem>
                <SelectItem value="2">Second Semester</SelectItem>
                <SelectItem value="3">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_level">Year Level*</Label>
            <Select 
              value={formData.academic_background.year_level}
              onValueChange={(value) => handleAcademicChange('year_level', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select year level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1st year">First Year</SelectItem>
                <SelectItem value="2nd year">Second Year</SelectItem>
                <SelectItem value="3rd year">Third Year</SelectItem>
                <SelectItem value="4th year">Fourth Year</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_entry">Entry Year*</Label>
            <Select 
              value={formData.academic_background.year_entry.toString()}
              onValueChange={(value) => handleAcademicChange('year_entry', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select entry year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="year_graduate">Expected Graduation Year*</Label>
            <Select 
              value={formData.academic_background.year_graduate.toString()}
              onValueChange={(value) => handleAcademicChange('year_graduate', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select graduation year" />
              </SelectTrigger>
              <SelectContent>
                {yearOptions.map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AcademicHistoryForm: React.FC<{
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
}> = ({ formData, setFormData }) => {
  const handleHistoryChange = (field: keyof AcademicHistory, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      academic_history: { ...prev.academic_history, [field]: value }
    }));
  };

  return (
    <Card className="border-0 shadow-none mt-6">
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <School className="h-5 w-5" />
          Educational Background
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {/* Elementary Education */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Elementary Education</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="elementary_school">School Name*</Label>
              <Input 
                id="elementary_school"
                value={formData.academic_history.elementary_school}
                onChange={(e) => handleHistoryChange('elementary_school', e.target.value)}
                placeholder="Enter elementary school name"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="elementary_address">School Address*</Label>
              <Input 
                id="elementary_address"
                value={formData.academic_history.elementary_address}
                onChange={(e) => handleHistoryChange('elementary_address', e.target.value)}
                placeholder="Enter school address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementary_graduate">Year Graduated</Label>
              <Input 
                id="elementary_graduate"
                type="number"
                value={formData.academic_history.elementary_graduate || ''}
                onChange={(e) => handleHistoryChange('elementary_graduate', parseInt(e.target.value))}
                placeholder="Enter graduation year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementary_honors">Honors/Awards</Label>
              <Input 
                id="elementary_honors"
                value={formData.academic_history.elementary_honors || ''}
                onChange={(e) => handleHistoryChange('elementary_honors', e.target.value)}
                placeholder="Enter honors/awards received"
              />
            </div>
          </div>
        </div>

        {/* Junior High School */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Junior High School</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="junior_highschool">School Name*</Label>
              <Input 
                id="junior_highschool"
                value={formData.academic_history.junior_highschool}
                onChange={(e) => handleHistoryChange('junior_highschool', e.target.value)}
                placeholder="Enter junior high school name"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="junior_address">School Address*</Label>
              <Input 
                id="junior_address"
                value={formData.academic_history.junior_address}
                onChange={(e) => handleHistoryChange('junior_address', e.target.value)}
                placeholder="Enter school address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="junior_graduate">Year Graduated</Label>
              <Input 
                id="junior_graduate"
                type="number"
                value={formData.academic_history.junior_graduate || ''}
                onChange={(e) => handleHistoryChange('junior_graduate', parseInt(e.target.value))}
                placeholder="Enter graduation year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="junior_honors">Honors/Awards</Label>
              <Input 
                id="junior_honors"
                value={formData.academic_history.junior_honors || ''}
                onChange={(e) => handleHistoryChange('junior_honors', e.target.value)}
                placeholder="Enter honors/awards received"
              />
            </div>
          </div>
        </div>

        {/* Senior High School */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Senior High School</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="senior_highschool">School Name*</Label>
              <Input 
                id="senior_highschool"
                value={formData.academic_history.senior_highschool}
                onChange={(e) => handleHistoryChange('senior_highschool', e.target.value)}
                placeholder="Enter senior high school name"
                required
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="senior_address">School Address*</Label>
              <Input 
                id="senior_address"
                value={formData.academic_history.senior_address}
                onChange={(e) => handleHistoryChange('senior_address', e.target.value)}
                placeholder="Enter school address"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senior_graduate">Year Graduated</Label>
              <Input 
                id="senior_graduate"
                type="number"
                value={formData.academic_history.senior_graduate || ''}
                onChange={(e) => handleHistoryChange('senior_graduate', parseInt(e.target.value))}
                placeholder="Enter graduation year"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="senior_honors">Honors/Awards</Label>
              <Input 
                id="senior_honors"
                value={formData.academic_history.senior_honors || ''}
                onChange={(e) => handleHistoryChange('senior_honors', e.target.value)}
                placeholder="Enter honors/awards received"
              />
            </div>
          </div>
        </div>

        {/* Previous College (if any) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previous College (If transferee)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="latest_college">School Name</Label>
              <Input 
                id="latest_college"
                value={formData.academic_history.latest_college || ''}
                onChange={(e) => handleHistoryChange('latest_college', e.target.value)}
                placeholder="Enter college name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="college_address">School Address</Label>
              <Input 
                id="college_address"
                value={formData.academic_history.college_address || ''}
                onChange={(e) => handleHistoryChange('college_address', e.target.value)}
                placeholder="Enter college address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input 
                id="program"
                value={formData.academic_history.program || ''}
                onChange={(e) => handleHistoryChange('program', e.target.value)}
                placeholder="Enter program taken"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college_honors">Honors/Awards</Label>
              <Input 
                id="college_honors"
                value={formData.academic_history.college_honors || ''}
                onChange={(e) => handleHistoryChange('college_honors', e.target.value)}
                placeholder="Enter honors/awards received"
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const StudentRegistrationForm: React.FC = () => {
  const [formData, setFormData] = useState<StudentFormData>(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/full-student-data/', formData);
      
      toast({
        title: "Success!",
        description: "Your registration has been submitted successfully.",
        variant: "default",
      });
      
      // Only clear form data on successful submission
      setFormData(initialFormState);
      
    } catch (error) {
      toast({
        title: "Error",
        description: "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
      // On error, form data remains intact
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto px-4">
      <Card className="max-w-5xl mx-auto">

        <CardContent>
          <Tabs defaultValue="personal" className="space-y-4">
            <ScrollArea className="w-full">
              <TabsList className="w-full justify-start">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="contact">Contact Info</TabsTrigger>
                <TabsTrigger value="family">Family Background</TabsTrigger>
                <TabsTrigger value="academic">Academic Info</TabsTrigger>
              </TabsList>
            </ScrollArea>

            <TabsContent value="personal">
              <PersonalInfoForm formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="contact">
              <ContactInfoForm formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="family">
              <FamilyBackgroundForm formData={formData} setFormData={setFormData} />
            </TabsContent>

            <TabsContent value="academic">
              <AcademicBackgroundForm formData={formData} setFormData={setFormData} />
              <AcademicHistoryForm formData={formData} setFormData={setFormData} />
            </TabsContent>

            <div className="flex justify-end gap-4 pt-6">
              <Button variant="outline" disabled={isSubmitting}>Save as Draft</Button>
              <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting}
                className="min-w-[100px]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    <span>Submitting...</span>
                  </div>
                ) : (
                  "Submit Application"
                )}
              </Button>
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};

export default StudentRegistrationForm;