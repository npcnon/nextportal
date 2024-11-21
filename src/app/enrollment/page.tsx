// src/app/enrollment/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios, { AxiosError } from 'axios'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { AlertCircle, ArrowRight, CheckCircle, CheckSquare, CircleUserRound, GraduationCap, Loader2, Mail, Shield, Sparkles, Star, User, X } from 'lucide-react'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/clients/authenticated-api-client'
import { motion } from 'framer-motion'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import unauthenticatedApiClient from '@/lib/clients/unauthenticated-api-client'

// Mock data for programs and campuses

const CAMPUSES = [
  { id: 1, name: 'Mandaue Campus' },
  { id: 2, name: 'Cebu Campus' }
]
interface Program {
  id: number
  code: string
  description: string
  is_active: boolean
  department_id: number
}

const enrollmentSchema = z.object({
  first_name: z.string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters'),
  middle_name: z.string()
    .max(50, 'Middle name cannot exceed 50 characters')
    .optional(),
  last_name: z.string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters'),
  suffix: z.string()
    .max(10, 'Suffix cannot exceed 10 characters')
    .optional(),
  birth_date: z.string().min(1, "Birth date is required"),
  sex: z.enum(['Male', 'Female'], {
    errorMap: () => ({ message: 'Please select a valid sex' })
  }),
  email: z.string()
    .email('Please enter a valid email address')
    .min(1, 'Email is required'),
  contact_number: z.string()
    .regex(/^09\d{9}$/, 'Contact number must start with 09 and have 11 digits'),
  address: z.string()
    .min(10, 'Address must be at least 10 characters')
    .max(255, 'Address cannot exceed 255 characters'),
  campus: z.string()
    .min(1, 'Please select a campus'),
  program: z.string()
    .min(1, 'Please select a program'),
  year_level: z.string()
    .min(1, 'Please select a year level'),
  is_transferee: z.boolean()
})

type EnrollmentSchema = z.infer<typeof enrollmentSchema>



export default function EnrollmentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [programs, setPrograms] = useState<Program[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof EnrollmentSchema, string>>>({})
  const [isEmailVerificationSent, setIsEmailVerificationSent] = useState(false)
  const [isVerifyingEmail, setIsVerifyingEmail] = useState(false)
  const [isVerifyingCode, setIsVerifyingCode] = useState(false)
  const [isEmailVerified, setIsEmailVerified] = useState(false)
  const [isConfirming, setIsConfirming] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLoadingPrograms, setIsLoadingPrograms] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);


  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    is_transferee: false,
    year_level: '',
    contact_number: '',
    address: '',
    campus: '',
    program: '',
    birth_date: '',
    sex: '',
    email: '',
    email_verification_code: '',
  })
  const handleNavigation = (path: string) => {
    setIsNavigating(true)
    router.push(path)
  }



  const handleEmailVerification = async () => {
    setIsVerifyingEmail(true)
    try {
      // Replace with your actual API endpoint
      const response = await unauthenticatedApiClient.post(`emailapi`, {
        email: formData.email
      })
      
      if (response.status === 200) {
        setIsEmailVerificationSent(true)
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code.",
          variant: "default",
          className:
            "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg rounded-lg px-6 py-4 border border-blue-400",
        });
        
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
        className: "bg-red-500 text-white border-none shadow-none",
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }
  
  const handleVerificationCodeSubmit = async () => {
    setIsVerifyingCode(true)
    try {
      const response = await unauthenticatedApiClient.put('emailapi', {
        email: formData.email,
        verification_code: formData.email_verification_code
      })
      
      if (response.status === 200) {
        setIsEmailVerified(true)
        toast({
          title: "Success",
          description: "Email verified successfully!",
          variant: "default",
          className: "bg-blue-500 text-white border-none shadow-none",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
        className: "bg-red-500 text-white border-none shadow-none",

      })
    } finally {
      setIsVerifyingCode(false)
    }
  }
  

//TODO: add email verification
  const yearLevels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
  const sexOptions = ['Male', 'Female']

  const handleChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
  
    // Clear any existing errors for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));
  
    // Update form data
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  
    if (name === "campus") {
      setPrograms([]); // Clear previous programs
      setIsLoadingPrograms(true); // Add loading indicator
      formData.program = ""
      try {
        const response = await unauthenticatedApiClient.get(`program/?campus_id=${value}`);
        const fetchedPrograms = response.data.results;
  
        setPrograms(fetchedPrograms);
        if (fetchedPrograms.length === 0) {
          toast({
            title: "No Programs Found",
            description: "No programs are available for the selected campus.",
            variant: "default",
            className: "bg-blue-500 text-white border-none shadow-none",
          });
        }
      } catch (error) {
        console.error("Failed to fetch programs:", error);
        toast({
          title: "Error",
          description: "Failed to load programs. Please try again.",
          variant: "destructive",
          className: "bg-red-500 text-white border-none shadow-none",
        });
      } finally {
        setIsLoadingPrograms(false);
      }
    }

     // Update selectedProgram when program changes
     if (name === 'program' && value) {
      const program = programs.find(p => p.id.toString() === value);
      setSelectedProgram(program || null);
    }
  };
  
