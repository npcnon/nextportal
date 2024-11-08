// types/document.ts

export interface DocumentConfig {
    id: DocumentType;
    name: string;
    description: string;
    allowedFileTypes: string[];
    maxSize: number;
    isImage?: boolean;
  }
  
  export type DocumentType = 'profile' | 'birth_certificate' | 'high_school_diploma' | 'good_moral' | 'medical_certificate';
  
  export type DocumentStatus = 'pending' | 'approved' | 'rejected';
  
  export interface Document {
    id: number;
    document_type: DocumentType;
    status: DocumentStatus;
    filename: string;
    uploaded_at: string;
    review_notes?: string;
  }
  
  export const REQUIRED_DOCUMENTS: DocumentConfig[] = [
    {
      id: 'profile',
      name: 'Profile Picture',
      description: 'Upload a clear, recent photo of yourself (2x2)',
      allowedFileTypes: ['image/jpeg', 'image/png'],
      maxSize: 5,
      isImage: true
    },
    {
      id: 'birth_certificate',
      name: 'Birth Certificate',
      description: 'PSA/NSO issued birth certificate',
      allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSize: 10
    },
    {
      id: 'high_school_diploma',
      name: 'High School Diploma',
      description: 'Official high school diploma or equivalent',
      allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSize: 10
    },
    {
      id: 'good_moral',
      name: 'Good Moral Certificate',
      description: 'Certificate of good moral character from previous school',
      allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSize: 10
    },
    {
      id: 'medical_certificate',
      name: 'Medical Certificate',
      description: 'Recent medical certificate from a licensed physician',
      allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png'],
      maxSize: 10
    }
  ];