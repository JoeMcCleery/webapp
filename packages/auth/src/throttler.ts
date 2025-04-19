interface ThrottlingCounter {
  index: number
  updatedAt: number
}

class Throttler<_Key> {
  public timeoutSeconds: number[]

  private storage = new Map<_Key, ThrottlingCounter>()

  constructor(timeoutSeconds: number[]) {
    this.timeoutSeconds = timeoutSeconds
  }

  public consume(key: _Key): boolean {
    let counter = this.storage.get(key) ?? null
    const now = Date.now()
    // If the key is not in the storage, create a new counter
    if (counter === null) {
      counter = {
        index: 0,
        updatedAt: now,
      }
      this.storage.set(key, counter)
      return true
    }
    // If the key is in the storage, check if it is allowed to consume
    const allowed =
      now - counter.updatedAt >= this.timeoutSeconds[counter.index] * 1000
    if (!allowed) {
      return false
    }
    // If allowed, update the counter (counter is reset seperately once all auth checks on server are successful)
    counter.updatedAt = now
    counter.index = Math.min(counter.index + 1, this.timeoutSeconds.length - 1)
    this.storage.set(key, counter)
    return true
  }

  public reset(key: _Key): void {
    this.storage.delete(key)
  }
}

const throttler = new Throttler<string>([1, 2, 4, 8, 16, 30, 60, 180, 300])

export const throttlerConsume = (key: string) => {
  return throttler.consume(key)
}

export const throttlerReset = (key: string) => {
  throttler.reset(key)
}
