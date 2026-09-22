# WERC — Western Energy and Resources Club

A single-page website for the Western Energy and Resources Club at Western University.
Plain HTML, CSS and JavaScript — no build step, no dependencies to install.

```
WERC-website/
├── index.html          all page content lives here
├── css/styles.css      all styling, organised in numbered sections
├── js/main.js          nav, theme toggle, filters, form, animations
├── assets/
│   ├── werc-logo.png              original logo (white background)
│   ├── werc-logo-transparent.png  transparent background
│   ├── werc-logo-light.png        cream version, for dark backgrounds
│   ├── werc-mark.png              symbol only, no wordmark — used in the nav
│   ├── werc-mark-light.png        symbol only, cream
│   ├── favicon-32.png / -192 / -512
│   └── apple-touch-icon.png
└── README.md
```

## Viewing it

Double-click `index.html`. That's it.

If you'd rather use a local server (needed only if you later add fetch-based features):

```bash
cd WERC-website
python3 -m http.server 8000     # then open http://localhost:8000
```

---

## Before you go live — checklist

The content is written to be plausible, not accurate. Every item below is a placeholder.
Search `index.html` for `EDIT:` to find each one in context.

- [ ] **Exec names, programs and emails** in the Team section — all eight are invented placeholders
- [ ] **Stat numbers** in the hero (`data-count`) — members, events, partners, faculties
- [ ] **Events** — dates, titles, rooms, prices, application deadlines
- [ ] **Email addresses** — `hello@werc-uwo.ca`, `partnerships@…`, `members@…` and the per-exec addresses
- [ ] **Instagram and LinkedIn URLs** — currently point at the bare homepages
- [ ] **Membership fee** — the Join section says $15/year
- [ ] **Sponsorship price** — the Sponsors section says packages start at $500
- [ ] **Sponsor logos** — replace the dashed placeholder tiles
- [ ] **Meta description and canonical URL** in `<head>`
- [ ] **Footer wording** — confirm how the USC wants club affiliation described
- [ ] **Land acknowledgment** — verify against Western's current official wording
- [ ] **Connect the sign-up form** (see below) — right now it only opens an email draft

---

## Editing content

### Adding an event

Each event is one `<li>` in the `#events` list. Copy an existing block and change the pieces:

```html
<li class="event" data-state="upcoming">
  <div class="event-date">
    <span class="month">Jan</span><span class="day">14</span><span class="year">2027</span>
  </div>
  <div class="event-body">
    <div class="event-tags">
      <span class="tag tag-speaker">Speaker</span>
      <span class="tag">Free</span>
    </div>
    <h3>Your event title</h3>
    <p>One or two sentences on what actually happens and who it's for.</p>
    <p class="event-meta">6:00–7:30 PM · Building and room</p>
  </div>
  <div class="event-action">
    <a class="btn btn-sm btn-primary" href="#join">Register</a>
  </div>
</li>
```

- `data-state="upcoming"` or `"past"` drives the Upcoming / Past / All filter.
  When an event has happened, change its `data-state` to `past` and swap the button for
  `<span class="event-done">Completed</span>`.
- Tag colour classes available: `tag-speaker`, `tag-workshop`, `tag-comp`, `tag-trek`,
  `tag-social`, or plain `tag` for a neutral grey.

### Adding or changing an exec

```html
<article class="member reveal">
  <span class="avatar" data-initials="AB" aria-hidden="true"></span>
  <h3>Alex Bianchi</h3>
  <p class="role">VP Finance</p>
  <p class="program">HBA '28, Ivey Business School</p>
  <a class="member-mail" href="mailto:finance@werc-uwo.ca">finance@werc-uwo.ca</a>
</article>
```

To use a real photo instead of the initials circle, replace the `<span class="avatar">`
with an image — the styling is identical:

```html
<img class="avatar" src="assets/team/alex.jpg" alt="">
```

Square crops around 300×300 px work best. Put them in `assets/team/`.

### Adding a sponsor logo

Replace a placeholder tile:

```html
<!-- before -->
<div class="sponsor-tile is-empty"><span>Sponsor logo</span></div>

<!-- after -->
<a class="sponsor-tile" href="https://sponsor.com" target="_blank" rel="noopener">
  <img src="assets/sponsors/sponsor-name.svg" alt="Sponsor Name">
</a>
```

