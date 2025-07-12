import { IUserService } from '../core/types';
import { UserRepository } from '../db/repositories/UserRepository';
import { IUser } from '../db/models/User';

export class UserService implements IUserService {
  constructor(private userRepository: UserRepository) {}

  async getUserById(id: string): Promise<IUser | null> {
    return await this.userRepository.findById(id);
  }

  async create(userData: any): Promise<IUser> {
    return await this.userRepository.create({
      email: userData.email,
      name: userData.name,
      image: userData.image,
      provider: userData.provider,
      providerId: userData.providerId,
      onboardingCompleted: false,
      level: 1,
    });
  }

  async createUser(userData: any): Promise<IUser> {
    const existingUser = await this.userRepository.findByEmail(userData.email);
    if (existingUser) {
      throw new Error('User already exists');
    }

    return await this.create(userData);
  }

  async updateUser(id: string, data: any): Promise<IUser | null> {
    return await this.userRepository.update(id, data);
  }

  async checkOnboardingStatus(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return user?.onboardingCompleted || false;
  }

  async completeOnboarding(userId: string, data: any): Promise<IUser | null> {
    return await this.userRepository.update(userId, {
      onboardingCompleted: true,
      skills: data.skills,
      resumeUrl: data.resumeUrl,
      level: data.level,
    });
  }

  async findByEmail(email: string): Promise<IUser | null> {
    return await this.userRepository.findByEmail(email);
  }

  async findByProviderId(provider: string, providerId: string): Promise<IUser | null> {
    return await this.userRepository.findByProviderId(provider, providerId);
  }
}
