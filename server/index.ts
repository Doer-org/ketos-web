import { Hono } from "./deps.ts";

const app = new Hono();

app.fire();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", (c) => {
  const id = c.req.param("id");
  return c.json({ id });
});

app.post("/", async (c) => {
  const input = await c.req.json();
  const uuid = crypto.randomUUID();
  console.log("input", input);
  return c.json({ id: uuid });
});

export default app;
