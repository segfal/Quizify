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
import Whiteboard from '@/components/room/Whiteboard';
import { PdfUpload } from '@/components/pdf/PdfUpload';
import { UserInfo } from '@/components/ui/UserInfo';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';

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
    const authUser = useSelector((state: RootState) => state.user);
    
    const { socket, joinRoom, leaveRoom } = useSocket();
    const [roomData, setRoomData] = useState<RoomData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedFeature, setSelectedFeature] = useState<'whiteboard' | 'quiz' | null>(null);
    const [isWhiteboardOpen, setIsWhiteboardOpen] = useState(false);
    const [isPdfUploadVisible, setIsPdfUploadVisible] = useState(false);

    useEffect(() => {
        if (!authUser.isAuthenticated) {
            router.push('/login');
            return;
        }

        const fetchRoomData = async () => {
            try {
                const roomIdNum = parseInt(roomId);
                if (isNaN(roomIdNum)) {
                    toast.error('Invalid room ID');
                    router.push('/dashboard/room');
                    return;
                }

                const { data, error } = await supabase
                    .from('room')
                    .select('*')
                    .eq('room_id', roomIdNum)
                    .single();

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

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
    }, [roomId, router, authUser.isAuthenticated]);

    // Don't render anything while checking authentication
    if (!authUser.isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="container mx-auto p-4">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">
                            {roomData?.room_name || 'Loading...'}
                        </h1>
                        {roomData && (
                            <p className="text-gray-400">
                                Room Code: {roomData.room_code}
                            </p>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserInfo />
                        <button
                            onClick={() => setIsPdfUploadVisible(!isPdfUploadVisible)}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                        >
                            {isPdfUploadVisible ? 'Close Upload' : 'Upload PDF'}
                        </button>
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* PDF Upload */}
                {isPdfUploadVisible && user && (
                    <div className="mb-6">
                        <PdfUpload
                            userId={String(user.user_id || '')}
                            onUploadSuccess={(url: string) => {
                                toast.success('File uploaded successfully!');
                                setIsPdfUploadVisible(false);
                            }}
                        />
                    </div>
                )}

                {/* Room content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-[60vh]">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-4">
                            <div className="flex gap-4">
                                <button
                                    onClick={() => {
                                        setSelectedFeature('whiteboard');
                                        setIsWhiteboardOpen(true);
                                    }}
                                    className={`
                                        flex-1 h-32 rounded-lg p-4 text-xl font-semibold transition-colors
                                        ${selectedFeature === 'whiteboard' 
                                            ? 'bg-green-500 text-white' 
                                            : 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'}
                                    `}
                                >
                                    WhiteBoard
                                </button>
                                <button
                                    onClick={() => {
                                        setSelectedFeature('quiz');
                                    }}
                                    className={`
                                        flex-1 h-32 rounded-lg p-4 text-xl font-semibold transition-colors
                                        ${selectedFeature === 'quiz' 
                                            ? 'bg-blue-500 text-white' 
                                            : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'}
                                    `}
                                >
                                    Quiz 😈
                                </button>
                            </div>

                            {selectedFeature === 'whiteboard' && (
                                <Whiteboard 
                                    roomId={roomId} 
                                    isOpen={isWhiteboardOpen}
                                    onToggle={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                                />
                            )}

                            {selectedFeature === 'quiz' && socket && (
                                <QuizRoom 
                                    socket={socket}
                                    roomId={roomId}
                                    onClose={() => setSelectedFeature(null)}
                                />
                            )}
                        </div>

                        {socket && (
                            <Chat 
                                roomId={roomId}
                                socket={socket}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    );
} 