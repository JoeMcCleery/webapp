import { Decrypter, Encrypter } from "@zenstackhq/runtime/encryption"

export const getEncryptionKey = () => {
  let textEncoder = new TextEncoder()
  return textEncoder.encode(process.env.DB_ENCRYPTION_KEY || "")
}

export const encryptValue = async (value: string) => {
  const encrypter = new Encrypter(getEncryptionKey())
  return await encrypter.encrypt(value)
}

export const decryptValue = async (encryptedValue: string) => {
  const encrypter = new Decrypter([getEncryptionKey()])
  return await encrypter.decrypt(encryptedValue)
}
