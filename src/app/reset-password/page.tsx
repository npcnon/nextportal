"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import unauthenticatedApiClient from "@/lib/clients/unauthenticated-api-client"
import { Eye, EyeOff, Loader2 } from "lucide-react"
import Link from "next/link"

const formSchema = z.object({
  newPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters." })
    .max(50, { message: "Password must be less than 50 characters." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
})

export default function PasswordResetConfirmPage() {
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token")

  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isNavigating, setIsNavigating] = useState(false)

  const togglePasswordVisibility = () => setShowPassword(!showPassword)
  const toggleConfirmPasswordVisibility = () => setShowConfirmPassword(!showConfirmPassword)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      const response = await unauthenticatedApiClient.post("password-reset-confirm", {
        reset_token: token,
        new_password: values.newPassword,
        confirm_password: values.confirmPassword,
      })

      toast({
        title: "Success",
        description: response.data.message,
        variant: "default",
      })

      setIsNavigating(true)
      router.push("/login")
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.response?.data?.detail || "An error occurred during password reset",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 to-gray-800">
        <Card className="w-full max-w-md bg-white rounded-xl shadow-lg">
          <CardHeader>
            <CardTitle className="text-red-600">Invalid Reset Link</CardTitle>
          </CardHeader>
          <CardContent>
            <p>The password reset link is invalid or has expired. Please request a new password reset.</p>
          </CardContent>
        </Card>
      </div>
    )
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

      <Card className="w-full max-w-md bg-white rounded-xl shadow-lg">
        <CardHeader>
          <CardTitle className="text-black text-2xl font-bold">Confirm Password Reset</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          placeholder="Enter new password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={togglePasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormDescription>Password must be at least 8 characters long</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-black">Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="Confirm new password"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={toggleConfirmPasswordVisibility}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-500"
                        >
                          {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <Loader2 className="animate-spin mr-2" />
                    Resetting...
                  </span>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </Form>

          {/* Go Back to Login Link */}
          <div className="mt-4 text-center">
            <Link
              href="/login"
              className="text-orange-600 hover:underline"
              onClick={(e) => {
                e.preventDefault();
                setIsNavigating(true);
                router.push("/login");
              }}
            >
              Go Back to Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
