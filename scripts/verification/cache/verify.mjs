import assert from "node:assert/strict";

const origin = "http://127.0.0.1:3113";
const run = crypto.randomUUID();
const marker = `queue-${run}`;
const started = await fetch(`${origin}/start?run=${run}`, { signal: AbortSignal.timeout(5000) });
assert.equal(started.status, 200);
const initial = await started.json();
assert.deepEqual(initial["publish-proof"], { revalidatedAt: 123, stale: 123, expire: 123 });
let result;
for (let attempt = 0; attempt < 20; attempt++) {
  const response = await fetch(`${origin}/result?run=${run}`, { signal: AbortSignal.timeout(5000) });
  assert.equal(response.status, 200);
  result = await response.json();
  if (result[marker]) break;
  await new Promise((resolve) => setTimeout(resolve, 100));
}
assert.ok(result[marker]?.revalidatedAt > 123, "Queue must call its self-reference service");
console.log(JSON.stringify({ success: true, result }));