const handleSubmit = async () => {
  if (!isEmailVerified) {
    toast({
      title: "Email Not Verified",
      description: "Please verify your email before submitting the enrollment form.",
      variant: "destructive",
      className: "bg-red-500 text-white border-none shadow-none",

    });
    return;
  }

  try {
    enrollmentSchema.parse(formData);
    setErrors({});
    setIsSubmitting(true);

    try {
      const response = await unauthenticatedApiClient.post('stdntbasicinfo/', formData);
      if (response.status === 201) {
        setIsSubmitted(true);
        
        toast({
          title: "Success!",
          description: "Your enrollment has been submitted successfully. Please check your email",
          variant: "default",
          className: "bg-blue-500 text-white border-none shadow-none",
        });
        
        setTimeout(() => {
          setIsNavigating(true);
          router.push('/login');
        }, 1000);
      }
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('Enrollment submission failed:', error);
        
        if (error.response && error.response.data) {
          const errorData = error.response.data;
          
          if (errorData.non_field_errors && errorData.non_field_errors.length > 0) {
            const nonFieldError = errorData.non_field_errors[0];
            
            if (nonFieldError.includes('first_name, last_name must make a unique set')) {
              toast({
                title: "Duplicate Entry",
                description: "A student with this exact name already exists in the system.",
                variant: "destructive",
                className: "bg-red-500 text-white border-none shadow-none",
              });
    
              setErrors(prevErrors => ({
                ...prevErrors,
                first_name: "Name combination must be unique",
                last_name: "Name combination must be unique"
              }));
            } else {
              toast({
                title: "Submission Error",
                description: nonFieldError,
                variant: "destructive",
                className: "bg-red-500 text-white border-none shadow-none",
              });
            }
          } 
          else if (errorData.email && errorData.email.length > 0) {
            const emailError = errorData.email[0];
            
            if (emailError.includes('already exists')) {
              toast({
                title: "Email Already Registered",
                description: "This email is already in use. Please use a different email address.",
                variant: "destructive",
                className: "bg-red-500 text-white border-none shadow-none",
              });
    
              setErrors(prevErrors => ({
                ...prevErrors,
                email: "Email is already registered"
              }));
            }
          } 
          else {
            const errorMessages = Object.entries(errorData)
              .flatMap(([field, messages]) => 
                Array.isArray(messages) 
                  ? messages.map(msg => `${field.charAt(0).toUpperCase() + field.slice(1)}: ${msg}`)
                  : []
              );
    
            if (errorMessages.length > 0) {
              toast({
                title: "Submission Errors",
                description: errorMessages.join('; '),
                variant: "destructive",
                className: "bg-red-500 text-white border-none shadow-none",
              });
            } else {
              toast({
                title: "Submission Error",
                description: "An error occurred during submission. Please try again.",
                variant: "destructive",
                className: "bg-red-500 text-white border-none shadow-none",
              });
            }
          }
        } else {
          toast({
            title: "Error",
            description: error.message,
            variant: "destructive",
            className: "bg-red-500 text-white border-none shadow-none",
          });
        }
      } else {
        toast({
          title: "Unexpected Error",
          description: String(error),
          variant: "destructive",
          className: "bg-red-500 text-white border-none shadow-none",
        });
      }
      
      setIsSubmitting(false);
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const formattedErrors: Partial<Record<keyof EnrollmentSchema, string>> = {};
      const errorMessages: string[] = [];
      
      error.errors.forEach((err) => {
        if (err.path[0]) {
          const fieldName = err.path[0].toString()
            .replace(/_/g, ' ')
            .split(' ')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');
          
          formattedErrors[err.path[0] as keyof EnrollmentSchema] = err.message;
          errorMessages.push(`${fieldName}: ${err.message}`);
        }
      });
      
      setErrors(formattedErrors);
      
      toast({
        title: "Please fix the following errors:",
        description: (
          <ul className="list-disc pl-4 mt-2 space-y-1">
            {errorMessages.map((message, index) => (
              <li key={index}>{message}</li>
            ))}
          </ul>
        ),
        variant: "destructive",
        duration: 5000,
        className: "bg-red-500 text-white border-none shadow-none",

      });
    }
  }
};

