import { z } from "zod";

const PHONE_REGEX = /^(\+?63|0)?[0-9]{10}$/;
const NAME_REGEX = /^[a-zA-ZÀ-ÿ\s'-]+$/;
const STUDENT_ID_REGEX = /^\d{4}-\d{5}$/;

// Reusable schemas
const nameSchema = z.object({
  first_name: z.string()
    .min(1, "First name is required")
    .max(100, "First name must not exceed 100 characters")
    .regex(NAME_REGEX, "Name can only contain letters, spaces, hyphens and apostrophes"),
  middle_name: z.string()
    .max(100, "Middle name must not exceed 100 characters")
    .regex(NAME_REGEX, "Name can only contain letters, spaces, hyphens and apostrophes")
    .optional()
    .nullable(),
  last_name: z.string()
    .min(1, "Last name is required")
    .max(100, "Last name must not exceed 100 characters")
    .regex(NAME_REGEX, "Name can only contain letters, spaces, hyphens and apostrophes"),
  suffix: z.string()
    .max(10, "Suffix must not exceed 10 characters")
    .optional()
    .nullable(),
});

const contactSchema = z.object({
  email: z.string()
    .email("Invalid email address")
    .max(254, "Email must not exceed 254 characters"), // RFC 5321
  contact_number: z.string()
    .regex(PHONE_REGEX, "Must be a valid Philippine phone number"),
});

// Main schemas
const personalDataSchema = z.object({
  basicdata_applicant_id: z.number(),
  ...nameSchema.shape,
  sex: z.enum(["Male", "Female", "Other"], {
    required_error: "Sex is required",
    invalid_type_error: "Invalid sex value",
  }),
  birth_date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
    .refine(date => !isNaN(Date.parse(date)), "Invalid date"),
  birth_place: z.string()
    .min(1, "Birth place is required")
    .max(255, "Birth place must not exceed 255 characters"),
  marital_status: z.enum(["Single", "Married", "Divorced", "Widowed"], {
    required_error: "Marital status is required",
  }),
  religion: z.string()
    .min(1, "Religion is required")
    .max(70, "Religion must not exceed 70 characters"),
  country: z.string()
    .min(1, "Country is required")
    .max(50, "Country must not exceed 50 characters"),
  ...contactSchema.shape,
  acr: z.string()
    .max(100, "ACR must not exceed 100 characters")
    .optional()
    .nullable(),
  status: z.enum([
    "officially enrolled",
    "pending",
    "verified",
    "rejected",
    "initially enrolled"
  ]).default("pending"),
});

const addPersonalDataSchema = z.object({
  city_address: z.string()
    .min(1, "City address is required")
    .max(255, "City address must not exceed 255 characters"),
  province_address: z.string()
    .max(255, "Province address must not exceed 255 characters")
    .optional()
    .nullable(),
  contact_number: z.string()
    .regex(PHONE_REGEX, "Must be a valid Philippine phone number"),
  city_contact_number: z.string()
    .regex(PHONE_REGEX, "Must be a valid Philippine phone number")
    .optional()
    .nullable(),
  province_contact_number: z.string()
    .regex(PHONE_REGEX, "Must be a valid Philippine phone number")
    .optional()
    .nullable(),
  citizenship: z.string()
    .min(1, "Citizenship is required")
    .max(70, "Citizenship must not exceed 70 characters"),
});

const familyMemberSchema = z.object({
  first_name: z.string().max(100).optional().nullable(),
  middle_name: z.string().max(100).optional().nullable(),
  last_name: z.string().max(100).optional().nullable(),
  contact_number: z.string()
    .regex(PHONE_REGEX, "Must be a valid Philippine phone number")
    .optional()
    .nullable(),
  email: z.string().email("Invalid email address").optional().nullable(),
  occupation: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
});

const familyBackgroundSchema = z.object({
  father: familyMemberSchema.extend({
    income: z.number().min(0).optional().nullable(),
  }),
  mother: familyMemberSchema.extend({
    income: z.string().optional().nullable(),
  }),
  guardian: familyMemberSchema.extend({
    relation: z.string().max(100).optional().nullable(),
  }),
});

const academicBackgroundSchema = z.object({
  program: z.number().positive("Program ID is required"),
  major_in: z.string().optional().nullable(),
  student_type: z.enum(["Regular", "Irregular", "Transferee"], {
    required_error: "Student type is required",
  }),
  semester_entry: z.number().positive("Semester entry is required"),
  year_entry: z.number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear() + 1, "Invalid future year"),
  year_level: z.enum(["First Year", "Second Year", "Third Year", "Fourth Year"], {
    required_error: "Year level is required",
  }),
  year_graduate: z.number()
    .min(new Date().getFullYear(), "Graduate year must be in the future")
    .max(new Date().getFullYear() + 6, "Graduate year too far in the future"),
  application_type: z.enum(["New", "Transfer", "Return"], {
    required_error: "Application type is required",
  }),
});

const schoolInfoSchema = z.object({
  school_name: z.string().min(1, "School name is required"),
  address: z.string().min(1, "School address is required"),
  honors: z.string().optional().nullable(),
  graduate_year: z.number()
    .min(1900, "Invalid year")
    .max(new Date().getFullYear(), "Invalid future year")
    .optional()
    .nullable(),
});

const academicHistorySchema = z.object({
  elementary: schoolInfoSchema,
  junior_high: schoolInfoSchema,
  senior_high: schoolInfoSchema,
  ncae: z.object({
    grade: z.string().optional().nullable(),
    year_taken: z.number()
      .min(1900, "Invalid year")
      .max(new Date().getFullYear(), "Invalid future year")
      .optional()
      .nullable(),
  }),
  college: schoolInfoSchema.extend({
    program: z.string().optional().nullable(),
  }).optional().nullable(),
});

// Combined schema for the entire form
const studentRegistrationSchema = z.object({
  personal_data: personalDataSchema,
  additional_data: addPersonalDataSchema,
  family_background: familyBackgroundSchema,
  academic_background: academicBackgroundSchema,
  academic_history: academicHistorySchema,
});

type StudentRegistrationFormValues = z.infer<typeof studentRegistrationSchema>;

export {
  studentRegistrationSchema,
  personalDataSchema,
  addPersonalDataSchema,
  familyBackgroundSchema,
  academicBackgroundSchema,
  academicHistorySchema,
  type StudentRegistrationFormValues,
};