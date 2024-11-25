// components/campus/CampusView.tsx
"use client"

import InDevelopmentNotice from "@/components/dashboard/indevelop-notice";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Bell, Calendar, MapPin} from 'lucide-react';

export default function CampusView() {
  // Dummy data
  const announcements = [
    {
      id: 1,
      title: "Midterm Examination Schedule",
      content: "Midterm examinations will be held from March 18-22, 2024.",
      date: "2024-03-01",
      type: "Academic"
    },
    {
      id: 2,
      title: "University Week Celebration",
      content: "Join us for the annual University Week celebration!",
      date: "2024-03-15",
      type: "Event"
    },
  ];

  const events = [
    {
      id: 1,
      title: "IT Department Meeting",
      date: "2024-03-20",
      time: "2:00 PM - 4:00 PM",
      location: "Room 301",
      type: "Academic"
    },
    {
      id: 2,
      title: "Campus Job Fair",
      date: "2024-03-25",
      time: "9:00 AM - 5:00 PM",
      location: "University Gymnasium",
      type: "Career"
    },
  ];

  const messages = [
    {
      id: 1,
      sender: "Prof. John Smith",
      message: "Class will be moved to Room 302 tomorrow",
      time: "2:30 PM",
      unread: true
    },
    {
      id: 2,
      sender: "Student Council",
      message: "Don't forget to vote for the new student council officers!",
      time: "Yesterday",
      unread: false
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <Tabs defaultValue="announcements" className="space-y-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="announcements">Announcements</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
          </TabsList>

          {/* Announcements Tab */}
          <TabsContent value="announcements">
            <div className="space-y-6">
              {announcements.map((announcement) => (
                <div key={announcement.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{announcement.title}</h3>
                      <p className="text-gray-600 mt-2">{announcement.content}</p>
                      <div className="mt-4 flex items-center gap-4">
                        <span className="text-sm text-gray-500">{announcement.date}</span>
                        <span className="px-2 py-1 rounded-full bg-blue-100 text-blue-800 text-xs">
                          {announcement.type}
                        </span>
                      </div>
                    </div>
                    <Bell className="text-blue-500" />
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Events Tab */}
          <TabsContent value="events">
            <div className="space-y-6">
              {events.map((event) => (
                <div key={event.id} className="bg-white rounded-xl shadow-sm p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">{event.title}</h3>
                      <div className="mt-4 space-y-2">
                        <p className="text-sm text-gray-600">
                          <Calendar className="inline-block w-4 h-4 mr-2" />
                          {event.date} | {event.time}
                        </p>
                        <p className="text-sm text-gray-600">
                          <MapPin className="inline-block w-4 h-4 mr-2" />
                          {event.location}
                        </p>
                      </div>
                      <span className="mt-4 inline-block px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs">
                        {event.type}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          {/* Messages Tab */}
          <TabsContent value="messages">
            <div className="space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`bg-white rounded-xl shadow-sm p-6 border-l-4 
                    ${message.unread ? 'border-blue-500' : 'border-gray-200'}`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{message.sender}</h3>
                      <p className="text-gray-600 mt-2">{message.message}</p>
                      <span className="text-sm text-gray-500 mt-4 block">{message.time}</span>
                    </div>
                    {message.unread && (
                      <span className="h-3 w-3 bg-blue-500 rounded-full"></span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
    // <>
    // <InDevelopmentNotice/>
    // </>
  );
};
