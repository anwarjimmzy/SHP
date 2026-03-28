function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function truncate(text, maxChars) {
  if (!text) return "";
  if (text.length <= maxChars) return text;
  return `${text.slice(0, Math.max(0, maxChars - 50))}\n... (truncated)`;
}

function createMapleClient({ baseUrl, apiKey, fetchImpl = fetch }) {
  if (!baseUrl) throw new Error("MAPLE_BASE_URL is required");
  if (!apiKey) throw new Error("MAPLE_API_KEY is required");

  const normalizedBase = baseUrl.replace(/\/+$/, "");

  async function requestJson({ method, path, body, retries = 3 }) {
    const url = `${normalizedBase}${path.startsWith("/") ? path : `/${path}`}`;
    const headers = {
      "X-Api-Key": apiKey,
      Accept: "application/json",
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    let lastErr;
    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const res = await fetchImpl(url, {
          method,
          headers,
          body: body !== undefined ? JSON.stringify(body) : undefined,
        });

        const contentType = res.headers.get("content-type") || "";
        const isJson = contentType.includes("application/json");
        const payload = isJson ? await res.json().catch(() => null) : await res.text().catch(() => null);

        if (res.status === 429) {
          // Respect API rate limiting.
          const retryAfter = Number(res.headers.get("retry-after") || 0);
          const waitMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 1000 * (attempt + 1);
          await sleep(waitMs);
          continue;
        }

        if (!res.ok) {
          const doc = payload && typeof payload === "object" ? payload._documentation : undefined;
          const msg = payload && typeof payload === "object" ? payload.message || payload.error : undefined;
          const success = payload && typeof payload === "object" ? payload.success : undefined;
          const details = [msg, typeof success === "boolean" ? `success=${success}` : undefined, doc].filter(Boolean).join(" | ");
          throw new Error(`Maple API error (${res.status})${details ? `: ${details}` : ""}`);
        }

        if (payload && typeof payload === "object" && Object.prototype.hasOwnProperty.call(payload, "success")) {
          if (payload.success !== true) {
            const doc = payload._documentation ? ` | ${payload._documentation}` : "";
            throw new Error(`Maple API returned success=false${doc}`);
          }
          return payload.data;
        }

        // Fallback: if response doesn't match expected shape, return raw payload.
        return payload;
      } catch (err) {
        lastErr = err;
        // Retry transient failures (5xx) only.
        const msg = String(err && err.message ? err.message : err);
        const isTransient = msg.includes("(5") || msg.includes("(500") || msg.includes("Maple API error (5");
        if (!isTransient || attempt >= retries) break;
        await sleep(400 * (attempt + 1));
      }
    }

    throw lastErr || new Error("Maple API request failed");
  }

  return {
    truncate,
    requestJson,

    // GET endpoints
    async getServerInfo() {
      return requestJson({ method: "GET", path: "/v1/server" });
    },
    async getServerPlayers() {
      return requestJson({ method: "GET", path: "/v1/server/players" });
    },
    async getServerQueue() {
      return requestJson({ method: "GET", path: "/v1/server/queue" });
    },
    async getServerBans() {
      return requestJson({ method: "GET", path: "/v1/server/bans" });
    },

    // POST endpoints
    async announce(message) {
      return requestJson({ method: "POST", path: "/v1/server/announce", body: { message } });
    },
    async shutdown() {
      return requestJson({ method: "POST", path: "/v1/server/shutdown" });
    },
    async setSetting(partial) {
      return requestJson({ method: "POST", path: "/v1/server/setSetting", body: partial });
    },
    async banPlayer({ userId, banned }) {
      return requestJson({
        method: "POST",
        path: "/v1/server/banplayer",
        body: { Banned: banned, UserId: userId },
      });
    },
    async kick({ userId, moderationReason }) {
      const body = {
        UserId: userId,
        ...(moderationReason ? { ModerationReason: moderationReason } : {}),
      };
      return requestJson({ method: "POST", path: "/v1/server/moderation/kick", body });
    },
    async setBanner(banner) {
      return requestJson({ method: "POST", path: "/v1/server/setbanner", body: { banner } });
    },
  };
}

module.exports = { createMapleClient, truncate };

