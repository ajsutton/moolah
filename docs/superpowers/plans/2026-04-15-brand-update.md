# Brand Update Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Apply the MoolahRocks brand guide to the Vuetify 4 web app — colors, typography, logo, favicons, app bar, nav drawer, and welcome page. Add light/dark theme with OS auto-switching.

**Architecture:** Update Vuetify theme config with two themes (light + dark) and OS preference detection. Swap Roboto for Poppins via the existing unplugin-fonts setup. Copy brand logo/favicon assets into the project. Restyle app bar, nav drawer, and welcome page to use brand colors and copy.

**Tech Stack:** Vue 3, Vuetify 4, Vite, SCSS, unplugin-fonts

**Brand assets source:** `/Users/aj/Library/Application Support/Claude/local-agent-mode-sessions/a0456139-31f8-4df8-b09f-0bf1aa077ece/bb91aed9-3d0b-49f0-8842-7b1733fe5c5e/local_c7fe7e8d-bef8-45e3-9ddf-3ef066b5b81b/outputs/MoolahRocks-Brand`

---

### Task 1: Update Vuetify color theme with light/dark and OS auto-switching

**Files:**
- Modify: `src/plugins/vuetify.js`

- [ ] **Step 1: Replace vuetify.js with brand color themes**

Replace the entire contents of `src/plugins/vuetify.js` with:

```js
// Styles
import '@mdi/font/css/materialdesignicons.css';
import 'vuetify/styles';

// Composables
import { createVuetify } from 'vuetify';
import { aliases, mdi } from 'vuetify/iconsets/mdi';

// Detect OS color scheme preference
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

export default createVuetify({
    icons: {
        defaultSet: 'mdi',
        aliases,
        sets: {
            mdi,
        },
    },
    theme: {
        defaultTheme: prefersDark ? 'dark' : 'light',
        themes: {
            light: {
                dark: false,
                colors: {
                    background: '#F8FAFD',
                    surface: '#FFFFFF',
                    'surface-bright': '#FFFFFF',
                    'surface-light': '#F8FAFD',
                    'surface-variant': '#0A2370',
                    'on-surface-variant': '#F8FAFD',
                    primary: '#1E64EE',
                    'primary-darken-1': '#0A2370',
                    secondary: '#FFD56B',
                    'secondary-darken-1': '#E6B84D',
                    error: '#DC223B',
                    info: '#1E64EE',
                    success: '#1E64EE',
                    warning: '#FFD56B',
                },
                variables: {
                    'border-color': '#0A2370',
                    'border-opacity': 0.12,
                    'high-emphasis-opacity': 0.87,
                    'medium-emphasis-opacity': 0.6,
                    'disabled-opacity': 0.38,
                    'idle-opacity': 0.04,
                    'hover-opacity': 0.04,
                    'focus-opacity': 0.12,
                    'selected-opacity': 0.08,
                    'activated-opacity': 0.12,
                    'pressed-opacity': 0.12,
                    'dragged-opacity': 0.08,
                    'theme-kbd': '#0A2370',
                    'theme-on-kbd': '#FFFFFF',
                    'theme-code': '#F8FAFD',
                    'theme-on-code': '#0A2370',
                },
            },
            dark: {
                dark: true,
                colors: {
                    background: '#02050F',
                    surface: '#07102E',
                    'surface-bright': '#0A2370',
                    'surface-light': '#0A2370',
                    'surface-variant': '#AAB4C8',
                    'on-surface-variant': '#07102E',
                    primary: '#1E64EE',
                    'primary-darken-1': '#7ABDFF',
                    secondary: '#FFD56B',
                    'secondary-darken-1': '#E6B84D',
                    error: '#FF787F',
                    info: '#7ABDFF',
                    success: '#7ABDFF',
                    warning: '#FFD56B',
                },
                variables: {
                    'border-color': '#AAB4C8',
                    'border-opacity': 0.12,
                    'high-emphasis-opacity': 0.87,
                    'medium-emphasis-opacity': 0.7,
                    'disabled-opacity': 0.38,
                    'idle-opacity': 0.04,
                    'hover-opacity': 0.04,
                    'focus-opacity': 0.12,
                    'selected-opacity': 0.08,
                    'activated-opacity': 0.12,
                    'pressed-opacity': 0.12,
                    'dragged-opacity': 0.08,
                    'theme-kbd': '#F8FAFD',
                    'theme-on-kbd': '#07102E',
                    'theme-code': '#07102E',
                    'theme-on-code': '#F8FAFD',
                },
            },
        },
    },
});
```

