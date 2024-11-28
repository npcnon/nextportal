// page.tsx or page.js
import React, { Suspense } from "react"
import PasswordResetConfirmPage from "@/components/recoverpass/pass-reset-confirm-page"

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <PasswordResetConfirmPage />
    </Suspense>
  )
}
