'use client';

import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload } from 'lucide-react';
import { toast } from 'sonner';

interface PdfUploadProps {
    roomId: string;
    onUpload: (file: File) => Promise<void>;
}

export function PdfUpload({ roomId, onUpload }: PdfUploadProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await handleFile(file);
        }
    };

    const handleFile = async (file: File) => {
        // Check if file is PDF
        if (file.type !== 'application/pdf') {
            toast.error('Please upload a PDF file');
            return;
        }

        // Check file size (max 30MB)
        if (file.size > 30 * 1024 * 1024) {
            toast.error('File size must be less than 30MB');
            return;
        }

        try {
            setIsUploading(true);
            await onUpload(file);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        } catch (error) {
            console.error('Error uploading file:', error);
            toast.error('Failed to upload file');
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full sm:w-auto">
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept=".pdf"
                className="hidden"
            />
            <motion.button
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                    w-full sm:w-auto px-6 py-2.5 rounded-lg flex items-center justify-center gap-3
                    font-medium transition-all duration-200
                    ${isDragging
                        ? 'bg-green-500/80 text-white ring-2 ring-green-400/50 ring-offset-2 ring-offset-[#0B1120]'
                        : 'bg-blue-500/80 hover:bg-blue-600/80 text-white'
                    }
                    ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-lg hover:shadow-blue-500/10'}
                    backdrop-blur-sm
                `}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                disabled={isUploading}
            >
                {isUploading ? (
                    <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <Upload className="w-4 h-4" />
                        <span>{isDragging ? 'Drop PDF here' : 'Upload PDF'}</span>
                    </>
                )}
            </motion.button>
        </div>
    );
} 