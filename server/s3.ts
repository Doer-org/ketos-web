import {
  DeleteObjectCommand,
  GetObjectCommand,
  PutObjectCommand,
  S3,
} from "./deps.ts";
import { SECRET } from "./secret.ts";

const client = new S3({
  region: "ap-northeast-1",
  credentials: {
    accessKeyId: SECRET.ACCESS_KEY,
    secretAccessKey: SECRET.SECRET_KEY,
  },
});

export const getFileByS3 = async (id: string): Promise<ArrayBuffer> => {
  const input = { Bucket: SECRET.BUCKET_NAME, Key: id };
  const command = new GetObjectCommand(input);
  const res = await client.send(command);
  return await res.Body.transformToByteArray();
};

export const uploadFileByS3 = async (id: string, file: File) => {
  const input = {
    Bucket: SECRET.BUCKET_NAME,
    Key: id,
    Body: await file.arrayBuffer(),
  };
  const command = new PutObjectCommand(input);
  await client.send(command);
};

export const deleteFileByS3 = async (id: string) => {
  const command = new DeleteObjectCommand({
    Bucket: SECRET.BUCKET_NAME,
    Key: id,
  });
  await client.send(command);
};
