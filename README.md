<div align="center">

# 🎓 NFAuth

### North Fairview Authentication

**A role-based student attendance & monitoring portal built with pure HTML, CSS & JavaScript.**

[![Made with JavaScript](https://img.shields.io/badge/Made%20with-JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/en-US/docs/Web/JavaScript)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat-square&logo=html5&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/HTML)
[![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/License-MIT-17A05B?style=flat-square)](LICENSE)
[![No Dependencies](https://img.shields.io/badge/Dependencies-0-F2B632?style=flat-square)](#-tech-stack)

[**Live Demo**](https://YOUR-USERNAME.github.io/nf-auth/) · [Report Bug](../../issues) · [Request Feature](../../issues)

</div>

---

## 📖 Table of Contents

- [About](#-about)
- [Features](#-features)
- [Screenshots](#-screenshots)
- [Getting Started](#-getting-started)
- [Usage](#-usage)
- [Role Permissions](#-role-permissions)
- [Validation Rules](#-validation-rules)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Deploy on GitHub Pages](#-deploy-on-github-pages)
- [Security Notes](#-security-notes)
- [Roadmap](#-roadmap)
- [License](#-license)
- [Acknowledgements](#-acknowledgements)

---

## 🌟 About

**NFAuth** is a fully client-side authentication and student monitoring system designed for schools. It provides three distinct roles — **Admin**, **Faculty**, and **Student** — each with their own tailored dashboard. Registration is strict, validation is airtight, and the interface is animated, responsive, and dark-mode ready.

Everything runs in the browser. No server, no database, no build tools. Just open `index.html` and go.

---

## ✨ Features

### 🎓 For Students
- **Full registration** with 7 validated fields (name, LRN, email, mobile, section, strand, password)
- **Strict input rules** — 12-digit LRN, 11-digit PH mobile, no special email symbols
- **Live online-time tracking** with an animated circular gauge
- **Personal ID card** view with all academic details
- **Inbox** for direct messages from the admin
- **Ban awareness** — banned accounts see remaining minutes on login attempt

### 👨‍🏫 For Faculty
- **Live student monitor** — see everyone who has registered
- **Real-time online/offline status** (updated every 15s, online = seen within 90s)
- **Powerful search** by name, LRN, email, or section
- **Smart filters** — All / Online / Offline / Banned with live counts
- **Full student records** on click — online time, offline time, total time, ID card

### 🛡️ For Admin
Everything Faculty has, **plus**:

| Action | Description |
|---|---|
| ✏️ **Edit** | Update any student's name, LRN, email, mobile, section, or strand |
| 💬 **Message** | Send a direct notice to a student's inbox |
| 🚫 **Ban** | Temporarily (1h → 7d) or permanently ban with an optional reason |
| ✅ **Unban** | Immediately restore a banned student's access |
| 🗑️ **Delete** | Permanently remove an account with confirmation prompt |
| 📊 **Stats** | Live counts: online, offline, banned |

### 🎨 Design & UX
- 🎬 **Cinematic intro splash** — animated orbs, drawn graduation cap logo, shimmering gradient title, progress bar
- 🌗 **Full dark mode** — auto-detects system theme, manual toggle, persisted
- ✨ **Polished animations** — page transitions, shimmer buttons, staggered list reveals, tile pop-ins
- 📱 **Mobile-first responsive** — works beautifully on phones, tablets, and desktops
- ♿ **Accessibility** — focus rings, ARIA labels, keyboard navigation, `prefers-reduced-motion` support

---

## 📸 Screenshots

> Replace these placeholders with real screenshots after you deploy.

| Splash Screen | Sign In | Student Dashboard |
|---|---|---|
| ![splash](docs/splash.png) | ![signin](docs/signin.png) | ![student](docs/student.png) |

| Faculty Monitor | Admin Actions | Student Record |
|---|---|---|
| ![faculty](docs/faculty.png) | ![admin](docs/admin.png) | ![record](docs/record.png) |

---

## 🚀 Getting Started

### Prerequisites
- Any modern browser (Chrome, Firefox, Safari, Edge)
- No Node.js, no npm, no build step required

### Run Locally

```bash
# Clone the repo
git clone https://github.com/YOUR-USERNAME/nf-auth.git
cd nf-auth

# Open it — that's it!
# On macOS:
open index.html

# On Windows:
start index.html

# On Linux:
xdg-open index.html
```

Or serve it with any static server:

```bash
npx serve .
# or
python3 -m http.server 8080
```

Then visit `http://localhost:8080`.

---

## 🎮 Usage

### 1. Register as a Student
Click **Register** → fill in all 7 fields → submit.
The progress bar at the top shows completion. Every field must validate.

### 2. Sign In
- **Students** → use your email or LRN + password
- **Staff** → use your assigned username + password (contact the project owner)

### 3. Explore Your Dashboard
- **Students** see their own gauge, ID card, and messages.
- **Faculty** see the live list of all students.
- **Admin** sees the same list with edit/ban/message/delete actions.

### 4. Test Admin Actions
1. Register 2–3 test students
2. Log in as admin
3. Click any student name → try **Edit**, **Ban**, **Message**, **Delete**
4. Log back in as a student → see the message and (if banned) the ban notice

---

## 🔑 Role Permissions

| Capability | Student | Faculty | Admin |
|---|:---:|:---:|:---:|
| Register / Sign in | ✅ | ✅ | ✅ |
| View own ID card | ✅ | — | — |
| See own online time | ✅ | — | — |
| Read admin messages | ✅ | — | — |
| Monitor all students | — | ✅ | ✅ |
| Search & filter students | — | ✅ | ✅ |
| View full student records | — | ✅ | ✅ |
| Edit student info | — | — | ✅ |
| Send message to student | — | — | ✅ |
| Ban / Unban student | — | — | ✅ |
| Delete student account | — | — | ✅ |

---

## ✅ Validation Rules

| Field | Rule | Error Message |
|---|---|---|
| **Full name** | Cannot be empty | Enter your full name. |
| **LRN** | Exactly 12 digits, numbers only | LRN must be exactly 12 digits. |
| **Email** | Letters, numbers, one `@`, dots. **No** `#`, `$`, `_`, `(`, `)`, etc. | Use only letters, numbers, one @ and dots. |
| **Mobile** | Exactly 11 digits, numbers only | Mobile number must be exactly 11 digits. |
| **Section** | Cannot be empty | Enter your section. |
| **Strand** | Cannot be empty | Enter your strand. |
| **Password** | Cannot be empty | Enter a password. |

Duplicates are also blocked: the same **email** or **LRN** cannot register twice.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Markup | Semantic HTML5 |
| Styling | Modern CSS (custom properties, `color-mix()`, grid, flexbox) |
| Logic | Vanilla JavaScript (ES2020+) |
| Font | [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque) via Google Fonts |
| Storage | `localStorage` (students) + `sessionStorage` (session) |
| Crypto | Web Crypto API (`SHA-256` password hashing) |
| Hosting | GitHub Pages (static) |

**Zero runtime dependencies. Zero build step.**

---

## 📁 Project Structure

```
nf-auth/
├── index.html      # Markup + intro splash
├── style.css       # All styles, animations, dark mode
├── script.js       # Auth logic, dashboards, admin actions
├── README.md       # You are here
└── LICENSE         # MIT
```

---

## 🌐 Deploy on GitHub Pages

### Step 1 — Create the repo
Go to [github.com/new](https://github.com/new) → name it `nf-auth` → **Public** → **Create**.

### Step 2 — Push your files
```bash
git init
git add .
git commit -m "Initial commit: NFAuth"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/nf-auth.git
git push -u origin main
```

### Step 3 — Enable Pages
**Settings** → **Pages** → **Source:** `Deploy from a branch` → **Branch:** `main` · `/ (root)` → **Save**.

### Step 4 — Wait ~2 minutes
Your site is live at:

```
https://YOUR-USERNAME.github.io/nf-auth/
```

---

## 🔒 Security Notes

> ⚠️ **NFAuth is a client-side demo.** It is perfect for learning, prototyping, and single-device use — but **not** for production with real student data.

### Current limitations
- Credentials and student data live in the browser's `localStorage`
- Data is **per-device** — two phones won't share accounts
- Anyone with DevTools access can read the source
- No rate-limiting, no CSRF protection, no HTTPS-only cookies

### Recommendations before real-world use
1. **Hash staff credentials** with SHA-256 so they aren't visible in plain text
2. **Move to a backend** — Firebase, Supabase, or a small Node/Express API
3. **Use proper sessions** — JWT or secure HTTP-only cookies
4. **Add rate-limiting** on login attempts
5. **Serve over HTTPS only**

I can help build the backend if you need — open an issue.

---

## 🗺️ Roadmap

- [x] Registration with strict validation
- [x] Role-based dashboards (student / faculty / admin)
- [x] Live online/offline tracking
- [x] Ban system with duration options
- [x] Direct messaging from admin
- [x] Search and filters
- [x] Dark mode + cinematic intro
- [ ] Supabase / Firebase backend for multi-device sync
- [ ] Email verification
- [ ] CSV export of attendance
- [ ] QR-code student ID
- [ ] PWA install support

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgements

- Font: [Bricolage Grotesque](https://fonts.google.com/specimen/Bricolage+Grotesque)
- Icons: hand-rolled SVG
- Inspiration: real classroom attendance pain points

---

<div align="center">

**Built with 💚 for North Fairview**

⭐ If NFAuth helps you, star the repo!

</div>