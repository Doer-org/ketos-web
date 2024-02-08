import { encodeHex } from "./deps.ts";

export const toHashStr = async (str: string) => {
  const buffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
  return encodeHex(hashBuffer);
};
