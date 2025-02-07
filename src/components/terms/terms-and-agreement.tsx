"use client"
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { type CheckedState } from "@radix-ui/react-checkbox";

export default function TermsAndPrivacyModal({ isOpen, onClose, onAccept }) {
  const [accepted, setAccepted] = useState(false);

  const handleCheckedChange = (checked: CheckedState) => {
    setAccepted(checked as boolean);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[800px] w-[90vw] h-[80vh] flex flex-col">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-xl font-bold">
            Terms & Conditions and Privacy Policy
          </DialogTitle>
          <p className="text-sm text-gray-600">
            Last updated: February 7, 2025
          </p>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <div className="space-y-6">
            <section>
              <h3 className="text-lg font-semibold mb-2">Terms and Conditions</h3>
              
              <div className="space-y-4">
                <p>
                  Welcome to our Student Management System. By accessing and enrolling in our system, you agree to be bound by these Terms and Conditions.
                </p>

                <div className="space-y-3">
                  <h4 className="font-semibold">1. Acceptance of Terms</h4>
                  <p>
                    By accessing and using this Student Management System, you acknowledge that you have read, understood, and agree to be bound by these terms and conditions, along with our Privacy Policy.
                  </p>

                  <h4 className="font-semibold">2. Student Information</h4>
                  <p>
                    You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.
                  </p>

                  <h4 className="font-semibold">3. Use of Information</h4>
                  <p>
                    You understand and agree that the school may use your personal information in accordance with our Privacy Policy.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-lg font-semibold mb-2">Privacy Policy</h3>
              
              <div className="space-y-4">
                <div className="space-y-3">
                  <h4 className="font-semibold">1. Information Collection</h4>
                  <p>We collect various types of information, including:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Personal identification information</li>
                    <li>Academic records and history</li>
                    <li>Financial information related to tuition and fees</li>
                    <li>Medical information when relevant</li>
                  </ul>

                  <h4 className="font-semibold">2. Data Protection</h4>
                  <p>
                    We implement appropriate technical and organizational measures to maintain the security of your personal information.
                  </p>
                </div>
              </div>
            </section>
          </div>
        </ScrollArea>

        <div className="pt-4 border-t mt-4">
          <div className="flex items-center space-x-2 mb-4">
            <Checkbox 
              id="terms" 
              checked={accepted}
              onCheckedChange={handleCheckedChange}
            />
            <label
              htmlFor="terms"
              className="text-sm"
            >
              I have read and agree to the Terms & Conditions and Privacy Policy
            </label>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Decline
            </Button>
            <Button
              onClick={onAccept}
              disabled={!accepted}
              className="flex-1"
            >
              Accept & Continue
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}