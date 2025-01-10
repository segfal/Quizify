'use client';

import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/utils/supabase/client';
import type { DragEvent } from 'react';
import type { PdfUploadProps } from '@/interfaces/pdf/types';

export function PdfUpload({ userId, onUploadSuccess }: PdfUploadProps) {
    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        if (acceptedFiles.length === 0) {
            toast.error('Please select a PDF file');
            return;
        }

        const file = acceptedFiles[0];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const fileName = `${userId}_${timestamp}_${file.name}`;

        try {
            const { data, error } = await supabase.storage
                .from('pdfstore')
                .upload(fileName, file, {
                    contentType: 'application/pdf',
                    cacheControl: '3600'
                });

            if (error) throw error;

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from('pdfstore')
                .getPublicUrl(fileName);

            toast.success('PDF uploaded successfully!');
            onUploadSuccess(publicUrl);
        } catch (error) {
            console.error('Error uploading PDF:', error);
            toast.error('Failed to upload PDF');
        }
    }, [userId, onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1,
        multiple: false,
        onDragEnter: (event: DragEvent) => {
            event.preventDefault();
        },
        onDragOver: (event: DragEvent) => {
            event.preventDefault();
        },
        onDragLeave: (event: DragEvent) => {
            event.preventDefault();
        }
    });

    const dropzoneProps = getRootProps();
    const inputProps = getInputProps();

    return (
        <div
            {...dropzoneProps}
            className={`
                p-8 border-2 border-dashed rounded-lg cursor-pointer transition-colors
                ${isDragActive 
                    ? 'border-purple-500 bg-purple-500/10' 
                    : 'border-gray-700 hover:border-purple-500/50 hover:bg-purple-500/5'}
            `}
        >
            <input {...inputProps} />
            <div className="flex flex-col items-center gap-4">
                <Upload className="w-12 h-12 text-gray-400" />
                {isDragActive ? (
                    <p className="text-purple-400">Drop the PDF here...</p>
                ) : (
                    <div className="text-center">
                        <p className="text-gray-400">
                            Drag & drop a PDF file here, or click to select
                        </p>
                        <p className="text-gray-500 text-sm mt-2">
                            (Only PDF files are accepted)
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
} 