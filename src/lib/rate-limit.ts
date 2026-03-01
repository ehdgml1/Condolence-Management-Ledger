const rateMap = new Map<string, { count: number; resetTime: number }>();

// Auto-cleanup every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateMap) {
    if (now > value.resetTime) {
      rateMap.delete(key);
    }
  }
}, 10 * 60 * 1000).unref?.();

export function checkRateLimit(
  key: string,
  maxAttempts: number,
  windowMs: number,
): { success: boolean; remaining: number } {
  const now = Date.now();
  const record = rateMap.get(key);

  if (!record || now > record.resetTime) {
    rateMap.set(key, { count: 1, resetTime: now + windowMs });
    return { success: true, remaining: maxAttempts - 1 };
  }

  if (record.count >= maxAttempts) {
    return { success: false, remaining: 0 };
  }

  record.count++;
  return { success: true, remaining: maxAttempts - record.count };
}
