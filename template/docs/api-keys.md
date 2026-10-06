# Turn on your contact form

Your contact form needs **no keys** and no extra account. It emails you through **Cloudflare Email Routing**, the same free feature that forwards `hello@yourbusiness.com` to your Gmail. Until it's on, visitors who try the form are asked to email you directly, and your phone number and email are always right there on the page. Nothing breaks.

**You need your own domain first.** The form sends from an address at your domain (like `noreply@yourbusiness.com`), and Cloudflare only sends from a domain where Email Routing is on. So this comes after your domain is connected ([setup-guide.md](setup-guide.md), "Later: your own domain").

## The easy way: let your AI walk you through it

Paste this into your AI chat. It takes about 10 minutes.

```
My domain is connected. Walk me through turning on my contact form:
Email Routing, verifying my inbox, and checking CONTACT_TO_EMAIL.
I'm not technical: tell me exactly what to click, one step at a time.
```

The steps below are the same ones, so you can see where you are.

## Why there's no key

Cloudflare only lets your form email inboxes you've proven are yours (you click a link it sends you). So nobody can use your form to email anyone else, and there's nothing secret to protect or renew. The one setting, **CONTACT_TO_EMAIL** (your inbox), stays in Cloudflare, never in your website's files, because your files are public.

## The steps

**1. Turn on Email Routing and verify your inbox** (skip if you did "Later: business email")

1. Cloudflare → **Compute** → **Email Service** → **Email Routing** → your domain → enable. (Menus move around; send your AI a screenshot if yours looks different.)
2. Add your everyday inbox as a **destination address**. Cloudflare emails it a link: click it. The address now says **Verified**.

**Already have email on your domain** (Google Workspace, Microsoft 365, or your registrar's mailboxes)? Don't turn Email Routing on for your domain itself: it would take over that mail. Ask your AI to turn it on for a **subdomain** instead (like `mail.yourbusiness.com`), which leaves your email alone, and to set your form's sending address to match.

**2. Check CONTACT_TO_EMAIL**

1. Cloudflare → **Workers & Pages** → your site → **Settings** → **Variables and Secrets**.
2. `CONTACT_TO_EMAIL` should be there (you typed it when you pressed Deploy). Its value is hidden; that's normal. If it isn't exactly the inbox you just verified, edit it. If it's missing: **Add** → type **Secret** → name `CONTACT_TO_EMAIL` → your inbox.
3. Click **Deploy** if Cloudflare asks. The change is live right away.

**3. Switch the form on.** Tell your AI "Email Routing is on." It turns the contact form on as a normal change with a preview link; say "ship it."

**4. Test it.** Fill in the contact form on your live site and send. It should arrive within a minute (check spam the first time). The form never sends from a preview link or the free address: they have no email settings, on purpose.

## If something goes wrong

- **The form says email isn't set up:** check that `CONTACT_TO_EMAIL` is there (step 2) and that you're on your own domain, not a preview link.
- **The form says your message couldn't be sent:** Cloudflare refused it. Most often the inbox in `CONTACT_TO_EMAIL` isn't **Verified** in Email Routing, or doesn't match it exactly. Your AI can find the reason: Cloudflare → your site → **Observability** → look for "Email Routing refused" and send it a screenshot.
- **Nothing arrives:** check spam, then the destination address still says **Verified**.
- **It used to work and stopped:** someone removed the verified address or turned off Email Routing. The monthly checkup reminds you to send yourself a test message.

<details>
<summary>For helpers: testing on your own computer</summary>

`npm run serve` builds the site and runs it the way Cloudflare does, on your machine, with no login. The contact form is simulated: instead of sending, it prints the email in the terminal. To try a "ready" form, create a file named `.dev.vars` in the site folder containing `CONTACT_TO_EMAIL=you@example.com` (it "sends" from `noreply@localhost`; nothing leaves your machine). `.dev.vars` is on the never-commit list, so it can't reach GitHub.

</details>
