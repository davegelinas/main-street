# Set up your website

You can do this yourself, in about two hours, much of it waiting. Your AI walks you through every step, and you can stop any time and pick up where you left off.

**At the end:** your website is live, and an **Edit my website** button sits on your phone.

**You need:**

- An email address and a phone.
- A paid AI plan, about $20 a month: **Claude Pro** or **ChatGPT Plus**. Either works. Use the one you already have.
- Your business basics: name, phone, hours, address, what you sell. No answer yet? Say "skip it."

**A computer makes Steps 2, 3 and 6 easier**, because those screens are big. Everything else works fine on a phone, and after setup, everything happens on your phone.

**Stuck?** Send your AI a screenshot and ask "what do I do here?" It works on every step.

## Claude or ChatGPT?

Most of this page is the same for both. Where they differ (Steps 3, 4 and 7), there's a part marked **Using Claude** and a part marked **Using ChatGPT**. Follow yours and skip the other.

The one everyday difference: Claude publishes a change for you when you say "ship it." On ChatGPT, you do it with a few taps: **Create PR** in ChatGPT, then **Squash and merge** on GitHub.

Using another AI, or a free plan? See [Other AIs](connect-your-ai.md#other-ais).

## The whole trip

| Step | What | Time |
|---|---|---|
| 1 | Make two free accounts | 15 min |
| 2 | Press Deploy to Cloudflare: your site's files and a free address | 10 min |
| 3 | Connect your AI to GitHub | 5 to 10 min |
| 4 | Your AI makes the site yours | 40 min |
| 5 | Check it's live, and public | 5 min |
| 6 | Lock your live site | 15 min |
| 7 | Your Edit my website button, a first change, your site card | 25 min |

Two sittings work well: Steps 1 to 4 one day, Steps 5 to 7 another. From Step 4 on, your AI leads and tells you what to click. This page is your map.

## Step 1: Make two free accounts (15 minutes)

1. **GitHub** (where your website's files are kept): go to [github.com/signup](https://github.com/signup). Use your own email, not a helper's. GitHub emails you a code to type in. Later it will ask you to turn on two-step sign-in; your AI helps you with that at the end of setup.
2. **Cloudflare** (what puts your site on the internet): go to [dash.cloudflare.com/sign-up](https://dash.cloudflare.com/sign-up), with the same email, and click the link in the email it sends you.

## Step 2: Press Deploy to Cloudflare (10 minutes)

One button makes your site's home on GitHub (a "repository": a folder that remembers every change) and puts a starter website on the internet.

1. Open this, and sign in to Cloudflare if it asks:

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/main/template)

2. **Connect GitHub** when it asks, and approve. That lets Cloudflare make the repository in your GitHub account.
3. Fill in the page:
   - **Name** (for your project and its repository): your business name, lowercase, with dashes, like `maple-street-bakery`. Short is better. It becomes your free address: `maple-street-bakery.<your-account>.workers.dev`.
   - If it offers to make the repository **private**, leave it **public**. Your website is public anyway, so its files can be too, and public gets GitHub's free lock for your live site (Step 6). Only website content ever goes in it, never anything private.
   - **CONTACT_TO_EMAIL:** the inbox where your website's contact form messages should go, usually your everyday Gmail. It's never shown on your site, and it starts delivering later, with your own domain.
   - Leave the build settings as they are.
4. Click **Create and deploy** (or **Deploy**). If Cloudflare first asks you to pick a **workers.dev subdomain**, choose something short, like your business name.

In two or three minutes a starter site is live at your free address. Copy the address; your AI will want it. The repository already holds your site's files (a README included), so Claude and ChatGPT can both open it.

## Step 3: Connect your AI to GitHub (5 to 10 minutes)

### Using Claude

1. Go to [claude.ai/code](https://claude.ai/code) and sign in with your Claude account.
2. When it asks, click **Sign in with GitHub**, then approve.
3. Let Claude work on your new repository. If Claude offers to install the **Claude GitHub App**, say yes. If it doesn't, open [this link](https://github.com/apps/claude/installations/new). Either way, choose **Only select repositories**, pick your new repository, and click **Install** (or **Save**).

Claude also makes a workspace for you called **Default**. Leave it as it is. If you see an **Auto-fix** option, leave it off.

### Using ChatGPT

Do this part on a computer if you can: ChatGPT sets up a new workspace only on its website or in its desktop app, not in the phone app.

1. Go to [chatgpt.com](https://chatgpt.com) and sign in.
2. Open **Settings** → **Codex Cloud** → **Environments** → **Create environment**. (Or start a new Codex task and choose **Work in** → **Cloud** → **Select environment** → **Create environment**.)
3. Select your new repository. If it asks you to **Connect GitHub**, approve, choose **Only select repositories**, and pick your new repository.
4. Click **Get started**. Codex looks at your repository and gets a workspace ready.
5. Let it reach GitHub and the building tools: in the environment's settings, turn on **Allow Codex to access internet**, and under **Allow domains** choose **Package managers**. That list covers GitHub, where your website template lives, and the usual places building tools come from. The rest of the internet stays closed.
6. Click **Publish** and wait for **Environment published**.

## Step 4: Your AI makes the site yours (40 minutes)

### Using Claude

1. Open this link. It opens Claude with the setup message already written:

   **[Start my website setup](https://claude.ai/code?prompt=Set%20up%20my%20new%20business%20website%20in%20this%20repository.%20I%20made%20it%20with%20the%20Deploy%20to%20Cloudflare%20button.%20Follow%20AI-SETUP.md%20from%20https%3A%2F%2Fgithub.com%2Fdavegelinas%2Fmain-street%2C%20then%20this%20repository's%20SETUP.md.%20Push%20the%20first%20version%20straight%20to%20the%20main%20branch.%20I%20am%20not%20technical%3A%20one%20step%20at%20a%20time%2C%20in%20plain%20words.)**

   The message looks technical. That's fine: it's for your AI, not for you.
2. Click the repository picker **below the message box** and choose your new repository. Next to the send button, leave the mode on **Auto** or **Accept edits**, not **Plan** (Plan makes Claude stop and wait). Press send.

Claude saves its work to your repository by itself as it goes.

### Using ChatGPT

1. Click **Start a new task** in the environment you just published.
2. Copy this message, paste it in, and send it. (If you see **Ask** and **Code** buttons, choose **Code**.)

   ```
   Set up my new business website in this repository. I made it with the Deploy to Cloudflare button. Follow AI-SETUP.md from https://github.com/davegelinas/main-street, then this repository's SETUP.md. I am not technical: one step at a time, in plain words.
   ```

   It looks technical. That's fine: it's for your AI, not for you.

ChatGPT doesn't save to your site by itself. When Codex says a change is ready (your first version, for example), tap **Create PR** (it may say **Open pull request**), open that pull request on GitHub, and tap **Squash and merge** → **Confirm squash and merge**. Until your site is locked in Step 6, do that as soon as Codex says it's ready: there's nothing to check yet.

### Then, for everyone

1. While it works, technical text scrolls by. You don't need to read it; your AI asks when it needs you.
2. If the button's copy is missing the photo safety check, your AI sends you one link that adds it (it isn't allowed to add that file itself). Open it (GitHub may ask you to sign in), tap **Commit changes...**, then **Commit changes** again in the box that pops up. Tell your AI "done."
3. Answer its questions in plain words, one at a time. Have a current website or a Google listing? Your AI will ask for screenshots of it. They save you typing.
4. It also asks for 3 to 6 photos. Photos go into your site's photos folder on GitHub, not into the chat: [how to add your photos](gather-your-stuff.md#how-to-add-your-photos). No photos today? Say "later." Your site works fine without them.

Your AI fills in your details and writes your homepage from your answers. Every time a change lands on `main`, Cloudflare rebuilds your free address by itself. It keeps a checklist (`SETUP.md`), so if you stop, any later chat picks up where you left off.

If your AI can't open the toolkit link in its message, that's fine: your repository already holds everything, and `SETUP.md` is the checklist.

## Step 5: Check it's live, and public (5 minutes)

Your AI tells you when it's time.

1. Open your free address on your phone. You should see your business name and your words, not the starter text. (Still the starter? Wait two minutes and reload.)
2. On GitHub, open your repository. Next to its name it should say **Public**. If it says **Private**: **Settings** → **General** → at the bottom, **Change visibility** → **Change to public**. Step 6's free lock needs it.
3. Tell your AI the free address, if you haven't.

Your free address is hidden from Google on purpose. It's a working site you can check and share with friends. The real launch is your own domain, later. (Visitor stats come with the domain too.)

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

Switch to your phone for this one, and open your setup chat in your AI's phone app (same account: the chat is there too). On ChatGPT, that's **Codex** in the ChatGPT app.

1. Ask your AI: "Make my Edit my website button." It sets up a page on your site just for you, with one big button that opens your AI. It arrives as a change to approve: say **"ship it"** (on ChatGPT: **Create PR**, then **Squash and merge**). Then open **Safari** and go to your site's address with **/edit/** on the end (your AI tells you the exact address, like `maplestreetbakery.com/edit/`). Tap **Share** → **Add to Home Screen** → **Add**. On Android, open it in Chrome and use the menu → **Add to Home screen**. The first time you use the button, Safari may ask you to sign in to your AI; that's a one-time thing.
2. Tap your new button and try a small change: "Add a banner: welcome to our new website!" (On ChatGPT, pick your website's environment first if it asks.)
3. Look at the preview, then ship it:
   - **Using Claude:** open the preview link Claude sends, look at the banner, and say **"ship it."**
   - **Using ChatGPT:** when Codex finishes, tap **Create PR** and open the pull request. Within a minute or two, Cloudflare adds a comment there with a **preview link**: open it and look at the banner. To ship it, tap **Squash and merge** → **Confirm squash and merge**.

   A minute later, it's on your live site.
4. Write your site card (below). Your AI walks you through it.
5. Now say **"undo that."** (On ChatGPT, when Codex has the undo ready, tap **Create PR**, then **Squash and merge**.) A minute later the banner is gone. Now you know you can take anything back.

That's the loop from now on: say what you want, look at the preview, ship it.

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

Your site can only use a domain whose settings (its "nameservers") are on Cloudflare. Buying it from Cloudflare does that by itself; for a domain bought elsewhere, moving them is part of the careful version above. Won't move them? [keep-your-dns.md](keep-your-dns.md).

**Attach it:** Cloudflare → **Workers & Pages** → your site → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → your domain → **Add domain**. Add the `www` version too. Then your domain → **SSL/TLS** → **Edge Certificates** → turn on **Always Use HTTPS**. Tell your AI "my domain is connected." It gets your site ready for Google and helps you tell Google it exists. Now you've launched.

## Later: business email and the contact form (10 minutes)

Free forwarding, so `hello@yourbusiness.com` lands in your Gmail. The same switch turns on your contact form: Cloudflare → **Compute** → **Email Service** → **Email Routing** → your domain → enable → add your Gmail as a destination (click the link Cloudflare emails you) → create `hello@` → your Gmail. Use the same inbox you typed as CONTACT_TO_EMAIL in Step 2 (or ask your AI to change that). Then tell your AI "Email Routing is on": it switches your contact form on, and you send yourself a test message.

**Already have email on your domain** (Google Workspace, Microsoft 365, or mailboxes from your registrar)? Don't turn it on for your domain: it would take over your existing mail. Your AI can set the contact form up on a separate subdomain instead: [api-keys.md](api-keys.md).

## Later: visitor stats (2 minutes)

Free, cookieless, nothing to install: Cloudflare → **Web Analytics** → **Add a site** → pick your domain → **Done**. Cloudflare adds its counting script to your pages by itself.

## For helpers who prefer a terminal

Steps 2 and 4 can be done from a terminal instead: see [START-HERE.md](https://github.com/davegelinas/main-street/blob/main/START-HERE.md) in the toolkit, then tick boxes 1 and 2 in `SETUP.md`. **Step 3 still happens in the owner's AI account**, or their Edit my website button won't work. Steps 5 onward are the same, in the owner's accounts. Never deploy from your own machine (`wrangler deploy`): Cloudflare builds from git.

## What "done" looks like

- [ ] Your site is live at its free address, with your details.
- [ ] Your live site is locked (Step 6).
- [ ] The **Edit my website** button is on your phone, and you've shipped one change and one undo.
- [ ] GitHub's two-step sign-in is on, and your site card is written down.
- [ ] Later: your domain shows your site, and the contact form delivers a test message.
