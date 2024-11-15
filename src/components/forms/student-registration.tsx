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
import { UserCircle, Home, Users, GraduationCap, School, AlertCircle, Check, Loader } from "lucide-react";
import { useStudentProfileStore } from '@/lib/profile-store';
import { useToast } from '@/hooks/use-toast'
import { debounce } from 'lodash';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { z } from "zod";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";
import { RequiredFormField } from './required-input';
import useDebounce from '@/hooks/use-debounce';
import { NumberInput } from './number-input';

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
  province_contact_number?: string | null |undefined;
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

// Constants for reusable validation patterns
const PHONE_REGEX = /^(\+\d{1,3}[- ]?)?\d{10,}$/;
const NAME_REGEX = /^[a-zA-Z\s'-]+$/;
const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

// Enum types to match Django choices
const STATUS_CHOICES = [
  'officially enrolled',
  'pending',
  'verified',
  'rejected',
  'initially enrolled',
] as const;

// Base schemas for reusable validation
const nameSchema = z.string()
  .min(1, "Name is required")
  .max(100, "Name must not exceed 100 characters")
  .regex(NAME_REGEX, "Name can only contain letters, spaces, hyphens and apostrophes");

const emailSchema = z.string()
  .email("Invalid email address")
  .regex(EMAIL_REGEX, "Invalid email format");

const phoneSchema = z.string()
  .min(1, "Contact number is required")
  .max(30, "Contact number must not exceed 30 characters")
  .regex(PHONE_REGEX, "Invalid phone number format");

const optionalPhoneSchema = z.union([
    z.string().length(0),  // Allow empty string
    phoneSchema  // Or valid phone number
  ]).optional();
// Main validation schemas matching Django models
const personalDataSchema = z.object({
  basicdata_applicant_id: z.number(),
  f_name: nameSchema,
  m_name: z.string()
  .max(100, "Name must not exceed 100 characters")
  .optional()
  .nullable(),
  suffix: z.string().max(100).optional(),
  l_name: nameSchema,
  sex: z.string().min(1, "Sex field is required"),
  birth_date: z.string().min(1, "Birth date is required"),
  birth_place: z.string().min(1, "Birth place is required"),
  marital_status: z.string().min(1, "Marital status is required").max(7),
  religion: z.string().min(1, "Religion is required").max(70),
  country: z.string().min(1, "Country is required").max(50),
  email: emailSchema,
  acr: z.string().max(100).optional(),
  status: z.enum(STATUS_CHOICES).default('pending'),
  on_site: z.boolean().default(false)
});

const addPersonalDataSchema = z.object({
  city_address: z.string().min(1, "City address is required"),
  province_address: z.string().optional(),
  contact_number: phoneSchema,
  city_contact_number: optionalPhoneSchema,
  province_contact_number: optionalPhoneSchema,
  citizenship: z.string().min(1, "Citizenship is required").max(70)
});

const familyBackgroundSchema = z.object({
  father_fname: nameSchema.optional(),
  father_mname: nameSchema.optional(),
  father_lname: nameSchema.optional(),
  father_contact_number: phoneSchema.optional(),
  father_email: emailSchema.optional(),
  father_occupation: z.string().optional(),
  father_income: z.number().min(0).optional(),
  father_company: z.string().optional(),
  mother_fname: nameSchema.optional(),
  mother_mname: nameSchema.optional(),
  mother_lname: nameSchema.optional(),
  mother_contact_number: phoneSchema.optional(),
  mother_email: emailSchema.optional(),
  mother_occupation: z.string().optional(),
  mother_income: z.string().optional(),
  mother_company: z.string().optional(),
  guardian_fname: nameSchema.optional(),
  guardian_mname: nameSchema.optional(),
  guardian_lname: nameSchema.optional(),
  guardian_relation: z.string().max(100).optional(),
  guardian_contact_number: phoneSchema.optional(),
  guardian_email: emailSchema.optional()
});

const academicBackgroundSchema = z.object({
  program: z.number().min(1, "Program is required"),
  major_in: z.string().optional(),
  student_type: z.string().min(1, "Student type is required").max(30),
  semester_entry: z.number().min(1, "Semester entry is required"),
  year_level: z.string().min(1, "Year level is required").max(50),
  year_entry: z.number().min(1900).max(2100),
  year_graduate: z.number().min(1900).max(2100),
  application_type: z.string().min(1, "Application type is required").max(15)
});

const academicHistorySchema = z.object({
  elementary_school: z.string().min(1, "Elementary school is required"),
  elementary_address: z.string().min(1, "Elementary school address is required"),
  elementary_honors: z.string().optional(),
  elementary_graduate: z.number().min(0).optional(),
  junior_highschool: z.string().min(1, "Junior high school is required"),
  junior_address: z.string().min(1, "Junior high school address is required"),
  junior_honors: z.string().optional(),
  junior_graduate: z.number().min(0).optional(),
  senior_highschool: z.string().min(1, "Senior high school is required"),
  senior_address: z.string().min(1, "Senior high school address is required"),
  senior_honors: z.string().optional(),
  senior_graduate: z.number().min(0).optional(),
  ncae_grade: z.string().optional(),
  ncae_year_taken: z.number().min(0).optional(),
  latest_college: z.string().optional(),
  college_address: z.string().optional(),
  college_honors: z.string().optional(),
  program: z.string().optional()
});

// Combined schema for the entire form
const studentFormSchema = z.object({
  personal_data: personalDataSchema,
  add_personal_data: addPersonalDataSchema,
  family_background: familyBackgroundSchema,
  academic_background: academicBackgroundSchema,
  academic_history: academicHistorySchema
});

// TypeScript types generated from schemas
type PersonalDataFormValues = z.infer<typeof personalDataSchema>;
type AddPersonalDataFormValues = z.infer<typeof addPersonalDataSchema>;
type FamilyBackgroundFormValues = z.infer<typeof familyBackgroundSchema>;
type AcademicBackgroundFormValues = z.infer<typeof academicBackgroundSchema>;
type AcademicHistoryFormValues = z.infer<typeof academicHistorySchema>;
interface InfoFormProps {
  formData: StudentFormData;
  setFormData: React.Dispatch<React.SetStateAction<StudentFormData>>;
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
    elementary_school: "",
    elementary_address: "",
    junior_highschool: "",
    junior_address: "",
    senior_highschool: "",
    senior_address: "",
  }
};


