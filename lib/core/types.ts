// Core types for dependency injection
export interface IRepository<T> {
  create(data: Partial<T>): Promise<T>;
  findById(id: string): Promise<T | null>;
  findOne(filter: Record<string, unknown>): Promise<T | null>;
  findMany(filter: Record<string, unknown>): Promise<T[]>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}

export interface IAuthService {
  getCurrentUser(): Promise<unknown>;
  signOut(): Promise<void>;
}

export interface IUserService {
  getUserById(id: string): Promise<unknown>;
  createUser(userData: Record<string, unknown>): Promise<unknown>;
  updateUser(id: string, data: Record<string, unknown>): Promise<unknown>;
  checkOnboardingStatus(userId: string): Promise<boolean>;
  completeOnboarding(userId: string, data: Record<string, unknown>): Promise<unknown>;
}

export interface IOnboardingService {
  createOnboardingSession(userId: string): Promise<unknown>;
  updateOnboardingStep(sessionId: string, step: number, data: Record<string, unknown>): Promise<unknown>;
  completeOnboarding(sessionId: string): Promise<unknown>;
  getOnboardingProgress(userId: string): Promise<unknown>;
}

// Service locator pattern for dependency injection
export class ServiceLocator {
  private static services: Map<string, unknown> = new Map();

  static register<T>(key: string, service: T): void {
    this.services.set(key, service);
  }

  static get<T>(key: string): T {
    const service = this.services.get(key);
    if (!service) {
      throw new Error(`Service ${key} not found`);
    }
    return service as T;
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
