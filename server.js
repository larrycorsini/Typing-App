// Simple WebSocket server for Gemini Type Racer
const { WebSocketServer } = require('ws');

const wss = new WebSocketServer({ port: 8080 });

const rooms = {};
const dailyChallengeText = "The quick brown fox jumps over the lazy dog. This daily challenge is the same for everyone, providing a level playing field to test your typing skills against the entire community. Good luck, and may the fastest fingers win!";

console.log('Gemini Type Racer WebSocket server started on port 8080...');

const broadcastToRoom = (roomId, message) => {
    if (!rooms[roomId]) return;
    rooms[roomId].players.forEach(playerSocket => {
        if (playerSocket.readyState === playerSocket.OPEN) {
            playerSocket.send(JSON.stringify(message));
        }
    });
};

const getRoomInfo = (roomId) => {
    if (!rooms[roomId]) return null;
    return {
        id: roomId,
        playerCount: rooms[roomId].players.length,
        state: rooms[roomId].state,
        players: rooms[roomId].players.map(p => ({ id: p.id, name: p.name })),
    };
};

const broadcastRoomList = () => {
    const roomList = Object.keys(rooms).map(getRoomInfo).filter(Boolean);
    wss.clients.forEach(client => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify({ type: 'roomList', rooms: roomList }));
        }
    });
};

const startRaceInRoom = (roomId) => {
    const room = rooms[roomId];
    if (!room || room.state !== 'waiting') return;

    room.state = 'countdown';
    const countdown = 5;
    
    broadcastToRoom(roomId, { type: 'raceStarting', countdown });

    setTimeout(() => {
        if (rooms[roomId]) {
            rooms[roomId].state = 'racing';
            // Each player tracks their own start time client-side for accuracy
            broadcastToRoom(roomId, { type: 'raceStart' });
            broadcastRoomList(); // Update room state to 'racing'
        }
    }, countdown * 1000);
};

wss.on('connection', ws => {
    ws.id = Math.random().toString(36).substr(2, 9);
    console.log(`Client ${ws.id} connected.`);

    ws.on('message', message => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Invalid JSON received:', message);
            return;
        }

        switch (data.type) {
            case 'getRoomList':
                const roomList = Object.keys(rooms).map(getRoomInfo).filter(Boolean);
                ws.send(JSON.stringify({ type: 'roomList', rooms: roomList }));
                break;
            
            case 'createRoom':
                const roomId = Math.random().toString(36).substr(2, 5);
                ws.name = data.playerName;
                rooms[roomId] = { players: [ws], state: 'waiting' };
                ws.roomId = roomId;
                ws.send(JSON.stringify({ type: 'roomCreated', roomId }));
                broadcastRoomList();
                break;

            case 'joinRoom':
                const roomToJoin = rooms[data.roomId];
                if (roomToJoin && roomToJoin.state === 'waiting' && roomToJoin.players.length < 8) {
                    ws.name = data.playerName;
                    ws.roomId = data.roomId;
                    roomToJoin.players.push(ws);
                    broadcastToRoom(data.roomId, { type: 'playerJoined', player: { id: ws.id, name: ws.name } });
                    ws.send(JSON.stringify({ type: 'joinedRoom', room: getRoomInfo(data.roomId) }));
                    broadcastRoomList();

                    // Auto-start race if room is full
                    if (roomToJoin.players.length >= 2) { // Set to 2 for faster testing, can be higher
                        startRaceInRoom(data.roomId);
                    }
                } else {
                    ws.send(JSON.stringify({ type: 'error', message: 'Room is full, in progress, or does not exist.' }));
                }
                break;
            
            case 'progressUpdate':
                if (ws.roomId) {
                    broadcastToRoom(ws.roomId, {
                        type: 'progressUpdate',
                        playerId: ws.id,
                        progress: data.progress,
                        wpm: data.wpm
                    });
                }
                break;
            
            case 'raceFinished':
                 if (ws.roomId) {
                    broadcastToRoom(ws.roomId, {
                        type: 'playerFinished',
                        playerId: ws.id,
                        wpm: data.wpm,
                        accuracy: data.accuracy,
                    });
                }
                break;
            
            case 'getDailyChallenge':
                ws.send(JSON.stringify({ type: 'dailyChallenge', text: dailyChallengeText }));
                break;
        }
    });

    ws.on('close', () => {
        console.log(`Client ${ws.id} disconnected.`);
        const roomId = ws.roomId;
        if (roomId && rooms[roomId]) {
            rooms[roomId].players = rooms[roomId].players.filter(player => player !== ws);
            if (rooms[roomId].players.length === 0) {
                delete rooms[roomId];
            } else {
                broadcastToRoom(roomId, { type: 'playerLeft', playerId: ws.id });
            }
            broadcastRoomList();
        }
    });
});

setInterval(broadcastRoomList, 5000); // Periodically refresh room lists for all clients
