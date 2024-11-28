import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, Image as ImageIcon, Download, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AdminContactModal = ({ contact, onClose }) => {
  const [activeTab, setActiveTab] = useState('details');

  const handleDownload = (doc) => {
    if (doc.temporary_url) {
      window.open(doc.temporary_url, '_blank');
    }
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Admin Contact Request</DialogTitle>
          <DialogDescription>
            Details of the contact request
          </DialogDescription>
        </DialogHeader>

        {contact.document_count > 0 ? (
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Request Details</TabsTrigger>
              <TabsTrigger value="documents">
                Documents ({contact.document_count})
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details">
              <div className="space-y-4">
                <p className="text-sm text-gray-800">{contact.message}</p>
                <p className="text-xs text-gray-500">
                  Submitted on: {new Date(contact.created_at).toLocaleString()}
                </p>
              </div>
            </TabsContent>
            <TabsContent value="documents">
              <div className="space-y-4">
                {contact.documents.map((doc) => (
                  <div 
                    key={doc.id} 
                    className="border rounded-lg p-4 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-4">
                      {doc.document_type === 'image' ? (
                        <ImageIcon className="h-6 w-6 text-blue-500" />
                      ) : (
                        <FileText className="h-6 w-6 text-gray-500" />
                      )}
                      <div>
                        <p className="text-sm font-medium">{doc.file_name}</p>
                        <p className="text-xs text-gray-500">
                          {(doc.file_size / 1024).toFixed(2)} KB - {doc.mime_type}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      {doc.temporary_url && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownload(doc)}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                          <a 
                            href={doc.temporary_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:bg-gray-100 p-2 rounded-md"
                          >
                            <ExternalLink className="h-4 w-4 text-blue-600" />
                          </a>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-gray-800">{contact.message}</p>
            <p className="text-xs text-gray-500">
              Submitted on: {new Date(contact.created_at).toLocaleString()}
            </p>
            <Badge variant="secondary">No attachments</Badge>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AdminContactModal;