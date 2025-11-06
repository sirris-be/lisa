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

const formatDate = (date_string) => {
  const date = parseDate(date_string);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const today = toMidnightStamp(new Date());

const setActiveNav = (document) => {
  const links = Array.from(document.querySelectorAll("nav ul a"));
  for (const link of links) {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  }
};

const populateUpcoming = (document) => {
  const upcoming = events.filter(
    (event) => parseDate(event.date).getTime() >= today
  );
  if (upcoming.length > 0) {
    const sidebar = document.getElementById("sidebar");
    {
      const title = document.createElement("h3");
      title.textContent = "Upcoming Events:";
      sidebar.appendChild(title);
    }
    {
      for (const event of upcoming) {
        const link = document.createElement("a");
        link.href = event.url;
        link.textContent = `\u2022\u00A0\u00A0\u00A0${formatDate(event.date)} - ${event.short_title}`;
        sidebar.appendChild(link);
      }
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  setActiveNav(document);
  populateUpcoming(document);
});
