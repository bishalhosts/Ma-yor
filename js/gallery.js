/* Vanilla JS lightbox */
document.addEventListener("DOMContentLoaded", () => {
  const g = document.querySelector(".gal");
  if (!g) return;
  const lb = document.createElement("div");
  lb.id = "lb";
  lb.innerHTML = '<button aria-label="Close">×</button><img alt=""><p></p>';
  document.body.appendChild(lb);
  const im = lb.querySelector("img"),
    cp = lb.querySelector("p"),
    close = () => lb.classList.remove("open");
  g.addEventListener("click", (e) => {
    if (e.target.tagName === "IMG") {
      im.src = e.target.src;
      im.alt = e.target.alt;
      cp.textContent = e.target.alt;
      lb.classList.add("open");
    }
  });
  lb.onclick = (e) => {
    if (e.target !== im) close();
  };
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });
});
