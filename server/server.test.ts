import { expect } from "./deps.ts";
import { kv } from "./main.ts";
import { app } from "./main.ts";

const postTgzFile = async (path: string): Promise<
  { res: Response; data: { id: string }; tgz: ArrayBuffer }
> => {
  const tgz = await fetch(
    new URL(path, import.meta.url),
  ).then((res) => res.arrayBuffer());

  const res = await app.request("http://localhost:8000/", {
    headers: { "content-type": "application/x-tar" },
    method: "POST",
    body: tgz,
  });

  const data = await res.json();

  return { res, data, tgz };
};

const atos = (buf: ArrayBuffer): string => {
  return new TextDecoder("utf-8").decode(buf);
};

Deno.test("[GET] /:id", async (t) => {
  const { res, data, tgz } = await postTgzFile("./testdata/outputs.tgz");
  const { tgz: other_tgz } = await postTgzFile("./testdata/outputs2.tgz");

  const apiResult = await app.request(`http://localhost:8000/${data.id}`);
  const bufferRes = await apiResult.arrayBuffer();

  await t.step(
    "レスポンスのステータスが200番",
    () => expect(res.status).toBe(200),
  );

  await t.step(
    "保存したデータが取得したデータと同じ",
    () => expect(atos(bufferRes)).toBe(atos(tgz)),
  );

  await t.step(
    "別のデータを取得した場合は異なる",
    () => expect(atos(bufferRes)).not.toBe(atos(other_tgz)),
  );
});

Deno.test("[POST] / ", async (t) => {
  const { res, data, tgz } = await postTgzFile("./testdata/outputs.tgz");
  const { value } = await kv.get(["codes", data.id]);

  await t.step(
    "レスポンスのステータスが200番",
    () => expect(res.status).toBe(200),
  );

  await t.step(
    "保存したデータが取得したデータと同じ",
    () => expect(atos(value as ArrayBuffer)).toBe(atos(tgz)),
  );
});
