'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/hooks/useSocket';
import { motion } from 'framer-motion';
import { Chat } from '@/components/room/Chat';
import { useRouter, useParams } from 'next/navigation';
import { toast } from 'sonner';
import { QuizRoom } from '@/components/quiz/QuizRoom';
import { useSupabase } from '@/contexts/SupabaseContext';
import { supabase } from '@/utils/supabase/client';

interface Message {
    userId: string;
    userName: string;
    content: string;
    timestamp: Date;
}

interface Note {
    id: string;
    name: string;
    type: 'pdf' | 'txt' | 'doc';
    uploadedBy: string;
    uploadedAt: string;
}

interface RoomData {
    room_id: number;
    room_name: string;
    subject: string;
    members: number;
    room_code: string;
    created: string;
    user_id: number;
    last_active: string;
}

export default function RoomPage() {
    const router = useRouter();
    const params = useParams();
    const roomId = params?.roomId as string;
    const { user } = useSupabase();
    
    const { socket, joinRoom, leaveRoom } = useSocket();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedFeature, setSelectedFeature] = useState<'whiteboard' | 'quiz' | null>(null);
    const [isQuizMinimized, setIsQuizMinimized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [copySuccess, setCopySuccess] = useState(false);
    
    const [notes] = useState<Note[]>([
        // Dummy notes for testing
        { 
            id: '1', 
            name: 'Chapter 1 - Calculus Notes.pdf',
            type: 'pdf',
            uploadedBy: 'John',
            uploadedAt: '2024-02-20'
        },
        { 
            id: '2', 
            name: 'Physics Formulas.txt',
            type: 'txt',
            uploadedBy: 'Sarah',
            uploadedAt: '2024-02-19'
        },
        { 
            id: '3', 
            name: 'Study Guide - Midterm.pdf',
            type: 'pdf',
            uploadedBy: 'Mike',
            uploadedAt: '2024-02-18'
        },
        { 
            id: '4', 
            name: 'Lab Report Template.doc',
            type: 'doc',
            uploadedBy: 'Emma',
            uploadedAt: '2024-02-17'
        }
    ]);

    // Fetch room data
    useEffect(() => {
        const fetchRoomData = async () => {
            try {
                const { data, error } = await supabase
                    .from('room')
                    .select('*')
                    .eq('room_id', roomId)
                    .single();

                if (error) throw error;
                if (!data) {
                    toast.error('Room not found');
                    router.push('/dashboard/room');
                    return;
                }

                setRoomData(data);
                document.title = `${data.room_name} - Quizify`;
            } catch (error) {
                console.error('Error fetching room:', error);
                toast.error('Failed to load room data');
                router.push('/dashboard/room');
            } finally {
                setIsLoading(false);
            }
        };

        if (roomId) {
            fetchRoomData();
        }
    }, [roomId, router]);

    useEffect(() => {
        if (socket && roomId) {
            // Join the room
            joinRoom(roomId);

            // Listen for room updates
            socket.on('room_updated', (data: any) => {
                setRoomData(data);
            });

            // Listen for new messages
            socket.on('new_message', (message: Message) => {
                console.log('Received message:', message);
                setMessages(prev => [...prev, message]);
            });

            // Clean up on unmount
            return () => {
                socket.off('room_updated');
                socket.off('new_message');
                leaveRoom(roomId);
            };
        }
    }, [socket, roomId]);

    const handleLeaveRoom = () => {
        if (socket && roomId) {
            leaveRoom(roomId);
            router.push('/dashboard');
        }
    };

    const handleSendMessage = (content: string) => {
        if (socket && roomId) {
            // Create the message object
            const message: Message = {
                userId: 'user123', // This would come from auth in a real app
                userName: 'You',
                content: content,
                timestamp: new Date()
            };

            // Add message to local state immediately for better UX
            setMessages(prev => [...prev, message]);

            // Emit the message to the server
            socket.emit('send_message', {
                roomId,
                message: {
                    content,
                    userId: message.userId,
                    userName: message.userName
                }
            });
        } else {
            toast.error('Unable to send message. Please try again.');
        }
    };

    const handleFileClick = (note: Note) => {
        // In a real app, this would open the file or download it
        console.log('Opening file:', note.name);
    };

    const handleQuizClose = () => {
        setSelectedFeature(null);
    };

    const handleQuizMinimize = () => {
        setIsQuizMinimized(!isQuizMinimized);
    };

    const handleCopyRoomCode = async () => {
        if (!roomData) return;
        try {
            await navigator.clipboard.writeText(roomData.room_code);
            setCopySuccess(true);
            toast.success('Room code copied to clipboard!');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            toast.error('Failed to copy room code');
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    <div className="text-xl">Loading room...</div>
                </div>
            </div>
        );
    }

    if (!roomData) {
        return (
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
                <div className="text-xl">Room not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white">
            {/* Room Header */}
            <div className="flex justify-between items-center p-4 border-b border-gray-800">
                <div className="flex-1">
                    <div className="flex items-center gap-3">
                        <h1 className="text-2xl font-bold">{roomData.room_name}</h1>
                        <span className="px-2 py-1 bg-purple-500/20 text-purple-300 text-sm rounded">
                            {roomData.subject}
                        </span>
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <span>Room Code:</span>
                            <code className="px-2 py-1 bg-gray-800 rounded font-mono">
                                {roomData.room_code}
                            </code>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleCopyRoomCode}
                                className={`px-2 py-1 rounded text-xs transition-colors ${
                                    copySuccess 
                                        ? 'bg-green-500/20 text-green-300'
                                        : 'bg-gray-700 hover:bg-gray-600 text-gray-300'
                                }`}
                            >
                                {copySuccess ? 'Copied!' : 'Copy'}
                            </motion.button>
                        </div>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">
                            {roomData.members} participant{roomData.members !== 1 ? 's' : ''}
                        </span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">
                            Created {new Date(roomData.created).toLocaleDateString()}
                        </span>
                        <span className="text-gray-400 text-sm">•</span>
                        <span className="text-gray-400 text-sm">
                            Last active {new Date(roomData.last_active).toLocaleTimeString()}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {selectedFeature === 'quiz' && isQuizMinimized && (
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setIsQuizMinimized(false)}
                            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 rounded-lg"
                        >
                            Maximize Quiz
                        </motion.button>
                    )}
                    <button 
                        onClick={handleLeaveRoom}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                    >
                        Leave Room
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex h-[calc(100vh-4rem)]">
                {/* Left Side - Main Features */}
                <div className="flex-1 p-4 flex flex-col gap-4">
                    {/* Top Row - Whiteboard and Quiz */}
                    <div className="flex gap-4 mb-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                                setSelectedFeature('whiteboard');
                                setIsQuizMinimized(false);
                            }}
                            className={`
                                flex-1 h-32 rounded-lg p-4 text-xl font-semibold transition-colors
                                ${selectedFeature === 'whiteboard' 
                                    ? 'bg-green-500 text-white' 
                                    : 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'}
                            `}
                        >
                            WhiteBoard
                        </motion.button>
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            onClick={() => {
                                setSelectedFeature('quiz');
                                setIsQuizMinimized(false);
                            }}
                            className={`
                                flex-1 h-32 rounded-lg p-4 text-xl font-semibold transition-colors
                                ${selectedFeature === 'quiz' 
                                    ? 'bg-blue-500 text-white' 
                                    : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'}
                            `}
                        >
                            Quiz 😈
                        </motion.button>
                    </div>

                    {/* Notes/Files Section */}
                    {(!selectedFeature || isQuizMinimized || selectedFeature === 'whiteboard') && (
                        <div className="flex-1 bg-gray-900/50 rounded-lg border border-gray-800 p-4 overflow-y-auto">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-semibold">Shared Notes & Files</h2>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                                >
                                    Upload File
                                </motion.button>
                            </div>
                            <div className="space-y-3">
                                {notes.map((note) => (
                                    <motion.div
                                        key={note.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.02 }}
                                        onClick={() => handleFileClick(note)}
                                        className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-800 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            <span className="text-2xl">
                                                {note.type === 'pdf' ? '📄' : note.type === 'txt' ? '📝' : '📑'}
                                            </span>
                                            <div>
                                                <p className="font-medium">{note.name}</p>
                                                <p className="text-sm text-gray-400">
                                                    Uploaded by {note.uploadedBy} on {note.uploadedAt}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-purple-400 text-sm">View</span>
                                    </motion.div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quiz Section */}
                    {selectedFeature === 'quiz' && !isQuizMinimized && (
                        <div className="fixed inset-0 z-50 bg-black">
                            <QuizRoom 
                                socket={socket} 
                                roomId={roomId} 
                                onClose={handleQuizClose}
                                onMinimize={handleQuizMinimize}
                            />
                        </div>
                    )}
                </div>

                {/* Right Side - Chat */}
                <div className="w-80 border-l border-gray-800">
                    <Chat
                        roomId={roomId}
                        socket={socket}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                    />
                </div>
            </div>
        </div>
    );
} 