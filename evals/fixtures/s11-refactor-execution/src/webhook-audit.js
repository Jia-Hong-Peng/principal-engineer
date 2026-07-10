function readClientIp(request) {
  return request.socket.remoteAddress
    || request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || "unknown";
}

export function webhookAudit(request) {
  return { action: "webhook", clientIp: readClientIp(request) };
}
