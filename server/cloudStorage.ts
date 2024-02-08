import { HTTPException } from "./deps.ts";
import { SECRET } from "./secret.ts";

export const uploadFile = async (id: string, file: File) => {
  const res = await fetch(
    `https://storage.googleapis.com/upload/storage/v1/b/${SECRET.BUCKET_NAME}/o?uploadType=media&name=${id}.tar`,
    {
      headers: {
        "Content-Type": "application/x-tar",
        Authorization: `Bearer ${SECRET.TOKEN}`,
      },
      method: "POST",
      body: file,
    },
  );
  return await res.json();
};

export const getFile = async (id: string) => {
  console.log("fileId", id, encodeURIComponent(id));
  const res = await fetch(
    `https://storage.googleapis.com/storage/v1/b/${SECRET.BUCKET_NAME}/o/${
      encodeURIComponent(id)
    }.tar?alt=media`,
    {
      headers: {
        Authorization: `Bearer ${SECRET.TOKEN}`,
      },
    },
  );
  if (!res.ok) throw new HTTPException(404, { message: "No file!!" });
  return await res.arrayBuffer();
};
