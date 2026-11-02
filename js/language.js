/* English / Nepali dictionary. Add keys here and use data-i18n="key" in HTML. */
const I18N = {
  en: {
    home: "Home",
    intro: "Introduction",
    history: "History",
    mayor: "About Mayor",
    wards: "Wards",
    dev: "Work & Projects",
    reports: "Reports",
    notices: "Notices",
    downloads: "Downloads",
    gallery: "Gallery",
    feedback: "Citizen Voice",
    contact: "Contacts",
    search: "Search notices…",
    online: "Online Services",
    viewmore: "View More",
    readmore: "Read More",
    submit: "Submit Feedback",
    f_name: "Your name (optional)",
    f_ward: "Ward number",
    f_cat: "Category",
    f_msg: "Your message",
    f_contact: "Phone or email (only if you want a reply)",
    f_anon: "Submit anonymously",
    send: "Send",
    latest: "Latest Notices",
    activities: "Development Activities",
    invite: "Your voice matters",
    invite_t:
      "Share complaints, suggestions or appreciation directly with your local government.",
    contactus: "Contact",
    links: "Important Links",
    rights: "All rights reserved.",
  },
  ne: {
    home: "गृहपृष्ठ",
    intro: "परिचय",
    history: "इतिहास",
    mayor: "नगरप्रमुखको परिचय",
    wards: "वडाहरू",
    dev: "कार्य र योजना",
    reports: "प्रतिवेदन",
    notices: "सूचना",
    downloads: "डाउनलोड",
    gallery: "ग्यालरी",
    feedback: "नागरिक आवाज",
    contact: "सम्पर्क",
    search: "सूचना खोज्नुहोस्…",
    online: "अनलाइन सेवा",
    viewmore: "थप हेर्नुहोस्",
    readmore: "थप पढ्नुहोस्",
    submit: "प्रतिक्रिया पठाउनुहोस्",
    f_name: "तपाईंको नाम (ऐच्छिक)",
    f_ward: "वडा नम्बर",
    f_cat: "वर्ग",
    f_msg: "तपाईंको सन्देश",
    f_contact: "फोन वा इमेल (जवाफ चाहिएमा मात्र)",
    f_anon: "नाम नखुलाई पठाउने",
    send: "पठाउनुहोस्",
    latest: "ताजा सूचनाहरू",
    activities: "विकास गतिविधिहरू",
    invite: "तपाईंको आवाज महत्त्वपूर्ण छ",
    invite_t: "गुनासो, सुझाव वा प्रशंसा सिधै स्थानीय सरकारलाई पठाउनुहोस्।",
    contactus: "सम्पर्क",
    links: "महत्त्वपूर्ण लिङ्कहरू",
    rights: "सर्वाधिकार सुरक्षित।",
  },
};
let LANG = localStorage.getItem("lang") || "en";
const t = (k) => (I18N[LANG] && I18N[LANG][k]) || I18N.en[k] || k;
function applyLang() {
  document.documentElement.lang = LANG === "ne" ? "ne" : "en";
  document
    .querySelectorAll("[data-i18n]")
    .forEach((e) => (e.textContent = t(e.dataset.i18n)));
  document
    .querySelectorAll("[data-i18n-ph]")
    .forEach((e) => (e.placeholder = t(e.dataset.i18nPh)));
  document
    .querySelectorAll("[data-site]")
    .forEach((e) => (e.textContent = SITE[e.dataset.site][LANG]));
}
function setLang(l) {
  LANG = l;
  localStorage.setItem("lang", l);
  applyLang();
}
