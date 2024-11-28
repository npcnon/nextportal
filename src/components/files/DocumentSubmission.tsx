import React, { useState, useEffect } from 'react';
import { Upload, X, FileCheck, AlertCircle, Eye, Loader2, WifiOff } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from "@/components/ui/skeleton"; // Import your Skeleton component or create one
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from '@/lib/utils';
import apiClient from '@/lib/clients/authenticated-api-client';
import { useErrorHandler } from '@/hooks/use-error-handler';

type DocumentType = 
  | 'birth_certificate'
  | 'form_137'
  | 'transcript_of_records'
  | 'high_school_diploma'
  | 'good_moral'
  | 'two_x_two_photo'
  | 'certificate_of_transfer'
  | 'medical_certificate'
  | 'profile';

interface Document {
  id: number;
  document_type: DocumentType;
  file_type: string;
  status: 'unverified' |'pending' | 'approved' | 'rejected';
  filename: string;
  uploaded_at: string;
  temporary_url?: string;
  expires_at?: string;
  review_notes?: string;
}

interface DocumentState {
  [key: string]: Document | null;
}

const DOCUMENT_LABELS: Record<DocumentType, string> = {
  birth_certificate: 'Birth Certificate',
  form_137: 'Form 137',
  transcript_of_records: 'Transcript of Records',
  high_school_diploma: 'High School Diploma',
  good_moral: 'Certificate of Good Moral',
  two_x_two_photo: '2x2 Photo',
  certificate_of_transfer: 'Signature',
  medical_certificate: 'Medical Certificate',
  profile: 'Profile Picture'
};

