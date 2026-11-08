import { expect, test } from "@playwright/test";

test("new visitor sees Google login and can continue as guest across refresh", async ({ page }) => {
  await page.goto("/");
  const dialog = page.getByRole("dialog", { name: "Welcome to Shorty" });
  await expect(dialog).toBeVisible();
  await page.screenshot({ path: "test-results/login-desktop.png" });
  await expect(dialog.getByRole("button", { name: "Continue with Google" })).toBeVisible();
  await dialog.getByRole("button", { name: "Continue as guest" }).click();
  await expect(dialog).not.toBeVisible();
  await expect(page.getByText("Guest mode", { exact: true })).toBeVisible();
  await page.reload();
  await expect(dialog).not.toBeVisible();
  await page.getByRole("button", { name: "Log in", exact: true }).click();
  await expect(dialog).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(dialog).not.toBeVisible();
  await expect(page.getByRole("button", { name: "Log in", exact: true })).toBeFocused();
});

test("guest preference never grants access to account pages", async ({ page, context }) => {
  await context.addCookies([{ name: "shorty_guest", value: "1", url: "http://localhost:3100" }]);
  await page.goto("/account");
  await expect(page).toHaveURL(/\/?login=1/);
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("alex@example.test")).toHaveCount(0);
});

test("Google failure is recoverable and guest access still works", async ({ page }) => {
  await page.route("**/api/auth/sign-in/social", (route) => route.fulfill({
    status: 502,
    json: { code: "NETWORK_ERROR", message: "Auth service unavailable" },
  }));
  await page.goto("/");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("try again");
  await expect(page.getByRole("button", { name: "Continue with Google" })).toBeEnabled();
  await page.getByRole("button", { name: "Continue as guest" }).click();
  await expect(page.getByRole("dialog")).not.toBeVisible();
});

test("Google request uses the fixed callback and follows the provider redirect", async ({ page }) => {
  await page.route("**/api/auth/sign-in/social", async (route) => {
    const body = route.request().postDataJSON();
    expect(body.provider).toBe("google");
    expect(body.callbackURL).toBe("http://localhost:3100/auth/callback");
    await route.fulfill({ json: { redirect: true, url: "https://accounts.google.com/shorty-test" } });
  });
  await page.route("https://accounts.google.com/shorty-test", (route) => route.fulfill({ contentType: "text/html", body: "<h1>Google sign-in test</h1>" }));
  await page.goto("/");
  await page.getByRole("button", { name: "Continue with Google" }).click();
  await expect(page).toHaveURL("https://accounts.google.com/shorty-test");
});

test("callback without a verified session shows a retryable error", async ({ page }) => {
  await page.goto("/auth/callback");
  await expect(page).toHaveURL(/authError=1/);
  await expect(page.getByRole("dialog").getByRole("alert")).toContainText("try again");
});

test("restores a verified session and signs out", async ({ context, page }) => {
  await context.addCookies([{ name: "__Secure-neon-auth.session_token", value: "test-session", domain: "localhost", path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/");
  await expect(page.getByRole("link", { name: "My account" })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  await page.getByRole("link", { name: "My account" }).click();
  await expect(page.getByText("alex@example.test")).toBeVisible();
  await page.reload();
  await expect(page.getByText("alex@example.test")).toBeVisible();
  await page.getByRole("button", { name: "Sign out" }).click();
  await expect(page).toHaveURL("http://localhost:3100/");
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.goto("/account");
  await expect(page).toHaveURL(/login=1/);
});

test("email login and non-Google OAuth requests are rejected", async ({ request }) => {
  expect((await request.post("/api/auth/sign-in/email", { data: {} })).status()).toBe(404);
  expect((await request.post("/api/auth/sign-in/social", { data: { provider: "github" } })).status()).toBe(400);
  expect((await request.post("/api/auth/sign-in/social", { data: { provider: "google", callbackURL: "https://evil.example" } })).status()).toBe(400);
});

test("popup fits on mobile without horizontal scrolling", async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto("/");
  await expect(page.getByRole("dialog")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  await page.screenshot({ path: "test-results/login-mobile.png" });
});


test("OAuth callback exchanges the verifier and establishes a session", async ({ context, page }) => {
  await context.addCookies([{ name: "__Secure-neon-auth.session_challenge", value: "test-challenge", domain: "localhost", path: "/", secure: true, httpOnly: true, sameSite: "Lax" }]);
  await page.goto("/auth/callback?neon_auth_session_verifier=test-verifier");
  await expect(page).toHaveURL("http://localhost:3100/");
  await expect(page.getByRole("link", { name: "My account" })).toBeVisible();
  await expect(page.getByRole("dialog")).not.toBeVisible();
  const sessionCookie = (await context.cookies()).find((cookie) => cookie.name === "__Secure-neon-auth.session_token");
  expect(sessionCookie?.httpOnly).toBe(true);
  expect(sessionCookie?.secure).toBe(true);
});
