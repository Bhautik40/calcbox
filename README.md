# CalcBox

Quick calculators. Instant answers. A static site with 32 calculators. It has no build dependencies, no framework and no sign-up.

## Folders
- `site/`: the finished website. Deploy this folder.
- `preview/`: the same site with links that work when you open `preview/index.html` straight from your computer.
- `src/`: the source. `core.js` holds the calculators, `app.js` the page behaviour, `style.css` the design.
- `build.js`: rebuilds `site/` from `src/` (`node build.js`, needs Node 18+).
- `static/`: the share image and app icons, which are copied into `site/`.

## Before you publish
1. In `build.js`, set `SITE_URL` to your real domain and `CONTACT_EMAIL` to your email, then run `node build.js`.
   (If you don't want to run Node, search and replace `https://mycalcbox.in` and `bhautiksondrava@gmail.com` inside `site/`.)
2. Deploy:
   - **Vercel (with GitHub):** push this folder to a GitHub repo, then on vercel.com choose Add New → Project → import the repo → Deploy. `vercel.json` already tells Vercel to serve the `site` folder with no build step. Every later push updates the site automatically.
   - **Netlify:** go to app.netlify.com/drop and drag the `site` folder onto the page. With Git, `netlify.toml` already sets the publish folder to `site`.
   - **Cloudflare Pages:** Create project → Direct Upload → upload the `site` folder. With Git, set the build command to empty and the output directory to `site`.
3. Submit `https://YOUR-DOMAIN/sitemap.xml` in Google Search Console.

## Google AdSense
- **Head script:** every page has a commented `ADSENSE (head)` block in `<head>`. Uncomment it and put in your `ca-pub-…` ID. It's easiest to do this in `build.js` (the `head()` function) and rebuild.
- **Ad slots:** nothing shows on the page yet. Each ad position is marked with an invisible `<!-- AD SLOT: name -->` comment. The homepage has `home-top` and `home-bottom`. Each tool page has `tool-top`, `below-result` and `in-content`. To place ads, edit the `ad()` function in `build.js` so it returns your AdSense unit, then rebuild.
- **ads.txt:** put in your publisher ID and uncomment the line.

## Adding or editing a calculator
Each tool is one object in `src/core.js`. It holds the slug, SEO title and meta, inputs with default values, a `calc()` function and related tools. Run `node build.js` and the new page, footer link, sitemap entry and search entry are all created for you.

## What's saved on the visitor's device
These are stored in localStorage: `cb_pins` (pinned tools), `cb_recent` (the last 8 tools used) and `cb_theme` (light or dark).
