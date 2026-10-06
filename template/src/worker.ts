// The site's only server code. Everything else is plain files from dist/.
//
// POST /api/contact  emails a contact form message to the owner, through the
//                    send_email binding (Cloudflare Email Routing). No key.
// GET  /api/contact  says whether email is set up: {"ready": true|false}.
//
// When email is not set up (no binding, no CONTACT_TO_EMAIL, or Cloudflare
// refuses the send), visitors get a friendly "please email us directly"
// instead of a broken form.

interface Env {
  ASSETS: Fetcher;
  // send_email binding from wrangler.jsonc. Missing on preview links.
  EMAIL?: SendEmail;
  // Secret: where messages go. Must be a verified destination address in
  // Cloudflare Email Routing (usually the owner's everyday inbox).
  CONTACT_TO_EMAIL?: string;
  // Optional: the sender address. Must be on a domain with Email Routing on.
  // Defaults to noreply@<the site's domain, without www.>.
  CONTACT_FROM_EMAIL?: string;
}

interface Payload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  website?: unknown; // honeypot: must stay empty
  startedAt?: unknown; // ms timestamp of when the form was shown
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const json = (data: Record<string, unknown>, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

const notSetUp = () =>
  json(
    { ok: false, error: "Email is not set up yet. Please email us directly and we will get right back to you." },
    503,
  );

const isReady = (env: Env) => Boolean(env.EMAIL && EMAIL_RE.test(env.CONTACT_TO_EMAIL?.trim() ?? ""));

async function contact(request: Request, env: Env): Promise<Response> {
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return json({ ok: false, error: "Could not read your message. Please try again." }, 400);
  }

  // Bot signals: honeypot filled, or submitted faster than a human can type.
  if (String(body.website ?? "").trim() !== "") return json({ ok: true }); // pretend success
  const elapsed = Date.now() - Number(body.startedAt ?? 0);
  if (Number.isFinite(elapsed) && elapsed < 3000) return json({ ok: true }); // pretend success

  const name = String(body.name ?? "").replace(/\s+/g, " ").trim().slice(0, 200);
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please fill in your name, email, and message." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "That email address does not look right. Please check it." }, 400);
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "Please keep your message under 5000 characters." }, 400);
  }

  if (!env.EMAIL || !isReady(env)) return notSetUp();

  const host = new URL(request.url).hostname.replace(/^www\./, "");
  const from = env.CONTACT_FROM_EMAIL?.trim() || `noreply@${host}`;

  try {
    await env.EMAIL.send({
      from: { email: from, name: "Website contact form" },
      to: env.CONTACT_TO_EMAIL!.trim(),
      replyTo: email, // replying in your inbox answers the visitor
      subject: `Website message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}\n\n(Sent from the contact form on ${host})`,
    });
  } catch (err) {
    // Shows in the Cloudflare dashboard: Worker -> Observability -> Logs.
    const e = err as { code?: string; message?: string };
    console.error("contact form send failed", e.code ?? "", e.message ?? String(err));
    return notSetUp();
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") {
      if (request.method === "POST") return contact(request, env);
      if (request.method === "GET") return json({ ready: isReady(env) });
      return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
    }
    // Anything else that reaches this code has no matching file: serve 404.html.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
