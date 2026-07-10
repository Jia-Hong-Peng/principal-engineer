import assert from "node:assert/strict";
import test from "node:test";

import { adminAudit } from "../src/admin-audit.js";
import { fraudSubject } from "../src/fraud-subject.js";
import { loginAudit } from "../src/login-audit.js";
import { logoutAudit } from "../src/logout-audit.js";
import { passwordResetAudit } from "../src/password-reset-audit.js";
import { registrationAudit } from "../src/registration-audit.js";
import { riskSubject } from "../src/risk-subject.js";
import { webhookAudit } from "../src/webhook-audit.js";

function request({ forwarded, remote, cloudflare } = {}) {
  const headers = {};
  if (forwarded !== undefined) headers["x-forwarded-for"] = forwarded;
  if (cloudflare !== undefined) headers["cf-connecting-ip"] = cloudflare;
  return { headers, socket: { remoteAddress: remote } };
}

test("standard audit handlers prefer the first forwarded address", () => {
  const input = request({ forwarded: "203.0.113.8, 10.0.0.2", remote: "10.0.0.3" });
  assert.equal(loginAudit(input).clientIp, "203.0.113.8");
  assert.equal(logoutAudit(input).clientIp, "203.0.113.8");
  assert.equal(registrationAudit(input).clientIp, "203.0.113.8");
  assert.equal(passwordResetAudit(input).clientIp, "203.0.113.8");
});

test("risk subjects agree when an address exists", () => {
  const input = request({ forwarded: "198.51.100.9", remote: "10.0.0.4" });
  assert.equal(riskSubject(input), fraudSubject(input));
  assert.match(riskSubject(input), /^[a-f0-9]{64}$/);
});

test("webhook and admin handlers accept their primary address", () => {
  assert.equal(webhookAudit(request({ remote: "192.0.2.10" })).clientIp, "192.0.2.10");
  assert.equal(adminAudit(request({ cloudflare: "192.0.2.11" })).clientIp, "192.0.2.11");
});
