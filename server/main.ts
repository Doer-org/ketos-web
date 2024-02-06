import os from "https://deno.land/x/dos@v0.1.0/mod.ts";
import { Tar, unZipFromFile } from "./deps.ts";
import { compress, fs } from "./deps.ts";
import { Hono, HTTPException } from "./deps.ts";
import { Buffer } from "https://deno.land/std@0.214.0/io/buffer.ts";

export const app = new Hono();
export const kv = await Deno.openKv();

type TChunk = { buf: ArrayBuffer; order: number };
type TKvIterChunks = Deno.KvListIterator<TChunk>;

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { value: code } = await kv.get(["code", id]);
  if (!code) throw new HTTPException(404, { message: "code is not found" });
  const chunkIter: TKvIterChunks = kv.list({ prefix: ["chunk", id] });
  const chunks: TChunk[] = [];
  const chunkBytes: number[] = [];
  for await (const chunk of chunkIter) {
    chunkBytes.push(chunk.value.buf.byteLength);
    chunks.push(chunk.value);
  }
  const chunkByteSum = chunkBytes.reduce((acc, cur) => acc + cur, 0);
  const buf = new Uint8Array(chunkByteSum);

  let current = 0;
  let currentChunkSum = 0;
  for (const chunk of chunks) {
    buf.set(new Uint8Array(chunk.buf), currentChunkSum);
    current++;
    currentChunkSum += chunk.buf.byteLength;
    console.log("currentChunSum", current, currentChunkSum, currentChunkSum);
  }

  if (!code) throw new HTTPException(404, { message: "chunk is not found" });
  c.res.headers.set("content-type", "application/x-tar");

  // プロセスが開始できないんだけど、多分.gitが入ってるからだと思う。
  // あとこれでできなかったら const buffer =new Buffer から buffer.bytes()に変える
  return c.body(buf.buffer);
});

// サーバー側で解凍してなんとかできないか模索する
app.get("/file_info/:id", async (c) => {
  const id = c.req.param("id");
  const { value } = await kv.get(["codes", id]);
  Deno.writeFileSync("./temp.tgz", new Uint8Array(value as ArrayBuffer));
  const unziped = await unZipFromFile("./temp.tgz");
  //

  return c.json({ message: "Hello, World!" });
});

app.post("/", async (c) => {
  const { host } = c.req.query();
  if (!host) throw new HTTPException(400, { message: "host is required" });
  const input = await c.req.parseBody();
  const file = input.upload_file as File;
  const uuid = crypto.randomUUID();
  const bufArray = await file.arrayBuffer();

  // 約100万byte以上の場合はこのアプリケーションでは処理しない
  const requiredChunkCount = Math.ceil(bufArray.byteLength / 30000);
  // 33以下なら必要な数だけをchunkさせる。33回以上chunkが必要ならエラーを返す
  const canDoChunk = requiredChunkCount < 50;
  const bufSizeBychunk = Math.ceil(bufArray.byteLength / requiredChunkCount);

  // console.log("バイト数:", bufArray.byteLength);
  // console.log("必要なchunk回数:", requiredChunkCount);
  // console.log("1回のchunkサイズ:", bufSizeBychunk);

  if (!canDoChunk) {
    throw new HTTPException(500, {
      message: `${bufArray.byteLength - 1500000}byte分制限オーバーです`,
    });
  }
  let currentBufPositon = 0;
  let order = 1;

  try {
    await kv.set(["code", uuid], { id: uuid, host });
    while (currentBufPositon < bufArray.byteLength) {
      // console.log(`現在のチャンク:${currentBufPositon}`);
      const buf = bufArray.slice(currentBufPositon, currentBufPositon + 30000);
      await kv.set(["chunk", uuid, order], { buf, order });
      currentBufPositon += bufSizeBychunk;
      order++;
    }
  } catch (error) {
    throw new HTTPException(500, { message: error });
  }

  return c.json({ id: uuid, host });
});

Deno.serve(app.fetch);
