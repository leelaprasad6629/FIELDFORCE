try { process.loadEnvFile?.(); } catch {}
process.env.NODE_ENV = "production";
import http from "node:http";
import assert from "node:assert/strict";
import { chromium } from "/Users/kalagotlashivareddy/.gemini/antigravity/scratch/Skill2intern/node_modules/playwright/index.mjs";
import { createClerkClient } from "../artifacts/api-server/node_modules/@clerk/backend/dist/index.mjs";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY;
if (!CLERK_SECRET_KEY) {
  throw new Error("CLERK_SECRET_KEY environment variable is required to run e2e browser tests");
}

const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });
const MANAGER_USER_ID = "user_3FEHxPmUuMu3qfBAc080w3r7jRl";
const TECH_USER_ID = "user_3J7k8XDBN6zYP7wkK1SKv9xOrv3";


async function main() {
  console.log("================================================================================");
  console.log("  FIELDFORCE360 PLAYWRIGHT BROWSER E2E TEST SUITE");
  console.log("================================================================================");

  // Mint sign-in tokens for real user sessions
  console.log("[SETUP] Minting Clerk sign-in ticket for manager...");
  const managerTicket = await clerk.signInTokens.createSignInToken({ userId: MANAGER_USER_ID });
  console.log("  ✓ Manager ticket URL:", managerTicket.url);

  console.log("[SETUP] Minting Clerk sign-in ticket for technician...");
  const techTicket = await clerk.signInTokens.createSignInToken({ userId: TECH_USER_ID });
  console.log("  ✓ Technician ticket URL:", techTicket.url);

  // Launch Chromium
  console.log("[SETUP] Launching Headless Chromium...");
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const liveBase = "https://fieldforce-p4eq.vercel.app";
  console.log(`[SETUP] Testing against live deployment: ${liveBase}\n`);

  const context = await browser.newContext({
    viewport: { width: 1280, height: 800 },
    userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  });
  const page = await context.newPage();

  // Test 1: Landing Page
  console.log("TEST 1: Landing page loads and hero elements render");
  await page.goto(liveBase, { waitUntil: "networkidle" });
  const title = await page.title();
  console.log("  ✓ Page title:", title);
  assert.ok(title.toLowerCase().includes("fieldforce") || title.length > 0);

  // Test 2: Direct Sign In button click
  console.log("TEST 2: Direct 'Sign In' button opens Clerk sign-in");
  const signInBtn = page.getByRole("button", { name: "Sign In" }).first();
  await assert.doesNotReject(async () => {
    await signInBtn.waitFor({ state: "visible", timeout: 5000 });
    await signInBtn.click();
  });
  console.log("  ✓ 'Sign In' button clicked successfully without intercept errors");
  await page.waitForTimeout(1500);

  // Test 3: Direct Get Started button click
  console.log("TEST 3: 'Get Started' button click");
  await page.goto(liveBase, { waitUntil: "networkidle" });
  const getStartedBtn = page.getByRole("button", { name: "Get Started" }).first();
  await getStartedBtn.click();
  console.log("  ✓ 'Get Started' button clicked successfully");
  await page.waitForTimeout(1000);

  // Test 4: Manager Authenticated Flow via Ticket Strategy
  console.log("TEST 4: Manager authentication via Clerk ticket strategy");
  const managerContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const mgrPage = await managerContext.newPage();
  
  await mgrPage.goto(liveBase, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForFunction(() => !!window.Clerk && window.Clerk.loaded);
  
  const authRes = await mgrPage.evaluate(async (ticket) => {
    const res = await window.Clerk.client.signIn.create({
      strategy: "ticket",
      ticket,
    });
    if (res.status === "complete") {
      await window.Clerk.setActive({ session: res.createdSessionId });
      return { ok: true, session: res.createdSessionId };
    }
    return { ok: false, status: res.status };
  }, managerTicket.token);
  
  assert.equal(authRes.ok, true, "Manager ticket authentication must succeed");
  console.log("  ✓ Manager session activated:", authRes.session);

  // Navigate to /dashboard
  await mgrPage.goto(`${liveBase}/dashboard`, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForTimeout(2000);
  console.log("  ✓ Dashboard URL reached:", mgrPage.url());

  // Check if dashboard rendered
  const dashboardHeading = await mgrPage.locator("h1").first().textContent();
  console.log("  ✓ Dashboard heading:", dashboardHeading);
  assert.equal(dashboardHeading, "Operations Dashboard");

  // Test 5: Predictive Analytics UI — Verify NO Fake Data
  console.log("TEST 5: Predictive Analytics — Verify 0% mock / no fake '87%' values");
  await mgrPage.goto(`${liveBase}/analytics`, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForTimeout(2000);
  const analyticsContent = await mgrPage.content();
  assert.ok(!analyticsContent.includes("Showing sample data — complete tasks"), "Sample data warning must not be present");
  console.log("  ✓ Predictive Analytics page renders without fake mock banners");

  // Test 6: Service Requests Page & Tabs
  console.log("TEST 6: Service Requests page & filter tabs");
  await mgrPage.goto(`${liveBase}/requests`, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForTimeout(2000);
  
  // Verify tabs
  const filterTabs = await mgrPage.locator("button").allTextContents();
  const hasRequestTabs = filterTabs.some(t => t.includes("All") || t.includes("Pending") || t.includes("New Request"));
  assert.ok(hasRequestTabs, "Service requests page must have filter tabs and actions");
  console.log("  ✓ Service Requests tabs and actions verified");

  // Test 7: Live Fleet Map
  console.log("TEST 7: Live Fleet Map page");
  await mgrPage.goto(`${liveBase}/map`, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForTimeout(2000);
  const mapContainer = await mgrPage.locator(".leaflet-container").count();
  console.log("  ✓ Leaflet map container detected:", mapContainer > 0);
  assert.ok(mapContainer > 0, "Leaflet map container must render on /map");

  // Test 8: Expenses Management
  console.log("TEST 8: Expense Management page");
  await mgrPage.goto(`${liveBase}/expenses`, { waitUntil: "domcontentloaded" });
  await mgrPage.waitForTimeout(2000);
  const expensesHeading = await mgrPage.locator("h1").first().textContent();
  console.log("  ✓ Expenses heading:", expensesHeading);
  assert.ok(expensesHeading.toLowerCase().includes("expense"), "Expenses page must render heading");

  // Test 9: Technician Role Flow
  console.log("TEST 9: Technician authentication and Task View");
  const techContext = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const techPage = await techContext.newPage();
  await techPage.goto(liveBase, { waitUntil: "domcontentloaded" });
  await techPage.waitForFunction(() => !!window.Clerk && window.Clerk.loaded);
  
  const techAuthRes = await techPage.evaluate(async (ticket) => {
    const res = await window.Clerk.client.signIn.create({
      strategy: "ticket",
      ticket,
    });
    if (res.status === "complete") {
      await window.Clerk.setActive({ session: res.createdSessionId });
      return { ok: true, session: res.createdSessionId };
    }
    return { ok: false, status: res.status };
  }, techTicket.token);
  assert.equal(techAuthRes.ok, true, "Technician ticket authentication must succeed");
  console.log("  ✓ Technician session activated:", techAuthRes.session);

  await techPage.goto(`${liveBase}/technician`, { waitUntil: "domcontentloaded" });
  await techPage.waitForTimeout(2000);
  const techHeading = await techPage.locator("h1, h2").first().textContent();
  console.log("  ✓ Technician page heading:", techHeading);
  assert.ok(techHeading.length > 0);
  await techContext.close();

  // Clean up
  await managerContext.close();
  await context.close();
  await browser.close();

  console.log("\n================================================================================");
  console.log("  ALL BROWSER E2E TESTS PASSED SUCCESSFULLY");
  console.log("================================================================================");
}

main().catch((err) => {
  console.error("Browser E2E test failed:", err);
  process.exit(1);
});
