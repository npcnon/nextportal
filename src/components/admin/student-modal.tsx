"use client"

import React, { useState } from 'react';
import { 
  Card, CardContent, CardHeader, CardTitle 
} from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";


// Full StudentData interface incorporating all previous interfaces
interface StudentData {
  fulldata_applicant_id: number;
  personal_data: {
    f_name: string;
    m_name?: string;
    l_name: string;
    suffix?: string;
    sex: string;
    birth_date: string;
    birth_place: string;
    marital_status: string;
    religion: string;
    country: string;
    email: string;
    status: string;
    acr?: string;
  };
  add_personal_data: {
    city_address: string;
    province_address?: string;
    contact_number: string;
    city_contact_number?: string;
    province_contact_number?: string;
    citizenship: string;
  };
  family_background: {
    father_fname?: string;
    father_mname?: string;
    father_lname?: string;
    father_contact_number?: string;
    father_email?: string;
    father_occupation?: string;
    father_income?: number;
    father_company?: string;
    mother_fname?: string;
    mother_mname?: string;
    mother_lname?: string;
    mother_contact_number?: string;
    mother_email?: string;
    mother_occupation?: string;
    mother_income?: number;
    mother_company?: string;
    guardian_fname?: string;
    guardian_mname?: string;
    guardian_lname?: string;
    guardian_relation?: string;
    guardian_contact_number?: string;
    guardian_email?: string;
  };
  academic_background: {
    program: number;
    major_in?: string;
    student_type: string;
    semester_entry: number;
    year_level: string;
    year_entry: number;
    year_graduate: number;
    application_type: string;
  };
  academic_history: {
    elementary_school: string;
    elementary_address: string;
    elementary_honors?: string;
    elementary_graduate?: number;
    junior_highschool: string;
    junior_address: string;
    junior_honors?: string;
    junior_graduate?: number;
    senior_highschool: string;
    senior_address: string;
    senior_honors?: string;
    senior_graduate?: number;
    ncae_grade?: string;
    ncae_year_taken?: number;
    latest_college?: string;
    college_address?: string;
    college_honors?: string;
    program?: string;
  };
}

