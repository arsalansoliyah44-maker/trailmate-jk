# Trailmate J&K

An installable, offline-first trekking home page focused on Jammu & Kashmir.

## Included

- Jammu & Kashmir trail catalogue with filters and search
- Offline trail notes cached by a service worker
- Installable PWA manifest and app icon
- Local saved-route state via `localStorage`
- Online/offline status and device-location action

## Run locally

```bash
python3 -m http.server 4173
```

Open `http://127.0.0.1:4173/` in a browser. To install it on a phone, deploy the folder to an HTTPS host such as GitHub Pages, Netlify, or Vercel; phone browsers generally require HTTPS for PWA installation and service workers.

The current build caches the app shell and route notes. Downloadable topo maps, GPX tracks, and turn-by-turn navigation should be added as a separate map-data layer before relying on it in remote terrain.
