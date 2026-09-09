import { io } from 'socket.io-client';

// Reuse the API base so only one env var is needed: strip the trailing "/api".
// e.g. REACT_APP_API_URL=https://api.example.com/api  ->  socket at https://api.example.com
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || API_URL.replace(/\/api\/?$/, '');

let socket;

export const initSocket = (token) => {
    if (socket) return socket;

    socket = io(SOCKET_URL, {
        auth: {
            token
        },
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    });

    socket.on('connect', () => {
        console.log('🔌 Connected to WebSocket Server');
    });

    socket.on('connect_error', (err) => {
        console.warn('🔌 WebSocket connection error:', err.message);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
};
