
'use client'


import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

// components/chat/FloatingChat.tsx
export const FloatingChat = () => {
    const [isOpen, setIsOpen] = useState(false);
  
    return (
      <>
        {/* Floating Button - Always visible in bottom right */}
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 flex items-center justify-center"
        >
          <MessageCircle className="h-6 w-6" />
        </button>
  
        {/* Chat Modal/Overlay */}
        {isOpen && (
          <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-lg shadow-xl">
            
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-2 right-2"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </>
    );
  };