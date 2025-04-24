import { createInMemoryStorage, IStorage } from "./storage"

interface TokenBucket {
  count: number
  refilledAt: number
}

interface TokenBucketConfig<StorageKey> {
  storage?: IStorage<StorageKey, TokenBucket>
  max?: number
  refillIntervalSeconds?: number
}

class TokenBucketRateLimit<StorageKey> {
  private storage: IStorage<StorageKey, TokenBucket>
  private max: number
  private refillIntervalSeconds: number

  constructor(config: TokenBucketConfig<StorageKey> = {}) {
    this.storage =
      config.storage ?? createInMemoryStorage<StorageKey, TokenBucket>()
    this.max = config.max ?? 10
    this.refillIntervalSeconds = config.refillIntervalSeconds ?? 2
  }

  public consume(key: StorageKey, cost: number): boolean {
    // Try find the bucket for the provided key
    let bucket = this.storage.get(key)
    const now = Date.now()
    // If bucket wasn't found, create a new one
    if (!bucket) {
      bucket = {
        count: this.max - cost,
        refilledAt: now,
      }
      this.storage.set(key, bucket)
      // Success
      return true
    }
    // Refill the bucket based on the time passed
    const refill = Math.floor(
      (now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000),
    )
    bucket.count = Math.min(bucket.count + refill, this.max)
    bucket.refilledAt =
      bucket.refilledAt + refill * this.refillIntervalSeconds * 1000
    // Check if there are enough tokens to consume
    if (bucket.count < cost) {
      return false
    }
    // Consume tokens
    bucket.count -= cost
    this.storage.set(key, bucket)
    // Success
    return true
  }
}

const tokenBucket = new TokenBucketRateLimit<string>()

export const tokenBucketConsume = (key: string, cost: number) => {
  return tokenBucket.consume(key, cost)
}
