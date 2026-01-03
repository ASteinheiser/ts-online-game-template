import type { ContextFunction } from '@apollo/server';
import { type GoTrueAdminApi } from '@supabase/supabase-js';
import { ProfilesRepository } from '../repo/Profiles';
import type { PrismaClient } from '../repo/prisma-client/client';
import { validateJwt, type User } from '../auth/jwt';
import { RESULTS } from '../rooms/GameRoom';

interface CreateContextArgs {
  authHeader?: string;
  authClient: GoTrueAdminApi;
  prisma: PrismaClient;
}

export interface Context {
  user: User | null;
  authClient: GoTrueAdminApi;
  dataSources: {
    profilesDb: ProfilesRepository;
    // this is a cheap solution, you'll probably want to use the DB for actual usage
    gameResults: typeof RESULTS;
  };
}

export const createContext: ContextFunction<[CreateContextArgs], Context> = async ({
  authHeader,
  authClient,
  prisma,
}) => {
  const user = validateJwt(authHeader);

  return {
    user,
    authClient,
    dataSources: {
      profilesDb: new ProfilesRepository(prisma),
      gameResults: RESULTS,
    },
  };
};
