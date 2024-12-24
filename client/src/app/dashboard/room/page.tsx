'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function RoomPage() {
    const router = useRouter();
    const [roomName, setRoomName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [rooms] = useState([
        // Dummy rooms for testing
        { id: '1', name: 'Math Study Room', subject: 'Mathematics', participants: 3 },
        { id: '2', name: 'Physics Lab', subject: 'Physics', participants: 2 },
        { id: '3', name: 'Chemistry Group', subject: 'Chemistry', participants: 5 },
    ]);

    const handleCreateRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!roomName.trim()) {
            toast.error('Please enter a room name');
            return;
        }

        setIsCreating(true);
        try {
            // For now, we'll just redirect to a test room
            const roomId = '1'; // In real app, this would be generated
            router.push(`/dashboard/room/${roomId}`);
        } catch (error) {
            toast.error('Failed to create room');
            setIsCreating(false);
        }
    };

    const handleJoinRoom = (roomId: string) => {
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
                                key={room.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.02 }}
                                className="bg-gray-900/50 border border-gray-800 rounded-lg p-6"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                                        <p className="text-gray-400">{room.subject}</p>
                                        <p className="text-sm text-gray-500 mt-2">
                                            {room.participants} participants
                                        </p>
                                    </div>
                                    <motion.button
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleJoinRoom(room.id)}
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