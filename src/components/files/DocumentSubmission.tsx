import React, { useState, useEffect, useRef } from 'react';
import { Upload, File, Check, X, Loader2, FileType } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import apiClient from '@/lib/axios';

interface Document {
  id: number;
  document_type: string;
  status: 'pending' | 'approved' | 'rejected';
  filename: string;
  uploaded_at: string;
  temporary_url: string;
  expires_at: string;
}

interface UploadError {
  documentType: string;
  message: string;
}

interface UploadProgress {
  [key: string]: number;
}

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const DocumentUploadManager = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [uploading, setUploading] = useState<{ [key: string]: boolean }>({});
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [uploadSpeeds, setUploadSpeeds] = useState<{ [key: string]: number }>({});
  const [estimatedTimes, setEstimatedTimes] = useState<{ [key: string]: number }>({});
  const [errors, setErrors] = useState<UploadError[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const uploadStartTimes = useRef<{ [key: string]: number }>({});

  const documentTypes = [
    { 
      id: 'birth_certificate', 
      label: 'Birth Certificate',
      icon: <FileType className="w-5 h-5" />,
      description: 'Upload your birth certificate (PDF, JPG, or PNG)',
    },
    { 
      id: 'high_school_diploma', 
      label: 'High School Diploma',
      icon: <FileType className="w-5 h-5" />,
      description: 'Upload your high school diploma (PDF, JPG, or PNG)',
    },
    { 
      id: 'good_moral', 
      label: 'Good Moral Certificate',
      icon: <FileType className="w-5 h-5" />,
      description: 'Upload your good moral certificate (PDF, JPG, or PNG)',
    },
    { 
      id: 'medical_certificate', 
      label: 'Medical Certificate',
      icon: <FileType className="w-5 h-5" />,
      description: 'Upload your medical certificate (PDF, JPG, or PNG)',
    },
    { 
      id: 'profile', 
      label: 'Profile Picture',
      icon: <FileType className="w-5 h-5" />,
      description: 'Upload your profile picture (JPG or PNG only)',
    },
  ];

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get('/documents');
      console.log(response.data)
      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatSpeed = (bytesPerSecond: number) => {
    if (bytesPerSecond === 0) return '0 B/s';
    const k = 1024;
    const sizes = ['B/s', 'KB/s', 'MB/s', 'GB/s'];
    const i = Math.floor(Math.log(bytesPerSecond) / Math.log(k));
    return parseFloat((bytesPerSecond / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (seconds: number) => {
    if (seconds < 1) return 'less than a second';
    if (seconds < 60) return `${Math.round(seconds)} seconds`;
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.round(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const isDocumentUploaded = (documentType: string) => {
    return documents.some(doc => 
      doc.document_type.toLowerCase() === documentType.toLowerCase()
    );
  };

  const handleFileUpload = async (file: File, documentType: string) => {
    if (isDocumentUploaded(documentType)) {
      toast({
        title: "Error",
        description: "This document has already been uploaded. Please contact support if you need to update it.",
        variant: "destructive",
      });
      return;
    }

    // File size validation
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "Error",
        description: `File size exceeds ${formatFileSize(MAX_FILE_SIZE)}. Please upload a smaller file.`,
        variant: "destructive",
      });
      return;
    }

    const allowedTypes = documentType === 'profile' 
      ? ['image/jpeg', 'image/png']
      : ['application/pdf', 'image/jpeg', 'image/png'];
    
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Error",
        description: `Invalid file type. Please upload ${allowedTypes.join(' or ')}`,
        variant: "destructive",
      });
      return;
    }

    setUploading(prev => ({ ...prev, [documentType]: true }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
    setErrors(prev => prev.filter(error => error.documentType !== documentType));
    uploadStartTimes.current[documentType] = Date.now();

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    let lastLoaded = 0;
    let lastTime = Date.now();

    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const currentTime = Date.now();
          const timeDiff = (currentTime - lastTime) / 1000; // Convert to seconds
          const loadedDiff = event.loaded - lastLoaded;
          
          if (timeDiff > 0) {
            const currentSpeed = loadedDiff / timeDiff; // bytes per second
            setUploadSpeeds(prev => ({ ...prev, [documentType]: currentSpeed }));
            
            // Calculate estimated time remaining
            const remainingBytes = event.total - event.loaded;
            const estimatedSeconds = remainingBytes / currentSpeed;
            setEstimatedTimes(prev => ({ ...prev, [documentType]: estimatedSeconds }));
          }
          
          lastLoaded = event.loaded;
          lastTime = currentTime;
          
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ ...prev, [documentType]: progress }));
        }
      });

      xhr.addEventListener('load', async () => {

        if (xhr.status === 401) {
            // Access token has expired, try to refresh it
            try {
              const refreshToken = localStorage.getItem('refresh_token');
              const response = await fetchRefreshToken(refreshToken);
              localStorage.setItem('access_token', response.access_token);
    
              // Retry the original request with the new access token
              return handleFileUpload(file, documentType);
            } catch (error) {
              // Refresh token has also expired, clear the auth tokens
              clearAuthTokens();
              reject(new Error('Refresh token expired. Please log in again.'));
              return;
            }
          }
        if (xhr.status >= 200 && xhr.status < 300) {
          const uploadDuration = (Date.now() - uploadStartTimes.current[documentType]) / 1000;
          const averageSpeed = file.size / uploadDuration;
          
          try {
            const response = JSON.parse(xhr.responseText);
            await fetchDocuments();
            toast({
              title: "Success",
              description: `Document uploaded successfully (${formatFileSize(file.size)} at ${formatSpeed(averageSpeed)})`,
            });
            resolve(response);
          } catch (error) {
            reject(new Error('Invalid response format'));
          }
        } else {
          reject(new Error(xhr.responseText || 'Upload failed'));
        }
      });

      xhr.addEventListener('error', () => {
        const errorMessage = 'Network error occurred. Please check your connection and try again.';
        reject(new Error(errorMessage));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload aborted'));
      });

      xhr.open('POST', 'http://127.0.0.1:8000/api/upload/');
      xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('access_token')}`);
      xhr.send(formData);
    }).catch((error) => {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';
      setErrors(prev => [...prev, {
        documentType,
        message: errorMessage
      }]);
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    }).finally(() => {
      setUploading(prev => ({ ...prev, [documentType]: false }));
      setUploadSpeeds(prev => ({ ...prev, [documentType]: 0 }));
      setEstimatedTimes(prev => ({ ...prev, [documentType]: 0 }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      }, 1000);
    });
  };

  const fetchRefreshToken = async (refreshToken: string | null) => {
    const response = await fetch('http://127.0.0.1:8000/api/refresh-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh: refreshToken }),
    });
  
    if (response.ok) {
      return response.json();
    } else {
      throw new Error('Failed to refresh access token');
    }
  };
  
  const clearAuthTokens = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto p-8">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Required Documents</h2>
        <p className="text-gray-600">Please upload all required documents in PDF, JPG, or PNG format</p>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {documentTypes.map(({ id, label, icon, description }) => {
          const isUploaded = isDocumentUploaded(label);
          console.log(`isuploaded:${isUploaded}`)
          const isCurrentlyUploading = uploading[id];
          const progress = uploadProgress[id] || 0;
          const speed = uploadSpeeds[id] || 0;
          const estimatedTime = estimatedTimes[id] || 0;
          const error = errors.find(e => e.documentType === id);
          const uploadedDoc = documents.find(doc => 
            doc.document_type.toLowerCase() === label.toLowerCase()
          );

          return (
            <Card key={id} className={`transition-all duration-200 ${
              isUploaded ? 'bg-green-50 border-green-200' : 'hover:shadow-md'
            }`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4">
                      <div className={`p-2 rounded-full ${
                        isUploaded ? 'bg-green-100' : 'bg-gray-100'
                      }`}>
                        {isUploaded ? (
                          <Check className="w-6 h-6 text-green-600" />
                        ) : (
                          icon
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{label}</h3>
                        <p className="text-sm text-gray-600 mt-1">{description}</p>
                        {uploadedDoc && (
                          <div className="mt-2">
                            <p className="text-sm text-gray-500">
                              Uploaded: {uploadedDoc.filename}
                            </p>
                            <p className="text-sm text-gray-500">
                              Status: <span className="capitalize">{uploadedDoc.status}</span>
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {isCurrentlyUploading && (
                      <div className="mt-4 space-y-2">
                        <Progress value={progress} className="h-2" />
                        <div className="flex justify-between text-sm text-gray-500">
                          <span>Uploading... {formatSpeed(speed)}</span>
                          <span>{progress}% • {estimatedTime > 0 ? `${formatTime(estimatedTime)} remaining` : 'Calculating...'}</span>
                        </div>
                      </div>
                    )}

                    {error && (
                      <Alert variant="destructive" className="mt-4">
                        <AlertDescription className="text-sm">
                          {error.message}
                        </AlertDescription>
                      </Alert>
                    )}

                    {uploadedDoc && (
                      <div className="mt-4">
                        <a
                          href={uploadedDoc.temporary_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 text-primary hover:text-primary/80 text-sm font-medium"
                        >
                          <FileType className="w-4 h-4" />
                          <span>View Document</span>
                        </a>
                      </div>
                    )}

                    {!isUploaded && !isCurrentlyUploading && (
                      <p className="text-sm text-gray-500 mt-2">
                        Maximum file size: {formatFileSize(MAX_FILE_SIZE)}
                      </p>
                    )}
                  </div>

                  {!isUploaded && (
                    <label className="relative cursor-pointer">
                      <input
                        type="file"
                        className="sr-only"
                        accept={id === 'profile' ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                        disabled={isCurrentlyUploading}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleFileUpload(file, id);
                        }}
                      />
                      <div className={`flex items-center justify-center px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isCurrentlyUploading
                          ? 'bg-gray-100 text-gray-400'
                          : 'bg-primary text-white hover:bg-primary/90'
                      }`}>
                        {isCurrentlyUploading ? (
                          <div className="flex items-center space-x-2">
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Uploading...</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2">
                            <Upload className="w-4 h-4" />
                            <span>Upload</span>
                          </div>
                        )}
                      </div>
                    </label>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentUploadManager;