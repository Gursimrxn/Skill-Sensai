import { IRepository } from '../../core/types';
import { Onboarding, IOnboarding } from '../models/Onboarding';
import connectDB from '../connection';

export class OnboardingRepository implements IRepository<IOnboarding> {
  private async ensureConnection() {
    await connectDB();
  }

  async create(data: Partial<IOnboarding>): Promise<IOnboarding> {
    await this.ensureConnection();
    const onboarding = new Onboarding(data);
    return await onboarding.save();
  }

  async findById(id: string): Promise<IOnboarding | null> {
    await this.ensureConnection();
    return await Onboarding.findById(id);
  }

  async findOne(filter: Record<string, any>): Promise<IOnboarding | null> {
    await this.ensureConnection();
    return await Onboarding.findOne(filter);
  }

  async findMany(filter: Record<string, any>): Promise<IOnboarding[]> {
    await this.ensureConnection();
    return await Onboarding.find(filter);
  }

  async update(id: string, data: Partial<IOnboarding>): Promise<IOnboarding | null> {
    await this.ensureConnection();
    return await Onboarding.findByIdAndUpdate(id, data, { new: true });
  }

  async delete(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Onboarding.findByIdAndDelete(id);
    return !!result;
  }

  async findByUserId(userId: string): Promise<IOnboarding | null> {
    await this.ensureConnection();
    return await Onboarding.findOne({ userId });
  }

  async updateStep(userId: string, step: number, stepData: any): Promise<IOnboarding | null> {
    await this.ensureConnection();
    const updateData: any = {
      currentStep: step,
    };

    switch (step) {
      case 1:
        updateData['steps.welcome'] = {
          ...stepData,
          completed: true,
          completedAt: new Date(),
        };
        break;
      case 2:
        updateData['steps.resume'] = {
          ...stepData,
          completed: true,
          completedAt: new Date(),
        };
        break;
      case 3:
        updateData['steps.levelAssignment'] = {
          ...stepData,
          completed: true,
          completedAt: new Date(),
        };
        updateData.completed = true;
        updateData.completedAt = new Date();
        break;
    }

    return await Onboarding.findOneAndUpdate(
      { userId },
      updateData,
      { new: true, upsert: true }
    );
  }
}