export default function StudentEditModal({ 
    isOpen, 
    onClose, 
    studentData, 
    onSave 
  }: { 
    isOpen: boolean, 
    onClose: () => void, 
    studentData: StudentData, 
    onSave: (updatedData: StudentData) => void 
  }) {
    // Default empty object if data is undefined
    const [editedData, setEditedData] = useState<StudentData>({
      fulldata_applicant_id: studentData?.fulldata_applicant_id || 0,
      personal_data: studentData?.personal_data || {
        f_name: '',
        m_name: '',
        l_name: '',
        suffix: '',
        sex: '',
        birth_date: '',
        birth_place: '',
        marital_status: '',
        religion: '',
        country: '',
        email: '',
        status: '',
        acr: '',
      },
      add_personal_data: studentData?.add_personal_data || {
        city_address: '',
        contact_number: '',
        citizenship: ''
      },
      family_background: studentData?.family_background || {},
      academic_background: studentData?.academic_background || {
        program: 0,
        student_type: '',
        semester_entry: 0,
        year_level: '',
        year_entry: 0,
        year_graduate: 0,
        application_type: ''
      },
      academic_history: studentData?.academic_history || {
        elementary_school: '',
        elementary_address: '',
        junior_highschool: '',
        junior_address: '',
        senior_highschool: '',
        senior_address: ''
      }
    });
  // Generic nested state update function
  const updateNestedState = <K extends keyof StudentData>(
    section: K, 
    field: string, 
    value: any
  ) => {
    setEditedData(prev => ({
      ...prev,
      [section]: {
        ...(prev[section] as object),
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    onSave(editedData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Student Details</DialogTitle>
        </DialogHeader>

        {/* Personal Data Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>First Name</Label>
              <Input 
                value={editedData.personal_data.f_name}
                onChange={(e) => updateNestedState('personal_data', 'f_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Middle Name</Label>
              <Input 
                value={editedData.personal_data.m_name || ''}
                onChange={(e) => updateNestedState('personal_data', 'm_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Last Name</Label>
              <Input 
                value={editedData.personal_data.l_name}
                onChange={(e) => updateNestedState('personal_data', 'l_name', e.target.value)}
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input 
                value={editedData.personal_data.email}
                onChange={(e) => updateNestedState('personal_data', 'email', e.target.value)}
              />
            </div>
            <div>
              <Label>Sex</Label>
              <Select 
                value={editedData.personal_data.sex}
                onValueChange={(value) => updateNestedState('personal_data', 'sex', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select Sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Birth Date</Label>
              <Input 
                type="date"
                value={editedData.personal_data.birth_date}
                onChange={(e) => updateNestedState('personal_data', 'birth_date', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Additional Personal Data Section */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Additional Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>Suffix</Label>
              <Input 
                value={editedData.personal_data.suffix || ''}
                onChange={(e) => updateNestedState('personal_data', 'suffix', e.target.value)}
              />
            </div>
            <div>
              <Label>Birth Place</Label>
              <Input 
                value={editedData.personal_data.birth_place}
                onChange={(e) => updateNestedState('personal_data', 'birth_place', e.target.value)}
              />
            </div>
            <div>
              <Label>Marital Status</Label>
              <Input 
                value={editedData.personal_data.marital_status}
                onChange={(e) => updateNestedState('personal_data', 'marital_status', e.target.value)}
              />
            </div>
            <div>
              <Label>Religion</Label>
              <Input 
                value={editedData.personal_data.religion}
                onChange={(e) => updateNestedState('personal_data', 'religion', e.target.value)}
              />
            </div>
            <div>
              <Label>Country</Label>
              <Input 
                value={editedData.personal_data.country}
                onChange={(e) => updateNestedState('personal_data', 'country', e.target.value)}
              />
            </div>
            <div>
              <Label>Status</Label>
              <Input 
                value={editedData.personal_data.status}
                onChange={(e) => updateNestedState('personal_data', 'status', e.target.value)}
              />
            </div>
            <div>
              <Label>ACR</Label>
              <Input 
                value={editedData.personal_data.acr || ''}
                onChange={(e) => updateNestedState('personal_data', 'acr', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

    {/* Additional Personal Data Section */}
    <Card className="mb-4">
    <CardHeader>
        <CardTitle>Contact and Address Information</CardTitle>
    </CardHeader>
    <CardContent className="grid grid-cols-3 gap-4">
        <div>
        <Label>City Address</Label>
        <Input 
            value={editedData.add_personal_data.city_address}
            onChange={(e) => updateNestedState('add_personal_data', 'city_address', e.target.value)}
        />
        </div>
        <div>
        <Label>Province Address</Label>
        <Input 
            value={editedData.add_personal_data.province_address || ''}
            onChange={(e) => updateNestedState('add_personal_data', 'province_address', e.target.value)}
        />
        </div>
        <div>
        <Label>Contact Number</Label>
        <Input 
            value={editedData.add_personal_data.contact_number}
            onChange={(e) => updateNestedState('add_personal_data', 'contact_number', e.target.value)}
        />
        </div>
        <div>
        <Label>City Contact Number</Label>
        <Input 
            value={editedData.add_personal_data.city_contact_number || ''}
            onChange={(e) => updateNestedState('add_personal_data', 'city_contact_number', e.target.value)}
        />
        </div>
        <div>
        <Label>Province Contact Number</Label>
        <Input 
            value={editedData.add_personal_data.province_contact_number || ''}
            onChange={(e) => updateNestedState('add_personal_data', 'province_contact_number', e.target.value)}
        />
        </div>
        <div>
        <Label>Citizenship</Label>
        <Input 
            value={editedData.add_personal_data.citizenship}
            onChange={(e) => updateNestedState('add_personal_data', 'citizenship', e.target.value)}
        />
        </div>
    </CardContent>
    </Card>

        {/* Family Background Section Expansion */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Extended Family Background</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>Father's Middle Name</Label>
              <Input 
                value={editedData.family_background.father_mname || ''}
                onChange={(e) => updateNestedState('family_background', 'father_mname', e.target.value)}
              />
            </div>
            <div>
              <Label>Father's Contact Number</Label>
              <Input 
                value={editedData.family_background.father_contact_number || ''}
                onChange={(e) => updateNestedState('family_background', 'father_contact_number', e.target.value)}
              />
            </div>
            <div>
              <Label>Father's Email</Label>
              <Input 
                value={editedData.family_background.father_email || ''}
                onChange={(e) => updateNestedState('family_background', 'father_email', e.target.value)}
              />
            </div>
            <div>
              <Label>Father's Income</Label>
              <Input 
                type="number"
                value={editedData.family_background.father_income || ''}
                onChange={(e) => updateNestedState('family_background', 'father_income', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Father's Company</Label>
              <Input 
                value={editedData.family_background.father_company || ''}
                onChange={(e) => updateNestedState('family_background', 'father_company', e.target.value)}
              />
            </div>
            <div>
              <Label>Mother's Middle Name</Label>
              <Input 
                value={editedData.family_background.mother_mname || ''}
                onChange={(e) => updateNestedState('family_background', 'mother_mname', e.target.value)}
              />
            </div>
            <div>
              <Label>Mother's Contact Number</Label>
              <Input 
                value={editedData.family_background.mother_contact_number || ''}
                onChange={(e) => updateNestedState('family_background', 'mother_contact_number', e.target.value)}
              />
            </div>
            <div>
              <Label>Mother's Email</Label>
              <Input 
                value={editedData.family_background.mother_email || ''}
                onChange={(e) => updateNestedState('family_background', 'mother_email', e.target.value)}
              />
            </div>
            <div>
              <Label>Mother's Income</Label>
              <Input 
                type="number"
                value={editedData.family_background.mother_income || ''}
                onChange={(e) => updateNestedState('family_background', 'mother_income', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Mother's Company</Label>
              <Input 
                value={editedData.family_background.mother_company || ''}
                onChange={(e) => updateNestedState('family_background', 'mother_company', e.target.value)}
              />
            </div>
            
            {/* Guardian Information */}
            <div>
              <Label>Guardian's First Name</Label>
              <Input 
                value={editedData.family_background.guardian_fname || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_fname', e.target.value)}
              />
            </div>
            <div>
              <Label>Guardian's Middle Name</Label>
              <Input 
                value={editedData.family_background.guardian_mname || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_mname', e.target.value)}
              />
            </div>
            <div>
              <Label>Guardian's Last Name</Label>
              <Input 
                value={editedData.family_background.guardian_lname || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_lname', e.target.value)}
              />
            </div>
            <div>
              <Label>Guardian's Relation</Label>
              <Input 
                value={editedData.family_background.guardian_relation || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_relation', e.target.value)}
              />
            </div>
            <div>
              <Label>Guardian's Contact Number</Label>
              <Input 
                value={editedData.family_background.guardian_contact_number || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_contact_number', e.target.value)}
              />
            </div>
            <div>
              <Label>Guardian's Email</Label>
              <Input 
                value={editedData.family_background.guardian_email || ''}
                onChange={(e) => updateNestedState('family_background', 'guardian_email', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic Background Section Expansion */}
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>Extended Academic Background</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-3 gap-4">
            <div>
              <Label>Program</Label>
              <Input 
                type="number"
                value={editedData.academic_background.program}
                onChange={(e) => updateNestedState('academic_background', 'program', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Major In</Label>
              <Input 
                value={editedData.academic_background.major_in || ''}
                onChange={(e) => updateNestedState('academic_background', 'major_in', e.target.value)}
              />
            </div>
            <div>
              <Label>Semester Entry</Label>
              <Input 
                type="number"
                value={editedData.academic_background.semester_entry}
                onChange={(e) => updateNestedState('academic_background', 'semester_entry', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Year Level</Label>
              <Input 
                value={editedData.academic_background.year_level}
                onChange={(e) => updateNestedState('academic_background', 'year_level', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Year entry</Label>
              <Input 
                type="number"
                value={editedData.academic_background.year_entry}
                onChange={(e) => updateNestedState('academic_background', 'year_entry', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Year Graduate</Label>
              <Input 
                type="number"
                value={editedData.academic_background.year_graduate}
                onChange={(e) => updateNestedState('academic_background', 'year_graduate', Number(e.target.value))}
              />
            </div>
            <div>
              <Label>Application Type</Label>
              <Input 
                value={editedData.academic_background.application_type}
                onChange={(e) => updateNestedState('academic_background', 'application_type', e.target.value)}
              />
            </div>
            <div>
              <Label>Student Type</Label>
              <Input 
                value={editedData.academic_background.student_type}
                onChange={(e) => updateNestedState('academic_background', 'student_type', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Academic History Section Expansion */}
        <Card className="mb-4">
        <CardHeader>
            <CardTitle>Extended Academic History</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-3 gap-4">
            <div>
            <Label>Elementary School</Label>
            <Input 
                value={editedData.academic_history.elementary_school}
                onChange={(e) => updateNestedState('academic_history', 'elementary_school', e.target.value)}
            />
            </div>
            <div>
            <Label>Elementary Address</Label>
            <Input 
                value={editedData.academic_history.elementary_address}
                onChange={(e) => updateNestedState('academic_history', 'elementary_address', e.target.value)}
            />
            </div>
            <div>
            <Label>Elementary Honors</Label>
            <Input 
                value={editedData.academic_history.elementary_honors || ''}
                onChange={(e) => updateNestedState('academic_history', 'elementary_honors', e.target.value)}
            />
            </div>
            <div>
            <Label>Elementary Graduate Year</Label>
            <Input 
                type="number"
                value={editedData.academic_history.elementary_graduate || ''}
                onChange={(e) => updateNestedState('academic_history', 'elementary_graduate', Number(e.target.value))}
            />
            </div>
            
            <div>
            <Label>Junior High School</Label>
            <Input 
                value={editedData.academic_history.junior_highschool}
                onChange={(e) => updateNestedState('academic_history', 'junior_highschool', e.target.value)}
            />
            </div>
            <div>
            <Label>Junior High Address</Label>
            <Input 
                value={editedData.academic_history.junior_address}
                onChange={(e) => updateNestedState('academic_history', 'junior_address', e.target.value)}
            />
            </div>
            <div>
            <Label>Junior High Honors</Label>
            <Input 
                value={editedData.academic_history.junior_honors || ''}
                onChange={(e) => updateNestedState('academic_history', 'junior_honors', e.target.value)}
            />
            </div>
            <div>
            <Label>Junior High Graduate Year</Label>
            <Input 
                type="number"
                value={editedData.academic_history.junior_graduate || ''}
                onChange={(e) => updateNestedState('academic_history', 'junior_graduate', Number(e.target.value))}
            />
            </div>
            
            <div>
            <Label>Senior High School</Label>
            <Input 
                value={editedData.academic_history.senior_highschool}
                onChange={(e) => updateNestedState('academic_history', 'senior_highschool', e.target.value)}
            />
            </div>
            <div>
            <Label>Senior High Address</Label>
            <Input 
                value={editedData.academic_history.senior_address}
                onChange={(e) => updateNestedState('academic_history', 'senior_address', e.target.value)}
            />
            </div>
            <div>
            <Label>Senior High Honors</Label>
            <Input 
                value={editedData.academic_history.senior_honors || ''}
                onChange={(e) => updateNestedState('academic_history', 'senior_honors', e.target.value)}
            />
            </div>
            <div>
            <Label>Senior High Graduate Year</Label>
            <Input 
                type="number"
                value={editedData.academic_history.senior_graduate || ''}
                onChange={(e) => updateNestedState('academic_history', 'senior_graduate', Number(e.target.value))}
            />
            </div>

            <div>
            <Label>NCAE Grade</Label>
            <Input 
                value={editedData.academic_history.ncae_grade || ''}
                onChange={(e) => updateNestedState('academic_history', 'ncae_grade', e.target.value)}
            />
            </div>
            <div>
            <Label>NCAE Year Taken</Label>
            <Input 
                type="number"
                value={editedData.academic_history.ncae_year_taken || ''}
                onChange={(e) => updateNestedState('academic_history', 'ncae_year_taken', Number(e.target.value))}
            />
            </div>
            <div>
            <Label>Latest College</Label>
            <Input 
                value={editedData.academic_history.latest_college || ''}
                onChange={(e) => updateNestedState('academic_history', 'latest_college', e.target.value)}
            />
            </div>
            <div>
            <Label>College Address</Label>
            <Input 
                value={editedData.academic_history.college_address || ''}
                onChange={(e) => updateNestedState('academic_history', 'college_address', e.target.value)}
            />
            </div>
            <div>
            <Label>College Honors</Label>
            <Input 
                value={editedData.academic_history.college_honors || ''}
                onChange={(e) => updateNestedState('academic_history', 'college_honors', e.target.value)}
            />
            </div>
            <div>
            <Label>College Program</Label>
            <Input 
                value={editedData.academic_history.program || ''}
                onChange={(e) => updateNestedState('academic_history', 'program', e.target.value)}
            />
            </div>
        </CardContent>
        </Card>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}