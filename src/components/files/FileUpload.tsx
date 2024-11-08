
'use client'
import React, { useState, useEffect } from 'react';
import { Upload, X, Loader2, RefreshCw } from 'lucide-react';

interface Document {
  id: number;
  filename: string;
  temporary_url?: string;
  uploaded_at: string;
}

const FileUploadAndGallery = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string>("");
  const [refreshingUrls, setRefreshingUrls] = useState<{[key: number]: boolean}>({});

  useEffect(() => {
    fetchDocuments();
    // Refresh URLs every 45 minutes (since they expire after 1 hour)
    const interval = setInterval(() => {
      refreshAllUrls();
    }, 45 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/api/documents/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch documents');
      
      const data = await response.json();
      // For each document, fetch its signed URL
      const documentsWithUrls = await Promise.all(
        data.documents.map(async (doc: Document) => {
          const urlData = await fetchSignedUrl(doc.id);
          return {
            ...doc,
            temporary_url: urlData.temporary_url
          };
        })
      );
      setDocuments(documentsWithUrls);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    }
  };

  const fetchSignedUrl = async (documentId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/documents/${documentId}/`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });
      
      if (!response.ok) throw new Error('Failed to fetch signed URL');
      
      return await response.json();
    } catch (err) {
      console.error(`Failed to fetch signed URL for document ${documentId}:`, err);
      throw err;
    }
  };

  const refreshUrl = async (documentId: number) => {
    setRefreshingUrls(prev => ({ ...prev, [documentId]: true }));
    try {
      const urlData = await fetchSignedUrl(documentId);
      setDocuments(prev => 
        prev.map(doc => 
          doc.id === documentId 
            ? { ...doc, temporary_url: urlData.temporary_url }
            : doc
        )
      );
    } catch (err) {
      setError(`Failed to refresh URL for document ${documentId}`);
    } finally {
      setRefreshingUrls(prev => ({ ...prev, [documentId]: false }));
    }
  };

  const refreshAllUrls = async () => {
    try {
      const updatedDocs = await Promise.all(
        documents.map(async (doc) => {
          const urlData = await fetchSignedUrl(doc.id);
          return { ...doc, temporary_url: urlData.temporary_url };
        })
      );
      setDocuments(updatedDocs);
    } catch (err) {
      setError('Failed to refresh URLs');
      console.error(err);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    setError("");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://127.0.0.1:8000/api/upload/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const result = await response.json();
      setDocuments(prev => [...prev, {
        id: result.document_id,
        filename: result.filename,
        temporary_url: result.temporary_url,
        uploaded_at: new Date().toISOString(),
      }]);

      setUploadProgress(100);
    } catch (err) {
      setError('Upload failed. Please try again.');
      console.error(err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteDocument = async (documentId: number) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/documents/${documentId}/`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) throw new Error('Delete failed');

      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
    } catch (err) {
      setError('Failed to delete document');
      console.error(err);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Upload Section */}
      <div className="mb-8">
        <label className="block mb-4">
          <div className="flex items-center justify-center w-full h-32 px-4 transition bg-white border-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-gray-400 focus:outline-none">
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-10 h-10 text-gray-400" />
              <p className="mb-2 text-sm text-gray-500">
                <span className="font-semibold">Click to upload</span> or drag and drop
              </p>
              <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
            </div>
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept="image/*,.pdf"
            />
          </div>
        </label>

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Uploading...</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((doc) => (
          <div key={doc.id} className="relative group">
            <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
              {doc.filename.toLowerCase().endsWith('.pdf') ? (
                <div className="flex items-center justify-center w-full h-full">
                  <span className="text-lg font-medium text-gray-500">PDF Document</span>
                </div>
              ) : doc.temporary_url ? (
                <img
                  src={doc.temporary_url}
                  alt={doc.filename}
                  className="object-cover w-full h-full"
                  onError={() => {
                    // If image fails to load, try refreshing the URL
                    refreshUrl(doc.id);
                  }}
                />
              ) : (
                <div className="flex items-center justify-center w-full h-full">
                  <button
                    onClick={() => refreshUrl(doc.id)}
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-600"
                    disabled={refreshingUrls[doc.id]}
                  >
                    <RefreshCw className={`w-4 h-4 ${refreshingUrls[doc.id] ? 'animate-spin' : ''}`} />
                    Refresh URL
                  </button>
                </div>
              )}
              
              {/* Overlay with delete button */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-300">
                <button
                  onClick={() => handleDeleteDocument(doc.id)}
                  className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
            
            {/* Filename */}
            <p className="mt-2 text-sm text-gray-600 truncate">
              {doc.filename}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUploadAndGallery;