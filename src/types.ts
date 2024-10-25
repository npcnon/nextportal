// types.ts
export interface StudentInfo {
    firstName: string;
    middleName: string;
    lastName: string;
    suffix?: string;
    sex: string;
    birthDate: string;
    email: string;
    contactNumber: string;
    cityAddress: string;
    provinceAddress: string;
  }
  
  export interface ParentInfo {
    firstName: string;
    lastName: string;
    occupation: string;
    contactNumber: string;
  }
  
  export interface AcademicInfo {
    schoolName: string;
    yearGraduated: number;
    schoolAddress: string;
  }
  
  export interface RegistrationFormData {
    personalInfo: StudentInfo;
    familyInfo: {
      father: ParentInfo;
      mother: ParentInfo;
    };
    academicInfo: {
      elementary: AcademicInfo;
      highSchool: AcademicInfo;
    };
  }