- [ ] **Step 2: Verify the app still starts**

Run: `yarn dev`
Expected: App starts without errors. Colors should look different from before.

- [ ] **Step 3: Commit**

```bash
git add src/plugins/vuetify.js
git commit -m "Update Vuetify theme to brand colors with light/dark OS auto-switching"
```

---

### Task 2: Switch typography from Roboto to Poppins

**Files:**
- Modify: `index.html:17` (Google Fonts link)
- Modify: `vite.config.mjs:36-42` (Fonts plugin config)
- Modify: `src/styles/settings.scss` (Vuetify font override)

- [ ] **Step 1: Update Google Fonts link in index.html**

In `index.html`, replace line 17:

```html
<link href='https://fonts.googleapis.com/css?family=Roboto:300,400,500,700|Material+Icons' rel="stylesheet" type="text/css">
```

with:

```html
<link href='https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700;800&family=Material+Icons' rel="stylesheet" type="text/css">
```

- [ ] **Step 2: Update vite.config.mjs Fonts plugin**

In `vite.config.mjs`, replace the Fonts plugin config (lines 36-42):

```js
Fonts({
  google: {
    families: [{
      name: 'Roboto',
      styles: 'wght@100;300;400;500;700;900',
    }],
  },
}),
```

with:

```js
Fonts({
  google: {
    families: [{
      name: 'Poppins',
      styles: 'wght@400;500;600;700;800',
    }],
  },
}),
```

- [ ] **Step 3: Override Vuetify's default font in settings.scss**

Replace the contents of `src/styles/settings.scss` with:

```scss
/**
 * src/styles/settings.scss
 *
 * Configures SASS variables and Vuetify overwrites
 */

@use 'vuetify/settings' with (
  $body-font-family: ('Poppins', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif),
  $heading-font-family: ('Poppins', 'SF Pro Display', 'Segoe UI', Roboto, sans-serif)
);
```

- [ ] **Step 4: Verify the font change**

Run: `yarn dev`
Expected: All text renders in Poppins. Check browser DevTools → Computed → font-family to confirm.

- [ ] **Step 5: Commit**

```bash
git add index.html vite.config.mjs src/styles/settings.scss
git commit -m "Switch typography from Roboto to Poppins"
```

---

### Task 3: Copy brand logo assets into the project

**Files:**
- Create: `src/assets/logo-horizontal-on-dark.png` (copied from brand package)
- Create: `src/assets/logo-horizontal-on-light.png` (copied from brand package)
- Create: `src/assets/logo-icon.svg` (copied from brand package)
- Create: `src/assets/logo-stacked-on-dark.png` (copied from brand package)

- [ ] **Step 1: Copy logo assets from brand package**

```bash
BRAND="/Users/aj/Library/Application Support/Claude/local-agent-mode-sessions/a0456139-31f8-4df8-b09f-0bf1aa077ece/bb91aed9-3d0b-49f0-8842-7b1733fe5c5e/local_c7fe7e8d-bef8-45e3-9ddf-3ef066b5b81b/outputs/MoolahRocks-Brand"
ASSETS="src/assets"

cp "$BRAND/Logo/horizontal-lockup/lockup-horizontal-on-dark.png" "$ASSETS/logo-horizontal-on-dark.png"
cp "$BRAND/Logo/horizontal-lockup/lockup-horizontal-on-light.png" "$ASSETS/logo-horizontal-on-light.png"
cp "$BRAND/Logo/icon-only/icon.svg" "$ASSETS/logo-icon.svg"
cp "$BRAND/Logo/stacked-lockup/lockup-stacked-on-dark.png" "$ASSETS/logo-stacked-on-dark.png"
```

- [ ] **Step 2: Commit**

```bash
git add src/assets/logo-horizontal-on-dark.png src/assets/logo-horizontal-on-light.png src/assets/logo-icon.svg src/assets/logo-stacked-on-dark.png
git commit -m "Add brand logo assets"
```

---

### Task 4: Replace favicons and update meta tags

**Files:**
- Create: `public/static/favicon/` (new favicon files from brand package, replacing old ones)
- Modify: `public/static/favicon/manifest.json`
- Modify: `index.html:6-16` (meta tags)

