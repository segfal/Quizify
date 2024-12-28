'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { useSupabase } from '@/contexts/SupabaseContext';

export default function RoomPage() {
    const router = useRouter();
    const [roomName, setRoomName] = useState('');
    const [subject, setSubject] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [rooms, setRooms] = useState<any[]>([]);
    const { createRoom, getRooms, user } = useSupabase();

    useEffect(() => {
        loadRooms();
    }, []);

    const loadRooms = async () => {
        try {
            const roomsList = await getRooms();
            setRooms(roomsList);
        } catch (error) {
            toast.error('Failed to load rooms');
        }
    };

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim() || !subject.trim()) {
            toast.error('Please enter both room name and subject');
            return;
        }

        setIsCreating(true);
        try {
            const room = await createRoom(roomName, subject);
            toast.success('Room created successfully!');
            router.push(`/dashboard/room/${room.room_id}`);
        } catch (error) {
            toast.error('Failed to create room');
        } finally {
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (roomId: number) => {
        router.push(`/dashboard/room/${roomId}`);
    };

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto">
                {/* Create Room Form */}
                <form onSubmit={handleCreateRoom} className="mb-12">
                    <div className="flex gap-4">
                        <input
                            type="text"
                            value={roomName}
                            onChange={(e) => setRoomName(e.target.value)}
                            placeholder="Enter room name..."
                            className="flex-1 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <input
                            type="text"
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Enter subject..."
                            className="flex-1 px-4 py-2 bg-gray-900 rounded-lg border border-gray-800 focus:outline-none focus:ring-2 focus:ring-purple-500"
                            required
                        />
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            type="submit"
                            disabled={isCreating}
                            className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                                isCreating
                                    ? 'bg-purple-500/50 cursor-not-allowed'
                                    : 'bg-purple-500 hover:bg-purple-600'
                            }`}
                        >
                            {isCreating ? 'Creating...' : 'Create Room'}
                        </motion.button>
                    </div>
                </form>

                {/* Room List */}
                <div className="grid gap-4">
                    <h2 className="text-2xl font-bold mb-4">Available Rooms</h2>
                    {rooms.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">
                            No active rooms. Create one to get started!
                        </p>
                    ) : (
                        rooms.map((room) => (
                            <motion.div
                                key={room.room_id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{room.room_name}</h3>
                                        <p className="text-gray-400">{room.subject}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {room.members} participants
                                        </p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Room Code: {room.room_code}
                                        </p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleJoinRoom(room.room_id)}
                                        className="px-6 py-2 bg-purple-500 hover:bg-purple-600 rounded-lg transition-colors"
                                    >
                                        Join Room
                                    </motion.button>
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 