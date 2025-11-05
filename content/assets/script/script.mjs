import events from "./events.json" with { type: "json" };

{
  const links = Array.from(document.querySelectorAll("nav ul a"));
  for (const link of links) {
    if (link.href === window.location.href) {
      link.classList.add("active");
    }
  }
  console.log(links);
}

const toMidnightStamp = () => {
  const midnight = new Date();
  midnight.setHours(0, 0, 0, 0);
  return midnight.getTime();
};

const formatDate = (date_string) => {
  const date = new Date(date_string);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
};

const today = toMidnightStamp(new Date());

const upcoming = events.filter((event) => new Date(event.date) >= today);

if (upcoming.length > 0) {
  {
    const title = document.createElement("h3");
    title.textContent = "Upcoming Events:";
    document.getElementById("sidebar").appendChild(title);
  }
  {
    const list = document.createElement("ul");
    for (const event of upcoming) {
      const item = document.createElement("li");
      const link = document.createElement("a");
      link.href = event.url;
      link.textContent = `${formatDate(event.date)} - ${event.short_title}`;
      item.appendChild(link);
      list.appendChild(item);
    }
    document.getElementById("sidebar").appendChild(list);
  }
}
