#!/usr/bin/env node
// ═══════════════════════════════════════════════════════════
// RtR Control Tower — MRP Data Sync Script
// Reads MRP PostgreSQL → writes to Control Tower Supabase
// Run via cron: */30 * * * * node /path/to/mrp-sync.mjs
// ═══════════════════════════════════════════════════════════

import pg from "pg";

// ── Configuration ──
const MRP_DB = {
  host: process.env.MRP_DB_HOST || "localhost",
  port: parseInt(process.env.MRP_DB_PORT || "5432"),
  database: process.env.MRP_DB_NAME || "rtr_mrp",
  user: process.env.MRP_DB_USER || "rtr",
  password: process.env.MRP_DB_PASSWORD || "rtr_secret_2024",
};

const SUPABASE_URL = process.env.SUPABASE_URL || "https://supabase.rtrobotics.com";
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY || "";

// ── Project name → Control Tower project ID mapping ──
const PROJECT_MAP = {
  hera: "PRJ-HERA",
  "hera 2.0": "PRJ-HERA",
  dualsight: "PRJ-DUALSIGHT",
  fpv: "PRJ-FPV",
  omnisight: "PRJ-OMNI",
  default: "PRJ-001", // General R&D
};

function mapToProject(productName) {
  const lower = (productName || "").toLowerCase();
  for (const [key, projId] of Object.entries(PROJECT_MAP)) {
    if (key !== "default" && lower.includes(key)) return projId;
  }
  return PROJECT_MAP.default;
}

// ── Supabase upsert helper ──
async function upsertToSupabase(rows) {
  if (!SUPABASE_KEY || rows.length === 0) return;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/cross_app_data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      Prefer: "resolution=merge-duplicates",
    },
    body: JSON.stringify(rows),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error(`[sync] Supabase upsert failed: ${res.status} ${err}`);
  } else {
    console.log(`[sync] Upserted ${rows.length} rows`);
  }
}

// ── Main sync ──
async function sync() {
  const client = new pg.Client(MRP_DB);
  try {
    await client.connect();
    console.log("[sync] Connected to MRP database");

    // 1. Work Orders (production orders)
    const woResult = await client.query(`
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

    const woRows = woResult.rows.map((wo) => ({
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
    await upsertToSupabase(woRows);

    // 2. Inventory Alerts (parts below reorder point)
    const invResult = await client.query(`
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

    const invRows = invResult.rows.map((inv) => {
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
    await upsertToSupabase(invRows);

    // 3. Sales Orders (recent/active)
    const soResult = await client.query(`
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

    const soRows = soResult.rows.map((so) => ({
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
    await upsertToSupabase(soRows);

    // 4. Production Summary (aggregate stats)
    const statsResult = await client.query(`
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

    const stats = statsResult.rows[0] || {};
    await upsertToSupabase([{
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
    }]);

    console.log(`[sync] Complete: ${woRows.length} WOs, ${invRows.length} inventory alerts, ${soRows.length} sales orders`);
  } catch (err) {
    console.error("[sync] Error:", err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

sync();
