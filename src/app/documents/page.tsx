// // Some page or component where you want to trigger the PDF dialog
// import React from 'react';
// import { PdfDialog } from '@/components/files/pdf-viewer(sample)';

// const SomeComponent = () => {
//   const pdfUrl = "https://res.cloudinary.com/dzlzm64uw/raw/private/s--9D2EX0G7--/v1/user_3/documents/medical_certificate/xggjqm2f6oeloiefwb6i.pdf";

//   return (
//     <div>
//       <PdfDialog pdfUrl={pdfUrl}>
//         <button className="btn btn-primary">Open PDF</button>
//       </PdfDialog>
//     </div>
//   );
// };

// export default SomeComponent;
// pages/upload.tsx
'use client';
import DocumentUpload from "@/components/files/document-upload-REG";

const UploadPage = () => {
  const handleSuccess = (response: any) => {
    console.log('Upload successful:', response);
  };

  const handleError = (error: any) => {
    console.error('Upload failed:', error);
  };
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}api/admin-documents/`
  return (
    <div className="container mx-auto py-8">
      <DocumentUpload 
        apiUrl=""  
        onSuccess={handleSuccess}
        onError={handleError}
      />
    </div>
  );
};

export default UploadPage;