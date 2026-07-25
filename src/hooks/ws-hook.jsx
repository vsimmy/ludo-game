import { useState, useRef, useCallback, useEffect, useMemo } from "react"

export const useWs = (url, options = {}) => {
    const {
        maxReconnectAttempts = 5,
        reconnectInterval = 1000,
        enableHeartbeat = true,
        heartbeatInterval = 30000,
        messageQueueSize = 100
    } = options;

    // Core state
    const [socket, setSocket] = useState(null);
    const [isConnected, setIsConnected] = useState(false);
    const [connectionState, setConnectionState] = useState('disconnected'); // 'connecting', 'connected', 'disconnected', 'reconnecting'
    const [messages, setMessages] = useState([]);
    const [gameState, setGameState] = useState(null);
    const [lastGameStateUpdate, setLastGameStateUpdate] = useState(null);

    // Refs for stable references
    const reconnectTimeoutRef = useRef(null);
    const heartbeatTimeoutRef = useRef(null);
    const reconnectAttempts = useRef(0);
    const messageSequenceRef = useRef(0);
    const isMountedRef = useRef(true);
    const pendingMessagesRef = useRef([]);
    const lastGameStateRef = useRef(null);

    // Heartbeat function
    const startHeartbeat = useCallback((ws) => {
        if (!enableHeartbeat || !isMountedRef.current) return;

        heartbeatTimeoutRef.current = setTimeout(() => {
            if (ws.readyState === WebSocket.OPEN && isMountedRef.current) {
                ws.send(JSON.stringify({ type: 'heartbeat' }));
                startHeartbeat(ws); // Schedule next heartbeat
            }
        }, heartbeatInterval);
    }, [enableHeartbeat, heartbeatInterval]);

    // Stable connect function
    const connect = useCallback(() => {
        if (!isMountedRef.current) return;

        try {
            setConnectionState('connecting');
            const ws = new WebSocket(url);

            ws.onopen = () => {
                if (!isMountedRef.current) {
                    ws.close();
                    return;
                }

                console.log('WebSocket connected');
                setIsConnected(true);
                setConnectionState('connected');
                setSocket(ws);
                reconnectAttempts.current = 0;

                // Send any pending messages
                if (pendingMessagesRef.current.length > 0) {
                    pendingMessagesRef.current.forEach(msg => {
                        if (ws.readyState === WebSocket.OPEN) {
                            ws.send(msg);
                        }
                    });
                    pendingMessagesRef.current = [];
                }

                // Start heartbeat if enabled
                if (enableHeartbeat) {
                    startHeartbeat(ws);
                }
            };

            ws.onmessage = (event) => {
                if (!isMountedRef.current) return;

                try {
                    const data = JSON.parse(event.data);
                    const messageId = ++messageSequenceRef.current;

                    // Handle different message types
                    switch (data.type) {
                        case 'message':
                            setMessages(prev => {
                                const newMessages = [...prev, {
                                    id: messageId,
                                    message: data.message,
                                    from: data.from,
                                    timestamp: new Date(),
                                    sequence: messageId
                                }];
                                // Keep only the last N messages to prevent memory leaks
                                return newMessages.slice(-messageQueueSize);
                            });
                            break;

                        case 'gameStateUpdate':
                            // Only update if this is a newer state or different from current
                            if (!lastGameStateRef.current ||
                                data.timestamp > lastGameStateRef.current.timestamp ||
                                JSON.stringify(data.gameState) !== JSON.stringify(lastGameStateRef.current)) {

                                setGameState(data.gameState);
                                setLastGameStateUpdate(data.timestamp || Date.now());
                                lastGameStateRef.current = {
                                    gameState: data.gameState,
                                    timestamp: data.timestamp || Date.now()
                                };
                            }
                            break;

                        case 'connection':
                            console.log(data.message);
                            break;

                        case 'heartbeat':
                            // Respond to heartbeat
                            if (ws.readyState === WebSocket.OPEN) {
                                ws.send(JSON.stringify({ type: 'heartbeat_ack' }));
                            }
                            break;

                        case 'error':
                            console.error('Server error:', data.message);
                            break;

                        default:
                            console.warn('Unknown message type:', data.type);
                    }
                } catch (error) {
                    console.error('Error parsing message:', error);
                }
            };

            ws.onclose = (event) => {
                if (!isMountedRef.current) return;

                console.log('WebSocket disconnected:', event.code, event.reason);
                setIsConnected(false);
                setConnectionState('disconnected');
                setSocket(null);

                // Clear heartbeat
                if (heartbeatTimeoutRef.current) {
                    clearTimeout(heartbeatTimeoutRef.current);
                    heartbeatTimeoutRef.current = null;
                }

                // Reconnect logic with exponential backoff
                if (isMountedRef.current && reconnectAttempts.current < maxReconnectAttempts) {
                    setConnectionState('reconnecting');
                    const timeout = Math.min(
                        reconnectInterval * Math.pow(2, reconnectAttempts.current),
                        30000 // Max 30 seconds
                    );

                    reconnectTimeoutRef.current = setTimeout(() => {
                        if (isMountedRef.current) {
                            reconnectAttempts.current++;
                            connect();
                        }
                    }, timeout);
                } else if (reconnectAttempts.current >= maxReconnectAttempts) {
                    console.error('Max reconnection attempts reached');
                    setConnectionState('failed');
                }
            };

            ws.onerror = (error) => {
                console.error('WebSocket error:', error);
                setConnectionState('error');
            };

        } catch (error) {
            console.error('Failed to create WebSocket connection:', error);
            setConnectionState('error');
        }
    }, [url, maxReconnectAttempts, reconnectInterval, enableHeartbeat, messageQueueSize, startHeartbeat]);

    // Connection management effect
    useEffect(() => {
        isMountedRef.current = true;
        connect();

        return () => {
            isMountedRef.current = false;

            // Clear all timeouts
            if (reconnectTimeoutRef.current) {
                clearTimeout(reconnectTimeoutRef.current);
            }
            if (heartbeatTimeoutRef.current) {
                clearTimeout(heartbeatTimeoutRef.current);
            }

            // Close socket
            if (socket) {
                socket.close();
            }
        };
    }, [connect, socket]);

    // Send message with queue fallback
    const sendMessage = useCallback((message, from = 'user') => {
        const messageData = JSON.stringify({
            type: 'message',
            message,
            from,
            timestamp: Date.now(),
            sequence: ++messageSequenceRef.current
        });

        if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
            socket.send(messageData);
        } else {
            // Queue message for when connection is restored
            pendingMessagesRef.current.push(messageData);
            console.warn('WebSocket not connected, message queued');
        }
    }, [socket, isConnected]);

    // Send game state with validation and deduplication
    const sendGameState = useCallback((gameStateData, from = 'user') => {
        const timestamp = Date.now();

        // Prevent sending duplicate states
        if (lastGameStateRef.current &&
            JSON.stringify(gameStateData) === JSON.stringify(lastGameStateRef.current.gameState)) {
            return;
        }

        const messageData = JSON.stringify({
            type: 'gameState',
            gameState: gameStateData,
            from,
            timestamp,
            sequence: ++messageSequenceRef.current
        });

        if (socket && isConnected && socket.readyState === WebSocket.OPEN) {
            socket.send(messageData);
            lastGameStateRef.current = { gameState: gameStateData, timestamp };
        } else {
            // Queue critical game state updates
            pendingMessagesRef.current.push(messageData);
            console.warn('WebSocket not connected, game state queued');
        }
    }, [socket, isConnected]);

    // Force reconnection
    const reconnect = useCallback(() => {
        if (socket) {
            socket.close();
        }
        reconnectAttempts.current = 0;
        connect();
    }, [socket, connect]);

    // Clear messages
    const clearMessages = useCallback(() => {
        setMessages([]);
    }, []);

    // Memoized return object to prevent unnecessary re-renders
    const returnValue = useMemo(() => ({
        isConnected,
        connectionState,
        messages,
        gameState,
        lastGameStateUpdate,
        sendMessage,
        sendGameState,
        reconnect,
        clearMessages
    }), [
        isConnected,
        connectionState,
        messages,
        gameState,
        lastGameStateUpdate,
        sendMessage,
        sendGameState,
        reconnect,
        clearMessages
    ]);

    return returnValue;
}