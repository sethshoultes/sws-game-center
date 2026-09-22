# Deploying sws-game-center

arcade#43 (epic arcade#41: consolidating every arcade game onto `hetzner-sites` under
`*.adventurebuildr.com`). This covers the repo-side half only — build config and a deploy
script. The box side (nginx vhost, DNS, first sync) is the arcade lead's.

## Build

```bash
npm install
npm run build
```

Produces a static `dist/` (`index.html` + a hashed `assets/` dir) via Vite. Confirmed building
cleanly on 2026-09-21 from a fresh clone, despite no push since 2025-02-08 — no dependency or
lockfile fixes needed, only a cosmetic `browserslist` "data is 21 months old" warning that
doesn't affect the build. `npm install` also rewrote ~479 lines of `package-lock.json`
(lockfile-format normalization from the newer local npm) and regenerated `dist/`'s hashed
filenames; neither is committed here — out of scope for this task, reverted to keep this
branch to deploy config only.

## What it needs to run

This is a pure client-side SPA — **no node process, no server-side rendering, nothing to run on
the box.** Static files under a webroot, served by nginx, is the whole target. At runtime in the
browser it talks to one external Supabase project for both games' leaderboards (via
`@supabase/supabase-js`, see below).

## Required build-time env vars

`src/lib/supabase.ts` reads two `import.meta.env.VITE_*` vars, inlined by Vite at build time —
same two as flappy-bird, not more, despite this site backing two games:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Both games share one Supabase project/client; there's no per-game credential. Values are not
this dev's to look for — the lead sources them from
`~/.config/dev-secrets/arcade/secrets.env`.

```bash
VITE_SUPABASE_URL="…" VITE_SUPABASE_ANON_KEY="…" npm run build
```

## Netlify-specific config the box needs to replicate

`netlify.toml` (`[build] command/publish`, matching the two commands above and `dist`) plus
three `[[redirects]]` rules, and a matching `public/_redirects` (`/* /index.html 200`) that
ships inside `dist/` itself. All of it reduces to **one requirement**: an SPA fallback —
unmatched paths serve `index.html` with a 200, not a 404, so the client-side router/state can
take over. In nginx that's the standard:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

The `/admin` and `/admin/*` rules in `netlify.toml` are redundant with the catch-all `/*` rule —
both resolve identically to `/index.html` with `200`/`force`. A single `try_files` fallback
covers all three; no separate `/admin` location block is needed.

**No Netlify Functions.** Searched the repo for a functions directory (`netlify/functions/` or
similar) — none exists. Nothing serverless for the box to replicate.

## One fact this issue asked to establish: one card or two?

**One card.** Despite `netlify.toml`'s and `App.tsx`'s doc comments both saying "React Router,"
there is no router in this repo — `react-router-dom` isn't a dependency, and `src/App.tsx`
picks the game with plain `useState` (`currentGame`), not a URL. The only two real routes are
`/` (game selection, or whichever game is currently selected in memory) and `/admin` (checked
via `window.location.pathname.startsWith('/admin')`). Neither Crossy Road nor Flappy Bird has
its own path — you can't deep-link to `/crossy-road` or `/flappy-bird`; reloading mid-game
always drops back to the selection screen. So this is **one site, one URL, two games behind a
client-side picker** — the arcade should get a single "Game Center" card linking to `/`, not two
cards. (Not writing the manifest here — that's the manifest issue's job; this is the fact it
needs.)

## Deploy script

`scripts/deploy.sh` rsyncs `dist/` to the box. It does not build — run `npm run build` first.

```bash
./scripts/deploy.sh
```

Reads `$HOME/.config/dev-secrets/arcade/secrets.env` if present (same canonical file the arcade
repo's own `scripts/deploy.sh` uses), then rsyncs to:

- `GAME_CENTER_DEPLOY_HOST` (default `hetzner-sites`, the same box every other arcade game is on)
- `GAME_CENTER_DEPLOY_PATH` (default
  `/home/gamecenter/htdocs/game-center.adventurebuildr.com` — CloudPanel's
  `/home/<site-user>/htdocs/<domain>` webroot layout, given directly for arcade#43, not a guess)

This dev has no ssh access and doesn't run this script itself; the arcade lead does, after the
box side (nginx vhost, DNS, cert, first sync) is ready.

## Netlify vs. this site, for reference

Two live copies exist right now (per arcade#43): this repo's own Netlify deploy
(`sws-game-center.netlify.app`, canonical) and a separate Bolt/Vite mirror at
`sethshoultes.com/game-center/`, committed into a different repo. The mirror is out of scope for
this move; not checked for drift beyond what the issue already noted.
