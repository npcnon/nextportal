import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface PdfDialogProps {
  children: React.ReactNode;
  pdfUrl: string;
}

export const PdfDialog: React.FC<PdfDialogProps> = ({ children, pdfUrl }) => {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="max-w-5xl w-full h-[90vh] flex flex-col">
        <DialogHeader className="bg-gray-900 text-white px-6 py-4">
          <DialogTitle>PDF Viewer</DialogTitle>
        </DialogHeader>
        <DialogDescription className="flex-1 overflow-y-auto">
          <embed src={pdfUrl} type="application/pdf" width="100%" height="100%" />
        </DialogDescription>
      </DialogContent>
    </Dialog>
  );
};