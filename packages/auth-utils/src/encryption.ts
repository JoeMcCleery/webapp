import * as crypto from "crypto"

export type EncryptionOptions = {
  key?: string
}

const defaultOptions: EncryptionOptions = {
  key: process.env.DB_ENCRYPTION_KEY!,
}

export function encryptText(
  text: string,
  options: EncryptionOptions = {},
): string {
  options = { ...defaultOptions, ...options }
  const iv = crypto.randomBytes(16) // Initialization vector
  const cipher = crypto.createCipheriv("aes-256-cbc", options.key!, iv)
  const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
  // Return the IV and encrypted data as a combined string
  return iv.toString("hex") + ":" + encrypted.toString("hex")
}

export function decryptText(
  encryptedData: string,
  options: EncryptionOptions = {},
): string {
  options = { ...defaultOptions, ...options }
  const textParts = encryptedData.split(":")
  const iv = Buffer.from(textParts.shift()!, "hex")
  const encryptedText = Buffer.from(textParts.join(":"), "hex")
  const decipher = crypto.createDecipheriv("aes-256-cbc", options.key!, iv)
  const decrypted = Buffer.concat([
    decipher.update(encryptedText),
    decipher.final(),
  ])
  return decrypted.toString("utf8")
}
