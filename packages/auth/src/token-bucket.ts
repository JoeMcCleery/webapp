interface Bucket {
  count: number
  refilledAt: number
}

class TokenBucketRateLimit<_Key> {
  public max: number
  public refillIntervalSeconds: number

  constructor(max: number, refillIntervalSeconds: number) {
    this.max = max
    this.refillIntervalSeconds = refillIntervalSeconds
  }

  private storage = new Map<_Key, Bucket>()

  public consume(key: _Key, cost: number): boolean {
    let bucket = this.storage.get(key) ?? null
    const now = Date.now()
    // If the key is not in the storage, create a new bucket
    if (bucket === null) {
      bucket = {
        count: this.max - cost,
        refilledAt: now,
      }
      this.storage.set(key, bucket)
      return true
    }
    // If the key is in the storage, refill tokens based on the time passed
    const refill = Math.floor(
      (now - bucket.refilledAt) / (this.refillIntervalSeconds * 1000)
    )
    bucket.count = Math.min(bucket.count + refill, this.max)
    bucket.refilledAt =
      bucket.refilledAt + refill * this.refillIntervalSeconds * 1000
    // Check if there are enough tokens to consume
    if (bucket.count < cost) {
      return false
    }
    // If there are enough tokens, consume them and update the bucket
    bucket.count -= cost
    this.storage.set(key, bucket)
    return true
  }
}

const tokenBucket = new TokenBucketRateLimit<string>(10, 2)

export const tokenBucketConsume = (key: string, cost: number) => {
  return tokenBucket.consume(key, cost)
}
