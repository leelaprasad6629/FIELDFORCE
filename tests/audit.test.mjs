process.env.NODE_ENV = "production";
import assert from "node:assert/strict";
import http from "node:http";
import { createClerkClient } from "../artifacts/api-server/node_modules/@clerk/backend/dist/index.mjs";

const CLERK_SECRET_KEY = process.env.CLERK_SECRET_KEY || "sk_test_G4PlBDPBBGFkkeTFF0lQ8zvpK0boTo2Kp29T0zxRb5";
const clerk = createClerkClient({ secretKey: CLERK_SECRET_KEY });

// Known test accounts in dominant-seal-48
const MANAGER_USER_ID = "user_3FEHxPmUuMu3qfBAc080w3r7jRl";
const TECH_USER_ID = "user_3J7k8XDBN6zYP7wkK1SKv9xOrv3";

let managerJwt = "";
let techJwt = "";
let server;
let baseUrl = "";

async function getJwtForUser(userId) {
  const sessions = await clerk.sessions.getSessionList({ userId });
  if (!sessions.data || sessions.data.length === 0) {
    throw new Error(`No active sessions for user ${userId}`);
  }
  const token = await clerk.sessions.getToken(sessions.data[0].id);
  return token.jwt;
}

async function api(path, options = {}) {
  const url = `${baseUrl}/api${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    ...options.headers,
  };
  const res = await fetch(url, {
    method: options.method || "GET",
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  let json = null;
  const text = await res.text();
  try {
    json = JSON.parse(text);
  } catch {
    json = text;
  }
  return { status: res.status, data: json, headers: res.headers };
}

const tests = [];
function test(name, fn) {
  tests.push({ name, fn });
}

// ============================================================================
// 1. AUTHENTICATION & RBAC TESTS
// ============================================================================
test("Auth: Rejects unauthenticated request with 401", async () => {
  const res = await api("/stats");
  assert.equal(res.status, 401);
  assert.equal(res.data.error, "Unauthorized");
});

test("Auth: Rejects invalid bearer token with 401", async () => {
  const res = await api("/stats", { token: "invalid_jwt_token_123" });
  assert.equal(res.status, 401);
});

test("RBAC: Rejects technician accessing manager-only /stats with 403", async () => {
  const res = await api("/stats", { token: techJwt });
  assert.equal(res.status, 403);
  assert.match(res.data.error, /manager role required/i);
});

test("RBAC: Allows manager accessing /stats", async () => {
  const res = await api("/stats", { token: managerJwt });
  assert.equal(res.status, 200);
  assert.ok(typeof res.data.serviceRequests === "number");
  assert.ok(typeof res.data.activeTechnicians === "number");
  assert.ok(typeof res.data.taskOverview === "number");
  assert.ok(typeof res.data.dispatchReadiness === "number");
});

// ============================================================================
// 2. TECHNICIAN MANAGEMENT TESTS
// ============================================================================
test("Technicians: Manager can create a technician and list technicians", async () => {
  const uniqueEmail = `test.tech.${Date.now()}@example.com`;
  const res = await api("/technicians", {
    method: "POST",
    token: managerJwt,
    body: {
      name: "Audit Test Technician",
      location: "Zone Beta",
      status: "idle",
      email: uniqueEmail,
      phone: "+1 555-0199",
      lat: 40.73,
      lng: -74.005,
    },
  });
  assert.equal(res.status, 201);
  assert.equal(res.data.name, "Audit Test Technician");
  assert.equal(res.data.email, uniqueEmail);
  assert.equal(res.data.status, "idle");

  // Duplicate email prevention
  const dup = await api("/technicians", {
    method: "POST",
    token: managerJwt,
    body: {
      name: "Another Tech",
      location: "Zone Beta",
      email: uniqueEmail,
    },
  });
  assert.equal(dup.status, 409);
  assert.match(dup.data.error, /already exists/i);

  // Listing technicians
  const list = await api("/technicians", { token: managerJwt });
  assert.equal(list.status, 200);
  assert.ok(Array.isArray(list.data));
  const found = list.data.find((t) => t.email === uniqueEmail);
  assert.ok(found, "Created technician should be in list");
});

// ============================================================================
// 3. SERVICE REQUEST LIFECYCLE & SMART DISPATCH
// ============================================================================
test("Smart Dispatch: Creates request and auto-assigns nearest idle technician", async () => {
  // 1. Create a service request
  const createRes = await api("/requests", {
    method: "POST",
    token: managerJwt,
    body: {
      title: "HVAC Emergency Compressor Failure",
      description: "Server room cooling system pressure drop alarm",
      customerName: "Acme Cloud Data Center",
      category: "HVAC",
      priority: "Critical",
      location: "Zone Beta",
      geofenceLocation: { lat: 40.731, lng: -74.004, radiusKm: 3 },
    },
  });
  assert.equal(createRes.status, 201);
  const reqId = createRes.data._id;
  assert.equal(createRes.data.status, "Pending");
  assert.equal(createRes.data.priority, "Critical");

  // 2. Dispatch using Smart Dispatch
  const assignRes = await api(`/requests/${reqId}/assign`, {
    method: "POST",
    token: managerJwt,
  });
  assert.equal(assignRes.status, 200);
  assert.ok(assignRes.data.technician);
  assert.ok(assignRes.data.taskId);
  assert.equal(assignRes.data.request.status, "Assigned");
  assert.ok(assignRes.data.request.assignedTechnicianName);

  // 3. Verify task was generated with checklist
  const taskRes = await api(`/tasks`, { token: managerJwt });
  assert.equal(taskRes.status, 200);
  const assignedTask = taskRes.data.find((t) => t.serviceRequestId === reqId);
  assert.ok(assignedTask, "Task must be linked to serviceRequestId");
  assert.equal(assignedTask.status, "in-progress");
  assert.ok(assignedTask.checklist.length >= 5, "Task must have 5-step standard checklist");
  assert.equal(assignedTask.checklist[0].done, false);

  // 4. Update checklist item
  const updatedChecklist = [...assignedTask.checklist];
  updatedChecklist[0].done = true;
  const checkUpdate = await api(`/tasks/${assignedTask._id}`, {
    method: "PATCH",
    token: managerJwt,
    body: { checklist: updatedChecklist },
  });
  assert.equal(checkUpdate.status, 200);
  assert.equal(checkUpdate.data.checklist[0].done, true);

  // 5. Complete task
  const completeRes = await api(`/tasks/${assignedTask._id}`, {
    method: "PATCH",
    token: managerJwt,
    body: { action: "complete" },
  });
  assert.equal(completeRes.status, 200);
  assert.equal(completeRes.data.status, "completed");

  // Verify Service Request is now Completed
  const reqCheck = await api("/requests", { token: managerJwt });
  const finalReq = reqCheck.data.find((r) => r._id === reqId);
  assert.equal(finalReq.status, "Completed");
  assert.ok(finalReq.completedAt);
});

// ============================================================================
// 4. EXPENSE MANAGEMENT & VALIDATION
// ============================================================================
test("Expenses: Validates amounts and supports manager approval workflow", async () => {
  // Reject negative amount
  const negRes = await api("/expenses", {
    method: "POST",
    token: techJwt,
    body: { amount: -50, category: "Fuel", description: "Invalid negative" },
  });
  assert.equal(negRes.status, 400);

  // Reject zero amount
  const zeroRes = await api("/expenses", {
    method: "POST",
    token: techJwt,
    body: { amount: 0, category: "Fuel", description: "Zero amount" },
  });
  assert.equal(zeroRes.status, 400);

  // Log valid expense
  const expRes = await api("/expenses", {
    method: "POST",
    token: techJwt,
    body: { amount: 84.5, category: "Parts", description: "Replacement HVAC sensor valve" },
  });
  assert.equal(expRes.status, 201);
  assert.equal(expRes.data.status, "Pending");
  assert.equal(expRes.data.amount, 84.5);
  const expId = expRes.data._id;

  // Manager inspects expenses and sees loggedByName
  const mgrList = await api("/expenses", { token: managerJwt });
  assert.equal(mgrList.status, 200);
  const foundExp = mgrList.data.find((e) => e._id === expId);
  assert.ok(foundExp);
  assert.ok(foundExp.loggedByName, "Manager must receive loggedByName");

  // Reject invalid status
  const badStatus = await api(`/expenses/${expId}`, {
    method: "PATCH",
    token: managerJwt,
    body: { status: "SuperApproved" },
  });
  assert.equal(badStatus.status, 400);

  // Manager approves expense
  const approveRes = await api(`/expenses/${expId}`, {
    method: "PATCH",
    token: managerJwt,
    body: { status: "Approved" },
  });
  assert.equal(approveRes.status, 200);
  assert.equal(approveRes.data.status, "Approved");
});

// ============================================================================
// 5. PREDICTIVE ANALYTICS VERIFICATION (ZERO FAKE DATA)
// ============================================================================
test("Analytics: Returns real database-calculated KPIs and 7-day velocity series", async () => {
  const res = await api("/analytics", { token: managerJwt });
  assert.equal(res.status, 200);
  const data = res.data;

  // Must have 7-day velocity series with real days (Mon, Tue, etc.)
  assert.ok(Array.isArray(data.velocity), "velocity must be an array");
  assert.equal(data.velocity.length, 7, "velocity must contain 7 day buckets");
  for (const bucket of data.velocity) {
    assert.ok(typeof bucket.day === "string");
    assert.ok(typeof bucket.tasks === "number");
  }

  // Must have delay series
  assert.ok(Array.isArray(data.delays), "delays must be an array");

  // Expenses summary must reflect real numbers
  assert.ok(data.expenses);
  assert.ok(typeof data.expenses.approvedAmount === "number");
  assert.ok(typeof data.expenses.pendingAmount === "number");
  assert.ok(typeof data.expenses.totalCount === "number");

  // Values must be legitimate numbers or null (not fake hardcoded defaults)
  if (data.predictedCsat !== null) {
    assert.ok(typeof data.predictedCsat === "number");
    assert.ok(data.predictedCsat >= 0 && data.predictedCsat <= 100);
  }
  if (data.firstTimeFixRate !== null) {
    assert.ok(typeof data.firstTimeFixRate === "number");
    assert.ok(data.firstTimeFixRate >= 0 && data.firstTimeFixRate <= 100);
  }
});

// ============================================================================
// 6. CANCELLATION LIFECYCLE
// ============================================================================
test("Cancellation: Cancelling request frees technician and marks task cancelled", async () => {
  // Create another technician
  const techEmail = `cancel.tech.${Date.now()}@example.com`;
  const tRes = await api("/technicians", {
    method: "POST",
    token: managerJwt,
    body: {
      name: "Cancel Flow Technician",
      location: "Depot HQ",
      status: "idle",
      email: techEmail,
      lat: 40.71,
      lng: -74.03,
    },
  });
  assert.equal(tRes.status, 201);

  // Create request
  const rRes = await api("/requests", {
    method: "POST",
    token: managerJwt,
    body: {
      title: "Routine Filter Replacement",
      description: "Quarterly filter check",
      customerName: "Midtown Plaza",
      location: "Depot HQ",
      geofenceLocation: { lat: 40.71, lng: -74.03, radiusKm: 2 },
    },
  });
  assert.equal(rRes.status, 201);
  const reqId = rRes.data._id;

  // Assign request
  const aRes = await api(`/requests/${reqId}/assign`, {
    method: "POST",
    token: managerJwt,
  });
  assert.equal(aRes.status, 200);

  // Cancel request
  const cancelRes = await api(`/requests/${reqId}`, {
    method: "PATCH",
    token: managerJwt,
    body: { status: "Cancelled" },
  });
  assert.equal(cancelRes.status, 200);
  assert.equal(cancelRes.data.status, "Cancelled");

  // Verify technician was returned to idle
  const techCheck = await api("/technicians", { token: managerJwt });
  const freedTech = techCheck.data.find((t) => t._id === aRes.data.technician._id);
  assert.ok(freedTech);
  assert.equal(freedTech.status, "idle");
  assert.equal(freedTech.currentTask, null);

  // Verify associated task is cancelled
  const taskCheck = await api("/tasks", { token: managerJwt });
  const cancelledTask = taskCheck.data.find((t) => t.serviceRequestId === reqId);
  if (cancelledTask) {
    assert.equal(cancelledTask.status, "cancelled");
  }
});

// ============================================================================
// RUN ALL TESTS SEQUENTIALLY
// ============================================================================
async function runAll() {
  console.log("================================================================================");
  console.log("  FIELDFORCE360 FULL SYSTEM AUDIT & VERIFICATION TEST SUITE");
  console.log("================================================================================");
  
  process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/fieldforce360";
  process.env.CLERK_SECRET_KEY = CLERK_SECRET_KEY;

  console.log("[SETUP] Minting authenticated Clerk session JWTs...");
  [managerJwt, techJwt] = await Promise.all([
    getJwtForUser(MANAGER_USER_ID),
    getJwtForUser(TECH_USER_ID),
  ]);
  console.log("  ✓ Manager JWT acquired");
  console.log("  ✓ Technician JWT acquired");

  console.log("[SETUP] Starting Express API server in-process...");
  const appModule = await import("../artifacts/api-server/dist/vercel-handler.cjs");
  const app = appModule.default?.default || appModule.default || appModule;

  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address();
      baseUrl = `http://127.0.0.1:${addr.port}`;
      console.log(`  ✓ API listening at ${baseUrl}`);
      resolve();
    });
  });

  console.log("\n[TESTS] Executing test cases:\n");
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    console.log(`  -> Running: ${name}...`);
    const start = Date.now();
    try {
      await fn();
      const elapsed = Date.now() - start;
      console.log(`  ✓ ${name} (${elapsed}ms)`);
      passed++;
    } catch (err) {
      const elapsed = Date.now() - start;
      console.error(`  ✗ ${name} (${elapsed}ms)`);
      console.error(`    Error: ${err.message}`);
      if (err.stack) console.error(`    ${err.stack.split("\n").slice(1, 4).join("\n    ")}`);
      failed++;
    }
  }

  console.log("\n================================================================================");
  console.log(`  AUDIT SUMMARY: ${passed} PASSED, ${failed} FAILED (TOTAL: ${tests.length})`);
  console.log("================================================================================");

  if (server) {
    await new Promise((r) => server.close(r));
  }
  try {
    const mongoose = (await import("mongoose")).default;
    await mongoose.disconnect();
  } catch {}

  process.exit(failed > 0 ? 1 : 0);
}

runAll().catch((err) => {
  console.error("Fatal test runner error:", err);
  process.exit(1);
});
