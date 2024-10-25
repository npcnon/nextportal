// components/providers/providers.tsx
'use client';

import React from 'react';
import { ProfileProvider } from './profile-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ProfileProvider>
      {children}
    </ProfileProvider>
  );
}