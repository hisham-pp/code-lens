export interface UserProfile {
  id: string;
  email: string;
}

export class AuthService {
  private secretKey: string;

  constructor() {
    this.secretKey = 'supersecret';
  }

  public validateToken(token: string): boolean {
    return token.startsWith('bearer-');
  }

  public async getProfile(userId: string): Promise<UserProfile> {
    return { id: userId, email: `${userId}@example.com` };
  }
}
