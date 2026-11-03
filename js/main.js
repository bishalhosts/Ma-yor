/* Shared layout + renderers + light/dark theme. */
const NAV = [
  ["index", "home"],
  ["mayor", "mayor"],
  ["development", "dev"],
  ["notices", "notices"],
  ["gallery", "gallery"],
  ["feedback", "feedback"],
  ["contact", "contact"],
];
const cur =
  (location.pathname.split("/").pop() || "index.html").replace(".html", "") ||
  "index";
const pageUrl = (p) => (p === "index" ? "index.html" : `pages/${p}.html`);
const imageUrl = (path) =>
  /^https?:\/\//i.test(path) ? path : `assets/images/${path}`;
/* Start every page in light mode; the toggle can still switch themes. */
function setTheme(m) {
  document.documentElement.dataset.theme = m;
  localStorage.setItem("theme", m);
  const b = document.getElementById("themeBtn");
  if (b) {
    b.textContent = m === "dark" ? "☀️" : "🌙";
    b.setAttribute(
      "aria-label",
      m === "dark" ? "Switch to light mode" : "Switch to dark mode",
    );
  }
}
document.documentElement.dataset.theme = "light";
function buildLayout() {
  const nav = NAV.map(
    ([p, k]) =>
      `<li><a href="${pageUrl(p)}" class="${cur === p ? "on" : ""}" data-i18n="${k}"></a></li>`,
  ).join("");
  document.getElementById("site-header").innerHTML =
    `<div class="topbar"><div class="wrap"><a class="header-profile" href="${pageUrl("mayor")}" aria-label="About ${esc(SITE.mayor)}"><img src="assets/images/logo.svg" alt=""><div class="brand"><h1>${esc(SITE.mayor)}</h1><p data-site="title"></p><p data-site="place"></p></div></a>
 <div class="nepal-header-clock" aria-label="नेपाल समय"><span>नेपाल समय</span><strong id="headerNepalClock">--:--:--</strong><small>NPT · UTC+05:45</small></div>
 <div class="toplinks"><select id="langSel" aria-label="Language"><option value="en">English</option><option value="ne">नेपाली</option></select><button id="themeBtn" class="tbtn" type="button"></button></div></div></div>
 <div class="ticker" role="marquee"><span>${SITE.ticker.join(" &nbsp;•&nbsp; ")}</span></div>
 <nav><div class="wrap"><button class="burger" aria-label="Menu" aria-expanded="false">☰ Menu</button><ul class="menu">${nav}</ul>
 <form class="search" action="pages/notices.html"><input name="q" data-i18n-ph="search" aria-label="Search"><button class="btn" style="padding:8px 14px">🔍</button></form></div></nav>`;
  document.getElementById("site-footer").innerHTML =
    `<footer><div class="wrap"><div class="fgrid"><div><h3>${esc(SITE.mayor)}</h3><p data-site="title"></p><p>${SITE.address}</p></div>
 <div><h3 data-i18n="links"></h3>${NAV.slice(1)
   .map(([p, k]) => `<a href="${pageUrl(p)}" data-i18n="${k}"></a><br>`)
   .join("")}</div>
 <div><h3 data-i18n="contactus"></h3><p>📞 ${SITE.phone}<br>✉ ${SITE.email}<br>${SITE.hours}</p></div></div><div class="copy">© <span id="yr"></span> ${esc(SITE.mayor)}. <span data-i18n="rights"></span></div></div></footer>`;
  document.getElementById("yr").textContent = new Date().getFullYear();
  const s = document.getElementById("langSel");
  s.value = LANG;
  s.onchange = (e) => setLang(e.target.value);
  document.getElementById("themeBtn").onclick = () =>
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    );
  setTheme(document.documentElement.dataset.theme);
  const b = document.querySelector(".burger"),
    m = document.querySelector(".menu");
  b.onclick = () => b.setAttribute("aria-expanded", m.classList.toggle("open"));
}
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
const R = {
  projects: (e, n) => {
    e.innerHTML =
      SITE.projects
        .slice(0, n || 99)
        .map(
          (p) =>
            `<article class="card"><img src="${esc(imageUrl(p.img || "p1.svg"))}" alt="${esc(p.t)}" loading="lazy"><h3>${esc(p.t)}</h3><span class="tag">Ward ${esc(p.ward)}</span> <span class="tag">${esc(p.cat)}</span> <span class="tag">${esc(p.status)}</span><p>${esc(p.d)}</p><small>Budget: ${esc(p.budget || "—")} · Start: ${esc(p.start || "—")} · End: ${esc(p.end || "—")}</small>${p.pdf ? `<p><a class="download-link" href="${esc(p.pdf)}" target="_blank" rel="noopener">Download full project details (PDF)</a></p>` : ""}</article>`,
        )
        .join("") || "<p>No projects published yet.</p>";
  },
  notices: (e, n) => {
    const q = (
      new URLSearchParams(location.search).get("q") || ""
    ).toLowerCase();
    const c = document.getElementById("nCat"),
      s = document.getElementById("nQ");
    const draw = () => {
      const cv = c ? c.value : "",
        sv = (s ? s.value : q).toLowerCase();
      e.innerHTML =
        SITE.notices
          .filter(
            (x) =>
              (!cv || x.cat === cv) &&
              (x.title + x.desc).toLowerCase().includes(sv),
          )
          .slice(0, n || 99)
          .map(
            (x) =>
              `<article class="card" id="${esc(x.id)}"><span class="tag">${esc(x.cat)}</span> <small>${esc(x.date)}</small><h3>${esc(x.title)}</h3>${n ? `<a href="pages/notices.html#${encodeURIComponent(x.id)}">View Details</a>` : `<details><summary>${t("readmore")}</summary><p>${esc(x.desc)}</p></details>`}${x.pdf ? `<p><a class="download-link" href="${esc(x.pdf)}" target="_blank" rel="noopener" download>Download notice (PDF)</a></p>` : ""}</article>`,
          )
          .join("") || "<p>No notices found.</p>";
    };
    if (c) {
      [...new Set(SITE.notices.map((x) => x.cat))].forEach((v) =>
        c.add(new Option(v, v)),
      );
      s.value = q;
      c.onchange = s.oninput = draw;
    }
    draw();
  },
  gallery: (e) => {
    const albumSelect = document.getElementById("galleryAlbum"),
      pager = document.getElementById("galleryPagination"),
      perPage = 2;
    let page = 1;
    const draw = () => {
      const albums = [
        ...new Set(SITE.gallery.map((x) => x.album).filter(Boolean)),
      ].sort((a, b) => a.localeCompare(b));
      const current = albumSelect.value;
      albumSelect.replaceChildren(
        new Option("All albums", ""),
        ...albums.map((album) => new Option(album, album)),
      );
      albumSelect.value = albums.includes(current) ? current : "";
      const images = SITE.gallery.filter(
        (item) => !albumSelect.value || item.album === albumSelect.value,
      );
      const pages = Math.ceil(images.length / perPage),
        start = (page - 1) * perPage;
      e.innerHTML =
        images
          .slice(start, start + perPage)
          .map(
            (item) =>
              `<article class="card gallery-card"><img src="${esc(imageUrl(item.img))}" alt="${esc(item.title)}" loading="lazy"><h3>${esc(item.title)}</h3><span class="tag">${esc(item.album)}</span></article>`,
          )
          .join("") || "<p>No gallery photos available.</p>";
      pager.innerHTML =
        pages > 1
          ? `<span>Page ${page} of ${pages}</span><div>${Array.from({ length: pages }, (_, i) => `<button type="button" class="${page === i + 1 ? "active" : ""}" aria-label="Page ${i + 1}" aria-current="${page === i + 1 ? "page" : "false"}">${i + 1}</button>`).join("")}</div>`
          : "";
      pager.querySelectorAll("button").forEach((button) =>
        button.addEventListener("click", () => {
          page = Number(button.textContent);
          draw();
        }),
      );
    };
    albumSelect.addEventListener("change", () => {
      page = 1;
      draw();
    });
    draw();
  },
};
function loadPublicContent() {
  if (
    !/^https:\/\/script\.google\.com\/macros\/s\//.test(SITE.APPS_SCRIPT_URL)
  ) {
    console.warn(
      "Set APPS_SCRIPT_URL in js/data.js to load published projects and notices; showing the demo content.",
    );
    return Promise.resolve();
  }
  return new Promise((resolve) => {
    const callback =
        "nvContent_" + Date.now() + "_" + Math.random().toString(36).slice(2),
      script = document.createElement("script");
    let finished = false;
    const complete = () => {
      if (finished) return;
      finished = true;
      clearTimeout(timer);
      script.remove();
      delete window[callback];
      resolve();
    };
    const timer = setTimeout(() => {
      console.error(
        "Timed out loading published website content from Google Apps Script.",
      );
      complete();
    }, 12000);
    window[callback] = (data) => {
      if (data && Array.isArray(data.projects) && Array.isArray(data.notices)) {
        SITE.projects = data.projects;
        SITE.notices = data.notices;
        if (Array.isArray(data.gallery)) SITE.gallery = data.gallery;
      } else
        console.error("Google Apps Script returned invalid public content.");
      complete();
    };
    script.onerror = () => {
      console.error(
        "Could not load published projects and notices. Check the public Apps Script deployment URL and permissions.",
      );
      complete();
    };
    try {
      const url = new URL(SITE.APPS_SCRIPT_URL);
      url.searchParams.set("action", "content");
      url.searchParams.set("callback", callback);
      script.src = url.toString();
      document.head.appendChild(script);
    } catch (error) {
      console.error("Invalid APPS_SCRIPT_URL in js/data.js.", error);
      complete();
    }
  });
}
document.addEventListener("DOMContentLoaded", () => {
  buildLayout();
  document
    .querySelectorAll("[data-admin-link]")
    .forEach(
      (a) =>
        (a.href = SITE.ADMIN_URL.startsWith("http") ? SITE.ADMIN_URL : "#"),
    );
  document
    .querySelectorAll("[data-mayor]")
    .forEach((e) => (e.textContent = SITE.mayor));
  applyLang();
  loadPublicContent().then(() =>
    document
      .querySelectorAll("[data-render]")
      .forEach((e) => R[e.dataset.render](e, +e.dataset.n || 0)),
  );
});
