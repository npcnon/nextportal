// app/login/page.tsx
"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import Image from "next/image"
import Link from "next/link"
import { Loader2 } from "lucide-react"
import { useToast } from '@/hooks/use-toast'

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
import { Checkbox } from "@/components/ui/checkbox"
import apiClient, { clearAuthTokens } from "@/lib/axios"
import { useStudentProfileStore } from "@/lib/profile-store"

const formSchema = z.object({
  identifier: z.string().min(1, "Username or email is required"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().default(false),
})

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)
  const { toast } = useToast()
  const setProfile = useStudentProfileStore(state => state.setProfile)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      identifier: "",
      password: "",
      remember: false,
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true)
      // Clear existing tokens before attempting login
      clearAuthTokens()
      console.log(`identifier: ${values.identifier}, password:${values.password}`)
      const response = await apiClient.post('/login', {
        identifier: values.identifier,
        password: values.password,
      })

      localStorage.setItem('access_token', response.data.access_token)
      localStorage.setItem('refresh_token', response.data.refresh_token)

      const userResponse = await apiClient.get("/user")
      setProfile(userResponse.data);
      console.log(userResponse.data);
      // Handle user data storage here (e.g., using a state management solution)
      
      toast({
        title: "Success!",
        description: "Successfully logged in!",
        variant: "default",
        className: "bg-green-500 text-white",
      })
      
      // Show navigation loading before redirect
      setIsNavigating(true)
      router.push('/dashboard')
    } catch (error: any) {
      toast({
        title: "Failed to login. Please try again.",
        description: error.response?.data?.detail,
        variant: "destructive",
      })
      setIsLoading(false)
    }
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
          <h1 className="text-2xl font-bold">Login</h1>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="identifier"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student ID or Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your ID or email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="Enter your password" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="remember"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="text-sm font-normal">Remember me</FormLabel>
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
                "Sign In"
              )}
            </Button>
          </form>
        </Form>

        <div className="flex items-center justify-between text-sm">
          <Link
            href="/forgot-password"
            className="text-orange-600 hover:underline"
            onClick={(e) => {
              e.preventDefault();
              setIsNavigating(true);
              router.push('/forgot-password');
            }}
          >
            Forgot password?
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

        <div className="text-center text-sm text-gray-500">
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