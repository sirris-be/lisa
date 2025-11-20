export type Venue = {
  name: string;
  address: string;
};

export type Time = {
  from: string;
  to: string;
};

export type EventFrontmatter = {
  layout: "event";
  uid: string;
  title: string;
  short_title: string;
  venue: null | Venue;
  link: null | string;
  time: null | Time;
};

export type File = {
  filename: string;
  content: string;
};

export type Event = EventFrontmatter & {
  date: string;
  description: string;
};
