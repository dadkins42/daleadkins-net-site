# daleadkins.net

Static site on GitHub Pages. The root **redirects to daleadkins.com**; the real
purpose is a private, per-camp **teaching hub** for camps Dale teaches at.

daleadkins.com is untouched (stays on Weebly). Only .net moves here.

## Structure

```
index.html                      root → redirect to daleadkins.com
CNAME                           daleadkins.net
camps/
  nimblefingers/
    index.html                  the camp page (password-gated)
    media/                      audio files (add as you go)
    handouts/                   PDFs (add as you go)
```

Each camp = its own folder under `camps/`, its own page, its own password.

## Go-live checklist

1. **Create the repo** under the `dadkins42` GitHub account (same place as
   hogbodylabs.com / adkinsfam.net). Push this folder to it. Enable GitHub Pages
   on the `main` branch. The `CNAME` file points it at daleadkins.net.
2. **Repoint DNS at GoDaddy** for daleadkins.net:
   - Replace the A record `199.34.228.100` (Weebly) with GitHub's four:
     `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`
   - Point the `www` CNAME to `dadkins42.github.io`
   - Leave daleadkins.com alone.
3. Wait for DNS + GitHub's HTTPS cert (can take up to a few hours), then visit
   daleadkins.net → should bounce to .com; daleadkins.net/camps/nimblefingers →
   the camp page.

## IMPORTANT — real password protection before publishing real content

The password gate in each camp `index.html` is a **placeholder** (plain JS). It
keeps the page from showing immediately, but the content is still in the page
source — it is NOT actually private yet.

Before putting real lessons up, encrypt each camp page with **StatiCrypt**:

```
npx staticrypt camps/nimblefingers/index.html -p "nimblefingers26" -d camps/nimblefingers
```

That AES-encrypts the page so it's genuine gibberish without the password. The
student experience is identical (type password → content). Re-run it whenever you
update a camp page's content.

Current camp passwords:
- NimbleFingers (Sorrento, BC, starts July 5): `nimblefingers26`

## Adding content to a camp

- Audio: drop `.mp3` files in the camp's `media/` and point the `<audio>` src at them.
- Video: paste an **unlisted** YouTube/Vimeo embed URL into the `<iframe src="">`.
- Handouts: drop PDFs in `handouts/` and link them.
- Then re-run StatiCrypt for that camp page (see above).

## Adding a new camp

Copy `camps/nimblefingers/` to `camps/<new-camp>/`, edit the welcome text and
password, encrypt it with StatiCrypt, commit.
