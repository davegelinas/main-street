// Tiny progressive enhancement: mobile nav + contact form submit.
// FAQ uses native <details> (no JS). Year is a build-time token (no JS).

const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
const nav = document.querySelector<HTMLElement>(".site-nav");
navToggle?.addEventListener("click", () => {
  const open = nav?.classList.toggle("open") ?? false;
  navToggle.setAttribute("aria-expanded", String(open));
});

const form = document.querySelector<HTMLFormElement>("#contact-form");
const formStatus = document.querySelector<HTMLDivElement>("#form-status");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form || !formStatus) return;
  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") ?? ""),
    email: String(data.get("email") ?? ""),
    message: String(data.get("message") ?? ""),
    website: String(data.get("website") ?? ""),
    startedAt: Number(data.get("startedAt") ?? 0),
  };
  formStatus.className = "form-status show";
  formStatus.textContent = "Sending…";
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && body.ok) {
      formStatus.classList.add("ok");
      formStatus.textContent = "Thanks! Your message is on its way. We usually reply within a day.";
      form.reset();
    } else {
      formStatus.classList.add("err");
      formStatus.textContent = body.error ?? "Sorry, the form isn't working right now. Please call or email us directly.";
    }
  } catch {
    formStatus.classList.add("err");
    formStatus.textContent = "Could not reach the server. Please check your connection and try again.";
  }
});

// Stamp when the form was shown (used server-side as a bot signal).
const startedAt = document.querySelector<HTMLInputElement>('input[name="startedAt"]');
if (startedAt) startedAt.value = String(Date.now());
