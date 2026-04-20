#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// RtR Control Tower — MRP Data Sync Script
// Reads MRP PostgreSQL → writes to Control Tower Supabase
// Run via cron: */30 * * * * node /path/to/mrp-sync.mjs
// ═══════════════════════════════════════════════════════════

import pg from "pg";

// ── Fail-fast env guard ──
function requireEnv(key) {
  const value = process.env[key];
  if (!value || value.trim() === "") {
    throw new Error(
      `[mrp-sync] Missing required env var: ${key}. ` +
      `See .env.example for required variables.`
    );
  }
  return value;
}

// ── Configuration ──
const MRP_DB = {
  host: requireEnv("MRP_DB_HOST"),
  port: parseInt(process.env.MRP_DB_PORT || "5432", 10),
  database: requireEnv("MRP_DB_NAME"),
  user: requireEnv("MRP_DB_USER"),
  password: requireEnv("MRP_DB_PASSWORD"),
};

const SUPABASE_URL = requireEnv("SUPABASE_URL");
const SUPABASE_KEY = requireEnv("SUPABASE_SERVICE_KEY");

// ── Project name → Control Tower project ID mapping ──
const PROJECT_MAP = {
  hera: "PRJ-HERA",
  "hera 2.0": "PRJ-HERA",
  dualsight: "PRJ-DUALSIGHT",
  fpv: "PRJ-FPV",
  omnisight: "PRJ-OMNI",
  default: "PRJ-001",
};

function mapToProject(productName) {
  const lower = (productName || "").toLowerCase();
  for (const [key, projId] of Object.entries(PROJECT_MAP)) {
    if (key !== "default" && lower.includes(key)) return projId;
  }
  return PROJECT_MAP.default;
}

// ── Retry wrapper for fetch calls ──
async function fetchWithRetry(url, options, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if (res.ok || res.status < 500) return res;
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.warn(`[sync] Supabase returned ${res.status}, retry ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        return res;
      }
    } catch (err) {
      if (attempt < maxRetries) {
        const delay = 1000 * Math.pow(2, attempt - 1);
        console.warn(`[sync] Fetch error: ${err.message}, retry ${attempt}/${maxRetries} in ${delay}ms`);
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
}

// ── Supabase helpers ──
function supabaseHeaders() {
  return {
    "Content-Type": "application/json",
    apikey: SUPABASE_KEY,
    Authorization: `Bearer ${SUPABASE_KEY}`,
  };
}

async function createSyncRun() {
  const res = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/sync_runs`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "return=representation" },
    body: JSON.stringify({ source_app: "MRP", status: "running" }),
  });
  if (!res.ok) {
    console.error(`[sync] Failed to create sync_run: ${res.status}`);
    return null;
  }
  const rows = await res.json();
  return rows[0]?.id || null;
}

async function updateSyncRun(id, status, entitiesSynced, errorMessage, durationMs) {
  if (!id) return;
  await fetchWithRetry(`${SUPABASE_URL}/rest/v1/sync_runs?id=eq.${id}`, {
    method: "PATCH",
    headers: supabaseHeaders(),
    body: JSON.stringify({
      status,
      finished_at: new Date().toISOString(),
      entities_synced: entitiesSynced,
      error_message: errorMessage || null,
      duration_ms: durationMs,
    }),
  });
}

