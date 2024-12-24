import { Server as ServerIO } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';

// Dummy users for testing
const DUMMY_USERS = [
    { id: 'user1', name: 'John Doe', email: 'john@example.com' },
    { id: 'user2', name: 'Jane Smith', email: 'jane@example.com' },
];

interface RoomData {
    id: string;
    name: string;
    classSubject: string;
    creator: {
        id: string;
        name: string;
    };
    participants: {
        id: string;
        name: string;
        role: 'admin' | 'participant';
    }[];
    features: {
        chat: {
            enabled: boolean;
            messages: {
                userId: string;
                userName: string;
                content: string;
                timestamp: Date;
            }[];
        };
        kahoot: {
            enabled: boolean;
            gameLink?: string;
        };
        notes: {
            enabled: boolean;
            content: string;
        };
        whiteboard: {
            enabled: boolean;
            canvasData?: string;
        };
    };
    createdAt: Date;
    lastActivity: Date;
}

const activeRooms = new Map<string, RoomData>();

// Dummy auth middleware
const authenticateUser = (socket: any) => {
    // For now, randomly assign a dummy user
    const user = DUMMY_USERS[Math.floor(Math.random() * DUMMY_USERS.length)];
    socket.user = user;
    return user;
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    if (!res.socket.server.io) {
        console.log('New Socket.io server...');
        const httpServer = res.socket.server as any;
        const io = new ServerIO(httpServer, {
            path: '/api/socket',
            addTrailingSlash: false,
        });
        
        res.socket.server.io = io;

        io.on('connection', (socket) => {
            console.log('Client connected:', socket.id);
            const user = authenticateUser(socket);
            console.log('Authenticated as:', user.name);

            // Handle room creation
            socket.on('create_room', (data: { name: string; classSubject: string }) => {
                if (!socket.user) {
                    socket.emit('error', { message: 'Authentication required' });
                    return;
                }

                const roomId = `room_${Date.now()}`;
                const newRoom: RoomData = {
                    id: roomId,
                    name: data.name,
                    classSubject: data.classSubject,
                    creator: {
                        id: socket.user.id,
                        name: socket.user.name,
                    },
                    participants: [{
                        id: socket.user.id,
                        name: socket.user.name,
                        role: 'admin'
                    }],
                    features: {
                        chat: {
                            enabled: true,
                            messages: []
                        },
                        kahoot: {
                            enabled: true
                        },
                        notes: {
                            enabled: true,
                            content: ''
                        },
                        whiteboard: {
                            enabled: true
                        }
                    },
                    createdAt: new Date(),
                    lastActivity: new Date()
                };

                activeRooms.set(roomId, newRoom);
                socket.join(roomId);
                io.to(roomId).emit('room_created', {
                    roomId,
                    roomData: newRoom
                });
            });

            // Handle joining rooms
            socket.on('join_room', (roomId: string) => {
                if (!socket.user) {
                    socket.emit('error', { message: 'Authentication required' });
                    return;
                }

                const room = activeRooms.get(roomId);
                if (room) {
                    // Check if user is already in the room
                    if (!room.participants.find(p => p.id === socket.user.id)) {
                        room.participants.push({
                            id: socket.user.id,
                            name: socket.user.name,
                            role: 'participant'
                        });
                    }

                    socket.join(roomId);
                    room.lastActivity = new Date();
                    io.to(roomId).emit('user_joined', {
                        roomId,
                        user: {
                            id: socket.user.id,
                            name: socket.user.name
                        },
                        participants: room.participants
                    });
                }
            });

            // Handle chat messages
            socket.on('send_message', ({ roomId, content }) => {
                if (!socket.user) return;

                const room = activeRooms.get(roomId);
                if (room) {
                    const message = {
                        userId: socket.user.id,
                        userName: socket.user.name,
                        content,
                        timestamp: new Date()
                    };
                    room.features.chat.messages.push(message);
                    room.lastActivity = new Date();
                    io.to(roomId).emit('new_message', message);
                }
            });

            // Handle notes update
            socket.on('update_notes', ({ roomId, content }) => {
                if (!socket.user) return;

                const room = activeRooms.get(roomId);
                if (room) {
                    room.features.notes.content = content;
                    room.lastActivity = new Date();
                    io.to(roomId).emit('notes_updated', { content });
                }
            });

            // Handle Kahoot link update
            socket.on('update_kahoot', ({ roomId, gameLink }) => {
                if (!socket.user) return;

                const room = activeRooms.get(roomId);
                if (room) {
                    room.features.kahoot.gameLink = gameLink;
                    room.lastActivity = new Date();
                    io.to(roomId).emit('kahoot_updated', { gameLink });
                }
            });

            // Handle whiteboard update
            socket.on('update_whiteboard', ({ roomId, canvasData }) => {
                if (!socket.user) return;

                const room = activeRooms.get(roomId);
                if (room) {
                    room.features.whiteboard.canvasData = canvasData;
                    room.lastActivity = new Date();
                    io.to(roomId).emit('whiteboard_updated', { canvasData });
                }
            });

            // Handle leaving rooms
            socket.on('leave_room', (roomId) => {
                if (!socket.user) return;

                const room = activeRooms.get(roomId);
                if (room) {
                    room.participants = room.participants.filter(p => p.id !== socket.user.id);
                    socket.leave(roomId);
                    room.lastActivity = new Date();

                    if (room.participants.length === 0) {
                        activeRooms.delete(roomId);
                    } else {
                        io.to(roomId).emit('user_left', {
                            roomId,
                            userId: socket.user.id,
                            participants: room.participants
                        });
                    }
                }
            });

            // Get list of active rooms
            socket.on('get_rooms', () => {
                const rooms = Array.from(activeRooms.values());
                socket.emit('rooms_list', rooms);
            });

            // Handle disconnection
            socket.on('disconnect', () => {
                if (!socket.user) return;

                activeRooms.forEach((room, roomId) => {
                    if (room.participants.find(p => p.id === socket.user.id)) {
                        room.participants = room.participants.filter(p => p.id !== socket.user.id);
                        room.lastActivity = new Date();

                        if (room.participants.length === 0) {
                            activeRooms.delete(roomId);
                        } else {
                            io.to(roomId).emit('user_left', {
                                roomId,
                                userId: socket.user.id,
                                participants: room.participants
                            });
                        }
                    }
                });
                console.log('Client disconnected:', socket.id);
            });
        });
    }

    res.end();
}

export const config = {
    api: {
        bodyParser: false,
    },
}; 