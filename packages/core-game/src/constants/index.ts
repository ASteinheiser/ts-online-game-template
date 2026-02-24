export * from './world';
export * from './player';
export * from './enemy';

/** The routes for the API server */
export const API_ROUTES = {
  GRAPHQL: '/graphql',
  MONITOR: '/monitor',
  PLAYGROUND: '/',
} as const;
/** The websocket rooms available */
export const WS_ROOM = {
  GAME_ROOM: 'game_room',
} as const;
/** The websocket message events available */
export const WS_EVENT = {
  PING: 'ping',
  PONG: 'pong',
  LEAVE_ROOM: 'leaveRoom',
  PLAYER_INPUT: 'playerInput',
  REFRESH_TOKEN: 'refreshToken',
  /** This comes from Colyseus, register this to handle playground messages */
  PLAYGROUND_MESSAGE_TYPES: '__playground_message_types',
} as const;
/** The websocket message codes available */
export const WS_CODE = {
  SUCCESS: 1000,
  INTERNAL_SERVER_ERROR: 1011,
  UNAUTHORIZED: 3000,
  FORBIDDEN: 3003,
  BAD_REQUEST: 3004,
  TIMEOUT: 3008,
  NOT_FOUND: 4004,
} as const;

/** The payload for joining a room or refreshing a token */
export interface AuthPayload {
  token: string;
}

/** The interval at which the server will check client connections (in ms) */
export const CONNECTION_CHECK_INTERVAL = 2 * 1000; // 2 seconds
/** The timeout for the connection to the server (in ms) */
export const INACTIVITY_TIMEOUT = 1 * 60 * 1000; // 1 minute
/** The timeout allowed for an unexpected disconnect to reconnect (in seconds) */
export const RECONNECTION_TIMEOUT = 20; // 20 seconds
