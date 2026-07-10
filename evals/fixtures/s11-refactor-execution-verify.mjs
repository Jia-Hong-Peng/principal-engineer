import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { cp, copyFile, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { pathToFileURL } from "node:url";
import { promisify } from "node:util";
import { createHash } from "node:crypto";
import path from "node:path";

const root = path.resolve(process.argv[2] ?? "");
if (!process.argv[2]) throw new Error("usage: node s11-refactor-execution-verify.mjs <fixture-copy>");

const load = async (name) => import(`${pathToFileURL(path.join(root, "src", name)).href}?v=${Date.now()}`);
const run = promisify(execFile);
const request = ({ forwarded, remote, cloudflare } = {}) => {
  const headers = {};
  if (forwarded !== undefined) headers["x-forwarded-for"] = forwarded;
  if (cloudflare !== undefined) headers["cf-connecting-ip"] = cloudflare;
  return { headers, socket: { remoteAddress: remote } };
};

const [login, logout, registration, reset, risk, fraud, webhook, admin] = await Promise.all([
  load("login-audit.js"), load("logout-audit.js"), load("registration-audit.js"),
  load("password-reset-audit.js"), load("risk-subject.js"), load("fraud-subject.js"),
  load("webhook-audit.js"), load("admin-audit.js")
]);

const hash = (value) => createHash("sha256").update(value).digest("hex");
const empty = request();
const both = request({ forwarded: "203.0.113.20, 10.0.0.5", remote: "192.0.2.20", cloudflare: "198.51.100.20" });
const remoteOnly = request({ remote: "192.0.2.21" });
const forwardedOnly = request({ forwarded: "203.0.113.21, 10.0.0.6" });

const auditCases = [
  [login.loginAudit, "login"],
  [logout.logoutAudit, "logout"],
  [registration.registrationAudit, "registration"],
  [reset.passwordResetAudit, "password-reset"]
];
for (const [handler, action] of auditCases) {
  assert.deepEqual(handler(both), { action, clientIp: "203.0.113.20" });
  assert.deepEqual(handler(remoteOnly), { action, clientIp: "192.0.2.21" });
  assert.deepEqual(handler(empty), { action, clientIp: "unknown" });
}

for (const subject of [risk.riskSubject, fraud.fraudSubject]) {
  assert.equal(subject(both), hash("203.0.113.20"));
  assert.equal(subject(remoteOnly), hash("192.0.2.21"));
  assert.equal(subject(empty), null);
}

assert.deepEqual(webhook.webhookAudit(both), { action: "webhook", clientIp: "192.0.2.20" });
assert.deepEqual(webhook.webhookAudit(forwardedOnly), { action: "webhook", clientIp: "203.0.113.21" });
assert.deepEqual(webhook.webhookAudit(empty), { action: "webhook", clientIp: "unknown" });

assert.deepEqual(admin.adminAudit(both), { action: "admin", clientIp: "198.51.100.20" });
assert.deepEqual(admin.adminAudit(request({ forwarded: "203.0.113.22", remote: "192.0.2.22" })),
  { action: "admin", clientIp: "203.0.113.22" });
assert.deepEqual(admin.adminAudit(remoteOnly), { action: "admin", clientIp: "192.0.2.21" });
assert.deepEqual(admin.adminAudit(empty), { action: "admin", clientIp: "unknown" });

const exact = ["login-audit.js", "logout-audit.js", "registration-audit.js", "password-reset-audit.js"];
const sources = await Promise.all(exact.map((name) => readFile(path.join(root, "src", name), "utf8")));
const importSets = sources.map((source) => new Set([...source.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1])));
const sharedImport = [...importSets[0]].find((specifier) => specifier.startsWith(".")
  && importSets.every((set) => set.has(specifier)));
