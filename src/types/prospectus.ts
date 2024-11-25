// lib/types/prospectus.ts
export interface Prerequisite {
    pre_requisite_id: number;
    course_id: number;
    courseCode: string;
    courseDescription: string;
    unit: number;
  }
  
  export interface ProspectusSubject {
    prospectus_subject_id: number;
    prospectus_id: number;
    yearLevel: string;
    semesterName: string;
    course_id: number;
    program_id: number;
    programCode: string;
    programDescription: string;
    course_department_id: number;
    departmentCode: string;
    departmentName: string;
    isActive: boolean;
    isDeleted: boolean;
    createdAt: string;
    updatedAt: string;
    courseCode: string;
    courseDescription: string;
    unit: number;
    prerequisites: Prerequisite[];
    campusName: string;
  }