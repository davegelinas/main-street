# The browser-only path: from a ChatGPT or Claude account to a live site

This is the path for when your AI **can't make changes itself**: a free plan, or a plain chat window (claude.ai or chatgpt.com) that can't touch your files. If you have a paid AI plan (about $20 a month), the faster way is [setup-guide.md](setup-guide.md), where your AI does the clicking for you. This path is the slower rescue: you do the clicks, and the AI tells you exactly which ones.

You need only a chat AI account and a web browser. No terminal, no installs, no code editor, no helper. Every step is written out; nothing is skipped, because a skipped step is where people get lost.

What you will have at the end: a live business website at your own address, which you update by chatting and clicking buttons on websites.

What you will never do: type a command, install a program, or write code. You will click buttons on the GitHub and Cloudflare websites. That is the whole toolkit.

Time: about two hours the first time, unhurried.

---

## Part 1: The three accounts (15 minutes)

You need three free accounts. You already have the first.

**1. Your AI.** Your Claude or ChatGPT account. Done.

**2. GitHub** (where your website's files live). Go to github.com, click **Sign up**, and follow the steps. Confirm your email when it arrives. Pick any username; it barely matters.

**3. Cloudflare** (the service that puts your site on the internet). Go to dash.cloudflare.com, click **Sign up**, and follow the steps. Confirm your email when it arrives.

Write your three logins somewhere safe. You will sign in to GitHub and Cloudflare several times today.

---

## Part 2: Put your starter site online with one button (10 minutes)

One button makes your site's repository on GitHub (think of a repository as a folder with a memory: it remembers every change) and puts a starter website on the internet. You'll make it yours in the next parts.

**Step 1: Press the button.** Open this link, and sign in to Cloudflare if asked:

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/davegelinas/main-street/tree/main/template)

**Step 2: Connect GitHub.** When Cloudflare asks to connect GitHub, approve it. This lets Cloudflare create your site's repository in your GitHub account.

**Step 3: Fill in the page.**

- **Name** (for the project and the repository): your business name, all lowercase with dashes. Example: `maple-street-bakery`. Keep it short. It becomes your free web address: `maple-street-bakery.<your-account>.workers.dev`.
- If there's a choice to make the repository **private**, leave it **public**. Your website is public anyway, and only a public repository gets GitHub's free lock that protects your live site (Part 7). Nothing private ever goes in it.
- **CONTACT_TO_EMAIL:** the inbox where your contact form messages should go (usually your everyday Gmail). It is never shown on your site.
- Leave the build settings as they are.

If Cloudflare first asks you to choose a **workers.dev subdomain**, pick something short like your business name.

**Step 4: Deploy and wait.** Click **Create and deploy** (or **Deploy**). Cloudflare builds your site (two or three minutes). When it's done, it shows your free address. Write it down: this is your website for now.

**Step 5: Check your repository.** On github.com, click your picture → **Your repositories** → your new repository.

- Next to its name it should say **Public**. If it says **Private**: **Settings** → **General** → scroll to the bottom → **Change visibility** → **Change to public**.
- In the file list you should see a folder named **`.github`** (with a dot in front). It runs automatic safety checks on your changes. If it's missing, tell your AI in Part 3; it will give you one link that adds it.

**A word about the checks.** After each save, GitHub runs an automatic check on your files, and Cloudflare rebuilds your site. A green check mark means everything is fine. A red X means something in the files is broken. Do not panic: copy the error text into your chat and your AI will hand you the fix. Most fixes are one paste.

During setup, saving straight to `main` (the live copy) is fine; Part 7 locks it.

---

## Part 3: Introduce your AI to your site (5 minutes)

Your AI has not seen your site yet. Give it the site's operating manual, then tell it your situation in one message.

**Step 1: Start a new conversation** at claude.ai or chatgpt.com.

