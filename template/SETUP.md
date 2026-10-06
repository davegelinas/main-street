# Setting up this website

This checklist tracks the one-time setup. **Owner:** your AI works through it with you, one step at a time; you can stop any time and pick up later. Step-by-step clicks for every item are in [docs/setup-guide.md](docs/setup-guide.md).

**AI:** tick each box (`[x]`) as it's done. Until step 5 is done, commit the ticks straight to `main`; tick box 5 and push it right before the owner creates the lock, then confirm the lock exists (ask for a screenshot of Settings → Rules → Rulesets showing "Protect live site", Active). After the lock, never put ticks in a change the owner may undo (a revert takes the ticks with it): tick 6, 7 and 8 together in the step 7 **undo** pull request, after the site card is written. Boxes are a record, not proof: before redoing a step, check whether it's already done (ask the owner, or look: the free address loads for step 3; `gh api repos/OWNER/REPO/rulesets` or a refused push to `main` for step 5; an open pull request from an earlier session for step 7).

- [ ] **1. Site files copied** into this repository, on `main` (the default branch), including `.github/workflows/ci.yml` (if your platform can't push it, see `AI-SETUP.md` in the toolkit: the owner adds it with one link).
- [ ] **2. Interview and first version.** One question at a time:
  - Business name, what they do in one sentence, public phone, public email, address, hours.
  - Kind of business: pick the preset (`npm run preset <name>`).
  - Services and prices (optional), how they started, and what they're known for. Write every answer into `content/brand/brief.md`, then follow `rules/brand.md`.
  - **3 to 6 photos.** "Later" is fine. Send the upload message from `features/gallery.md`; then copy the photos into `public/images/` and run `npm run optimize-images`. Before the lock their upload lands straight on `main`, and the photos check adds its own commit there: `git pull` before you push.
  - A current website or Google listing? Ask for **screenshots** of it.
  - Do they already own a domain? Note it below, but leave `site.domain` empty until it's connected. If their public email is at a domain (`hello@theirbusiness.com`), someone already owns that domain: find out who before anyone buys one or turns on Email Routing.

  Then build version 1. **Nothing fake:** with no real photos, quotes, or domain yet, turn `heroPhoto`, `gallery`, `testimonials` and `contactForm` off (tap-to-call and email still show). Tell the owner the privacy and terms pages are starting templates, and remove any claim in them the owner didn't make. Write the homepage words from their answers (`rules/content.md`), `npm run build`, commit "First version of the site", push to `main`. Send direct links for anything on GitHub (`rules/deploy.md`).
- [ ] **3. Online at a free address.** Walk the owner through connecting Cloudflare Pages (setup guide, Step 5). Write the free address here: `https://_____.pages.dev`
- [ ] **4. Visitor stats on.** One click: Cloudflare → Workers & Pages → the project → Metrics → Enable. (Cloudflare adds its script on the next deployment, so stats start after the next change ships.)
- [ ] **5. Live site locked.** The GitHub ruleset and settings (setup guide, Step 6). From now on every change goes through its own preview.
- [ ] **6. Edit my website button** on the owner's phone home screen (setup guide, Step 7). When you send the link, say: "Press and hold this link, tap Copy, paste it into Safari (Chrome on Android), sign in to Claude there once, then Share → Add to Home Screen." Tapping it directly opens the Claude app, which can't make home-screen buttons. Link format for Claude: `docs/connect-your-ai.md`, "Your Edit my website button." Other AIs: a home-screen bookmark to wherever the owner starts a chat about this repository.
- [ ] **7. First change shipped, and one undo.** A small change (a welcome banner), preview link, "ship it," then "undo that" (it comes off right away, since it was the latest change).
- [ ] **8. Site card written down:** logins, two-step sign-in turned on for GitHub (Settings → Password and authentication), and its recovery codes saved somewhere safe (setup guide, "Your site card"). Do this before step 7's undo.

Domain they already own (if any): _____

## Later, when the owner is ready (optional)

- [ ] Own domain connected, and `site.domain` set (setup guide, "Later: your own domain"). This is the real launch: until then the site is hidden from Google.
- [ ] Business email forwarding (setup guide, "Later: business email").
- [ ] Contact form email (`docs/api-keys.md`).