const ConfirmationDialog = () => (
  <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
    <DialogContent className="sm:max-w-[500px] transform transition-all duration-500 hover:shadow-2xl bg-white overflow-hidden">
      <div className="absolute inset-0 bg-[#1A2A5B]/5 pointer-events-none" />
      
      {/* Floating celebration icons that appear during submission */}
      {isSubmitting && (
        <div className="absolute inset-0 overflow-hidden">
          {[CheckCircle, Star, Sparkles, CheckSquare].map((Icon, index) => (
            <div
              key={index}
              className="absolute animate-float opacity-0"
              style={{
                animation: `float 1.5s ease-out ${index * 100}ms forwards`,
                left: `${Math.random() * 80 + 10}%`
              }}
            >
              <Icon className="w-4 h-4 text-[#D97757]" />
            </div>
          ))}
        </div>
      )}

      <DialogHeader>
        <DialogTitle className="text-2xl font-bold text-[#1A2A5B] flex items-center gap-2">
          <Shield className="w-6 h-6 text-[#1A2A5B] animate-pulse" />
          Confirm Enrollment Details
        </DialogTitle>
        <DialogDescription className="text-gray-600">
          Please verify that the following information is correct:
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Personal Information Section */}
        <div className="p-4 rounded-xl transition-all duration-300 hover:bg-white/80 border border-transparent hover:border-[#1A2A5B]/20 hover:shadow-lg group">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1A2A5B]/10 group-hover:bg-[#1A2A5B] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <User className="h-5 w-5 text-[#1A2A5B] group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-medium text-gray-700">Full Name</span>
            <Sparkles className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[#D97757]" />
          </div>
          <p className="text-sm text-gray-600 pl-11">
            {`${formData.first_name} ${formData.middle_name} ${formData.last_name} ${formData.suffix}`.trim()}
          </p>
        </div>

        {/* Program Section */}
        <div className="p-4 rounded-xl transition-all duration-300 hover:bg-white/80 border border-transparent hover:border-[#1A2A5B]/20 hover:shadow-lg group">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1A2A5B]/10 group-hover:bg-[#1A2A5B] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <GraduationCap className="h-5 w-5 text-[#1A2A5B] group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-medium text-gray-700">Program</span>
            <Star className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[#D97757]" />
          </div>
          <p className="text-sm text-gray-600 pl-11">
            {programs.find(p => p.id.toString() === formData.program)?.description || 'Not selected'}
          </p>
        </div>

        {/* Email Status Section */}
        <div className="p-4 rounded-xl transition-all duration-300 hover:bg-white/80 border border-transparent hover:border-[#1A2A5B]/20 hover:shadow-lg group">
          <div className="flex items-center gap-3 mb-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-[#1A2A5B]/10 group-hover:bg-[#1A2A5B] transition-all duration-500 group-hover:rotate-6 group-hover:scale-110">
              <Mail className="h-5 w-5 text-[#1A2A5B] group-hover:text-white transition-colors duration-300" />
            </div>
            <span className="font-medium text-gray-700">Email Status</span>
            <Shield className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300 text-[#D97757]" />
          </div>
          <div className="flex items-center gap-2 pl-11">
            {isEmailVerified ? (
              <div className="flex items-center gap-2 text-[#1A2A5B]">
                <CheckCircle className="h-5 w-5 animate-bounce" />
                <span className="text-sm font-medium">Successfully Verified</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5 animate-pulse" />
                <span className="text-sm font-medium">Not Verified</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <DialogFooter className="gap-4">
        <Button
          variant="outline"
          onClick={() => setShowConfirmDialog(false)}
          className="w-full sm:w-auto group relative overflow-hidden transition-all duration-300 hover:border-red-500 hover:text-red-500 hover:shadow-md"
        >
          <span className="flex items-center justify-center gap-2">
            <X className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
            Cancel
          </span>
        </Button>
        <Button
          onClick={() => {
            setShowConfirmDialog(false);
            handleSubmit();
          }}
          disabled={!isEmailVerified || isSubmitting}
          className={`
            w-full sm:w-auto text-white transition-all duration-500 
            group relative overflow-hidden
            ${isSubmitting 
              ? 'bg-[#D97757] hover:bg-[#C56646]' 
              : 'bg-[#1A2A5B] hover:bg-[#15234D]'
            }
          `}
        >
          <span className="flex items-center justify-center gap-2">
            {isSubmitting ? (
              <>
                <CheckCircle className="h-4 w-4 animate-bounce" />
                Processing...
              </>
            ) : (
              <>
                Confirm & Submit
                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </>
            )}
          </span>
        </Button>
      </DialogFooter>

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0) scale(1);
            opacity: 1;
          }
          100% {
            transform: translateY(-100px) scale(0);
            opacity: 0;
          }
        }
      `}</style>
    </DialogContent>
  </Dialog>
);

  const renderStep1 = () => (
    <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-8"
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A2A5B]/10 group-hover:bg-[#1A2A5B] transition-all duration-500">
        <CircleUserRound className="h-6 w-6 text-[#1A2A5B]" />
      </div>
      <div>
        <h2 className="text-2xl font-bold text-[#1A2A5B]">Personal Information</h2>
        <p className="text-gray-600 text-sm">Please enter your personal details</p>
      </div>
    </div>

    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-2 transition-all duration-300 group">
        <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
          First Name
        </label>
        <Input
          required
          name="first_name"
          value={formData.first_name}
          onChange={handleChange}
          className={`
            w-full transition-all duration-300
            border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
            ${errors.first_name ? 'border-red-500 focus:border-red-500' : ''}
          `}
          placeholder="Enter your first name"
        />
        {errors.first_name && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {errors.first_name}
          </motion.p>
        )}
      </div>
      <div className="space-y-2 transition-all duration-300 group">
        <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
          Middle Name
        </label>
        <Input
          required
          name="middle_name"
          value={formData.middle_name}
          onChange={handleChange}
          className={`
            w-full transition-all duration-300
            border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
            ${errors.middle_name ? 'border-red-500 focus:border-red-500' : ''}
          `}
          placeholder="Enter your middle name"
        />
        {errors.middle_name && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {errors.middle_name}
          </motion.p>
        )}
      </div>

      <div className="space-y-2 transition-all duration-300 group">
        <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
          Last Name
        </label>
        <Input
          required
          name="last_name"
          value={formData.last_name}
          onChange={handleChange}
          className={`
            w-full transition-all duration-300
            border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
            ${errors.last_name ? 'border-red-500 focus:border-red-500' : ''}
          `}
          placeholder="Enter your last name"
        />
        {errors.last_name && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {errors.last_name}
          </motion.p>
        )}
      </div>

      <div className="space-y-2 transition-all duration-300 group">
        <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
          Suffix Name
        </label>
        <Input
          required
          name="suffix"
          value={formData.suffix}
          onChange={handleChange}
          className={`
            w-full transition-all duration-300
            border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
            ${errors.suffix ? 'border-red-500 focus:border-red-500' : ''}
          `}
          placeholder="Enter your last name"
        />
        {errors.suffix && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {errors.suffix}
          </motion.p>
        )}
      </div>


        <div>
        <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
          Birth Date
        </label>
          <Input
            required
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            className={`
              w-full transition-all duration-300
              border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
              ${errors.birth_date ? 'border-red-500 focus:border-red-500' : ''}
            `}
  
            placeholder="Enter your birth date"
          />
        {errors.birth_date && (
          <motion.p 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-red-500 text-sm"
          >
            {errors.birth_date}
          </motion.p>
        )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 transition-colors duration-200">
            Sex
          </label>
          <select
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className={`
              w-full p-2 border rounded-md bg-white
              focus:ring-2 focus:ring-[#1A2A5B]/20 focus:border-[#1A2A5B]
              ${errors.sex ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-gray-200'}
            `}
          >
            <option value="">Select Sex</option>
            {sexOptions.map(option => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          
          {errors.sex && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-1.5 text-red-500 text-sm mt-1.5"
            >
              <AlertCircle className="h-4 w-4" />
              {errors.sex}
            </motion.p>
          )}
        </div>
      </div>
      <Button
        onClick={() => setCurrentStep(2)}
        className="w-full bg-[#D44D00] hover:bg-[#B33F00] text-white transition-all duration-300
          shadow-lg hover:shadow-xl hover:translate-y-[-2px]
          disabled:bg-gray-400 disabled:shadow-none disabled:translate-y-0
        "
        disabled={isLoading}
      >
        <span className="flex items-center justify-center gap-2">
          Continue to Academic Details
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </span>
      </Button>
    </motion.div>
  )


  const renderStep2 = () => (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-[#1A2A5B]/10">
          <GraduationCap className="h-6 w-6 text-[#1A2A5B]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#1A2A5B]">Academic Information</h2>
          <p className="text-gray-600 text-sm">Please enter your academic and contact details</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-2 transition-all duration-300 group">
          <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
            Email
          </label>
          <div className="flex gap-2">
            <Input
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEmailVerificationSent}
              className={`
                w-full transition-all duration-300
                border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
                ${errors.email ? 'border-red-500 focus:border-red-500' : ''}
              `}
              placeholder="Enter your email"
            />
            <Button
              onClick={handleEmailVerification}
              disabled={isEmailVerificationSent || isVerifyingEmail || !formData.email}
              className="whitespace-nowrap bg-[#1A2A5B] text-white hover:bg-[#131F43] transition-all duration-300
                disabled:bg-gray-400 disabled:text-gray-200"
            >
              {isVerifyingEmail ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Verify Email'
              )}
            </Button>
          </div>
          {errors.email && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.email}
            </motion.p>
          )}
  
          {isEmailVerificationSent && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 space-y-2"
            >
              <label className="block text-sm font-medium text-gray-700 group-focus-within:text-[#1A2A5B]">
                Verification Code
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  name="email_verification_code"
                  value={formData.email_verification_code}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  className="w-full transition-all duration-300 border-gray-200 focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20"
                  placeholder="Enter verification code"
                />
                <Button
                  onClick={handleVerificationCodeSubmit}
                  disabled={!formData.email_verification_code || isVerifyingCode || isEmailVerified}
                  className="whitespace-nowrap bg-[#1A2A5B] text-white hover:bg-[#131F43] transition-all duration-300
                    disabled:bg-gray-400 disabled:text-gray-200"
                >
                  {isVerifyingCode ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : isEmailVerified ? (
                    'Verified ✓'
                  ) : (
                    'Verify Code'
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Contact Number
          </label>
          <Input
            required
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className={`
              w-full bg-white
              border border-gray-300 shadow-sm
              focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
              ${errors.contact_number ? 'border-red-500 focus:border-red-500' : ''}
            `}
            placeholder="Enter your contact number"
          />
          {errors.contact_number && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.contact_number}
            </motion.p>
          )}
        </div>
  
        <div className="md:col-span-2 space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Address
          </label>
          <textarea
            required
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`
              w-full bg-white p-2.5 rounded-md
              border border-gray-300 shadow-sm
              focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
              ${errors.address ? 'border-red-500 focus:border-red-500' : ''}
            `}
            rows={3}
            placeholder="Enter your complete address"
            maxLength={255}
          />
          {errors.address && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.address}
            </motion.p>
          )}
        </div>
  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Campus
          </label>
          <select
            required
            name="campus"
            value={formData.campus}
            onChange={handleChange}
            className={`
              w-full bg-white p-2.5 rounded-md
              border border-gray-300 shadow-sm
              focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
              ${errors.campus ? 'border-red-500 focus:border-red-500' : ''}
            `}
          >
            <option value="" disabled>Please select a campus</option>
            {CAMPUSES.map(campus => (
              <option key={campus.id} value={campus.id}>{campus.name}</option>
            ))}
          </select>
          {errors.campus && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.campus}
            </motion.p>
          )}
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Program
          </label>
          <div className="relative">
            <select
              required
              name="program"
              value={formData.program}
              onChange={handleChange}
              className={`
                w-full bg-white p-2.5 rounded-md
                border border-gray-300 shadow-sm
                focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
                ${errors.program ? 'border-red-500 focus:border-red-500' : ''}
              `}
            >
              <option value="" disabled>
                {isLoadingPrograms ? "" : "Select a program"}
              </option>
              {programs.map(program => (
                <option
                  key={program.id}
                  value={program.id}
                  title={program.description}
                >
                  {program.code}
                </option>
              ))}
            </select>
            
            {isLoadingPrograms && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="h-4 w-4 animate-spin text-gray-500" />
              </div>
            )}
          </div>

          {errors.program && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.program}
            </motion.p>
          )}
        </div>

  
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Year Level
          </label>
          <select
            required
            name="year_level"
            value={formData.year_level}
            onChange={handleChange}
            className={`
              w-full bg-white p-2.5 rounded-md
              border border-gray-300 shadow-sm
              focus:border-[#1A2A5B] focus:ring-[#1A2A5B]/20
              ${errors.year_level ? 'border-red-500 focus:border-red-500' : ''}
            `}
          >
            <option value="">Select Year Level</option>
            {yearLevels.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year_level && (
            <motion.p 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-sm"
            >
              {errors.year_level}
            </motion.p>
          )}
        </div>
  
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="is_transferee"
            checked={formData.is_transferee}
            onChange={handleChange}
            className="w-4 h-4 text-[#1A2A5B] border-gray-300 rounded 
              focus:ring-[#1A2A5B]/20 shadow-sm"
          />
          <label className="text-sm text-gray-700">
            I am a transferee student
          </label>
        </div>
      </div>
  
      <div className="flex gap-4 pt-4">
        <Button
          onClick={() => setCurrentStep(1)}
          className="w-1/2 bg-gray-500 hover:bg-gray-600 text-white"
          disabled={isSubmitting || isSubmitted}
        >
          Previous Step
        </Button>
        <Button
          onClick={() => !isSubmitting && !isSubmitted && setShowConfirmDialog(true)}
          className="w-1/2 bg-[#D44D00] hover:bg-[#B33F00] text-white"
          disabled={isSubmitting || isSubmitted}
        >
          {isSubmitted ? (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Submitted
            </>
          ) : isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              Submit Enrollment
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </motion.div>
  );


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 py-12">
      {isNavigating && (
              <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm">
                <div className="absolute top-0 left-0 w-full h-1">
                  <div className="h-full bg-blue-600 animate-[loading_1s_ease-in-out_infinite]" />
                </div>
              </div>
      )}
      <div className="container mx-auto px-4">
        <Card className="max-w-3xl mx-auto p-8 shadow-lg">
          <div className="mb-8 text-center">
            <img 
                src="/img/circlelogomod.png" 
                alt="Benedicto College Logo" 
                className="w-20 h-20 object-contain rounded-full mx-auto mb-4" 
              />
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Student Enrollment Form</h1>
            <p className="text-gray-600 mt-2">Please fill out all required fields to complete your enrollment</p>
          </div>

          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div className={`h-1 w-1/2 transition-all duration-300 ${currentStep === 1 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
              <div className={`h-1 w-1/2 transition-all duration-300 ${currentStep === 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-sm text-gray-600">Personal Information</span>
              <span className="text-sm text-gray-600">Academic Details</span>
            </div>
          </div>

          {currentStep === 1 ? renderStep1() : renderStep2()}
        </Card>
      </div>
      <ConfirmationDialog />
      <style jsx>{`
        @keyframes loading {
          0% { width: 0; }
          50% { width: 70%; }
          100% { width: 100%; }
        }
      `}</style>
    </div>
  )
}