- [ ] **Step 1: Copy new favicon files from brand package**

```bash
BRAND="/Users/aj/Library/Application Support/Claude/local-agent-mode-sessions/a0456139-31f8-4df8-b09f-0bf1aa077ece/bb91aed9-3d0b-49f0-8842-7b1733fe5c5e/local_c7fe7e8d-bef8-45e3-9ddf-3ef066b5b81b/outputs/MoolahRocks-Brand"
FAVICON="public/static/favicon"

cp "$BRAND/Web/favicon.ico" "$FAVICON/favicon.ico"
cp "$BRAND/Web/icon-16.png" "$FAVICON/moolah-16.png"
cp "$BRAND/Web/icon-32.png" "$FAVICON/moolah-32.png"
cp "$BRAND/Web/icon-48.png" "$FAVICON/moolah-48.png"
cp "$BRAND/Web/icon-180.png" "$FAVICON/moolah-180.png"
cp "$BRAND/Web/icon-192.png" "$FAVICON/moolah-192.png"
cp "$BRAND/Web/icon-512.png" "$FAVICON/moolah-512.png"
cp "$BRAND/Web/apple-touch-icon.png" "$FAVICON/apple-touch-icon.png"
cp "$BRAND/Web/android-chrome-192x192.png" "$FAVICON/android-chrome-192x192.png"
cp "$BRAND/Web/android-chrome-512x512.png" "$FAVICON/android-chrome-512x512.png"
```

- [ ] **Step 2: Update manifest.json**

Replace `public/static/favicon/manifest.json` with:

```json
{
    "name": "moolah.rocks",
    "short_name": "Moolah",
    "description": "Personal finance that rocks — track income, expenses, and net balance.",
    "icons": [
        {
            "src": "/static/favicon/android-chrome-192x192.png",
            "sizes": "192x192",
            "type": "image/png"
        },
        {
            "src": "/static/favicon/android-chrome-512x512.png",
            "sizes": "512x512",
            "type": "image/png"
        }
    ],
    "theme_color": "#07102E",
    "background_color": "#07102E",
    "display": "standalone"
}
```

- [ ] **Step 3: Update index.html meta tags**

Replace lines 6-16 of `index.html`:

```html
    <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/moolah-180.png">
    <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon/moolah-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon/moolah-16.png">
    <link rel="manifest" href="/static/favicon/manifest.json">
    <link rel="shortcut icon" href="/static/favicon/moolah-16.png">
    <link rel="mask-icon" href="/static/favicon/safari-pinned-tab.svg" color="#1976d2">
    <meta name="apple-mobile-web-app-title" content="Moolah">
    <meta name="application-name" content="Moolah">
    <meta name="msapplication-config" content="/static/browserconfig.xml">
    <meta name="theme-color" content="#ffffff">
    <title>Moolah</title>
```

with:

```html
    <link rel="icon" href="/static/favicon/favicon.ico" sizes="any">
    <link rel="icon" type="image/png" sizes="32x32" href="/static/favicon/moolah-32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="/static/favicon/moolah-16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="/static/favicon/moolah-180.png">
    <link rel="manifest" href="/static/favicon/manifest.json">
    <meta name="apple-mobile-web-app-title" content="moolah.rocks">
    <meta name="application-name" content="moolah.rocks">
    <meta name="theme-color" content="#07102E">
    <meta property="og:title" content="moolah.rocks — Solid money. Chill vibes.">
    <meta property="og:description" content="Personal finance for iPhone, iPad, and Mac. Lock down the money stuff so the rest of your life stays wide open. Private, powerful, yours.">
    <title>moolah.rocks</title>
```

- [ ] **Step 4: Verify favicon shows in browser tab**

Run: `yarn dev`
Expected: New brand icon appears in browser tab. Check that manifest.json loads without 404s in DevTools Network tab.

- [ ] **Step 5: Commit**

```bash
git add public/static/favicon/ index.html
git commit -m "Replace favicons and update meta tags with brand assets"
```

---

### Task 5: Restyle app bar and navigation drawer

**Files:**
- Modify: `src/App.vue:3` (app bar class)
- Modify: `src/App.vue:10` (toolbar title)
- Modify: `src/components/MainNav.vue:2-6` (nav drawer styling)

- [ ] **Step 1: Update app bar in App.vue**

In `src/App.vue`, replace the app bar opening tag (line 3):

