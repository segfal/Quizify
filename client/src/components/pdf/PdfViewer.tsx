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
        <div className="w-full h-full flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4">
                <h2 className="text-xl font-semibold text-white">PDF Files</h2>
                <PdfUpload roomId={roomId} onUpload={handleFileUpload} />
            </div>

            <div className="flex-1 w-full overflow-y-auto px-4">
                {isLoading ? (
                    <div className="flex items-center justify-center h-24">
                        <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : notes.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-24 text-gray-400">
                        <p>No files uploaded yet</p>
                        <p className="text-sm">Upload a PDF to get started</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 pb-4">
                        {notes.map((note) => (
                            <div
                                key={note.note_id}
                                className="bg-gray-800/50 backdrop-blur-sm rounded-lg p-4 flex flex-col gap-2 hover:bg-gray-700/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-2">
                                    <a
                                        href={note.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-400 hover:text-blue-300 transition-colors line-clamp-2 flex-1"
                                    >
                                        {note.filename}
                                    </a>
                                    <button
                                        onClick={() => handleDeleteNote(note.note_id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors p-1 rounded-full hover:bg-gray-600/50"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-xs text-gray-400">
                                    Uploaded {new Date(note.upload_date).toLocaleDateString()}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
} 