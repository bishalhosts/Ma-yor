# Mayor Official Website + Citizen Voice (Demo Draft)
Pure HTML/CSS/Vanilla JS site + Google Apps Script/Sheets backend. All names, numbers, images and documents are **demo placeholders** (`[in brackets]`). Edit content in `js/data.js`; translations in `js/language.js`.

## Preview locally
Open `index.html` in a browser (or `python3 -m http.server`).

## 1. Backend (Google Apps Script) – admin e-mail: bishal94110@gmail.com
1. Sign in as bishal94110@gmail.com → script.google.com → New project.
2. Paste `google-apps-script/Code.gs` into `Code.gs`; add an HTML file named `Admin` and paste `Admin.html`.
3. Run `setup()` once and authorise. It creates the Google Sheet **Nagarik Voice Responses** (tab *Feedback*); the URL appears in the log.
4. **Deploy → New deployment → Web app (A, public):** Execute as *Me*, access *Anyone*. Copy URL → `APPS_SCRIPT_URL` in `js/data.js`.
5. **Deploy → New deployment → Web app (B, admin):** Execute as *User accessing the web app*, access *Anyone with Google account*. Copy URL → `ADMIN_URL` in `js/data.js`. Admins need edit access to the sheet (the owner already has it); add other admins to `ADMIN_EMAILS` and share the sheet.
6. After editing Code.gs, create a **new version** on each deployment.

## 2. GitHub Pages
Create repo → upload all files → Settings → Pages → Deploy from branch `main` / root. Test every page, submit test feedback, check the Sheet, test on mobile.

## Security notes
- GitHub Pages is static; it cannot protect private data. Admin dashboard lives in Apps Script behind Google sign-in; no password in JavaScript and no private data in public files.
- The public endpoint is reachable by anyone: server validates input, blocks formula injection, uses honeypot, duplicate check and rate limit. Success is shown only after the server confirms.
- Replace demo SVG images (`assets/images/`) with real photos and update paths; replace `assets/documents/README.txt` links with real PDFs in `js/data.js`.

## Theme
White + light pink with a light/dark toggle (🌙/☀️) in the header; colours are variables at the top of `css/style.css`. Pages: Home, About Mayor, Work & Projects, Notices, Gallery, Citizen Voice, Contact.
