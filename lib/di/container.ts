import { ServiceLocator, SERVICE_KEYS } from '../core/types';
import { UserRepository } from '../db/repositories/UserRepository';
import { OnboardingRepository } from '../db/repositories/OnboardingRepository';
import { UserService } from '../services/UserService';
import { OnboardingService } from '../services/OnboardingService';

export class DIContainer {
  private static initialized = false;

  static initialize() {
    if (this.initialized) {
      return;
    }

    // Register repositories
    const userRepository = new UserRepository();
    const onboardingRepository = new OnboardingRepository();
    
    ServiceLocator.register(SERVICE_KEYS.USER_REPOSITORY, userRepository);
    ServiceLocator.register(SERVICE_KEYS.ONBOARDING_REPOSITORY, onboardingRepository);

    // Register services with dependencies
    const userService = new UserService(userRepository);
    const onboardingService = new OnboardingService(onboardingRepository, userRepository);
    
    ServiceLocator.register(SERVICE_KEYS.USER_SERVICE, userService);
    ServiceLocator.register(SERVICE_KEYS.ONBOARDING_SERVICE, onboardingService);

    this.initialized = true;
  }

  static getUserService(): UserService {
    this.initialize();
    return ServiceLocator.get<UserService>(SERVICE_KEYS.USER_SERVICE);
  }

  static getOnboardingService(): OnboardingService {
    this.initialize();
    return ServiceLocator.get<OnboardingService>(SERVICE_KEYS.ONBOARDING_SERVICE);
  }
}

// Initialize on import for server-side usage
DIContainer.initialize();
