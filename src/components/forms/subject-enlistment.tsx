// components/forms/subject-enlistment.tsx
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const subjects = [
  {
    id: 1,
    code: 'MATH101',
    name: 'Mathematics 101',
    units: 3,
    schedule: 'MWF 9:00-10:30',
    slots: 15,
    status: 'available'
  },
  {
    id: 2,
    code: 'ENG101',
    name: 'English Composition',
    units: 3,
    schedule: 'TTH 13:00-14:30',
    slots: 3,
    status: 'limited'
  },
  // Add more subjects as needed
];

export const SubjectEnlistment = () => {
  const getSlotStatusVariant = (slots: number) => {
    if (slots > 5) return "default" // Green badge for plenty of slots
    if (slots > 0) return "secondary" // Orange/gray badge for limited slots
    return "destructive" // Red badge for no slots
  }

  const getSlotStatusText = (slots: number) => {
    if (slots > 5) return `${slots} slots available`
    if (slots > 0) return `${slots} slots left`
    return "No slots available"
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Available Subjects</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Code</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Units</TableHead>
              <TableHead>Schedule</TableHead>
              <TableHead>Availability</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {subjects.map((subject) => (
              <TableRow key={subject.id}>
                <TableCell className="font-medium">{subject.code}</TableCell>
                <TableCell>{subject.name}</TableCell>
                <TableCell>{subject.units}</TableCell>
                <TableCell>{subject.schedule}</TableCell>
                <TableCell>
                  <Badge variant={getSlotStatusVariant(subject.slots)}>
                    {getSlotStatusText(subject.slots)}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Button 
                    variant="outline" 
                    size="sm"
                    disabled={subject.slots === 0}
                  >
                    Enlist
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

// If you want to customize the badge colors further, you can add these to your globals.css:
/*
@layer components {
  .badge-success {
    @apply bg-green-100 text-green-800 hover:bg-green-100/80;
  }
  
  .badge-warning {
    @apply bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80;
  }
}
*/