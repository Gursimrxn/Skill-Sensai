import { IOnboardingService } from '../core/types';
import { OnboardingRepository } from '../db/repositories/OnboardingRepository';
import { UserRepository } from '../db/repositories/UserRepository';
import { IOnboarding } from '../db/models/Onboarding';

export class OnboardingService implements IOnboardingService {
  constructor(
    private onboardingRepository: OnboardingRepository,
    private userRepository: UserRepository
  ) {}

  async initializeOnboarding(userEmail: string): Promise<IOnboarding> {
    const user = await this.userRepository.findByEmail(userEmail);
    if (!user || user._id == null) {
      throw new Error('User not found');
    }
    return await this.createOnboardingSession(typeof user._id === 'object' && 'toString' in user._id ? user._id.toString() : String(user._id));
  }

  async createOnboardingSession(userId: string): Promise<IOnboarding> {
    const existingSession = await this.onboardingRepository.findByUserId(userId);
    if (existingSession) {
      return existingSession;
    }

    return await this.onboardingRepository.create({
      userId,
      currentStep: 1,
      steps: {
        welcome: { completed: false },
        swap: { completed: false },
        resume: { completed: false },
        levelAssignment: { completed: false },
      },
      completed: false,
    });
  }

  async updateOnboardingStep(userId: string, step: number, data: Record<string, unknown>): Promise<IOnboarding | null> {
    const onboarding = await this.onboardingRepository.updateStep(userId, step, data);
    
    // If this is the final step, also update the user record
    if (step === 4 && onboarding) {
      await this.userRepository.update(userId, {
        onboardingCompleted: true,
        skills: onboarding.steps.welcome.skills,
        swapGoals: onboarding.steps.swap.swapGoals,
        resumeUrl: onboarding.steps.resume.resumeUrl,
        level: onboarding.steps.levelAssignment.level,
      });
    }

    return onboarding;
  }

  async completeOnboarding(userId: string): Promise<IOnboarding | null> {
    const onboarding = await this.onboardingRepository.findByUserId(userId);
    if (!onboarding || onboarding._id == null) {
      throw new Error('Onboarding session not found');
    }
    return await this.onboardingRepository.update(typeof onboarding._id === 'object' && 'toString' in onboarding._id ? onboarding._id.toString() : String(onboarding._id), {
      completed: true,
      completedAt: new Date(),
    });
  }

  async getOnboardingProgress(userId: string): Promise<IOnboarding | null> {
    return await this.onboardingRepository.findByUserId(userId);
  }

  async canAccessOnboarding(userId: string): Promise<boolean> {
    const user = await this.userRepository.findById(userId);
    return !user?.onboardingCompleted;
  }

  async getCurrentStep(userId: string): Promise<number> {
    const onboarding = await this.onboardingRepository.findByUserId(userId);
    return onboarding?.currentStep || 1;
  }
}
