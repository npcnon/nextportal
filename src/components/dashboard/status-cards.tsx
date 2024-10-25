// components/dashboard/status-cards.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress"

export const StatusCards = () => {
  return (
    <div className="grid gap-4 md:grid-cols-3 mb-6">
      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enrollment Status</CardTitle>
          <Clock className="h-4 w-4 text-orange-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Pending</div>
          <p className="text-xs text-gray-500">Initially Enrolled</p>
          <Progress value={33} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Enlisted Subjects</CardTitle>
          <BookOpen className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">4/8</div>
          <p className="text-xs text-gray-500">Subjects selected</p>
          <Progress value={50} className="mt-2" />
        </CardContent>
      </Card>

      <Card className="relative overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Requirements</CardTitle>
          <CheckCircle2 className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">5/6</div>
          <p className="text-xs text-gray-500">Documents submitted</p>
          <Progress value={83} className="mt-2" />
        </CardContent>
      </Card>
    </div>
  );
};