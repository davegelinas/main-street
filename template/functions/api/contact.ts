// POST /api/contact: contact form handler (Cloudflare Pages Function).
// Sends via Resend. Gracefully degrades when RESEND_API_KEY is not set.

interface Env {
  RESEND_API_KEY?: string;
  FROM_EMAIL?: string; // optional override; defaults to noreply@<site domain>
  CONTACT_TO_EMAIL?: string; // where messages are delivered; set in Pages env vars
}

interface Payload {
  name?: unknown;
  email?: unknown;
  message?: unknown;
  leave_blank?: unknown; // honeypot: must stay empty (not named "website", which autofill can fill)
  elapsed?: unknown; // ms the visitor spent on the page before sending (their own clock)
}

const json = (data: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "Content-Type": "application/json" } });

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

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;

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
  if (!/^[^\s@<>,;"]+@[^\s@<>,;"]+\.[^\s@<>,;"]+$/.test(email) || email.length > 254) {
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

  const apiKey = env.RESEND_API_KEY;
  const to = env.CONTACT_TO_EMAIL;
  if (!apiKey || !to) return friendlyError();

  const host = new URL(request.url).hostname.replace(/^www\./, "");
  // Resend only sends from a verified domain: the owner's own, never *.pages.dev.
  if (!env.FROM_EMAIL && host.endsWith(".pages.dev")) return friendlyError();
  const from = env.FROM_EMAIL ?? `noreply@${host}`;

  // Failures are logged for the owner's AI to find: Cloudflare dashboard ->
  // Workers & Pages -> the project -> the deployment -> Functions (real-time logs).
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `Website message from ${name}`,
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      }),
    });
    if (!res.ok) {
      console.error(`Resend refused the message (HTTP ${res.status}): ${(await res.text()).slice(0, 500)}`);
      return sendFailed();
    }
  } catch (err) {
    console.error("Could not reach Resend:", err);
    return sendFailed();
  }

  return json({ ok: true });
};
