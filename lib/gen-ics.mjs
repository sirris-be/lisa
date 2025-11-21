import { readdir, readFile, writeFile } from "node:fs/promises";
import YAML from "js-yaml";
import { validateEventFrontmatter } from "./validate.mjs";

/** @type {(string: string) => string} */
const processDate = (string) => string.replace(/-/g, "");

/** @type {(string: string) => string} */
const processTime = (string) => string.replace(/:/g, "") + "00";

const timezone = "Europe/Brussels";

/** @type {(content: string) => { head: string, body: string }} */
const parseFrontmatter = (content) => {
  const segments = /^---\n([\s\S]+?)\n---([\s\S]*)$/.exec(content);
  if (!segments) throw new Error("Missing frontmatter", { cause: { content } });
  if (segments.length !== 3)
    throw new Error("Invalid frontmatter segments", {
      cause: { content, segments },
    });
  const [, head, body] = segments;
  return { head, body };
};

/** @type {(name: string) => { date: string, uid: string }} */
const parseEventFilename = (filename) => {
  const segments = /^(\d{4}-\d{2}-\d{2})-(.+)\.html$/gu.exec(filename);
  if (!segments)
    throw new Error("Invalid event filename", { cause: { filename } });
  if (segments.length !== 3)
    throw new Error("Invalid event filename segments", {
      cause: { filename, segments },
    });
  const [, date, uid] = segments;
  return { date, uid };
};

/** @type {(file: import("./types.d.ts").File) => null | import("./types.d.ts").File} */
const compileICSFile = ({ filename, content }) => {
  const { head, body } = parseFrontmatter(content);
  const {
    uid: uid1,
    time,
    link,
    title,
    venue,
    remote,
  } = {
    venue: null,
    remote: null,
    time: null,
    link: null,
    ...validateEventFrontmatter(YAML.load(head)),
  };
  if (time === null) return null;
  const { date, uid: uid2 } = parseEventFilename(filename);
  // TODO: remove duplicate ID data
  if (uid1 !== uid2)
    throw new Error("Mismatched event ID between frontmatter and filename", {
      cause: { filename, uid1, uid2 },
    });
  return {
    filename: `${uid1}.ics`,
    content: [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//lisa-ai.be//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid1}@lisa-ai.be`,
      `SUMMARY:${title}`,
      `DTSTART;TZID=${timezone}:${processDate(date)}T${processTime(time.from)}`,
      `DTEND;TZID=${timezone}:${processDate(date)}T${processTime(time.to)}`,
      ...(venue ? [`LOCATION:${venue.name}, ${venue.address}`] : []),
      ...(remote ? [`LOCATION:${remote.link}`] : []),
      link === null
        ? `URL:https://lisa-ai.be/events/${filename}`
        : `URL:${link}`,
      "END:VEVENT",
      "END:VCALENDAR",
    ].join("\n"),
  };
};

/** @type {(input: string, output: string) => Promise<void>} */
const main = async (input, output) => {
  /** @type {Set<string>} */
  const names = new Set();
  for (const filename of await readdir(input)) {
    const path = `${input}/${filename}`;
    const content = await readFile(path, { encoding: "utf-8" });
    const file = compileICSFile({ filename, content });
    if (file === null) continue;
    if (names.has(file.filename))
      throw new Error("Duplicate event ID", { cause: { filename } });
    await writeFile(`${output}/${file.filename}`, file.content, {
      encoding: "utf-8",
    });
    names.add(file.filename);
  }
};

await main("docs/_events", "docs/assets/ics");
