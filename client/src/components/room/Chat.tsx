'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Socket } from 'socket.io-client';
import moment from 'moment';
import { useSocket } from '@/contexts/SocketContext';
import { useUser } from '@/contexts/UserContext';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { toast } from 'sonner';
import { ChatMessage, ChatProps } from '@/interfaces/chat/types';

export function Chat({ roomId, socket }: ChatProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const processedMessageIds = useRef<Set<string>>(new Set());
    const { sendMessage, getMessages } = useSupabase();
    const authUser = useSelector((state: RootState) => state.user);

    // Scroll to bottom when new messages arrive
    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    // Load initial messages and set up socket listeners
    useEffect(() => {
        if (!socket) {
            console.log('Socket not available');
            return;
        }

        // Load previous messages
        const loadMessages = async () => {
            try {
                const previousMessages = await getMessages(parseInt(roomId));
                setMessages(previousMessages.map(msg => ({
                    roomId: msg.room_id.toString(),
                    message: msg.message_text,
                    userId: msg.user_id,
                    username: msg.users.username,
                    timestamp: new Date(msg.created_at).getTime()
                })));
                scrollToBottom('auto'); // Scroll to bottom without animation for initial load
            } catch (error) {
                console.error('Error loading messages:', error);
                toast.error('Failed to load messages');
            } finally {
                setIsLoading(false);
            }
        };

        console.log('Setting up chat socket listeners for room:', roomId);
        loadMessages();
        
        // Message handler
        const handleMessage = (messageData: ChatMessage) => {
            console.log('Chat message received:', messageData);
            
            // Generate a unique message ID
            const messageId = `${messageData.timestamp}-${messageData.userId}`;
            
            // Check if we've already processed this message
            if (processedMessageIds.current.has(messageId)) {
                console.log('Duplicate chat message detected, skipping:', messageId);
                return;
            }

            // Add message ID to processed set
            processedMessageIds.current.add(messageId);
            
            // Update messages state
            setMessages(prev => [...prev, messageData]);
            
            // Scroll to bottom
            scrollToBottom();
        };

        // Set up event listeners
        socket.on('message', handleMessage);
        
        // Join room
        socket.emit('join_room', { 
            roomId,
            playerName: authUser.username || 'Anonymous Player'
        });

        // Cleanup
        return () => {
            console.log('Cleaning up chat socket listeners');
            socket.off('message', handleMessage);
            socket.emit('leave_room', { roomId });
            processedMessageIds.current.clear();
        };
    }, [socket, roomId, authUser.username]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!socket) {
            toast.error('Chat connection not available');
            return;
        }

        if (!message.trim()) {
            return;
        }

        if (!authUser.isAuthenticated) {
            toast.error('Please login to send messages');
            return;
        }
        
        const messageText = message.trim();
        setMessage(''); // Clear input immediately

        try {
            // Create message payload
            const messageData: ChatMessage = {
                roomId,
                message: messageText,
                userId: socket.id,
                username: authUser.username || 'Anonymous Player',
                timestamp: Date.now()
            };

            // Send message via socket
            socket.emit('message', messageData);

            // Save to database in the background
            await sendMessage(parseInt(roomId), messageText).catch(error => {
                console.error('Error saving message to database:', error);
            });

        } catch (error) {
            console.error('Error sending message:', error);
            setMessage(messageText); // Restore message if failed
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800">
                <h3 className="text-lg font-semibold text-white">Chat</h3>
            </div>

            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4">
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="flex justify-center py-2">
                            <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="text-center text-gray-400">
                            No messages yet. Start the conversation!
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={`${msg.timestamp}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`flex flex-col ${
                                    msg.userId === socket?.id ? 'items-end' : 'items-start'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className="text-sm text-gray-400">
                                        {msg.userId === socket?.id ? 'You' : msg.username}
                                    </span>
                                </div>
                                <div
                                    className={`rounded-lg px-3 py-2 max-w-[80%] break-words ${
                                        msg.userId === socket?.id
                                            ? 'bg-purple-500 text-white'
                                            : 'bg-gray-700 text-white'
                                    }`}
                                >
                                    {msg.message}
                                </div>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-800 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <button
                        type="submit"
                        className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg text-white transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
} 