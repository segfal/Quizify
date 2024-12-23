'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { uploadPdf } from '@/lib/supabase/storage';
import { toast } from 'sonner';

interface PdfUploadProps {
    userId: string;
    onUploadSuccess?: (url: string) => void;
}

export const PdfUpload = ({ userId, onUploadSuccess }: PdfUploadProps) => {
    const [isUploading, setIsUploading] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;

        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        setIsUploading(true);
        try {
            const data = await uploadPdf(file, userId);
            toast.success('PDF uploaded successfully!');
            onUploadSuccess?.(data.path);
        } catch (error) {
            toast.error('Failed to upload PDF');
            console.error(error);
        } finally {
            setIsUploading(false);
        }
    }, [userId, onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'application/pdf': ['.pdf']
        },
        maxFiles: 1
    });

    return (
        <div
            {...getRootProps()}
            className={`
                p-8 border-2 border-dashed rounded-lg cursor-pointer
                transition-colors duration-200 ease-in-out
                ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}
            `}
        >
            <input {...getInputProps()} />
            <div className="text-center">
                {isUploading ? (
                    <p className="text-gray-600">Uploading...</p>
                ) : isDragActive ? (
                    <p className="text-blue-500">Drop the PDF here</p>
                ) : (
                    <div>
                        <p className="text-gray-600">Drag and drop a PDF here, or click to select</p>
                        <p className="text-sm text-gray-400 mt-2">Only PDF files are accepted</p>
                    </div>
                )}
            </div>
        </div>
    );
}; 