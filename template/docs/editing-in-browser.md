# Editing in your browser: a quick text fix

You don't need anything installed to fix a few words. GitHub's website has an edit button. Because your live site is locked (nothing goes live without your "ship it"), every edit travels as a pull request with its own preview link.

## How it works

1. Go to your repo on **github.com** and click through to the file (like `index.html` or `site.config.json`).
2. Click the **pencil icon** (Edit this file) at the top right, and make your change in the text box.
3. Click **Commit changes**. Choose **Create a new branch for this commit and start a pull request**, then **Propose changes**, then **Create pull request**.
4. Wait a minute. Cloudflare comments on the pull request with a **preview link**. Open it on your phone and check your change.
5. Happy? On the pull request, click **Squash and merge**, then **Confirm squash and merge**. Your live site updates in about a minute. (Or tell your AI "ship it.")

Not right yet? Edit again on that pull request's branch (**Files changed** → **⋯** → **Edit file**). The same preview link updates.

## What's safe to edit this way

- **Words on pages** (`index.html`): headlines, paragraphs, service descriptions. Change the words between the tags (the bits in angle brackets, like `<p>`), and leave the tags alone.
- **Business facts** (`site.config.json`): hours, phone, address, announcement banner text. Match the existing format exactly (quotes, commas). One misplaced comma breaks the file; if the preview looks broken, ask your AI to fix it.
- **FAQ entries** (`index.html`): copy an existing question block, change the words.

## What to leave for your AI assistant

- Anything involving `<!-- feature: ... -->` markers, CSS, the contact function, or new pages.
- If you're unsure: "I want to change X, is it safe to edit in the browser?"

## Tips

- One change per pull request while you're learning. Easier to undo.
- Made a mistake after shipping? Tell your AI "undo that," and it takes it back.
- There's no AI double-checking your work on this path, so stick to small text edits. Anything bigger goes through your AI assistant.