SVG or transparent PNG, ideally on a light background. Logos are capped at 54 px tall.

### Adding a nav item

Nav links are anchors to section IDs. Add the link and the section, and the scroll-spy
highlighting picks it up automatically:

```html
<li><a href="#resources">Resources</a></li>
```

---

## Connecting the sign-up form

As shipped, the form validates the fields and then opens the visitor's email client with
their answers pre-filled. That works, but it's clunky and some people have no mail client
configured. Two better options:

### Option A — Google Forms (free, easiest)

1. Build the equivalent form in Google Forms.
2. Click **Send → `< >`** and copy the `<iframe>` embed code.
3. In `index.html`, delete the whole `<form class="join-form" …>…</form>` block and paste
   the iframe in its place.

Responses land in a Google Sheet. You lose the custom styling.

### Option B — Formspree (free tier, keeps the styling)

1. Create a form at [formspree.io](https://formspree.io) and copy your endpoint ID.
2. Change the opening tag in `index.html` to:

```html
<form class="join-form reveal" id="joinForm"
      action="https://formspree.io/f/YOUR_ID" method="POST">
```

3. Delete the `data-mailto="…"` attribute.

`main.js` checks for an `action` attribute and steps out of the way when it finds one, so
the browser submits normally. Submissions arrive by email and in the Formspree dashboard.

---

## Theme

The site ships with light and dark themes. It follows the visitor's operating system
setting until they press the toggle in the header, after which their choice is remembered
in `localStorage`. To force one theme permanently, set it on the `<html>` tag and delete
the toggle button:

```html
<html lang="en" data-theme="light">
```

## Brand colours

Sampled directly from the logo, defined at the top of `styles.css`:

| Token          | Hex       | Where it's used                       |
| -------------- | --------- | ------------------------------------- |
| `--forest-800` | `#1D3422` | logo arch, primary buttons, footer    |
| `--sage-500`   | `#67A97B` | logo mid-green, accents, focus rings  |
| `--lime-500`   | `#A4C868` | logo lime, highlights, dark-mode CTAs |
| `--forest-900` | `#0F1F15` | footer background, dark-mode base     |

Fonts are Space Grotesk (headings) and Inter (body), loaded from Google Fonts in `<head>` —
the only external request the site makes. If it's blocked or offline, the page falls back to the
system sans-serif and still lays out correctly. To remove the dependency entirely, download both
families, drop the `.woff2` files in `assets/fonts/`, and replace the Google Fonts `<link>` with
`@font-face` rules.

---

## Deploying — free options

### GitHub Pages

```bash
cd WERC-website
git init
git add .
git commit -m "Initial WERC website"
git branch -M main
git remote add origin https://github.com/YOUR-ORG/werc-website.git
git push -u origin main
```

Then in the repo: **Settings → Pages → Source: `main` / root**. Live in about a minute at
`https://YOUR-ORG.github.io/werc-website/`.

Handing the repo to next year's exec means transferring the repo — worth putting it under a
club GitHub organisation rather than a personal account.

### Netlify or Cloudflare Pages

Drag the `WERC-website` folder onto [app.netlify.com/drop](https://app.netlify.com/drop).
No account needed to preview, free account to keep the URL. Both support a custom domain
and HTTPS at no cost.

### A custom domain

Once deployed, add a domain like `werc-uwo.ca` (about $15/year) in the host's dashboard.
Check with the USC first — some clubs get a `uwo.ca` subdomain or hosting through the
university, which is more durable across exec turnovers than a domain on someone's card.

---

## Accessibility and performance notes

Things already handled, worth not breaking:

- Skip link, visible focus rings, and labelled form fields
- `aria-expanded` / `aria-pressed` on the menu and theme buttons
- All animation disabled under `prefers-reduced-motion`
- Decorative SVGs marked `aria-hidden`; icons never carry meaning alone
- Contrast checked in both themes

The whole site is well under 400 KB. If you add exec photos, resize them to roughly
600 px wide before committing — a folder of unresized phone photos is the fastest way to
make the page slow.
