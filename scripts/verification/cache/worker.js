import { DOShardedTagCache } from "@opennextjs/cloudflare/durable-objects/sharded-tag-cache";
import { DOQueueHandler } from "@opennextjs/cloudflare/durable-objects/queue";

export { DOShardedTagCache, DOQueueHandler };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const run = url.searchParams.get("run");
    if (!run) return new Response("run is required", { status: 400 });

    const marker = `queue-${run}`;
    const tags = env.NEXT_TAG_CACHE_DO_SHARDED.get(
      env.NEXT_TAG_CACHE_DO_SHARDED.idFromName("proof"),
    );
    if (request.method === "HEAD") {
      await tags.writeTags([{ tag: marker, stale: Date.now(), expire: Date.now() }]);
      return new Response(null, { headers: { "x-nextjs-cache": "REVALIDATED" } });
    }
    if (url.pathname === "/start") {
      await tags.writeTags([{ tag: "publish-proof", stale: 123, expire: 123 }]);
      const queue = env.NEXT_CACHE_DO_QUEUE.get(env.NEXT_CACHE_DO_QUEUE.idFromName("proof"));
      await queue.revalidate({
        MessageDeduplicationId: crypto.randomUUID(),
        MessageGroupId: "proof",
        MessageBody: { host: "localhost", url: `/refresh?run=${encodeURIComponent(run)}`, lastModified: 0 },
      });
    }
    return Response.json(await tags.getTagData(["publish-proof", marker]));
  },
};
