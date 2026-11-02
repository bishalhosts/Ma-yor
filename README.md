# Mayor Official Website + Citizen Voice (Demo Draft)

Pure HTML/CSS/Vanilla JS site + Google Apps Script/Sheets backend. All names, numbers, images and documents are **demo placeholders** (`[in brackets]`). Edit site identity in `js/data.js`; translations in `js/language.js`. Published projects and notices are managed in the Google Apps Script admin dashboard.

## Project structure

```text
.
├── index.html              # Static-hosting entry point
├── pages/                  # Public content pages
├── admin/                  # Admin entry pages
├── css/                    # Shared styles
├── js/                     # Shared scripts, calendar, and site data
│   └── vendor/             # Local AD/BS date conversion library
├── assets/images/          # Site and gallery images
└── google-apps-script/     # Google Sheets backend
```

The pages in `pages/` set their base URL to the project root so shared assets and links resolve correctly.

## Preview locally

Open `index.html` in a browser (or `python3 -m http.server`).

## 1. Backend (Google Apps Script) – admin e-mail: bishal94110@gmail.com

1. Sign in as bishal94110@gmail.com → script.google.com → New project.
2. Paste `google-apps-script/Code.gs` into `Code.gs`; add an HTML file named `Admin` and paste `google-apps-script/Admin.html`.
3. Set `ADMIN_EMAILS` in `Code.gs` to the Google accounts allowed to manage feedback and site content.
4. Run `setup()` once and authorise access to Sheets and Drive. It creates the spreadsheet with _Feedback_, _Projects_, _Notices_, and _Gallery_ tabs, plus an image folder. Running `setup()` again after updating the script safely adds the new Gallery tab and PDF columns to existing content sheets. The execution log contains the spreadsheet and folder links.
5. Share the spreadsheet and image folder with every other admin account as **Editor**. The account opening the admin dashboard needs edit access because the admin deployment runs as the signed-in user.
6. Deploy **Web app A (public content and feedback):** Execute as _Me_, access _Anyone_. Copy its `/exec` URL into `APPS_SCRIPT_URL` in `js/data.js`.
7. Deploy **Web app B (admin dashboard):** Execute as _User accessing the web app_, access _Anyone with Google account_. Copy its `/exec` URL into `ADMIN_URL` in `js/data.js`. The backend still checks `ADMIN_EMAILS`; a Google account alone does not grant admin access.
8. Upload the updated site files, then open your deployed site's `admin/login.html` and click **Open Secure Admin Dashboard**. Add each project separately in **Projects & Work**; save one project, then use **New project / Clear** to enter the next. Add its title, ward, category, description, photo, and optional full-details PDF before publishing. Add notices the same way, with a title, description, and optional downloadable PDF. The public pages show each published item and its download link. Choose **Edit** to update it, or **Delete** to remove it.
9. In **Photo Gallery**, enter an album/folder name such as `Kathmandu`, add a caption, select one or more JPG, PNG, or WebP images (up to 5 MB each), and save. The dashboard uploads them into matching folders inside the Drive image folder. If you enter an image directly in the Sheet's **Image ID** column, you can paste either its Drive file ID or its Drive sharing URL. Set the image's General access to **Anyone with the link – Viewer** and set **Published** to `yes` (or use a checked checkbox) so website visitors can see it. Published accepts `yes`, `true`, `1`, or `published`; blank or `no` rows stay hidden. The same publishing rule applies to projects and notices. Gallery visitors can filter by album and browse two photos per page. Edit an image to change its caption, album, or publishing status. Dashboard-uploaded photos and PDFs are shared so website visitors can view or download them; do not upload private or sensitive files. The old sample projects and notices in `js/data.js` are only offline demo content and are not automatically copied into the spreadsheet.
10. PDF uploads can be up to 10 MB each. Whenever you change `Code.gs` or `Admin.html`, create a **new version and update both deployments** to that version. Run `setup()` after the backend update, and ensure the public site has the Web app A URL in `js/data.js`.

## 2. GitHub Pages

Create repo → upload all files → Settings → Pages → Deploy from branch `main` / root. Test every page, submit test feedback, check the Sheet, test on mobile.

## Security notes

- GitHub Pages is static; it cannot protect private data. Admin dashboard lives in Apps Script behind Google sign-in; no password in JavaScript and no private data in public files.
- The public endpoint is reachable by anyone: server validates input, blocks formula injection, uses honeypot, duplicate check and rate limit. Success is shown only after the server confirms.
- Replace demo SVG images (`assets/images/`) with real photos. Project and gallery photos, plus attached PDFs, are stored in Drive.
- Deleting a project removes its spreadsheet record, not its Drive photo. Remove unused photos from the image folder and revoke their public link sharing when they should no longer be accessible.

## Theme

White, navy, and slate blue (inspired by the supplied reference) with a light/dark toggle (🌙/☀️) in the header; colours are variables at the top of `css/style.css`. The Nepal-time clock is shown in the sticky header on every site page. Homepage calendar logic is kept separately in `js/calendar.js`; dates show both AD and BS using the locally bundled `nepali-date-converter` library. Its MIT license is included in `js/vendor/NEPALI-DATE-CONVERTER-LICENSE.txt`. Pages: Home, About Mayor, Work & Projects, Notices, Gallery, Citizen Voice, Contact.
