/**
 * Nagarik Voice backend (Google Apps Script).
 * TWO deployments of this same script are used:
 *  A) PUBLIC  – Execute as: Me, Who has access: Anyone      -> citizens POST feedback (doPost)
 *  B) ADMIN   – Execute as: User accessing, access: Anyone with Google account -> opens dashboard (doGet)
 * Admin access is enforced on the server by ADMIN_EMAILS below.
 */
const ADMIN_EMAILS = ["bishal94110@gmail.com"];
const SHEET_TITLE = "Nagarik Voice Responses",
  TAB = "Feedback";
const HEADERS = [
  "Submission ID",
  "Timestamp",
  "Name",
  "Ward",
  "Category",
  "Message",
  "Contact Information",
  "Anonymous",
  "Review Status",
  "Admin Notes",
];
const PROJECT_TAB = "Projects",
  NOTICE_TAB = "Notices",
  MEDIA_FOLDER = "Nagarik Voice Website Images";
const PROJECT_HEADERS = [
  "ID",
  "Title",
  "Description",
  "Ward",
  "Category",
  "Image ID",
  "Budget",
  "Start Date",
  "End Date",
  "Status",
  "Published",
  "Updated",
  "PDF ID",
];
const NOTICE_HEADERS = [
  "ID",
  "Title",
  "Description",
  "Category",
  "Date",
  "Published",
  "Updated",
  "PDF ID",
];
const GALLERY_TAB = "Gallery",
  GALLERY_HEADERS = [
    "ID",
    "Title",
    "Album",
    "Image ID",
    "Published",
    "Updated",
  ];
const CATEGORIES = [
  "Complaint",
  "Suggestion",
  "Appreciation",
  "General Feedback",
  "Public Service Problem",
  "Development-related Feedback",
];
const STATUSES = ["New", "Under Review", "In Progress", "Resolved", "Rejected"];
const PROJECT_STATUSES = ["Planned", "Ongoing", "Completed"];
const MAX_WARD = 33,
  MAX_MSG = 1000,
  GLOBAL_LIMIT_PER_MIN = 20;
const MAX_IMAGE_BYTES = 5 * 1024 * 1024,
  MAX_PDF_BYTES = 10 * 1024 * 1024;

function json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
function isAdmin_() {
  const e = Session.getActiveUser().getEmail();
  return (
    !!e &&
    ADMIN_EMAILS.map((s) => s.toLowerCase()).indexOf(e.toLowerCase()) > -1
  );
}
function spreadsheet_() {
  const p = PropertiesService.getScriptProperties();
  let id = p.getProperty("SHEET_ID");
  if (id) return SpreadsheetApp.openById(id);
  const ss = SpreadsheetApp.create(SHEET_TITLE);
  p.setProperty("SHEET_ID", ss.getId());
  const sh = ss.getSheets()[0];
  sh.setName(TAB);
  sh.appendRow(HEADERS);
  sh.setFrozenRows(1);
  return ss;
}
function sheet_() {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(TAB);
  if (!sh) {
    sh = ss.insertSheet(TAB);
    sh.appendRow(HEADERS);
    sh.setFrozenRows(1);
  }
  return sh;
}
function contentSheet_(name, headers) {
  const ss = spreadsheet_();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  } else if (sh.getLastColumn() < headers.length)
    sh.getRange(
      1,
      sh.getLastColumn() + 1,
      1,
      headers.length - sh.getLastColumn(),
    ).setValues([headers.slice(sh.getLastColumn())]);
  return sh;
}
function mediaFolder_() {
  const p = PropertiesService.getScriptProperties();
  let id = p.getProperty("MEDIA_FOLDER_ID");
  if (id) return DriveApp.getFolderById(id);
  const folder = DriveApp.createFolder(MEDIA_FOLDER);
  p.setProperty("MEDIA_FOLDER_ID", folder.getId());
  return folder;
}
function safe_(v) {
  v = String(v == null ? "" : v)
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
  return /^[=+\-@\t\r]/.test(v) ? "'" + v : v;
} // stops formula injection
function hash_(s) {
  return Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s),
  ).slice(0, 30);
}

