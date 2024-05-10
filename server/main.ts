import { Hono, HTTPException } from "./deps.ts";
import { toHashStr } from "./util.ts";
import { CONSTANT } from "./constants.ts";
import { getFileByS3, uploadFileByS3 } from "./s3.ts";
// import { enqueue } from "./queue.ts";
import { deleteFileByS3 } from "./s3.ts";

export const app = new Hono();
export const kv = await Deno.openKv();

export type FileInfo = {
  id: string;
  fileId: string;
  port: string;
  createdAt: string;
};

kv.listenQueue(async (queue: unknown) => {
  const { data } = queue as TQueue;
  const fileInfo = data as FileInfo;
  await kv.delete(["fileInfo", fileInfo.id]);
  await deleteFileByS3(fileInfo.fileId);
});

type TQueue = { key: string; data: unknown };

export const enqueue = async <T>(key: string, data: T, delay: number) => {
  await kv.enqueue({ key, data }, { delay });
};

app.get("/health", (c) => c.json({ message: "Hello, World!" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const fileInfo = await kv.get(["fileInfo", id]) as Deno.KvEntry<FileInfo>;
  if (!fileInfo) throw new HTTPException(404, { message: "file not found" });
  const file = await getFileByS3(fileInfo.value.fileId);
  return c.body(file);
});

app.get("/info/:id", async (c) => {
  const id = c.req.param("id");
  console.log(id);
  const fileInfo = await kv.get(["fileInfo", id]) as Deno.KvEntry<FileInfo>;
  if (!fileInfo) throw new HTTPException(404, { message: "file not found" });
  return c.json({ id: fileInfo.value.id, port: fileInfo.value.port });
});

app.get("/file_info/:id", async (c) => {
  const id = c.req.param("id");
  const fileInfo = await kv.get(["fileInfo", id]) as Deno.KvEntry<FileInfo>;
  const { fileId, ...canShowFileInfo } = fileInfo.value;
  if (!fileInfo) throw new HTTPException(404, { message: "file not found" });
  const file = await getFileByS3(fileId);
  return c.json({ ...canShowFileInfo, size: file.byteLength });
});

app.post("/", async (c) => {
  const { port } = c.req.query();
  if (!port) throw new HTTPException(400, { message: "host is required" });

  const file = (await c.req.parseBody()).upload_file as File;
  if (file.size > CONSTANT.MAX_BYTE) {
    throw new HTTPException(413, { message: "too large file" });
  }

  const id = crypto.randomUUID();
  const fileId = await toHashStr(crypto.randomUUID());
  try {
    await uploadFileByS3(fileId, file);
    const fileInfo: FileInfo = {
      id,
      fileId,
      port,
      createdAt: new Date().toISOString(),
    };
    await kv.set(["fileInfo", id], fileInfo);
    // 3分後に自動で削除する
    await enqueue("deleteFile", fileInfo, 1000 * 60 * 3);
  } catch (e) {
    throw new HTTPException(500, { message: "file not saved:" + e });
  }
  return c.json({ id, port });
});

Deno.serve(app.fetch);
