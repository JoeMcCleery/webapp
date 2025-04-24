import { createInMemoryStorage, IStorage } from "./storage"

interface ThrottlingCounter {
  index: number
  updatedAt: number
}

interface ThrottlerConfig<StorageKey> {
  storage?: IStorage<StorageKey, ThrottlingCounter>
  timeoutSeconds?: number[]
}

class Throttler<StorageKey> {
  private storage: IStorage<StorageKey, ThrottlingCounter>
  private timeoutSeconds: number[]

  constructor(config: ThrottlerConfig<StorageKey> = {}) {
    this.storage =
      config.storage ?? createInMemoryStorage<StorageKey, ThrottlingCounter>()
    this.timeoutSeconds = config.timeoutSeconds ?? [
      1, 2, 4, 8, 16, 30, 60, 180, 300, 600,
    ]
  }

  public consume(key: StorageKey): boolean {
    // Try find the counter for the provided key
    let counter = this.storage.get(key)
    const now = Date.now()
    // If no counter wasn't found, create a new one
    if (!counter) {
      counter = {
        index: 0,
        updatedAt: now,
      }
      this.storage.set(key, counter)
      // Success
      return true
    }
    // Check if the counter can consume
    const allowed =
      now - counter.updatedAt >= this.timeoutSeconds[counter.index] * 1000
    if (!allowed) {
      return false
    }
    // Set new updated at time and increase the index (index is reset elsewhere, normally once a request is successful)
    counter.updatedAt = now
    counter.index = Math.min(counter.index + 1, this.timeoutSeconds.length - 1)
    this.storage.set(key, counter)
    // Success
    return true
  }

  public reset(key: StorageKey): void {
    this.storage.delete(key)
  }
}

const throttler = new Throttler<string>()

export const throttlerConsume = (key: string) => {
  return throttler.consume(key)
}

export const throttlerReset = (key: string) => {
  throttler.reset(key)
}