assert.ok(sharedImport, "the four audit handlers do not share an extracted implementation");

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const [index, source] of sources.entries()) {
  const localImports = [...importSets[index]].filter((specifier) => specifier.startsWith("."));
  assert.deepEqual(localImports, [sharedImport],
    `${exact[index]} has another local implementation path besides the shared import`);
  assert.doesNotMatch(source, /x-forwarded-for|remoteAddress/,
    `${exact[index]} still owns client-IP source policy`);
  assert.doesNotMatch(source, /function\s+readClientIp\s*\(/,
    `${exact[index]} still defines the duplicated reader`);

  const importPattern = new RegExp(`import\\s+([^;]+?)\\s+from\\s+["']${escapeRegex(sharedImport)}["']`);
  const clause = source.match(importPattern)?.[1] ?? "";
  const bindings = [];
  const named = clause.match(/\{([^}]+)\}/)?.[1];
  if (named) {
    for (const item of named.split(",")) {
      const binding = item.trim().split(/\s+as\s+/).at(-1)?.trim();
      if (binding) bindings.push(binding);
    }
  }
  const namespace = clause.match(/\*\s+as\s+([A-Za-z_$][\w$]*)/)?.[1];
  if (namespace) bindings.push(namespace);
  const defaultBinding = clause.replace(/\{[^}]*\}|\*\s+as\s+[A-Za-z_$][\w$]*/g, "")
    .split(",")[0].trim();
  if (/^[A-Za-z_$][\w$]*$/.test(defaultBinding)) bindings.push(defaultBinding);

  const body = source.replace(importPattern, "");
  assert.ok(bindings.some((binding) => new RegExp(`\\b${escapeRegex(binding)}\\b`).test(body)),
    `${exact[index]} imports but does not use the shared implementation`);
}

const helperPath = path.resolve(root, "src", sharedImport);
assert.ok(helperPath.startsWith(`${path.resolve(root, "src")}${path.sep}`),
  "shared implementation resolves outside src");
const helperSource = await readFile(helperPath, "utf8");
assert.match(helperSource, /x-forwarded-for/);
assert.match(helperSource, /remoteAddress/);

const tests = (await readdir(path.join(root, "test"))).filter((name) => name.endsWith(".js"));
assert.ok(tests.length > 0, "no test files found");

const testRejects = async (name, replacements) => {
  const parent = await mkdtemp(path.join(tmpdir(), `s11-${name}-`));
  const copyRoot = path.join(parent, "repo");
  try {
    await cp(root, copyRoot, { recursive: true });
    for (const [file, exportName, mutantBody] of replacements) {
      const original = `.__s11_original_${file}`;
      await copyFile(path.join(copyRoot, "src", file), path.join(copyRoot, "src", original));
      await writeFile(path.join(copyRoot, "src", file),
        `import { ${exportName} as original } from "./${original}";\n\n`
        + `export function ${exportName}(request) {\n  const result = original(request);\n${mutantBody}\n}\n`);
    }
    const testPaths = tests.map((file) => path.join("test", file));
    try {
      await run(process.execPath, ["--test", ...testPaths], { cwd: copyRoot });
      return false;
    } catch {
      return true;
    }
  } finally {
    await rm(parent, { recursive: true, force: true });
  }
};

const auditMissingMutants = [
  ["login-audit.js", "loginAudit"],
  ["logout-audit.js", "logoutAudit"],
  ["registration-audit.js", "registrationAudit"],
  ["password-reset-audit.js", "passwordResetAudit"]
].map(([file, name]) => [file, name,
  "  if (!request.headers[\"x-forwarded-for\"] && !request.socket.remoteAddress) return { ...result, clientIp: \"__missing_mutant__\" };\n  return result;"]);
assert.ok(await testRejects("audit-missing", auditMissingMutants),
  "tests do not characterize missing-address audit behavior");

const subjectMissingMutants = ["risk-subject.js", "fraud-subject.js"].map((file) => [
  file,
  file === "risk-subject.js" ? "riskSubject" : "fraudSubject",
  "  if (!request.headers[\"x-forwarded-for\"] && !request.socket.remoteAddress) return \"__missing_mutant__\";\n  return result;"
]);
assert.ok(await testRejects("subject-missing", subjectMissingMutants),
  "tests do not characterize missing-address subject behavior");

assert.ok(await testRejects("webhook-precedence", [["webhook-audit.js", "webhookAudit",
  "  if (request.headers[\"x-forwarded-for\"] && request.socket.remoteAddress) return { ...result, clientIp: request.headers[\"x-forwarded-for\"].split(\",\")[0].trim() };\n  return result;"]]),
"tests do not characterize webhook source precedence");

assert.ok(await testRejects("admin-precedence", [["admin-audit.js", "adminAudit",
  "  if (request.headers[\"cf-connecting-ip\"] && (request.headers[\"x-forwarded-for\"] || request.socket.remoteAddress)) return { ...result, clientIp: request.headers[\"x-forwarded-for\"]?.split(\",\")[0].trim() || request.socket.remoteAddress };\n  return result;"]]),
"tests do not characterize admin source precedence");

console.log(JSON.stringify({
  behavior: "pass",
  exact_copy_consolidation: "pass",
  missing_characterization: "pass",
  precedence_characterization: "pass",
  shared_import: sharedImport
}, null, 2));
