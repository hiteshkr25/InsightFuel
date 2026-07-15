// Logging Helpers
export const logger = {
  info: (message: string, ...args: any[]) => console.log(`[INFO] ${message}`, ...args),
  warn: (message: string, ...args: any[]) => console.warn(`[WARN] ${message}`, ...args),
  error: (message: string, ...args: any[]) => console.error(`[ERROR] ${message}`, ...args)
};

// Retry Utilities
export async function withRetry<T>(
  fn: () => Promise<T>,
  retries = 3,
  delayMs = 1000
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retries <= 0) throw error;
    logger.warn(`Operation failed, retrying in ${delayMs}ms. Error: ${error instanceof Error ? error.message : String(error)}`);
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    return withRetry(fn, retries - 1, delayMs * 2);
  }
}

// ID Generation
export function generateUUID(): string {
  // Simple RFC4122 compliant UUID v4 generator placeholder
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// Error Helpers
export class InsightFuelError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 500
  ) {
    super(message);
    this.name = 'InsightFuelError';
  }
}

// Date/Time Utilities
export function getUTCTimestamp(): string {
  return new Date().toISOString();
}

// Hashing Helpers
export async function hashSHA256(value: string): Promise<string> {
  // Client-safe/Server-safe SHA-256 placeholder
  logger.info('Hashing value with SHA-256');
  return `sha256_${value.length}_${Buffer.from(value).toString('base64').slice(0, 16)}`;
}

// Common Utility Functions
export function isObject(item: any): boolean {
  return typeof item === 'object' && item !== null && !Array.isArray(item);
}
