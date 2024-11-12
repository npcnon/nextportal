import React, { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

type AcademicBackgroundData = {
  program: string;
  majorIn: string;
  studentType: string;
  semesterEntry: string;
  yearEntry: number;
  yearLevel: string;
  yearGraduate: number;
  applicationType: string;
};

type AcademicHistoryData = {
  elementarySchool: string;
  elementaryAddress: string;
  elementaryHonors: string;
  elementaryGraduate: number;
  juniorHighSchool: string;
  juniorAddress: string;
  juniorHonors: string;
  juniorGraduate: number;
  seniorHighSchool: string;
  seniorAddress: string;
  seniorHonors: string;
  seniorGraduate: number;
  ncaeGrade: string;
  ncaeYearTaken: number;
  latestCollege: string;
  collegeAddress: string;
  collegeHonors: string;
  program: string;
};

const academicBackgroundSchema = z.object({
  program: z.string().min(1, 'Program is required'),
  majorIn: z.string().optional(),
  studentType: z.string().min(1, 'Student type is required'),
  semesterEntry: z.string().min(1, 'Semester entry is required'),
  yearEntry: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  yearLevel: z.string().min(1, 'Year level is required'),
  yearGraduate: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future'),
  applicationType: z.string().min(1, 'Application type is required'),
});

const academicHistorySchema = z.object({
  elementarySchool: z.string().min(1, 'Elementary school is required'),
  elementaryAddress: z.string().min(1, 'Elementary address is required'),
  elementaryHonors: z.string().optional(),
  elementaryGraduate: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').optional(),
  juniorHighSchool: z.string().min(1, 'Junior high school is required'),
  juniorAddress: z.string().min(1, 'Junior address is required'),
  juniorHonors: z.string().optional(),
  juniorGraduate: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').optional(),
  seniorHighSchool: z.string().min(1, 'Senior high school is required'),
  seniorAddress: z.string().min(1, 'Senior address is required'),
  seniorHonors: z.string().optional(),
  seniorGraduate: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').optional(),
  ncaeGrade: z.string().optional(),
  ncaeYearTaken: z.number().min(1900, 'Invalid year').max(new Date().getFullYear(), 'Year cannot be in the future').optional(),
  latestCollege: z.string().optional(),
  collegeAddress: z.string().optional(),
  collegeHonors: z.string().optional(),
  program: z.string().optional(),
});

const AcademicBackgroundAndHistory: React.FC = () => {
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showErrorAlert, setShowErrorAlert] = useState(false);

  const {
    register: academicBackgroundRegister,
    handleSubmit: academicBackgroundSubmit,
    formState: { errors: academicBackgroundErrors },
  } = useForm<AcademicBackgroundData>({
    resolver: zodResolver(academicBackgroundSchema),
  });

  const {
    register: academicHistoryRegister,
    handleSubmit: academicHistorySubmit,
    formState: { errors: academicHistoryErrors },
  } = useForm<AcademicHistoryData>({
    resolver: zodResolver(academicHistorySchema),
  });

  const onAcademicBackgroundSubmit: SubmitHandler<AcademicBackgroundData> = async (data) => {
    try {
      // Submit academic background data to a random URL for now
      await fetch('/api/academic-background', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error submitting academic background data:', error);
      setShowErrorAlert(true);
    }
  };

  const onAcademicHistorySubmit: SubmitHandler<AcademicHistoryData> = async (data) => {
    try {
      // Submit academic history data to a random URL for now
      await fetch('/api/academic-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      setShowSuccessAlert(true);
    } catch (error) {
      console.error('Error submitting academic history data:', error);
      setShowErrorAlert(true);
    }
  };

  return (
    <Card className="w-full max-w-4xl">
      <CardHeader>
        <CardTitle>Academic Background and History</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={academicBackgroundSubmit(onAcademicBackgroundSubmit)}>
          <h3 className="text-lg font-medium mb-4">Academic Background</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="program">Program</Label>
              <Input {...academicBackgroundRegister('program')} id="program" />
              {academicBackgroundErrors.program && (
                <p className="text-red-500">{academicBackgroundErrors.program.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="majorIn">Major in</Label>
              <Input {...academicBackgroundRegister('majorIn')} id="majorIn" />
            </div>
            <div>
              <Label htmlFor="studentType">Student Type</Label>
              <Input {...academicBackgroundRegister('studentType')} id="studentType" />
              {academicBackgroundErrors.studentType && (
                <p className="text-red-500">{academicBackgroundErrors.studentType.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="semesterEntry">Semester Entry</Label>
              <Input {...academicBackgroundRegister('semesterEntry')} id="semesterEntry" />
              {academicBackgroundErrors.semesterEntry && (
                <p className="text-red-500">{academicBackgroundErrors.semesterEntry.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="yearEntry">Year Entry</Label>
              <Input type="number" {...academicBackgroundRegister('yearEntry')} id="yearEntry" />
              {academicBackgroundErrors.yearEntry && (
                <p className="text-red-500">{academicBackgroundErrors.yearEntry.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="yearLevel">Year Level</Label>
              <Input {...academicBackgroundRegister('yearLevel')} id="yearLevel" />
              {academicBackgroundErrors.yearLevel && (
                <p className="text-red-500">{academicBackgroundErrors.yearLevel.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="yearGraduate">Year Graduate</Label>
              <Input type="number" {...academicBackgroundRegister('yearGraduate')} id="yearGraduate" />
              {academicBackgroundErrors.yearGraduate && (
                <p className="text-red-500">{academicBackgroundErrors.yearGraduate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="applicationType">Application Type</Label>
              <Input {...academicBackgroundRegister('applicationType')} id="applicationType" />
              {academicBackgroundErrors.applicationType && (
                <p className="text-red-500">{academicBackgroundErrors.applicationType.message}</p>
              )}
            </div>
          </div>
          <Separator className="my-4" />
          <h3 className="text-lg font-medium mb-4">Academic History</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="elementarySchool">Elementary School</Label>
              <Input {...academicHistoryRegister('elementarySchool')} id="elementarySchool" />
              {academicHistoryErrors.elementarySchool && (
                <p className="text-red-500">{academicHistoryErrors.elementarySchool.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="elementaryAddress">Elementary Address</Label>
              <Input {...academicHistoryRegister('elementaryAddress')} id="elementaryAddress" />
              {academicHistoryErrors.elementaryAddress && (
                <p className="text-red-500">{academicHistoryErrors.elementaryAddress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="elementaryHonors">Elementary Honors</Label>
              <Input {...academicHistoryRegister('elementaryHonors')} id="elementaryHonors" />
            </div>
            <div>
              <Label htmlFor="elementaryGraduate">Elementary Graduate</Label>
              <Input type="number" {...academicHistoryRegister('elementaryGraduate')} id="elementaryGraduate" />
              {academicHistoryErrors.elementaryGraduate && (
                <p className="text-red-500">{academicHistoryErrors.elementaryGraduate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="juniorHighSchool">Junior High School</Label>
              <Input {...academicHistoryRegister('juniorHighSchool')} id="juniorHighSchool" />
              {academicHistoryErrors.juniorHighSchool && (
                <p className="text-red-500">{academicHistoryErrors.juniorHighSchool.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="juniorAddress">Junior Address</Label>
              <Input {...academicHistoryRegister('juniorAddress')} id="juniorAddress" />
              {academicHistoryErrors.juniorAddress && (
                <p className="text-red-500">{academicHistoryErrors.juniorAddress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="juniorHonors">Junior Honors</Label>
              <Input {...academicHistoryRegister('juniorHonors')} id="juniorHonors" />
            </div>
            <div>
              <Label htmlFor="juniorGraduate">Junior Graduate</Label>
              <Input type="number" {...academicHistoryRegister('juniorGraduate')} id="juniorGraduate" />
              {academicHistoryErrors.juniorGraduate && (
                <p className="text-red-500">{academicHistoryErrors.juniorGraduate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="seniorHighSchool">Senior High School</Label>
              <Input {...academicHistoryRegister('seniorHighSchool')} id="seniorHighSchool" />
              {academicHistoryErrors.seniorHighSchool && (
                <p className="text-red-500">{academicHistoryErrors.seniorHighSchool.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="seniorAddress">Senior Address</Label>
              <Input {...academicHistoryRegister('seniorAddress')} id="seniorAddress" />
              {academicHistoryErrors.seniorAddress && (
                <p className="text-red-500">{academicHistoryErrors.seniorAddress.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="seniorHonors">Senior Honors</Label>
              <Input {...academicHistoryRegister('seniorHonors')} id="seniorHonors" />
            </div>
            <div>
              <Label htmlFor="seniorGraduate">Senior Graduate</Label>
              <Input type="number" {...academicHistoryRegister('seniorGraduate')} id="seniorGraduate" />
              {academicHistoryErrors.seniorGraduate && (
                <p className="text-red-500">{academicHistoryErrors.seniorGraduate.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="ncaeGrade">NCAE Grade</Label>
              <Input {...academicHistoryRegister('ncaeGrade')} id="ncaeGrade" />
            </div>
            <div>
              <Label htmlFor="ncaeYearTaken">NCAE Year Taken</Label>
              <Input type="number" {...academicHistoryRegister('ncaeYearTaken')} id="ncaeYearTaken" />
              {academicHistoryErrors.ncaeYearTaken && (
                <p className="text-red-500">{academicHistoryErrors.ncaeYearTaken.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="latestCollege">Latest College</Label>
              <Input {...academicHistoryRegister('latestCollege')} id="latestCollege" />
            </div>
            <div>
              <Label htmlFor="collegeAddress">College Address</Label>
              <Input {...academicHistoryRegister('collegeAddress')} id="collegeAddress" />
            </div>
            <div>
              <Label htmlFor="collegeHonors">College Honors</Label>
              <Input {...academicHistoryRegister('collegeHonors')} id="collegeHonors" />
            </div>
            <div>
              <Label htmlFor="program">Program</Label>
              <Input {...academicHistoryRegister('program')} id="program" />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <Button type="submit">Submit</Button>
          </div>
        </form>
        
      </CardContent>
    </Card>
  );
};

export default AcademicBackgroundAndHistory;