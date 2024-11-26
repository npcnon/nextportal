// Types for grade entries
export type GradeType = 'Prelim' | 'Midterm' | 'Final';

export interface GradeEntry {
  studentgradeid: number;
  studentName: string;
  subjectcode: string;
  semester: string;
  year: string;
  grades: Partial<Record<GradeType, string | null>>;
}

// Utility function to normalize grades
export function normalizeGrades(grades: Partial<Record<GradeType, string | null>>): Partial<Record<GradeType, string | null>> {
  return {
    Prelim: grades.Prelim ?? null,
    Midterm: grades.Midterm ?? null,
    Final: grades.Final ?? null
  };
}

// Utility to check if a grade is available
export function isGradeAvailable(grade: string | null | undefined): boolean {
  return grade !== null && grade !== undefined && grade.trim() !== '';
}

// Utility to get grade status
export function getGradeStatus(grades: Partial<Record<GradeType, string | null>>): Record<GradeType, 'pending' | 'graded'> {
  return {
    Prelim: isGradeAvailable(grades.Prelim) ? 'graded' : 'pending',
    Midterm: isGradeAvailable(grades.Midterm) ? 'graded' : 'pending',
    Final: isGradeAvailable(grades.Final) ? 'graded' : 'pending'
  };
}

// Example usage of transformed grades
export function transformGradesData(originalGrades: GradeEntry[]): GradeEntry[] {
  return originalGrades.map(entry => ({
    ...entry,
    grades: {
      Prelim: entry.grades.Prelim === "5.0" ? "N/A" : entry.grades.Prelim,
      Midterm: entry.grades.Midterm === "5.0" ? "N/A" : entry.grades.Midterm,
      Final: entry.grades.Final === "5.0" ? "N/A" : entry.grades.Final
    }
  }));
}