import { generateRandomString, RandomReader } from "@oslojs/crypto/random"

const random: RandomReader = {
  read(bytes) {
    crypto.getRandomValues(bytes)
  },
}
const otpAlphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
export function generateOTPCode(length: number) {
  return generateRandomString(random, otpAlphabet, length)
}
