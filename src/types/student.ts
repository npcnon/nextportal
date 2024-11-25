// types/student.ts
export interface Student {
    fulldata_applicant_id: number;
    f_name: string;
    m_name: string;
    l_name: string;
    sex: string;
    email: string;
    status: string;
    birth_date: string;
    country: string;
    is_active: boolean;
  }
  
  export interface StudentData {
    personal_data: Student[];
    add_personal_data: any[];
    family_background: any[];
    academic_background: any[];
    academic_history: any[];
  }