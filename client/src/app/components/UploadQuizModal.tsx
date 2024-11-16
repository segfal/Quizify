"use client";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTheme } from "./ThemeProvider";
import { cn } from "@/lib/utils";
import { Upload } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface UploadQuizModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function UploadQuizModal({ isOpen, onClose }: UploadQuizModalProps) {
  const { theme } = useTheme();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !title) return;
    setLoading(true);

    try {
      // Upload file to Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const { data: fileData, error: fileError } = await supabase.storage
        .from('quizzes')
        .upload(fileName, file);

      if (fileError) throw fileError;

      // Create quiz record in database
      const { data: quizData, error: quizError } = await supabase
        .from('quizzes')
        .insert([
          {
            title,
            file_path: fileData.path,
            created_by: 'user_id', // You'll need to get this from auth context
            quiz_id: Math.random().toString(36).substring(2, 15),
          }
        ])
        .select();

      if (quizError) throw quizError;

      // Close modal and reset state
      onClose();
      setFile(null);
      setTitle("");
    } catch (error) {
      console.error('Error uploading quiz:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn(
        "sm:max-w-[425px]",
        theme === "dark" ? "bg-black/90 text-white" : "bg-white text-black"
      )}>
        <DialogHeader>
          <DialogTitle>Upload New Quiz</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <div>
            <Label htmlFor="title">Quiz Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={theme === "dark" ? "border-white/20 bg-black/40 text-white" : ""}
            />
          </div>
          <div>
            <Label htmlFor="file">Upload PDF</Label>
            <div className="mt-2">
              <label
                htmlFor="file"
                className={cn(
                  "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer",
                  theme === "dark" ? "border-white/20 hover:border-white/40" : "border-black/20 hover:border-black/40"
                )}
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-2" />
                  <p className="text-sm">
                    {file ? file.name : "Click to upload PDF"}
                  </p>
                </div>
                <Input
                  id="file"
                  type="file"
                  accept=".pdf"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>
          </div>
          <Button
            onClick={handleUpload}
            disabled={!file || !title || loading}
            className="w-full"
          >
            {loading ? "Uploading..." : "Upload Quiz"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 