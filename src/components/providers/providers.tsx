// components/providers/providers.tsx
'use client';

import React from 'react';
import { ProfileProvider } from './profile-provider';
import { HeaderProvider } from './header-provider';

interface ProvidersProps {
  children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  return (
    <HeaderProvider>
      <ProfileProvider>
        {children}
      </ProfileProvider>
    </HeaderProvider>
  );
}