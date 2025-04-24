export interface IStorage<Key, Value> {
  get(key: Key): Value | undefined
  set(key: Key, value: Value): void
  delete(key: Key): void
}

export const createInMemoryStorage = <Key, Value>() => new Map<Key, Value>()
