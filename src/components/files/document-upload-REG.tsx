'use client'; 

import { useToast } from '@/hooks/use-toast';
import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface UploadResponse {
  id: number;
  email: string;
  document_type: string;
  status: string;
  filename: string;
  uploaded_at: string;
  temporary_url?: string;
  expires_at?: string;
}

interface DocumentUploadProps {
  apiUrl: string;
  onSuccess?: (response: UploadResponse) => void;
  onError?: (error: any) => void;
}


const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUpload: React.FC<DocumentUploadProps> = ({
  apiUrl,
  onSuccess,
  onError
}) => {
  const { toast } = useToast();
  const [email, setFulldata_applicant_id] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const selectedFile = acceptedFiles[0];
      

      if (!ALLOWED_TYPES.includes(selectedFile.type)) {
        setError('Invalid file type. Please upload a PDF, JPG, or PNG file.');
        return;
      }

      if (selectedFile.size > MAX_FILE_SIZE) {
        setError('File size exceeds 10MB limit.');
        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (!file) {
        throw new Error('Please select a file to upload');
      }

      if (!email) {
        throw new Error('Email is required');
      }

      if (!documentType) {
        throw new Error('Document type is required');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('email', email);
      formData.append('document_type', documentType);
 
      const response = await fetch(apiUrl, {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      onSuccess?.(data);
      toast({
        title: "Document Uploaded Successfully",
        description: `${documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} has been uploaded.`,
        variant: "default",
      });
      
      // Reset form
      setFile(null);
      setFulldata_applicant_id('');
      setDocumentType('');

    } catch (err: any) {
      setError(err.message);
      onError?.(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow">
      <h2 className="text-2xl font-bold mb-6">Document Upload</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* FullData Applicant ID */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            FullData Applicant ID
          </label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setFulldata_applicant_id(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          />
        </div>

        {/* Document Type Select */}
        <div>
          <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
            Document Type
          </label>
          <select
            id="documentType"
            value={documentType}
            onChange={(e) => setDocumentType(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
          >
            <option value="">Select document type</option>
            <option value="birth_certificate">Birth Certificate</option>
            <option value="high_school_diploma">High School Diploma</option>
            <option value="good_moral">Good Moral Certificate</option>
            <option value="medical_certificate">Medical Certificate</option>
            <option value="profile">Profile Picture</option>
          </select>
        </div>

        {/* File Dropzone */}
        <div 
          {...getRootProps()} 
          className={`mt-2 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md 
            ${isDragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-300'}`}
        >
          <div className="space-y-1 text-center">
            <input {...getInputProps()} />
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md font-medium text-blue-600 hover:text-blue-500">
                {file ? file.name : 'Click to upload or drag and drop'}
              </label>
            </div>
            <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-red-500 text-sm mt-2">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
            ${loading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'}
            focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
        >
          {loading ? 'Uploading...' : 'Upload Document'}
        </button>
      </form> 
    </div>
  );
};

export default DocumentUpload;