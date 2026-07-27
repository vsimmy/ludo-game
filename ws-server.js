const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });

console.log('running socket');

wss.on('connection', (ws) => {
    console.log('new client');
    ws.send(JSON.stringify({
        type: 'connection',
        message: 'Connected to server'
    }));

    ws.on('message', (data) => {
        try {
            const parsedData = JSON.parse(data);
            console.log('Received:', parsedData.type);

            // Handle different message types
            if (parsedData.type === 'gameState') {
                // Relay the real game state to every other connected client.
                // NOTE: this is a naive broadcast relay for local/offline testing only —
                // there is no authentication, room/session separation, or server-side
                // rules validation here. Anyone connected sees and can send state for
                // every game. That's the gap to close before this is production-ready
                // for a shareable public URL.
                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'gameStateUpdate',
                            gameState: parsedData.gameState,
                            from: parsedData.from || 'anonymous',
                            timestamp: parsedData.timestamp || Date.now()
                        }));
                    }
                });
            } else if (parsedData.type === 'message') {
                // Broadcast regular messages
                wss.clients.forEach(function each(client) {
                    if (client !== ws && client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'message',
                            message: parsedData.message,
                            from: parsedData.from || 'anonymous'
                        }));
                    }
                });
            } else if (parsedData.type === 'heartbeat') {
                if (ws.readyState === WebSocket.OPEN) {
                    ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
                }
            }
        } catch (error) {
            console.error('Error parsing message:', error);
        }
    })
    ws.on('close', function () {
        console.log('Client disconnected');
    });

    ws.on('error', function (error) {
        console.error('WebSocket error:', error);
    });
})