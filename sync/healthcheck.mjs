#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// RtR Control Tower — MRP Sync Healthcheck
// Queries sync_runs to detect missed or failing syncs
// Run via cron: */15 * * * * node /path/to/healthcheck.mjs
// ═══════════════════════════════════════════════════════════

function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(`[healthcheck] Missing required env var: ${key}`);
  }
  return value;
}

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_KEY = requireEnv("SUPABASE_SERVICE_KEY");

const STALE_MINUTES = 90;
const CONSECUTIVE_FAILURES = 3;

async function check() {
  const headers = {
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };

  // Get last N runs for MRP, newest first
  const res = await fetch(
    `${SUPABASE_URL}/rest/v1/sync_runs?source_app=eq.MRP&order=started_at.desc&limit=${CONSECUTIVE_FAILURES}`,
    { headers }
  );

  if (!res.ok) {
    console.error(`[healthcheck] ALERT: Cannot query sync_runs (${res.status})`);
    process.exit(1);
  }

  const runs = await res.json();

  if (runs.length === 0) {
    console.error("[healthcheck] ALERT: No sync runs found — sync has never run");
    process.exit(1);
  }

  // Check staleness
  const lastRun = runs[0];
  const lastTime = new Date(lastRun.started_at);
  const minutesAgo = (Date.now() - lastTime.getTime()) / 60000;

  if (minutesAgo > STALE_MINUTES) {
    console.error(
      `[healthcheck] ALERT: Last sync was ${Math.round(minutesAgo)} minutes ago ` +
      `(threshold: ${STALE_MINUTES}min). Status: ${lastRun.status}`
    );
    process.exit(1);
  }

  // Check consecutive failures
  const allFailed = runs.length >= CONSECUTIVE_FAILURES &&
    runs.slice(0, CONSECUTIVE_FAILURES).every((r) => r.status === "failed");

  if (allFailed) {
    const errors = runs.slice(0, CONSECUTIVE_FAILURES).map((r) => r.error_message || "unknown").join(" | ");
    console.error(
      `[healthcheck] ALERT: Last ${CONSECUTIVE_FAILURES} syncs all FAILED. Errors: ${errors}`
    );
    process.exit(1);
  }

  // All good
  console.log(
    `[healthcheck] OK — last sync ${Math.round(minutesAgo)}min ago, ` +
    `status=${lastRun.status}, duration=${lastRun.duration_ms}ms`
  );
}

check().catch((err) => {
  console.error(`[healthcheck] ALERT: ${err.message}`);
  process.exit(1);
});
