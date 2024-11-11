// lib/fulldata-store.ts
import { create } from 'zustand'
import apiClient from './axios';
import axios from 'axios';
import { useStudentProfileStore } from './profile-store';

interface PersonalData {
  fulldata_applicant_id: number;
  f_name: string;
  m_name: string;
  suffix: string;
  l_name: string;
  sex: string;
  birth_date: string;
  birth_place: string;
  marital_status: string;
  religion: string;
  country: string;
  email: string;
  acr: string;
  status: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  basicdata_applicant_id: number;
}

interface AddPersonalData {
  id: number;
  city_address: string;
  province_address: string;
  contact_number: string;
  city_contact_number: string;
  province_contact_number: string;
  citizenship: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  fulldata_applicant_id: number;
}

interface FamilyBackground {
  id: number;
  fulldata_applicant_id: number;
  father_fname: string | null;
  father_mname: string | null;
  father_lname: string | null;
  father_contact_number: string | null;
  father_email: string | null;
  father_occupation: string | null;
  father_income: number | null;
  father_company: string | null;
  mother_fname: string | null;
  mother_mname: string | null;
  mother_lname: string | null;
  mother_contact_number: string | null;
  mother_email: string | null;
  mother_occupation: string | null;
  mother_income: number | null;
  mother_company: string | null;
  guardian_fname: string | null;
  guardian_mname: string | null;
  guardian_lname: string | null;
  guardian_relation: string | null;
  guardian_contact_number: string | null;
  guardian_email: string | null;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface AcademicBackground {
  id: number;
  fulldata_applicant_id: number;
  major_in: string | null;
  student_type: string;
  year_entry: number;
  year_level: string;
  year_graduate: number;
  application_type: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  program: number;
  semester_entry: number;
}

interface AcademicHistory {
  id: number;
  fulldata_applicant_id: number;
  elementary_school: string;
  elementary_address: string;
  elementary_honors: string;
  elementary_graduate: number;
  junior_highschool: string;
  junior_address: string;
  junior_honors: string;
  junior_graduate: number;
  senior_highschool: string;
  senior_address: string;
  senior_honors: string;
  senior_graduate: number;
  ncae_grade: string;
  ncae_year_taken: number | null;
  latest_college: string;
  college_address: string;
  college_honors: string;
  program: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

interface StudentState {
  personal_data: PersonalData[];
  add_personal_data: AddPersonalData[];
  family_background: FamilyBackground[];
  academic_background: AcademicBackground[];
  academic_history: AcademicHistory[];
  isInitialized: boolean; 
  isLoading: boolean;
  error: string | null;
}

interface StudentActions {
  setPersonalData: (data: PersonalData[]) => void;
  setAddPersonalData: (data: AddPersonalData[]) => void;
  setFamilyBackground: (data: FamilyBackground[]) => void;
  setAcademicBackground: (data: AcademicBackground[]) => void;
  setAcademicHistory: (data: AcademicHistory[]) => void;
  fetchStudentData: (basicDataApplicantId: number) => Promise<void>;
  clearStudentData: () => Promise<void>;
  updatePersonalData: (data: Partial<PersonalData>) => Promise<void>;
  resetStore: () => void;
}

const initialState: StudentState = {
  personal_data: [],
  add_personal_data: [],
  family_background: [],
  academic_background: [],
  academic_history: [],
  isInitialized: false, 
  isLoading: false,
  error: null,
};

export const useFullDataStore = create<StudentState & StudentActions>((set, get) => ({
  ...initialState,
  setPersonalData: (data) => set({ personal_data: data }),
  setAddPersonalData: (data) => set({ add_personal_data: data }),
  setFamilyBackground: (data) => set({ family_background: data }),
  setAcademicBackground: (data) => set({ academic_background: data }),
  setAcademicHistory: (data) => set({ academic_history: data }),

  fetchStudentData: async (basicDataApplicantId: number) => {
    try {
        console.log(`FETCH IS USED`)
        set({ isLoading: true, error: null });
        
        const response = await apiClient.get(
            `http://127.0.0.1:8000/api/full-student-data/?filter=basicdata_applicant_id=${basicDataApplicantId}`
        );
        const data = await response.data;
        
        set({
            personal_data: data.personal_data,
            add_personal_data: data.add_personal_data,
            family_background: data.family_background,
            academic_background: data.academic_background,
            academic_history: data.academic_history,
            isLoading: false,
            isInitialized: true, 
        });
        } catch (error) {
            if (axios.isAxiosError(error)) {
                set({ 
                    error: error.response?.data?.message || 'Failed to fetch student data', 
                    isLoading: false,
                    isInitialized: true, 
                });
            } else {
                set({ 
                    error: 'An unexpected error occurred', 
                    isLoading: false,
                    isInitialized: true, 
                });
            }
        }
    },

  clearStudentData: async () => {
    console.log("clearProfile is triggered");
    set(() => ({
      personal_data: [],
      add_personal_data: [],
      family_background: [],
      academic_background: [],
      academic_history: [],
      isInitialized: false, 
      isLoading: false,
      error: null,
    }));
},

  updatePersonalData: async (data) => {
    try {
      set({ isLoading: true, error: null });
      const response = await fetch('/api/student-data', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) throw new Error('Failed to update personal data');
      
      const updatedData = await response.json();
      set({ personal_data: [updatedData], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update personal data', isLoading: false });
    }
  },

  resetStore: () => {
    set(initialState);
  },
}));