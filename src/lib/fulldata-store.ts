// lib/fulldata-store.ts
import { create } from 'zustand'
import apiClient from './clients/authenticated-api-client';
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
  isEnlistedThisSemester: boolean;
  currentSemester: number | null; // Add this
  
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

interface EnlistedStudent {
  id: number;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  semester_id: number;
  fulldata_applicant_id: number;
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
  isEnlistedThisSemester: false,
  currentSemester: null,
};


export const useFullDataStore = create<StudentState & StudentActions>((set, get) => ({
  ...initialState,
  setPersonalData: (data) => set({ personal_data: data }),
  setAddPersonalData: (data) => set({ add_personal_data: data }),
  setFamilyBackground: (data) => set({ family_background: data }),
  setAcademicBackground: (data) => set({ academic_background: data }),
  setAcademicHistory: (data) => set({ academic_history: data }),

// In the fetchStudentData function, modify the enlisted student check:
  fetchStudentData: async () => {
    try {
      // Get profile store state
      const profileStore = useStudentProfileStore.getState();
      
      // Check if profile store is properly initialized
      if (!profileStore.profileData || !profileStore.profileData.fulldata_applicant_id || profileStore.isLoadingProfile) {
        console.log('Waiting for profile store to be initialized...');
        return;
      }

      const fullDataApplicantId = profileStore.profileData.fulldata_applicant_id;
      const campusId = profileStore.profileData.profile.student_info.campus;
      
      console.log(`FETCHING FULL DATA for ID: ${fullDataApplicantId}`);
      set({ isLoading: true, error: null });
      
      // Fetch full student data
      const fullDataResponse = await apiClient.get(
        `full-student-data/?filter=fulldata_applicant_id=${fullDataApplicantId}`
      );

      // First fetch current semester
      try {
        const semesterResponse = await apiClient.get(`semester/?campus_id=${campusId}`);
        const currentSemester = semesterResponse.data.results[0]?.id;
        
        if (!currentSemester) {
          console.log('No active semester found');
          set({ isEnlistedThisSemester: false });
        } else {
          // Then check if student is enlisted for current semester
          const enrolledResponse = await apiClient.get<EnlistedStudent[]>(
            `enlisted-students/?filter=fulldata_applicant_id=${fullDataApplicantId}`
          );
          
          const enrolledStudent = enrolledResponse.data.find(
            (student: EnlistedStudent) => 
              Number(student.fulldata_applicant_id) === Number(fullDataApplicantId) &&
              Number(student.semester_id) === Number(currentSemester)
          );

          if (enrolledStudent) {
            console.log('Student is enrolled for current semester:', enrolledStudent);
            set({ 
              isEnlistedThisSemester: true,
              currentSemester: currentSemester 
            });
          } else {
            console.log('Student is not enrolled for current semester');
            set({ 
              isEnlistedThisSemester: false,
              currentSemester: currentSemester
            });
          }
        }
      } catch (error) {
        console.error('Error checking enrollment status:', error);
        set({ 
          isEnlistedThisSemester: false,
          currentSemester: null
        });
      }
      
      const data = fullDataResponse.data;
      
      set({
        personal_data: data.personal_data,
        add_personal_data: data.add_personal_data,
        family_background: data.family_background,
        academic_background: data.academic_background,
        academic_history: data.academic_history,
        isLoading: false,
        isInitialized: true,
      });
      
      console.log(`initial state: ${JSON.stringify(initialState, null, 2)}`);
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
      const response = await apiClient.put('/api/student-data', {
        headers: {
          'Content-Type': 'application/json',
        },
        body: data,
      });
      
      if (!response.data.ok) throw new Error('Failed to update personal data');
      
      const updatedData = await response.data;
      set({ personal_data: [updatedData], isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update personal data', isLoading: false });
    }
  },

  resetStore: () => {
    set(initialState);
  },
}));


