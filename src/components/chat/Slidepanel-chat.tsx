
'use client'

import { MessageCircle, X } from "lucide-react";
import { useState } from "react";

// components/chat/SlidePanelChat.tsx
export const SlidePanelChat = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Chat Button in Header */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <MessageCircle className="h-6 w-6" />
        {/* Notification Badge */}
        <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
          2
        </span>
      </button>

      {/* Slide Panel */}
      {isOpen && (
        <div className="fixed inset-y-0 right-0 w-96 bg-white shadow-xl transform transition-transform">
          
          <button
            onClick={() => setIsOpen(false)}
            className="absolute top-4 left-4"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}
    </>
  );
};