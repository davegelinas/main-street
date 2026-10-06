# AI-SETUP.md: instructions for the AI setting up a new site

You are an AI assistant (for example Claude Code in the cloud, or Codex in ChatGPT) working in a business owner's **new GitHub repository**: made by the **Deploy to Cloudflare** button, or empty (or holding only the README GitHub made for it). The owner asked you to set up their website from this toolkit. They are probably not technical. This file gets their site started; the site's own `SETUP.md` takes it from there.

## How to talk while you do this

Read `template/rules/beginner-mode.md` in this toolkit before your first message to the owner. Plain words, one question at a time, explain before you do, never make them feel rushed. Ask for a **screenshot** whenever they're on a website you can't see ("send me a screenshot of what you see"); you read images fine.

## How your work reaches `main`

Before the lock (`SETUP.md` step 5), setup work goes straight to `main`. Work out which kind of platform you're on, and use that path whenever this file or `SETUP.md` says "get it onto `main`":

- **You can push** (Claude Code in the cloud, for example): push to `main` yourself, even if your platform normally works on its own branch.
- **You can't push; your work leaves as a pull request the owner creates** (Codex cloud, for example): finish a batch of work, then tell the owner in one plain line to tap **Create PR**, open the pull request, and tap **Squash and merge** → **Confirm squash and merge**. Wait for "done," then `git pull` (or start a new task) so you build on what merged. Batch the work so they merge as few times as possible: Step 1 below and `SETUP.md` step 2 can be one pull request.

## Step 0: Which opening is this?

- **The repository already has `AGENTS.md`, `SETUP.md` and `wrangler.jsonc`:** the owner pressed **Deploy to Cloudflare**. It copied `template/` in, built the site, and put it on a free `workers.dev` address. You don't need this toolkit's files for this path, except to fix a missing `ci.yml`. Check that `.github/workflows/ci.yml` arrived. If it didn't: get the toolkit (Step 1, item 1, which also covers having no internet), run `cp /tmp/main-street/template/.github/workflows/ci.yml /tmp/ci.yml`, then do item 7 below for that one file. Tick `SETUP.md` box 1 (on a pull-request platform, in the pull request the owner merges) and go to Step 2.
- **The repository is empty** (or has only GitHub's README): do Step 1. The owner then connects Cloudflare by hand (`SETUP.md` box 3).

## Step 1 (empty repository only): Copy the template into their repository

1. Get this toolkit, outside their repo: `git clone --depth 1 https://github.com/davegelinas/main-street /tmp/main-street`. If `git clone` fails, try the archive: `curl -sL https://codeload.github.com/davegelinas/main-street/tar.gz/refs/heads/main | tar -xz -C /tmp && mv /tmp/main-street-main /tmp/main-street`. If you have no internet at all (Codex cloud blocks it unless the environment allows it), ask the owner to open their environment's settings and turn on **Allow Codex to access internet** with **Package managers** (that list covers github.com and the npm registry), then start a new task. If nothing works, the owner can make a fresh repository with the files already in it: the **Deploy to Cloudflare** button (the site's `docs/setup-guide.md`, Step 2).
2. Copy **everything inside** `/tmp/main-street/template/` into the root of the owner's repository, **including hidden files** (`.github/`, `.gitignore`, `.node-version`, `.dev.vars.example`). It replaces GitHub's README, which is expected. Never copy `node_modules/` or `dist/`.
3. Set `"name"` in `package.json` **and** in `wrangler.jsonc` to the repository's name (lowercase, dashes, short). The `wrangler.jsonc` name is the free address, and the owner must type exactly the same name in Cloudflare, or every build fails.
4. `npm install`, then `npm run build` to prove the copy works.
5. **Hold the CI file back.** Some AIs can't add files under `.github/workflows/` (GitHub's `workflow` permission), and a refused push refuses everything in it. Move it out of the checkout before the first commit: `mv .github/workflows/ci.yml /tmp/ci.yml`.
6. **Get the site files onto `main`.**
   - **If you can push:** `git checkout -B main && git add -A && git commit -m "Site files" && git push -u origin main`. Then confirm `git ls-remote --symref origin HEAD` shows `refs/heads/main`. If another branch is the default, ask the owner to switch it: repository **Settings** → **General** → **Default branch** → `main`.
   - **If your work leaves as a pull request:** go straight on to `SETUP.md` step 2 (the interview and first version), and have the owner merge it all as one pull request.
7. **Now the CI file.** If you can push: `mkdir -p .github/workflows && cp /tmp/ci.yml .github/workflows/ && git add .github && git commit -m "Add checks" && git push` (copy, not move: `/tmp/ci.yml` must survive for the link below). If GitHub refuses, run `git reset --hard HEAD~1` (this also removes the local copy, so the owner's version arrives cleanly). If you can't push at all, go straight to the link. Build the owner's one-tap link with exactly this, which checks that it round-trips:

   ```bash
   node -e 'const b=require("fs").readFileSync("/tmp/ci.yml","utf8");const u="https://github.com/OWNER/REPO/new/main?filename=.github/workflows/ci.yml&value="+encodeURIComponent(b);if(new URL(u).searchParams.get("value")!==b)throw "bad link";console.log(u)'
   ```

   Never use `encodeURI`: the file contains `#`, which cuts it off and commits a broken workflow. Send it as a short markdown link (`[Add the photo safety check](<the link>)`), never the raw URL. Tell the owner: GitHub may ask you to sign in first; then tap **Commit changes...** and **Commit changes** again in the box. When they say done, `git pull` and check `git ls-tree origin/main .github/workflows/ci.yml`. This file strips hidden GPS data from photos on every change, so don't skip it.
8. Tick `SETUP.md` box 1 once the site files and `ci.yml` are both on `main` (on a pull-request platform, tick it in the pull request the owner merges, after they've added the safety check).

Their repo now holds the complete site. From here on, follow **their** `AGENTS.md` and `SETUP.md`, not this toolkit.

## Step 2: Follow the site's SETUP.md

Open `SETUP.md` in the owner's repository and work through it in order, ticking each box as it's done. It covers the interview, the first version, checking the site is online, locking the live site, the owner's **Edit my website** button, and the first real change.

One exception to the site's usual rules: **until the live site is locked (SETUP.md step 5), work goes straight to `main`** (see "How your work reaches `main`" above). The site isn't public yet and there is nothing to preview against. Once the lock is on, every change goes through its own pull request like always.

Never deploy from your own environment (`wrangler deploy` and friends), even during setup: Cloudflare builds from git.

If the session ends partway (usage limits, the owner steps away), `SETUP.md` is the record. Any later session picks up at the first unchecked box.
