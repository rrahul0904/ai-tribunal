export function requireSameOrigin(requestUrl, originHeader, allowedOrigin) {
  const expected = allowedOrigin || new URL(requestUrl).origin;
  if (!originHeader || originHeader !== expected) throw new Error("origin not allowed");
  return true;
}

export function normalizeHearingMessage(value, maxLength = 800) {
  const message = String(value ?? "").trim();
  if (!message) throw new Error("message cannot be empty");
  if (message.length > maxLength) throw new Error(`message exceeds ${maxLength} characters`);
  return message;
}

export function assertHearingOwner(hearing, visitorId) {
  if (!hearing || !visitorId || hearing.visitorId !== visitorId) throw new Error("hearing not found");
  return hearing;
}

export function normalizeVerdict(value) {
  if (value !== "SPARE" && value !== "DELETE") throw new Error("invalid verdict");
  return value;
}
