'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '@/utils/supabase/client';
import { toast } from 'sonner';
import { PdfUpload } from './PdfUpload';
import { useSupabase } from '@/contexts/SupabaseContext';

interface PdfViewerProps {
    roomId: string;
}

export function PdfViewer({ roomId }: PdfViewerProps) {
    const [pdfFiles, setPdfFiles] = useState<{ name: string; url: string }[]>([]);
    const [selectedPdf, setSelectedPdf] = useState<string | null>(null);
    const { user } = useSupabase();

    useEffect(() => {
        loadPdfFiles();
    }, [roomId]);

    const loadPdfFiles = async () => {
        try {
            const { data: files, error } = await supabase.storage
                .from('pdfstore')
                .list('', {
                    search: `${roomId}_`,
                    sortBy: { column: 'name', order: 'desc' }
                });

            if (error) throw error;

            const fileUrls = await Promise.all(
                files.map(async (file) => {
                    const { data: { publicUrl } } = supabase.storage
                        .from('pdfstore')
                        .getPublicUrl(file.name);
                    return {
                        name: file.name.split('_').slice(2).join('_'), // Remove userId and timestamp
                        url: publicUrl
                    };
                })
            );

            setPdfFiles(fileUrls);
        } catch (error) {
            console.error('Error loading PDF files:', error);
            toast.error('Failed to load PDF files');
        }
    };

    const handleUploadSuccess = (url: string) => {
        loadPdfFiles(); // Reload the list after successful upload
        setSelectedPdf(url); // Automatically show the newly uploaded PDF
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full flex flex-col bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-400">PDF Files</h2>
                {user && <PdfUpload userId={user.user_id.toString()} onUploadSuccess={handleUploadSuccess} />}
            </div>

            <div className="flex h-full">
                {/* PDF List Sidebar */}
                <div className="w-1/4 pr-4 border-r border-blue-500/20">
                    <div className="space-y-2">
                        {pdfFiles.map((file) => (
                            <motion.button
                                key={file.url}
                                onClick={() => setSelectedPdf(file.url)}
                                className={`w-full text-left p-2 rounded-lg transition-colors ${
                                    selectedPdf === file.url
                                        ? 'bg-blue-500/30 text-white'
                                        : 'text-white/70 hover:bg-blue-500/20'
                                }`}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                {file.name}
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 pl-4">
                    {selectedPdf ? (
                        <iframe
                            src={`${selectedPdf}#toolbar=0`}
                            className="w-full h-full rounded-lg"
                            style={{ background: 'white' }}
                        />
                    ) : (
                        <div className="h-full flex items-center justify-center text-white/50">
                            Select a PDF to view
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
} 