import type { AssetType } from "./types"

export const getObjectKey = (assetType: AssetType, filename: string) => {
  return `${assetType}/${filename}`
}
