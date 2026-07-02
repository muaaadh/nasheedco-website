# Nasheed & Co — Website

A clean, single-page marketing site for **Nasheed & Co**, a Malé-based corporate & commercial law firm (est. 1997).

Static site — no build step. Open `index.html` or serve the folder.

## Highlights
- Consolidated, cleaner rebuild of the firm's site (navy + gold, Newsreader/Inter).
- **The Concierge** — an interactive "matter navigator": pick your profile + need and it maps the relevant practice areas.
- 18 practice areas, sector focus, insights, and a working demo contact form.
- **Admin portal** (`/admin`) — a client-side draft CMS to manage insights, read contact enquiries, toggle practice areas, and edit firm details.

## Admin portal
Open `/admin` (or the "Staff portal" link in the footer).

- **Demo login:** `admin` / `nasheed2026`
- Data is stored in the browser's `localStorage` (this device only — no backend).
- The website and the admin share the same storage, so contact-form enquiries appear
  under **Enquiries**, and edits to **Insights** show on the public "Insights" section.
- "Settings → Demo data" can reset content to defaults or clear enquiries.

> This is a front-end draft. A production version would wire these screens to a real
> database/API and proper authentication.

## Structure
```
index.html
assets/
  css/styles.css
  js/main.js
  img/            # brand + photography (webp)
admin/
  index.html      # portal (login + dashboard)
  admin.css
  admin.js
```

Deployed via GitHub Pages.
