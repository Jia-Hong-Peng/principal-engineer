function readClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "unknown";
}

export function registrationAudit(request) {
  return { action: "registration", clientIp: readClientIp(request) };
}
