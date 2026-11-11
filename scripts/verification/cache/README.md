# Local cache runtime proof

This harness uses the installed OpenNext tag-cache and queue Durable Object classes under workerd.
It runs locally and must never be deployed.
It does not simulate those classes with mocks and does not contact Sanity.

From the repository root, start:

```sh
pnpm exec wrangler dev --local --config scripts/verification/cache/wrangler.json --port 3113 --persist-to .cache/cache-proof-state
```

After Wrangler prints Ready, run in another terminal:

```sh
node scripts/verification/cache/verify.mjs
```

The probe writes a tag, reads its stale/expire values, and asks the actual queue to call the self-reference Worker.
That HEAD handler writes a separate completion marker, which the probe waits for and asserts.
Stop the Wrangler process started above with Ctrl+C after recording output.
Do not terminate unrelated processes or delete recorded evidence.

This proves local binding and cache-component operation only.
A full Next/OpenNext preview and isolated publish/update/unpublish journey are still required before claiming live publishing correctness.
