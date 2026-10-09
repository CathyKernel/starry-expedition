# Deployment Guide

*The Starry Expedition* is a fully static site — a folder of plain HTML, JS, CSS, and images (Next.js `output: "export"` → `out/`). It runs on any static host: no server, no database, no environment variables.

Two packages are provided:

| File | What it is | Use it for |
|---|---|---|
| `starry-expedition.zip` | the source repository (this repo) | GitHub + Netlify Git-connected deploys, future edits |
| `starry-expedition-site.zip` | the pre-built static site (`out/`, ready to serve) | instant drag-and-drop deploy on Netlify Drop — no tools, no build |

---

## 1. Netlify (recommended — free)

### Option A · instant: Netlify Drop (no build, no Git, ~10 seconds)

1. Log in to Netlify (free account — email or GitHub): **[app.netlify.com/drop](https://app.netlify.com/drop)**.
2. Drag the file **`starry-expedition-site.zip`** onto the drop zone. Netlify unzips and deploys it, and gives you a live URL immediately (`random-name-1234.netlify.app`).
3. Give it a proper name: **Site configuration → Site details → Change site name** → enter `cathykernel`. The site becomes:

   ```
   https://cathykernel.netlify.app
   ```

   Netlify subdomains are first-come-first-served; if `cathykernel` is taken, try `starry-expedition` or `cathykernel-starry`.

HTTPS is automatic (Let's Encrypt). Done — you now have your own URL.

> Note: a Drop deploy does not auto-update when you change the code. For that, use Option B (or simply drag a fresh `out/` folder again).

### Option B · connected to Git (recommended long-term: auto-deploy on every push)

1. Push this repository to GitHub — e.g. `https://github.com/cathykernel/starry-expedition` (GitHub Desktop or the web uploader both work; see the upload notes at the end of this guide).
2. On Netlify: **Add new site → Import an existing project → GitHub** → pick the repository.
3. Netlify reads the included `netlify.toml` (build command `npm run build`, publish directory `out/`, Node 22) — click **Deploy**. The first build takes about a minute.
4. Rename the site to `cathykernel` as in Option A. From now on, every `git push` to `main` rebuilds and redeploys the site automatically.

### Option C · Netlify CLI (if you have Node.js locally)

```bash
npm install -g netlify-cli
netlify login
npm run build
netlify deploy --prod --dir=out
```

### Custom domain on Netlify

1. **Domain management → Domains → Add a domain**, and enter your domain — for example `cathykernel.is-a.dev`, a free `.dev` subdomain from the [is-a.dev](https://is-a.dev) community registry (open a pull request in their `register` repository), or a domain you bought (a real `.dev` costs ~US$10–15/yr at Porkbun, Namecheap, or Cloudflare Registrar).
2. At the domain's DNS, point a `CNAME` record at `cathykernel.netlify.app` (for a bare/apex domain, use the `ALIAS`/`ANAME` or `A` records Netlify shows you).
3. Netlify provisions the HTTPS certificate automatically — nothing to configure. (The entire `.dev` TLD requires HTTPS by design; Netlify satisfies this out of the box.)

Free-plan limits are generous and honest: **100 GB bandwidth/month** and **~300 build minutes/month** — far beyond what a portfolio demo needs.

---

## 2. GitHub Pages (alternative — also free, included)

The repository also ships `.github/workflows/deploy.yml`, which builds and publishes to GitHub Pages on every push to `main`:

1. Push the repo to GitHub.
2. **Settings → Pages → Build and deployment → Source: "GitHub Actions"** (one time).
3. Live at `https://<your-username>.github.io/<repo-name>/` — the workflow computes the correct sub-path base automatically (and detects `public/CNAME` for custom domains, building for root then).

For a custom domain on Pages: add `public/CNAME` containing your domain, point DNS at `<your-username>.github.io`, and set it under **Settings → Pages → Custom domain**.

---

## 3. Other alternatives (also free)

- **Vercel** — [vercel.com](https://vercel.com) → **Add New → Project → Import** the repo → Deploy. Live at `<project>.vercel.app`; custom domains in the dashboard.
- **Cloudflare Pages** — [pages.cloudflare.com](https://pages.cloudflare.com) → **Create a project → Connect to Git** → framework preset *Next.js (Static HTML Export)*, build command `npm run build`, output `out`. Live at `<project>.pages.dev`.
- **Netlify Drop without the zip** — run `npm run build` locally and drag the `out/` **folder** onto [app.netlify.com/drop](https://app.netlify.com/drop).

---

## 4. Preview the static build locally

```bash
npm install
npm run build      # emits the static site to out/
npm run preview    # serves out/ at http://localhost:3000
```

(On Netlify and all root-served hosts, no base path is needed — the default build is already correct.)

---

## 5. Uploading the source repository to GitHub

**GitHub Desktop (GUI):** [desktop.github.com](https://desktop.github.com) → **File → Add Local Repository** → pick the unzipped `starry-expedition` folder → accept creating the repository → **Publish repository** (name it `starry-expedition`, keep it public).

**Browser only:** on the repo page, **Add file → Upload files**, and drag the *contents* of the unzipped folder into the upload area (Chrome/Edge handle folders). Limits: max 100 files per batch (this repo is 54) and 25 MB per file (largest here is 1.3 MB). Two quirks: the hidden `.github` folder may not come along in a folder drag — if so, create `.github/workflows/deploy.yml` by hand via **Add file → Create new file** and paste its contents; and empty files are dropped — the packaged `.nojekyll` already contains a newline to survive this.

> Do **not** upload the `.zip` itself — GitHub never unzips archives, so the site would not work.

---

## Troubleshooting

- **"Page not found" on Netlify** → the publish directory must be `out` (it is, via `netlify.toml`; if you configured manually, fix it under **Site configuration → Build & deploy → Build settings**).
- **Blank page / broken images** → only possible on sub-path hosts (GitHub Pages with the wrong base path). Re-run the workflow with `auto`, or ensure `public/CNAME` is present for custom domains. On Netlify, deploys are always at root, so this cannot occur.
- **Custom domain shows a certificate warning** → give Netlify's automatic Let's Encrypt issuance a few minutes after pointing DNS, then re-open the domain.
- **Audio does not start** → browsers require one user gesture before audio; the demo already handles this (the piano resumes on your first click, key press, scroll, or touch). Check the mute button in the HUD.
