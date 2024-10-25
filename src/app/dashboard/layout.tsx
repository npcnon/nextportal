// app/(dashboard)/layout.tsx
import { DashboardHeader } from '@/components/layout/dashboard-header';
import { Providers } from "@/components/providers/providers"


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <Providers>
        {children}
        </Providers>
      </main>
    </div>
  );
}