**Step 2: Attach three files.** First download them from your repository: on github.com, open each file below, then click the **Download raw file** button (a small arrow pointing down, above the file's text). Then click the **paperclip** (attach) button in the chat box and upload all three:

- `AGENTS.md`
- `rules/beginner-mode.md`
- `rules/deploy.md`

(`AGENTS.md` is the operating manual your site carries for any AI. Your AI will read all three. If it ever needs another file from the `rules/` folder later, it will ask you to attach that one too.)

**Step 3: Send this message.** Copy and paste it exactly:

```
I just made my new business website with the Deploy to Cloudflare
button. I only have this browser chat: I cannot run commands, install
anything, or use a terminal. For every task, give me steps I can do in
the browser on github.com, with the complete text to copy and paste.
Never ask me to run a command.

Start by interviewing me for the site setup, one question at a time: business
name, tagline, address, phone, email, hours, services, prices, and anything
else site.config.json needs. When you have asked everything, first ask me to
open site.config.json on GitHub and paste its current contents here, so your
version keeps every section and key exactly as the template has them. Do not
invent, rename, or drop any keys. Then output the complete site.config.json
file for me to paste into GitHub.
```

---

## Part 4: Answer the setup questions, paste the config (20 minutes)

**Step 1: Answer the AI's questions.** It will ask one at a time, in plain words. Answer in plain words. For anything you don't have yet, say "skip it, I'll add it later." Nothing here is permanent.

**Step 2: Copy the AI's output.** When the questions are done, the AI will output the complete `site.config.json` file: a big block of text starting with `{` and ending with `}`. Copy the entire block.

**Step 3: Paste it into GitHub.**

1. Go to your repository on github.com. (Saving straight to `main` is fine during setup, before the lock in Part 7.)
2. Click the file **`site.config.json`**.
3. Click the **pencil icon** (Edit this file) at the top right.
4. Click inside the text box, select everything (Ctrl+A or Cmd+A), and paste (Ctrl+V or Cmd+V) the AI's text over it.
5. Click **Commit changes** (green button). Leave the defaults.

**Step 4: Tell the AI "done."** It may ask you to paste the file back so it can double-check; if it does, open the file on GitHub, copy the text, and paste it into the chat.

---

## Part 5: Add your photos (15 minutes)

Real photos beat everything. Use your phone.

**Step 1: Pick 5 to 10 photos.** Storefront, interior, your work, your team. The best photos are bright and simple. Use JPG or PNG photos: iPhones sometimes save photos as HEIC, which websites cannot display. To switch, open iPhone **Settings** → **Camera** → **Formats** → **Most Compatible** (new photos will be JPG).

**Location tip:** your repository is public, and phone photos can carry the GPS spot where they were taken. Before you upload, hide it: in your Photos app, open each photo, swipe up, tap **Adjust** next to the little map, and choose **No Location**. (An automatic check also strips it before anything reaches your live site, but the original you upload stays in your site's public history.)

**Step 2: Upload them.**

1. On github.com, in your repository, click through to the folder **`content/brand/photos/`**.
2. Click **Add file**, then **Upload files**.
3. Drag your photos in from your phone or computer. (If a photo is over 25 MB, shrink it first; phone photos are usually fine.)
4. Tap the green button at the bottom (**Commit changes**, or **Propose changes** once your site is locked). If the next page says **Create pull request**, tap that too.

**Step 3: Tell the AI.** Go back to the chat and say: "I uploaded my photos to content/brand/photos. Here are the filenames: ..." (list what you uploaded). The AI will tell you exactly what to paste and where so the photos appear on the site (in the page markup, `index.html`).

---

## Part 6: See your site (2 minutes)

Every time you saved a file to `main` in Parts 4 and 5, Cloudflare rebuilt your site by itself. Open your free address (from Part 2) on your phone. You should see your business name, your hours, your photos.

- **Still the starter text?** Give it two minutes and reload, or open it in a private/incognito window.
- **Still not right?** In Cloudflare: **Workers & Pages** → your site → **Deployments**. If the newest build has a red mark, open it, copy the red error lines, and paste them to your AI.

Your free `workers.dev` address is hidden from Google on purpose. It is a working site you can check and share, not your launch. The launch is your own domain, later (Part 10).

---

## Part 7: Lock your live site (5 minutes)

This makes "nothing goes live until you say ship it" true. Do **[Step 6 of the setup guide](setup-guide.md#step-6-lock-your-live-site-15-minutes)** exactly as written, then come back here. It's the fiddliest screen of the whole setup: go slowly, and send your AI a screenshot before you click **Create**.

From now on GitHub will not let anyone save straight to the live site. Every change goes through a pull request, which is exactly what Part 8 does.

---

## Part 8: Review and fix (the loop you will repeat forever)

From here on, your job is the conversation: you talk, you look at your phone, you say "ship it." Your AI handles the mechanics. On a pure browser chat it cannot click for you, so it gives you the exact clicks, a minute or two at a time.

**Step 1: Tell the AI what's wrong, in plain words.** Examples: "My phone number is wrong, it should be 555-0142." "I don't like the blue, make it green." "Add that we do emergency calls."

**Step 2: Follow the AI's paste steps.** The AI will answer with exact steps: which file to open on github.com, what to find, and the complete replacement text. Paste it, then save like this, every time:

1. Click **Commit changes**.
2. Choose **Create a new branch for this commit and start a pull request**.
3. Click **Propose changes**, then **Create pull request**.

**Step 3: Open your preview on your phone.** Give Cloudflare a minute or two. On the pull request page, a Cloudflare comment appears with a **preview link**. Open it on your phone. Tap through every page: home, services, contact. Read every word out loud if you can; you will catch mistakes. (The contact form shows an "email us directly" note on previews. That is expected.)

**Step 4: Repeat.** To keep fixing the same change, edit the file again **on that pull request's branch**: on the pull request page, click **Files changed**, then the **⋯** menu on the file → **Edit file**. Each new commit updates the same preview link. If it looks unchanged, open it in a private/incognito window (your browser may be showing the old cached copy). To start a different change, begin again from `main`. Keep going until you love it. This loop is the whole job, now and forever.

---

## Part 9: Go live ("ship it", 2 minutes)

When the preview looks right, you publish it. A "pull request" is just GitHub's name for a proposed change. You are not asking anyone for anything.

1. On github.com, in your repository, click **Pull requests** (top menu) and open the one you checked.
2. Click **Squash and merge**, then **Confirm squash and merge**. If the button is stuck saying "Checking for the ability to merge" for more than a minute, reload the page.
3. Wait about a minute. Open your free `workers.dev` address: your site is live.

From now on, **"ship it"** means those clicks. You can also just tell your AI "ship it" and it will walk you through them.

---

## Part 10: Your own domain (whenever you're ready)

The `workers.dev` address works, but customers expect `yourbusiness.com`. A domain costs about $10 to $15 per year, and that is the only money this whole project costs.

**The simple version:** buy the domain inside Cloudflare so everything stays in one place: dash.cloudflare.com → **Domain Registration** → search and buy. Then **Workers & Pages** → your site → **Settings** → **Domains & Routes** → **Add** → **Custom domain** → enter your domain → **Add domain**. Do it again for `www.` plus your domain. Then your domain → **SSL/TLS** → **Edge Certificates** → turn on **Always Use HTTPS**. Cloudflare handles the rest.

**Already own a domain somewhere else?** Your site can only use it once Cloudflare runs its DNS ("nameservers"). **Read [domains-and-dns.md](domains-and-dns.md) first**, or ask your AI: "I have a domain at another company. What do I need to protect before connecting it?" If your business email runs on that domain, done wrong this can stop your email from working; done right, it takes ten minutes. If you'd rather not move your DNS at all: [keep-your-dns.md](keep-your-dns.md).

**Visitor stats** turn on with your domain: Cloudflare → **Web Analytics** → **Add a site** → pick your domain → **Done**.

**Contact form emails** (so the form sends inquiries to your inbox) start working once your domain is connected and Cloudflare Email Routing is on with your inbox verified. No keys, no other accounts. [api-keys.md](api-keys.md) walks through it, all in the browser, or ask your AI: "walk me through turning on my contact form, step by step, browser only."

---

## The 10-second pre-paste checklist

Before every paste, confirm three things:

1. You are in the file the AI named.
2. You copied the AI's **complete** block, not half of it.
3. You will commit it as a **new branch + pull request** (Part 8, Step 2).

Put this on a sticky note until it's habit.

---

## When something goes wrong

**"The Deploy to Cloudflare page shows an error."** Take a screenshot and send it to your AI. The usual causes: GitHub wasn't connected (approve it and try again), or the name is taken or too long (pick a shorter one). Nothing is half-made that you need to clean up, but if a repository did get created, delete it before retrying: repository page → **Settings** → scroll to **Danger Zone** → **Delete this repository**.

**"I pasted and the site looks broken."** Almost always a missing comma or quote in `site.config.json`. Open the file on GitHub, copy its contents into the chat, and say: "I broke it, here's the file." The AI will hand you a fixed complete file to paste back.

**"Cloudflare says the build failed."** In Cloudflare: **Workers & Pages** → your site → **Deployments** → open the failed build and its log, copy the red error lines, and paste them to the AI. It will tell you the exact fix.

**"I published something bad."** Say "undo that" to your AI. On this path it gives you the clicks: GitHub's **Revert** button on the change you published makes a new pull request with its own preview link; check it and click **Squash and merge**. (If the live site is badly broken right now, a helper can use Cloudflare's Rollback as an emergency brake, but the undo pull request must still follow, or the next ship re-publishes the bad change.)

**"I can't find my preview link."** Open the pull request on github.com (**Pull requests** in the top menu). Cloudflare's comment on that page has the link. Give it a minute or two after saving.

**"I tried to edit the live site and GitHub won't let me."** That is the lock from Part 7 doing its job. Edit the file again and choose **Create a new branch for this commit and start a pull request** when you commit. If you already made a branch, tell the AI what you did and it will tell you the clicks that fix it. Nothing is unfixable; every change is remembered and reversible.

**"My AI seems lost."** Start a fresh message and say: "Read AGENTS.md again. I am browser-only: no commands, browser steps with complete paste text." If you started a brand-new chat, re-attach `AGENTS.md`, `rules/beginner-mode.md`, and `rules/deploy.md` first.

---

## What you never need

- No terminal, no black window with text, ever.
- No programs installed for this. Your browser is the toolkit.
- No API keys for your AI. It runs on the ChatGPT or Claude subscription you already pay for.
- No git commands, no GitHub Desktop. The buttons on the GitHub website are the whole workflow.
- No choosing between technical options. If your AI ever asks you to pick a technical path, say: "You decide. Just get me the preview link."
