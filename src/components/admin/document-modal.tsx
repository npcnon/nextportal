import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  FileText, 
  Image, 
  FileX, 
  Loader2,
  Eye,
  X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import unauthenticatedApiClient from '@/lib/clients/unauthenticated-api-client';
import { cn } from '@/lib/utils';

// Mapping for document type labels
const DOCUMENT_LABELS = {
  'profile': 'Profile Picture',
  'birth_certificate': 'Birth Certificate',
  'two_x_two_photo': '2x2 Photo',
  'form_137': 'Form 137',
  'transcript_of_records': 'Transcript of Records',
  'high_school_diploma': 'High School Diploma',
  'good_moral': 'Certificate of Good Moral',
  'medical_certificate': 'Medical Certificate',
  'certificate_of_transfer': 'Signature',
  'default': 'Document'
};

// Mapping for document type icons
const DocumentTypeIcons = {
  'profile': Image,
  'birth_certificate': FileText,
  'two_x_two_photo': Image,
  'default': FileText
};

// Mapping for document status colors
const DocumentStatusColors = {
  'pending': 'text-yellow-500',
  'approved': 'text-green-500',
  'rejected': 'text-red-500',
  'unverified': 'text-gray-500'
};

export default function StudentDocumentsModal({ 
  isOpen, 
  onClose, 
  email 
}) {
  const [documents, setDocuments] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [documentError, setDocumentError] = useState(null);
  const [previewType, setPreviewType] = useState(null);

  // Fetch documents when modal opens
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!email || !isOpen) return;

      try {
        setIsLoading(true);
        setDocumentError(null);
        
        const response = await unauthenticatedApiClient.get(`admin-documents/?email=${email}`);
        
        if (response.data && response.data.documents) {
          setDocuments(response.data.documents);
        } else {
          setDocumentError('No documents found');
        }
      } catch (error) {
        console.error('Failed to fetch documents:', error);
        setDocumentError('Failed to load documents. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, [email, isOpen]);

  // Handler for viewing a document
  const handleViewDocument = (document) => {
    if (document.temporary_url) {
      setSelectedDocument(document);
      
      // Determine preview type based on file extension
      const isPdf = document.filename.toLowerCase().endsWith('.pdf');
      setPreviewType(isPdf ? 'pdf' : 'image');
    } else {
      alert('Document preview is not available');
    }
  };

  // Dynamic icon component for document types
  const DocumentIcon = ({ type }) => {
    const Icon = DocumentTypeIcons[type] || DocumentTypeIcons['default'];
    return <Icon className="h-6 w-6 mr-2" />;
  };

  // Render document preview content
  const renderPreviewContent = () => {
    if (!selectedDocument || !selectedDocument.temporary_url) return null;

    if (previewType === 'pdf') {
      return (
        <iframe
          src={selectedDocument.temporary_url}
          className="w-full h-full"
          style={{ display: 'block', border: 'none', margin: 0, padding: 0 }}
          title="Document preview"
        />
      );
    }

    return (
      <div className="flex items-center justify-center w-full h-full p-4 bg-black/10">
        <img
          src={selectedDocument.temporary_url}
          alt="Document preview"
          className="max-w-full max-h-full object-contain"
          style={{ margin: 'auto' }}
        />
      </div>
    );
  };

  // Limit filename length
  const renderFilename = (filename, maxLength = 25) => {
    if (filename.length > maxLength) {
      return `${filename.slice(0, maxLength - 3)}...`;
    }
    return filename;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Student Documents</DialogTitle>
          <DialogDescription>
            Documents submitted by student with email: {email}
          </DialogDescription>
        </DialogHeader>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((_, index) => (
              <Card key={index} className="w-full">
                <CardHeader>
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-1/3" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : documentError ? (
          // Error State
          <div className="flex flex-col items-center justify-center h-64 text-red-500">
            <FileX className="h-16 w-16 mb-4" />
            <p>{documentError}</p>
          </div>
        ) : documents.length === 0 ? (
          // No Documents State
          <div className="flex flex-col items-center justify-center h-64 text-gray-500">
            <FileX className="h-16 w-16 mb-4" />
            <p>No documents found for this student</p>
          </div>
        ) : (
          // Documents List
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <Card key={doc.id} className="w-full">
                <CardHeader>
                  <div className="flex items-center">
                    <DocumentIcon type={doc.document_type} />
                    <CardTitle className="text-lg">
                      {DOCUMENT_LABELS[doc.document_type] || DOCUMENT_LABELS['default']}
                    </CardTitle>
                  </div>
                  <CardDescription className={cn(
                    "flex items-center gap-2",
                    DocumentStatusColors[doc.status] || 'text-gray-500'
                  )}>
                    {doc.status.charAt(0).toUpperCase() + doc.status.slice(1)}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="text-sm">
                      <span className="text-muted-foreground">Filename:</span>
                      <p className="font-medium">{renderFilename(doc.filename)}</p>
                    </div>
                    
                    <div className="text-sm">
                      <span className="text-muted-foreground">Uploaded:</span>
                      <p className="font-medium">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </p>
                    </div>

                    {doc.review_notes && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Notes:</span>
                        <p className="mt-1">{doc.review_notes}</p>
                      </div>
                    )}

                    {doc.temporary_url && (
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => handleViewDocument(doc)}
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View Document
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Document Preview Modal */}
        {selectedDocument && (
          <Dialog 
            open={!!selectedDocument} 
            onOpenChange={() => {
              setSelectedDocument(null);
              setPreviewType(null);
            }}
          >
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
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-muted-foreground">
                      {selectedDocument.filename}
                    </span>

                  </div>
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
        )}
      </DialogContent>
    </Dialog>
  );
}