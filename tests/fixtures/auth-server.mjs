// Isolated SDK upstream for browser tests. Never used by the application itself.
import { createServer } from "node:http";

const server = createServer(async (request, response) => {
  response.setHeader("Content-Type", "application/json");
  if (request.url === "/health") return response.end('{"ok":true}');
  if (request.url?.startsWith("/auth/get-session")) {
    const exchange = request.url.includes("neon_auth_session_verifier=test-verifier") && request.headers.cookie?.includes("session_challenge=test-challenge");
    if (exchange) response.setHeader("Set-Cookie", [
      "__Secure-neon-auth.session_token=test-session; Path=/; HttpOnly; Secure; SameSite=Lax",
      "__Secure-neon-auth.session_challenge=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0",
    ]);
    if (!exchange && !request.headers.cookie?.includes("test-session")) return response.end("null");
    return response.end(JSON.stringify({
      user: { id: "test-user", name: "Alex Short", email: "alex@example.test", emailVerified: true, image: null, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
      session: { id: "test-session-id", token: "test-session", userId: "test-user", expiresAt: new Date(Date.now() + 3_600_000).toISOString(), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    }));
  }
  if (request.url === "/auth/sign-out") {
    response.setHeader("Set-Cookie", "__Secure-neon-auth.session_token=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0");
    return response.end('{"success":true}');
  }
  response.statusCode = 404;
  response.end('{"message":"Unknown test auth endpoint"}');
});
server.listen(3201, "127.0.0.1");
process.on("SIGTERM", () => server.close());
