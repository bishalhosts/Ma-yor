# 🏛️ Demo-Mayor Official Website + Citizen Voice

A modern, responsive, and user-friendly official website designed to connect local government leadership with citizens.

The platform allows citizens to explore the mayor's profile, learn about local government activities, view development projects, read official notices, browse photo galleries, and submit feedback or messages directly through an online form.

Built using **HTML, CSS, Vanilla JavaScript, Google Apps Script, and Google Sheets**.

---

## 🌐 Project Overview

The Mayor Official Website is designed to improve communication, transparency, and public participation between local government representatives and citizens.

The website provides a simple public interface where anyone can access information and share suggestions, feedback, and concerns.

Administrators can securely manage citizen submissions and publish website content through a Google Apps Script admin dashboard.

### Main Objectives

- Provide accessible information about the mayor and local government.
- Make government activities and development projects publicly visible.
- Allow citizens to submit feedback and messages online.
- Improve communication between citizens and local leadership.
- Make notices, announcements, and public documents easy to access.
- Provide administrators with a secure content management system.

---

## ✨ Key Features

### 🏠 Public Website

- Modern and responsive homepage.
- Mayor profile and introduction.
- About Mayor and History pages.
- Work and Development Projects.
- Official Notices and Announcements.
- Photo Gallery with album filtering.
- Citizen Voice feedback and message form.
- Contact information.
- Nepal date and time display.
- AD and BS calendar integration.
- Light and Dark mode toggle.
- English and Nepali language support.

### 🗣️ Citizen Voice

Citizens can use the website to:

- Submit suggestions and feedback.
- Send messages to the mayor's office.
- Share concerns and recommendations.
- Submit information without accessing the admin dashboard.

Submitted information is stored in Google Sheets for authorized administrators to review.

### 🔐 Admin Dashboard

Administrators can securely manage website content through Google sign-in.

Features include:

- Review citizen feedback and messages.
- Add, edit, and delete development projects.
- Publish and manage official notices.
- Upload project photos.
- Attach downloadable PDF documents.
- Create and manage photo gallery albums.
- Control which content appears publicly.
- Manage content without editing website source code.

**Note:** Only authorized Google accounts configured in the backend can manage administrative content.

---

## 🛠️ Technologies Used

| Technology | Purpose |
|---|---|
| HTML5 | Website structure |
| CSS3 | Styling and responsive design |
| Vanilla JavaScript | Frontend functionality |
| Google Apps Script | Backend and API |
| Google Sheets | Database and submissions |
| Google Drive | Image and PDF storage |
| GitHub Pages | Static website hosting |
| Nepali Date Converter | AD and BS date conversion |

---

## 📁 Project Structure

```text
Mayor-Official-Website/
│
├── index.html
│
├── pages/
│   ├── about.html
│   ├── projects.html
│   ├── notices.html
│   ├── gallery.html
│   ├── citizen-voice.html
│   └── contact.html
│
├── admin/
│   └── login.html
│
├── css/
│   └── style.css
│
├── js/
│   ├── data.js
│   ├── language.js
│   ├── calendar.js
│   └── script.js
│
├── assets/
│   └── images/
│
├── google-apps-script/
│   ├── Code.gs
│   └── Admin.html
│
└── README.md
```

*The structure above describes the main project organization. Refer to the actual repository for the complete file list.*

---

## ⚙️ Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

Move into the project folder:

```bash
cd Mayor-Official-Website
```

### 2. Configure Website Information

Open:

```text
js/data.js
```

Update the demo information, including:

- Mayor's name and photograph.
- Municipality name and address.
- Contact details.
- Website identity.
- Google Apps Script public endpoint.
- Admin dashboard URL.

### 3. Configure Language

Open:

```text
js/language.js
```

Update or customize the English and Nepali translations.

### 4. Configure Google Apps Script

