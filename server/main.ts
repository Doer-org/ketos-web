import { Hono, HTTPException } from "./deps.ts";

export const app = new Hono();
export const kv = await Deno.openKv();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { value } = await kv.get(["codes", id]);
  c.res.headers.set("content-type", "application/x-tar");
  if (!value) throw new HTTPException(404, { message: "data is not found" });
  return c.body(value as ArrayBuffer);
});

app.post("/", async (c) => {
  const input = await c.req.parseBody();
  const file = input.upload_file as File;
  const uuid = crypto.randomUUID();
  try {
    await kv.set(["codes", uuid], await file.arrayBuffer());
  } catch (_) {
    throw new HTTPException(500, { message: "Error saving data" });
  }
  return c.json({ id: uuid });
});

Deno.serve(app.fetch);
