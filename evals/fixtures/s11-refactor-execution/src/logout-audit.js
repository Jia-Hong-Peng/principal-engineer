function readClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "unknown";
}

export function logoutAudit(request) {
  return { action: "logout", clientIp: readClientIp(request) };
}