/** Run once from the editor to create the sheets and image folder, then share them with admins. */
function setup() {
  const feedback = sheet_(),
    projects = contentSheet_(PROJECT_TAB, PROJECT_HEADERS),
    notices = contentSheet_(NOTICE_TAB, NOTICE_HEADERS),
    gallery = contentSheet_(GALLERY_TAB, GALLERY_HEADERS),
    folder = mediaFolder_();
  Logger.log("Spreadsheet: " + feedback.getParent().getUrl());
  Logger.log(
    "Projects tab: " +
      projects.getSheetName() +
      "; Notices tab: " +
      notices.getSheetName() +
      "; Gallery tab: " +
      gallery.getSheetName(),
  );
  Logger.log(
    "Image folder (share as Editor with every ADMIN_EMAILS account): " +
      folder.getUrl(),
  );
}

function contentType_(type) {
  if (type === "projects")
    return {
      sheet: contentSheet_(PROJECT_TAB, PROJECT_HEADERS),
      headers: PROJECT_HEADERS,
    };
  if (type === "notices")
    return {
      sheet: contentSheet_(NOTICE_TAB, NOTICE_HEADERS),
      headers: NOTICE_HEADERS,
    };
  if (type === "gallery")
    return {
      sheet: contentSheet_(GALLERY_TAB, GALLERY_HEADERS),
      headers: GALLERY_HEADERS,
    };
  throw new Error("Invalid content type.");
}
function imageUrl_(id) {
  return (
    "https://drive.google.com/thumbnail?id=" +
    encodeURIComponent(id) +
    "&sz=w1200"
  );
}
function fileUrl_(id) {
  return (
    "https://drive.google.com/uc?export=download&id=" + encodeURIComponent(id)
  );
}
function galleryAlbumFolder_(album) {
  const name = String(album || "").trim();
  if (!name || name.length > 80)
    throw new Error("Album name is required (maximum 80 characters).");
  const root = mediaFolder_(),
    folders = root.getFoldersByName(name);
  return folders.hasNext() ? folders.next() : root.createFolder(name);
}
function mediaFileInFolder_(id, folderId, mimePrefix) {
  if (!id) return false;
  const file = DriveApp.getFileById(id);
  if (mimePrefix && file.getMimeType().indexOf(mimePrefix) !== 0)
    throw new Error("Choose a valid " + mimePrefix + " file.");
  const parents = file.getParents();
  while (parents.hasNext())
    if (parents.next().getId() === folderId) return true;
  return false;
}
function galleryImage_(id, album) {
  const file = DriveApp.getFileById(id),
    folder = galleryAlbumFolder_(album),
    parents = file.getParents();
  if (file.getMimeType().indexOf("image/") !== 0)
    throw new Error("Choose an image uploaded through this dashboard.");
  let inMedia = false;
  while (parents.hasNext()) {
    const parent = parents.next(),
      parentId = parent.getId();
    if (parentId === folder.getId()) return;
    if (parentId === mediaFolder_().getId()) inMedia = true;
    else if (
      parent.getParents().hasNext() &&
      parent.getParents().next().getId() === mediaFolder_().getId()
    )
      inMedia = true;
  }
  if (!inMedia)
    throw new Error("Choose a gallery image uploaded through this dashboard.");
  file.moveTo(folder);
}
function dateValue_(v) {
  if (v instanceof Date)
    return Utilities.formatDate(v, Session.getScriptTimeZone(), "yyyy-MM-dd");
  return String(v || "");
}
function validDate_(value) {
  return (
    /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !isNaN(new Date(value + "T00:00:00Z").getTime()) &&
    new Date(value + "T00:00:00Z").toISOString().slice(0, 10) === value
  );
}
function publicContent_(e) {
  const projects = contentSheet_(PROJECT_TAB, PROJECT_HEADERS)
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => r[0] && r[10] === true)
    .map((r) => ({
      t: String(r[1]),
      d: String(r[2]),
      ward: Number(r[3]),
      cat: String(r[4]),
      img: r[5] ? imageUrl_(String(r[5])) : "p1.svg",
      budget: String(r[6]),
      start: dateValue_(r[7]),
      end: dateValue_(r[8]),
      status: String(r[9]),
      pdf: r[12] ? fileUrl_(String(r[12])) : "",
    }));
  const notices = contentSheet_(NOTICE_TAB, NOTICE_HEADERS)
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => r[0] && r[5] === true)
    .map((r) => ({
      id: String(r[0]),
      title: String(r[1]),
      desc: String(r[2]),
      cat: String(r[3]),
      date: dateValue_(r[4]),
      pdf: r[7] ? fileUrl_(String(r[7])) : "",
    }));
  const gallery = contentSheet_(GALLERY_TAB, GALLERY_HEADERS)
    .getDataRange()
    .getValues()
    .slice(1)
    .filter((r) => r[0] && r[4] === true)
    .map((r) => ({
      id: String(r[0]),
      title: String(r[1]),
      album: String(r[2]),
      img: imageUrl_(String(r[3])),
    }));
  const result = JSON.stringify({
    projects: projects,
    notices: notices,
    gallery: gallery,
  })
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026");
  const callback = String(e.parameter.callback || "");
  if (callback) {
    if (!/^[A-Za-z_$][0-9A-Za-z_$]*$/.test(callback))
      return json_({ ok: false, error: "Invalid callback." });
    return ContentService.createTextOutput(
      callback + "(" + result + ");",
    ).setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return json_({ projects: projects, notices: notices, gallery: gallery });
}

