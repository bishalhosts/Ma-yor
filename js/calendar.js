/* Nepal local clock and Nepali-calendar month view. */
document.addEventListener("DOMContentLoaded", () => {
  const zone = "Asia/Kathmandu";
  const headerClock = document.getElementById("headerNepalClock");
  const monthLabel = document.getElementById("calendarHeading");
  const grid = document.getElementById("calendarGrid");
  const todayLabel = document.getElementById("calendarToday");
  const previous = document.getElementById("calendarPrev");
  const next = document.getElementById("calendarNext");
  const calendarReady = monthLabel && grid && todayLabel && previous && next;
  const NepaliDate =
    window.NepaliDate &&
    (window.NepaliDate.default ||
      window.NepaliDate.NepaliDate ||
      window.NepaliDate);
  if (!headerClock && !calendarReady) return;

  const bsMonths = [
    "बैशाख",
    "जेठ",
    "असार",
    "साउन",
    "भदौ",
    "असोज",
    "कात्तिक",
    "मंसिर",
    "पुस",
    "माघ",
    "फागुन",
    "चैत",
  ];
  const weekdays = ["आइत", "सोम", "मङ्गल", "बुध", "बिही", "शुक्र", "शनि"];
  const nepalDateFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const timeFormat = new Intl.DateTimeFormat("en-US", {
    timeZone: zone,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });
  const formatNumber = (value) =>
    String(value).replace(/\d/g, (digit) => "०१२३४५६७८९"[Number(digit)]);
  let visibleYear;
  let visibleMonth;
  let lastRenderedDate;

  function nepalParts(date) {
    const parts = Object.fromEntries(
      nepalDateFormat
        .formatToParts(date)
        .map(({ type, value }) => [type, value]),
    );
    return {
      year: Number(parts.year),
      month: Number(parts.month) - 1,
      day: Number(parts.day),
    };
  }

  function bsDate(year, month, day) {
    if (!NepaliDate) return null;
    try {
      return new NepaliDate(new Date(year, month, day, 12)).getBS();
    } catch {
      return null;
    }
  }

  function adDate(year, month, day) {
    if (!NepaliDate) return null;
    try {
      return new NepaliDate(year, month, day).getAD();
    } catch {
      return null;
    }
  }

  function updateClock() {
    const now = new Date();
    const currentAd = nepalParts(now);
    if (headerClock) headerClock.textContent = timeFormat.format(now);
    if (!calendarReady || !NepaliDate) return;

    const currentBs = bsDate(currentAd.year, currentAd.month, currentAd.day);
    if (!currentBs) return;
    todayLabel.textContent = `आज: ${formatNumber(currentBs.date)} ${bsMonths[currentBs.month]} ${formatNumber(currentBs.year)}`;
    const dateKey = `${currentBs.year}-${currentBs.month}-${currentBs.date}`;
    if (visibleYear === undefined) {
      visibleYear = currentBs.year;
      visibleMonth = currentBs.month;
    }
    if (
      visibleYear === currentBs.year &&
      visibleMonth === currentBs.month &&
      lastRenderedDate !== dateKey
    )
      renderCalendar(currentBs);
  }

  function renderCalendar(currentBs) {
    const firstAd = adDate(visibleYear, visibleMonth, 1);
    if (!firstAd) {
      monthLabel.textContent = "वि.सं. मिति उपलब्ध छैन";
      grid.replaceChildren();
      return;
    }

    monthLabel.textContent = `${bsMonths[visibleMonth]} ${formatNumber(visibleYear)}`;
    const firstWeekday = firstAd.day;
    const cells = weekdays.map(
      (day) =>
        `<span class="calendar-weekday" role="columnheader">${day}</span>`,
    );
    for (let empty = 0; empty < firstWeekday; empty += 1)
      cells.push('<span aria-hidden="true"></span>');

    for (let day = 1; day <= 32; day += 1) {
      let bs;
      let ad;
      try {
        const converted = new NepaliDate(visibleYear, visibleMonth, day);
        bs = converted.getBS();
        if (
          bs.year !== visibleYear ||
          bs.month !== visibleMonth ||
          bs.date !== day
        )
          break;
        ad = converted.getAD();
      } catch {
        break;
      }
      const isToday =
        currentBs.year === visibleYear &&
        currentBs.month === visibleMonth &&
        currentBs.date === day;
      const datetime = `${ad.year}-${String(ad.month + 1).padStart(2, "0")}-${String(ad.date).padStart(2, "0")}`;
      const label = `${formatNumber(day)} ${bsMonths[visibleMonth]} ${formatNumber(visibleYear)} वि.सं.`;
      cells.push(
        `<time role="gridcell" datetime="${datetime}" aria-label="${label}"${isToday ? ' class="today" aria-current="date"' : ""}>${formatNumber(day)}</time>`,
      );
    }
    grid.innerHTML = cells.join("");
    lastRenderedDate = `${currentBs.year}-${currentBs.month}-${currentBs.date}`;
  }

  function moveMonth(amount) {
    visibleMonth += amount;
    if (visibleMonth < 0) {
      visibleMonth = 11;
      visibleYear -= 1;
    } else if (visibleMonth > 11) {
      visibleMonth = 0;
      visibleYear += 1;
    }
    const todayAd = nepalParts(new Date());
    const currentBs = bsDate(todayAd.year, todayAd.month, todayAd.day);
    if (currentBs) renderCalendar(currentBs);
  }

  if (calendarReady) {
    previous.addEventListener("click", () => moveMonth(-1));
    next.addEventListener("click", () => moveMonth(1));
  }
  updateClock();
  window.setInterval(updateClock, 1000);
});
