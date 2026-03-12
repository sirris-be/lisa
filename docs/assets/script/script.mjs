import events from "./events.json" with { type: "json" };

const parseDate = (date_string) => {
  const [date, time, zone] = date_string.split(" ");
  return new Date(`${date}T${time}${zone}`);
};

const toMidnightStamp = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
};

// const formatDate = (date_string) => {
//   const date = parseDate(date_string);
//   const yyyy = date.getFullYear();
//   const mm = String(date.getMonth() + 1).padStart(2, "0");
//   const dd = String(date.getDate()).padStart(2, "0");
//   return `${yyyy}-${mm}-${dd}`;
// };

const formatDate = (date_string) => {
  const date = parseDate(date_string);
  const options = { month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
};

const today = toMidnightStamp(new Date());

const setActiveNav = (document) => {
  const links = Array.from(document.querySelectorAll("nav a"));
  for (const link of links) {
    if (link.href === window.location.href) {
      link.classList.add("current");
    }
  }
};

const populateUpcoming = (document) => {
  const upcoming = events.filter(
    (event) => parseDate(event.date).getTime() >= today,
  );
  const sidebar = document.getElementById("sidebar");
  if (!sidebar) {
    return;
  }

  const title = document.createElement("p");
  title.className = "eyebrow";
  title.textContent = "Upcoming";
  sidebar.appendChild(title);

  const heading = document.createElement("h2");
  heading.textContent =
    upcoming.length > 0
      ? "Next sessions on the calendar"
      : "More sessions soon";
  sidebar.appendChild(heading);

  if (upcoming.length === 0) {
    const empty = document.createElement("p");
    empty.textContent =
      "New workshops and webinars will appear here once they are announced.";
    sidebar.appendChild(empty);
    return;
  }

  const list = document.createElement("div");
  list.className = "rail-event-list";
  sidebar.appendChild(list);

  for (const event of upcoming.slice(0, 4)) {
    const link = document.createElement("a");
    link.className = "rail-event";
    link.href = event.url;

    const date = document.createElement("span");
    date.className = "rail-event-date";
    date.textContent = formatDate(event.date);

    const name = document.createElement("strong");
    name.textContent = event.short_title;

    link.append(date, name);
    list.appendChild(link);
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav(document);
  populateUpcoming(document);
});
