# Set up your website

You can do this yourself, in about two hours, much of it waiting. Your AI walks you through every step, and you can stop any time and pick up where you left off.

**At the end:** your website is live, and an **Edit my website** button sits on your phone.

**You need:**

- An email address and a phone.
- A paid AI plan, about $20 a month. **Claude Pro** is smoothest today. (ChatGPT Plus? See Step 4.)
- Your business basics: name, phone, hours, address, what you sell. No answer yet? Say "skip it."

**A computer makes Steps 5 and 6 easier**, because those screens are big. Everything else works fine on a phone, and after setup, everything happens on your phone.

**Stuck?** Send your AI a screenshot and ask "what do I do here?" It works on every step.

## The whole trip

| Step | What | Time |
|---|---|---|
| 1 | Make two free accounts | 15 min |
| 2 | Make an empty home for your site | 2 min |
| 3 | Connect Claude to GitHub | 5 min |
| 4 | Your AI builds your site | 40 min |
| 5 | Put it on the internet | 20 min |
| 6 | Lock your live site | 15 min |
| 7 | Your Edit my website button, a first change, your site card | 25 min |

Two sittings work well: Steps 1 to 4 one day, Steps 5 to 7 another. From Step 4 on, your AI leads and tells you what to click. This page is your map.

## Step 1: Make two free accounts (15 minutes)

1. **GitHub** (where your website's files are kept): go to [github.com/signup](https://github.com/signup). Use your own email, not a helper's. GitHub emails you a code to type in. Later it will ask you to turn on two-step sign-in; your AI helps you with that at the end of setup.
2. **Cloudflare** (what puts your site on the internet): go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up), with the same email, and click the link in the email it sends you.

## Step 2: Make an empty home for your site (2 minutes)