function doPost(e) {
  try {
    const d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: false, error: "Rejected." }); // honeypot
    const ward = parseInt(d.ward, 10),
      cat = String(d.category || ""),
      msg = String(d.message || "").trim(),
      anon = d.anonymous === true;
    if (!(ward >= 1 && ward <= MAX_WARD))
      return json_({ ok: false, error: "Invalid ward." });
    if (CATEGORIES.indexOf(cat) < 0)
      return json_({ ok: false, error: "Invalid category." });
    if (msg.length < 10 || msg.length > MAX_MSG)
      return json_({
        ok: false,
        error: "Message must be 10–" + MAX_MSG + " characters.",
      });
    const contact = String(d.contact || "")
      .trim()
      .slice(0, 100);
    if (
      contact &&
      !(/^\S+@\S+\.\S+$/.test(contact) || /^[+\d][\d\s-]{6,}$/.test(contact))
    )
      return json_({ ok: false, error: "Invalid contact." });
    const name = anon
      ? "Anonymous"
      : String(d.name || "")
          .trim()
          .slice(0, 80);
    const lock = LockService.getScriptLock();
    lock.waitLock(20000);
    try {
      const c = CacheService.getScriptCache(),
        k = "r" + Math.floor(Date.now() / 60000),
        n = +(c.get(k) || 0);
      if (n >= GLOBAL_LIMIT_PER_MIN)
        return json_({
          ok: false,
          error: "Server busy. Try again in a minute.",
        });
      const dk = "d" + hash_(ward + cat + msg);
      if (c.get(dk))
        return json_({ ok: false, error: "Duplicate submission detected." });
      c.put(k, String(n + 1), 120);
      c.put(dk, "1", 21600);
      const id =
        "NV-" +
        Utilities.formatDate(new Date(), "UTC", "yyyyMMdd") +
        "-" +
        Utilities.getUuid().slice(0, 6).toUpperCase();
      sheet_().appendRow([
        id,
        new Date(),
        safe_(name),
        ward,
        cat,
        safe_(msg),
        safe_(contact),
        anon ? "Yes" : "No",
        "New",
        "",
      ]);
      return json_({ ok: true, id: id });
    } finally {
      lock.releaseLock();
    }
  } catch (err) {
    return json_({ ok: false, error: "Invalid request." });
  }
}

