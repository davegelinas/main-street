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

## Part 2: Get the website files onto GitHub (20 minutes)

Your site starts as a folder of files called the **template**. You will download it and upload it to your own GitHub repository (think of a repository as a folder with a memory: it remembers every change).

**Step 1: Download the template.**

1. Open this page in your browser: `https://github.com/davegelinas/main-street`
2. Click the green **Code** button, then click **Download ZIP**. Save the file.
3. Find the ZIP in your Downloads and **double-click it**. Your computer unzips it with built-in software; nothing to install. You now have a folder named `main-street-main`. Open it, then open the **`template`** folder inside it. Leave this window open; you will come back to it.

**Step 2: Create your repository.**

1. Go to github.com (signed in). Click the **+** at the top right, then **New repository**.
2. **Repository name:** your business name, lowercase, with dashes. Example: `maple-street-bakery`. (No spaces.)
3. Choose **Public**. Your website is public anyway, and only a public repository gets GitHub's free lock that protects your live site (Part 7). Nothing private ever goes in it.
4. **Important:** leave **Add a README file** unchecked. An empty repository makes the next step easy.
5. Click **Create repository**.

**Step 3: Upload the template's contents.**

1. On your new (empty) repository page, click the **uploading an existing file** link.
2. Go back to the `template` folder window from Step 1. Select everything inside it (Ctrl+A on Windows, Cmd+A on Mac): the folders AND the loose files, all at once.
3. **Drag that whole selection into the GitHub upload area.** Use drag and drop, not the "choose your files" link: the link uploads every file as one flat pile and the folders are lost; dragging keeps the inside of each folder intact. (You are uploading the *contents* of the template folder, not the folder itself.)
4. Wait until every file finishes uploading (there are about 88; give it a minute or two).
5. **Check the staged list before you commit.** You should see folder paths like `docs/browser-only.md` and `content/brand/photos/`. If you see bare filenames with "dup" markers instead (two `index.html`, three `README.md`), the folders did not come along: remove every file and re-drag, making sure you drag the folders themselves, not a file picker selection.
6. Click **Commit changes** (the green button). Leave the message as is.

Note: the hidden `.github` folder often does not come along in a drag (your computer hides it even from itself). Step 4 checks for it.

**Step 4: Check the hidden folder made it.**

Scroll through your repository's file list. You should see a folder named **`.github`** (with a dot in front). It runs automatic safety checks on your changes. (Cloudflare also builds a preview link for every change automatically, with no extra settings.)

- **If you see `.github`:** you are done with this part.
- **If you don't see it:** your computer hid it during the upload. This is normal and fixable in two minutes:
  1. In your repository, click **Add file** (top right), then **Create new file**.
  2. In the **name** box at the top, type exactly: `.github/workflows/ci.yml` (the slashes create the folders).
  3. Open the downloaded ZIP's copy of this file on your computer (in the template folder, `.github/workflows/ci.yml`). On a Mac, open TextEdit first, then use File > Open and press Cmd+Shift+Period to reveal hidden files. On Windows, in File Explorer open the folder and choose View > Show > Hidden items. Select all, copy.
  4. Paste into the big text box on GitHub. Click **Commit changes**.

**Step 5: Add the last hidden file.**

One more tiny file almost never survives the upload: `.node-version`. It tells the automatic checks which tools to use, and without it every change shows a confusing red X.

1. Click **Add file** (top right), then **Create new file**.
2. In the **name** box, type exactly: `.node-version`
3. In the big text box, type exactly: `22`
4. Click **Commit changes**.

**A word about the checks.** After each save, GitHub runs an automatic check on your files. A green check mark means everything is fine. A red X means something in the files is broken. Do not panic: copy the error text into your chat and your AI will hand you the fix. Most fixes are one paste.

Your repository now holds your entire website. During setup, saving straight to `main` (the live copy) is fine; Part 7 locks it. Nothing is on the internet yet; you have not connected anything.

---

## Part 3: Introduce your AI to your site (5 minutes)

Your AI has not seen your site yet. Give it the site's operating manual, then tell it your situation in one message.

**Step 1: Start a new conversation** at claude.ai or chatgpt.com.

**Step 2: Attach three files.** Click the **paperclip** (attach) button in the chat box and upload these files from the `template` folder you downloaded:

- `AGENTS.md`
- `rules/beginner-mode.md`
- `rules/deploy.md`

