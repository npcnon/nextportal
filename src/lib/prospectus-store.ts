// lib/prospectus-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { ProspectusSubject } from '@/types/prospectus';
import { getProspectusSubjects } from './clients/prospectus-client';

interface ProspectusStore {
  prospectusSubjects: ProspectusSubject[];
  isLoading: boolean;
  fetchProspectusSubjects: (programCode: string) => Promise<void>;
  clearProspectusSubjects: () => void;
}

export const useProspectusStore = create<ProspectusStore>()(
  devtools((set) => ({
    prospectusSubjects: [],
    isLoading: false,
    fetchProspectusSubjects: async (programCode) => {
      set({ isLoading: true });
      try {
        const subjects = await getProspectusSubjects(programCode);
        set({ prospectusSubjects: subjects, isLoading: false });
      } catch (error) {
        set({ prospectusSubjects: [], isLoading: false });
      }
    },
    clearProspectusSubjects: () => {
      set({ prospectusSubjects: [], isLoading: false });
    }
  }))
);