// context/header-context.tsx
import { createContext, useContext, useState } from 'react';

const HeaderContext = createContext<any>(null);

export function HeaderProvider({ children }: { children: React.ReactNode }) {
  const [profilePicture, setProfilePicture] = useState(null);
  const [isLoadingPicture, setIsLoadingPicture] = useState(true);
  
  return (
    <HeaderContext.Provider value={{
      profilePicture,
      setProfilePicture,
      isLoadingPicture,
      setIsLoadingPicture
    }}>
      {children}
    </HeaderContext.Provider>
  );
}

export const useHeader = () => useContext(HeaderContext);

