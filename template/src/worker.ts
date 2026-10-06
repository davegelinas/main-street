// The site's only server code. Everything else is the plain files in dist/.
//
// POST /api/contact  emails a contact form message to the owner through the
//                    send_email binding (Cloudflare Email Routing). No key.
// GET  /api/contact  says whether email is set up here: {"ready": true|false}.
//
// Until email is set up, visitors get "please email us directly" instead of
// a broken form.

interface Env {
  ASSETS: Fetcher;
  EMAIL?: SendEmail; // send_email binding (wrangler.jsonc); never on preview links
  CONTACT_TO_EMAIL?: string; // secret: the owner's inbox, verified in Email Routing
  CONTACT_FROM_EMAIL?: string; // optional; defaults to noreply@<site domain>
}

interface Payload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  leave_blank?: unknown; // honeypot: must stay empty (not named "website", which autofill can fill)
  elapsed?: unknown; // ms the visitor spent on the page before sending (their own clock)
}

const EMAIL_RE = /^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/;

const json = (data: Record<string, unknown>, status = 200) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store" } });

function friendlyError(): Response {
  return json(
    { ok: false, error: "Email is not set up yet. Please email us directly and we will get right back to you." },
    503,
  );
}

function sendFailed(): Response {
  return json(
    { ok: false, error: "Your message could not be sent just now. Please email us directly and we will get right back to you." },
    502,
  );
}

const unreadable = () => json({ ok: false, error: "Could not read your message. Please try again." }, 400);

const destination = (env: Env) => {
  const to = env.CONTACT_TO_EMAIL?.trim() ?? "";
  return env.EMAIL && EMAIL_RE.test(to) ? to : "";
};

// The sender must be on a domain with Email Routing on: the owner's own,
// never a free *.workers.dev or *.pages.dev address.
function sender(env: Env, request: Request): string {
  if (env.CONTACT_FROM_EMAIL?.trim()) return env.CONTACT_FROM_EMAIL.trim();
  const host = new URL(request.url).hostname.replace(/^www\./, "");
  if (host.endsWith(".workers.dev") || host.endsWith(".pages.dev")) return "";
  return `noreply@${host}`;
}

async function contact(request: Request, env: Env): Promise<Response> {
  // A real message is a few KB at most; refuse anything far bigger before parsing it.
  if (Number(request.headers.get("Content-Length") ?? 0) > 64 * 1024) {
    return json({ ok: false, error: "Please keep your message under 5000 characters." }, 413);
  }
  let body: Payload;
  try {
    body = (await request.json()) as Payload;
  } catch {
    return unreadable();
  }
  if (!body || typeof body !== "object") return unreadable();

  // The name goes into the email subject: one line, no control characters.
  const name = String(body.name ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
  const email = String(body.email ?? "").trim();
  const message = String(body.message ?? "").trim();

  if (!name || !email || !message) {
    return json({ ok: false, error: "Please fill in your name, email, and message." }, 400);
  }
  if (name.length > 100) {
    return json({ ok: false, error: "Please keep your name under 100 characters." }, 400);
  }
  if (!EMAIL_RE.test(email) || email.length > 254) {
    return json({ ok: false, error: "That email address does not look right. Please check it." }, 400);
  }
  if (message.length > 5000) {
    return json({ ok: false, error: "Please keep your message under 5000 characters." }, 400);
  }

  // Bot signals: honeypot filled, or sent faster than a person can type.
  // The browser measures the time on its own clock. (Comparing a browser
  // timestamp with this server's clock silently dropped real messages from
  // anyone whose phone clock runs a little fast.)
  if (String(body.leave_blank ?? "").trim() !== "") return json({ ok: true }); // pretend success
  const elapsed = Number(body.elapsed);
  if (Number.isFinite(elapsed) && elapsed >= 0 && elapsed < 3000) return json({ ok: true }); // pretend success

  const to = destination(env);
  const from = sender(env, request);
  if (!env.EMAIL || !to || !from) return friendlyError();

  // Failures are logged for the owner's AI to find: Cloudflare dashboard ->
  // Workers & Pages -> the site -> Observability (look for "Email Routing refused").
  try {
    await env.EMAIL.send({
      from: { email: from, name: "Website contact form" },
      to,
      replyTo: email,
      subject: `Website message from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
  } catch (err) {
    const e = err as { code?: string; message?: string };
    console.error(`Email Routing refused the message (${e.code ?? "no code"}): ${String(e.message ?? err).slice(0, 500)}`);
    return sendFailed();
  }

  return json({ ok: true });
}

export default {
  async fetch(request, env): Promise<Response> {
    const { pathname } = new URL(request.url);
    if (pathname === "/api/contact") {
      if (request.method === "POST") return contact(request, env);
      if (request.method === "GET") return json({ ready: Boolean(destination(env) && sender(env, request)) });
      return new Response(null, { status: 405, headers: { Allow: "GET, POST" } });
    }
    // No file matched this request: serve 404.html with a 404 status.
    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;