const DocumentSubmission = () => {
  const [documents, setDocuments] = useState<DocumentState>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [isFetching, setIsFetching] = useState(true); // Add this for the fetching state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<Document | null>(null);
  const [previewType, setPreviewType] = useState<'pdf' | 'image' | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { handleError, retryCount, resetRetryCount, isMaxRetries } = useErrorHandler();
  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    setIsFetching(true);
    try {
      const response = await apiClient.get('documents/');
      const documentMap: DocumentState = {};
      response.data.documents.forEach((doc: Document) => {
        documentMap[doc.document_type] = doc;
      });
      setDocuments(documentMap);
    } catch (error) {
      await handleError(error, fetchDocuments);
    } finally {
      setIsFetching(false);
    }
  };



  const handleFileUpload = async (documentType: DocumentType, file: File) => {
    if (documents[documentType]) {
      setErrors(prev => ({
        ...prev,
        [documentType]: 'Document already submitted'
      }));
      return;
    }

    setLoading(prev => ({ ...prev, [documentType]: true }));
    setErrors(prev => ({ ...prev, [documentType]: '' }));
    setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));

    const formData = new FormData();
    formData.append('file', file);
    formData.append('document_type', documentType);

    try {
      const response = await apiClient.post('upload/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [documentType]: percentCompleted }));
          }
        }
      });

      setDocuments(prev => ({
        ...prev,
        [documentType]: response.data
      }));
      
      setUploadProgress(prev => ({ ...prev, [documentType]: 100 }));
    } catch (error: unknown) {
      await handleError(error, () => handleFileUpload(documentType, file));
    } finally {
      setLoading(prev => ({ ...prev, [documentType]: false }));
      setTimeout(() => {
        setUploadProgress(prev => ({ ...prev, [documentType]: 0 }));
      }, 1000);
    }
  };

  
  if (isMaxRetries) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="flex flex-col items-center max-w-md text-center space-y-4">
          <WifiOff className="h-12 w-12 text-gray-400" />
          <h2 className="text-xl font-semibold">Connection Error</h2>
          <p className="text-gray-600">
            We're having trouble connecting to our servers. This might be due to:
          </p>
          <ul className="text-sm text-gray-500 list-disc text-left">
            <li>Your internet connection</li>
            <li>A temporary server issue</li>
            <li>Your network firewall or security settings</li>
          </ul>
          <button
            onClick={() => {
              resetRetryCount();
              fetchDocuments();
            }}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }



  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'text-green-500';
      case 'rejected':
        return 'text-red-500';
      default:
        return 'text-yellow-500';
    }
  };

  const handlePreview = (url: string, document: Document) => {
    setPreviewUrl(url);
    setPreviewDocument(document);
    // Check file type based on extension
    const isPdf = document.filename.toLowerCase().endsWith('.pdf');
    setPreviewType(isPdf ? 'pdf' : 'image');
    setIsPreviewOpen(true);
  };
  const renderSkeletonCard = (documentType: DocumentType) => (
    <Card key={documentType} className="w-full max-w-md">
      <CardHeader>
        <Skeleton className="h-6 w-2/3 mb-2" /> {/* Title Skeleton */}
        <Skeleton className="h-4 w-1/3" /> {/* Description Skeleton */}
      </CardHeader>
      <CardContent>
        <Skeleton className="h-32 w-full mb-4" /> {/* Placeholder for upload area */}
        <Skeleton className="h-4 w-1/2 mb-2" />
        <Skeleton className="h-4 w-1/3" />
      </CardContent>
    </Card>
  );
  const renderPreviewContent = () => {
    if (!previewUrl) return null;

    if (previewType === 'pdf') {
      return (
        <iframe
          src={previewUrl}
          className="w-full h-full"
          style={{ display: 'block', border: 'none', margin: 0, padding: 0 }}
          title="Document preview"
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full p-4 bg-black/10">
        <img
          src={previewUrl}
          alt="Document preview"
          className="max-w-full max-h-full object-contain"
          style={{ margin: 'auto' }}
        />
      </div>
    );
  };
  const MAX_FILENAME_LENGTH = 25;

  const renderFilename = (filename: string): string => {
    if (filename.length > MAX_FILENAME_LENGTH) {
      return `${filename.slice(0, MAX_FILENAME_LENGTH - 3)}...`;
    } else {
      return filename;
    }
  };
  const renderDocumentCard = (documentType: DocumentType) => {
    const document = documents[documentType];
    const isLoading = loading[documentType];
    const error = errors[documentType];
    const progress = uploadProgress[documentType];

    return (
      <Card key={documentType} className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            {DOCUMENT_LABELS[documentType]}
          </CardTitle>
          <CardDescription>
            {document ? (
              <span className={cn("flex items-center gap-2", getStatusColor(document.status))}>
                <FileCheck className="w-4 h-4" />
                {document.status.charAt(0).toUpperCase() + document.status.slice(1)}
              </span>
            ) : (
              "Please upload your document"
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {document ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Filename:</span>
                <span className="font-medium">{renderFilename(document.filename)}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploaded:</span>
                <span className="font-medium">
                  {new Date(document.uploaded_at).toLocaleDateString()}
                </span>
              </div>

              {document.review_notes && (
                <div className="text-sm">
                  <span className="text-muted-foreground">Notes:</span>
                  <p className="mt-1 text-sm">{document.review_notes}</p>
                </div>
              )}

              {document.temporary_url && (
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => handlePreview(document.temporary_url!, document)}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  View Document
                </Button>
              )}
            </div>
          ) : (
            <div>
              <input
                type="file"
                id={`file-${documentType}`}
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleFileUpload(documentType, file);
                }}
                disabled={isLoading}
              />
              
              <label
                htmlFor={`file-${documentType}`}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  "hover:bg-muted/50 transition-colors",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                {isLoading ? (
                  <div className="flex flex-col items-center">
                    <Loader2 className="w-6 h-6 animate-spin" />
                    <span className="mt-2 text-sm">Uploading...</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload className="w-6 h-6" />
                    <span className="mt-2 text-sm">Click to upload</span>
                  </div>
                )}
              </label>

              {progress > 0 && progress < 100 && (
                <Progress value={progress} className="mt-4" />
              )}
            </div>
          )}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Document Submission</h1>
      
      {isFetching ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map(renderSkeletonCard)}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(Object.keys(DOCUMENT_LABELS) as DocumentType[]).map(renderDocumentCard)}
        </div>
      )}

      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent
          className={cn(
            "p-0 gap-0 overflow-auto",
            previewType === 'pdf' ? "max-w-[95vw] w-full h-[95vh]" : "max-w-[90vw] max-h-[90vh]"
          )}
        >
          <div className={cn("flex flex-col h-full")}>
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b">
              <DialogTitle className="text-lg font-semibold">
                Document Preview
              </DialogTitle>
              <span className="text-sm text-muted-foreground">
                {previewDocument?.filename}
              </span>
            </div>          
            {/* Content */}
            <div
              className={cn(
                "flex-1 overflow-auto p-4",
                previewType === 'pdf' ? "min-h-0" : "h-auto"
              )}
            >
              {renderPreviewContent()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DocumentSubmission;