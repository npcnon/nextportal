// Some page or component where you want to trigger the PDF dialog
import React from 'react';
import { PdfDialog } from '@/components/files/pdf-viewer(sample)';

const SomeComponent = () => {
  const pdfUrl = "https://res.cloudinary.com/dzlzm64uw/raw/private/s--9D2EX0G7--/v1/user_3/documents/medical_certificate/xggjqm2f6oeloiefwb6i.pdf";

  return (
    <div>
      <PdfDialog pdfUrl={pdfUrl}>
        <button className="btn btn-primary">Open PDF</button>
      </PdfDialog>
    </div>
  );
};

export default SomeComponent;