```html
        <v-app-bar v-if="!loading" class="bg-primary">
```

with:

```html
        <v-app-bar v-if="!loading" style="background-color: #07102E;" flat>
```

- [ ] **Step 2: Replace text title with logo image in App.vue**

In `src/App.vue`, replace the toolbar title (lines 9-11):

```html
            <v-toolbar-title
                v-if="loggedIn"
                class="hidden-sm-and-down text-white"
                >Moolah</v-toolbar-title
            >
```

with:

```html
            <v-toolbar-title
                v-if="loggedIn"
                class="hidden-sm-and-down"
            >
                <img
                    src="@/assets/logo-horizontal-on-dark.png"
                    alt="moolah.rocks"
                    height="28"
                    style="vertical-align: middle;"
                />
            </v-toolbar-title>
```

- [ ] **Step 3: Ensure app bar icons are white**

In `src/App.vue`, update the first `v-app-bar-nav-icon` (line 4-7) to add a white color:

```html
            <v-app-bar-nav-icon
                v-if="loggedIn"
                color="white"
                @click.stop="mainNavVisible = !mainNavVisible"
            ></v-app-bar-nav-icon>
```

And update the second `v-app-bar-nav-icon` (lines 23-27):

```html
            <v-app-bar-nav-icon
                v-if="loggedIn"
                color="white"
                :disabled="!hasTransaction"
                @click.prevent="toggleRightNav"
            ></v-app-bar-nav-icon>
```

And update the Sign In button (lines 15-19) and Logout to be white text:

```html
                <v-btn
                    v-if="!loggedIn && !loading"
                    variant="text"
                    color="white"
                    href="/api/googleauth"
                    >Sign In</v-btn
                >
                <logout v-if="loggedIn" @logOut="loggedIn = false" color="white"></logout>
```

- [ ] **Step 4: Update navigation drawer in MainNav.vue**

In `src/components/MainNav.vue`, replace the `v-navigation-drawer` opening tag (lines 2-7):

```html
    <v-navigation-drawer
        v-model="mainNavVisible"
        floating
        theme="dark"
        width="300"
    >
```

with:

```html
    <v-navigation-drawer
        v-model="mainNavVisible"
        floating
        width="300"
        style="background-color: #0A2370;"
        theme="dark"
    >
```

- [ ] **Step 5: Verify visual changes**

