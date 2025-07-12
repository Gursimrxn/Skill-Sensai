import { IUserService } from '../core/types';
import { UserRepository } from '../db/repositories/UserRepository';
import { IUser } from '../db/models/User';

export class UserService implements IUserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id);
  }

  async create(userData: Record<string, unknown>): Promise<IUser> {
    return await this.userRepository.create({
      email: userData.email as string,
      name: userData.name as string,
      image: userData.image as string,
      provider: userData.provider as string,
      providerId: userData.providerId as string,
      onboardingCompleted: false,
      level: 1,
    });
  }

  async createUser(userData: Record<string, unknown>): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email as string);
    if (existingUser) {
      throw new Error('User already exists');
    }

    return await this.create(userData);
  }

  async updateUser(id: string, data: Record<string, unknown>): Promise<IUser | null> {
    return await this.userRepository.update(id, data);
  }

  async checkOnboardingStatus(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user?.onboardingCompleted || false;
  }

  async completeOnboarding(userId: string, data: Record<string, unknown>): Promise<IUser | null> {
    return await this.userRepository.update(userId, {
      onboardingCompleted: true,
      skills: data.skills as string[],
      resumeUrl: data.resumeUrl as string,
      level: data.level as number,
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByProviderId(provider: string, providerId: string): Promise<IUser | null> {
    return await this.userRepository.findByProviderId(provider, providerId);
  }
}
