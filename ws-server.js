const Websocket = require('ws');

const wss = new Websocket.Server({ port: 8080 });

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
            console.log('Received:', parsedData);

            // Handle different message types
            if (parsedData.type === 'ludoGameState') {
                // Broadcast game state to all clients
                wss.clients.forEach(function each(client) {
                    if (client.readyState === WebSocket.OPEN) {
                        client.send(JSON.stringify({
                            type: 'gameState',
                            // parsedData.gameStateData
                            gameStateData: {
                                piecePos: [],
                                currTurn: 'red',
                                currRoll: 3
                            },
                            from: parsedData.from || 'anonymous'
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