async function upsertToSupabase(rows) {
  if (rows.length === 0) return 0;

  const res = await fetchWithRetry(`${SUPABASE_URL}/rest/v1/cross_app_data`, {
    method: "POST",
    headers: { ...supabaseHeaders(), Prefer: "resolution=merge-duplicates" },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase upsert failed: ${res.status} ${err}`);
  }
  return rows.length;
}

// ── PG connect with 1 retry ──
async function connectPG() {
  const client = new pg.Client(MRP_DB);
  try {
    await client.connect();
    return client;
  } catch (err) {
    console.warn(`[sync] PG connect failed: ${err.message}, retrying in 5s`);
    await new Promise((r) => setTimeout(r, 5000));
    const client2 = new pg.Client(MRP_DB);
    await client2.connect();
    return client2;
  }
}

// ── Entity sync functions ──
async function syncWorkOrders(client) {
  const result = await client.query(`
    SELECT wo.id, wo.wo_number, wo.quantity, wo.status, wo.priority,
           wo.planned_start, wo.planned_end, wo.actual_start, wo.actual_end,
           wo.completed_qty, wo.scrap_qty, wo.due_date, wo.assigned_to,
           wo.work_center, wo.notes,
           p.name as product_name, p.part_number as product_code
    FROM work_orders wo
    LEFT JOIN products p ON wo.product_id = p.id
    WHERE wo.status NOT IN ('cancelled')
    ORDER BY wo.created_at DESC
    LIMIT 200
  `);

  const rows = result.rows.map((wo) => ({
    source_app: "MRP",
    entity_type: "work_order",
    entity_id: wo.id,
    title: `${wo.wo_number}: ${wo.product_name || "Unknown"} × ${wo.quantity}`,
    status: wo.status,
    priority: wo.priority,
    data: {
      woNumber: wo.wo_number,
      productName: wo.product_name,
      productCode: wo.product_code,
      quantity: wo.quantity,
      completedQty: wo.completed_qty,
      scrapQty: wo.scrap_qty,
      plannedStart: wo.planned_start,
      plannedEnd: wo.planned_end,
      actualStart: wo.actual_start,
      actualEnd: wo.actual_end,
      assignedTo: wo.assigned_to,
      workCenter: wo.work_center,
      notes: wo.notes,
    },
    project_link: mapToProject(wo.product_name),
    owner: wo.assigned_to,
    due_date: wo.due_date || wo.planned_end,
    synced_at: new Date().toISOString(),
  }));

  return upsertToSupabase(rows);
}

async function syncInventoryAlerts(client) {
  const result = await client.query(`
    SELECT p.id as part_id, p.part_number, p.name as part_name,
           p.category, p.reorder_point, p.safety_stock, p.min_stock_level,
           p.is_critical, p.lifecycle_status, p.lead_time_days,
           COALESCE(SUM(i.quantity), 0) as total_qty,
           COALESCE(SUM(i.reserved_qty), 0) as reserved_qty
    FROM parts p
    LEFT JOIN inventory i ON p.id = i.part_id
    WHERE p.status = 'active'
    GROUP BY p.id
    HAVING COALESCE(SUM(i.quantity), 0) - COALESCE(SUM(i.reserved_qty), 0) <= p.reorder_point
       OR p.lifecycle_status IN ('EOL', 'OBSOLETE')
    ORDER BY p.is_critical DESC, (p.reorder_point - COALESCE(SUM(i.quantity), 0) + COALESCE(SUM(i.reserved_qty), 0)) DESC
    LIMIT 100
  `);

  const rows = result.rows.map((inv) => {
    const available = inv.total_qty - inv.reserved_qty;
    const isStockout = available <= 0;
    const isCritical = inv.is_critical || isStockout;
    return {
      source_app: "MRP",
      entity_type: "inventory_alert",
      entity_id: inv.part_id,
      title: `${inv.part_number}: ${inv.part_name}`,
      status: isStockout ? "stockout" : inv.lifecycle_status === "EOL" ? "eol" : "low_stock",
      priority: isCritical ? "urgent" : "normal",
      data: {
        partNumber: inv.part_number,
        partName: inv.part_name,
        category: inv.category,
        availableQty: available,
        totalQty: inv.total_qty,
        reservedQty: inv.reserved_qty,
        reorderPoint: inv.reorder_point,
        safetyStock: inv.safety_stock,
        isCritical: inv.is_critical,
        lifecycleStatus: inv.lifecycle_status,
        leadTimeDays: inv.lead_time_days,
      },
      project_link: null,
      owner: null,
      due_date: null,
      synced_at: new Date().toISOString(),
    };
  });

  return upsertToSupabase(rows);
}

async function syncSalesOrders(client) {
  const result = await client.query(`
    SELECT so.id, so.order_number, so.status, so.priority,
           so.order_date, so.required_date, so.promised_date,
           so.total_amount, so.currency, so.notes,
           c.name as customer_name
    FROM sales_orders so
    LEFT JOIN customers c ON so.customer_id = c.id
    WHERE so.status NOT IN ('cancelled', 'delivered')
    ORDER BY so.required_date ASC
    LIMIT 100
  `);

  const rows = result.rows.map((so) => ({
    source_app: "MRP",
    entity_type: "sales_order",
    entity_id: so.id,
    title: `${so.order_number}: ${so.customer_name || "Unknown"}`,
    status: so.status,
    priority: so.priority,
    data: {
      orderNumber: so.order_number,
      customerName: so.customer_name,
      orderDate: so.order_date,
      requiredDate: so.required_date,
      promisedDate: so.promised_date,
      totalAmount: so.total_amount,
      currency: so.currency,
      notes: so.notes,
    },
    project_link: null,
    owner: null,
    due_date: so.required_date,
    synced_at: new Date().toISOString(),
  }));

  return upsertToSupabase(rows);
}

async function syncProductionSummary(client) {
  const result = await client.query(`
    SELECT
      COUNT(*) FILTER (WHERE status = 'in_production') as in_production,
      COUNT(*) FILTER (WHERE status = 'confirmed') as confirmed,
      COUNT(*) FILTER (WHERE status = 'completed') as completed_today,
      COUNT(*) FILTER (WHERE due_date < CURRENT_DATE AND status NOT IN ('completed', 'cancelled')) as overdue,
      SUM(quantity) FILTER (WHERE status IN ('confirmed', 'in_production')) as total_planned_qty,
      SUM(completed_qty) FILTER (WHERE status = 'in_production') as total_completed_qty
    FROM work_orders
    WHERE created_at > CURRENT_DATE - INTERVAL '90 days'
  `);

  const stats = result.rows[0] || {};
  const rows = [{
    source_app: "MRP",
    entity_type: "production_summary",
    entity_id: "daily",
    title: "MRP Production Summary",
    status: "active",
    priority: "normal",
    data: {
      inProduction: parseInt(stats.in_production) || 0,
      confirmed: parseInt(stats.confirmed) || 0,
      completedToday: parseInt(stats.completed_today) || 0,
      overdue: parseInt(stats.overdue) || 0,
      totalPlannedQty: parseInt(stats.total_planned_qty) || 0,
      totalCompletedQty: parseInt(stats.total_completed_qty) || 0,
      syncedAt: new Date().toISOString(),
    },
    project_link: null,
    owner: null,
    due_date: null,
    synced_at: new Date().toISOString(),
  }];

  return upsertToSupabase(rows);
}

// ── Main sync with monitoring ──
async function sync() {
  const startTime = Date.now();
  const runId = await createSyncRun();
  const entities = {};
  const errors = [];

  let client;
  try {
    client = await connectPG();
    console.log("[sync] Connected to MRP database");
  } catch (err) {
    const msg = `PG connect failed: ${err.message}`;
    console.error(`[sync] ${msg}`);
    await updateSyncRun(runId, "failed", {}, msg, Date.now() - startTime);
    process.exit(1);
  }

  // Sync each entity type independently — one failure doesn't block others
  const tasks = [
    { name: "work_order", fn: syncWorkOrders },
    { name: "inventory_alert", fn: syncInventoryAlerts },
    { name: "sales_order", fn: syncSalesOrders },
    { name: "production_summary", fn: syncProductionSummary },
  ];

  for (const task of tasks) {
    try {
      const count = await task.fn(client);
      entities[task.name] = count;
      console.log(`[sync] ${task.name}: ${count} rows`);
    } catch (err) {
      entities[task.name] = 0;
      errors.push(`${task.name}: ${err.message}`);
      console.error(`[sync] ${task.name} failed: ${err.message}`);
    }
  }

  await client.end();

  const durationMs = Date.now() - startTime;
  const status = errors.length === 0 ? "success" : errors.length < tasks.length ? "partial" : "failed";
  const errorMessage = errors.length > 0 ? errors.join("; ") : null;

  await updateSyncRun(runId, status, entities, errorMessage, durationMs);

  const total = Object.values(entities).reduce((a, b) => a + b, 0);
  console.log(`[sync] ${status.toUpperCase()} in ${durationMs}ms: ${total} total rows (${JSON.stringify(entities)})`);

  if (status === "failed") process.exit(1);
}

sync();
