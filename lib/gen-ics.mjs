import { readdir, readFile, writeFile } from "node:fs/promises";
import YAML from "js-yaml";

/** @type {(string: string) => string} */
const processDate = (string) => string.replace(/-/g, "");

/** @type {(string: string) => string} */
const processTime = (string) => string.replace(/:/g, "") + "00";

const timezone = "Europe/Brussels";

/** @type {(venue: unknown) => import("./types.d.ts").Venue} */
const sanitizeVenue = (venue) => {
  if (typeof venue !== "object" || venue === null)
    throw new Error("Invalid frontmatter: venue is not an object", {
      cause: { venue },
    });
  if (!("name" in venue) || typeof venue.name !== "string")
    throw new Error("Invalid frontmatter: venue.name is not a string", {
      cause: { venue },
    });
  if (!("address" in venue) || typeof venue.address !== "string")
    throw new Error("Invalid frontmatter: venue.address is not a string", {
      cause: { venue },
    });
  const { name, address } = venue;
  return { name, address };
};

/** @type {(time: unknown) => import("./types.d.ts").Time} */
const sanitizeTime = (time) => {
  if (typeof time !== "object" || time === null)
    throw new Error("Invalid frontmatter: time is not an object", {
      cause: { time },
    });
  if (!("from" in time) || typeof time.from !== "string")
    throw new Error("Invalid frontmatter: time.from is not a string", {
      cause: { time },
    });
  if (!("to" in time) || typeof time.to !== "string")
    throw new Error("Invalid frontmatter: time.to is not a string", {
      cause: { time },
    });
  const { from, to } = time;
  return { from, to };
};

/** @type {(data: unknown) => import("./types.d.ts").EventFrontmatter} */
const sanitizeEventFrontmatter = (data) => {
  if (typeof data !== "object" || data === null)
    throw new Error("Invalid frontmatter: not an object", { cause: { data } });
  const layout = "layout" in data ? data.layout : null;
  if (layout !== "event")
    throw new Error("Invalid frontmatter: layout is not 'event'", {
      cause: { data },
    });
  const title = "title" in data ? data.title : null;
  if (typeof title !== "string")
    throw new Error("Invalid frontmatter: title is not a string", {
      cause: { data },
    });
  const short_title = "short_title" in data ? data.short_title : null;
  if (typeof short_title !== "string")
    throw new Error("Invalid frontmatter: short_title is not a string", {
      cause: { data },
    });
  const link = "link" in data ? data.link : null;
  if (link !== null && typeof link !== "string")
    throw new Error("Invalid frontmatter: link is not null or a string", {
      cause: { data },
    });
  const uid = "uid" in data ? data.uid : null;
  if (typeof uid !== "string")
    throw new Error("Invalid frontmatter: uid is not a string", {
      cause: { data },
    });
  const time = "time" in data ? sanitizeTime(data.time) : null;
  const venue = "venue" in data ? sanitizeVenue(data.venue) : null;
  return { uid, layout, link, title, short_title, time, venue };
};

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
    title,
    venue,
  } = sanitizeEventFrontmatter(YAML.load(head));
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
      "PRODID:-//Your Organization//Workshop Calendar//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      "BEGIN:VEVENT",
      `UID:${uid1}@lisa-ai.com`,
      `SUMMARY:${title}`,
      `DTSTART;TZID=${timezone}:${processDate(date)}T${processTime(time.from)}`,
      `DTEND;TZID=${timezone}:${processDate(date)}T${processTime(time.to)}`,
      ...(venue ? [`LOCATION:${venue.name}, ${venue.address}`] : []),
      `URL:https://lisa-ai.be/events/${filename}`,
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
