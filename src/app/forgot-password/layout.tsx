//forgot pass layout

import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Password Reset App',
  description: 'Secure password reset application',
}

export default function ForgotPasswordLayout({
    children,
  }: {
    children: React.ReactNode
  }) {
    return (
      <div className="min-h-screen flex flex-col">
        <main className="flex-grow flex items-center justify-center bg-gray-100">
        <div className="w-full">
        {children}
        </div>
        </main>
      </div>
    )
  }