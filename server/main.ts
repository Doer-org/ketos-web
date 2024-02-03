import { Hono, HTTPException } from "./deps.ts";

export const app = new Hono();
export const kv = await Deno.openKv();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { value } = await kv.get(["codes", id]);
  c.res.headers.set("content-type", "application/x-tar");
  return c.body(value as ArrayBuffer);
});

app.post("/", async (c) => {
  const input = await c.req.arrayBuffer();
  try {
    const uuid = crypto.randomUUID();
    await kv.set(["codes", uuid], input);
    return c.json({ id: uuid });
  } catch (_) {
    new HTTPException(500, { message: "Error saving data" });
  }
});

Deno.serve(app.fetch);