function doGet(e) {
  if (e && e.parameter && e.parameter.action === "content")
    return publicContent_(e);
  if (!Session.getActiveUser().getEmail())
    return json_({ ok: true, service: "Nagarik Voice" }); // public deployment never returns data
  if (!isAdmin_())
    return HtmlService.createHtmlOutput(
      "<h2>Access denied</h2><p>Your account is not authorised.</p>",
    );
  return HtmlService.createHtmlOutputFromFile("Admin")
    .setTitle("Nagarik Voice – Admin")
    .addMetaTag("viewport", "width=device-width,initial-scale=1");
}

/* ---- Admin-only functions called from Admin.html via google.script.run ---- */
function adminList() {
  if (!isAdmin_()) throw new Error("Not authorised");
  const v = sheet_().getDataRange().getValues();
  v.shift();
  return v
    .map((r, i) => ({
      row: i + 2,
      id: r[0],
      ts: r[1] ? new Date(r[1]).toISOString() : "",
      name: r[2],
      ward: r[3],
      cat: r[4],
      msg: r[5],
      contact: r[6],
      anon: r[7],
      status: r[8] || "New",
      notes: r[9],
    }))
    .reverse();
}
function adminUpdate(row, status, notes) {
  if (!isAdmin_()) throw new Error("Not authorised");
  if (STATUSES.indexOf(status) < 0) throw new Error("Bad status");
  notes = safe_(notes).slice(0, 2000);
  if (status === "Rejected" && !notes)
    throw new Error("Rejected requires an explanation in notes.");
  const sh = sheet_();
  if (row < 2 || row > sh.getLastRow()) throw new Error("Bad row");
  sh.getRange(row, 9, 1, 2).setValues([[status, notes]]);
  return true;
}
function adminListContent(type) {
  if (!isAdmin_()) throw new Error("Not authorised");
  const config = contentType_(type),
    values = config.sheet.getDataRange().getValues();
  values.shift();
  return values
    .filter((r) => r[0])
    .map((r) =>
      type === "projects"
        ? {
            id: String(r[0]),
            title: String(r[1]),
            description: String(r[2]),
            ward: String(r[3]),
            category: String(r[4]),
            imageId: String(r[5] || ""),
            budget: String(r[6]),
            start: dateValue_(r[7]),
            end: dateValue_(r[8]),
            status: String(r[9]),
            published: r[10] === true,
            pdfId: String(r[12] || ""),
          }
        : type === "notices"
          ? {
              id: String(r[0]),
              title: String(r[1]),
              description: String(r[2]),
              category: String(r[3]),
              date: dateValue_(r[4]),
              published: r[5] === true,
              pdfId: String(r[7] || ""),
            }
          : {
              id: String(r[0]),
              title: String(r[1]),
              album: String(r[2]),
              imageId: String(r[3] || ""),
              published: r[4] === true,
            },
    );
}
function adminSaveContent(type, item) {
  if (!isAdmin_()) throw new Error("Not authorised");
  if (!item || typeof item !== "object") throw new Error("Invalid content.");
  const config = contentType_(type),
    sh = config.sheet,
    now = new Date(),
    id = String(item.id || "");
  let values;
  if (type === "projects") {
    const ward = Number(item.ward),
      status = String(item.status || "");
    if (!String(item.title || "").trim() || String(item.title).length > 160)
      throw new Error("Project title is required (maximum 160 characters).");
    if (
      !String(item.description || "").trim() ||
      String(item.description).length > 5000
    )
      throw new Error(
        "Project description is required (maximum 5000 characters).",
      );
    if (!Number.isInteger(ward) || ward < 1 || ward > MAX_WARD)
      throw new Error("Select a valid ward.");
    if (
      !String(item.category || "").trim() ||
      String(item.category).length > 80
    )
      throw new Error("Project category is required (maximum 80 characters).");
    if (PROJECT_STATUSES.indexOf(status) < 0)
      throw new Error("Select a valid project status.");
    if (item.start && !validDate_(String(item.start)))
      throw new Error("Enter a valid project start date.");
    if (item.end && !validDate_(String(item.end)))
      throw new Error("Enter a valid project end date.");
    const imageId = String(item.imageId || "");
    if (imageId) {
      const file = DriveApp.getFileById(imageId),
        parents = file.getParents(),
        folderId = mediaFolder_().getId();
      let inFolder = false;
      if (file.getMimeType().indexOf("image/") !== 0)
        throw new Error("Choose an image uploaded through this dashboard.");
      while (parents.hasNext())
        if (parents.next().getId() === folderId) inFolder = true;
      if (!inFolder)
        throw new Error("Choose a photo uploaded through this dashboard.");
    }
    const pdfId = String(item.pdfId || "");
    if (
      pdfId &&
      !mediaFileInFolder_(pdfId, mediaFolder_().getId(), "application/pdf")
    )
      throw new Error("Choose a PDF uploaded through this dashboard.");
    values = [
      id || "PR-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
      safe_(item.title).slice(0, 160),
      safe_(item.description).slice(0, 5000),
      ward,
      safe_(item.category).slice(0, 80),
      imageId,
      safe_(item.budget).slice(0, 80),
      String(item.start || ""),
      String(item.end || ""),
      status,
      item.published === true,
      now,
      pdfId,
    ];
  } else if (type === "notices") {
    const date = String(item.date || "");
    if (!String(item.title || "").trim() || String(item.title).length > 160)
      throw new Error("Notice title is required (maximum 160 characters).");
    if (
      !String(item.description || "").trim() ||
      String(item.description).length > 5000
    )
      throw new Error(
        "Notice description is required (maximum 5000 characters).",
      );
    if (
      !String(item.category || "").trim() ||
      String(item.category).length > 80
    )
      throw new Error("Notice category is required (maximum 80 characters).");
    if (!validDate_(date)) throw new Error("Enter a valid notice date.");
    const pdfId = String(item.pdfId || "");
    if (
      pdfId &&
      !mediaFileInFolder_(pdfId, mediaFolder_().getId(), "application/pdf")
    )
      throw new Error("Choose a PDF uploaded through this dashboard.");
    values = [
      id || "NT-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
      safe_(item.title).slice(0, 160),
      safe_(item.description).slice(0, 5000),
      safe_(item.category).slice(0, 80),
      date,
      item.published === true,
      now,
      pdfId,
    ];
  } else if (type === "gallery") {
    const title = String(item.title || "").trim(),
      album = String(item.album || "").trim(),
      imageId = String(item.imageId || "");
    if (!title || title.length > 160)
      throw new Error("Image title is required (maximum 160 characters).");
    if (!album || album.length > 80)
      throw new Error("Album name is required (maximum 80 characters).");
    if (!imageId)
      throw new Error(
        "Choose a gallery image uploaded through this dashboard.",
      );
    galleryImage_(imageId, album);
    values = [
      id || "GA-" + Utilities.getUuid().slice(0, 8).toUpperCase(),
      safe_(title).slice(0, 160),
      safe_(album).slice(0, 80),
      imageId,
      item.published === true,
      now,
    ];
  } else throw new Error("Invalid content type.");
  if (id) {
    const ids =
      sh.getLastRow() < 2
        ? []
        : sh
            .getRange(2, 1, sh.getLastRow() - 1, 1)
            .getValues()
            .map((r) => String(r[0]));
    const index = ids.indexOf(id);
    if (index < 0) throw new Error("Content not found. Reload and try again.");
    sh.getRange(index + 2, 1, 1, values.length).setValues([values]);
  } else sh.appendRow(values);
  return true;
}
function adminDeleteContent(type, id) {
  if (!isAdmin_()) throw new Error("Not authorised");
  const sh = contentType_(type).sheet,
    ids =
      sh.getLastRow() < 2
        ? []
        : sh
            .getRange(2, 1, sh.getLastRow() - 1, 1)
            .getValues()
            .map((r) => String(r[0]));
  const index = ids.indexOf(String(id));
  if (index < 0) throw new Error("Content not found. Reload and try again.");
  sh.deleteRow(index + 2);
  return true;
}
function adminUploadImage(dataUrl, name, mimeType) {
  if (!isAdmin_()) throw new Error("Not authorised");
  if (["image/jpeg", "image/png", "image/webp"].indexOf(mimeType) < 0)
    throw new Error("Upload a JPG, PNG, or WebP image.");
  const match = String(dataUrl || "").match(
    /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match || match[1].length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 8)
    throw new Error("Image must be 5 MB or smaller.");
  const bytes = Utilities.base64Decode(match[1]);
  if (bytes.length > MAX_IMAGE_BYTES)
    throw new Error("Image must be 5 MB or smaller.");
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mimeType];
  const safeName = String(name || "photo")
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 80);
  const blob = Utilities.newBlob(
    bytes,
    mimeType,
    safeName.replace(/\.[^.]+$/, "") + "." + extension,
  );
  const file = mediaFolder_().createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { id: file.getId(), url: imageUrl_(file.getId()) };
}
function adminUploadPdf(dataUrl, name, mimeType) {
  if (!isAdmin_()) throw new Error("Not authorised");
  if (mimeType !== "application/pdf") throw new Error("Upload a PDF document.");
  const match = String(dataUrl || "").match(
    /^data:application\/pdf;base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match || match[1].length > Math.ceil((MAX_PDF_BYTES * 4) / 3) + 8)
    throw new Error("PDF must be 10 MB or smaller.");
  const bytes = Utilities.base64Decode(match[1]);
  if (bytes.length > MAX_PDF_BYTES)
    throw new Error("PDF must be 10 MB or smaller.");
  const safeName = String(name || "document.pdf")
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 80);
  const file = mediaFolder_().createFile(
    Utilities.newBlob(
      bytes,
      mimeType,
      safeName.replace(/\.pdf$/i, "") + ".pdf",
    ),
  );
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { id: file.getId(), url: fileUrl_(file.getId()) };
}
function adminUploadGalleryImage(dataUrl, name, mimeType, album) {
  if (!isAdmin_()) throw new Error("Not authorised");
  if (["image/jpeg", "image/png", "image/webp"].indexOf(mimeType) < 0)
    throw new Error("Upload a JPG, PNG, or WebP image.");
  const match = String(dataUrl || "").match(
    /^data:image\/(?:jpeg|png|webp);base64,([A-Za-z0-9+/=]+)$/,
  );
  if (!match || match[1].length > Math.ceil((MAX_IMAGE_BYTES * 4) / 3) + 8)
    throw new Error("Image must be 5 MB or smaller.");
  const bytes = Utilities.base64Decode(match[1]);
  if (bytes.length > MAX_IMAGE_BYTES)
    throw new Error("Image must be 5 MB or smaller.");
  const extension = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/webp": "webp",
  }[mimeType];
  const safeName = String(name || "photo")
    .replace(/[^A-Za-z0-9._-]/g, "_")
    .slice(0, 80);
  const folder = galleryAlbumFolder_(album);
  const file = folder.createFile(
    Utilities.newBlob(
      bytes,
      mimeType,
      safeName.replace(/\.[^.]+$/, "") + "." + extension,
    ),
  );
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return { id: file.getId(), url: imageUrl_(file.getId()) };
}
