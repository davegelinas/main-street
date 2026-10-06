# Your AI: which one, and how it works day to day

Your AI is your web developer. It needs a **paid AI plan, about $20 a month**: Claude Pro or ChatGPT Plus (or higher). Many owners already have one. On these plans your AI makes each change itself and sends you a preview link. On a free plan it can only chat, so you do the clicking (that path is [browser-only.md](browser-only.md), and it's slower).

**Your AI never needs an API key for itself.** If one ever asks, say no. It works on the plan you already pay for, so it can't run up a usage bill.

You connect your AI once, during [setup](setup-guide.md) (Steps 3 and 7). This page is for after that.

*Checked October 2026. These apps move their buttons often. If something looks different, tell your AI where you are and it will guide you.*

## Claude Pro (smoothest today)

Works at **claude.ai/code** in a browser, or in the **Code** tab of the Claude phone app. Nothing to install.

**Day to day:** tap **Edit my website**, say what you want, open the preview link Claude sends, and say "ship it." Claude publishes the change and tells you when it's live.

## ChatGPT Plus (Codex)

Works at **chatgpt.com/codex** and in the ChatGPT phone app. One-time setup: in Codex, connect GitHub, give it access to your site's repository, and create an environment for it (accept the defaults).

**Day to day:** describe the change. When Codex finishes, tap **Create PR**. A minute later, Cloudflare adds a preview link to that page: open it on your phone. If it looks right, tap **Squash and merge** → **Confirm squash and merge** (or ask Codex to). A few more taps than Claude, same result.

## Other AIs

Any AI that can open pull requests on GitHub can run your site, because it reads the same manual inside your site (`AGENTS.md`). Google's Jules and GitHub Copilot's coding agent are two examples.

## Your Edit my website button

One tap opens your AI with your site already chosen and a sentence already started, so you just finish it ("...change Saturday hours to 9 to 2") and send. The easy way: ask your AI, "make my Edit my website button."

To make it by hand for Claude, replace `OWNER/REPO` with your site's GitHub address (like `maria-lopez/maple-street-bakery`) and make this link:

```
https://claude.ai/code?repositories=OWNER/REPO&prompt=Read%20AGENTS.md%20first.%20Here%27s%20what%20I%27d%20like%20to%20change%20on%20my%20website%3A%20
```

On an iPhone, don't tap the link: tapping opens the Claude app, which can't make home-screen buttons. Press and hold it, tap **Copy**, paste it into **Safari**, and go. Sign in to Claude there if it asks (one time only), then tap **Share** → **Add to Home Screen** → **Add**. On Android, use Chrome's menu → **Add to Home screen**. For another AI, a home-screen bookmark to wherever you start a chat about your site works the same way.

## If something's confusing

- **"It asked for an API key."** It doesn't need one. Say: "No API keys for you. Work with my plan." If it insists, start a fresh chat.
- **"Which AI should I use?"** The one you already pay for. Choosing fresh? Claude Pro has the smoothest loop today.
- **"The screen looks different from this page."** Tell your AI where you are ("I'm on the settings page and I don't see...") and it will guide you.
- **"Can I send a voice message instead of typing?"** Yes. Your AI says back what it heard in one sentence before it changes anything. If a word is unclear, it asks instead of guessing.
- **"How do I get the monthly checkup?"** Say "run the monthly checkup." Your AI checks for old hours, tired photos, leftover placeholder words, broken links, and changes you never shipped, then suggests fixes. Nothing changes without your yes.
- **"Something looks wrong after I said ship it."** Say "undo that" and your AI takes it back: right away if it was the latest change, or with a quick preview if newer changes went live after it.
- **"My AI seems lost, or forgot how my site works."** Start a fresh chat from your Edit my website button. It tells your AI to read the manual first.
