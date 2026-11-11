# Architecture decisions

- Use the text Bun lockfile as the dependency source of truth; remove legacy npm and binary Bun locks to prevent conflicting security resolutions.

- Theme lives entirely in index.css tokens; course tracks (.track-*) only override accent tokens so the sitewide look stays consistent.- The Java lab simulates compilation and execution in the browser (no real JVM runner); exercises live in src/data/java-lab-exercises.ts.
- The app is installable via manifest only (no app-shell service worker), so published updates load automatically without stale caches.
