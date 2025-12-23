import { TetrisRoom } from './TetrisRoom';

interface Env {
  TETRIS_ROOM: DurableObjectNamespace;
  ALLOWED_ORIGINS: string;
}

// Matchmaking queue (in-memory, will be lost on worker restart)
// For production, consider using Durable Objects or KV for persistent queue
const matchmakingQueue: Map<string, { playerId: string; nickname: string; timestamp: number }> = new Map();

// Store matched players so they can retrieve match info on next poll
const matchedPlayers: Map<string, { roomId: string; wsUrl: string; opponent: string; timestamp: number }> = new Map();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // CORS preflight
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // API routes
    if (path === '/api/battle/create') {
      return handleCreateRoom(request, env);
    }

    if (path === '/api/battle/join') {
      return handleJoinRoom(request, env);
    }

    if (path === '/api/battle/queue') {
      return handleMatchmaking(request, env);
    }

    if (path === '/api/battle/room-info') {
      return handleRoomInfo(request, env);
    }

    // WebSocket connection to specific room
    if (path.startsWith('/ws/room/')) {
      const roomId = path.replace('/ws/room/', '');
      return handleWebSocket(request, env, roomId);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  },
};

// Generate a 6-character room code
function generateRoomCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding similar chars (I, O, 0, 1)
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

async function handleCreateRoom(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Consume JSON body (nickname is passed via WebSocket later)
    await request.json();

    // Generate unique room code with collision detection
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const id = env.TETRIS_ROOM.idFromName(roomCode);
      const room = env.TETRIS_ROOM.get(id);

      // Check if room already exists
      const infoResponse = await room.fetch(new Request(`https://dummy/info`));
      const roomInfo = await infoResponse.json() as { roomCode?: string; playerCount: number };

      // Room doesn't exist or is empty - safe to use
      if (!roomInfo.roomCode && roomInfo.playerCount === 0) {
        // Initialize the DO with the room code
        await room.fetch(new Request(`https://dummy/init?roomCode=${roomCode}`));

        return new Response(JSON.stringify({
          success: true,
          roomId: roomCode,
          roomCode,
          wsUrl: `/ws/room/${roomCode}`,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      attempts++;
    }

    // Failed to generate unique code after max attempts
    return new Response(JSON.stringify({ error: 'Failed to create room, please try again' }), {
      status: 503,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Create room error:', e);
    return new Response(JSON.stringify({ error: 'Failed to create room' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleJoinRoom(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await request.json() as { roomCode?: string };
    const roomCode = body.roomCode?.toUpperCase().trim();

    if (!roomCode) {
      return new Response(JSON.stringify({ error: 'Room code required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // In a real implementation, we'd need to lookup the room by code
    // For now, we'll use the room code as the room ID (simplified)
    // A better approach would be to use KV to map room codes to room IDs

    // For simplicity, use room code as room name
    const id = env.TETRIS_ROOM.idFromName(roomCode);
    const room = env.TETRIS_ROOM.get(id);

    // Check if room exists and has space
    const infoResponse = await room.fetch(new Request(`https://dummy/info`));
    const roomInfo = await infoResponse.json() as { playerCount: number; gameStatus: string; roomCode?: string };

    // Check if room actually exists (has been initialized)
    if (!roomInfo.roomCode || roomInfo.playerCount === 0) {
      return new Response(JSON.stringify({ error: 'Room not found' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (roomInfo.playerCount >= 2) {
      return new Response(JSON.stringify({ error: 'Room is full' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (roomInfo.gameStatus !== 'waiting') {
      return new Response(JSON.stringify({ error: 'Game already in progress' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({
      success: true,
      roomId: roomCode,
      wsUrl: `/ws/room/${roomCode}`,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Join room error:', e);
    return new Response(JSON.stringify({ error: 'Failed to join room' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleMatchmaking(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const body = await request.json() as { nickname?: string; playerId?: string };
    const nickname = body.nickname?.trim().slice(0, 12) || 'Player';
    const playerId = body.playerId || crypto.randomUUID();

    const now = Date.now();

    // Clean up old entries (older than 30 seconds)
    for (const [id, entry] of matchmakingQueue) {
      if (now - entry.timestamp > 30000) {
        matchmakingQueue.delete(id);
      }
    }
    for (const [id, entry] of matchedPlayers) {
      if (now - entry.timestamp > 30000) {
        matchedPlayers.delete(id);
      }
    }

    // Check if this player was already matched (waiting player case)
    const existingMatch = matchedPlayers.get(playerId);
    if (existingMatch) {
      matchedPlayers.delete(playerId);
      return new Response(JSON.stringify({
        success: true,
        matched: true,
        roomId: existingMatch.roomId,
        wsUrl: existingMatch.wsUrl,
        opponent: existingMatch.opponent,
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check if there's someone waiting
    for (const [waitingId, waiting] of matchmakingQueue) {
      if (waitingId !== playerId) {
        // Found a match!
        matchmakingQueue.delete(waitingId);

        // Create a new room for the match
        const roomId = `match-${crypto.randomUUID()}`;
        const id = env.TETRIS_ROOM.idFromName(roomId);
        const room = env.TETRIS_ROOM.get(id);

        // Initialize the room with the room ID
        await room.fetch(new Request(`https://dummy/init?roomCode=${roomId}`));

        const wsUrl = `/ws/room/${roomId}`;

        // Store match result for the waiting player so they can find it on next poll
        matchedPlayers.set(waitingId, {
          roomId,
          wsUrl,
          opponent: nickname,
          timestamp: now,
        });

        return new Response(JSON.stringify({
          success: true,
          matched: true,
          roomId,
          wsUrl,
          opponent: waiting.nickname,
        }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
    }

    // No match found, add to queue
    matchmakingQueue.set(playerId, { playerId, nickname, timestamp: now });

    return new Response(JSON.stringify({
      success: true,
      matched: false,
      position: matchmakingQueue.size,
      message: 'Waiting for opponent...',
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Matchmaking error:', e);
    return new Response(JSON.stringify({ error: 'Matchmaking failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleRoomInfo(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const roomId = url.searchParams.get('roomId');

  if (!roomId) {
    return new Response(JSON.stringify({ error: 'Room ID required' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const id = env.TETRIS_ROOM.idFromName(roomId);
    const room = env.TETRIS_ROOM.get(id);
    const response = await room.fetch(new Request(`https://dummy/info`));
    const info = await response.json();

    return new Response(JSON.stringify(info), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e) {
    console.error('Room info error:', e);
    return new Response(JSON.stringify({ error: 'Failed to get room info' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

async function handleWebSocket(request: Request, env: Env, roomId: string): Promise<Response> {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426, headers: corsHeaders });
  }

  try {
    const id = env.TETRIS_ROOM.idFromName(roomId);
    const room = env.TETRIS_ROOM.get(id);

    // Forward the WebSocket request to the Durable Object
    return room.fetch(request);
  } catch (e) {
    console.error('WebSocket error:', e);
    return new Response('Failed to connect', { status: 500, headers: corsHeaders });
  }
}

// Export Durable Object class
export { TetrisRoom };
