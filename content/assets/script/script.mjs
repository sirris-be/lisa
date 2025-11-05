import events from "./events.json" with { type: "json" };

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
    const ol = document.createElement("ol");
    for (const event of upcoming) {
      console.log(event);
      const li = document.createElement("li");
      const a = document.createElement("a");
      a.href = event.url;
      a.textContent = `${formatDate(event.date)} - ${event.short_title}`;
      li.appendChild(a);
      ol.appendChild(li);
    }
    document.getElementById("sidebar").appendChild(ol);
  }
}