1. Go to [github.com/new](https://github.com/new).
2. **Repository name:** your business name, lowercase, with dashes, like `maple-street-bakery`.
3. Choose **Public**. Your website is public anyway, so its files can be too, and public gets GitHub's free lock for your live site (Step 6). Only website content ever goes in it, never anything private.
4. Leave **Add a README** off. Click **Create repository**.

It's empty for now. That's right: your AI fills it in Step 4.

## Step 3: Connect Claude to GitHub (5 minutes)

1. Go to [claude.ai/code](https://claude.ai/code) and sign in with your Claude account.
2. When it asks, click **Sign in with GitHub**, then approve.
3. Let Claude work on your new repository. If Claude offers to install the **Claude GitHub App**, say yes. If it doesn't, open [this link](https://github.com/apps/claude/installations/new). Either way, choose **Only select repositories**, pick your new repository, and click **Install** (or **Save**).

Claude also makes a workspace for you called **Default**. Leave it as it is. If you see an **Auto-fix** option, leave it off.

## Step 4: Your AI builds your site (40 minutes)

1. Open this link. It opens Claude with the setup message already written:

   **[Start my website setup](https://claude.ai/code?prompt=Set%20up%20my%20new%20business%20website%20in%20this%20repository.%20Start%20by%20cloning%20https%3A%2F%2Fgithub.com%2Fdavegelinas%2Fmain-street%20and%20following%20its%20AI-SETUP.md.%20Push%20the%20first%20version%20straight%20to%20the%20main%20branch.%20I%20am%20not%20technical%3A%20one%20step%20at%20a%20time%2C%20in%20plain%20words.)**

   The message looks technical. That's fine: it's for your AI, not for you.
2. Click the repository picker **below the message box** and choose your new repository. Next to the send button, leave the mode on **Auto** or **Accept edits**, not **Plan** (Plan makes Claude stop and wait). Press send.
3. While it works, technical text scrolls by. You don't need to read it; your AI asks when it needs you.
4. Once, it sends you a link that adds a photo safety check it isn't allowed to add itself. Open it (GitHub may ask you to sign in), tap **Commit changes...**, then **Commit changes** again in the box that pops up. Tell your AI "done."
5. Answer its questions in plain words, one at a time. Have a current website or a Google listing? Your AI will ask for screenshots of it. They save you typing.
6. It also asks for 3 to 6 photos. Photos go into your site's photos folder on GitHub, not into the chat: [how to add your photos](gather-your-stuff.md#how-to-add-your-photos). No photos today? Say "later." Your site works fine without them.

Your AI copies the website into your repository, fills in your details, and writes your homepage from your answers. It keeps a checklist (`SETUP.md`), so if you stop, any later chat picks up where you left off.

<details>
<summary><b>Using ChatGPT Plus instead?</b></summary>

Go to chatgpt.com/codex, connect GitHub, give it your new repository, and create its environment (accept the defaults). Then send it this message:

```
Set up my new business website in this repository. Start by cloning https://github.com/davegelinas/main-street and following its AI-SETUP.md. Push the first version straight to the main branch. I am not technical: one step at a time, in plain words.
```

If Codex says it can't download the template, upload the files yourself with Part 2 of [browser-only.md](browser-only.md), then come back and ask Codex to run the interview and make the first version.

</details>

## Step 5: Put it on the internet (20 minutes)

Your AI tells you when it's time. If the screen doesn't match these words, send it a screenshot.

1. In Cloudflare: **Workers & Pages** → **Create application** → **Pages** → **Connect to Git** (it may say **Import an existing Git repository**). Choose **Pages**, not Workers.
2. Approve GitHub, then pick your repository.

   > **Not in the list?** ("No repositories matching") On GitHub: your picture → **Settings** → **Applications** → **Installed GitHub Apps** → **Cloudflare Workers and Pages** → **Configure** → add your repository → **Save**. Then refresh Cloudflare.
3. Fill in these settings exactly:
   - **Project name:** your business name, lowercase, with dashes. It becomes your free address: `<name>.pages.dev`.
   - **Production branch:** `main`
   - **Framework preset:** **None**. (There's no plain "Vite" choice; don't pick VitePress or React.)
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
4. Click **Save and Deploy**. In two or three minutes your site is live at `https://<name>.pages.dev`. Tell your AI the address.
5. Turn on visitor stats: your project → **Metrics** → **Enable** under Web Analytics. One click. Counting starts after your next change goes live.

Your free address is hidden from Google on purpose. It's a working site you can check and share with friends. The real launch is your own domain, later.

## Step 6: Lock your live site (15 minutes)

This is what makes "nothing goes live until you say ship it" true for everyone, your AI included. It's the fiddliest screen of the whole setup, so go slowly, and send your AI a screenshot before you click **Create**. It will check every box with you.

Your AI sends you a link to your repository's rules page (it looks like `github.com/your-name/your-site/settings/rules`; or open your repository → **Settings** → **Rules** → **Rulesets**). On a phone, first tap **aA** in Safari's address bar → **Request Desktop Website**.

1. **New ruleset** → **New branch ruleset**.
   - **Name:** `Protect live site`. **Enforcement:** Active. Leave the **bypass list empty**.
   - **Target branches:** **Add target** → **Include default branch**.
   - Keep **Restrict deletions** and **Block force pushes** checked. Check **Require a pull request before merging**, with required approvals at **0** (your "ship it" is the approval).
   - Click **Create**.
2. **General** (in the same Settings menu):
   - **Features:** turn off **Issues**, and set pull requests to **collaborators only**.
   - **Pull Requests:** leave only **Allow squash merging** checked (uncheck merge commits and rebase merging), and check **Automatically delete head branches**.
3. Last, your own account (your picture → **Settings** → **Emails**): check **Keep my email addresses private**.

## Step 7: Your Edit my website button, a first change, your site card (25 minutes)

Switch to your phone for this one, and open your setup chat in the Claude app (same account: the chat is there too).

1. Ask your AI: "Make my Edit my website button." Press and hold the link it sends, tap **Copy**, open **Safari**, paste it into the address bar, and go. (Tapping the link opens the Claude app, which can't make home-screen buttons.) If Safari asks you to sign in to Claude, do it; that's a one-time thing. Then tap **Share** → **Add to Home Screen** → **Add**. On Android, use Chrome's menu → **Add to Home screen**.
2. Tap your new button and try a small change: "Add a banner: welcome to our new website!"
3. Open the preview link your AI sends and look at the banner. Then say **"ship it."** A minute later, it's on your live site.
4. Write your site card (below). Your AI walks you through it.
5. Now say **"undo that."** A minute later the banner is gone. Now you know you can take anything back.

That's the loop from now on: say what you want, look at the preview, say "ship it."

## Your site card

First, turn on GitHub's two-step sign-in: your picture → **Settings** → **Password and authentication** → **Enable two-factor authentication**. Follow the steps, and save the **recovery codes** it shows you. They get you back in if you ever lose your phone.

Then write these down, on paper or in your phone's notes, and keep them somewhere safe:

- GitHub: username, email, and **recovery codes**.
- Cloudflare: login email.
- Your AI plan's login.
- Your website's address.
- "If something looks wrong: tell my AI **undo that**."

## Later: your own domain (30 minutes, plus some waiting)

When you're ready to launch, say to your AI: **"Walk me through connecting my domain safely."** It goes one step at a time.

- **Buying a new domain?** Cloudflare → **Domain Registration** → search and buy (about $10 to $15 a year, at cost). Then skip to "Attach it."
- **Already own one** (GoDaddy, Namecheap, Squarespace...)? It stays where it is; only its settings move to Cloudflare. If your email runs on that domain, this is the one step that can break it when rushed, so your AI starts with screenshots of every current setting. The careful version: [domains-and-dns.md](domains-and-dns.md).

**Attach it:** Cloudflare → your project → **Custom domains** → **Set up a custom domain** → your domain → **Activate**. Add the `www` version too. Then tell your AI "my domain is connected." It gets your site ready for Google and helps you tell Google it exists. Now you've launched.

## Later: business email (10 minutes)

Free forwarding, so `hello@yourbusiness.com` lands in your Gmail: Cloudflare → your domain → **Email** → **Email Routing** → enable → add your Gmail as a destination (click the link Cloudflare emails you) → create `hello@` → your Gmail.

**Already have email on your domain** (Google Workspace, Microsoft 365, or mailboxes from your registrar)? Skip this. Turning it on would take over your existing mail.

## Later: the contact form

It needs your own domain first. Then it's one free key, set up with your AI's help: [api-keys.md](api-keys.md).

## For helpers who prefer a terminal

Steps 2 and 4 can be done from a terminal instead: see [START-HERE.md](https://github.com/davegelinas/main-street/blob/main/START-HERE.md) in the toolkit, then tick boxes 1 and 2 in `SETUP.md`. **Step 3 still happens in the owner's AI account**, or their Edit my website button won't work. Steps 5 onward are the same, in the owner's accounts.

## What "done" looks like

- [ ] Your site is live at its free address, with your details.
- [ ] Your live site is locked (Step 6).
- [ ] The **Edit my website** button is on your phone, and you've shipped one change and one undo.
- [ ] GitHub's two-step sign-in is on, and your site card is written down.
- [ ] Later: your domain shows your site, and the contact form delivers a test message.
