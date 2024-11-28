"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Upload, X, FileText } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from '@/hooks/use-toast'
import unauthenticatedApiClient from "@/lib/clients/unauthenticated-api-client"
import Link from "next/link"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_FILE_TYPES = ['.pdf', '.jpg', '.jpeg', '.png', '.gif']

const formSchema = z.object({
  identifier: z.string()
    .min(3, { message: "Identifier must be at least 3 characters." })
    .max(50, { message: "Identifier must be less than 50 characters." })
})

const adminContactSchema = z.object({
  message: z.string().min(10, { message: "Message must be at least 10 characters." }),
  files: z.array(z.instanceof(File))
    .optional()
    .refine(
      (files) => {
        return !files || files.every(file => file.size <= MAX_FILE_SIZE)
      },
      { message: "Each file must be 5MB or less" }
    )
    .refine(
      (files) => {
        return !files || files.every(file => 
          ALLOWED_FILE_TYPES.includes('.' + file.name.split('.').pop()?.toLowerCase())
        )
      },
      { message: `Allowed file types: ${ALLOWED_FILE_TYPES.join(', ')}` }
    )
})

export default function PasswordResetRequestPage() {
  const { toast } = useToast()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isContactingAdmin, setIsContactingAdmin] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
    },
  })

  const adminContactForm = useForm<z.infer<typeof adminContactSchema>>({
    resolver: zodResolver(adminContactSchema),
    defaultValues: {
      message: "",
      files: []
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      const response = await unauthenticatedApiClient.post('password-reset-request', {
        identifier: values.identifier
      })

      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
        className: "bg-green-500 text-white",
      })

      setIsNavigating(true)
      router.push('/login')
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "An error occurred",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  const handleAdminContact = async (values: z.infer<typeof adminContactSchema>) => {
    try {
      setIsContactingAdmin(true)
      
      const formData = new FormData()
      formData.append('message', values.message)
      
      if (values.files && values.files.length > 0) {
        // Validate file count
        if (values.files.length > 5) {
          toast({
            title: "Upload Limit Exceeded",
            description: "You can upload a maximum of 5 files.",
            variant: "destructive",
          })
          return
        }
  
        // Validate file sizes
        const largeFiles = values.files.filter(file => file.size > 10 * 1024 * 1024) // 10MB limit
        if (largeFiles.length > 0) {
          toast({
            title: "File Size Limit Exceeded",
            description: "Each file must be smaller than 10MB.",
            variant: "destructive",
          })
          return
        }
  
        values.files.forEach((file) => {
          formData.append(`files`, file, file.name)
        })
      }
  
      const response = await unauthenticatedApiClient.post('admin-contact/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
  
      toast({
        title: "Success",
        description: response.data.message || "Your message has been sent successfully.",
        variant: "default",
      })
  
      adminContactForm.reset()
    } catch (error: any) {
      // Comprehensive error handling
      let errorTitle = "Error";
      let errorDescription = "Failed to send message";
  
      if (error.response) {
        // The request was made and the server responded with a status code
        switch (error.response.status) {
          case 400:
            errorTitle = "Invalid Request";
            errorDescription = error.response.data.error || 
              error.response.data.detail || 
              "The request contains invalid data.";
            break;
          case 413:
            errorTitle = "File Upload Error";
            errorDescription = "The files are too large. Maximum file size is 10MB per file.";
            break;
          case 422:
            errorTitle = "Validation Error";
            errorDescription = error.response.data.error || 
              "The submitted data did not pass validation checks.";
            break;
          case 500:
            errorTitle = "Server Error";
            errorDescription = "An internal server error occurred. Please try again later.";
            break;
          case 503:
            errorTitle = "Service Unavailable";
            errorDescription = "The service is currently unavailable. Please try again later.";
            break;
          default:
            errorTitle = "Unexpected Error";
            errorDescription = error.response.data.error || 
              "An unexpected error occurred while processing your request.";
        }
      } else if (error.request) {
        // The request was made but no response was received
        errorTitle = "Network Error";
        errorDescription = "No response received from the server. Please check your internet connection.";
      } else {
        // Something happened in setting up the request
        errorTitle = "Request Setup Error";
        errorDescription = error.message || "An error occurred while preparing the request.";
      }
  
      toast({
        title: errorTitle,
        description: errorDescription,
        variant: "destructive",
      })
    } finally {
      setIsContactingAdmin(false)
    }
  }

  const removeFile = (fileToRemove: File) => {
    const currentFiles = adminContactForm.getValues('files') || []
    const updatedFiles = currentFiles.filter(file => file !== fileToRemove)
    adminContactForm.setValue('files', updatedFiles)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
      {/* Navigation Loading Overlay */}
      {isNavigating && (
        <div className="fixed inset-0 z-50 bg-white/50 backdrop-blur-sm">
          <div className="absolute top-0 left-0 w-full h-1">
            <div className="h-full bg-orange-600 animate-[loading_1s_ease-in-out_infinite]" />
          </div>
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-lg">
        <div className="flex flex-col items-center space-y-2">
          <Image
            src="/img/circlelogo.jpg"
            alt="Logo"
            width={70}
            height={70}
            className="rounded-full border-2 border-gray-200"
          />
          <h1 className="text-2xl font-bold">Reset Password</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email or Student ID</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter your email or student ID" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full bg-orange-600 hover:bg-orange-500"
              disabled={isLoading || isNavigating}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Request Password Reset"
              )}
            </Button>
          </form>
        </Form>

        {/* Links for navigation */}
        <div className="flex items-center justify-between text-sm mt-4">
          <Link
            href="/login"
            className="text-orange-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setIsNavigating(true);
              router.push('/login');
            }}
          >
            Go Back to Login
          </Link>
          <Link
            href="/enrollment"
            className="text-orange-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setIsNavigating(true);
              router.push('/enrollment');
            }}
          >
            Don't have an account? Enroll Now!
          </Link>
        </div>

        {/* Admin Contact Section */}
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>If you have forgotten your email or student ID, 
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="link" className="text-blue-500 p-0 ml-1">
                  contact the admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Contact Admin</DialogTitle>
                  <DialogDescription>
                    Have trouble accessing your account? Tell us more about your issue.
                  </DialogDescription>
                </DialogHeader>
                <Form {...adminContactForm}>
                  <form onSubmit={adminContactForm.handleSubmit(handleAdminContact)} className="space-y-4">
                    <FormField
                      control={adminContactForm.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Your Message</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Describe your issue in detail (minimum 10 characters)"
                              {...field}
                              className="min-h-[120px]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={adminContactForm.control}
                      name="files"
                      render={({ field: { value, onChange } }) => (
                        <FormItem>
                          <FormLabel>Attach Files (PDF, Images)</FormLabel>
                          <FormControl>
                            <div className="flex flex-col space-y-2">
                              <div className="flex items-center space-x-2">
                                <Input
                                  type="file"
                                  accept={ALLOWED_FILE_TYPES.join(',')}
                                  multiple
                                  className="hidden"
                                  id="file-upload"
                                  onChange={(e) => {
                                    const files = e.target.files ? Array.from(e.target.files) : []
                                    const currentFiles = value || []
                                    onChange([...currentFiles, ...files])
                                    e.target.value = '' // Reset input
                                  }}
                                />
                                <label 
                                  htmlFor="file-upload" 
                                  className="cursor-pointer flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition"
                                >
                                  <Upload className="mr-2 h-4 w-4" />
                                  Add Files
                                </label>
                                <span className="text-sm text-gray-500">
                                  Max 5MB per file
                                </span>
                              </div>

                              {value && value.length > 0 && (
                                <div className="space-y-2">
                                  {value.map((file, index) => (
                                    <div 
                                      key={index} 
                                      className="flex items-center justify-between p-2 bg-gray-100 rounded-md"
                                    >
                                      <div className="flex items-center space-x-2">
                                        <FileText className="h-5 w-5 text-blue-500" />
                                        <span className="text-sm">{file.name}</span>
                                        <span className="text-xs text-gray-500">
                                          ({(file.size / 1024).toFixed(1)} KB)
                                        </span>
                                      </div>
                                      <Button 
                                        variant="ghost" 
                                        size="sm" 
                                        onClick={() => removeFile(file)}
                                        className="hover:bg-red-50"
                                      >
                                        <X className="h-4 w-4 text-red-500" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full bg-blue-600 hover:bg-blue-500"
                      disabled={isContactingAdmin}
                    >
                      {isContactingAdmin ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Send Message to Admin
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            {" "}for further assistance.
          </p>
        </div>

        <div className="text-center text-sm text-gray-500 mt-4">
          © {new Date().getFullYear()} Benedicto College. All rights reserved.
        </div>
      </div>

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