1. Sign in to Google.
2. Create a new Google Apps Script project.
3. Copy the contents of `google-apps-script/Code.gs`.
4. Create an HTML file named `Admin`.
5. Paste the contents of `google-apps-script/Admin.html`.
6. Configure authorized administrator email addresses.
7. Run `setup()` and authorize the required permissions.
8. Deploy the public and admin web applications.

### 5. Connect Google Sheets

Configure the deployment URLs in:

```text
js/data.js
```

Set:

- `APPS_SCRIPT_URL` – Public website backend.
- `ADMIN_URL` – Admin dashboard.

Google Sheets will store citizen feedback, projects, notices, and gallery information.

Google Drive will store uploaded photographs and PDF documents.

### 6. Run Locally

You can open `index.html` directly in a browser.

Alternatively, use:

```bash
python3 -m http.server 8000
```

Open:

```text
http://localhost:8000
```

---

## 🚀 Deployment on GitHub Pages

1. Create a GitHub repository.
2. Upload all project files.
3. Open repository **Settings**.
4. Select **Pages**.
5. Choose **Deploy from a branch**.
6. Select the `main` branch.
7. Select the `/ (root)` folder.
8. Save the settings.

After deployment, GitHub Pages will provide a public website URL.

Example:

```text
https://YOUR-USERNAME.github.io/YOUR-REPOSITORY/
```

---

## 🔒 Security and Privacy

Security is an important part of this project.

- Public website content is accessible to everyone.
- Administrative access is restricted to authorized Google accounts.
- No administrator password is stored in frontend JavaScript.
- Citizen submissions are validated by the backend.
- Honeypot, duplicate checking, rate limiting, and formula-injection protection help reduce spam and malicious submissions.
- Private administrative data is not exposed through public website files.
- Google Drive files intended for public viewing must have appropriate sharing permissions.

**Important:** Never upload confidential documents, sensitive citizen information, or private files to publicly accessible Drive folders.

---

## 📱 Responsive Design

The website is designed to work across:

- Desktop computers.
- Laptops.
- Tablets.
- Android smartphones.
- iPhones and other mobile devices.

The interface focuses on simple navigation, readability, and accessibility for citizens of different age groups.

---

## 📅 Nepal Calendar Integration

The website includes a separate calendar module.

Features:

- Automatic Nepal-time clock.
- Automatic AD date display.
- Nepali BS date display.
- Locally bundled Nepali date conversion library.
- Separate calendar JavaScript functionality.

The bundled `nepali-date-converter` library includes its MIT license.

---

## 🧪 Testing Checklist

Before making the website publicly available, verify:

- [ ] All website pages open correctly.
- [ ] Navigation links work.
- [ ] English and Nepali language switching works.
- [ ] Light and Dark modes work.
- [ ] AD and BS dates display correctly.
- [ ] Citizen feedback forms submit successfully.
- [ ] Submitted feedback appears in Google Sheets.
- [ ] Admin login works with authorized accounts.
- [ ] Projects and notices can be published.
- [ ] Image uploads work correctly.
- [ ] PDF downloads work correctly.
- [ ] Gallery filtering works.
- [ ] Website works on mobile devices.

---

## 🔮 Future Improvements

Potential future enhancements include:

- Citizen feedback tracking system.
- Public project progress updates.
- Advanced search for notices and projects.
- More accessible design features.
- Improved analytics for administrators.
- Additional municipality information.
- Citizen notification system.

---

## 👨‍💻 Developer

**Developed by:** [Your Name]

**Project:** Mayor Official Website + Citizen Voice

**Technologies:** HTML, CSS, JavaScript, Google Apps Script, Google Sheets

**GitHub:** [Your GitHub Profile URL]

---

## 📄 License

This project is provided as a demonstration and can be customized for local government and municipal communication needs.

Add an appropriate open-source license file if you intend to distribute the source code under a specific license.

---

## ❤️ Acknowledgement

Designed with the goal of making local government information more accessible and encouraging meaningful communication between citizens and their representatives.

**Your Voice Matters. Your Feedback Builds a Better Community.**