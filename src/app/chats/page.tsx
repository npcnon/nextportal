// app/chat/page.tsx
"use client"

import { useState } from 'react';
import { Search, Phone, VideoIcon, MoreVertical, Send, Paperclip, SmilePlus } from 'lucide-react';
import { Input } from "@/components/ui/input"

// Dummy data
const chats = [
  {
    id: 1,
    name: "Prof. John Smith",
    lastMessage: "Class will be moved to Room 302 tomorrow",
    time: "2:30 PM",
    unread: 2,
    online: true,
    avatar: null
  },
  {
    id: 2,
    name: "Student Council",
    lastMessage: "Don't forget to vote for the new student council officers!",
    time: "Yesterday",
    unread: 0,
    online: false,
    avatar: null
  },
  // Add more chat items...
];

const messages = [
  {
    id: 1,
    sender: "Prof. John Smith",
    content: "Class will be moved to Room 302 tomorrow",
    time: "2:30 PM",
    isSent: false
  },
  {
    id: 2,
    sender: "You",
    content: "Okay, thank you for letting us know!",
    time: "2:31 PM",
    isSent: true
  },
  // Add more messages...
];

export default function ChatPage() {
  const [selectedChat, setSelectedChat] = useState(chats[0]);
  const [messageInput, setMessageInput] = useState("");

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Chat List Sidebar */}
      <div className="w-1/4 bg-white border-r">
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold mb-4">Messages</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search messages"
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="overflow-y-auto h-[calc(100vh-130px)]">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`p-4 hover:bg-gray-50 cursor-pointer ${
                selectedChat.id === chat.id ? 'bg-gray-50' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                    {chat.avatar || chat.name.charAt(0)}
                  </div>
                  {chat.online && (
                    <div className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h3 className="font-medium truncate">{chat.name}</h3>
                    <span className="text-xs text-gray-500">{chat.time}</span>
                  </div>
                  <p className="text-sm text-gray-500 truncate">{chat.lastMessage}</p>
                </div>
                {chat.unread > 0 && (
                  <span className="h-5 w-5 bg-blue-500 rounded-full text-white text-xs flex items-center justify-center">
                    {chat.unread}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col">
        {/* Chat Header */}
        <div className="bg-white p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              {selectedChat.name.charAt(0)}
            </div>
            <div>
              <h3 className="font-medium">{selectedChat.name}</h3>
              {selectedChat.online && (
                <span className="text-xs text-green-500">Online</span>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Phone className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <VideoIcon className="h-5 w-5" />
            </button>
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <MoreVertical className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.isSent ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[70%] rounded-lg p-3 ${
                  message.isSent
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p>{message.content}</p>
                <span className={`text-xs ${
                  message.isSent ? 'text-blue-100' : 'text-gray-500'
                } block mt-1`}>
                  {message.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Message Input */}
        <div className="bg-white border-t p-4">
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <Paperclip className="h-5 w-5 text-gray-500" />
            </button>
            <Input
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type a message..."
              className="flex-1"
            />
            <button className="p-2 hover:bg-gray-100 rounded-full">
              <SmilePlus className="h-5 w-5 text-gray-500" />
            </button>
            <button 
              className="p-2 bg-blue-500 hover:bg-blue-600 rounded-full text-white"
              disabled={!messageInput.trim()}
            >
              <Send className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}