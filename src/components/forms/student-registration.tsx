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
import { useStudentProfileStore } from '@/lib/profile-store';
import { useToast } from '@/hooks/use-toast'

import { z } from "zod";
import { Controller, FormProvider, useForm, useFormContext } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Skeleton } from "@/components/ui/skeleton";

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
  m_name: nameSchema.optional(),
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
        axios.get(`http://127.0.0.1:8000/api/program/?campus_id=${campus}`),
        axios.get(`http://127.0.0.1:8000/api/semester/?campus_id=${campus}`)
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
  const { register, formState: { errors }, setValue, control } = useFormContext<StudentFormData>();



  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      personal_data: {
        ...prev.personal_data,
        [name]: value
      }
    }));
    console.log(` basicdataid: ${profileData.profile.student_info.basicdata_applicant_id}`)
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
              {...register("personal_data.f_name", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.f_name}
              className={errors.personal_data?.f_name ? "border-red-500" : ""}
              placeholder="Enter first name"
            />
            {errors.personal_data?.f_name && (
              <span className="text-sm text-red-500">{errors.personal_data?.f_name.message}</span>
            )}          
          </div>
          <div className="space-y-2">
            <Label htmlFor="m_name">Middle Name</Label>
            <Input 
              id="m_name"
              {...register("personal_data.m_name", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.m_name}
              className={errors.personal_data?.m_name ? "border-red-500" : ""}
              placeholder="Enter middle name"
            />
            {errors.personal_data?.m_name && (
              <span className="text-sm text-red-500">{errors.personal_data?.message}</span>
            )}   
          </div>
          <div className="space-y-2">
            <Label htmlFor="l_name">Last Name*</Label>
            <Input 
              id="l_name"
              {...register("personal_data.l_name", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.l_name}
              className={errors.personal_data?.l_name ? "border-red-500" : ""}
              placeholder="Enter last name"
            />
            {errors.personal_data?.l_name && (
              <span className="text-sm text-red-500">{errors.personal_data?.l_name.message}</span>
            )}   
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="suffix">Suffix</Label>
            <Input 
              id="suffix"
              {...register("personal_data.suffix", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.suffix}
              className={errors.personal_data?.suffix ? "border-red-500" : ""}
              placeholder="Enter suffix"
            />
            {errors.personal_data?.suffix && (
              <span className="text-sm text-red-500">{errors.personal_data?.suffix.message}</span>
            )}   
          </div>
          <div className="space-y-2">
            <Label htmlFor="sex">Sex*</Label>
            <Controller
              name="personal_data.sex"
              control={control}
              defaultValue={profileData.profile.student_info.sex}
              render={({ field }) => (
                <Select
                  value={field.value} // Use value instead of defaultValue
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Update formData when select value changes
                    setFormData(prev => ({
                      ...prev,
                      personal_data: {
                        ...prev.personal_data,
                        sex: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger className={errors.personal_data?.sex ? "border-red-500" : ""}>
                    <SelectValue placeholder="Select sex" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Male">Male</SelectItem>
                    <SelectItem value="Female">Female</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.personal_data?.sex && (
              <span className="text-sm text-red-500">{errors.personal_data?.sex.message}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="birth_date">Birth Date*</Label>
            <Input 
              id="birth_date"
              type="date"
              {...register("personal_data.birth_date", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.birth_date}
              className={errors.personal_data?.birth_date ? "border-red-500" : ""}
              placeholder="Input/Select birth data"
            />
            {errors.personal_data?.birth_date && (
              <span className="text-sm text-red-500">{errors.personal_data?.birth_date.message}</span>
            )}  
          </div>          
          <div className="space-y-2">
            <Label htmlFor="birth_place">Birth Place*</Label>
            <Input 
              id="birth_place"
              {...register("personal_data.birth_place", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.birth_place}
              className={errors.personal_data?.birth_place ? "border-red-500" : ""}
              placeholder="Enter birth place"
            />
            {errors.personal_data?.birth_place && (
              <span className="text-sm text-red-500">{errors.personal_data?.birth_place.message}</span>
            )}  
          </div>
          <div className="space-y-2">
            <Label htmlFor="marital_status">Marital Status*</Label>
            <Controller
              name="personal_data.marital_status"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    field.onChange(value);
                    // Update formData when select value changes
                    setFormData(prev => ({
                      ...prev,
                      personal_data: {
                        ...prev.personal_data,
                        marital_status: value
                      }
                    }));
                  }}
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
              )}
            />
            {errors.personal_data?.marital_status && (
              <span className="text-sm text-red-500">{errors.personal_data?.marital_status.message}</span>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="religion">Religion*</Label>
            <Input 
              id="religion"
              {...register("personal_data.religion", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.religion}
              className={errors.personal_data?.religion ? "border-red-500" : ""}
              placeholder="Enter Religion"
            />
            {errors.personal_data?.religion && (
              <span className="text-sm text-red-500">{errors.personal_data?.religion.message}</span>
            )}  
          </div>
          <div className="space-y-2">
            <Label htmlFor="country">Country*</Label>
            <Input 
              id="country"
              {...register("personal_data.country", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.country}
              className={errors.personal_data?.country ? "border-red-500" : ""}
              placeholder="Enter Country"
            />
            {errors.personal_data?.country && (
              <span className="text-sm text-red-500">{errors.personal_data?.country.message}</span>
            )}  
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email*</Label>
            <Input 
              id="email"
              type="email"
              readOnly
              {...register("personal_data.email", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.personal_data.email}
              placeholder="Email is empty"
            />
            {errors.personal_data?.email && (
              <span className="text-sm text-red-500">{errors.personal_data?.email.message}</span>
            )}  
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const ContactInfoForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {
  const profileData = useStudentProfileStore(state => state.profileData);
  const { register, formState: { errors }, setValue, control } = useFormContext<StudentFormData>();


  // Populate form with profile data only once on mount
  useEffect(() => {
    const updateFormData = async () => {
      await setFormData(prev => ({
        ...prev,
        add_personal_data: {
          ...prev.add_personal_data,
          city_address: profileData.profile.student_info.address,
          contact_number: profileData.profile.student_info.contact_number,
        }
      }));
      await setValue('add_personal_data.city_address', profileData.profile.student_info.address);
      await setValue('add_personal_data.contact_number', profileData.profile.student_info.contact_number);
  

    }
    updateFormData()
    // Add other fields here as needed
  }, [profileData, setValue]);

  // Handle individual field changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="city_address">Current Address*</Label>
            <Textarea
              id="city_address"
              {...register("add_personal_data.city_address", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.city_address}
              className={errors.add_personal_data?.city_address ? "border-red-500" : ""}
              placeholder="Enter Current Address"
            />
            {errors.add_personal_data?.city_address && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.city_address.message}</span>
            )} 
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="province_address">Provincial Address</Label>
            <Textarea
              id="province_address"
              {...register("add_personal_data.province_address", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.province_address}
              className={errors.add_personal_data?.province_address ? "border-red-500" : ""}
              placeholder="Enter provincial address"
            />
            {errors.add_personal_data?.province_address && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.province_address.message}</span>
            )} 
          </div>
          <div className="space-y-2">
            <Label htmlFor="contact_number">Primary Contact Number*</Label>
            <Input
              id="contact_numbe"
              {...register("add_personal_data.contact_number", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.contact_number}
              className={errors.add_personal_data?.contact_number? "border-red-500" : ""}
              placeholder="Enter primary contact number"
            />
            {errors.add_personal_data?.contact_number && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.contact_number.message}</span>
            )}           
          </div>
          <div className="space-y-2">
            <Label htmlFor="city_contact_number">Alternative Contact Number</Label>
            <Input
              id="city_contact_number"
              {...register("add_personal_data.city_contact_number", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.city_contact_number}
              className={errors.add_personal_data?.city_contact_number ? "border-red-500" : ""}
              placeholder="Enter alternative contact number"
            />
            {errors.add_personal_data?.city_contact_number && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.city_contact_number.message}</span>
            )} 
          </div>
          <div className="space-y-2">
            <Label htmlFor="province_contact_number">Provincial Contact Number</Label>
            <Input
              id="province_contact_number"
              {...register("add_personal_data.province_contact_number", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.province_contact_number?.toString()}
              className={errors.add_personal_data?.province_contact_number ? "border-red-500" : ""}
              placeholder="Enter provincial contact number"
            />
            {errors.add_personal_data?.province_contact_number && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.province_contact_number.message}</span>
            )} 
          </div>
          <div className="space-y-2">
            <Label htmlFor="citizenship">Citizenship*</Label>
            <Input
              id="citizenship"
              {...register("add_personal_data.citizenship", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.add_personal_data.citizenship}
              className={errors.add_personal_data?.citizenship ? "border-red-500" : ""}
              placeholder="Enter citizenship"
            />
            {errors.add_personal_data?.citizenship && (
              <span className="text-sm text-red-500">{errors.add_personal_data?.citizenship.message}</span>
            )} 
          </div>
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
  const { register, formState: { errors }, setValue, control } = useFormContext<StudentFormData>();


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



  // Handle field changes
  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      academic_background: {
        ...prev.academic_background,
        [name.replace('academic_background.', '')]: value
      }
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
            <Controller
              name="academic_background.program"
              control={control}
              render={({ field }) => {
                const selectedProgram = programs.find(p => p.id === field.value);
                return (
                  <div>
                    <Input
                      readOnly
                      value={selectedProgram?.description || ''}
                      placeholder="No program selected"
                      onChange={(e) => {
                        field.onChange(selectedProgram?.id);
                      }}
                    />
                    {errors.academic_background?.program && (
                      <span className="text-sm text-red-500">{errors.academic_background?.program.message}</span>
                    )}
                  </div>
                );
              }}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="major_in">Major/Specialization</Label>
            <Input
              id="major_in"
              {...register("academic_background.major_in", {
                onChange: handleFieldChange
              })}
              defaultValue={formData.academic_background.major_in}
              className={errors.academic_background?.major_in ? "border-red-500" : ""}
              placeholder="Major in"
            />
            {errors.academic_background?.major_in && (
              <span className="text-sm text-red-500">{errors.academic_background?.major_in.message}</span>
            )}
          </div>

          {/* Application Type Select */}
          <div className="space-y-2">
            <Label htmlFor="application_type">Application Type*</Label>
            <Controller
              name="academic_background.application_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        application_type: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select application type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="New Student">New Student</SelectItem>
                    <SelectItem value="Old Student">Old Student</SelectItem>
                    <SelectItem value="Transferee">Transferee</SelectItem>
                    <SelectItem value="Cross-Enrollee">Cross-Enrollee</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Student Type Select */}
          <div className="space-y-2">
            <Label htmlFor="student_type">Student Type*</Label>
            <Controller
              name="academic_background.student_type"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        student_type: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select student type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Graduate">Graduate</SelectItem>
                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Entry Semester Select */}
          <div className="space-y-2">
            <Label htmlFor="semester_entry">Entry Semester*</Label>
            <Controller
              name="academic_background.semester_entry"
              control={control}
              render={({ field }) => (
                <Select
                  value={undefined}
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        semester_entry: parseInt(value)
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select semester" />
                  </SelectTrigger>
                  <SelectContent>
                    {semesters.map((semester) => (
                      <SelectItem key={semester.id} value={semester.id.toString()}>
                        {semester.semester_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Year Level Select */}
          <div className="space-y-2">
            <Label htmlFor="year_level">Year Level*</Label>
            <Controller
              name="academic_background.year_level"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value || ""}
                  onValueChange={(value) => {
                    field.onChange(value);
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        year_level: value
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select year level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1st Year">First Year</SelectItem>
                    <SelectItem value="2nd Year">Second Year</SelectItem>
                    <SelectItem value="3rd Year">Third Year</SelectItem>
                    <SelectItem value="4th Year">Fourth Year</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Entry Year Select */}
          <div className="space-y-2">
            <Label htmlFor="year_entry">Entry Year*</Label>
            <Controller
              name="academic_background.year_entry"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        year_entry: parseInt(value)
                      }
                    }));
                  }}
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
              )}
            />
          </div>

          {/* Graduate Year Select */}
          <div className="space-y-2">
            <Label htmlFor="year_graduate">Expected Graduation Year*</Label>
            <Controller
              name="academic_background.year_graduate"
              control={control}
              render={({ field }) => (
                <Select
                  value={field.value?.toString() || ""}
                  onValueChange={(value) => {
                    field.onChange(parseInt(value));
                    setFormData(prev => ({
                      ...prev,
                      academic_background: {
                        ...prev.academic_background,
                        year_graduate: parseInt(value)
                      }
                    }));
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select graduate year" />
                  </SelectTrigger>
                  <SelectContent>
                    {yearOptions.map((year) => (
                      <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const AcademicHistoryForm: React.FC<InfoFormProps> = ({ formData, setFormData }) => {

  const {
    register,
    formState: { errors },
  } = useForm<AcademicHistoryFormValues>({
    resolver: zodResolver(academicHistorySchema),
    defaultValues: formData.academic_history,  
    mode: "onChange"
  });

  const handleFieldChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      academic_history: {
        ...prev.academic_history,
        [name]: value
      }
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
                {...register("elementary_school", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.elementary_school}
                className={errors.elementary_school ? "border-red-500" : ""}
                placeholder="Enter school name"
              />
              {errors.elementary_school && (
                <span className="text-sm text-red-500">{errors.elementary_school.message}</span>
              )} 
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="elementary_address">School Address*</Label>
              <Input
                id="elementary_address"
                {...register("elementary_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.elementary_address}
                className={errors.elementary_address ? "border-red-500" : ""}
                placeholder="Enter school address"
              />
              {errors.elementary_address && (
                <span className="text-sm text-red-500">{errors.elementary_address.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementary_graduate">Year Graduated</Label>
              <Input
                id="elementary_graduate"
                type='number'
                {...register("elementary_graduate", {
                  onChange: handleFieldChange,
                  valueAsNumber: true 
                })}
                defaultValue={formData.academic_history.elementary_graduate}
                className={errors.elementary_graduate ? "border-red-500" : ""}
                placeholder="Enter monthly income"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="elementary_honors">Honors/Awards</Label>
              <Input
                id="elementary_honors"
                {...register("elementary_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.elementary_honors}
                className={errors.elementary_honors ? "border-red-500" : ""}
                placeholder="Enter honors/awards"
              />
              {errors.elementary_honors && (
                <span className="text-sm text-red-500">{errors.elementary_honors.message}</span>
              )}
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
                {...register("junior_highschool", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.junior_highschool}
                className={errors.junior_highschool ? "border-red-500" : ""}
                placeholder="Enter school name"
              />
              {errors.junior_highschool && (
                <span className="text-sm text-red-500">{errors.junior_highschool.message}</span>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="junior_address">School Address*</Label>
              <Input
                id="junior_address"
                {...register("junior_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.junior_address}
                className={errors.junior_address ? "border-red-500" : ""}
                placeholder="Enter school address"
              />
              {errors.junior_address && (
                <span className="text-sm text-red-500">{errors.junior_address.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="junior_graduate">Year Graduated</Label>
              <Input
                id="junior_graduate"
                type='number'
                {...register("junior_graduate", {
                  onChange: handleFieldChange,
                  valueAsNumber: true 
                })}

                defaultValue={formData.academic_history.junior_graduate}
                className={errors.junior_graduate ? "border-red-500" : ""}
                placeholder="Enter year graduated"
              />
              {errors.junior_graduate && (
                <span className="text-sm text-red-500">{errors.junior_graduate.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="junior_honors">Honors/Awards</Label>
              <Input
                id="junior_honors"
                {...register("junior_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.junior_honors}
                className={errors.junior_honors ? "border-red-500" : ""}
                placeholder="Enter honors/awards"
              />
              {errors.junior_honors && (
                <span className="text-sm text-red-500">{errors.junior_honors.message}</span>
              )}
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
                {...register("senior_highschool", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.senior_highschool}
                className={errors.senior_highschool ? "border-red-500" : ""}
                placeholder="Enter school name"
              />
              {errors.senior_highschool && (
                <span className="text-sm text-red-500">{errors.senior_highschool.message}</span>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="senior_address">School Address*</Label>
              <Input
                id="senior_address"
                {...register("senior_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.senior_address}
                className={errors.senior_address ? "border-red-500" : ""}
                placeholder="Enter school address"
              />
              {errors.senior_address && (
                <span className="text-sm text-red-500">{errors.senior_address.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senior_graduate">Year Graduated</Label>
              <Input
                id="senior_graduate"
                type='number'
                {...register("senior_graduate", {
                  onChange: handleFieldChange,
                  valueAsNumber: true 
                })}
                defaultValue={formData.academic_history.senior_graduate}
                className={errors.senior_graduate ? "border-red-500" : ""}
                placeholder="Enter year graduated"
              />
              {errors.senior_graduate && (
                <span className="text-sm text-red-500">{errors.senior_graduate.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="senior_honors">Honors/Awards</Label>
              <Input
                id="senior_honors"
                {...register("senior_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.senior_honors}
                className={errors.senior_honors ? "border-red-500" : ""}
                placeholder="Enter honors/awards"
              />
              {errors.senior_honors && (
                <span className="text-sm text-red-500">{errors.senior_honors.message}</span>
              )}
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
                {...register("latest_college", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.latest_college}
                className={errors.latest_college ? "border-red-500" : ""}
                placeholder="Enter school name"
              />
              {errors.latest_college && (
                <span className="text-sm text-red-500">{errors.latest_college.message}</span>
              )}
            </div>
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="college_address">School Address</Label>
              <Input
                id="college_address"
                {...register("college_address", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.college_address}
                className={errors.college_address ? "border-red-500" : ""}
                placeholder="Enter school address"
              />
              {errors.college_address && (
                <span className="text-sm text-red-500">{errors.college_address.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="program">Program</Label>
              <Input
                id="program"
                {...register("program", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.program}
                className={errors.program ? "border-red-500" : ""}
                placeholder="Enter program"
              />
              {errors.program && (
                <span className="text-sm text-red-500">{errors.program.message}</span>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="college_honors">Honors/Awards</Label>
              <Input
                id="college_honors"
                {...register("college_honors", {
                  onChange: handleFieldChange
                })}
                defaultValue={formData.academic_history.college_honors}
                className={errors.college_honors ? "border-red-500" : ""}
                placeholder="Enter honors/awards"
              />
              {errors.college_honors && (
                <span className="text-sm text-red-500">{errors.college_honors.message}</span>
              )}
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
            academic_background: {
              ...prev.academic_background,
              application_type: studentInfo.is_transferee ? "Transferee" : "",
              campus: studentInfo.campus,
              year_level: studentInfo.year_level,
              program: studentInfo.program,
            }
          }));
    
          methods.setValue('academic_background.application_type', 
            studentInfo.is_transferee ? "Transferee" : ""
          );
          methods.setValue('academic_background.program', studentInfo.program);
          methods.setValue('academic_background.year_level', studentInfo.year_level);
          methods.setValue('personal_data.basicdata_applicant_id', profileData.profile.student_info.basicdata_applicant_id);
          methods.setValue('personal_data.f_name', profileData.profile.student_info.first_name);
          methods.setValue('personal_data.m_name', profileData.profile.student_info.middle_name);
          methods.setValue('personal_data.l_name', profileData.profile.student_info.last_name);
          methods.setValue('personal_data.suffix', profileData.profile.student_info.suffix || '');
          methods.setValue('personal_data.sex', sexValue, { shouldValidate: true });
          methods.setValue('personal_data.birth_date', profileData.profile.student_info.birth_date);
          methods.setValue('personal_data.email', profileData.profile.student_info.email);
    
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

  // Create the submit handler using handleSubmit from useForm
  const onSubmit = methods.handleSubmit(async (data) => {
    setIsSubmitting(true);

    try {
      console.log("Form values:", data);
      
      const response = await axios.post('http://127.0.0.1:8000/api/full-student-data/', data);
      
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
            <form onSubmit={methods.handleSubmit((data) => console.log(data))}>
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
                  <Button type="submit" className="min-w-[100px]">
                    Submit Application
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