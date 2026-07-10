function readClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "unknown";
}

export function loginAudit(request) {
  return { action: "login", clientIp: readClientIp(request) };
}
