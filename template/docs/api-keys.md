# Contact form and visitor stats, in plain English

Good news: your site needs **no API keys**. The contact form and the visitor stats both run on your free Cloudflare account. Without them nothing breaks: visitors who use the form are asked to email you directly, and your phone number and email address are always right there on the page.

**Do this with your AI.** Paste a prompt from the bottom into your chat and it will walk you through each screen, click by click.

## The contact form

### How it works

When a visitor sends the form, your site emails the message to your inbox through **Cloudflare Email Routing**, the same free feature that forwards `hello@yourbusiness.com` to your Gmail. Replying in your inbox answers the visitor directly.

It can only send to inboxes you have verified with Cloudflare, so nobody can use your form to email anyone else.

### What it needs (once)

1. **Your own domain, connected** ([setup-guide.md](setup-guide.md), "Your own domain"). On the free `workers.dev` address the form shows "please email us directly." That's expected.
2. **Email Routing turned on, with your inbox verified** ([setup-guide.md](setup-guide.md), "Business email and the contact form"). Cloudflare emails your inbox a link; click it.
3. **The same inbox in your site's settings.** You typed it as **CONTACT_TO_EMAIL** when you pressed Deploy. To check or change it: Cloudflare → **Workers & Pages** → your site → **Settings** → **Variables and Secrets** → `CONTACT_TO_EMAIL` → edit → **Deploy**. (It shows as hidden; that's normal. If it's missing, **Add** → type **Secret**, name `CONTACT_TO_EMAIL`.)

That's all. No account anywhere else, nothing to renew.

### Test it

On your live site at your own domain, fill in the contact form and send. The message should arrive within a minute (check spam the first time). Preview links never send, on purpose; they show the "email us directly" note.

### If your domain already has email

If your business email already runs on your domain (Google Workspace, Microsoft 365, or your registrar's mailboxes), don't turn on Email Routing for your main domain: it would take over that mail. Instead, your AI turns Email Routing on for a **subdomain** only, like `mail.yourbusiness.com`, which leaves your existing email alone, and sets your form to send from it. Ask your AI before clicking anything; it will explain each screen.

### If something goes wrong

- **The form says email isn't set up:** check that `CONTACT_TO_EMAIL` exists (above), that your domain is connected, and that you're testing on your own domain, not a preview link.
- **Nothing arrives:** check spam. Then check Cloudflare → **Compute** → **Email Service** → **Email Routing** → **Destination Addresses**: your inbox must say **Verified**, and it must be exactly the address in `CONTACT_TO_EMAIL`.
- **Still nothing:** Cloudflare → **Workers & Pages** → your site → **Observability** → look for "contact form send failed." Send your AI a screenshot.
- **It used to work and stopped:** someone may have removed the verified address or turned off Email Routing. To catch this early, send yourself a test message once a month (the monthly checkup reminds you).

## Visitor stats

Cloudflare Web Analytics: free, no cookies, no consent banner. It counts visitors, page views, where they came from, and which countries. Turn it on when your own domain is connected (before that, the site is hidden from Google, so there's little to count).

1. Cloudflare dashboard → **Web Analytics** (in the left menu, under Analytics & Logs) → **Add a site**.
2. Type your domain (like `maplestreetbakery.com`) and click **Done**.
3. Cloudflare shows a short piece of code with a **token** in it: a long string of letters and numbers. Copy the whole piece of code and paste it into your chat.

Your AI puts the token in your site's settings (`site.config.json`) as a normal change with a preview link. Say "ship it," and counting starts. The token isn't secret: it's visible in every web page anyway.

## Testing on your own computer (helpers only)

`npm run serve` builds the site and runs it the way Cloudflare does, on your machine, with no login. The contact form is simulated: instead of sending, it prints the email in the terminal. To try a "ready" form, create a file named `.dev.vars` in the site folder with `CONTACT_TO_EMAIL=you@example.com`. It's on the never-commit list, so it can't reach GitHub.

## Copy-paste prompts for your AI

```
My domain is connected. Walk me through turning on my contact form:
Email Routing, verifying my inbox, and checking CONTACT_TO_EMAIL.
I'm not technical: tell me exactly what to click, one step at a time.
```

```
Turn on my visitor stats. Walk me through Cloudflare Web Analytics
one step at a time, then put the token in my site.
```
