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

  async findOne(filter: Record<string, any>): Promise<IUser | null> {
    await this.ensureConnection();
    return await User.findOne(filter);
  }

  async findMany(filter: Record<string, any>): Promise<IUser[]> {
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
}
