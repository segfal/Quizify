'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { PdfUpload } from './PdfUpload';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Trash2 } from 'lucide-react';

interface NoteFile {
    note_id: number;
    filename: string;
    url: string;
    filetype: string;
    upload_date: string;
    users: {
        username: string;
    };
}

interface PdfViewerProps {
    roomId: string;
}

export function PdfViewer({ roomId }: PdfViewerProps) {
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const { user, addNote, getNotes, deleteNote } = useSupabase();
    const [isLoading, setIsLoading] = useState(true);
    const [notes, setNotes] = useState<NoteFile[]>([]);

    useEffect(() => {
        loadNotes();
    }, [roomId]);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const notes = await getNotes(parseInt(roomId));
            setNotes(notes);
        } catch (error) {
            console.error('Error loading notes:', error);
            toast.error('Failed to load notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
            // Check if file limit is reached
            if (notes.length >= 20) {
                toast.error('Maximum file limit reached (20 files). Please delete some files before uploading more.');
                return;
            }

            // Check file size (max 30MB)
            if (file.size > 30 * 1024 * 1024) {
                toast.error('File size must be less than 30MB');
                return;
            }

            // Upload file to storage
            const { data: uploadData, error: uploadError } = await supabase.storage
                .from('pdfstore')
                .upload(`${roomId}_${Date.now()}_${file.name}`, file);

            if (uploadError) throw uploadError;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('pdfstore')
                .getPublicUrl(uploadData.path);

            // Add note to database
            await addNote(
                parseInt(roomId),
                file.name,
                file.type,
                publicUrl
            );

            // Reload notes
            await loadNotes();
            toast.success('File uploaded successfully');
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
        }
    };

    const handleDeleteNote = async (noteId: number) => {
        try {
            await deleteNote(noteId);
            await loadNotes();
            toast.success('File deleted successfully');
        } catch (error) {
            console.error('Error deleting note:', error);
            toast.error('Failed to delete file');
        }
    };

    return (
        <div className="h-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-400">PDF Files</h2>
                <PdfUpload roomId={roomId} onUpload={handleFileUpload} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <h3 className="text-sm font-semibold text-blue-400 mb-2">Uploaded Files</h3>
                    {isLoading ? (
                        <div className="flex justify-center py-4">
                            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : notes.length === 0 ? (
                        <div className="text-center text-gray-400 py-4">
                            No files uploaded yet
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {notes.map((note) => (
                                <div
                                    key={note.note_id}
                                    className="flex items-center justify-between group hover:bg-blue-500/10 rounded-lg p-2 transition-colors"
                                >
                                    <button
                                        onClick={() => setSelectedPdf(note.url)}
                                        className={`text-sm ${selectedPdf === note.url ? 'text-blue-400' : 'text-white/70'} hover:text-white truncate flex-1 text-left`}
                                    >
                                        {note.filename}
                                    </button>
                                    <button
                                        onClick={() => handleDeleteNote(note.note_id)}
                                        className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="bg-gray-900/50 rounded-lg p-4 min-h-[400px]">
                    {selectedPdf ? (
                        <iframe
                            src={selectedPdf}
                            className="w-full h-full min-h-[400px] rounded-lg"
                            title="PDF Viewer"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full text-gray-400">
                            Select a PDF to view
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
} 