import { getFile, uploadFile } from "./cloudStorage.ts";
import { Hono, HTTPException } from "./deps.ts";
import { toHashStr } from "./util.ts";

export const app = new Hono();
export const kv = await Deno.openKv();

type FileInfo = {
  id: string;
  fileId: string;
  port: string;
};

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { value: fileInfo } = await kv.get(["fileInfo", id]) as Deno.KvEntry<
    FileInfo
  >;
  if (!fileInfo) throw new HTTPException(404, { message: "file is not found" });
  const file = await getFile(fileInfo.fileId);

  return c.body(file);
});

// サーバー側で解凍してなんとかできないか模索する
app.get("/file_info/:id", async (c) => {
  const id = c.req.param("id");
  const { value: fileInfo } = await kv.get(["fileInfo", id]);

  return c.json({ message: "Hello, World!" });
});

app.post("/", async (c) => {
  const { port } = c.req.query();
  if (!port) throw new HTTPException(400, { message: "host is required" });
  const input = await c.req.parseBody();
  const file = input.upload_file as File;
  const id = crypto.randomUUID();
  const fileId = await toHashStr(crypto.randomUUID());
  try {
    await uploadFile(fileId, file);
    await kv.set(["fileInfo", id], { id, fileId, port });
  } catch (e) {
    throw new Error("失敗:" + e);
  }

  return c.json({ id, fileId, port });
});

Deno.serve(app.fetch);
