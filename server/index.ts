import { D1Database, Hono } from "./deps.ts";

type Bindings = { DB: D1Database };

const app = new Hono<{ Bindings: Bindings }>();

app.fire();

app.get("/health", (c) => c.json({ status: "ok" }));

app.get("/:id", async (c) => {
  const id = c.req.param("id");
  const { results } = await c.env.DB.prepare(
    "SELECT * FROM codes WHERE id = ?",
  ).bind(id).all();
  console.log(results);
  return c.json({ id });
});

app.post("/", async (c) => {
  const input = await c.req.json();
  const uuid = crypto.randomUUID();
  console.log("input", input);
  return c.json({ id: uuid });
});

export default app;
