// Core types for dependency injection
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, any>): Promise<T | null>;
  findMany(filter: Record<string, any>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAuthService {
  getCurrentUser(): Promise<any>;
  signOut(): Promise<void>;
}

export interface IUserService {
  getUserById(id: string): Promise<any>;
  createUser(userData: any): Promise<any>;
  updateUser(id: string, data: any): Promise<any>;
  checkOnboardingStatus(userId: string): Promise<boolean>;
  completeOnboarding(userId: string, data: any): Promise<any>;
}

export interface IOnboardingService {
  createOnboardingSession(userId: string): Promise<any>;
  updateOnboardingStep(sessionId: string, step: number, data: any): Promise<any>;
  completeOnboarding(sessionId: string): Promise<any>;
  getOnboardingProgress(userId: string): Promise<any>;
}

// Service locator pattern for dependency injection
export class ServiceLocator {
  private static services: Map<string, any> = new Map();

  static register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  static get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }
    return service;
  }
}

// Service keys
export const SERVICE_KEYS = {
  USER_SERVICE: 'UserService',
  ONBOARDING_SERVICE: 'OnboardingService',
  AUTH_SERVICE: 'AuthService',
  USER_REPOSITORY: 'UserRepository',
  ONBOARDING_REPOSITORY: 'OnboardingRepository',
} as const;
