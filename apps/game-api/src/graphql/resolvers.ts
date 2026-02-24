import type { Resolvers } from './generated-types';
import type { Context } from './context';
import { logger } from '../logger';

export const resolvers: Resolvers<Context> = {
  Query: {
    healthCheck: async () => {
      return true;
    },
    profile: async (_, __, { dataSources, user }) => {
      if (!user) return null;
      return dataSources.profilesDb.getProfileByUserId(user.id);
    },
    userExists: async (_, { userName }, { dataSources }) => {
      const profile = await dataSources.profilesDb.getProfileByUserName(userName);
      return Boolean(profile);
    },
    totalPlayers: async (_, __, { dataSources }) => {
      return dataSources.profilesDb.getTotalPlayers();
    },
    gameResults: async (_, { roomId }, { dataSources }) => {
      const gameResultObject = dataSources.gameResults[roomId];
      const gameResultArray = Object.values(gameResultObject ?? {});

      if (gameResultArray.length === 0) return null;
      return gameResultArray;
    },
  },
  Mutation: {
    createProfile: async (_, { userName }, { dataSources, user }) => {
      if (!user) return null;
      return dataSources.profilesDb.createProfile({
        userId: user.id,
        userName,
      });
    },
    updateProfile: async (_, { userName }, { dataSources, user }) => {
      if (!user) return null;
      return dataSources.profilesDb.updateProfile({
        userId: user.id,
        userName,
      });
    },
    deleteProfile: async (_, __, { authClient, dataSources, user }) => {
      if (!user) return false;
      try {
        await dataSources.profilesDb.deleteProfile(user.id);
        await authClient.deleteUser(user.id);
        return true;
      } catch (error) {
        logger.error({ message: 'Failed to delete profile', data: { error } });
        return false;
      }
    },
  },
};
