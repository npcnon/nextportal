// components/providers/profile-provider.tsx
'use client';

import React, { useEffect } from 'react';
import { useStudentProfileStore } from '@/lib/profile-store';
import { useFullDataStore } from '@/lib/fulldata-store';
import apiClient from '@/lib/axios';
import { useRouter } from 'next/navigation';

interface ProfileProviderProps {
  children: React.ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const setProfile = useStudentProfileStore(state => state.setProfile);
  const fetchStudentData = useFullDataStore(state => state.fetchStudentData);
  const router = useRouter();
  const profileData = useStudentProfileStore(state => state.profileData);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const userResponse = await apiClient.get("/user");
        setProfile(userResponse.data);
        await fetchStudentData(profileData.profile.student_info.basicdata_applicant_id);;
      } catch (error) {
        console.error("Failed to fetch profile:", error);
        // Redirect to login page if unauthorized
        router.push('/login');
      }
    };

    fetchProfile();
  }, [setProfile, fetchStudentData, router]);

  return <>{children}</>;
}