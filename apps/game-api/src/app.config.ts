import { defineServer, defineRoom } from 'colyseus';
import { WebSocketTransport } from '@colyseus/ws-transport';
import { monitor } from '@colyseus/monitor';
import { playground } from '@colyseus/playground';
import { expressMiddleware } from '@as-integrations/express5';
import express from 'express';
import cors from 'cors';
import type { GoTrueAdminApi } from '@supabase/supabase-js';
import { WS_ROOM, API_ROUTES, CONNECTION_CHECK_INTERVAL } from '@repo/core-game';
import { server as GQLServer } from './graphql';
import { GameRoom } from './rooms/GameRoom';
import { createContext } from './graphql/context';
import type { PrismaClient } from './repo/prisma-client/client';

const isProduction = process.env.NODE_ENV === 'production';

interface MakeAppArgs {
  authClient: GoTrueAdminApi;
  prisma: PrismaClient;
  /** override the default connection check interval (in ms) */
  connectionCheckInterval?: number;
}

export const makeApp = ({
  authClient,
  prisma,
  connectionCheckInterval = CONNECTION_CHECK_INTERVAL,
}: MakeAppArgs) => {
  return defineServer({
    rooms: {
      [WS_ROOM.GAME_ROOM]: defineRoom(GameRoom, { prisma, connectionCheckInterval }),
    },

    transport: new WebSocketTransport(),

    express: async (app) => {
      await GQLServer.start();
      /**
       * Configure GraphQL route, middleware and context
       */
      app.use(
        API_ROUTES.GRAPHQL,
        cors<cors.CorsRequest>(),
        express.json(),
        expressMiddleware(GQLServer, {
          context: ({ req }) => {
            const authHeader = req.headers.authorization;
            return createContext({ authHeader, authClient, prisma });
          },
        })
      );

      /**
       * Use @colyseus/playground
       * (It is not recommended to expose this route in a production environment)
       */
      if (!isProduction) {
        app.use(API_ROUTES.PLAYGROUND, playground());
      }

      /**
       * Use @colyseus/monitor
       * It is recommended to protect this route with a password
       * Read more: https://docs.colyseus.io/tools/monitor/#restrict-access-to-the-panel-using-a-password
       */
      app.use(API_ROUTES.MONITOR, monitor());
    },

    beforeListen: () => {
      /**
       * Before gameServer.listen() is called.
       */
    },
  });
};
