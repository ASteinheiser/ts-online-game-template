import 'dotenv/config';
import { Client } from 'colyseus.js';
import { cli, type Options } from '@colyseus/loadtest';
import { WS_ROOM, WS_EVENT, type InputPayload } from '@repo/core-game';
import type { GameRoomState } from '../../src/rooms/GameRoom/roomState';
import { prisma } from '../../src/repo/client';
import { generateTestJWT, setupTestDb, cleanupTestDb, TEST_USERS } from '../integration/utils';

const IS_PROD = process.env.NODE_ENV === 'production';

const JOIN_DELAY_MS = 500;
const TEST_USER_EXPIRES_IN_MS = 3 * 60 * 1000; // 3 minutes

let playerCount = 0;
// keep track of which player is tracking which enemy
const enemiesTracked: Record<string, string> = {};

export async function main(options: Options) {
  console.log('joining room...', options);
  await new Promise((resolve) => setTimeout(resolve, JOIN_DELAY_MS));

  const websocketUrl = `${IS_PROD ? 'wss' : 'ws'}://${options.endpoint}`;
  const graphqlUrl = `${IS_PROD ? 'https' : 'http'}://${options.endpoint}/graphql`;

  const client = new Client(websocketUrl);
  client.auth.token = generateTestJWT({
    user: TEST_USERS[playerCount++],
    expiresInMs: TEST_USER_EXPIRES_IN_MS,
  });

  const room = await client.joinOrCreate<GameRoomState>(WS_ROOM.GAME_ROOM);
  console.log('joined room successfully!');

  // add this listener otherwise colyseus will show a warning
  room.onMessage(WS_EVENT.PLAYGROUND_MESSAGE_TYPES, () => {});

  let killCount = 0;
  room.onStateChange((state) => {
    const player = state.players.get(room.sessionId);

    if (player.killCount > killCount) {
      killCount = player.killCount;
      console.log(`${player.username} hit an enemy!`);
    }

    let closestDistanceSquared = Infinity;

    state.enemies.forEach((enemy) => {
      // only allow one player to track one enemy (simple way to prevent AI grouping)
      if (Object.values(enemiesTracked).includes(enemy.id)) return;

      const distanceSquared = (player.x - enemy.x) ** 2 + (player.y - enemy.y) ** 2;
      if (distanceSquared < closestDistanceSquared) {
        closestDistanceSquared = distanceSquared;
        enemiesTracked[player.userId] = enemy.id;
      }
    });

    const closestEnemy = state.enemies.find((enemy) => enemiesTracked[player.userId] === enemy.id);
    if (closestEnemy) {
      const input: InputPayload = {
        seq: 0,
        left: closestEnemy.x < player.x,
        right: closestEnemy.x > player.x,
        up: closestEnemy.y < player.y,
        down: closestEnemy.y > player.y,
        attack: true,
      };

      room.send(WS_EVENT.PLAYER_INPUT, input);
    }
  });

  room.onLeave(async (code) => {
    console.log(`leaving room with code: ${code}`);

    const results = await fetch(graphqlUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: `
          query Test_GetGameResults {
            gameResults(roomId: "${room.roomId}") {
              username
              attackCount
              killCount
            }
          }
        `,
      }),
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const response: any = await results.json();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    response.data.gameResults.forEach((result: any) => {
      const accuracy = (result.killCount / result.attackCount).toFixed(2);
      console.log(`${result.username} - kill count: ${result.killCount} (accuracy ${accuracy}%)`);
    });
  });
}

if (!IS_PROD) {
  await cleanupTestDb(prisma);
  await setupTestDb(prisma);
}

cli(main);
