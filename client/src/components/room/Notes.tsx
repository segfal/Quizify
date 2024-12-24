'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';

interface NotesProps {
    roomId: string;
    initialContent?: string;
    onUpdate: (content: string) => void;
}

export const Notes = ({ roomId, initialContent = '', onUpdate }: NotesProps) => {
    const [content, setContent] = useState(initialContent);
    const debouncedContent = useDebounce(content, 500);

    useEffect(() => {
        if (debouncedContent !== initialContent) {
            onUpdate(debouncedContent);
        }
    }, [debouncedContent, initialContent, onUpdate]);

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="h-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4"
        >
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-blue-400">Notes</h2>
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: content !== initialContent ? 1 : 0 }}
                    className="text-xs text-blue-400/50"
                >
                    Saving...
                </motion.div>
            </div>
            <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[calc(100%-2rem)] bg-transparent resize-none focus:outline-none text-white/90 placeholder-white/30"
                placeholder="Type your notes here..."
            />
        </motion.div>
    );
}; 