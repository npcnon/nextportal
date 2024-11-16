// src/app/enrollment/page.tsx

'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import axios from 'axios'
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
import { AlertCircle, CheckCircle, GraduationCap, Loader2, Mail, User } from 'lucide-react'
import { z } from 'zod'
import { Textarea } from '@/components/ui/textarea'
import apiClient from '@/lib/axios'

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

  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    is_transferee: false,
    year_level: '',
    contact_number: '',
    address: '',
    campus: '1',
    program: '1',
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
      const response = await axios.post('https://djangoportal-backends.onrender.com/api/emailapi', {
        email: formData.email
      })
      
      if (response.status === 200) {
        setIsEmailVerificationSent(true)
        toast({
          title: "Verification Code Sent",
          description: "Please check your email for the verification code.",
          variant: "default",
          className: "bg-green-500 text-white",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingEmail(false)
    }
  }
  
  const handleVerificationCodeSubmit = async () => {
    setIsVerifyingCode(true)
    try {
      const response = await axios.put('https://djangoportal-backends.onrender.com/api/emailapi', {
        email: formData.email,
        verification_code: formData.email_verification_code
      })
      
      if (response.status === 200) {
        setIsEmailVerified(true)
        toast({
          title: "Success",
          description: "Email verified successfully!",
          variant: "default",
          className: "bg-green-500 text-white",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Invalid verification code. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsVerifyingCode(false)
    }
  }
  
  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        const response = await apiClient.get(`/program/?campus_id=${formData.campus}`)
        setPrograms(response.data.results)
      } catch (error) {
        console.error('Failed to fetch programs:', error)
        toast({
          title: "Error",
          description: "Failed to load programs. Please try again.",
          variant: "destructive",
        })
      }
    }
  
    fetchPrograms()
  }, [formData.campus]) // This will refetch programs when campus changes
