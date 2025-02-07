import { useState, useEffect } from 'react';
import StudentRegistrationForm from './student-registration';
import TermsAndPrivacyModal from '../terms/terms-and-agreement';

const StudentRegistrationWrapper = () => {
  const [showTerms, setShowTerms] = useState(true);
  const [hasAccepted, setHasAccepted] = useState(false);

  // Check if user has previously accepted terms
  useEffect(() => {
    const accepted = localStorage.getItem('termsAccepted');
    if (accepted === 'true') {
      setHasAccepted(true);
      setShowTerms(false);
    }
  }, []);

  const handleAcceptTerms = () => {
    localStorage.setItem('termsAccepted', 'true');
    setHasAccepted(true);
    setShowTerms(false);
  };

  const handleCloseTerms = () => {
    // If they haven't accepted, keep the modal open
    if (!hasAccepted) {
      return;
    }
    setShowTerms(false);
  };

  return (
    <>
      <TermsAndPrivacyModal
        isOpen={showTerms}
        onClose={handleCloseTerms}
        onAccept={handleAcceptTerms}
      />
      
      {hasAccepted && <StudentRegistrationForm />}
    </>
  );
};

export default StudentRegistrationWrapper;