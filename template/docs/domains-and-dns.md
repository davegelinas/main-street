# Your own domain, without breaking your email

Your domain (`yourbusiness.com`) is the real launch: until it's connected, your site works on its free address but is hidden from Google. The easiest way is to say to your AI: **"Walk me through connecting my domain safely."** This page is the careful version, so you can see where you are.

## Buying a new domain? Easy.

Buy it in Cloudflare: **Domain Registration** → search and buy (about $10 to $15 a year, at cost). Everything is already in the right place. Skip to [Attach it](#attach-it).

## Already own one? Move its settings, keep your email.

Your domain stays with the company you bought it from (GoDaddy, Namecheap, Squarespace...). Only its **DNS** moves to Cloudflare. DNS is the internet's phone book: it tells the world where your website and your email live. With Cloudflare holding it, these work automatically:

- `yourbusiness.com` itself, not just `www.yourbusiness.com`.
- Free email forwarding (`hello@yourbusiness.com` to your Gmail).
- Your contact form sending from your own domain.
- The padlock (a secure `https://` address).

The move is one change at your registrar, but if your email runs on this domain, a rushed move can stop it. So do it in this order, with your AI:

1. **Screenshot every DNS setting** at your current registrar, before anything changes.
2. **Check for email.** Look for **MX** records. If there are any, your domain receives email (Google Workspace, Microsoft 365, or the registrar's mailboxes), and those records must come across exactly.
3. **Turn off DNSSEC** at the registrar, if it's on. Left on, your domain stops working after the move.
4. In Cloudflare, click **Add a domain** (the free plan is fine) and enter your domain. **Compare** what Cloudflare copied over against your screenshots, and add anything missing. Ask your AI to compare the two lists with you.
5. Cloudflare shows two **nameservers**, like `ara.ns.cloudflare.com` and `bob.ns.cloudflare.com`. At your registrar, replace the nameservers with those two. If the domain already runs email or a website, do this **outside business hours**; if it doesn't, any time is fine. (Registrars hide this under "DNS," "Nameservers," or "Domain settings"; your AI can find it on yours.)
6. Back in Cloudflare, click **Check nameservers**. The status turns **Active** in minutes, sometimes a few hours. Don't keep changing things while you wait.
7. **Test email both ways:** send a message to your domain address from another account, and one from your domain address to another account.

## The email warning

When the nameservers switch, Cloudflare's copy of your settings takes over. Cloudflare copies the common ones on its own, but check these yourself, or email breaks:

- **MX records:** where incoming email goes. If mail suddenly stops after the switch, this is why.
- **SPF, DKIM, and DMARC** (TXT records): they prove your email is really from you.
- Anything unusual: settings that point other services at your domain, or verification codes.

Your screenshots from step 1 are your safety net.

**Already have mailboxes on your domain** (Google Workspace, Microsoft 365, or your registrar's email)? Don't turn on Cloudflare Email Routing. It would replace your MX records and take over your existing mail. Email Routing is only for domains with no email yet.

## Attach it

Once Cloudflare says **Active** (or right away, if you bought the domain in Cloudflare): Cloudflare → your project → **Custom domains** → **Set up a custom domain** → your domain → **Activate**. Add the `www` version too. Cloudflare creates the settings and the padlock for you; leave them as they are (the orange cloud stays on).

Then tell your AI **"my domain is connected."** It gets your site ready for Google and helps you tell Google it exists. Now you've launched.

## Optional: move the domain itself to Cloudflare

Not required. Transferring moves your yearly bill to Cloudflare, which sells domains at cost, often cheaper to renew than GoDaddy or Namecheap, and keeps everything in one place. Not every ending (.com, .shop...) is supported, and a domain can't move within 60 days of being bought or moved. It changes nothing about your site.
