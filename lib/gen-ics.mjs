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

/** @type {(name: string) => string} */
const getEventIdentifier = (filename) => {
  const segments = /^([^.]+)\.html$/gu.exec(filename);
  if (!segments)
    throw new Error("Invalid event filename", { cause: { filename } });
  if (segments.length !== 2)
    throw new Error("Invalid event filename segments", {
      cause: { filename, segments },
    });
  const [, identifier] = segments;
  return identifier;
};

/** @type {(file: import("./types.d.ts").File) => null | import("./types.d.ts").File} */
const compileICSFile = ({ filename, content }) => {
  const { head, body } = parseFrontmatter(content);
  const { date, duration, link, title, venue, remote } = {
    venue: null,
    remote: null,
    link: null,
    ...validateEventFrontmatter(YAML.load(head, { schema: YAML.JSON_SCHEMA })),
  };
  if (duration === null) return null;
  const identifier = getEventIdentifier(filename);
  return {
    filename: `${identifier}.ics`,
    content: [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//lisa-ai.be//event//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${identifier}@lisa-ai.be`,
      `SUMMARY:${title}`,
      `DTSTAMP:${new Date()
        .toISOString()
        .replace(/[-:]/g, "")
        .replace(/\.\d+Z$/, "Z")}`,
      `DTSTART;TZID=${timezone}:${processDate(date)}T${processTime(duration.from)}`,
      `DTEND;TZID=${timezone}:${processDate(date)}T${processTime(duration.to)}`,
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
