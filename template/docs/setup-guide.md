# Set up your website (you can do this yourself)

From nothing to a live website you update by talking. **You don't need a technical helper.** One button puts a starter site online; then your AI interviews you and makes it yours. You can stop any time and pick up later where you left off. Budget **about an hour**, much of it waiting. (A helper is welcome if you have one: they follow the same steps, in your accounts.)

What you need:

- An email address and a phone, for two free accounts.
- A **paid AI plan, about $20 a month**: Claude Pro or ChatGPT Plus both work. More in [connect-your-ai.md](connect-your-ai.md).
- Your business details: name, phone, hours, address, what you sell. Your AI will ask for them one at a time.

Your own domain name (about $12 a year) comes later, when you're ready to launch.

**Stuck anywhere?** Take a screenshot and send it to your AI with "what do I do here?"

## Step 1: Create two free accounts (10 minutes)

1. **GitHub** (where your website's files live): go to github.com → **Sign up**. Use your own email, not a helper's. When it offers **recovery codes**, save them; you'll write them on your site card.
2. **Cloudflare** (what puts your site on the internet): go to dash.cloudflare.com → **Sign up**, with the same email.

## Step 2: Press "Deploy to Cloudflare" (5 minutes, then a few minutes of waiting)

1. Open this button's link and sign in to Cloudflare if asked:

   [![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/main/template)

2. **Connect GitHub** when it asks, and approve. (This lets Cloudflare make your site's repository in your GitHub account.)
3. Fill in the page:
   - **Name** (for the project and the repository): your business name in lowercase with dashes, like `maple-street-bakery`. Keep it short. It becomes your free address: `maple-street-bakery.<your-account>.workers.dev`.
   - If there's a choice to make the repository **private**, leave it **public**. Your website is public anyway, and a public repository gets GitHub's free lock that protects your live site (Step 6). Nothing private ever goes in it.
   - **CONTACT_TO_EMAIL:** the inbox where your website's contact form messages should go, usually your everyday Gmail. It's never shown on your site. (It starts delivering later, when your domain is connected.)
   - Leave the build settings as they are.
4. Click **Create and deploy** (or **Deploy**). In two or three minutes your site is live at its free address. Copy that address; your AI will want it.

If Cloudflare asks you to choose a **workers.dev subdomain** first, pick something short like your business name. It becomes part of every free address.

Your free address is hidden from Google on purpose. It's a working site you can share and check, not your launch. The launch is your own domain, later.

## Step 3: Check it's public (1 minute)

On github.com, open your new repository (your picture → **Your repositories**). Next to its name it should say **Public**. If it says **Private**: **Settings** → **General** → scroll to the bottom → **Change visibility** → **Change to public**, and confirm.

## Step 4: Connect your AI to GitHub (5 minutes)

**Claude:**

1. Go to **claude.ai/code** (or the **Code** tab in the Claude phone app) and sign in.
2. When asked, click **Sign in with GitHub** and approve.
3. Let Claude work on your new repository: open `github.com/apps/claude/installations/new`, choose **Only select repositories**, pick your new repository, and save.

**ChatGPT:** go to **chatgpt.com/codex**, connect GitHub, give it your new repository, and create its environment (accept the defaults).

## Step 5: Let your AI make it yours (15 minutes)

1. Open this link (it fills in the setup message for you):

   [Start my website setup](https://claude.ai/code?prompt=Set%20up%20my%20new%20business%20website.%20I%20just%20made%20this%20repository%20with%20the%20Deploy%20to%20Cloudflare%20button.%20Read%20AGENTS.md%2C%20then%20work%20through%20SETUP.md%20with%20me.%20Push%20the%20first%20version%20straight%20to%20the%20main%20branch.%20I%20am%20not%20technical%3A%20one%20step%20at%20a%20time%2C%20in%20plain%20words.)

   Using ChatGPT or another AI? Send it this message, with your new repository selected:

   ```
   Set up my new business website. I just made this repository with the
   Deploy to Cloudflare button. Read AGENTS.md, then work through SETUP.md
   with me. Push the first version straight to the main branch. I am not
   technical: one step at a time, in plain words.
   ```

2. Below the message box, choose your new repository. Press send.
3. Answer its questions in plain words, one at a time. Don't have an answer yet? Say "skip it." If you have a current website or a Google listing, it will ask for screenshots: they save you typing.

Your AI fills in your details, writes your homepage from your answers, and saves the first version. A minute or two later, your free address shows your real site. It keeps a checklist (`SETUP.md`) so any later chat can continue from where you stopped.

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
4. Say **"undo that,"** check the preview, say "ship it" again. Now you know you can take anything back.

That's the loop, forever: say what you want, look at the preview, say "ship it."

## Your site card

Write these down and keep them somewhere safe (your AI will remind you):

- GitHub: username, email, and **recovery codes**.
- Cloudflare: login email.
- Your AI plan's login, and where your **Edit my website** button is.
- Your live address.
- "If something looks wrong: tell my AI **undo that**."

## Later: your own domain (30 minutes + waiting)

When you're ready to launch, say to your AI: "Walk me through connecting my domain safely." It goes one step at a time.

Your site runs on Cloudflare, and Cloudflare can only attach your domain to it when Cloudflare also runs the domain's DNS (its "nameservers"). Buying the domain from Cloudflare does that automatically.

**Buying a new one?** Cloudflare dashboard → **Domain Registration** → search and buy (about $10 to $15 a year, no markup). Then skip to "Attach it."

**Already own one somewhere else (GoDaddy, Namecheap...)?** Its DNS moves to Cloudflare; you keep your registrar. This is the one step that can break your email if rushed, so your AI will:

1. Ask for **screenshots of every DNS record** at your current registrar, before anything changes.
2. Check whether your domain receives **email** (Google Workspace, Microsoft 365, or the registrar's mailboxes). Those records must come across exactly.
3. Have you turn off **DNSSEC** at the registrar if it's on (left on, the domain stops working after the move).
4. Have you **Add a domain** in Cloudflare and compare what Cloudflare imported against your screenshots.
5. Have you switch the **nameservers** at your registrar to Cloudflare's two, outside business hours.
6. Wait for Cloudflare to say **Active** (minutes to a few hours), then test email both ways.

More detail, including what to do if you'd rather not move your nameservers: [domains-and-dns.md](domains-and-dns.md).

**Attach it:** Cloudflare → **Workers & Pages** → your site → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → type your domain → **Add domain**. Do it again for the `www` version. Then your domain → **SSL/TLS** → **Edge Certificates** → turn on **Always Use HTTPS**. Tell your AI "my domain is connected." It updates your site so Google can find it, and helps you submit it to Google Search Console. Now you've launched.

## Later: business email and the contact form (10 minutes)

Free forwarding so `hello@yourbusiness.com` lands in your Gmail, and the same switch turns on your contact form:

1. Cloudflare dashboard → **Compute** → **Email Service** → **Email Routing** → pick your domain → enable. (Menus move around; if you can't find it, send your AI a screenshot.)
2. Add your everyday inbox as a **destination address**, and click the link Cloudflare emails you. Use the same inbox you typed for CONTACT_TO_EMAIL in Step 2 (your AI can change that setting if you'd rather use another).
3. Create `hello@` → your inbox.
4. Send yourself a test message from your website's contact form. It should arrive within a minute (check spam the first time).

**If your domain already has email** (Google Workspace, Microsoft 365, or mailboxes from your registrar), don't turn on Email Routing for it: it would take over your existing mail. Your AI can set the contact form up on a separate subdomain instead, which leaves your email alone. Details: [api-keys.md](api-keys.md).

## Later: visitor stats

Free and cookieless, no banner needed. See [api-keys.md](api-keys.md), "Visitor stats." Two minutes with your AI.

## If the Deploy button doesn't work for you

You can do the same thing in two parts:

1. Make an empty **public** repository on GitHub (**+** → **New repository**, no README), connect your AI to it (Step 4), and send it: "Set up my new business website in this repository. Start by cloning https://github.com/davegelinas/main-street and following its AI-SETUP.md." It copies the site in.
2. Cloudflare → **Workers & Pages** → **Create application** → **Import a repository** → pick your repository. The **project name** must be exactly the name your AI put in `wrangler.jsonc` (it will tell you). Leave the build and deploy commands as Cloudflare suggests (`npm run build`, `npx wrangler deploy`), and **Deploy**.

   > **Repository not in the list?** On GitHub: your picture → **Settings** → **Applications** → **Installed GitHub Apps** → **Cloudflare Workers and Pages** → **Configure** → add your repository → **Save**. Then refresh Cloudflare.

Then add your contact form inbox: your site → **Settings** → **Variables and Secrets** → **Add** → type **Secret**, name `CONTACT_TO_EMAIL`, value your inbox → **Deploy**. Continue with Step 6.

## For helpers who prefer a terminal

The Deploy button is still the easiest start, even for you. If you'd rather scaffold by hand: `node scripts/new-site.mjs ../acme-plumbing` from a toolkit checkout (or copy `template/` by hand, hidden files included), then `npm install`, `npm run setup` (the scaffolder names the site in `wrangler.jsonc` after the folder; if you copied by hand, set `name` there yourself), push to the new public repository's `main`, and connect it in Cloudflare as in "If the Deploy button doesn't work for you." Tick boxes 1 and 2 in `SETUP.md`. **Step 4 still happens in the owner's AI account**, or their Edit my website button won't work. Steps 6 onward are the same, in the owner's accounts. Never deploy from your machine (`wrangler deploy`): deploys come from git.

## What "done" looks like

- [ ] Your site is live at your free address, with your details.
- [ ] Your live site is locked (Step 6).
- [ ] The **Edit my website** button is on your phone, and you've shipped one change and one undo.
- [ ] Your site card is written down.
- [ ] Later: your domain shows your site, and the contact form delivers a test message.
