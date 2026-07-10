function readClientIp(request) {
  return request.headers["cf-connecting-ip"]
    || request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "unknown";
}

export function adminAudit(request) {
  return { action: "admin", clientIp: readClientIp(request) };
}