//TODO: add email verification
  const yearLevels = ['First Year', 'Second Year', 'Third Year', 'Fourth Year']
  const sexOptions = ['Male', 'Female']

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
  
    // Clear any existing errors for this field
    setErrors(prev => ({
      ...prev,
      [name]: undefined
    }))
  
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }))
  }

  const handleSubmit = async () => {
    if (!isEmailVerified) {
      toast({
        title: "Email Not Verified",
        description: "Please verify your email before submitting the enrollment form.",
        variant: "destructive",
      })
      return
    }
  
    try {
      enrollmentSchema.parse(formData)
      setErrors({})
      
      setIsLoading(true)
  
      try {
        const response = await axios.post('https://djangoportal-backends.onrender.com/api/stdntbasicinfo/', formData)
        if (response.status === 201) {
          // Don't close the dialog immediately
          toast({
            title: "Success!",
            description: "Your enrollment has been submitted successfully. Please Check your email",
            variant: "default",
            className: "bg-green-500 text-white",
          })
          // Add a small delay before closing dialog and navigating
          setTimeout(() => {
            setShowConfirmDialog(false)
            handleNavigation('/login')
          }, 500)
        }
      } catch (error) {
        console.error('Enrollment submission failed:', error)
        toast({
          title: "Error",
          description: "Failed to submit enrollment. Please try again.",
          variant: "destructive",
        })
        setIsLoading(false) // Only reset loading on error
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Partial<Record<keyof EnrollmentSchema, string>> = {}
        const errorMessages: string[] = []
        
        error.errors.forEach((err) => {
          if (err.path[0]) {
            // Format the field name to be more readable
            const fieldName = err.path[0].toString()
              .replace(/_/g, ' ')
              .split(' ')
              .map(word => word.charAt(0).toUpperCase() + word.slice(1))
              .join(' ')
            
            formattedErrors[err.path[0] as keyof EnrollmentSchema] = err.message
            errorMessages.push(`${fieldName}: ${err.message}`)
          }
        })
        
        setErrors(formattedErrors)
        
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
        })
      }
      return
    }
  }
  const ConfirmationDialog = () => (
    <Dialog 
      open={showConfirmDialog} 
      onOpenChange={(open) => {
        if (!isLoading) {
          setShowConfirmDialog(open)
        }
      }}
    >
      <DialogContent className="sm:max-w-[500px] fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-6">
        <DialogHeader className="space-y-3">
          <DialogTitle className="text-2xl font-semibold tracking-tight">
            Confirm Enrollment
          </DialogTitle>
          <DialogDescription className="text-base text-gray-500">
            Please review your enrollment information carefully before proceeding.
          </DialogDescription>
        </DialogHeader>
  
        <div className="mt-6 space-y-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-4">
            {/* Keep the same content rows */}
            <div className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md transition-colors">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Full Name</p>
                <p className="text-base font-medium">
                  {`${formData.first_name} ${formData.middle_name} ${formData.last_name}`}
                </p>
              </div>
            </div>
  
            <div className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md transition-colors">
              <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
                <GraduationCap className="h-5 w-5 text-purple-600 animate-bounce" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Selected Program</p>
                <p className="text-base font-medium">
                  {programs.find(p => p.id === Number(formData.program))?.description}
                </p>
              </div>
            </div>
  
            <div className="flex items-center space-x-4 p-2 hover:bg-gray-100 rounded-md transition-colors">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Mail className="h-5 w-5 text-orange-600 animate-pulse" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email Status</p>
                <div className="flex items-center space-x-2">
                  {isEmailVerified ? (
                    <>
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span className="text-green-600 font-medium">Verified</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-red-500" />
                      <span className="text-red-600 font-medium">Not Verified</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <div className="mt-6">
          <div className="flex gap-3 justify-end items-center">
            <Button
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isLoading}
              className="w-[120px] h-10"
            >
              Cancel
            </Button>
            <div className="w-[160px] h-10">
              <Button
                onClick={handleSubmit}
                disabled={isLoading}
                className="w-full h-full bg-blue-600 hover:bg-blue-700 text-white"
              >
                <div className="w-full flex items-center justify-center space-x-2">
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    'Confirm Enrollment'
                  )}
                </div>
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Personal Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">First Name</label>
          <Input
            required
            name="first_name"
            value={formData.first_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.first_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your first name"
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">{errors.first_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Middle Name</label>
          <Input
            required
            name="middle_name"
            value={formData.middle_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.middle_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your middle name"
          />
          {errors.middle_name && (
            <p className="text-red-500 text-sm mt-1">{errors.middle_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Last Name</label>
          <Input
            required
            name="last_name"
            value={formData.last_name}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.last_name ? 'border-red-500' : ''
            }`}
            placeholder="Enter your last name"
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">{errors.last_name}</p>
          )}
          
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Suffix</label>
          <Input
            required
            name="suffix"
            value={formData.suffix}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.suffix ? 'border-red-500' : ''
            }`}
            placeholder="Enter your suffix"
          />
          {errors.suffix && (
            <p className="text-red-500 text-sm mt-1">{errors.suffix}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Birth Date</label>
          <Input
            required
            name="birth_date"
            type="date"
            value={formData.birth_date}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.birth_date ? 'border-red-500' : ''
            }`}
            placeholder="Enter your birth date"
          />
          {errors.birth_date && (
            <p className="text-red-500 text-sm mt-1">{errors.birth_date}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Sex</label>
          <select
            required
            name="sex"
            value={formData.sex}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.sex ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Sex</option>
            {sexOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {errors.sex && (
            <p className="text-red-500 text-sm mt-1">{errors.sex}</p>
          )}
          
        </div>
      </div>
      <Button
        onClick={() => setCurrentStep(2)}
        className="w-full bg-blue-600 text-white hover:bg-blue-700 mt-6"
        disabled={isLoading}
      >
        Next Step
      </Button>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-700">Contact & Academic Information</h2>
      <div className="grid md:grid-cols-2 gap-6">
      <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Email</label>
          <div className="flex gap-2">
            <Input
              required
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isEmailVerificationSent}
              className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
                errors.email ? 'border-red-500' : ''
              }`}
              placeholder="Enter your email"
            />
            <Button
              onClick={handleEmailVerification}
              disabled={isEmailVerificationSent || isVerifyingEmail || !formData.email}
              className={`
                whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 
                disabled:bg-gray-400 disabled:text-gray-200
              `}
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
            <p className="text-red-500 text-sm mt-1">{errors.email}</p>
          )}

          {/* Verification code input field - only shows after email is sent */}
          {isEmailVerificationSent && (
            <div className="mt-4">
              <label className="block text-sm font-medium mb-2 text-gray-600">
                Verification Code
              </label>
              <div className="flex gap-2">
                <Input
                  required
                  name="email_verification_code"
                  value={formData.email_verification_code}
                  onChange={handleChange}
                  disabled={isEmailVerified}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter verification code"
                />
                <Button
                  onClick={handleVerificationCodeSubmit}
                  disabled={!formData.email_verification_code || isVerifyingCode || isEmailVerified}
                  className={`
                    whitespace-nowrap bg-blue-600 text-white hover:bg-blue-700 
                    disabled:bg-gray-400 disabled:text-gray-200
                  `}
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
            </div>
          )}
        </div>
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Contact Number</label>
          <Input
            required
            name="contact_number"
            value={formData.contact_number}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.contact_number ? 'border-red-500' : ''
            }`}
            placeholder="Enter your contact number"
          />
          {errors.contact_number && (
            <p className="text-red-500 text-sm mt-1">{errors.contact_number}</p>
          )}
        </div>

        <div className="md:col-span-2">
          <label className="block text-sm font-medium mb-2 text-gray-600">Address</label>
          <textarea
            required
            name="address"
            value={formData.address}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.address ? 'border-red-500' : ''
            }`}
            rows={3}
            placeholder="Enter your complete address"
            maxLength={255}
          />
          {errors.address && (
            <p className="text-red-500 text-sm mt-1">{errors.address}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Campus</label>
          
          <select
            required
            name="campus"
            value={undefined}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.campus ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Campus</option>
            {CAMPUSES.map(campus => (
              <option key={campus.id} value={campus.id}>{campus.name}</option>
            ))}
          </select>
          {errors.campus && (
            <p className="text-red-500 text-sm mt-1">{errors.campus}</p>
          )}

        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Program</label>
          
          <select
            required
            name="program"
            value={undefined}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.program ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Program</option>
            {programs.map(program => (
                <option key={program.id} value={program.id}>
                  {program.description}
                </option>
              ))}
          </select>
          {errors.program && (
            <p className="text-red-500 text-sm mt-1">{errors.program}</p>
          )}

          
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-600">Year Level</label>
          
          <select
            required
            name="year_level"
            value={formData.year_level}
            onChange={handleChange}
            className={`w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 ${
              errors.year_level ? 'border-red-500' : ''
            }`}
          >
            <option value="">Select Year Level</option>
            {yearLevels.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          {errors.year_level && (
            <p className="text-red-500 text-sm mt-1">{errors.year_level}</p>
          )}

        </div>

        <div className="flex items-center">
          <input
            type="checkbox"
            name="is_transferee"
            checked={formData.is_transferee}
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-blue-600"
          />
          <label className="text-sm text-gray-600">I am a transferee student</label>
          {errors.is_transferee && (
            <p className="text-red-500 text-sm mt-1">{errors.is_transferee}</p>
          )}
        </div>
      </div>

      <div className="flex gap-4">
        <Button
          onClick={() => setCurrentStep(1)}
          className="w-1/2 bg-gray-500 text-white hover:bg-gray-600"
          disabled={isLoading}
        >
          Previous Step
        </Button>
        <Button
          onClick={() => setShowConfirmDialog(true)}
          className="w-1/2 bg-blue-600 text-white hover:bg-blue-700"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            'Submit Enrollment'
          )}
        </Button>
      </div>
    </div>
  )

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