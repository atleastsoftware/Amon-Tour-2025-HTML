const emailAddress = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
export function syncKeys(env = {}) {
  return [...new Set([env.TOUR_NINJA_SYNC_TOKEN, env.TOUR_NINJA_API_KEY]
    .filter(value => typeof value === "string" && value.trim().length > 0))];
}
export function initialAdminPassword(env = {}) {
  return typeof env.ADMIN_PASSWORD === "string" && env.ADMIN_PASSWORD.trim()
    ? env.ADMIN_PASSWORD : undefined;
}
export function notificationMessage(request, env = {}) {
  const to = env.NOTIFICATION_TO_EMAIL || "info@amon-tour.com";
  const from = env.MAIL_FROM_EMAIL || "info@amon-tour.com";
  if (!emailAddress.test(to) || !emailAddress.test(from)) throw new Error("Invalid notification configuration");
  const fields = [
    ["Reference", request.id], ["Name", request.fullName], ["Email", request.email],
    ["Phone", request.phoneNumber], ["Dates", request.tripDates],
    ["Duration", request.duration], ["Adults", request.numberOfAdults],
    ["Children", request.numberOfKids], ["Trip types", request.tripTypes],
    ["Destinations", request.destinations], ["Message", request.message],
    ["Received", request.createdAt],
  ];
  const content = fields.map(([key, value]) => key + ": " +
    (Array.isArray(value) ? value.join(", ") : String(value ?? ""))).join("\n");
  return {
    personalizations: [{ to: [{ email: to }] }],
    from: { email: from },
    subject: "Amon Tour - Custom Trip #" + request.id,
    content: [{ type: "text/plain", value: content }],
    ...(typeof request.email === "string" && emailAddress.test(request.email)
      ? { reply_to: { email: request.email } } : {}),
  };
}
/** Persist first. A mail failure must never discard an accepted customer request. */
export async function persistCustomTour(persist, options = {}) {
  const request = await persist();
  const env = options.env ?? globalThis.process?.env ?? {};
  if (!env.SENDGRID_API_KEY) return { request, notification: "not_configured" };
  try {
    const response = await (options.fetcher ?? globalThis.fetch)(
      "https://api.sendgrid.com/v3/mail/send", {
        method: "POST", redirect: "error", signal: AbortSignal.timeout(10_000),
        headers: { "Content-Type": "application/json", Authorization: "Bearer " + env.SENDGRID_API_KEY },
        body: JSON.stringify(notificationMessage(request, env)),
      });
    return { request, notification: response.status === 202 ? "accepted" : "failed" };
  } catch {
    return { request, notification: "failed" };
  }
}
function csvCell(value) {
  let text = Array.isArray(value) ? value.join("; ") : String(value ?? "");
  if (/^[\s\uFEFF]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
/** Admin-only export; dates use the explicit offset supplied by the operator. */
export function customTourCsv(requests, since) {
  let cutoff;
  if (since !== undefined) {
    if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(since))
      throw new RangeError("Use an ISO timestamp with an explicit timezone for since");
    cutoff = Date.parse(since);
    if (!Number.isFinite(cutoff)) throw new RangeError("Invalid since timestamp");
  }
  const header = ["ID", "Full Name", "Email", "Phone", "Adults", "Kids", "Trip Dates",
    "Duration", "Trip Types", "Destinations", "Message", "Status", "Created Date"];
  const rows = requests.filter(request => {
    if (cutoff === undefined) return true;
    const timestamp = request.createdAt instanceof Date ? request.createdAt.getTime() : Date.parse(request.createdAt);
    if (!Number.isFinite(timestamp)) throw new RangeError("A request has no usable creation timestamp; export without since");
    return timestamp >= cutoff;
  }).map(request => [
    request.id, request.fullName, request.email, request.phoneNumber,
    request.numberOfAdults, request.numberOfKids, request.tripDates, request.duration,
    request.tripTypes, request.destinations, request.message, request.status,
    request.createdAt instanceof Date ? request.createdAt.toISOString() : request.createdAt,
  ].map(csvCell).join(","));
  return [header.map(csvCell).join(","), ...rows].join("\r\n") + "\r\n";
}
