import fs from "fs/promises";
import path from "path";
import { jsonBibleFetch } from "./jsonBible";
import { BOOKS } from "./book";
import { youversionFetch } from "./youversion";
import { youversionAmpFetch } from "./youversion-amp";

export type Verse = { verse_num: number; text: string };
export type Chapter = { chapter_num: number; verses: Verse[] };
export type Book = { name: keyof typeof BOOKS; chapters: Chapter[] };

export async function WriteBible([VERSION, BIBLE]: readonly [string, Book[]]) {
  await fs.writeFile(
    path.join(process.cwd(), "translations", `${VERSION}.json`),
    JSON.stringify(BIBLE),
  );
}

export async function ReadBible(VERSION: string) {
  const _bible =
    (await fs.readFile(path.join(process.cwd(), "translations", `${VERSION}.json`), "utf8")) ||
    "[]";
  const bible = JSON.parse(_bible);
  return bible as Book[];
}

async function main() {
  // await jsonBibleFetch("AMP").then((res) => res && WriteBible(res));
  await youversionAmpFetch();
}

main();
