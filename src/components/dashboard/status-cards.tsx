import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock, BookOpen, CheckCircle2 } from 'lucide-react';
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import apiClient from '@/lib/axios';

interface Document {
  document_type: string;
  // other properties of documents as needed
}

export const StatusCards: React.FC = () => {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const totalRequiredDocuments = 5;

  const fetchDocuments = async () => {
    try {
      const response = await apiClient.get('/documents');


      setDocuments(response.data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
      toast({
        title: "Error",
        description: "Failed to load documents",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);
  //TODO: fix document auto load and fix refresh key auto load
  const submittedDocumentsCount = documents.length;
  const documentProgress = (submittedDocumentsCount / totalRequiredDocuments) * 100;

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
          {loading ? (
            <div className="text-2xl font-bold">Loading...</div>
          ) : (
            <>
              <div className="text-2xl font-bold">
                {submittedDocumentsCount}/{totalRequiredDocuments}
              </div>
              <p className="text-xs text-gray-500">Documents submitted</p>
              <Progress value={documentProgress} className="mt-2" />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