Run: `yarn dev`
Expected: App bar is dark navy (#07102E) with brand logo. Nav drawer is Ink Navy (#0A2370). Icons and text are white.

- [ ] **Step 6: Commit**

```bash
git add src/App.vue src/components/MainNav.vue
git commit -m "Restyle app bar and navigation drawer with brand colors"
```

---

### Task 6: Restyle welcome page and loading screen

**Files:**
- Modify: `src/components/welcome/Welcome.vue`
- Modify: `src/components/welcome/FeaturePanel.vue`
- Modify: `src/components/welcome/LoadingScreen.vue`

- [ ] **Step 1: Restyle Welcome.vue with brand design**

Replace the entire `<template>` and `<style>` sections of `src/components/welcome/Welcome.vue`:

```html
<template>
    <div class="welcome-page">
        <div class="welcome-hero">
            <v-container class="fill-height">
                <v-row align="center" justify="center">
                    <v-col cols="12" class="text-center">
                        <img
                            src="@/assets/logo-stacked-on-dark.png"
                            alt="moolah.rocks"
                            height="120"
                            class="mb-6"
                        />
                        <h1 class="welcome-tagline">Your money, rock solid.</h1>
                        <p class="welcome-subhead">
                            Money stuff should be boring. Locked down, sorted out,
                            taken care of — so the rest of your life doesn't have to be.
                        </p>
                    </v-col>
                </v-row>
            </v-container>
        </div>
        <v-container>
            <v-row class="fill-height">
                <feature-panel :icon="IconAccountBalance" headline="Solid">
                    The boring stuff — budgets, categories, recurring bills — locked down.
                    The rest of your life? Wide open.
                </feature-panel>
                <feature-panel :icon="IconLock" headline="Private">
                    Your data lives on your device.
                    No accounts, no cloud servers, no one looking over your shoulder.
                </feature-panel>
                <feature-panel :icon="IconChartLine" headline="Clear">
                    Everything you need to know, visible in seconds.
                    Less time worrying, more time doing literally anything else.
                </feature-panel>
            </v-row>

            <v-row class="login-buttons" align="center" justify="space-around">
                <v-col class="text-center">
                    <v-btn
                        href="/api/googleauth"
                        color="#1E64EE"
                        size="large"
                        class="text-white"
                    >
                        Sign In to Get Started
                    </v-btn>
                </v-col>
            </v-row>
        </v-container>
    </div>
</template>
```

Update the `<script setup>` block to use the new icon:

```html
<script setup>
import IconAccountBalance from '~icons/mdi/accountBalance';
import IconLock from '~icons/mdi/lock';
import IconChartLine from '~icons/mdi/chartLine';
</script>
```

Keep the existing `<script>` block but remove the FeaturePanel import duplication — actually the `<script>` block should stay as-is since FeaturePanel is registered there.

Replace the `<style>` block:

```html
<style lang="scss">
.welcome-page {
    .welcome-hero {
        background-color: #07102E;
        min-height: 350px;
        display: flex;
        align-items: center;
    }

    .welcome-tagline {
        font-family: 'Poppins', sans-serif;
        font-weight: 700;
        font-size: 48px;
        color: #FFFFFF;
        letter-spacing: -0.03em;
        margin-bottom: 16px;
    }

    .welcome-subhead {
        font-family: 'Poppins', sans-serif;
        font-weight: 400;
        font-size: 18px;
        color: #AAB4C8;
        max-width: 600px;
        margin: 0 auto;
        line-height: 1.6;
    }

    .login-buttons {
        padding: 32px 0;
    }
}
</style>
```

- [ ] **Step 2: Update FeaturePanel.vue styling**

Replace the contents of `src/components/welcome/FeaturePanel.vue`:

```html
<template>
    <v-col :cols="12" :sm="4">
        <v-card flat class="text-sm-center fill-height">
            <v-card-text>
                <v-icon size="large" :icon="icon" color="primary"></v-icon>
            </v-card-text>
            <v-card-text class="text-h5 font-weight-bold">{{ headline }}</v-card-text>
            <v-card-text class="text-body-1"><slot /></v-card-text>
        </v-card>
    </v-col>
</template>

<script>
export default {
    props: ['icon', 'headline'],
};
</script>
```

- [ ] **Step 3: Update LoadingScreen.vue with brand colors**

In `src/components/welcome/LoadingScreen.vue`, replace the `<style>` block:

```html
<style lang="scss">
.loading-screen {
    background-color: #07102E;

    .flex {
        flex: 0 0 auto;
    }
}
</style>
```

Also update the `<template>` to use the new logo and brand accent color:

```html
<template>
    <v-container class="loading-screen fill-height" fluid>
        <v-row column align="center" justify="center">
            <v-col>
                <div class="loading text-sm-center">
                    <p>
                        <img
                            src="@/assets/logo-stacked-on-dark.png"
                            width="200"
                            height="200"
                        />
                    </p>
                    <v-progress-linear
                        :indeterminate="true"
                        color="#FFD56B"
                    ></v-progress-linear>
                </div>
            </v-col>
        </v-row>
    </v-container>
</template>
```

- [ ] **Step 4: Verify welcome and loading screens**

Run: `yarn dev`
Expected: Welcome page shows dark navy hero with brand logo, tagline, and blue CTA button. Loading screen shows brand logo on navy background with gold progress bar.

- [ ] **Step 5: Commit**

```bash
git add src/components/welcome/Welcome.vue src/components/welcome/FeaturePanel.vue src/components/welcome/LoadingScreen.vue
git commit -m "Restyle welcome page and loading screen with brand identity"
```

---

### Task 7: Clean up old assets

**Files:**
- Delete: `src/assets/moolah.svg` (old dollar-sign logo, replaced by brand logos)

- [ ] **Step 1: Verify no remaining references to moolah.svg**

Search for `moolah.svg` in the codebase. After Tasks 5-6, the only files referencing it should be gone (Welcome.vue and LoadingScreen.vue were updated). Confirm with:

```bash
grep -r "moolah.svg" src/
```

Expected: No results (all references were replaced in Tasks 5-6).

- [ ] **Step 2: Delete old logo**

```bash
rm src/assets/moolah.svg
```

- [ ] **Step 3: Commit**

```bash
git add -u src/assets/moolah.svg
git commit -m "Remove old dollar-sign logo"
```
