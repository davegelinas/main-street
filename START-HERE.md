# START HERE

**Setting up your own business's website?** You don't need this page or a terminal. Follow the [setup guide](template/docs/setup-guide.md): two free accounts, one **Deploy to Cloudflare** button, and your AI does the rest with you (about an hour).

This page is for **helpers who prefer a terminal**: an agency, a freelancer, or a tech-savvy friend setting a site up in the owner's accounts. (The Deploy button is still the easiest start, even for you.) If a step confuses you, ask your AI: "walk me through this step."

## 0. Understand what this is

This toolkit is the **generator**. It holds a pristine site template and a scaffolder script. You use it to create one **customer site**: a separate folder (and its own GitHub repository) that belongs to the business. The owner lives in their site with their AI; they never see this toolkit.

## 1. Create the site (2 minutes)

From this toolkit folder:

```bash
node scripts/new-site.mjs ../acme-plumbing
```

The `../` matters: the site lives **next to** the toolkit, not inside it, so it can become its own repository. The script copies the template, names everything, verifies the copy, and initializes git. It refuses to overwrite a non-empty folder without `--force`, refuses to build inside the toolkit folder, and never touches the network.

## 2. Make it theirs (10 minutes)

```bash
cd ../acme-plumbing
npm install
npm run setup
```

The wizard asks plain questions (business name, phone, email, address, domain, kind of business) and configures everything. No domain yet? Press Enter: the site starts on a free address. The scaffolder already set `"name"` in `wrangler.jsonc` to the folder name: it becomes the free address and must match the name typed in Cloudflare, so keep the folder name short.

Check it with `npm run dev` (usually http://localhost:5173), or `npm run serve` to run it exactly the way Cloudflare will (no login needed). Then tick box 2 in the site's `SETUP.md`.

## 3. Put it on GitHub, in the owner's account (5 minutes)

Create the repository at github.com/new as the owner: same name as the folder, **Public**, no README. Then:

```bash
git branch -M main
git commit -m "First version of the site"
git remote add origin https://github.com/OWNER/REPO.git
git push -u origin main
```

## 4. Finish setup with the owner (30 minutes)

Follow the site's `docs/setup-guide.md` in the owner's accounts, with the owner beside you:

- **"If the Deploy button doesn't work for you," part 2:** import the repository in Cloudflare (Workers & Pages → Create application → Import a repository, same name as `wrangler.jsonc`), then add the `CONTACT_TO_EMAIL` secret. Tick box 1.
- **Step 4:** connect the owner's AI to GitHub.
- **Step 6:** lock the live site (GitHub ruleset and settings).
- **Step 7:** make the owner's **Edit my website** button, and have the owner ship one change and one undo themselves.
- **Your site card:** make sure the owner writes down their logins and recovery codes.

The owner's domain, business email (which also turns on the contact form), and visitor stats are in the same guide under "Later," whenever they're ready. Never `wrangler deploy` from your machine: deploys come from git.

## If something looks wrong

1. Don't panic. Nothing here can send anyone a bill, and almost nothing is irreversible.
2. Ask the AI: "what just changed, and how do we undo it?" Then say "undo that."
3. Live site broken right now? Emergency brake: Cloudflare dashboard → Workers & Pages → the site → Deployments → the last good one → **Rollback**. Then have the AI revert the bad change too, or the next "ship it" publishes it again.

---

Full honest cost breakdown: [docs/the-12-dollar-stack.md](docs/the-12-dollar-stack.md). The adversarial review of this whole system: [docs/pressure-test.md](docs/pressure-test.md).
