const fs = require("fs");
const path = require("path");
const core = require("../id/registry-core");

const file = process.env.REGISTRY_FILE || path.join(__dirname, "..", "data", "id-registry.json");
const raw = process.env.OP || "";
if (!raw) {
  console.log("no operation");
  process.exit(0);
}
let op;
try {
  op = JSON.parse(raw);
  if (typeof op === "string") op = JSON.parse(op);
} catch (error) {
  console.error("bad operation");
  process.exit(1);
}
const registry = JSON.parse(fs.readFileSync(file, "utf8").replace(/^\uFEFF/, ""));
const result = core.apply(registry, op);
if (!result.changed) {
  console.log(JSON.stringify({ status: result.status, changed: false }));
  process.exit(result.status >= 400 && result.status !== 409 ? 1 : 0);
}
fs.writeFileSync(file, JSON.stringify(registry));
console.log(JSON.stringify({ status: result.status, changed: true }));
