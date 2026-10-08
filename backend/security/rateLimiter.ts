/**
 * Enterprise Sliding Window Rate Limiter
 * 
 * Provides distributed-ready sliding window rate limiting.
 * - In-memory high-throughput sliding window store with automatic TTL background sweep.
 * - Redis / Upstash adapter interface for multi-instance cloud deployments.
 * - Protects against brute-force logins, contact form spam, and API flooding.
 */

export interface RateLimiterOptions {
  windowMs: number;     // Window duration in milliseconds (e.g. 60_000 for 1 min)
  maxRequests: number;  // Maximum permitted requests within the window
  keyPrefix?: string;   // Prefix to isolate namespaces
}

export interface RateLimitResult {
  success: boolean;     // Whether the request is permitted
  limit: number;        // Total maximum allowed
  remaining: number;    // Remaining quota in current window
  resetTime: number;    // Timestamp (ms) when window resets
  retryAfterMs: number; // Time client must wait before retrying (0 if allowed)
}

export interface RateLimitStore {
  incrementAndCheck(key: string, options: RateLimiterOptions): Promise<RateLimitResult>;
  checkQuota(key: string, options: RateLimiterOptions): Promise<{ locked: boolean; retryAfterMs: number }>;
  reset(key: string): Promise<void>;
  clearExpired(): number;
}

/**
 * High-performance sliding window log memory store with automatic TTL eviction
 */
export class MemorySlidingWindowStore implements RateLimitStore {
  private store = new Map<string, number[]>();
  private lastSweep = Date.now();
  private maxKeys: number;
  private sweepIntervalMs: number;

  constructor(options: { maxKeys?: number; sweepIntervalMs?: number } = {}) {
    this.maxKeys = options.maxKeys || 10000;
    this.sweepIntervalMs = options.sweepIntervalMs || 60000; // 1 minute
  }

  async checkQuota(key: string, options: RateLimiterOptions): Promise<{ locked: boolean; retryAfterMs: number }> {
    const now = Date.now();
    const windowStart = now - options.windowMs;
    const timestamps = (this.store.get(key) || []).filter(ts => ts > windowStart);
    if (timestamps.length >= options.maxRequests) {
      const oldestInWindow = timestamps[0] || now;
      const retryAfterMs = Math.max(0, oldestInWindow + options.windowMs - now);
      return { locked: true, retryAfterMs };
    }
    return { locked: false, retryAfterMs: 0 };
  }

  async incrementAndCheck(key: string, options: RateLimiterOptions): Promise<RateLimitResult> {
    const now = Date.now();
    const windowStart = now - options.windowMs;

    // Run periodic garbage collection to prevent memory leaks from one-off IPs/emails
    if (now - this.lastSweep > this.sweepIntervalMs) {
      this.clearExpired();
      this.lastSweep = now;
    }

    let timestamps = this.store.get(key) || [];
    
    // Evict timestamps outside the sliding window
    timestamps = timestamps.filter(ts => ts > windowStart);

    if (timestamps.length >= options.maxRequests) {
      // Limit exceeded
      const oldestInWindow = timestamps[0] || now;
      const retryAfterMs = Math.max(0, oldestInWindow + options.windowMs - now);
      const resetTime = oldestInWindow + options.windowMs;

      this.store.set(key, timestamps);

      return {
        success: false,
        limit: options.maxRequests,
        remaining: 0,
        resetTime,
        retryAfterMs
      };
    }

    // Allow request and record timestamp
    timestamps.push(now);

    // Safeguard max memory map size
    if (this.store.size >= this.maxKeys) {
      this.clearOldest();
    }

    this.store.set(key, timestamps);

    const oldestInWindow = timestamps[0];
    const resetTime = oldestInWindow + options.windowMs;

    return {
      success: true,
      limit: options.maxRequests,
      remaining: Math.max(0, options.maxRequests - timestamps.length),
      resetTime,
      retryAfterMs: 0
    };
  }

  async reset(key: string): Promise<void> {
    this.store.delete(key);
  }

  clearExpired(): number {
    const now = Date.now();
    let removed = 0;
    // Evict entries where all timestamps are older than 1 hour or empty
    for (const [key, timestamps] of this.store.entries()) {
      if (timestamps.length === 0 || timestamps[timestamps.length - 1] < now - 3600000) {
        this.store.delete(key);
        removed++;
      }
    }
    return removed;
  }

  private clearOldest() {
    // Evict oldest 10% of keys if capacity limit hit
    let count = 0;
    const target = Math.ceil(this.maxKeys * 0.1);
    for (const key of this.store.keys()) {
      this.store.delete(key);
      count++;
      if (count >= target) break;
    }
  }

  size(): number {
    return this.store.size;
  }
}

/**
 * Universal RateLimiter coordinating store and options
 */
export class RateLimiter {
  private store: RateLimitStore;
  private options: RateLimiterOptions;

  constructor(options: RateLimiterOptions, customStore?: RateLimitStore) {
    this.options = options;
    this.store = customStore || defaultMemoryStore;
  }

  async check(rawKey: string): Promise<RateLimitResult> {
    const key = this.options.keyPrefix ? `${this.options.keyPrefix}:${rawKey}` : rawKey;
    return await this.store.incrementAndCheck(key, this.options);
  }

  async isLocked(rawKey: string): Promise<{ locked: boolean; retryAfterMs: number }> {
    const key = this.options.keyPrefix ? `${this.options.keyPrefix}:${rawKey}` : rawKey;
    return await this.store.checkQuota(key, this.options);
  }

  async reset(rawKey: string): Promise<void> {
    const key = this.options.keyPrefix ? `${this.options.keyPrefix}:${rawKey}` : rawKey;
    await this.store.reset(key);
  }
}

// Global shared store singleton
const defaultMemoryStore = new MemorySlidingWindowStore();

/**
 * Standard pre-configured Rate Limiters for critical application domains
 */

// 1. Auth Login: Max 5 failed/attempts per 5 minutes per user/IP
export const authRateLimiter = new RateLimiter({
  windowMs: 5 * 60 * 1000,
  maxRequests: 5,
  keyPrefix: 'auth_login'
});

// 2. Contact & CSKH Form: Max 3 submissions per 1 minute per email/IP to prevent inbox spam
export const contactRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 3,
  keyPrefix: 'contact_form'
});

// 3. Checkout Creation: Max 10 requests per 1 minute to prevent inventory hold exhaustion
export const checkoutRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 10,
  keyPrefix: 'checkout'
});

// 4. Payment Webhook: Max 60 requests per 1 minute per gateway origin
export const webhookRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 60,
  keyPrefix: 'webhook'
});

// 5. File Upload Rate Limiter: Max 15 uploads per 1 minute per staff user
export const uploadRateLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 15,
  keyPrefix: 'media_upload'
});

// 6. Global IP Route Limiter: Max 80 requests per 1 minute per IP (protects against F5 spam & HTTP flood)
export const globalIpLimiter = new RateLimiter({
  windowMs: 60 * 1000,
  maxRequests: 80,
  keyPrefix: 'global_ip_flood'
});
