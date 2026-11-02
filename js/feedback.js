/* Citizen feedback form: client validation + POST to Google Apps Script. Success is shown ONLY after the server confirms. */
(function () {
  const f = document.getElementById("fbForm");
  if (!f) return;
  const out = document.getElementById("fbOut"),
    LIM = 1000,
    opened = Date.now();
  const w = f.ward;
  for (let i = 1; i <= SITE.wards; i++) w.add(new Option("Ward " + i, i));
  const msg = f.message,
    cnt = document.getElementById("cnt");
  msg.maxLength = LIM;
  msg.oninput = () => (cnt.textContent = msg.value.length + "/" + LIM);
  f.anonymous.onchange = () => {
    f.name.disabled = f.anonymous.checked;
    if (f.anonymous.checked) f.name.value = "";
  };
  const setErr = (n, m) => {
    f.querySelector('[data-err="' + n + '"]').textContent = m;
    return !m;
  };
  f.onsubmit = async (ev) => {
    ev.preventDefault();
    out.className = "";
    out.textContent = "";
    let ok = true;
    ok &= setErr("ward", f.ward.value ? "" : "Please select your ward.");
    ok &= setErr(
      "category",
      f.category.value ? "" : "Please select a category.",
    );
    const m = msg.value.trim();
    ok &= setErr(
      "message",
      m.length < 10
        ? "Please write at least 10 characters."
        : m.length > LIM
          ? "Message is too long."
          : "",
    );
    const c = f.contact.value.trim();
    ok &= setErr(
      "contact",
      c && !(/^\S+@\S+\.\S+$/.test(c) || /^[+\d][\d\s-]{6,}$/.test(c))
        ? "Enter a valid email or phone number."
        : "",
    );
    if (!ok) return;
    if (f.website.value || Date.now() - opened < 3000) {
      out.className = "bad";
      out.textContent = "Submission blocked. Please try again.";
      return;
    } // honeypot + time trap
    if (!SITE.APPS_SCRIPT_URL.startsWith("https://")) {
      out.className = "bad";
      out.textContent =
        "Feedback service is not configured yet (set APPS_SCRIPT_URL in js/data.js).";
      return;
    }
    if (Date.now() - (+localStorage.getItem("fbLast") || 0) < 60000) {
      out.className = "bad";
      out.textContent = "Please wait a minute before sending again.";
      return;
    }
    f.classList.add("loading");
    f.send.disabled = true;
    try {
      const r = await fetch(SITE.APPS_SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify({
          name: f.name.value.trim(),
          ward: f.ward.value,
          category: f.category.value,
          message: m,
          contact: c,
          anonymous: f.anonymous.checked,
          website: f.website.value,
        }),
      });
      const d = await r.json();
      if (!d.ok) throw new Error(d.error || "Server rejected the submission.");
      localStorage.setItem("fbLast", Date.now());
      f.reset();
      cnt.textContent = "0/" + LIM;
      out.className = "ok";
      out.textContent =
        "Thank you! Your feedback was received. Reference ID: " + d.id;
    } catch (e) {
      out.className = "bad";
      out.textContent =
        "Could not confirm submission: " +
        e.message +
        " Please try again later.";
    }
    f.classList.remove("loading");
    f.send.disabled = false;
  };
})();
