/* Shared layout + renderers + light/dark theme. */
const NAV=[["index","home"],["mayor","mayor"],["development","dev"],["notices","notices"],["gallery","gallery"],["feedback","feedback"],["contact","contact"]];
const cur=(location.pathname.split("/").pop()||"index.html").replace(".html","")||"index";
/* Theme: saved choice wins, otherwise follow the device setting. */
function setTheme(m){document.documentElement.dataset.theme=m;localStorage.setItem("theme",m);const b=document.getElementById("themeBtn");if(b){b.textContent=m==="dark"?"☀️":"🌙";b.setAttribute("aria-label",m==="dark"?"Switch to light mode":"Switch to dark mode")}}
const initTheme=()=>localStorage.getItem("theme")||(matchMedia("(prefers-color-scheme:dark)").matches?"dark":"light");
document.documentElement.dataset.theme=initTheme();
function buildLayout(){
 const nav=NAV.map(([p,k])=>`<li><a href="${p}.html" class="${cur===p?"on":""}" data-i18n="${k}"></a></li>`).join("");
 document.getElementById("site-header").innerHTML=`<div class="topbar"><div class="wrap"><img src="assets/images/logo.svg" alt="Logo"><div class="brand"><h1>${esc(SITE.mayor)}</h1><p data-site="title"></p><p data-site="place"></p></div>
 <div class="toplinks"><select id="langSel" aria-label="Language"><option value="en">English</option><option value="ne">नेपाली</option></select><button id="themeBtn" class="tbtn" type="button"></button></div></div></div>
 <div class="ticker" role="marquee"><span>${SITE.ticker.join(" &nbsp;•&nbsp; ")}</span></div>
 <nav><div class="wrap"><button class="burger" aria-label="Menu" aria-expanded="false">☰ Menu</button><ul class="menu">${nav}</ul>
 <form class="search" action="notices.html"><input name="q" data-i18n-ph="search" aria-label="Search"><button class="btn" style="padding:8px 14px">🔍</button></form></div></nav>`;
 document.getElementById("site-footer").innerHTML=`<footer><div class="wrap"><div class="fgrid"><div><h3>${esc(SITE.mayor)}</h3><p data-site="title"></p><p>${SITE.address}</p></div>
 <div><h3 data-i18n="links"></h3>${NAV.slice(1).map(([p,k])=>`<a href="${p}.html" data-i18n="${k}"></a><br>`).join("")}</div>
 <div><h3 data-i18n="contactus"></h3><p>📞 ${SITE.phone}<br>✉ ${SITE.email}<br>${SITE.hours}</p></div></div><div class="copy">© <span id="yr"></span> ${esc(SITE.mayor)}. <span data-i18n="rights"></span></div></div></footer>`;
 document.getElementById("yr").textContent=new Date().getFullYear();
 const s=document.getElementById("langSel");s.value=LANG;s.onchange=e=>setLang(e.target.value);
 document.getElementById("themeBtn").onclick=()=>setTheme(document.documentElement.dataset.theme==="dark"?"light":"dark");setTheme(document.documentElement.dataset.theme);
 const b=document.querySelector(".burger"),m=document.querySelector(".menu");b.onclick=()=>b.setAttribute("aria-expanded",m.classList.toggle("open"));
}
const esc=s=>String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const R={
 projects:(e,n)=>{e.innerHTML=SITE.projects.slice(0,n||99).map(p=>`<article class="card"><img src="assets/images/${p.img}" alt="${esc(p.t)}" loading="lazy"><h3>${esc(p.t)}</h3><span class="tag">Ward ${p.ward}</span> <span class="tag">${p.cat}</span> <span class="tag">${p.status}</span><p>${esc(p.d)}</p><small>Budget: ${p.budget} · Start: ${p.start} · End: ${p.end}</small></article>`).join("")},
 notices:(e,n)=>{const q=(new URLSearchParams(location.search).get("q")||"").toLowerCase();const c=document.getElementById("nCat"),s=document.getElementById("nQ");
  const draw=()=>{const cv=c?c.value:"",sv=(s?s.value:q).toLowerCase();e.innerHTML=SITE.notices.filter(x=>(!cv||x.cat===cv)&&(x.title+x.desc).toLowerCase().includes(sv)).slice(0,n||99).map(x=>`<article class="card" id="${x.id}"><span class="tag">${x.cat}</span> <small>${x.date}</small><h3>${esc(x.title)}</h3>${n?`<a href="notices.html#${x.id}">View Details</a>`:`<details><summary>${t("readmore")}</summary><p>${esc(x.desc)}</p></details>`}</article>`).join("")||"<p>No notices found.</p>"};
  if(c){[...new Set(SITE.notices.map(x=>x.cat))].forEach(v=>c.add(new Option(v,v)));s.value=q;c.onchange=s.oninput=draw}draw()}
};
document.addEventListener("DOMContentLoaded",()=>{buildLayout();
 document.querySelectorAll("[data-render]").forEach(e=>R[e.dataset.render](e,+e.dataset.n||0));
 document.querySelectorAll("[data-admin-link]").forEach(a=>a.href=SITE.ADMIN_URL.startsWith("http")?SITE.ADMIN_URL:"#");
 document.querySelectorAll("[data-mayor]").forEach(e=>e.textContent=SITE.mayor);
 applyLang();});
