import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"
import type { StreamingBlobPayloadInputTypes } from "@smithy/types"

const client = new S3Client() // Use config and credentials from env vars

const bucketName = process.env.S3_BUCKET

export const uploadObject = async (
  key: string,
  body: StreamingBlobPayloadInputTypes,
) => {
  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: key,
    Body: body,
  })
  const response = await client.send(command)
  console.log(response)
  return response
}

// TODO refresh asset url when url expires
export const getObjectUrl = async (key: string, expiresIn: number = 3600) => {
  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  const expiresAt = new Date(Date.now() + expiresIn * 1000)
  const url = await getSignedUrl(client, command, { expiresIn })
  return { url, expiresAt }
}

// TODO delete objects when deleting asset records
export const deleteObject = async (key: string) => {
  const command = new DeleteObjectCommand({
    Bucket: bucketName,
    Key: key,
  })
  const response = await client.send(command)
  console.log(response)
  return response
}
