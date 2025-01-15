'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { PdfViewer } from '../pdf/PdfViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { Trash2 } from 'lucide-react';
import { NotesProps, NoteFile } from '@/interfaces/notes/types';


export const Notes = ({ roomId, initialContent = '', onUpdate }: NotesProps) => {
    const [content, setContent] = useState(initialContent);
    const [pdfFiles, setPdfFiles] = useState<NoteFile[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const debouncedContent = useDebounce(content, 500);
    const { getNotes, deleteNote, addNote } = useSupabase();

    useEffect(() => {
        if (debouncedContent !== initialContent) {
            onUpdate(debouncedContent);
        }
    }, [debouncedContent, initialContent, onUpdate]);

    useEffect(() => {
        loadNotes();
    }, [roomId]);

    const loadNotes = async () => {
        try {
            setIsLoading(true);
            const notes = await getNotes(parseInt(roomId));
            setPdfFiles(notes);
        } catch (error) {
            console.error('Error loading notes:', error);
            toast.error('Failed to load notes');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = async (file: File) => {
        try {
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
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full"
        >
            <Tabs defaultValue="notes" className="h-full">
                <TabsList className="grid w-full grid-cols-2 bg-blue-500/10 border-blue-500/20">
                    <TabsTrigger value="notes" className="text-blue-400">Text Notes</TabsTrigger>
                    <TabsTrigger value="pdfs" className="text-blue-400">PDF Files</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="h-[calc(100%-48px)]">
                    <div className="h-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
                        <div className="flex justify-between items-center mb-2">
                            <h2 className="text-lg font-semibold text-blue-400">Notes</h2>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: content !== initialContent ? 1 : 0 }}
                                className="text-xs text-blue-400/50"
                            >
                                Saving...
                            </motion.div>
                        </div>
                        <div className="flex h-[calc(100%-2rem)]">
                            <div className="flex-1 pr-3">
                                <textarea
                                    value={content}
                                    onChange={(e) => setContent(e.target.value)}
                                    className="w-full h-full bg-transparent resize-none focus:outline-none text-white/90 placeholder-white/30 text-sm"
                                    placeholder="Type your notes here..."
                                />
                            </div>
                            <div className="w-48 border-l border-blue-500/20 pl-3">
                                <h3 className="text-xs font-semibold text-blue-400 mb-2">Uploaded Files</h3>
                                {isLoading ? (
                                    <div className="flex justify-center py-2">
                                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                    </div>
                                ) : (
                                    <div className="space-y-1.5 max-h-[calc(100%-2rem)] overflow-y-auto">
                                        {pdfFiles.map((file) => (
                                            <div
                                                key={file.note_id}
                                                className="flex items-center justify-between group hover:bg-blue-500/10 rounded-lg p-1.5 transition-colors"
                                            >
                                                <a
                                                    href={file.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs text-white/70 hover:text-white truncate flex-1"
                                                >
                                                    {file.filename}
                                                </a>
                                                <button
                                                    onClick={() => handleDeleteNote(file.note_id)}
                                                    className="p-1 text-red-400 hover:text-red-300 opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <Trash2 className="w-3 h-3" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="pdfs" className="h-[calc(100%-48px)]">
                    <PdfViewer 
                        roomId={roomId}
                    />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}; 