interface UseAcademicDataProps {
  campusId?: number | null;
}


const useAcademicData = ({ campusId }: UseAcademicDataProps) => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchAcademicData = async (campus: number) => {

    setIsLoading(true);
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
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (campusId) {
      fetchAcademicData(campusId);
    } else {
      setIsLoading(false);
    }
  }, [campusId]);

  return { programs, semesters, isLoading };
};


const PersonalInfoForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {
  const profileData = useStudentProfileStore(state => state.profileData);
  const { register, formState: { errors }, control } = useFormContext<StudentFormData>();

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personal_data: {
        ...prev.personal_data,
        [name]: value
      }
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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Required Fields */}
          <RequiredFormField
            type="input"
            name="personal_data.f_name"
            label="First Name"
            placeholder="Enter first name"
            defaultValue={formData.personal_data.f_name}
            onChange={handleFieldChange}
          />

          <div className="space-y-2">
            <Label htmlFor="m_name">Middle Name (Optional)</Label>
            <Input 
              id="m_name"
              {...register("personal_data.m_name", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.m_name}
              placeholder="Enter middle name"
            />
          </div>

          <RequiredFormField
            type="input"
            name="personal_data.l_name"
            label="Last Name"
            placeholder="Enter last name"
            defaultValue={formData.personal_data.l_name}
            onChange={handleFieldChange}
          />

          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix (Optional)</Label>
            <Input 
              id="suffix"
              {...register("personal_data.suffix", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.suffix}
              placeholder="Enter suffix"
            />
          </div>

          <div className="space-y-2">
            <RequiredFormField
              type="select"
              name="personal_data.sex"
              label="Sex"
              control={control}
              options={[
                { value: 'Male', label: 'Male' },
                { value: 'Female', label: 'Female' }
              ]}
              defaultValue={formData.personal_data.sex}
            />
          </div>

          <RequiredFormField
            type="date"
            name="personal_data.birth_date"
            label="Birth Date"
            defaultValue={formData.personal_data.birth_date}
            onChange={handleFieldChange}
          />

          <RequiredFormField
            type="input"
            name="personal_data.birth_place"
            label="Birth Place"
            placeholder="Enter birth place"
            defaultValue={formData.personal_data.birth_place}
            onChange={handleFieldChange}
          />

          <RequiredFormField
            type="select"
            name="personal_data.marital_status"
            label="Marital Status"
            control={control}
            options={[
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' },
              { value: 'Divorced', label: 'Divorced' },
              { value: 'Widowed', label: 'Widowed' }
            ]}
            defaultValue={formData.personal_data.marital_status}
          />

          <RequiredFormField
            type="input"
            name="personal_data.religion"
            label="Religion"
            placeholder="Enter religion"
            defaultValue={formData.personal_data.religion}
            onChange={handleFieldChange}
          />

          <RequiredFormField
            type="input"
            name="personal_data.country"
            label="Country"
            placeholder="Enter country"
            defaultValue={formData.personal_data.country}
            onChange={handleFieldChange}
          />

          <div className="space-y-2">
            <Label htmlFor="email">Email (Read Only)</Label>
            <Input 
              id="email"
              type="email"
              readOnly
              defaultValue={formData.personal_data.email}
              className="bg-gray-50"
              placeholder="Email is empty"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const ContactInfoForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {
  const { register, formState: { errors }, control } = useFormContext<StudentFormData>();

  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      add_personal_data: {
        ...prev.add_personal_data,
        [name]: value
      }
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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Current Address - Full Width */}
          <div className="md:col-span-2">
            <RequiredFormField
              type="textarea"
              name="add_personal_data.city_address"
              label="Current Address"
              placeholder="Enter current address"
              defaultValue={formData.add_personal_data.city_address}
              onChange={handleFieldChange}
            />
          </div>

          {/* Provincial Address - Full Width */}
          <div className="md:col-span-2">
            <div className="space-y-2">
              <Label htmlFor="province_address">Provincial Address (Optional)</Label>
              <Textarea
                id="province_address"
                {...register("add_personal_data.province_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.add_personal_data.province_address}
                placeholder="Enter provincial address"
              />
            </div>
          </div>

          {/* Primary Contact Number */}
          <RequiredFormField
            type="input"
            name="add_personal_data.contact_number"
            label="Primary Contact Number"
            placeholder="Enter primary contact number"
            defaultValue={formData.add_personal_data.contact_number}
            onChange={handleFieldChange}
          />

          {/* Alternative Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="city_contact_number">Alternative Contact Number (Optional)</Label>
            <Input
              id="city_contact_number"
              {...register("add_personal_data.city_contact_number", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.city_contact_number}
              placeholder="Enter alternative contact number"
            />
          </div>

          {/* Provincial Contact Number */}
          <div className="space-y-2">
            <Label htmlFor="province_contact_number">Provincial Contact Number (Optional)</Label>
            <Input
              id="province_contact_number"
              {...register("add_personal_data.province_contact_number", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.province_contact_number?.toString()}
              placeholder="Enter provincial contact number"
            />
          </div>

          {/* Citizenship */}
          <RequiredFormField
            type="input"
            name="add_personal_data.citizenship"
            label="Citizenship"
            placeholder="Enter citizenship"
            defaultValue={formData.add_personal_data.citizenship}
            onChange={handleFieldChange}
          />
        </div>
      </CardContent>
    </Card>
  );
};


const FamilyBackgroundForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {

  const {
    register,
    formState: { errors },
  } = useForm<FamilyBackgroundFormValues>({
    resolver: zodResolver(familyBackgroundSchema),
    defaultValues: formData.family_background,  
    mode: "onChange"
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      family_background: {
        ...prev.family_background,
        [name]: value
      }
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
                {...register("father_fname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_fname}
                className={errors.father_fname ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {errors.father_fname && (
                <span className="text-sm text-red-500">{errors.father_fname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_mname">Middle Name</Label>
              <Input
                id="father_mname"
                {...register("father_mname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_mname}
                className={errors.father_mname ? "border-red-500" : ""}
                placeholder="Enter middle name"
              />
              {errors.father_mname && (
                <span className="text-sm text-red-500">{errors.father_mname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_lname">Last Name</Label>
              <Input
                id="father_lname"
                {...register("father_lname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_lname}
                className={errors.father_lname ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {errors.father_lname && (
                <span className="text-sm text-red-500">{errors.father_lname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_contact_number">Contact Number</Label>
              <Input
                id="father_contact_number"
                {...register("father_contact_number", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_contact_number}
                className={errors.father_contact_number ? "border-red-500" : ""}
                placeholder="Enter contact number"
              />
              {errors.father_contact_number && (
                <span className="text-sm text-red-500">{errors.father_contact_number.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_email">Email Address</Label>
              <Input
                id="father_email"
                type='email'
                {...register("father_email", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_email}
                className={errors.father_email ? "border-red-500" : ""}
                placeholder="Enter email address(not required)"
              />
              {errors.father_email && (
                <span className="text-sm text-red-500">{errors.father_email.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_occupation">Occupation</Label>
              <Input
                id="father_occupation"
                {...register("father_occupation", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_occupation}
                className={errors.father_occupation ? "border-red-500" : ""}
                placeholder="Enter occupation"
              />
              {errors.father_occupation && (
                <span className="text-sm text-red-500">{errors.father_occupation.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_company">Company/Employer</Label>
              <Input
                id="father_company"
                {...register("father_company", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.father_company}
                className={errors.father_company ? "border-red-500" : ""}
                placeholder="Enter company/employer"
              />
              {errors.father_company && (
                <span className="text-sm text-red-500">{errors.father_company.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="father_income">Monthly Income</Label>
              <Input
                id="father_income"
                type='number'
                {...register("father_income", {
                  onChange: handleFieldChange,
                  valueAsNumber: true 
                })}
                defaultValue={formData.family_background.father_income}
                className={errors.father_income ? "border-red-500" : ""}
                placeholder="Enter monthly income"
              />
              {errors.father_income && (
                <span className="text-sm text-red-500">{errors.father_income.message}</span>
              )} 
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
                {...register("mother_fname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_fname}
                className={errors.mother_fname ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {errors.mother_fname && (
                <span className="text-sm text-red-500">{errors.mother_fname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_mname">Middle Name</Label>
              <Input
                id="mother_mname"
                {...register("mother_mname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_mname}
                className={errors.mother_mname ? "border-red-500" : ""}
                placeholder="Enter middle name"
              />
              {errors.mother_mname && (
                <span className="text-sm text-red-500">{errors.mother_mname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_lname">Last Name</Label>
              <Input
                id="mother_lname"
                {...register("mother_lname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_lname}
                className={errors.mother_lname ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {errors.mother_lname && (
                <span className="text-sm text-red-500">{errors.mother_lname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_contact_number">Contact Number</Label>
              <Input
                id="mother_contact_number"
                {...register("mother_contact_number", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_contact_number}
                className={errors.mother_contact_number ? "border-red-500" : ""}
                placeholder="Enter contact number"
              />
              {errors.mother_contact_number && (
                <span className="text-sm text-red-500">{errors.mother_contact_number.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_email">Email Address</Label>
              <Input
                id="mother_email"
                type='email'
                {...register("mother_email", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_email}
                className={errors.mother_email ? "border-red-500" : ""}
                placeholder="Enter email address(not required)"
              />
              {errors.mother_email && (
                <span className="text-sm text-red-500">{errors.mother_email.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_occupation">Occupation</Label>
              <Input
                id="mother_occupation"
                {...register("mother_occupation", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_occupation}
                className={errors.mother_occupation ? "border-red-500" : ""}
                placeholder="Enter occupation"
              />
              {errors.mother_occupation && (
                <span className="text-sm text-red-500">{errors.mother_occupation.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_company">Company/Employer</Label>
              <Input
                id="mother_company"
                {...register("mother_company", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.mother_company}
                className={errors.mother_company ? "border-red-500" : ""}
                placeholder="Enter company/employer"
              />
              {errors.mother_company && (
                <span className="text-sm text-red-500">{errors.mother_company.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="mother_income">Monthly Income</Label>
              <Input
                id="mother_income"
                type='number'
                {...register("mother_income", {
                  onChange: handleFieldChange,
                  valueAsNumber: true 
                })}
                defaultValue={formData.family_background.mother_income}
                className={errors.mother_income ? "border-red-500" : ""}
                placeholder="Enter monthly income"
              />
              {errors.mother_income && (
                <span className="text-sm text-red-500">{errors.mother_income.message}</span>
              )} 
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
                {...register("guardian_fname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_fname}
                className={errors.guardian_fname ? "border-red-500" : ""}
                placeholder="Enter first name"
              />
              {errors.guardian_fname && (
                <span className="text-sm text-red-500">{errors.guardian_fname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_mname">Middle Name</Label>
              <Input
                id="guardian_mname"
                {...register("guardian_mname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_mname}
                className={errors.guardian_mname ? "border-red-500" : ""}
                placeholder="Enter nmiddle name"
              />
              {errors.guardian_mname && (
                <span className="text-sm text-red-500">{errors.guardian_mname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_lname">Last Name</Label>
              <Input
                id="guardian_lname"
                {...register("guardian_lname", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_lname}
                className={errors.guardian_lname ? "border-red-500" : ""}
                placeholder="Enter last name"
              />
              {errors.guardian_lname && (
                <span className="text-sm text-red-500">{errors.guardian_lname.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_relation">Relationship to Student</Label>
              <Input
                id="guardian_relation"
                {...register("guardian_relation", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_relation}
                className={errors.guardian_relation ? "border-red-500" : ""}
                placeholder="Enter your relation"
              />
              {errors.guardian_relation && (
                <span className="text-sm text-red-500">{errors.guardian_relation.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_contact_number">Contact Number</Label>
              <Input
                id="guardian_contact_number"
                {...register("guardian_contact_number", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_contact_number}
                className={errors.guardian_contact_number ? "border-red-500" : ""}
                placeholder="Enter contact number"
              />
              {errors.guardian_contact_number && (
                <span className="text-sm text-red-500">{errors.guardian_contact_number.message}</span>
              )} 
            </div>
            <div className="space-y-2">
              <Label htmlFor="guardian_email">Email Address</Label>
              <Input
                id="guardian_email"
                {...register("guardian_email", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.family_background.guardian_email}
                className={errors.guardian_email ? "border-red-500" : ""}
                placeholder="Enter email(not required)"
              />
              {errors.guardian_email && (
                <span className="text-sm text-red-500">{errors.guardian_email.message}</span>
              )} 
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};


const AcademicBackgroundForm: React.FC<InfoFormProps & {
  programs: Program[];
  semesters: Semester[];
  isLoading: boolean;
}> = ({ 
  formData, 
  setFormData, 
  programs, 
  semesters, 
  isLoading 
}) => {
  const { register, formState: { errors }, control } = useFormContext<StudentFormData>();

  const handleFieldChange = React.useCallback(
    debounce(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
          ...prev,
          academic_background: {
            ...prev.academic_background,
            [name.replace('academic_background.', '')]: value,
          },
        }));
      },
      200 // Debounce delay in milliseconds
    ),
    []
  );

  useEffect(() => {
    console.log("formdata is changed")
    }, [formData]);
  // Loading state
  if (isLoading) {
    return (
      <Card className="border-0 shadow-none">
        <CardContent className="space-y-6">
          <div className="flex items-center justify-center p-8">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        </CardContent>
      </Card>
    );
  }


  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 10 }, (_, i) => ({
    value: (currentYear + i).toString(),
    label: (currentYear + i).toString()
  }));

  const applicationTypeOptions = [
    { value: "New Student", label: "New Student" },
    { value: "Old Student", label: "Old Student" },
    { value: "Transferee", label: "Transferee" },
    { value: "Cross-Enrollee", label: "Cross-Enrollee" }
  ];

  const studentTypeOptions = [
    { value: "Graduate", label: "Graduate" },
    { value: "Undergraduate", label: "Undergraduate" }
  ];

  const yearLevelOptions = [
    { value: "First Year", label: "First Year" },
    { value: "Second Year", label: "Second Year" },
    { value: "Third Year", label: "Third Year" },
    { value: "Fourth Year", label: "Fourth Year" }
  ];



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

          {/* Program */}
          <Controller
            name="academic_background.program"
            control={control}
            defaultValue={formData.academic_background.program}
            render={({ field }) => (
              <div className="space-y-2">
                <div className="flex items-center gap-1">
                  <Label className="text-sm font-medium">Program</Label>
                  <TooltipProvider>
                    <Tooltip delayDuration={300}>
                      <TooltipTrigger asChild>
                        <div className="inline-flex">
                          <AlertCircle 
                            className={`h-4 w-4 cursor-help ${
                              field.value ? "text-green-500" : "text-red-500"
                            }`}
                            aria-label="This field is required"
                          />
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="text-sm">This field is required</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <Select
                  value={field.value?.toString()}
                  onValueChange={(value) => {
                    const numValue = parseInt(value);
                    field.onChange(numValue);
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        program: numValue
                      }
                    }));
                  }}
                >
                  <SelectTrigger className={errors.academic_background?.program ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select program" />
                  </SelectTrigger>
                  <SelectContent>
                    {programs
                      .filter(program => program.is_active)
                      .map(program => (
                        <SelectItem key={program.id} value={program.id.toString()}>
                          {`${program.code} - ${program.description}`}
                        </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.academic_background?.program && (
                  <span className="text-sm text-red-500">
                    {errors.academic_background.program.message}
                  </span>
                )}
              </div>
            )}
          />          

          {/* Major/Specialization */}  
          <div className="space-y-2">
            <Label className="text-sm font-medium">Major/Specialization</Label>
            <Input
              id="major_in"
              {...register("academic_background.major_in", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.academic_background.major_in}
              placeholder="Enter major/specialization"
            />
          </div>

          {/* Application Type */}
          <RequiredFormField
            type="select"
            name="academic_background.application_type"
            label="Application Type"
            control={control}
            options={applicationTypeOptions}
            defaultValue={formData.academic_background.application_type}
          />

          {/* Student Type */}
          <RequiredFormField
            type="select"
            name="academic_background.student_type"
            label="Student Type"
            control={control}
            options={studentTypeOptions}
            defaultValue={formData.academic_background.student_type}
          />

          {/* Entry Semester */}
          <Controller
            name="academic_background.semester_entry"
            control={control}
            defaultValue={formData.academic_background.semester_entry}
            render={({ field }) => (
              <RequiredFormField
                type="select"
                name="academic_background.semester_entry"
                label="Entry Semester"
                control={control}
                options={semesters.map(sem => ({
                  value: sem.id.toString(),
                  label: sem.semester_name
                }))}
                defaultValue={field.value?.toString()}
                parse={parseInt}  // Simplified version
              />
            )}
          />

          {/* Year Level */}
          <RequiredFormField
            type="select"
            name="academic_background.year_level"
            label="Year Level"
            control={control}
            options={yearLevelOptions}
            defaultValue={formData.academic_background.year_level}
          />

          {/* Entry Year */}
          <Controller
            name="academic_background.year_entry"
            control={control}
            defaultValue={formData.academic_background.year_entry}
            render={({ field }) => (
              <RequiredFormField
                type="select"
                name="academic_background.year_entry"
                label="Entry Year"
                control={control}
                options={yearOptions}
                defaultValue={field.value?.toString()}
              />
            )}
          />

          {/* Expected Graduation Year */}
          <Controller
            name="academic_background.year_graduate"
            control={control}
            defaultValue={formData.academic_background.year_graduate}
            render={({ field }) => (
              <RequiredFormField
                type="select"
                name="academic_background.year_graduate"
                label="Expected Graduation Year"
                control={control}
                options={yearOptions}
                defaultValue={field.value?.toString()}
              />
            )}
          />
        </div>
      </CardContent>
    </Card>
  );
};





const AcademicHistoryForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {
  const profileData = useStudentProfileStore(state => state.profileData);
  const { register, formState: { errors }, control } = useFormContext<StudentFormData>();
  const [debouncedFormData, setDebouncedFormData] = useDebounce(formData, 300);
  useEffect(() => {
    console.log("formdata is changed")
    }, [formData]);
  const handleFieldChange = React.useCallback(
    debounce(
      (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        console.log(`handlefield used`)
        setFormData((prev) => ({
          ...prev,
          academic_history: {
            ...prev.academic_history,
            [name.replace('academic_background.', '')]: value,
          },
        }));
      },
      5000 // Debounce delay in milliseconds
    ),
    []
  );

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
              <RequiredFormField
                type="input"
                name="academic_history.elementary_school"
                label="School Name"
                placeholder="Enter school name"
                defaultValue={debouncedFormData.academic_history.elementary_school}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <RequiredFormField
                type="input"
                name="academic_history.elementary_address"
                label="School Address"
                placeholder="Enter school address"
                defaultValue={formData.academic_history.elementary_address}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
            <NumberInput
              name="academic_history.elementary_graduate"
              label="Year Graduated"
              placeholder="Enter year graduated"
              defaultValue={formData.academic_history.elementary_graduate}
              onChange={handleFieldChange}
            />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementary_honors">Honors/Awards</Label>
              <Input
                id="elementary_honors"
                {...register("academic_history.elementary_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.elementary_honors}
                placeholder="Enter honors/awards"
              />
            </div>
          </div>
        </div>

        {/* Junior High School */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Junior High School</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <RequiredFormField
                type="input"
                name="academic_history.junior_highschool"
                label="School Name"
                placeholder="Enter school name"
                defaultValue={formData.academic_history.junior_highschool}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <RequiredFormField
                type="input"
                name="academic_history.junior_address"
                label="School Address"
                placeholder="Enter school address"
                defaultValue={formData.academic_history.junior_address}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
            <NumberInput
              name="academic_history.junior_graduate"
              label="Year Graduated"
              placeholder="Enter year graduated"
              defaultValue={formData.academic_history.elementary_graduate}
              onChange={handleFieldChange}
            />

            </div>
            <div className="space-y-2">
              <Label htmlFor="junior_honors">Honors/Awards</Label>
              <Input
                id="junior_honors"
                {...register("academic_history.junior_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.junior_honors}
                placeholder="Enter honors/awards"
              />
            </div>
          </div>
        </div>
{/*FIX ACADEMIC BACKGROUND UI*/}
        {/* Senior High School */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Senior High School</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <RequiredFormField
                type="input"
                name="academic_history.senior_highschool"
                label="School Name"
                placeholder="Enter school name"
                defaultValue={formData.academic_history.senior_highschool}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <RequiredFormField
                type="input"
                name="academic_history.senior_address"
                label="School Address"
                placeholder="Enter school address"
                defaultValue={formData.academic_history.senior_address}
                onChange={handleFieldChange}
              />
            </div>
            <div className="space-y-2">
            <NumberInput
              name="academic_history.senior_graduate"
              label="Year Graduated"
              placeholder="Enter year graduated"
              defaultValue={formData.academic_history.senior_graduate}
              onChange={handleFieldChange}
            />

            </div>
            <div className="space-y-2">
              <Label htmlFor="senior_honors">Honors/Awards</Label>
              <Input
                id="senior_honors"
                {...register("academic_history.senior_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.senior_honors}
                placeholder="Enter honors/awards"
              />
            </div>
          </div>
        </div>

        {/* Previous College (if any) */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Previous College (For graduate students)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="latest_college">School Name</Label>
              <Input
                id="latest_college"
                {...register("academic_history.latest_college", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.latest_college}
                placeholder="Enter school name"
              />
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="college_address">School Address</Label>
              <Input
                id="college_address"
                {...register("academic_history.college_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.college_address}
                placeholder="Enter school address"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                {...register("academic_history.program", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.program}
                placeholder="Enter program"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="college_honors">Honors/Awards</Label>
              <Input
                id="college_honors"
                {...register("academic_history.college_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.college_honors}
                placeholder="Enter honors/awards"
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
  const [activeTab, setActiveTab] = useState("personal");
  const { toast } = useToast();
  const profileData = useStudentProfileStore(state => state.profileData);
  const [isLoading, setIsLoading] = useState(true);
    // Use the custom hook here
    const { programs, semesters, isLoading: isLoadingAcademicData } = useAcademicData({
      campusId: profileData?.profile?.student_info?.campus
    });

  const methods = useForm<StudentFormData>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: formData,
    mode: "onSubmit",
  });



  useEffect(() => {
    const loadProfileData = async () => {
      try{
        if (profileData?.profile?.student_info) {
          const sexValue = profileData.profile.student_info.sex?.toString() || '';
          const programValue =profileData.profile.student_info.program
          console.log('Initial sex value from profile:', sexValue);
          console.log('Current formData sex value:', formData.personal_data.sex);
    
          const studentInfo = profileData.profile.student_info;
          setFormData(prev => ({
            ...prev,
            personal_data: {
              ...prev.personal_data,
              basicdata_applicant_id: profileData.profile.student_info.basicdata_applicant_id,
              f_name: profileData.profile.student_info.first_name,
              m_name: profileData.profile.student_info.middle_name,
              l_name: profileData.profile.student_info.last_name,
              suffix: profileData.profile.student_info.suffix || '',
              sex: sexValue,
              birth_date: profileData.profile.student_info.birth_date,
              email: profileData.profile.student_info.email,
              birth_place: prev.personal_data.birth_place,
              marital_status: prev.personal_data.marital_status,
              religion: prev.personal_data.religion,
              country: prev.personal_data.country,
            },
            
            add_personal_data: {
              ...prev.add_personal_data,
              city_address: profileData.profile.student_info.address,
              contact_number: profileData.profile.student_info.contact_number,
            },    
            academic_background: {
              ...prev.academic_background,
              application_type: studentInfo.is_transferee ? "Transferee" : "",
              campus: studentInfo.campus,
              year_level: studentInfo.year_level,
              program: programValue,
            }
          }));
    
          methods.setValue('academic_background.application_type', 
            studentInfo.is_transferee ? "Transferee" : ""
          );
          methods.setValue('academic_background.program', programValue, { shouldValidate: true });
          methods.setValue('academic_background.year_level', studentInfo.year_level);
          methods.setValue('personal_data.basicdata_applicant_id', profileData.profile.student_info.basicdata_applicant_id);
          methods.setValue('personal_data.f_name', profileData.profile.student_info.first_name);
          methods.setValue('personal_data.m_name', profileData.profile.student_info.middle_name);
          methods.setValue('personal_data.l_name', profileData.profile.student_info.last_name);
          methods.setValue('personal_data.suffix', profileData.profile.student_info.suffix || '');
          methods.setValue('personal_data.sex', sexValue, { shouldValidate: true });
          methods.setValue('personal_data.birth_date', profileData.profile.student_info.birth_date);
          methods.setValue('personal_data.email', profileData.profile.student_info.email);
          methods.setValue('add_personal_data.city_address', profileData.profile.student_info.address);
          methods.setValue('add_personal_data.contact_number', profileData.profile.student_info.contact_number);

        }
    
      }catch(error){
        toast({
          title: "Error",
          description: "Failed to load profile data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    loadProfileData();
    
  }, [profileData, methods]);


  const semesterMap = React.useMemo(() => {
    return semesters.reduce((acc, semester) => {
      acc[semester.id] = semester.semester_name;
      return acc;
    }, {} as { [key: number]: string });
  }, [semesters]);
  //TODO: make the whole component restart when clicking submit thus loads
  //TODO: make the subject enlistment
  //TODO: fix year level
  //TODO: make officially enrolled say something that documents and enlistment are already verified and submitted
  //TODO: fix document upload types and whatnot
  // Create the submit handler using handleSubmit from useForm
  const onSubmit = methods.handleSubmit(async (data) => {
    const isValid = await validateAndSwitchTab();
    if (!isValid) return;
  
    setIsSubmitting(true);
    try {

      const response = await axios.post('https://djangoportal-backends.onrender.com/api/full-student-data/', data);
      
      toast({
        title: "Success!",
        description: "Your registration has been submitted successfully.",
        variant: "default",
      });
      
      methods.reset(initialFormState);
    } catch (error) {
      console.error("Submission error:", error);
      toast({
        title: "Error",
        description: "There was a problem submitting your registration. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  });

  // Create a separate function to handle validation and tab switching
  const validateAndSwitchTab = async () => {
    const errors = methods.formState.errors;
    
    if (errors.personal_data) {
      setActiveTab("personal");
    } else if (errors.add_personal_data) {
      setActiveTab("contact");
    } else if (errors.family_background) {
      setActiveTab("family");
    } else if (errors.academic_background || errors.academic_history) {
      setActiveTab("academic");
    }

    if (Object.keys(errors).length > 0) {
      toast({
        title: "Validation Error",
        description: "Please check all required fields and try again.",
        variant: "destructive",
      });
      return false;
    }
    return true;
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto">
          <CardHeader>
            <CardTitle>
              <Skeleton className="h-8 w-64" />
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Skeleton loading state */}
            <div className="space-y-6">
              <div className="flex gap-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-24" />
                ))}
              </div>
              <div className="grid gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="space-y-4">
                    <Skeleton className="h-4 w-32" />
                    <div className="grid grid-cols-2 gap-4">
                      <Skeleton className="h-10 w-full" />
                      <Skeleton className="h-10 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <FormProvider {...methods}>
      <div className="container mx-auto px-4">
        <Card className="max-w-5xl mx-auto">
          <CardContent>
          <form onSubmit={onSubmit}>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
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
                  <AcademicBackgroundForm 
                    formData={formData} 
                    setFormData={setFormData}
                    programs={programs}
                    semesters={semesters}
                    isLoading={isLoadingAcademicData}
                  />
                  <AcademicHistoryForm 
                    formData={formData} 
                    setFormData={setFormData} 
                  />
                </TabsContent>
                
                <div className="flex justify-end gap-4 pt-6">
                  <Button type="button" variant="outline">
                    Save as Draft
                  </Button>
                  <Button type="submit" className="min-w-[100px]" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <Loader size={20} className="mr-2" />
                      Submitting...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <Check className="mr-2" /> Submit Application
                    </div>
                  )}
                </Button>
                </div>
              </Tabs>
            </form>
          </CardContent>
        </Card>
      </div>
    </FormProvider>
  );
};

export default StudentRegistrationForm;