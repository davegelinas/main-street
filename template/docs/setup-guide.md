# Set up your website (you can do this yourself)

From nothing to a live website you update by talking. **You don't need a technical helper.** Your AI walks you through every step, and you can stop any time and pick up later where you left off. Budget **about an hour**, much of it waiting. (A helper is welcome if you have one: they follow the same steps, in your accounts.)

What you need:

- An email address and a phone, for two free accounts.
- A **paid AI plan, about $20 a month**: Claude Pro works best for setup today; ChatGPT Plus works too (see the note under Step 4). More in [connect-your-ai.md](connect-your-ai.md).
- Your business details: name, phone, hours, address, what you sell. Your AI will ask for them one at a time.

Your own domain name (about $12 a year) comes later, when you're ready to launch.

**Stuck anywhere?** Take a screenshot and send it to your AI with "what do I do here?"

## Step 1: Create two free accounts (10 minutes)

1. **GitHub** (where your website's files live): go to github.com → **Sign up**. Use your own email, not a helper's. When it offers **recovery codes**, save them; you'll write them on your site card.
2. **Cloudflare** (what puts your site on the internet): go to dash.cloudflare.com → **Sign up**, with the same email.

## Step 2: Make an empty home for your site on GitHub (2 minutes)

1. On github.com, click **+** (top right) → **New repository**.
2. **Repository name:** your business name in lowercase with dashes, like `maple-street-bakery`.
3. Choose **Public**. Your website is public anyway, and a public repository gets GitHub's free lock that protects your live site (Step 6). Nothing private ever goes in it.
4. Leave **Add a README** unchecked. Click **Create repository**.

It's empty for now. Your AI fills it in Step 4.

## Step 3: Connect Claude to GitHub (5 minutes)

1. Go to **claude.ai/code** (or the **Code** tab in the Claude phone app) and sign in.
2. When asked, click **Sign in with GitHub** and approve.
3. Let Claude work on your new repository: open `github.com/apps/claude/installations/new`, choose **Only select repositories**, pick your new repository, and save.

## Step 4: Let your AI build your site (15 minutes)

1. Open this link (it fills in the setup message for you):

   [Start my website setup](https://claude.ai/code?prompt=Set%20up%20my%20new%20business%20website%20in%20this%20repository.%20Start%20by%20cloning%20https%3A%2F%2Fgithub.com%2Fdavegelinas%2Fmain-street%20and%20following%20its%20AI-SETUP.md.%20Push%20the%20first%20version%20straight%20to%20the%20main%20branch.%20I%20am%20not%20technical%3A%20one%20step%20at%20a%20time%2C%20in%20plain%20words.)

2. Below the message box, choose your new repository. Press send.
3. Answer its questions in plain words, one at a time. Don't have an answer yet? Say "skip it." If you have a current website or a Google listing, it will ask for screenshots: they save you typing.

Your AI copies the website into your repository, fills in your details, writes your homepage from your answers, and saves the first version. It keeps a checklist (`SETUP.md`) so any later chat can continue from where you stopped. It may send you one link to tap that adds a safety file it isn't allowed to add itself: open it and tap **Commit changes**.

**Using ChatGPT Plus instead?** Go to chatgpt.com/codex, connect GitHub, give it your new repository, and create its environment (accept the defaults). Send the same message (copy it from the link above). If Codex says it can't download the template, upload the files yourself with [browser-only.md](browser-only.md) Part 2, then come back to item 3 above: ask Codex to run the interview and make the first version.

## Step 5: Put it on the internet (10 minutes)

Your AI walks you through this; send it a screenshot whenever the screen doesn't match.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Pages** (the website option) → **Import an existing Git repository** → **Connect to Git**.
2. Approve GitHub, and pick your repository.

   > **Not in the list?** ("No repositories matching") On GitHub: your picture → **Settings** → **Applications** → **Installed GitHub Apps** → **Cloudflare Workers and Pages** → **Configure** → add your repository → **Save**. Then refresh Cloudflare.
3. Settings, exactly:
   - **Project name:** your business name, lowercase with dashes. It becomes your free address: `<name>.pages.dev`.
   - **Production branch:** `main`
   - **Framework preset:** **None** (there is no plain "Vite" option; don't pick VitePress or React).
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. **Save and Deploy.** In two or three minutes your site is live at `https://<name>.pages.dev`. Tell your AI the address.
5. Turn on visitor stats: your project → **Metrics** → **Enable** under Web Analytics. One click; counting starts after your next change ships.

Your free address is hidden from Google on purpose. It's a working site you can share and check, not your launch. The launch is your own domain, later.

## Step 6: Lock your live site (5 minutes)

This makes "nothing goes live until you say ship it" true, even for an AI with full access. On GitHub, in your repository:

1. **Settings** → **Rules** → **Rulesets** → **New ruleset** → **New branch ruleset**.
   - **Name:** `Protect live site`. **Enforcement:** Active. Leave the **bypass list empty**.
   - **Target branches:** **Add target** → **Include default branch**.
   - Keep **Restrict deletions** and **Block force pushes** checked. Check **Require a pull request before merging**, with required approvals at **0** (your "ship it" is the approval).
   - Click **Create**.
2. **Settings** → **General**:
   - **Features:** turn off **Issues**, and set pull requests to **collaborators only**.
   - **Pull Requests:** leave only **Allow squash merging** checked (uncheck merge commits and rebase merging), and check **Automatically delete head branches**.
3. Your account (your picture → **Settings** → **Emails**): check **Keep my email addresses private**.

## Step 7: Your "Edit my website" button and first change (10 minutes)

1. Ask your AI: "Make my Edit my website button." It sends you a link with your site already filled in. Open it on your phone and use **Share → Add to Home Screen**.
2. Tap the new button and try a small change: "Add a banner: welcome to our new website!"
3. Open the preview link it sends. Look at the banner. Say **"ship it."** A minute later, it's on your live site.
4. Say **"undo that."** A minute later the banner is gone. Now you know you can take anything back.

That's the loop, forever: say what you want, look at the preview, say "ship it."

## Your site card

Write these down and keep them somewhere safe (your AI will remind you):

- GitHub: username, email, and **recovery codes**.
- Cloudflare: login email.
- Your AI plan's login, and where your **Edit my website** button is.
- Your live address.
- "If something looks wrong: tell my AI **undo that**."

## Later: your own domain (30 minutes + waiting)

When you're ready to launch, say to your AI: "Walk me through connecting my domain safely." It goes one step at a time:

**Buying a new one?** Cloudflare dashboard → **Domain Registration** → search and buy (about $10 to $15 a year, no markup). Then skip to "Attach it."

**Already own one somewhere else (GoDaddy, Namecheap...)?** Its settings (DNS) move to Cloudflare; you keep your registrar. This is the one step that can break your email if rushed, so your AI will:

1. Ask for **screenshots of every DNS record** at your current registrar, before anything changes.
2. Check whether your domain receives **email** (Google Workspace, Microsoft 365, or the registrar's mailboxes). Those records must come across exactly.
3. Have you turn off **DNSSEC** at the registrar if it's on (left on, the domain stops working after the move).
4. Have you **Add a domain** in Cloudflare and compare what Cloudflare imported against your screenshots.
5. Have you switch the **nameservers** at your registrar to Cloudflare's two: outside business hours if the domain already runs email or a website, any time if it doesn't.
6. Wait for Cloudflare to say **Active** (minutes to a few hours), then test email both ways.

More detail: [domains-and-dns.md](domains-and-dns.md).

**Attach it:** Cloudflare → your project → **Custom domains** → **Set up a custom domain** → your domain → **Activate**. Add the `www` version too. Then tell your AI "my domain is connected." It updates your site so Google can find it, and helps you submit it to Google Search Console. Now you've launched.

## Later: business email (10 minutes)

Free forwarding so `hello@yourbusiness.com` lands in your Gmail: Cloudflare → your domain → **Email** → **Email Routing** → enable → add your Gmail as a destination (click the link Cloudflare emails you) → create `hello@` → your Gmail.

**If your domain already has email** (Google Workspace, Microsoft 365, or mailboxes from your registrar), skip this: turning it on would take over your existing mail.

## Later: the contact form

Once your domain is connected: [api-keys.md](api-keys.md). One free key, set up with your AI's help.

## For helpers who prefer a terminal

Steps 2 and 4 can be done from a computer instead: `node scripts/new-site.mjs ../acme-plumbing` from a toolkit checkout (or copy `template/` by hand, hidden files included), then `npm install`, `npm run setup`, and push to the new public repository's `main`. Tick boxes 1 and 2 in `SETUP.md`. **Step 3 still happens in the owner's AI account**, or their Edit my website button won't work. Steps 5 onward are the same, in the owner's accounts.

## What "done" looks like

- [ ] Your site is live at your free address, with your details.
- [ ] Your live site is locked (Step 6).
- [ ] The **Edit my website** button is on your phone, and you've shipped one change and one undo.
- [ ] Your site card is written down.
- [ ] Later: your domain shows your site, and the contact form delivers a test message.
