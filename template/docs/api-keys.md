# The contact form key, in plain English

Your site has exactly **one** optional key: the one that lets the contact form email you. It's free. Without it nothing breaks: visitors who use the form are asked to email you directly, and your phone number and email address are always right there on the page.

**This key is not for your AI.** Your AI runs on your AI plan and never needs an API key.

**Do this with your AI.** Paste the prompt at the bottom into your chat and it will walk you through each screen, click by click.

(Visitor stats need no key at all: Cloudflare dashboard → **Workers & Pages** → your project → **Metrics** → **Enable** under Web Analytics. One click.)

## The one rule about keys

A key is like a house key: whoever has it can act as you. So:

- Keys go in **Cloudflare's dashboard only**, under **Production** (the exact spot is below). Never in your website's files, never in a chat message, never in email, and never under **Preview**.
- If a key ever leaks, don't panic: go back to Resend, delete it, and make a new one. Two minutes, problem solved.

## Before you start: you need your own domain

The form sends from an address at your domain (like `noreply@yourbusiness.com`), and Resend only sends from a domain it has verified. So this step comes after your domain is connected ([setup-guide.md](setup-guide.md), "Your own domain"). On the free `pages.dev` address the form can't send yet; that's expected.

## Resend: the service that delivers your form messages

**1. Sign up and verify your domain (about 10 minutes, mostly waiting):**

1. Go to **resend.com** and click **Sign up**. Use your business email.
2. In Resend's sidebar, click **Domains** → **Add Domain** → type your domain.
3. Resend shows you a few DNS records. Add them in Cloudflare (**your domain** → **DNS** → **Records** → **Add record**), copying each one exactly. Your AI can read them off a screenshot and walk you through it.
4. Wait for Resend to show the domain as **Verified** (minutes to an hour).

**2. Create the key:**

1. In Resend's sidebar, click **API Keys** → **Create API Key**. Name it `website-contact-form`. Permission: **Sending access**.
2. Resend shows the key **once**. It starts with `re_`. Copy it; you'll paste it in the next step and can forget it after.

**3. Put it in Cloudflare:**

1. Cloudflare dashboard → **Workers & Pages** → your project → **Settings** → **Environment variables**.
2. Under **Production** (not Preview), click **Add variable** and add two, marked **Encrypt**:
   - `RESEND_API_KEY`: the key from step 2.
   - `CONTACT_TO_EMAIL`: the address where form messages should land (usually your business email).
3. Click **Save**. Then make it take effect: **Deployments** → ⋯ on the latest production deployment → **Retry deployment** (or just ship any small change).

**4. Test it on your live site:** fill in the contact form at your own domain and send. The message should arrive within a minute (check spam the first time). The form won't send from a preview link; previews have no keys, on purpose.

## If something goes wrong

- **Form says email isn't set up:** check both variables exist under **Production**, then retry the latest deployment.
- **"Invalid API key":** probably a missing character. Delete the variable, create a fresh key in Resend, paste again.
- **Nothing arrives:** check `CONTACT_TO_EMAIL` for a typo, check spam, and check your domain still shows **Verified** in Resend.
- **It used to work and stopped:** the key may have been deleted in Resend. Make a new one and replace `RESEND_API_KEY`. To catch this early, send yourself a test message once a month (the monthly checkup reminds you).

## Testing on your own computer (helpers only)

To make the form send while running the site locally (`npm run dev`), create a file named `.dev.vars` in the site folder with `RESEND_API_KEY=re_your_key_here`. It's on the never-commit list, so it can't reach GitHub. The setup wizard can create it for you.

## Copy-paste prompt for your AI

```
My domain is connected. Walk me through setting up the contact form:
verify my domain in Resend, create the key, and put it in Cloudflare
under Production. I'm not technical: tell me exactly what to click,
one step at a time.
```
