import assert from 'assert';
import { gql } from 'graphql-tag';
import { server } from '../../src/graphql';
import { ProfilesRepository } from '../../src/repo/Profiles';
import type { RESULTS } from '../../src/rooms/GameRoom';
import type { GoTrueAdminApi } from '@supabase/supabase-js';
import type { User } from '../../src/auth/jwt';
import { prisma } from '../../src/repo/client';
import { TEST_USERS, makeTestContextUser, parseGQLData, setupTestDb, cleanupTestDb } from './utils';
import type {
  Test_GetTotalPlayersQuery,
  Test_GetTotalPlayersQueryVariables,
  Test_GetUserProfileQuery,
  Test_GetUserProfileQueryVariables,
} from '../graphql';

describe('GQLServer', () => {
  before(async () => {
    await cleanupTestDb(prisma);
    await setupTestDb(prisma);
  });

  after(async () => {
    await cleanupTestDb(prisma);
    await prisma.$disconnect();
  });

  const makeDefaultContext = () => ({
    contextValue: {
      dataSources: {
        profilesDb: new ProfilesRepository(prisma),
        gameResults: null as typeof RESULTS,
      },
      authClient: null as GoTrueAdminApi,
      user: null as User,
    },
  });

  it('should fetch total players', async () => {
    const context = makeDefaultContext();

    const result = await server.executeOperation<
      Test_GetTotalPlayersQuery,
      Test_GetTotalPlayersQueryVariables
    >(
      {
        query: gql`
          query Test_GetTotalPlayers {
            totalPlayers
          }
        `,
      },
      context
    );

    const { totalPlayers } = parseGQLData(result);

    assert.deepEqual(totalPlayers, TEST_USERS.length);
  });

  it('should fetch a user profile by the user id', async () => {
    const context = makeDefaultContext();
    context.contextValue.user = makeTestContextUser(TEST_USERS[0]);

    const result = await server.executeOperation<Test_GetUserProfileQuery, Test_GetUserProfileQueryVariables>(
      {
        query: gql`
          query Test_GetUserProfile {
            profile {
              userName
            }
          }
        `,
      },
      context
    );

    const { profile } = parseGQLData(result);

    assert.deepEqual(profile?.userName, TEST_USERS[0].userName);
  });

  it('should not fetch a user profile when no user id is provided', async () => {
    const context = makeDefaultContext();

    const result = await server.executeOperation<Test_GetUserProfileQuery, Test_GetUserProfileQueryVariables>(
      {
        query: gql`
          query Test_GetUserProfile {
            profile {
              userName
            }
          }
        `,
      },
      context
    );

    const { profile } = parseGQLData(result);

    assert.deepEqual(profile, null);
  });
});
