function readClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "unknown";
}

export function passwordResetAudit(request) {
  return { action: "password-reset", clientIp: readClientIp(request) };
}
