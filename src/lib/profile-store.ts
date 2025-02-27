// lib/profile-store.ts
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export interface StudentProfile {
    basicdata_applicant_id: number;
    address: string;
    birth_date: string;
    campus: number;
    contact_number: string;
    email: string;
    first_name: string;
    is_transferee: boolean;
    last_name: string;
    middle_name: string;
    program: number;
    sex: string;
    suffix: string | null;
    year_level: string;
    created_at: string;
}
  
export interface ProfileData { 
    id: number;
    name: string;
    email: string;
    student_id: string | null;
    profile: {
      student_info: StudentProfile;
    };
    fulldata_applicant_id: number;
}

interface StudentProfileStore {
    profileData: ProfileData;
    isLoadingProfile: boolean; // Add loading state
    iscleared: boolean;
    setProfile: (update: ((prev: ProfileData) => ProfileData) | ProfileData) => void;
    clearProfile: () => void;
    setLoading: (loading: boolean) => void; // Add setter for loading state
}

// Create initial state as a constant for reuse
const initialProfileState: ProfileData = {
    id: 0,
    name: '',
    email: '',
    student_id: '',
    profile: {
        student_info: {
            basicdata_applicant_id: 0,
            address: '',
            birth_date: '',
            campus: 1,
            contact_number: '',
            email: '',
            first_name: '',
            is_transferee: false,
            last_name: '',
            middle_name: '',
            program: 0,
            sex: '',
            suffix: null,
            year_level: '',
            created_at: '',
        },
    },
    fulldata_applicant_id:0,
};

export const useStudentProfileStore = create<StudentProfileStore>()(
    devtools((set) => ({
        profileData: initialProfileState,
        isLoadingProfile: true, // Initialize as true if data needs to be loaded
        iscleared: false,
        setProfile: (update) => {
            console.log("setProfile is triggered");
            set(state => {
                const newStudentProfile = typeof update === 'function' 
                    ? update(state.profileData) 
                    : update;
                console.log(newStudentProfile);
                return {
                    profileData: newStudentProfile,
                    isLoadingProfile: false // Set loading to false when data is set
                };
            });
        },

        clearProfile: () => {
            console.log("clearProfile is triggered");
            set(() => ({
                profileData: initialProfileState,
                isLoadingProfile: true, // Reset loading state when clearing
                iscleared: true
            }));
        },

        setLoading: (loading: boolean) => {
            set(() => ({ isLoadingProfile: loading }));
        }
    }))
);