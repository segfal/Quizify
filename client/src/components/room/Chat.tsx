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

export function Chat({ roomId }: ChatProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);
    const [hasMoreMessages, setHasMoreMessages] = useState(true);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const { sendMessage: sendMessageToDb, getMessages } = useSupabase();
    const { socket, isConnected } = useSocket();
    const { userId, username } = useUser();
    const user = useSelector((state: RootState) => state.user);
    const PAGE_SIZE = 50;

    // Scroll to bottom when new messages arrive
    const scrollToBottom = (behavior: 'smooth' | 'auto' = 'smooth') => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior });
        }
    };

    // Handle scroll to load more messages
    const handleScroll = async () => {
        if (!messagesContainerRef.current || isLoadingMore || !hasMoreMessages) return;

        const { scrollTop } = messagesContainerRef.current;
        if (scrollTop === 0) {
            setIsLoadingMore(true);
            try {
                const oldestMessageTimestamp = messages[0]?.timestamp;
                const olderMessages = await getMessages(parseInt(roomId), PAGE_SIZE, oldestMessageTimestamp);
                
                if (olderMessages.length < PAGE_SIZE) {
                    setHasMoreMessages(false);
                }

                if (olderMessages.length > 0) {
                    const newMessages = olderMessages.map(msg => ({
                        message: msg.message_text,
                        roomId: roomId,
                        userId: msg.user_id.toString(),
                        username: msg.users?.username || 'Unknown User',
                        timestamp: msg.created_at
                    }));
                    
                    // Preserve scroll position
                    const scrollContainer = messagesContainerRef.current;
                    const oldHeight = scrollContainer.scrollHeight;
                    
                    setMessages(prev => [...newMessages, ...prev]);
                    
                    // Restore scroll position after new messages are added
                    requestAnimationFrame(() => {
                        const newHeight = scrollContainer.scrollHeight;
                        scrollContainer.scrollTop = newHeight - oldHeight;
                    });
                }
            } catch (error) {
                console.error('Error loading more messages:', error);
                toast.error('Failed to load more messages');
            } finally {
                setIsLoadingMore(false);
            }
        }
    };

    // Load initial messages
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const chatMessages = await getMessages(parseInt(roomId), PAGE_SIZE);
                setMessages(chatMessages.map(msg => ({
                    message: msg.message_text,
                    roomId: roomId,
                    userId: msg.user_id.toString(),
                    username: msg.users?.username || 'Unknown User',
                    timestamp: msg.created_at
                })));
                setTimeout(() => scrollToBottom('auto'), 100);
            } catch (error) {
                console.error('Error loading messages:', error);
                toast.error('Failed to load messages');
            } finally {
                setIsLoading(false);
            }
        };

        if (isConnected) {
            loadMessages();
        }
    }, [roomId, getMessages, isConnected]);

    // Auto-scroll on new messages
    useEffect(() => {
        if (!isLoading && !isLoadingMore) {
            scrollToBottom();
        }
    }, [messages, isLoading, isLoadingMore]);

    // Listen for real-time updates
    useEffect(() => {
        if (!socket || !isConnected) {
            console.log('Socket not ready');
            return;
        }

        console.log('Setting up socket listeners for room:', roomId);
        
        // Join room
        socket.emit('join_room', roomId);

        // Message handler
        const onMessage = (messageData: string | ChatMessage) => {
            console.log('Message received:', messageData);
            
            // If messageData is just a string (the message text)
            if (typeof messageData === 'string') {
                const newMessage: ChatMessage = {
                    message: messageData,
                    roomId: roomId,
                    userId: userId || 'system',
                    username: username || 'System',
                    timestamp: new Date().toISOString()
                };
                setMessages(prev => [...prev, newMessage]);
            } 
            // If messageData is a full message object
            else if (messageData && typeof messageData === 'object') {
                setMessages(prev => [...prev, messageData]);
            } else {
                console.error('Invalid message data:', messageData);
                return;
            }
        };

        // Set up event listeners
        socket.on('message', onMessage);
        
        // Cleanup
        return () => {
            console.log('Cleaning up socket listeners');
            socket.emit('leave_room', roomId);
            socket.off('message');
        };
    }, [socket, isConnected, roomId, userId, username]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!socket || !isConnected) {
            toast.error('Chat connection not available');
            return;
        }

        if (!message.trim()) {
            return;
        }

        if (!user.isAuthenticated) {
            toast.error('Please login to send messages');
            return;
        }
        
        const messageText = message.trim();
        setMessage(''); // Clear input immediately

        try {
            // Create message payload
            const messagePayload: ChatMessage = {
                roomId,
                message: messageText,
                userId: user.id?.toString() || '',
                username: user.username || '',
                timestamp: new Date().toISOString()
            };

            // Send message via socket first
            socket.emit('message', messagePayload);

            // Save to database
            await sendMessageToDb(parseInt(roomId), messageText);

        } catch (error) {
            console.error('Error sending message:', error);
            setMessage(messageText); // Restore message if failed
            toast.error('Failed to send message');
        }
    };

    return (
        <div className="bg-gray-900 border-l border-gray-800 w-[350px] h-[calc(100vh-80px)] fixed right-0 top-20 flex flex-col">
            {/* Chat Header */}
            <div className="px-4 py-3 border-b border-gray-800 flex items-center justify-between bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
                <h2 className="text-lg font-semibold">Chat</h2>
                <div className="text-sm text-gray-400">
                    {isConnected ? (
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                            Connected
                        </span>
                    ) : (
                        <span className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                            Disconnected
                        </span>
                    )}
                </div>
            </div>

            {/* Messages Container */}
            <div 
                ref={messagesContainerRef}
                onScroll={handleScroll}
                className="flex-1 overflow-y-auto min-h-0 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent"
            >
                <div className="p-4 space-y-2 min-h-full">
                    {/* Loading more messages indicator */}
                    {isLoadingMore && (
                        <div className="flex justify-center py-2">
                            <div className="w-5 h-5 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                        </div>
                    )}

                    {(!isConnected || isLoading) ? (
                        <div className="flex flex-col justify-center items-center h-full gap-2 py-4">
                            <div className="w-6 h-6 border-3 border-purple-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm text-gray-400">
                                {!isConnected ? 'Connecting to chat...' : 'Loading messages...'}
                            </p>
                        </div>
                    ) : messages.length === 0 ? (
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center text-gray-400 py-4 text-sm">
                                No messages yet. Start the conversation!
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, index) => (
                            <motion.div
                                key={`${msg.timestamp}-${index}`}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.2 }}
                                className="group hover:bg-gray-800/50 px-2 py-1 rounded"
                            >
                                <div className="flex items-start gap-1 text-sm">
                                    <span className="font-medium text-purple-400">
                                        {msg.userId === user.id?.toString() ? 'You' : msg.username}:
                                    </span>
                                    <span className="text-gray-100 break-words flex-1">{msg.message}</span>
                                </div>
                                <span className="text-[10px] text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    {msg.timestamp ? moment(msg.timestamp).format('h:mm A') : ''}
                                </span>
                            </motion.div>
                        ))
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Message Input */}
            <div className="p-3 border-t border-gray-800 bg-gray-900/95 backdrop-blur supports-[backdrop-filter]:bg-gray-900/75">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder="Send a message"
                        className="flex-1 bg-gray-800 text-sm rounded px-3 py-2 focus:outline-none focus:ring-1 focus:ring-purple-500 placeholder-gray-500"
                    />
                    <motion.button
                        whileTap={{ scale: 0.95 }}
                        type="submit"
                        disabled={!message.trim() || !isConnected}
                        className="px-4 py-2 bg-purple-500 text-white text-sm font-medium rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-purple-600 transition-colors"
                    >
                        Chat
                    </motion.button>
                </form>
            </div>
        </div>
    );
} 