import { Hono, HTTPException } from "./deps.ts";

const app = new Hono();
const kv = await Deno.openKv();

type TCode = { id: string; code: Blob };

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const data = (await kv.get(["codes", id])).value as TCode;
  console.log("data", data);
  return c.json({ data });
});

app.post("/", async (c) => {
  const input: TCode = await c.req.json();
  try {
    const uuid = crypto.randomUUID();
    await kv.set(["codes", uuid], JSON.stringify(input));
    console.log("input", input);
    return c.json({ id: uuid });
  } catch (_) {
    new HTTPException(500, { message: "Error saving data" });
  }
});

Deno.serve(app.fetch);
