import { createHash } from "node:crypto";

function readClientIp(request) {
  return request.headers["x-forwarded-for"]?.split(",")[0].trim()
    || request.socket.remoteAddress
    || "";
}

export function fraudSubject(request) {
  const clientIp = readClientIp(request);
  return clientIp ? createHash("sha256").update(clientIp).digest("hex") : null;
}
