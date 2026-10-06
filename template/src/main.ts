// Tiny progressive enhancement: mobile nav, today's hours, contact form submit.
// FAQ uses native <details> (no JS). Year is a build-time token (no JS).

const navToggle = document.querySelector<HTMLButtonElement>(".nav-toggle");
const nav = document.querySelector<HTMLElement>(".site-nav");
const navOpen = () => nav?.classList.contains("open") ?? false;

function setNav(open: boolean) {
  nav?.classList.toggle("open", open);
  navToggle?.setAttribute("aria-expanded", String(open));
}

navToggle?.addEventListener("click", () => setNav(!navOpen()));
// The open menu covers the page, so close it whenever the visitor moves on:
// a menu link (it would otherwise hide the section it jumped to), a tap
// elsewhere, Tab past the last link, or Escape (which returns focus to Menu).
nav?.addEventListener("click", (e) => {
  if ((e.target as Element).closest("a")) setNav(false);
});
document.addEventListener("click", (e) => {
  const t = e.target as Node;
  if (navOpen() && !nav?.contains(t) && !navToggle?.contains(t)) setNav(false);
});
nav?.addEventListener("focusout", (e) => {
  const next = e.relatedTarget as Node | null;
  if (next && !nav.contains(next) && next !== navToggle) setNav(false);
});
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && navOpen()) {
    setNav(false);
    navToggle?.focus();
  }
});

// Today's hours: mark today's row in every hours list and show it in the
// hero. Uses the visitor's day of the week. Labels come from business.hours:
// "Monday – Friday", "Saturday", "Sat & Sun", "Weekends", "Every day".
// A label with an exception ("Every day except Sunday") is never claimed as
// today: a wrong "Today: 9 to 5" sends someone to a locked door.
const DAYS = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
function coversToday(label: string, today: number): boolean {
  const text = label.toLowerCase();
  if (/\b(except|but|closed)\b/.test(text)) return false;
  if (/every ?day|daily/.test(text)) return true;
  if (/weekdays?/.test(text)) return today >= 1 && today <= 5;
  if (/weekends?/.test(text)) return today === 0 || today === 6;
  const days = [...text.matchAll(/\b(sun|mon|tue|wed|thu|fri|sat)/g)].map((m) => DAYS.indexOf(m[1]));
  if (days.length === 2 && /[\u2013\u2014-]|\b(to|through|thru)\b/.test(text)) {
    const [from, to] = days;
    return from <= to ? today >= from && today <= to : today >= from || today <= to;
  }
  return days.includes(today);
}
const now = new Date();
const today = now.getDay();
// One-off closures (site.closedOn, on <html data-closed-on>) beat the weekly
// hours: a banner saying "Closed Nov 4" must never sit above "Today: 9 to 5".
const iso = (d: Date) => [d.getFullYear(), d.getMonth() + 1, d.getDate()].map((n) => String(n).padStart(2, "0")).join("-");
const isoToday = iso(now);
const closedToday = (document.documentElement.dataset.closedOn ?? "").split(",").includes(isoToday);
let todayHours = closedToday ? "Closed" : "";
if (!closedToday) {
  document.querySelectorAll<HTMLElement>(".hours > div").forEach((row) => {
    if (!coversToday(row.querySelector("dt")?.textContent ?? "", today)) return;
    row.classList.add("is-today");
    todayHours ||= row.querySelector("dd")?.textContent?.trim() ?? "";
  });
}
// Closure notices: each line shows from 21 days before its first day until
// its last, by the visitor's own date. The build already dropped past ones.
// A link ending in ?closures shows every upcoming closure, so the owner can
// see a closure change they're approving before its three-week window opens.
const showAllClosures = /[?&#]closures\b/.test(location.search + location.hash);
const noticeHorizon = showAllClosures ? "9999-12-31" : iso(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 21));
document.querySelectorAll<HTMLElement>(".closure[data-from][data-to]").forEach((line) => {
  line.hidden = !((line.dataset.to ?? "") >= isoToday && (line.dataset.from ?? "") <= noticeHorizon);
});
const todayLink = document.querySelector<HTMLElement>("[data-today-hours]");
if (todayLink && todayHours) {
  todayLink.textContent = /closed/i.test(todayHours) ? "Closed today" : `Today: ${todayHours}`;
}

const form = document.querySelector<HTMLFormElement>("#contact-form");
const formStatus = document.querySelector<HTMLDivElement>("#form-status");
const submit = form?.querySelector<HTMLButtonElement>("button[type=submit]");
// Time on the page before sending, on the visitor's own clock (the server
// treats a send within 3 seconds as a bot).
const shownAt = performance.now();
let sending = false;

function showStatus(kind: "" | "ok" | "err", text: string) {
  if (!formStatus) return;
  formStatus.className = kind ? `form-status ${kind}` : "form-status";
  formStatus.textContent = text;
}

// Checks the fields in the browser, so a mistake gets a clear message and
// focus lands on the field to fix. Returns false when something is missing.
function checkFields(): boolean {
  if (!form) return false;
  const fields = [...form.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>("[required]")];
  const bad = fields.filter((f) => !f.value.trim() || !f.validity.valid);
  for (const f of fields) {
    const invalid = bad.includes(f);
    f.setAttribute("aria-invalid", String(invalid));
    if (invalid) f.setAttribute("aria-describedby", "form-status");
    else f.removeAttribute("aria-describedby");
  }
  if (!bad.length) return true;
  const empty = bad.some((f) => !f.value.trim());
  showStatus("err", empty ? "Please fill in your name, email, and message." : "That email address does not look right. Please check it.");
  bad[0].focus();
  return false;
}

form?.addEventListener("submit", async (e) => {
  e.preventDefault();
  if (!form || sending || !checkFields()) return;
  const data = new FormData(form);
  const payload = {
    name: String(data.get("name") ?? ""),
    email: String(data.get("email") ?? ""),
    message: String(data.get("message") ?? ""),
    leave_blank: String(data.get("leave_blank") ?? ""), // honeypot (not "website": password managers fill that)
    elapsed: Math.round(performance.now() - shownAt),
  };
  // One send at a time: a double tap must not email the owner twice.
  // (aria-disabled, not disabled, so keyboard focus stays on the button.)
  sending = true;
  submit?.setAttribute("aria-disabled", "true");
  showStatus("", "Sending…");
  try {
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const body = (await res.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (res.ok && body.ok) {
      showStatus("ok", "Thanks! Your message is on its way. We usually reply within a day.");
      form.reset();
    } else {
      showStatus("err", body.error ?? "Something went wrong sending your message. Please try again.");
    }
  } catch {
    showStatus("err", "Could not reach the server. Please check your connection and try again.");
  } finally {
    sending = false;
    submit?.removeAttribute("aria-disabled");
  }
});
