# Setting up this website

This checklist tracks the one-time setup. **Owner:** your AI works through it with you, one step at a time; you can stop any time and pick up later. Step-by-step clicks for every item are in [docs/setup-guide.md](docs/setup-guide.md).

**AI:** tick each box (`[x]`) as it's done. Until step 5 is done, work and ticks go straight to `main`: push them, or, if your platform only opens pull requests (Codex cloud, for example), batch them into a pull request and ask the owner to tap **Create PR** and **Squash and merge** (`AI-SETUP.md` in the toolkit, "How your work reaches `main`"). Tick box 5 and get it onto `main` right before the owner creates the lock (if you can't push, tick it with 6, 7 and 8 instead), then confirm the lock exists (ask for a screenshot of Settings → Rules → Rulesets showing "Protect live site", Active). After the lock, never put ticks in a change the owner may undo (a revert takes the ticks with it): tick 6, 7 and 8 together in the step 7 **undo** pull request, after the site card is written. Boxes are a record, not proof: before redoing a step, check whether it's already done (ask the owner, or look: the free address loads for step 3, `gh repo view --json visibility` (or a screenshot) for step 4; `gh api repos/OWNER/REPO/rulesets` or a refused push to `main` for step 5; an open pull request from an earlier session for step 7).

- [ ] **1. Site files in this repository**, on `main` (the default branch), including `.github/workflows/ci.yml`. The **Deploy to Cloudflare** button does this (setup guide, Step 2); an empty repository gets them from `AI-SETUP.md` in the toolkit. If `ci.yml` is missing or your platform can't push it, see `AI-SETUP.md`: the owner adds it with one link.
- [ ] **2. Interview and first version.** One question at a time:
  - Business name, what they do in one sentence, public phone, public email, address, hours.
  - Kind of business: pick the preset (`npm run preset <name>`).
  - Services and prices (optional), how they started, and what they're known for. Write every answer into `content/brand/brief.md`, then follow `rules/brand.md`.
  - **3 to 6 photos.** "Later" is fine. Send the upload message from `features/gallery.md`; then copy the photos into `public/images/` and run `npm run optimize-images`. Before the lock their upload lands straight on `main`, and the photos check adds its own commit there: `git pull` before you push (or before you finish, if the owner will merge your pull request).
  - A current website or Google listing? Ask for **screenshots** of it.
  - Do they already own a domain? Note it below, but leave `site.domain` empty until it's connected. If their public email is at a domain (`hello@theirbusiness.com`), someone already owns that domain: find out who before anyone buys one or turns on Email Routing.

  Then build version 1. **Nothing fake:** with no real photos, quotes, or domain yet, turn `heroPhoto`, `gallery`, `testimonials` and `contactForm` off (tap-to-call and email still show). Tell the owner the privacy and terms pages are starting templates, and remove any claim in them the owner didn't make. Write the homepage words from their answers (`rules/content.md`), `npm run build`, commit "First version of the site", and get it onto `main` (push, or the owner merges your pull request). Send direct links for anything on GitHub (`rules/deploy.md`).
- [ ] **3. Online at a free address.** The Deploy button already put it there; after the first version is on `main`, open it with the owner and check it shows their words (setup guide, Step 5). Empty-repository opening instead: the owner connects it in Cloudflare (**Workers & Pages** → **Create application** → **Import a repository**, the same name as `wrangler.jsonc`, **Build command:** `npm run build` (type it if the box is empty), deploy command `npx wrangler deploy`), then adds the `CONTACT_TO_EMAIL` secret under **Settings** → **Variables and Secrets**. Write the free address here: `https://_____.workers.dev`
- [ ] **4. Repository is public.** The Deploy button may have made it private, and the free lock in step 5 needs it public (setup guide, Step 5). Check with `gh repo view --json visibility` or a screenshot.
- [ ] **5. Live site locked.** The GitHub ruleset and settings (setup guide, Step 6). From now on every change goes through its own preview.
- [ ] **6. Edit my website button** on the owner's phone home screen (setup guide, Step 7). Set `site.editUrl` to the owner's AI link (format: `docs/connect-your-ai.md`, "Your Edit my website button"; Codex: `https://chatgpt.com/codex`) and ship it; if you can, set it in the first version (box 2) so it's already live. Then send the owner `https://<their site>/edit/` and say: "Open this in Safari (Chrome on Android), then Share → Add to Home Screen." Don't send the AI link itself for the home screen: the AI's page rewrites its own address, so a button made from it forgets the site and the sentence.
- [ ] **7. First change shipped, and one undo.** A small change (a welcome banner), preview link, "ship it," then "undo that" (it comes off right away, since it was the latest change; on a pull-request-only platform, the owner merges the undo).
- [ ] **8. Site card written down:** logins, two-step sign-in turned on for GitHub (Settings → Password and authentication), and its recovery codes saved somewhere safe (setup guide, "Your site card"). Do this before step 7's undo.

Domain they already own (if any): _____

## Later, when the owner is ready (optional)

- [ ] Own domain connected (nameservers on Cloudflare, or `docs/keep-your-dns.md`), **Always Use HTTPS** on, and `site.domain` set (setup guide, "Later: your own domain"). This is the real launch: until then the site is hidden from Google.
- [ ] Business email forwarding with Email Routing (setup guide, "Later: business email and the contact form"). The inbox the owner verifies must be the one in `CONTACT_TO_EMAIL`.
- [ ] Contact form on (`contactForm: true`) and a test message received (`docs/api-keys.md`).
- [ ] Visitor stats on (setup guide, "Later: visitor stats").
