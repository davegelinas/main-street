# Connect your AI: your web developer, on the plan you already pay for

Your AI assistant is your web developer. It needs a **paid AI plan, about $20 a month**: Claude Pro or ChatGPT Plus (or higher). Many owners already have one. You never need API keys or usage billing for the AI, and if an AI ever asks you for an API key *for itself*, say no.

Why a paid plan: on these plans the AI can make changes to your site by itself and send you a preview link. On free plans it can only chat, so you'd be the one copying its changes into GitHub (that path exists, below, but it's the slow one).

You (the owner) connect it yourself, once, as part of [setup-guide.md](setup-guide.md); your AI walks you through it. After that you talk to it in plain words, look at the preview link on your phone, and say "ship it." You never install anything or type a command. (If someone helps you, they do these same steps signed in as you.)

*Checked October 2026. These products change their menus often; if a button moved, tell your AI where you are and it will guide you.*

## Best: Claude Pro (Claude in the cloud)

Works at **claude.ai/code** in a browser, or in the **Code** tab of the Claude phone app. Nothing to install.

**One-time setup (about 5 minutes, signed in as you):**

1. Go to **claude.ai/code** and sign in with your Claude account.
2. When it asks, **Sign in with GitHub** and approve.
3. Install the **Claude GitHub App** on the site's repository: go to `github.com/apps/claude/installations/new`, choose **Only select repositories**, pick the site, and save. Leave **Auto-fix** off.
4. Claude creates a work environment named **Default** for you. Leave it as it is.
5. Make your **Edit my website** button. Replace `OWNER/REPO` with your site's GitHub address (like `maria-lopez/maple-bakery-site`) and open this link on your phone:

   ```
   https://claude.ai/code?repositories=OWNER/REPO&prompt=Read%20AGENTS.md%20first.%20Here%27s%20what%20I%27d%20like%20to%20change%20on%20my%20website%3A%20
   ```

   Then use the browser's **Share → Add to Home Screen**. One tap opens Claude with your site already selected and a sentence started: you just finish it ("...change Saturday hours to 9 to 2") and send. (Your AI can make this link for you: say "make my Edit my website button.")
6. Do one real change together (below).

**Day to day:** tap **Edit my website**, say what you want, open the preview link Claude sends back, say "ship it." Claude publishes it and tells you when it's live.

## Also good: ChatGPT Plus (Codex)

Works at **chatgpt.com/codex** and in the ChatGPT phone app.

**One-time setup:** in Codex, connect GitHub, give it access to the site's repository, and create an environment for it (accept the defaults). Once.

**Day to day:** describe the change. When Codex finishes, tap **Create PR**. A minute later the pull request shows a preview link from Cloudflare: open it on your phone. If it looks right, tap **Squash and merge** → **Confirm squash and merge** (or ask Codex to). A few more taps than Claude, same result.

## Other AIs

Any AI that can open pull requests on GitHub works the same way, because they all read the site's manual (`AGENTS.md`): Google's Jules (it has a free tier), GitHub Copilot's coding agent, and others.

If your AI can only chat (a free plan, or any plain chat window), it can still help: it writes the change and tells you exactly where to paste it on GitHub. That works, but you do the clicking. The complete walkthrough is [browser-only.md](browser-only.md).

## The first real change, together

Do this once, on your phone, right after setup:

1. Tap **Edit my website** and send: **"Read AGENTS.md first, then tell me in one or two plain sentences what you understood your job to be."** A good answer: every change gets a preview link, and nothing goes live until the owner says "ship it."
2. Ask for something small: "Add a banner: welcome to our new website!"
3. Open the preview link it sends. Look at the banner.
4. Say **"ship it."** Wait a minute, open the live site, see the banner.
5. Say **"undo that."** A minute later the banner is gone from the live site. Now you know you can take anything back.

Once you've done that loop once, setup is finished.

## If something's confusing

- **"It asked for an API key."** It doesn't need one for itself. Say: "No API keys for you. Work with my plan." If it insists, start a fresh session.
- **"Which AI should I use?"** The one you already pay for. If you're choosing fresh, Claude Pro has the smoothest loop today.
- **"The menus look different from this page."** They move. Tell the AI where you are ("I'm on the settings page and I don't see...") and it will guide you.
- **"Can I send a voice message instead of typing?"** Yes. Your AI says back what it heard in one sentence and takes it from there. If a word is unclear, it asks instead of guessing.
- **"How do I get the monthly checkup?"** Say "run the monthly checkup." Your AI reviews the whole site for stale hours, old photos, leftover placeholder text, broken links, and changes you never shipped, then proposes fixes. Nothing changes without your yes.
- **"Something looks wrong after I said ship it."** Say "undo that." Your AI takes it back: right away if it just published it, or with a quick preview to approve if it's an older change.
- **"Should we build a custom GPT or a plugin for the site?"** No. The site's manual plus your AI is the whole interface. Nothing to build, nothing to maintain.
