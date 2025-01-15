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
import { UserInfo } from '@/components/ui/UserInfo';
import { useSelector } from 'react-redux';
import { RootState } from '@/store/store';
import { Notes } from '@/components/room/Notes';
import { Users, Clock, BookOpen, Award, ChevronLeft, ChevronRight, Pause, Play, X } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

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

interface RoomMember {
    user_id: number;
    room_id: number;
    user: {
        username: string;
    };
}

interface RoomMemberWithUser {
    username: string;
}

type RoomMemberResponse = {
    data: RoomMember[] | null;
    error: Error | null;
};

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
    const [notes, setNotes] = useState('');
    const [activeMembers, setActiveMembers] = useState<string[]>([]);
    const [roomStats, setRoomStats] = useState({
        totalQuizzes: 0,
        averageScore: 0,
        studyTime: 0
    });
    const [currentStatsPage, setCurrentStatsPage] = useState(0);
    const statsPerPage = 2;
    const [isPaused, setIsPaused] = useState(false);
    const SCROLL_SPEED = 30; // Lower number = faster scroll
    
    const statsBoxes = [
        {
            icon: <Users className="w-5 h-5 text-purple-400" />,
            title: "Active Members",
            value: activeMembers.length,
            subtitle: (
                <div className="text-sm text-purple-400/70">
                    {activeMembers.slice(0, 3).join(', ')}
                    {activeMembers.length > 3 && ` +${activeMembers.length - 3} more`}
                </div>
            ),
            color: "purple"
        },
        {
            icon: <BookOpen className="w-5 h-5 text-blue-400" />,
            title: "Total Quizzes",
            value: roomStats.totalQuizzes,
            subtitle: `Average Score: ${roomStats.averageScore}%`,
            color: "blue"
        },
        {
            icon: <Clock className="w-5 h-5 text-green-400" />,
            title: "Study Time",
            value: `${Math.round(roomStats.studyTime)} hrs`,
            subtitle: "This week",
            color: "green"
        },
        {
            icon: <Award className="w-5 h-5 text-yellow-400" />,
            title: "Achievements",
            value: "3",
            subtitle: "View All →",
            color: "yellow"
        }
    ];

    // Duplicate the stats boxes to create a seamless loop
    const duplicatedStats = [...statsBoxes, ...statsBoxes];

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

                // Fetch room statistics
                const { data: quizStats } = await supabase
                    .from('quiz_results')
                    .select('score')
                    .eq('room_id', roomIdNum);

                if (quizStats) {
                    const totalQuizzes = quizStats.length;
                    const averageScore = quizStats.reduce((acc, curr) => acc + curr.score, 0) / totalQuizzes;
                    setRoomStats(prev => ({
                        ...prev,
                        totalQuizzes,
                        averageScore: Math.round(averageScore)
                    }));
                }

                // Fetch active members
                const { data: members } = await supabase
                    .from('room_members')
                    .select(`
                        users!inner (
                            username
                        )
                    `)
                    .eq('room_id', roomIdNum);

                if (members) {
                    const usernames = members.map(m => (m.users as unknown as RoomMemberWithUser).username);
                    setActiveMembers(usernames);
                }

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

    useEffect(() => {
        if (!socket || !roomId || !user) return;

        // Join the room with player name
        socket.emit('join_room', {
            roomId,
            playerName: authUser.username || 'Anonymous Player'
        });

        // Cleanup on unmount
        return () => {
            socket.emit('leave_room', { roomId });
        };
    }, [socket, roomId, user, authUser]);

    const handleNotesUpdate = async (content: string) => {
        setNotes(content);
        try {
            const { error } = await supabase
                .from('notes')
                .upsert({
                    room_id: parseInt(roomId),
                    content: content,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Error saving notes:', error);
            toast.error('Failed to save notes');
        }
    };

    // Don't render anything while checking authentication
    if (!authUser.isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-950 text-white">
            <div className="container mx-auto p-4 max-w-[1600px]">
                {/* Header */}
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {roomData?.room_name || 'Loading...'}
                        </h1>
                        {roomData && (
                            <div className="flex items-center gap-4 text-gray-400">
                                <span>Room Code: {roomData.room_code}</span>
                                <span>•</span>
                                <span>Subject: {roomData.subject}</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <UserInfo />
                        <button
                            onClick={() => router.push('/dashboard')}
                            className="px-4 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                        >
                            Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Continuous Stats Scroll */}
                <div className="relative mb-6 overflow-hidden">
                    <div className="flex items-center">
                        <div className="flex-1 overflow-hidden">
                            <motion.div 
                                className="flex gap-4"
                                animate={isPaused ? { x: 0 } : {
                                    x: [`0%`, `-50%`]
                                }}
                                transition={isPaused ? {} : {
                                    duration: SCROLL_SPEED,
                                    ease: "linear",
                                    repeat: Infinity,
                                    repeatType: "loop"
                                }}
                            >
                                {duplicatedStats.map((stat, index) => (
                                    <div
                                        key={`${stat.title}-${index}`}
                                        className={`flex-none w-[calc(25%-1rem)] bg-${stat.color}-500/10 border border-${stat.color}-500/20 rounded-lg p-4`}
                                    >
                                        <div className="flex items-center gap-2 mb-2">
                                            {stat.icon}
                                            <h3 className={`text-lg font-semibold text-${stat.color}-400`}>
                                                {stat.title}
                                            </h3>
                                        </div>
                                        <p className="text-2xl font-bold">{stat.value}</p>
                                        <div className={`mt-2 text-sm text-${stat.color}-400/70`}>
                                            {stat.subtitle}
                                        </div>
                                    </div>
                                ))}
                            </motion.div>
                        </div>
                    </div>
                    
                    {/* Pause/Play button */}
                    <div className="absolute top-1/2 right-2 -translate-y-1/2">
                        <button
                            onClick={() => setIsPaused(!isPaused)}
                            className="p-2 rounded-full bg-gray-800/50 hover:bg-gray-800 transition-colors"
                        >
                            {isPaused ? (
                                <Play className="w-4 h-4" />
                            ) : (
                                <Pause className="w-4 h-4" />
                            )}
                        </button>
                    </div>
                </div>

                {/* Room content */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-[60vh]">
                        <div className="w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-4 gap-6">
                        <div className="col-span-3 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <motion.button
                                    onClick={() => {
                                        setSelectedFeature('whiteboard');
                                        setIsWhiteboardOpen(true);
                                    }}
                                    className={`
                                        h-40 rounded-lg p-6 text-xl font-semibold transition-all
                                        ${selectedFeature === 'whiteboard' 
                                            ? 'bg-green-500 text-white scale-[0.98]' 
                                            : 'bg-green-500/10 border border-green-500/20 hover:bg-green-500/20'}
                                    `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <h3 className="text-2xl mb-2">WhiteBoard</h3>
                                    <p className="text-sm font-normal opacity-80">
                                        Collaborate in real-time with your team members
                                    </p>
                                </motion.button>

                                <motion.button
                                    onClick={() => {
                                        setSelectedFeature('quiz');
                                    }}
                                    className={`
                                        h-40 rounded-lg p-6 text-xl font-semibold transition-all
                                        ${selectedFeature === 'quiz' 
                                            ? 'bg-blue-500 text-white scale-[0.98]' 
                                            : 'bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20'}
                                    `}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <h3 className="text-2xl mb-2">Quiz Mode 😈</h3>
                                    <p className="text-sm font-normal opacity-80">
                                        Test your knowledge and compete with others
                                    </p>
                                </motion.button>
                            </div>

                            {selectedFeature === 'whiteboard' && (
                                <div className="relative h-[calc(100vh-24rem)]">
                                    <button
                                        onClick={() => {
                                            setSelectedFeature(null);
                                            setIsWhiteboardOpen(false);
                                        }}
                                        className="absolute top-2 right-2 z-10 p-2 bg-red-500 hover:bg-red-600 rounded-full transition-colors"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                    <Whiteboard 
                                        roomId={roomId} 
                                        isOpen={isWhiteboardOpen}
                                        onToggle={() => setIsWhiteboardOpen(!isWhiteboardOpen)}
                                    />
                                </div>
                            )}

                            {selectedFeature === 'quiz' && socket && (
                                <div className="h-[calc(100vh-24rem)]">
                                    <QuizRoom 
                                        socket={socket}
                                        roomId={roomId}
                                        onClose={() => setSelectedFeature(null)}
                                    />
                                </div>
                            )}

                            <div className="h-[calc(100vh-36rem)]">
                                <Notes
                                    roomId={roomId}
                                    initialContent={notes}
                                    onUpdate={handleNotesUpdate}
                                />
                            </div>
                        </div>

                        {/* Right Sidebar - Chat */}
                        <div className="space-y-6">
                            {socket && (
                                <div className="h-[calc(100vh-16rem)] bg-gray-900/50 rounded-lg border border-gray-800">
                                    <Chat 
                                        roomId={roomId}
                                        socket={socket}
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
} 