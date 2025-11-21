export type Venue = {
  name: string;
  address: string;
};

// @TJS-pattern ^\d{2}:\d{2}$
export type Time = string;

export type Duration = {
  from: Time;
  to: Time;
};

export type Remote = {
  name: string;
  link: string;
};

// @TJS-pattern ^\d{4}-\d{2}-\d{2}$
export type Date = string;

export type EventFrontmatter = {
  layout: "event";
  title: string;
  short_title: string;
  date: Date;
  duration: Duration;
  venue?: Venue;
  remote?: Remote;
  link?: string;
};

export type File = {
  filename: string;
  content: string;
};
