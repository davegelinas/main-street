# AI-SETUP.md: instructions for the AI setting up a new site

You are an AI assistant (for example Claude in the cloud) working in a business owner's **new, empty GitHub repository**. The owner asked you to set up their website from this toolkit. They are probably not technical. This file gets their site started; the site's own `SETUP.md` takes it from there.

## How to talk while you do this

Read `template/rules/beginner-mode.md` in this toolkit before your first message to the owner. Plain words, one question at a time, explain before you do, never make them feel rushed. Ask for a **screenshot** whenever they're on a website you can't see ("send me a screenshot of what you see"); you read images fine.

## Step 1: Copy the template into their repository

1. Clone this toolkit somewhere outside their repo: `git clone --depth 1 https://github.com/davegelinas/main-street /tmp/main-street`.
2. Copy **everything inside** `/tmp/main-street/template/` into the root of the owner's repository, **including hidden files** (`.github/`, `.gitignore`, `.node-version`). Never copy `node_modules/` or `dist/`.
3. Set `"name"` in `package.json` to the repository's name (lowercase, dashes).
4. `npm install`, then `npm run build` to prove the copy works.
5. **Hold the CI file back.** Some cloud AIs can't push files under `.github/workflows/` (GitHub's `workflow` permission), and a refused push refuses everything in it. Move it out of the checkout before the first commit: `mv .github/workflows/ci.yml /tmp/ci.yml`.
6. **Push to `main`, first.** The repository is empty, and the first branch pushed becomes its default branch, which Cloudflare and GitHub's lock both rely on: `git checkout -B main && git add -A && git commit -m "Site files" && git push -u origin main`. Then confirm `git ls-remote --symref origin HEAD` shows `refs/heads/main`. If another branch got there first, ask the owner to switch the default: repository **Settings** → **General** → **Default branch** → `main`.
7. **Now the CI file.** `mkdir -p .github/workflows && mv /tmp/ci.yml .github/workflows/ && git add .github && git commit -m "Add checks" && git push`. If GitHub refuses, run `git reset --hard HEAD~1` (this also removes the local copy, so the owner's version arrives cleanly), then build the owner's one-tap link with exactly this, which checks that it round-trips:

   ```bash
   node -e 'const b=require("fs").readFileSync("/tmp/ci.yml","utf8");const u="https://github.com/OWNER/REPO/new/main?filename=.github/workflows/ci.yml&value="+encodeURIComponent(b);if(new URL(u).searchParams.get("value")!==b)throw "bad link";console.log(u)'
   ```

   Never use `encodeURI`: the file contains `#`, which cuts it off and commits a broken workflow. Send it as a short markdown link (`[Add the photo safety check](<the link>)`), never the raw URL. Tell the owner: GitHub may ask you to sign in first; then tap **Commit changes...** and **Commit changes** again in the box. When they say done, `git pull` and check `git ls-tree origin/main .github/workflows/ci.yml`. This file strips hidden GPS data from photos on every change, so don't skip it.
8. Tick `SETUP.md` box 1 once the site files and `ci.yml` are both on `main`.

Their repo now holds the complete site. From here on, follow **their** `AGENTS.md` and `SETUP.md`, not this toolkit.

## Step 2: Follow the site's SETUP.md

Open `SETUP.md` in the owner's repository and work through it in order, ticking each box as it's done. It covers the interview, the first version, putting the site online, locking the live site, the owner's **Edit my website** button, and the first real change.

One exception to the site's usual rules: **until the live site is locked (SETUP.md step 5), commit straight to `main`**, even if your platform normally works on its own branch. The site isn't public yet and there is nothing to preview against. Once the lock is on, every change goes through its own pull request like always.

If the session ends partway (usage limits, the owner steps away), `SETUP.md` is the record. Any later session picks up at the first unchecked box.
