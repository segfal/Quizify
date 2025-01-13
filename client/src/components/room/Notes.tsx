'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useDebounce } from '@/hooks/useDebounce';
import { PdfViewer } from '../pdf/PdfViewer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
            className="h-full"
        >
            <Tabs defaultValue="notes" className="h-full">
                <TabsList className="grid w-full grid-cols-2 bg-blue-500/10 border-blue-500/20">
                    <TabsTrigger value="notes" className="text-blue-400">Text Notes</TabsTrigger>
                    <TabsTrigger value="pdfs" className="text-blue-400">PDF Files</TabsTrigger>
                </TabsList>

                <TabsContent value="notes" className="h-[calc(100%-48px)]">
                    <div className="h-full bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
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
                    </div>
                </TabsContent>

                <TabsContent value="pdfs" className="h-[calc(100%-48px)]">
                    <PdfViewer roomId={roomId} />
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}; 