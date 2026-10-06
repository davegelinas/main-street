# Your AI: which one, and how it works day to day

Your AI is your web developer. It needs a **paid AI plan, about $20 a month**: **Claude Pro** or **ChatGPT Plus** (or higher). Either works, and many owners already have one. On these plans your AI makes each change itself and gets you a preview link. On a free plan it can only chat, so you do the clicking (that path is [browser-only.md](browser-only.md), and it's slower).

**Your AI never needs an API key for itself.** If one ever asks, say no. It works on the plan you already pay for, so it can't run up a usage bill.

You connect your AI once, during [setup](setup-guide.md) (Steps 3 and 7). This page is for after that.

*Checked October 2026. These apps move their buttons often. If something looks different, tell your AI where you are and it will guide you.*

## Claude or ChatGPT?

Use the one you already pay for. Both read the same instructions inside your site, so both follow the same rules: a preview for every change, and nothing goes live until you say so.

| | Claude Pro | ChatGPT Plus |
|---|---|---|
| Where you talk to it | claude.ai/code, or the **Code** tab in the Claude app | chatgpt.com, or **Codex** in the ChatGPT app |
| Your preview link | Claude sends it in the chat | On the pull request page, in Cloudflare's comment |
| "Ship it" | Say it; Claude publishes | Tap **Create PR**, then **Squash and merge** on GitHub |
| "Undo that" | Say it; Claude takes it back | Say it, then **Create PR** and **Squash and merge** |

## Claude Pro

Works at **claude.ai/code** in a browser, or in the **Code** tab of the Claude phone app. Nothing to install.

**Day to day:** tap **Edit my website**, say what you want, open the preview link Claude sends, and say "ship it." Claude publishes the change and tells you when it's live.

## ChatGPT Plus (Codex)

Works at **chatgpt.com** in a browser and in the ChatGPT phone app, through **Codex**. Your site has its own Codex workspace (an "environment"), made once during setup.

**Day to day:**

1. Tap **Edit my website**. Pick your website's environment if it asks, and say what you want.
2. When Codex finishes, tap **Create PR** and open the pull request.
3. Within a minute or two, Cloudflare adds a comment there with a **preview link**. Open it on your phone.
4. Looks right? Tap **Squash and merge** → **Confirm squash and merge**. That's "ship it." Your live site updates about a minute later.

Not right yet? Tell Codex what to change in the same task. When it's done, use the same button to update the pull request, then check the preview again.

**If Codex says it can't download something:** open your environment's settings (**Settings** → **Codex Cloud** → **Environments**) and check that **Allow Codex to access internet** is on, with **Package managers** chosen.

## Other AIs

Any AI that can open pull requests on GitHub and read your site's manual (`AGENTS.md`) can run your site the same way. Google's Jules and GitHub Copilot's coding agent are two that can. We haven't tested them step by step, so expect a few more taps, and ask your AI to read `AGENTS.md` first.

Only have a plain chat window, or a free plan? Your AI can still help: it writes each change and tells you exactly where to paste it on GitHub. That's [browser-only.md](browser-only.md).

## Your Edit my website button

One tap opens your AI, ready for you to say what you want. The easy way: ask your AI, "make my Edit my website button."

How it works: your site has a page just for you at **/edit/** (like `maplestreetbakery.com/edit/`). It's kept out of Google and off your menu, and its one big button opens your AI. You put that page on your home screen: open it in **Safari**, tap **Share** → **Add to Home Screen** → **Add**. On Android, open it in Chrome and use the menu → **Add to Home screen**. (Don't make the button from your AI's own link: the AI's page changes its address as it opens, so the button would forget your site.)

The button's link lives in `site.editUrl` in `site.config.json`:

- **Claude:** this link, with `OWNER/REPO` replaced by your site's GitHub address (like `maria-lopez/maple-street-bakery`). It opens Claude with your site already chosen and a sentence already started:

  ```
  https://claude.ai/code?repositories=OWNER/REPO&prompt=Read%20AGENTS.md%20first.%20Here%27s%20what%20I%27d%20like%20to%20change%20on%20my%20website%3A%20
  ```

- **ChatGPT:** `https://chatgpt.com/codex`. It opens Codex; you pick your website's environment and say what you want.
- **Another AI:** wherever you start a chat about your site.

The first time you tap the button, sign in to your AI in Safari if it asks (one time only).

## If something's confusing

- **"It asked for an API key."** It doesn't need one. Say: "No API keys for you. Work with my plan." If it insists, start a fresh chat.
- **"Which AI should I use?"** The one you already pay for. Claude Pro and ChatGPT Plus both work. Choosing fresh? Claude takes fewer taps per change, because it can publish for you.
- **"The screen looks different from this page."** Tell your AI where you are ("I'm on the settings page and I don't see...") and it will guide you.
- **"Can I send a voice message instead of typing?"** Yes. Your AI says back what it heard in one sentence before it changes anything. If a word is unclear, it asks instead of guessing.
- **"How do I get the monthly checkup?"** Say "run the monthly checkup." Your AI checks for old hours, tired photos, leftover placeholder words, broken links, and changes you never shipped, then suggests fixes. Nothing changes without your yes.
- **"Something looks wrong after I shipped it."** Say "undo that" and your AI takes it back: right away if it was the latest change, or with a quick preview if newer changes went live after it. (On ChatGPT, you merge the undo like any change.)
- **"My AI seems lost, or forgot how my site works."** Start a fresh chat from your Edit my website button, and say "Read AGENTS.md first."
