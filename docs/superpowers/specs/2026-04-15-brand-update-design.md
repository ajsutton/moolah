# Brand Update Design Spec

Apply the MoolahRocks brand guide to the existing Vuetify 4 web app. All changes are visual — no logic or data model changes.

## Scope

1. Color theme (light + dark with OS auto-switching)
2. Typography (Roboto → Poppins)
3. Logo assets (dollar-sign SVG → crystal-peaks brand mark)
4. Favicons & meta tags
5. App bar & navigation drawer styling
6. Welcome/landing page restyle

## 1. Color Theme

Update `src/plugins/vuetify.js` to define two themes with automatic OS preference switching.

### Light theme

| Vuetify token | Brand token | Hex |
|---|---|---|
| background | Paper | #F8FAFD |
| surface | White | #FFFFFF |
| surface-light | Paper | #F8FAFD |
| primary | Income Blue | #1E64EE |
| primary-darken-1 | Ink Navy | #0A2370 |
| secondary | Balance Gold | #FFD56B |
| error | Expense Red | #DC223B |
| info | Income Blue | #1E64EE |
| success | Income Blue | #1E64EE |
| warning | Balance Gold | #FFD56B |
| on-primary | White | #FFFFFF |
| on-secondary | Brand Space | #07102E |
| on-background | Ink Navy | #0A2370 |
| on-surface | Ink Navy | #0A2370 |

### Dark theme

| Vuetify token | Brand token | Hex |
|---|---|---|
| background | Deep Void | #02050F |
| surface | Brand Space | #07102E |
| surface-light | Ink Navy | #0A2370 |
| primary | Income Blue | #1E64EE |
| primary-darken-1 | Light Blue | #7ABDFF |
| secondary | Balance Gold | #FFD56B |
| error | Coral Red | #FF787F |
| info | Light Blue | #7ABDFF |
| success | Light Blue | #7ABDFF |
| warning | Balance Gold | #FFD56B |
| on-primary | White | #FFFFFF |
| on-secondary | Brand Space | #07102E |
| on-background | Paper | #F8FAFD |
| on-surface | Paper | #F8FAFD |

### Muted/disabled text

| Vuetify variable | Light | Dark |
|---|---|---|
| border-color | Ink Navy #0A2370 | Muted #AAB4C8 |
| medium-emphasis-opacity | 0.6 | 0.7 |

### Auto-switching

Set `defaultTheme` to detect OS preference using `window.matchMedia('(prefers-color-scheme: dark)')` and listen for changes.

## 2. Typography

- Replace Roboto with Poppins (Google Fonts)
- Update `index.html` font link and `vite.config.mjs` font plugin config
- Weights needed: 400, 500, 600, 700, 800
- Fallback stack: `'Poppins', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif`
- Configure in Vuetify's typography settings or via `src/styles/settings.scss`
- Remove `roboto-fontface` npm dependency

## 3. Logo Assets

- Copy horizontal lockup SVGs from brand package into `src/assets/`
  - Dark-bg variant for the app bar
  - Light-bg variant if needed for light contexts
- Replace the dollar-sign `moolah.svg` references with the new logo
- App bar title: replace text "Moolah" with the horizontal lockup wordmark (sized ~32px height)

## 4. Favicons & Meta Tags

- Copy brand favicon files from `Web/` to `public/static/favicon/`
  - favicon.ico, icon-16.png, icon-32.png, icon-48.png, icon-180.png, icon-192.png, icon-512.png
- Update `index.html`:
  - Favicon link tags to reference new files
  - Theme color meta tag: `#07102E` (Brand Space)
  - Add OG meta tags from brand guide
- Update or replace `manifest.json` with brand `site.webmanifest` content

## 5. App Bar & Navigation

### App bar
- Background: Brand Space `#07102E` (both themes — consistent brand identity)
- Title: Replace text with horizontal lockup logo (light variant on dark bg)
- Text/icons: white

### Navigation drawer (MainNav)
- Background: Ink Navy `#0A2370` (dark mode feel regardless of theme)
- Text: Paper `#F8FAFD`
- Active item highlight: Income Blue `#1E64EE`
- Section headers: Balance Gold `#FFD56B`, uppercase, 0.15em letter-spacing (per brand typography rules)

## 6. Welcome Page

- Update background to Brand Space navy
- Apply brand copy (tagline, hero text) from the style guide
- Use Poppins display typography (Bold/ExtraBold, 48-72pt, tight letter-spacing)
- Primary CTA: Income Blue background, white text
- Overall feel: dark hero section matching brand guide aesthetic

## Open Question

- Income color: Brand guide uses blue for income. Currently green. We'll implement blue per the guide and evaluate visually — may revert to green if it doesn't read well in context.

## Out of Scope

- No changes to app logic, routing, or data handling
- No dark/light toggle UI control (OS preference only for now)
- No motion/animation updates (can be a follow-up)
- No social/marketing banner integration
