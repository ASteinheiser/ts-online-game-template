import type { PrismaClient, Profile } from './prisma-client/client';

export class ProfilesRepository {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async getProfileByUserId(userId: string) {
    return this.prisma.profile.findUnique({
      where: { userId },
    });
  }

  async getProfileByUserName(userName: string) {
    return this.prisma.profile.findUnique({
      where: { userName },
    });
  }

  async getTotalPlayers() {
    return this.prisma.profile.count();
  }

  async createProfile({ userId, userName }: Profile) {
    return this.prisma.profile.create({
      data: {
        userId,
        userName,
      },
    });
  }

  async updateProfile({ userId, userName }: Profile) {
    return this.prisma.profile.update({
      where: { userId },
      data: { userName },
    });
  }

  async deleteProfile(userId: string) {
    return this.prisma.profile.delete({
      where: { userId },
    });
  }
}
