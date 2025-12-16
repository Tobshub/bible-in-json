import * as cheerio from "cheerio";
import { Book, Chapter, ReadBible, WriteBible } from ".";
import { BOOKS } from "./book";

const AMP_BOOKS_MAP: Record<string, keyof typeof BOOKS> = {
  GEN: "Genesis",
  EXO: "Exodus",
  LEV: "Leviticus",
  NUM: "Numbers",
  DEU: "Deuteronomy",
  JOS: "Joshua",
  JDG: "Judges",
  RUT: "Ruth",
  "1SA": "1 Samuel",
  "2SA": "2 Samuel",
  "1KI": "1 Kings",
  "2KI": "2 Kings",
  "1CH": "1 Chronicles",
  "2CH": "2 Chronicles",
  EZR: "Ezra",
  NEH: "Nehemiah",
  EST: "Esther",
  JOB: "Job",
  PSA: "Psalms",
  PRO: "Proverbs",
  ECC: "Ecclesiastes",
  SNG: "Song of Solomon",
  ISA: "Isaiah",
  JER: "Jeremiah",
  LAM: "Lamentations",
  EZK: "Ezekiel",
  DAN: "Daniel",
  HOS: "Hosea",
  JOL: "Joel",
  AMO: "Amos",
  OBA: "Obadiah",
  JON: "Jonah",
  MIC: "Micah",
  NAM: "Nahum",
  HAB: "Habakkuk",
  ZEP: "Zephaniah",
  HAG: "Haggai",
  ZEC: "Zechariah",
  MAL: "Malachi",
  MAT: "Matthew",
  MRK: "Mark",
  LUK: "Luke",
  JHN: "John",
  ACT: "Acts",
  ROM: "Romans",
  "1CO": "1 Corinthians",
  "2CO": "2 Corinthians",
  GAL: "Galatians",
  EPH: "Ephesians",
  PHP: "Philippians",
  COL: "Colossians",
  "1TH": "1 Thessalonians",
  "2TH": "2 Thessalonians",
  "1TI": "1 Timothy",
  "2TI": "2 Timothy",
  TIT: "Titus",
  PHM: "Philemon",
  HEB: "Hebrews",
  JAS: "James",
  "1PE": "1 Peter",
  "2PE": "2 Peter",
  "1JN": "1 John",
  "2JN": "2 John",
  "3JN": "3 John",
  JUD: "Jude",
  REV: "Revelation",
};

function formatVerseUrl(book: keyof typeof AMP_BOOKS_MAP, chapter: number, verse: number) {
  const youversion_url = "https://www.bible.com/bible/1588";
  return `${youversion_url}/${book}.${chapter}.${verse}.AMP`;
}

async function fetchVersePage(book: keyof typeof AMP_BOOKS_MAP, chapter: number, verse: number) {
  const url = formatVerseUrl(book, chapter, verse);
  const res = await fetch(url)
    .then((r) => r.text())
    .catch((e) => {
      console.error("Failed to get verse page", e);
    });
  return res;
}

export async function youversionAmpFetch() {
  for (const current_book in AMP_BOOKS_MAP) {
    const bible = await ReadBible("AMP");

    const mapped_book_name = AMP_BOOKS_MAP[current_book as keyof typeof AMP_BOOKS_MAP];
    if (bible.some((b) => b.name === mapped_book_name)) {
      console.log("Skipping book", mapped_book_name, "already exists");
      continue;
    }
    const book: Book = { name: mapped_book_name, chapters: [] };

    for (let chapter_num = 1; chapter_num <= BOOKS[mapped_book_name]; chapter_num++) {
      console.log(current_book, chapter_num);
      const chapter: Chapter = { chapter_num, verses: [] };

      for (let verse_num = 1; verse_num <= 200; verse_num++) {
        const versePage = await fetchVersePage(current_book, chapter_num, verse_num);
        if (!versePage) {
          console.log("Failed to get verse page", mapped_book_name, chapter_num, verse_num);
          return;
        }
        const $ = cheerio.load(versePage);
        const verse_text = $("p.leading-default").text();
        if (!verse_text) {
          const not_found_text = $("p.text-center").text();
          if (not_found_text.toLowerCase() === "no available verses") {
            break;
          }
          console.log("Failed to get verse text", mapped_book_name, chapter_num, verse_num);
          return;
        }

        chapter.verses.push({ verse_num, text: verse_text });
      }

      book.chapters.push(chapter);
    }

    bible.push(book);
    await WriteBible(["AMP", bible]);
    console.log("SAVED BOOK", mapped_book_name);
  }
}
