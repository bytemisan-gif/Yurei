export class RateLimiter {
  private static userCooldowns = new Map<string, number>();

  public static checkRateLimit(
    userId: string,
    command: string,
    cooldownSeconds: number
  ): { limited: boolean; remainingSeconds: number } {
    if (cooldownSeconds <= 0) return { limited: false, remainingSeconds: 0 };

    const key = `${userId}:${command}`;
    const now = Date.now();
    const expiry = this.userCooldowns.get(key) || 0;

    if (now < expiry) {
      const remainingSeconds = Math.ceil((expiry - now) / 1000);
      return { limited: true, remainingSeconds };
    }

    this.userCooldowns.set(key, now + cooldownSeconds * 1000);
    return { limited: false, remainingSeconds: 0 };
  }
}
