# Turn on your contact form

Your contact form needs one free key, from a service called **Resend** that delivers the messages to your inbox. It's optional: until it's set up, visitors who try the form are asked to email you directly, and your phone number and email are always right there on the page. Nothing breaks.

**This key is not for your AI.** Your AI runs on your AI plan and never needs a key.

**You need your own domain first.** The form sends from an address at your domain (like `noreply@yourbusiness.com`), and Resend only sends from a domain it has checked. So this comes after your domain is connected ([setup-guide.md](setup-guide.md), "Later: your own domain").

## The easy way: let your AI walk you through it

Paste this into your AI chat. It takes about 20 minutes, mostly waiting.

```
My domain is connected. Walk me through setting up the contact form:
verify my domain in Resend, create the key, and put it in Cloudflare
under Production. I'm not technical: tell me exactly what to click,
one step at a time.
```

The steps below are the same ones, so you can see where you are.

## The one rule about keys

A key is like a house key: whoever has it can act as you.

- Keys go in **Cloudflare's dashboard only**, under **Production**. Never in your website's files, never in a chat message, never in an email, and never under **Preview**.
- If a key ever leaks, don't panic. Delete it in Resend and make a new one. Two minutes, problem solved.

## The steps

**1. Sign up and check your domain** (about 10 minutes, mostly waiting)

1. Go to **resend.com** and click **Sign up**. Use your business email.
2. In Resend's menu, click **Domains** → **Add Domain**, and type your domain.
3. Resend shows a few settings to copy into Cloudflare (**your domain** → **DNS** → **Records** → **Add record**). Copy each one exactly. Send your AI a screenshot and it will read them off for you.
4. Wait until Resend shows your domain as **Verified** (minutes to an hour).

**2. Make the key**

1. In Resend's menu, click **API Keys** → **Create API Key**. Name it `website-contact-form`. Permission: **Sending access**.
2. Resend shows the key **once**. It starts with `re_`. Copy it. You'll paste it in the next step, then you can forget it.

**3. Put it in Cloudflare**

1. Cloudflare → **Workers & Pages** → your project → **Settings** → **Variables and Secrets**. Make sure you're on **Production**, not Preview.
2. Click **Add** and add these two. Choose **Secret** (or click **Encrypt**) for each:
   - `RESEND_API_KEY`: the key from step 2.
   - `CONTACT_TO_EMAIL`: where form messages should land (usually your business email).
3. Click **Save**. It switches on with your site's next update: ship any small change, or in Cloudflare go to **Deployments** → **⋯** on the latest production deployment → **Retry deployment**.

**4. Test it.** Fill in the contact form on your live site and send. It should arrive within a minute (check spam the first time). The form never sends from a preview link: previews have no keys, on purpose.

## If something goes wrong

- **The form says email isn't set up:** check that both settings are there under **Production**, then retry the latest deployment.
- **"Invalid API key":** probably a missing character. Delete it, make a fresh key in Resend, and paste again.
- **Nothing arrives:** check `CONTACT_TO_EMAIL` for a typo, check spam, and check that your domain still says **Verified** in Resend.
- **It used to work and stopped:** the key may have been deleted in Resend. Make a new one and replace `RESEND_API_KEY`. The monthly checkup reminds you to send yourself a test message.

<details>
<summary>For helpers: testing on your own computer</summary>

To make the form send while running the site locally (`npm run dev`), create a file named `.dev.vars` in the site folder containing `RESEND_API_KEY=re_your_key_here`. It's on the never-commit list, so it can't reach GitHub. The setup wizard (`npm run setup`) can create it for you.

</details>
