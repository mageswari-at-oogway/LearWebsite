const DEFAULT_OWNER_EMAIL = "info@learmedical.com";
const DEFAULT_FROM_EMAIL = "Lear Medical <no-reply@learmedical.com>";
const MAX_FIELD_LENGTH = 2000;

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
    },
  });
}

function clean(value, maxLength = MAX_FIELD_LENGTH) {
  return String(value || "").replace(/\s+/g, " ").trim().slice(0, maxLength);
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function escapeHtml(value) {
  return clean(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeUrl(value, requestUrl) {
  const raw = clean(value, 600);
  if (!raw) return "";

  try {
    const url = new URL(raw, requestUrl.origin);
    if (url.origin !== requestUrl.origin) return "";
    return `${url.pathname}${url.search}`;
  } catch {
    return "";
  }
}

async function sendOwnerEmail(env, lead) {
  const apiKey = env.RESEND_API_KEY;
  if (!apiKey) {
    return { ok: false, skipped: true, reason: "RESEND_API_KEY is not configured." };
  }

  const ownerEmail = env.FORM_OWNER_EMAIL || DEFAULT_OWNER_EMAIL;
  const fromEmail = env.FORM_FROM_EMAIL || DEFAULT_FROM_EMAIL;
  const subjectPrefix = lead.type === "download" ? "Brochure download request" : "Website contact request";
  const subject = `${subjectPrefix}: ${lead.name || "Lear Medical website"}`;
  const pdfLine = lead.pdfUrl
    ? `<p><strong>Requested file:</strong> <a href="${escapeHtml(lead.siteUrl + lead.pdfUrl)}">${escapeHtml(lead.siteUrl + lead.pdfUrl)}</a></p>`
    : "";

  const html = `
    <h2>${escapeHtml(subjectPrefix)}</h2>
    <p><strong>Name:</strong> ${escapeHtml(lead.name)}</p>
    <p><strong>Email:</strong> ${escapeHtml(lead.email)}</p>
    <p><strong>Phone:</strong> ${escapeHtml(lead.phone)}</p>
    <p><strong>Organization:</strong> ${escapeHtml(lead.organization)}</p>
    <p><strong>Message:</strong><br>${escapeHtml(lead.message).replace(/\n/g, "<br>")}</p>
    ${pdfLine}
    <p><strong>Page:</strong> ${escapeHtml(lead.pageUrl)}</p>
  `;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      from: fromEmail,
      to: [ownerEmail],
      reply_to: lead.email,
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    return { ok: false, reason: text || `Resend returned ${response.status}.` };
  }

  return { ok: true };
}

export async function onRequestPost({ request, env }) {
  let payload;
  try {
    payload = await request.json();
  } catch {
    return json({ ok: false, message: "Invalid form submission." }, 400);
  }

  if (clean(payload.website)) {
    return json({ ok: true });
  }

  const requestUrl = new URL(request.url);
  const type = clean(payload.type, 40) === "download" ? "download" : "contact";
  const name = clean(payload.name, 160);
  const email = clean(payload.email, 260);
  const phone = clean(payload.phone, 80);
  const organization = clean(payload.organization, 200);
  const message = clean(payload.message);
  const pdfUrl = normalizeUrl(payload.pdfUrl, requestUrl);
  const pageUrl = clean(payload.pageUrl || request.headers.get("referer"), 800);
  const siteUrl = `${requestUrl.protocol}//${requestUrl.host}`;

  if (!name || !email || !phone) {
    return json({ ok: false, message: "Please enter your name, email, and phone number." }, 400);
  }

  if (!isEmail(email)) {
    return json({ ok: false, message: "Please enter a valid email address." }, 400);
  }

  if (type === "download" && !pdfUrl) {
    return json({ ok: false, message: "The requested download could not be found." }, 400);
  }

  const lead = {
    type,
    name,
    email,
    phone,
    organization,
    message,
    pdfUrl,
    pageUrl,
    siteUrl,
  };

  const emailResult = await sendOwnerEmail(env, lead);
  if (!emailResult.ok) {
    return json(
      {
        ok: false,
        message: emailResult.skipped
          ? "Email delivery is not configured yet."
          : "We could not send your request right now. Please try again.",
      },
      503
    );
  }

  return json({
    ok: true,
    message: type === "download" ? "Thank you. Your download is starting now." : "Thank you. Your message has been sent.",
    downloadUrl: type === "download" ? pdfUrl : "",
  });
}
