import { TetrisRoom } from './TetrisRoom';
import { OnlinePresence } from './OnlinePresence';
import { MatchmakingQueue } from './MatchmakingQueue';
import { TypingRoom } from './TypingRoom';
import { Game2048Room } from './Game2048Room';
import { SnakeRoom } from './SnakeRoom';

interface Env {
  TETRIS_ROOM: DurableObjectNamespace;
  ONLINE_PRESENCE: DurableObjectNamespace;
  MATCHMAKING_QUEUE: DurableObjectNamespace;
  TYPING_ROOM: DurableObjectNamespace;
  GAME_2048_ROOM: DurableObjectNamespace;
  SNAKE_ROOM: DurableObjectNamespace;
  ALLOWED_ORIGINS: string;
}

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

    if (path === '/api/battle/queue/cancel') {
      return handleMatchmakingCancel(request, env);
    }

    if (path === '/api/battle/room-info') {
      return handleRoomInfo(request, env);
    }

    // Presence API routes
    if (path === '/api/presence/heartbeat') {
      return handlePresence(request, env, 'heartbeat');
    }

    if (path === '/api/presence/leave') {
      return handlePresence(request, env, 'leave');
    }

    if (path === '/api/presence/stats') {
      return handlePresence(request, env, 'stats');
    }

    // WebSocket connection to specific room (Tetris)
    if (path.startsWith('/ws/room/')) {
      const roomId = path.replace('/ws/room/', '');
      return handleWebSocket(request, env, roomId, 'tetris');
    }

    // Typing Battle routes
    if (path === '/api/battle/typing/create') {
      return handleCreateRoom(request, env, 'typing');
    }
    if (path === '/api/battle/typing/join') {
      return handleJoinRoom(request, env, 'typing');
    }
    if (path === '/api/battle/typing/queue') {
      return handleMatchmaking(request, env, 'typing');
    }
    if (path.startsWith('/ws/typing/')) {
      const roomId = path.replace('/ws/typing/', '');
      return handleWebSocket(request, env, roomId, 'typing');
    }

    // 2048 Battle routes
    if (path === '/api/battle/2048/create') {
      return handleCreateRoom(request, env, '2048');
    }
    if (path === '/api/battle/2048/join') {
      return handleJoinRoom(request, env, '2048');
    }
    if (path === '/api/battle/2048/queue') {
      return handleMatchmaking(request, env, '2048');
    }
    if (path.startsWith('/ws/2048/')) {
      const roomId = path.replace('/ws/2048/', '');
      return handleWebSocket(request, env, roomId, '2048');
    }

    // Snake Battle routes
    if (path === '/api/battle/snake/create') {
      return handleCreateRoom(request, env, 'snake');
    }
    if (path === '/api/battle/snake/join') {
      return handleJoinRoom(request, env, 'snake');
    }
    if (path === '/api/battle/snake/queue') {
      return handleMatchmaking(request, env, 'snake');
    }
    if (path.startsWith('/ws/snake/')) {
      const roomId = path.replace('/ws/snake/', '');
      return handleWebSocket(request, env, roomId, 'snake');
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

type GameType = 'tetris' | 'typing' | '2048' | 'snake';

function getRoomNamespace(env: Env, gameType: GameType): DurableObjectNamespace {
  switch (gameType) {
    case 'typing': return env.TYPING_ROOM;
    case '2048': return env.GAME_2048_ROOM;
    case 'snake': return env.SNAKE_ROOM;
    default: return env.TETRIS_ROOM;
  }
}

function getWsPath(gameType: GameType): string {
  switch (gameType) {
    case 'typing': return '/ws/typing/';
    case '2048': return '/ws/2048/';
    case 'snake': return '/ws/snake/';
    default: return '/ws/room/';
  }
}

async function handleCreateRoom(request: Request, env: Env, gameType: GameType = 'tetris'): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Consume JSON body (nickname is passed via WebSocket later)
    await request.json();

    const namespace = getRoomNamespace(env, gameType);

    // Generate unique room code with collision detection
    let roomCode: string;
    let attempts = 0;
    const maxAttempts = 5;

    while (attempts < maxAttempts) {
      roomCode = generateRoomCode();
      const id = namespace.idFromName(roomCode);
      const room = namespace.get(id);

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
          wsUrl: `${getWsPath(gameType)}${roomCode}`,
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

async function handleJoinRoom(request: Request, env: Env, gameType: GameType = 'tetris'): Promise<Response> {
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

    const namespace = getRoomNamespace(env, gameType);

    // For simplicity, use room code as room name
    const id = namespace.idFromName(roomCode);
    const room = namespace.get(id);

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
      wsUrl: `${getWsPath(gameType)}${roomCode}`,
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

// Matchmaking using Durable Object (shared across all worker instances)
async function handleMatchmaking(request: Request, env: Env, gameType: GameType = 'tetris'): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    // Read the body and add gameType
    const body = await request.json() as Record<string, unknown>;
    const bodyWithGameType = { ...body, gameType };

    // Use a single global matchmaking queue (handles all game types)
    const queueId = env.MATCHMAKING_QUEUE.idFromName('global');
    const queue = env.MATCHMAKING_QUEUE.get(queueId);

    // Forward to Durable Object with body as text
    const doRequest = new Request('https://dummy/queue', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(bodyWithGameType),
    });

    const response = await queue.fetch(doRequest);
    const result = await response.json() as { matched?: boolean; roomId?: string; needsInit?: boolean; wsUrl?: string };

    // If matched, initialize the room
    if (result.matched && result.roomId && result.needsInit) {
      const namespace = getRoomNamespace(env, gameType);
      const roomId = namespace.idFromName(result.roomId);
      const room = namespace.get(roomId);
      await room.fetch(new Request(`https://dummy/init?roomCode=${result.roomId}`));
    }

    // Add wsUrl to response
    if (result.matched && result.roomId) {
      result.wsUrl = `${getWsPath(gameType)}${result.roomId}`;
    }

    return new Response(JSON.stringify(result), {
      status: response.status,
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

async function handleMatchmakingCancel(request: Request, env: Env): Promise<Response> {
  if (request.method !== 'POST') {
    return new Response('Method not allowed', { status: 405, headers: corsHeaders });
  }

  try {
    const bodyText = await request.text();
    const queueId = env.MATCHMAKING_QUEUE.idFromName('global');
    const queue = env.MATCHMAKING_QUEUE.get(queueId);

    const doRequest = new Request('https://dummy/cancel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: bodyText,
    });

    return queue.fetch(doRequest);
  } catch (e) {
    console.error('Cancel matchmaking error:', e);
    return new Response(JSON.stringify({ error: 'Cancel failed' }), {
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

async function handleWebSocket(request: Request, env: Env, roomId: string, gameType: GameType = 'tetris'): Promise<Response> {
  const upgradeHeader = request.headers.get('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return new Response('Expected WebSocket', { status: 426, headers: corsHeaders });
  }

  try {
    const namespace = getRoomNamespace(env, gameType);
    const id = namespace.idFromName(roomId);
    const room = namespace.get(id);

    // Forward the WebSocket request to the Durable Object
    return room.fetch(request);
  } catch (e) {
    console.error('WebSocket error:', e);
    return new Response('Failed to connect', { status: 500, headers: corsHeaders });
  }
}

// Presence API handler
async function handlePresence(request: Request, env: Env, action: string): Promise<Response> {
  try {
    // Use a single global presence DO instance
    const id = env.ONLINE_PRESENCE.idFromName('global');
    const presence = env.ONLINE_PRESENCE.get(id);

    // Forward the request to the Durable Object
    const doRequest = new Request(`https://dummy/${action}`, {
      method: request.method,
      headers: request.headers,
      body: request.method === 'POST' ? request.body : undefined,
    });

    return presence.fetch(doRequest);
  } catch (e) {
    console.error('Presence error:', e);
    return new Response(JSON.stringify({ error: 'Presence tracking failed' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}

// Export Durable Object classes
export { TetrisRoom, OnlinePresence, MatchmakingQueue, TypingRoom, Game2048Room, SnakeRoom };
