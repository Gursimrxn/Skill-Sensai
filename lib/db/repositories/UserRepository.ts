import { IRepository } from '../../core/types';
import { User, IUser } from '../models/User';
import connectDB from '../connection';

export class UserRepository implements IRepository<IUser> {
  private async ensureConnection() {
    await connectDB();
  }

  async create(userData: Partial<IUser>): Promise<IUser> {
    await this.ensureConnection();
    const user = new User(userData);
    return await user.save();
  }

  async findById(id: string): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findById(id);
  }

  async findOne(filter: Record<string, unknown>): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findOne(filter);
  }

  async findMany(filter: Record<string, unknown>): Promise<IUser[]> {
    await this.ensureConnection();
    return await User.find(filter);
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await User.findByIdAndDelete(id);
    return !!result;
  }

  async findByEmail(email: string): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findOne({ email });
  }

  async findByProviderId(provider: string, providerId: string): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findOne({ provider, providerId });
  }

  async searchBySkills(skills: string[], limit = 20): Promise<IUser[]> {
    await this.ensureConnection();
    return await User.find({
      skills: { $in: skills },
      onboardingCompleted: true
    }).limit(limit).select('-providerId -provider');
  }

  async searchBySkillsToLearn(skillsToLearn: string[], limit = 20): Promise<IUser[]> {
    await this.ensureConnection();
    return await User.find({
      skillsToLearn: { $in: skillsToLearn },
      onboardingCompleted: true
    }).limit(limit).select('-providerId -provider');
  }

  async searchUsers(filters: {
    skills?: string[];
    skillsToLearn?: string[];
    level?: number;
    availability?: {
      days?: string[];
      timeSlots?: string[];
    };
  }, limit = 20): Promise<IUser[]> {
    await this.ensureConnection();
    
    const query: any = { onboardingCompleted: true };
    
    if (filters.skills && filters.skills.length > 0) {
      query.skills = { $in: filters.skills };
    }
    
    if (filters.skillsToLearn && filters.skillsToLearn.length > 0) {
      query.skillsToLearn = { $in: filters.skillsToLearn };
    }
    
    if (filters.level) {
      query.level = filters.level;
    }
    
    if (filters.availability?.days && filters.availability.days.length > 0) {
      query['availability.days'] = { $in: filters.availability.days };
    }
    
    if (filters.availability?.timeSlots && filters.availability.timeSlots.length > 0) {
      query['availability.timeSlots'] = { $in: filters.availability.timeSlots };
    }
    
    return await User.find(query)
      .limit(limit)
      .select('-providerId -provider')
      .sort({ level: -1, createdAt: -1 });
  }
}
