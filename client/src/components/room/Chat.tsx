'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface Message {
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
}

interface ChatProps {
    roomId: string;
    socket: any;
    messages: Message[];
    onSendMessage: (content: string) => void;
}

export const Chat = ({ roomId, socket, messages, onSendMessage }: ChatProps) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            // Add message locally first for immediate feedback
            const message: Message = {
                userId: 'user123', // This would come from auth in a real app
                userName: 'You',
                content: newMessage.trim(),
                timestamp: new Date()
            };
            
            // Call the parent's onSendMessage
            onSendMessage(newMessage.trim());
            
            // Clear the input
            setNewMessage('');
        } else {
            toast.error('Please enter a message');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-xl font-semibold">Chat</h2>
                <p className="text-sm text-gray-400">Room ID: {roomId}</p>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((message, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="break-words"
                        >
                            <div className="flex items-start gap-2">
                                <span className="font-semibold text-purple-400">
                                    {message.userName}:
                                </span>
                                <p className="text-white/90">{message.content}</p>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {new Date(message.timestamp).toLocaleTimeString()}
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={handleSend} className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-2 bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                    >
                        Send
                    </motion.button>
                </div>
            </form>
        </div>
    );
}; 