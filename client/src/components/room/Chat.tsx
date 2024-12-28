'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useSupabase } from '@/contexts/SupabaseContext';
import { Socket } from 'socket.io-client';

interface ChatProps {
    roomId: string;
    socket: Socket | null;
}

interface Message {
    message_id: number;
    room_id: number;
    user_id: number;
    message_text: string;
    created_at: string;
    users: {
        username: string;
    };
}

interface RawMessage {
    message_id: number;
    room_id: number;
    user_id: number;
    message_text: string;
    created_at: string;
    users?: {
        username: string;
    };
}

export function Chat({ roomId, socket }: ChatProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const { user, sendMessage, getMessages } = useSupabase();

    // Scroll to bottom when new messages arrive
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);
    
    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const chatMessages = await getMessages(parseInt(roomId)) as RawMessage[];
                const formattedMessages = chatMessages.map(msg => ({
                    ...msg,
                    users: msg.users || { username: 'Unknown User' }
                }));
                setMessages(formattedMessages);
                // Scroll to bottom after loading initial messages
                setTimeout(scrollToBottom, 100);
            } catch (error) {
                console.error('Error loading messages:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadMessages();
    }, [roomId, getMessages]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket) {
            console.log('No socket connection');
            return;
        }

        console.log('Setting up socket listeners for room:', roomId);

        // Debug socket connection
        socket.on('connect', () => {
            console.log('Socket connected with ID:', socket.id);
        });

        socket.on('connect_error', (error) => {
            console.error('Socket connection error:', error);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        // Join room
        socket.emit('join_room', roomId);
        console.log('Joined room:', roomId);
        console.log('Socket connected:', socket.connected);

        // Message handler with better error handling and logging
        const handleMessage = (data: any) => {
            console.log('Raw message received:', data);
            
            if (!data) {
                console.log('Received empty message data');
                return;
            }
            
            try {
                const messageData = data.message || data;
                console.log('Processing message data:', messageData);

                // Validate required fields
                if (!messageData.message_text || !messageData.user_id) {
                    console.error('Invalid message format:', messageData);
                    return;
                }

                const formattedMessage = {
                    message_id: messageData.message_id,
                    room_id: parseInt(roomId),
                    user_id: messageData.user_id,
                    message_text: messageData.message_text,
                    created_at: messageData.created_at || new Date().toISOString(),
                    users: {
                        username: messageData.users?.username || messageData.username || 'Unknown User'
                    }
                } as Message;

                console.log('Formatted message:', formattedMessage);
                setMessages(prev => [...prev, formattedMessage]);
                scrollToBottom();
            } catch (error) {
                console.error('Error handling message:', error);
            }
        };

        // Listen for messages
        socket.on('message', handleMessage);

        return () => {
            console.log('Cleaning up socket listeners for room:', roomId);
            socket.emit('leave_room', roomId);
            socket.off('message', handleMessage);
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
        };
    }, [socket, roomId]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Log initial state
        console.log('Attempting to send message:', {
            message: message.trim(),
            user: user,
            socket: socket?.connected,
            roomId: roomId
        });

        if (!message.trim()) {
            console.log('Message is empty, not sending');
            return;
        }
        if (!user) {
            console.log('No user found, not sending');
            return;
        }
        if (!socket) {
            console.log('No socket connection, not sending');
            return;
        }
        if (!socket.connected) {
            console.log('Socket is not connected, not sending');
            return;
        }

        const messageText = message.trim();
        setMessage(''); // Clear input immediately for better UX

        try {
            console.log('Sending message to database...');
            // Send to database
            const newMessage = await sendMessage(parseInt(roomId), messageText);
            console.log('Message saved to database:', newMessage);

            // Create the message payload
            const messagePayload = {
                roomId: parseInt(roomId),
                message: {
                    message_id: newMessage.message_id,
                    room_id: parseInt(roomId),
                    user_id: user.user_id,
                    message_text: messageText,
                    created_at: newMessage.created_at,
                    users: {
                        username: user.username
                    }
                }
            };

            console.log('Emitting message to socket:', messagePayload);
            // Emit to socket with the correct format
            socket.emit('message', messagePayload);

            // Add message to local state immediately
            const formattedMessage = {
                message_id: newMessage.message_id,
                room_id: parseInt(roomId),
                user_id: user.user_id,
                message_text: messageText,
                created_at: newMessage.created_at,
                users: {
                    username: user.username
                }
            };
            setMessages(prev => [...prev, formattedMessage]);
            scrollToBottom();

        } catch (error) {
            console.error('Error sending message:', error);
            setMessage(messageText); // Restore message if send fails
        }
    };

    return (
        <div className="flex flex-col h-full">
            <div className="p-4 border-b border-gray-800">
                <h2 className="text-lg font-semibold">Chat</h2>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : messages.length === 0 ? (
                    <div className="text-center text-gray-500">
                        No messages yet. Start the conversation!
                    </div>
                ) : (
                    messages.map((msg) => (
                        <motion.div
                            key={msg.message_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex flex-col ${
                                msg.user_id === user?.user_id ? 'items-end' : 'items-start'
                            }`}
                        >
                            <div
                                className={`max-w-[80%] rounded-lg p-3 ${
                                    msg.user_id === user?.user_id
                                        ? 'bg-purple-500 text-white'
                                        : 'bg-gray-800 text-gray-100'
                                }`}
                            >
                                <p className="text-sm font-medium mb-1">
                                    {msg.user_id === user?.user_id ? 'You' : msg.users.username}
                                </p>
                                <p>{msg.message_text}</p>
                            </div>
                            <span className="text-xs text-gray-500 mt-1">
                                {new Date(msg.created_at).toLocaleTimeString()}
                            </span>
                        </motion.div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-800">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 bg-gray-900 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!message.trim()}
                        className="px-4 py-2 bg-purple-500 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                    >
                        Send
                    </motion.button>
                </div>
            </form>
        </div>
    );
} 