(`AGENTS.md` is the operating manual your site carries for any AI. Your AI will read all three. If it ever needs another file from the `rules/` folder later, it will ask you to attach that one too.)

**Step 3: Send this message.** Copy and paste it exactly:

```
I just put my new business website on GitHub. I only have this browser chat:
I cannot run commands, install anything, or use a terminal. For every task,
give me steps I can do in the browser on github.com, with the complete text
to copy and paste. Never ask me to run a command.

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

## Part 6: Connect Cloudflare (15 minutes)

This connects your GitHub repository to the service that publishes your site.

**Step 1: Start the connection.**

1. Go to dash.cloudflare.com (signed in). Click **Workers & Pages** in the left menu.
2. Click **Create application**, then choose **Pages** (the website option, not Workers), then **Connect to Git** (it may say **Import an existing Git repository**).
3. GitHub will ask to authorize Cloudflare. Choose your GitHub account. When it asks for repository access, pick **Only select repositories** and choose your site repository (not everything). Click **Save** or **Install**.
4. Back in Cloudflare, select your site repository from the list and click **Begin setup**.

**Step 2: Enter the build settings exactly as follows.**

- **Project name:** your business name in lowercase with dashes (this becomes your first web address, like `maple-street-bakery.pages.dev`).
- **Production branch:** `main`
- **Framework preset:** leave at **None**. (There is no plain Vite option in the list; the similar-looking VitePress and React (Vite) are different things. Do not pick them.)
- **Build command:** `npm run build` (typing this into the box on the website is fine; the thing you never do is type into a black terminal window)
- **Build output directory:** `dist`
- Leave everything else as is. Click **Save and Deploy**.

**Step 3: Wait.** Cloudflare builds your site (one to three minutes). When you see a green checkmark, your site is live at the address shown, something like `https://maple-street-bakery.pages.dev`.

**Step 4: Turn on visitor stats.** In Cloudflare, click your project → **Metrics** → **Enable** under Web Analytics. One click.

Your free `pages.dev` address is hidden from Google on purpose. It is a working site you can check and share, not your launch. The launch is your own domain, later (Part 10).

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
3. Wait about a minute. Open your `pages.dev` address: your site is live.

From now on, **"ship it"** means those clicks. You can also just tell your AI "ship it" and it will walk you through them.

---

## Part 10: Your own domain (whenever you're ready)

The `pages.dev` address works, but customers expect `yourbusiness.com`. A domain costs about $10 to $15 per year, and that is the only money this whole project costs.

**The simple version:** buy the domain inside Cloudflare so everything stays in one place: dash.cloudflare.com → **Domain Registration** → search and buy. Then in your Pages project → **Custom domains** → **Set up a custom domain** → enter your domain → Activate. Cloudflare handles the rest.

**Read this before you touch DNS or email:** if you already own a domain, or your business email runs on your domain (like `you@yourbusiness.com`), **do not change DNS records without reading [domains-and-dns.md](domains-and-dns.md) first**, or ask your AI: "I have email on my domain. What do I need to protect before connecting it?" Done wrong, this can stop your email from working. Done right, it takes ten minutes.

**Contact form emails** (so the form sends inquiries to your inbox) need your own domain first. Once it is connected, [api-keys.md](api-keys.md) walks through the one free Resend key, all in the browser, or ask your AI: "walk me through the Resend key, step by step, browser only."

---

## The 10-second pre-paste checklist

Before every paste, confirm three things:

1. You are in the file the AI named.
2. You copied the AI's **complete** block, not half of it.
3. You will commit it as a **new branch + pull request** (Part 8, Step 2).

Put this on a sticky note until it's habit.

---

## When something goes wrong

**"I uploaded the template folder itself instead of its contents."** You'll know because your repository's file list shows a single folder named `template` instead of files like `site.config.json` and `index.html`. Easiest fix: delete the repository and start Part 2 over (repository page → **Settings** → scroll to **Danger Zone** → **Delete this repository**). Nothing is lost; nothing was connected yet.

**"I pasted and the site looks broken."** Almost always a missing comma or quote in `site.config.json`. Open the file on GitHub, copy its contents into the chat, and say: "I broke it, here's the file." The AI will hand you a fixed complete file to paste back.

**"Cloudflare says the build failed."** In Cloudflare, open the failed deployment, click **View build log**, copy the red error lines, and paste them to the AI. It will tell you the exact fix.

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
