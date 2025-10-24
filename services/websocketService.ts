import { useStore } from '../store';
import { ClientToServerMessage, ServerToClientMessage } from '../types';

let socket: WebSocket | null = null;
let reconnectInterval: NodeJS.Timeout | null = null;
let isAttemptingReconnect = false;

const connect = () => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        console.log('WebSocket already connected.');
        return;
    }

    socket = new WebSocket('ws://localhost:8080');
    useStore.getState().setSocketStatus('connecting');

    socket.onopen = () => {
        console.log('WebSocket connection established.');
        useStore.getState().setSocketStatus('connected');
        isAttemptingReconnect = false; // Reset flag on successful connection
        if (reconnectInterval) {
            clearInterval(reconnectInterval);
            reconnectInterval = null;
        }
        // Request initial room list upon connection
        websocketService.sendMessage({ type: 'getRoomList' });
    };

    socket.onmessage = (event) => {
        try {
            const message: ServerToClientMessage = JSON.parse(event.data);
            useStore.getState().handleServerMessage(message);
        } catch (error) {
            console.error('Error parsing message from server:', error);
        }
    };

    socket.onclose = () => {
        console.log('WebSocket connection closed.');
        // Don't change status if it's already 'error', as onerror handles that.
        if (useStore.getState().socketStatus !== 'error') {
            useStore.getState().setSocketStatus('disconnected');
        }
        socket = null;
        if (!reconnectInterval) {
            reconnectInterval = setInterval(() => {
                if (!socket || socket.readyState === WebSocket.CLOSED) {
                    connect();
                }
            }, 5000);
        }
    };

    socket.onerror = () => {
        // Only log the error once per reconnection cycle
        if (!isAttemptingReconnect) {
            console.error('WebSocket connection error. Ensure the backend server is running (`node server.js`).');
            isAttemptingReconnect = true; 
        }
        useStore.getState().setSocketStatus('error');
        socket?.close();
    };
};

const disconnect = () => {
    if (reconnectInterval) {
        clearInterval(reconnectInterval);
        reconnectInterval = null;
    }
    if (socket) {
        socket.close();
        socket = null;
    }
     useStore.getState().setSocketStatus('disconnected');
};

const sendMessage = (message: ClientToServerMessage) => {
    if (socket && socket.readyState === WebSocket.OPEN) {
        socket.send(JSON.stringify(message));
    } else {
        console.error('WebSocket is not connected. Message not sent:', message);
    }
};

export const websocketService = {
    connect,
    disconnect,
    sendMessage,
};