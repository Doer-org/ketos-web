import "https://deno.land/std@0.214.0/dotenv/load.ts";

export const SECRET = {
  BUCKET_NAME: Deno.env.get("BUCKET_NAME")!,
  TOKEN: Deno.env.get("TOKEN")!,
};
