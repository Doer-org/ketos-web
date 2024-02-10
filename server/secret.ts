import "https://deno.land/std@0.214.0/dotenv/load.ts";

export const SECRET = {
  BUCKET_NAME: Deno.env.get("BUCKET_NAME")!,
  ACCESS_KEY: Deno.env.get("ACCESS_KEY")!,
  SECRET_KEY: Deno.env.get("SECRET_KEY")!,
};
