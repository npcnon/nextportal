// components/providers/header-provider.tsx
'use client';

import React, { createContext, useContext, useState } from 'react';

interface ProfilePicture {
  id: number;
  type: string;
  temporary_url?: string;
}

interface HeaderContextType {
  profilePicture: ProfilePicture | null;
  setProfilePicture: (picture: ProfilePicture | null) => void;
  isLoadingPicture: boolean;
  setIsLoadingPicture: (loading: boolean) => void;
}

const HeaderContext = createContext<HeaderContextType | null>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [profilePicture, setProfilePicture] = useState<ProfilePicture | null>(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);

  return (
    <HeaderContext.Provider 
      value={{
        profilePicture,
        setProfilePicture,
        isLoadingPicture,
        setIsLoadingPicture
      }}
    >
      {children}
    </HeaderContext.Provider>
  );
}

export const useHeader = () => {
  const context = useContext(HeaderContext);
  if (!context) {
    throw new Error('useHeader must be used within a HeaderProvider');
  }
  return context;
};