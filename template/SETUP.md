# Setting up this website

This checklist tracks the one-time setup. **Owner:** your AI works through it with you, one step at a time; you can stop any time and pick up later. Step-by-step clicks for every item are in [docs/setup-guide.md](docs/setup-guide.md).

**AI:** tick each box (`[x]`) as it's done. Until step 5 is done, commit the ticks straight to `main`; tick box 5 and push it right before the owner creates the lock, then confirm the lock exists (ask for a screenshot of Settings → Rules → Rulesets showing "Protect live site", Active). After the lock, record ticks in the next pull request you open (the first-change one in step 7 is the natural place), so they land when the owner ships it. Boxes are a record, not proof: before redoing a step, check whether it's already done (ask the owner, or look: the free address loads for step 3; `gh api repos/OWNER/REPO/rulesets` or a refused push to `main` for step 5; an open pull request from an earlier session for step 7).

- [x] **1. Site files copied** into this repository, on `main` (the default branch), including `.github/workflows/ci.yml` (if your platform can't push it, see `AI-SETUP.md` in the toolkit: the owner adds it with one link).
- [ ] **2. Interview and first version.** Ask, one question at a time: business name, what you do in one sentence, public phone, public email, address, hours, kind of business (pick the preset: `npm run preset <name>`), services and prices (optional). Ask whether they have a current website or Google listing, and if so ask for **screenshots** of it. Ask whether they already own a domain, and note it below, but leave `site.domain` empty until the domain is connected. Fill in `site.config.json`, write the homepage words from their answers (`rules/content.md`), `npm run build`, commit "First version of the site", push to `main`.
- [ ] **3. Online at a free address.** Walk the owner through connecting Cloudflare Pages (setup guide, Step 5). Write the free address here: `https://_____.pages.dev`
- [ ] **4. Visitor stats on.** One click: Cloudflare → Workers & Pages → the project → Metrics → Enable. (Cloudflare adds its script on the next deployment, so stats start after the next change ships.)
- [ ] **5. Live site locked.** The GitHub ruleset and settings (setup guide, Step 6). From now on every change goes through its own preview.
- [ ] **6. Edit my website button** on the owner's phone home screen (setup guide, Step 7). Link format for Claude: `docs/connect-your-ai.md`, step 5. Other AIs: a home-screen bookmark to wherever the owner starts a chat about this repository.
- [ ] **7. First change shipped, and one undo.** A small change (a welcome banner), preview link, "ship it," then "undo that" and "ship it" again.
- [ ] **8. Site card written down:** logins and GitHub recovery codes, kept somewhere safe (setup guide, "Your site card").

Domain they already own (if any): _____

## Later, when the owner is ready (optional)

- [ ] Own domain connected, and `site.domain` set (setup guide, "Your own domain"). This is the real launch: until then the site is hidden from Google.
- [ ] Business email forwarding (setup guide, "Business email").
- [ ] Contact form email (`docs/api-keys.md`).
