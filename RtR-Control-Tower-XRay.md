# RtR CONTROL TOWER — X-RAY REPORT
### Trình CEO — Mô tả tính năng & Pipeline thực tế
**Ngày:** 2026-03-09 | **Phiên bản:** v1.1.0

---

## 1. TỔNG QUAN SẢN PHẨM

RtR Control Tower là hệ thống quản lý chương trình phần cứng chuyên biệt cho phát triển drone tại Real-time Robotics. Quản lý đồng thời **5 dự án drone** qua vòng đời 5 pha phần cứng: **CONCEPT → EVT → DVT → PVT → MP**.

### Tech Stack
| Layer | Công nghệ |
|-------|-----------|
| Frontend | React 18 (Vite) / JSX / Inline CSS Design System |
| Backend | Supabase (Auth + PostgreSQL + Realtime) |
| Charts | Recharts |
| Intelligence | TypeScript — Custom SignalHub analytics kernel |
| Import/Export | SheetJS (Excel) + html2canvas + jsPDF (PDF) |
| Icons | Lucide React |

### Kiến trúc tổng thể
```
Browser (React SPA)
    │
    ├── AuthContext ─── Supabase Auth / Demo Users
    ├── AuditContext ── localStorage + Supabase audit_log
    │
    ├── useAppData ──── projects, issues, notifications
    ├── useV2Data ───── BOM, flights, suppliers, deliveries, decisions
    ├── useRealtime ─── Supabase postgres_changes (WebSocket)
    │
    ├── SignalHub ───── Client-side analytics kernel (TypeScript)
    │   ├── ClassificationEngine (8 rules)
    │   ├── ConvergenceDetector (2 detection spaces)
    │   ├── AnomalyDetector (z-score)
    │   ├── ScoringEngine (PHI composite index)
    │   └── FreshnessTracker
    │
    └── 11 Tab Modules ── UI rendering
```

---

## 2. CÁC MODULE CHỨC NĂNG (11 TABS)

### 2.1 Control Tower (Dashboard)
**Mục đích:** Dashboard điều hành cấp portfolio — nhìn tổng quan tất cả dự án.

**Tính năng:**
- 6 KPI metrics: Active Projects, Open Issues, Critical Count, Blocked Count, Closure Rate, Cascade Alerts
- Sparkline charts trong mỗi metric card
- Per-project health cards: phase badge, milestone timeline, gate progress
- Cascade delay alerts (issues có ảnh hưởng downstream)
- AI Risk Panel — Risk Score 0-100 với 5 yếu tố
- Issue trend + severity breakdown charts
- Gate completion radar chart

**Data:** issues + projects từ Supabase hoặc static fallback
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.2 Issues (Quản lý vấn đề)
**Mục đích:** Issue tracker đầy đủ — core workflow của hệ thống.

**Tính năng:**
- Danh sách issues với filter: status, severity, source
- Tìm kiếm full-text hỗ trợ tiếng Việt (bỏ dấu)
- Tạo issue mới (role-gated)
- Chi tiết issue: description, root cause, impact map, activity log
- Chuyển trạng thái: DRAFT → OPEN → IN_PROGRESS → BLOCKED → CLOSED
- Sub-tab charts: trend, severity breakdown, status distribution
- FAB (Floating Action Button) khi scroll

**Workflow RBAC:**
| Hành động | Admin | PM | Engineer | Viewer |
|-----------|-------|----|----------|--------|
| Tạo issue | ✅ → OPEN | ✅ → OPEN | ✅ → DRAFT | ❌ |
| Review/Approve | ✅ | ✅ | ❌ | ❌ |
| Edit | ✅ All | ✅ All | ✅ Own only | ❌ |
| Delete | ✅ Any | ✅ DRAFT only | ❌ | ❌ |
| Close | ✅ | ✅ | ✅ Own only | ❌ |

**Data:** `issues` table + `issue_impacts` + `issue_updates` (joins)
**Realtime:** ✅ INSERT/UPDATE/DELETE tự động cập nhật
**Trạng thái:** ✅ Hoạt động đầy đủ (21 sample issues across 5 projects)

---

### 2.3 Phase Gates (Cổng chất lượng)
**Mục đích:** Tracking gate conditions theo từng pha phát triển. Mỗi pha có checklist điều kiện phải pass trước khi chuyển pha tiếp theo.

**Gate conditions theo pha:**
| Pha | Số điều kiện | Ví dụ |
|-----|-------------|-------|
| CONCEPT | 3 | Product requirements, Feasibility, BOM estimate |
| EVT | 5 | Schematic review, PCB DRC, BOM finalized, Power-on, Basic flight |
| DVT | 11 | Endurance, Thermal, Humidity, Dust, EMC/EMI, Drop, Vibration... |
| PVT | 5 | Production line, QC, Yield, Regulatory cert |
| MP | 3 | Issues closed, BOM locked, Supply chain confirmed |

**Tính năng:**
- Toggle checkbox (audited, ghi nhận ai toggle, lúc nào)
- Progress bar + pass/fail indicator
- Phase transition button (khi tất cả required conditions pass)
- Gate Radar chart — completion by test category (DVT)
- Milestone timeline view

**Data:** `gate_conditions` table + `milestones` table
**Realtime:** ✅ Optimistic update — thấy ngay khi người khác toggle
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.4 Impact Map (Bản đồ ảnh hưởng)
**Mục đích:** Hiển thị cascade delay — issues nào có ảnh hưởng dây chuyền đến các pha downstream.

**Tính năng:**
- Per-issue cascade chain: hiện pha nào bị auto-shift, bao nhiêu tuần
- Badge count trên tab
- Algorithm: walk từ pha bị impact → MP, mỗi pha downstream đều bị đánh dấu

**Data:** `issues.impacts` (mảng impacts embedded trong mỗi issue)
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.5 BOM & Suppliers
**Mục đích:** Quản lý Bill of Materials và nhà cung cấp.

**Sub-tab BOM Tree:**
- Hierarchical tree view với expand/collapse theo assembly level
- Columns: part number, description (VI/EN), lifecycle badge, supplier, qty, unit cost, lead time
- Filters: search, category (MECHANICAL/ELECTRICAL/SOFTWARE/CONSUMABLE), lifecycle (ACTIVE/EOL/NRND/OBSOLETE)
- Detail panel: alternate parts, category pie chart, lifecycle pie chart
- EOL/OBSOLETE parts highlighted đỏ với warning icon
- Cost visibility chỉ cho admin/pm

**Sub-tab Suppliers:**
- Danh sách NCC linked to BOM parts
- Scorecard: quality star rating, on-time delivery %, defect rate
- Delivery history timeline
- Contact info, certifications, audit dates

**Data:** `bom_parts` + `suppliers` + `delivery_records` tables
**Realtime:** ✅ bom_parts + delivery_records
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.6 Testing & Decisions
**Sub-tab Flight Tests:**
- Flight test log sorted by test number
- Stats bar: total, PASS, FAIL, PARTIAL
- Filter by test type + result
- Detail: sensor data bars (battery, current, vibration, GPS, wind, temp), anomaly log, attachments
- "Create Issue from Test" cho FAIL flights (role-gated)

**Test types:** ENDURANCE, STABILITY, PAYLOAD, AUTONOMY, EMERGENCY, PERFORMANCE

**Sub-tab Decisions:**
- Architecture Decision Records (ADR) pattern
- Expand card: options considered, pros/cons, rationale, cost impact
- Linked entities: issues, flight tests, gate conditions
- Filter by status: PROPOSED/APPROVED/SUPERSEDED/REJECTED

**Data:** `flight_tests` + `flight_anomalies` + `flight_attachments` + `decisions` tables
**Realtime:** ✅ flight_tests
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.7 Team (Đội ngũ)
**Mục đích:** Dashboard workload team.

**Tính năng:**
- Per-member open issue count bar
- Role badge
- Project assignments

**Data:** Static `TEAM` constant — ⚠️ không sync từ Supabase
**Trạng thái:** ⚠️ UI hoạt động, data tĩnh

---

### 2.8 Review Queue (Hàng chờ duyệt) — PM/Admin only
**Mục đích:** Duyệt issues ở trạng thái DRAFT.

**Tính năng:**
- Danh sách DRAFT issues cho project đang chọn
- Approve → chuyển sang OPEN
- Reject → giữ DRAFT + comment

**Data:** Filter từ issues state
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.9 Audit Log (Nhật ký) — Admin only
**Mục đích:** Full audit trail mọi hành động user.

**Events tracked:** USER_LOGIN, ISSUE_CREATED, ISSUE_STATUS_CHANGED, ISSUE_CLOSED, ISSUE_REVIEWED, ISSUE_DELETED, GATE_CHECK_TOGGLED, PHASE_TRANSITION, DATA_IMPORTED

**Tính năng:**
- Filter by action type + user
- Export audit log CSV (Excel-compatible Vietnamese)
- Clear all logs (admin)

**Data:** Dual storage — localStorage (max 500) + Supabase `audit_log` table
**Trạng thái:** ✅ Hoạt động đầy đủ

---

### 2.10 Intelligence (Phân tích thông minh)
**Mục đích:** SignalHub analytics — hệ thống phân tích sức khỏe dự án tự động.

**Kiến trúc SignalHub:**
```
App Data → Transformers → SignalHub Kernel
    ├── Classification (8 rules, 3 tiers)
    ├── Convergence Detection (2 spaces)
    ├── Anomaly Detection (z-score)
    ├── PHI Scoring (5 weighted components)
    └── Freshness Tracking
```

**Project Health Index (PHI) — 5 thành phần:**
| Component | Weight | Window | Description |
|-----------|--------|--------|-------------|
| Issue Severity | 30% | 30 days | Count-weighted, logarithmic |
| Testing Health | 25% | 30 days | Flight result pass/fail ratio |
| Schedule | 20% | 14 days | Recent issue count |
| Supply Chain | 15% | 30 days | Delivery + BOM events |
| Gate Progress | 10% | 90 days | Gate toggle signals |

**Thresholds:** 0-30 Healthy, 30-55 Attention, 55-75 Warning, 75-100 Critical

**Classification Rules (8):**
1. BLOCKED + CRITICAL/HIGH issue → blocking, escalation
2. >1 downstream impacts → cascade, schedule_risk
3. Flight FAIL → quality, testing
4. Overdue ≥3 days → schedule, overdue
5. Delivery late >3 days → supply_chain
6. EOL/OBSOLETE part → supply_chain, lifecycle
7. Issue count ≥3 → workload
8. Gate toggle → milestone, progress

**Convergence Detection:**
- Project-Phase Crisis: 72h window, ≥2 signal types → "multi-dimensional crisis"
- Owner Overload: 48h window, ≥3 signal types → "owner overload"

**UI tabs:** Overview (PHI scores), Convergence (alerts), Anomaly (detected), Freshness (data health)

**Trạng thái:** ✅ Hoạt động đầy đủ (rule-based, không phải ML)

---

### 2.11 Settings (Cài đặt)
**Tính năng:**
- Email notification preferences per event type
- Theme toggle: Dark/Light
- Language toggle: Vietnamese/English
- User profile display

**⚠️ Email sending:** UI-only — preferences lưu localStorage nhưng không gửi email thật. Cần Supabase Edge Function hoặc external email service.

**Trạng thái:** ⚠️ UI hoạt động, email gửi giả lập

---

## 3. PIPELINE DỮ LIỆU THỰC TẾ

### 3.1 Supabase Tables (17 tables)

| Table | Mục đích | Realtime |
|-------|----------|----------|
| `profiles` | User profiles (linked to auth.users) | ❌ |
| `projects` | Project master data (5 projects) | ✅ |
| `milestones` | Phase timeline dates | ❌ |
| `gate_conditions` | Gate checklist per project+phase | ✅ |
| `project_members` | Project-user membership | ❌ |
| `issues` | Issue records | ✅ |
| `issue_impacts` | Cascade impact records | ❌ (join) |
| `issue_updates` | Activity log per issue | ❌ (join) |
| `bom_parts` | BOM hierarchy | ✅ |
| `suppliers` | Supplier master | ❌ |
| `delivery_records` | Delivery log | ✅ |
| `flight_tests` | Flight test records | ✅ |
| `flight_anomalies` | Anomalies per flight | ❌ (join) |
| `flight_attachments` | Attachments per flight | ❌ (join) |
| `decisions` | Decision records | ❌ |
| `notifications` | Per-user notifications | ✅ (filtered) |
| `audit_log` | Audit trail | ❌ |

### 3.2 Data Flow Pipeline
```
Supabase PostgreSQL
       │
       ▼
supabaseService.js ─── Generic CRUD (query, insert, update, upsert)
       │
       ▼
Domain Services ─── projectService, issueService, bomService, flightService, auditService
       │
       ▼
React Hooks ─── useAppData.js (projects, issues, notifications)
             ── useV2Data.js (BOM, flights, suppliers, deliveries, decisions)
             ── useRealtime.js (WebSocket subscriptions)
       │
       │ Transform: snake_case → camelCase
       │ Joins: nested arrays (impacts, updates, anomalies, attachments)
       ▼
App.jsx State ─── Dual-source merge:
                  if (online && supabaseData.length > 0) → Supabase
                  else → Static fallback constants
       │
       ▼
SignalHub ─── Ingest all data → classify → score → detect anomalies
       │
       ▼
UI Components ─── Pure rendering from props/state
```

### 3.3 Realtime Pipeline
```
Supabase postgres_changes (WebSocket)
       │
       ├── gate_conditions UPDATE → Optimistic patch (instant UI update)
       ├── projects UPDATE → Full refetch
       ├── issues INSERT → Refetch all; UPDATE → Patch; DELETE → Remove
       ├── bom_parts * → Full refetch
       ├── flight_tests * → Full refetch
       ├── delivery_records * → Full refetch
       └── notifications INSERT (user_id filter) → Prepend to list
```

### 3.4 Offline Fallback Pipeline
```
Khi VITE_SUPABASE_URL hoặc VITE_SUPABASE_ANON_KEY thiếu:
       │
       ├── Auth → DEMO_USERS array (4 users, plaintext passwords)
       ├── Projects → PROJECTS constant (5 drone projects)
       ├── Issues → ISSUES_DATA constant (21 issues)
       ├── Notifications → NOTIFICATIONS_DATA (15 entries)
       ├── BOM/Suppliers/Deliveries → v2Data.js constants
       ├── Flight Tests → FLIGHT_TESTS_DATA constant
       ├── Decisions → DECISIONS_DATA constant
       ├── Gates → GATE_CONFIG constant
       └── Audit → localStorage only (max 500 entries)

⚠️ Write operations (create/update) work in React state nhưng KHÔNG persist khi offline
```

---

## 4. IMPORT/EXPORT PIPELINE

### 4.1 Import
```
File Upload (.xlsx/.xls/.csv)
       │
       ▼
SheetJS Reader → Parse to JSON rows
       │
       ▼
Auto Column Mapper ─── 100+ Vietnamese/English header aliases
       │ Confidence: exact / partial / none
       ▼
Preview & Validation ─── Enum mapping, required fields check
       │
       ▼
Supabase INSERT (online) hoặc React state update (offline)
```

**Supported types:** Issues, BOM, Flight Tests, Milestones

### 4.2 Export
| Format | Data | Source | Trạng thái |
|--------|------|--------|-----------|
| Issues → Excel | Live issues state | ✅ Live data | ✅ |
| BOM → Excel | 2 sheets: full BOM + cost summary | ⚠️ Static `BOM_DATA` | ⚠️ |
| Flight Tests → Excel | Flight log | ⚠️ Static `FLIGHT_TESTS_DATA` | ⚠️ |
| Project Summary → PDF | Dashboard render | ⚠️ Static BOM/flight data | ⚠️ |
| Audit Log → CSV | Live audit data | ✅ Live data | ✅ |

---

## 5. RBAC & SECURITY

### 5.1 Permission Matrix
| Permission | Admin | PM | Engineer | Viewer |
|-----------|-------|----|----------|--------|
| Create Issue | ✅ | ✅ | ✅ (→DRAFT) | ❌ |
| Review Issue | ✅ | ✅ | ❌ | ❌ |
| Edit Issue | ✅ All | ✅ All | ✅ Own | ❌ |
| Delete Issue | ✅ Any | ✅ DRAFT | ❌ | ❌ |
| Edit BOM | ✅ | ✅ | ✅ | ❌ |
| Edit Supplier | ✅ | ✅ | ❌ | ❌ |
| Edit Decisions | ✅ | ✅ | ❌ | ❌ |
| Edit Flight Test | ✅ | ✅ | ✅ | ❌ |
| Import Data | ✅ | ✅ | ❌ | ❌ |
| View Cost | ✅ | ✅ | ❌ | ❌ |
| Phase Transition | ✅ | ✅ | ❌ | ❌ |
| Toggle Gate | ✅ | ✅ | ✅ | ❌ |
| View Review Queue | ✅ | ✅ | ❌ | ❌ |
| View Audit Log | ✅ | ❌ | ❌ | ❌ |
| Switch User | ✅ | ❌ | ❌ | ❌ |

### 5.2 Supabase Auth
- Email/Password authentication
- RLS (Row Level Security) trên tất cả tables
- Anon key cho client, service_role key cho admin operations
- Session persisted via Supabase client (custom no-op lock để tránh navigator.locks deadlock)

---

## 6. GAPS & VẤN ĐỀ CẦN LƯU Ý

### 6.1 Data chưa live (dùng static)
| Item | Vấn đề | Severity |
|------|--------|----------|
| Issue trend chart | Dùng `TREND_DATA` hardcoded, không tính từ real issues | Medium |
| Metric sparklines | Mảng tĩnh `[5,6,4,7,8,6,9]` | Low |
| BOM export | Luôn export từ static `BOM_DATA`, bỏ qua live data | High |
| Flight test export | Luôn export từ static `FLIGHT_TESTS_DATA` | High |
| PDF export | Dùng static BOM/flight cho cost + test counts | High |
| Team tab | `TEAM` constant, không sync từ DB | Medium |

### 6.2 Features UI-only (chưa có backend)
| Feature | Chi tiết | Priority |
|---------|---------|----------|
| Email notifications | Preferences UI có, sending giả lập | High |
| Decision editing | Chỉ read-only, không có create/edit form | Medium |
| Offline persistence | Write operations mất khi refresh | Medium |

### 6.3 UX Issues đã phát hiện (từ QA report)
| ID | Issue | Status |
|----|-------|--------|
| P0-1 | FAB tạo vấn đề | ✅ Fixed |
| P0-2 | Sticky table headers | ✅ Fixed |
| P0-3 | EmptyState components | ✅ Fixed |
| P1 | Recharts width(-1) warnings | Known, cosmetic |
| P1 | Supabase navigator.locks deadlock | ✅ Fixed (no-op lock) |

---

## 7. METRICS & SCALE

| Metric | Value |
|--------|-------|
| Total files (src/) | ~40+ |
| App.jsx LOC | ~1,950 |
| Supabase tables | 17 |
| Realtime subscriptions | 7 |
| RBAC roles | 4 |
| Permissions | 15 |
| Intelligence rules | 8 |
| Languages | 2 (VI/EN) |
| Themes | 2 (Dark/Light) |
| Import types | 4 |
| Export formats | 3 (Excel/PDF/CSV) |
| Static fallback datasets | 9 |
| Demo users | 4 |
| Gate conditions total | 27 across 5 phases |

---

## 8. ĐỀ XUẤT CHO CEO

### Đúng hướng ✅
1. **Architecture:** Dual-source (online/offline) pattern rất phù hợp cho môi trường R&D nơi connectivity không ổn định
2. **Intelligence engine:** SignalHub là differentiator mạnh — client-side analytics không phụ thuộc external AI service
3. **RBAC:** 4 roles phù hợp quy mô team hiện tại
4. **Realtime:** 7 subscriptions cover đủ critical tables
5. **i18n:** Sẵn sàng cho team quốc tế (VI/EN)
6. **Audit trail:** Đầy đủ compliance-ready

### Cần điều chỉnh ⚠️
1. **Export pipeline:** BOM + Flight Test export đang dùng static data, KHÔNG phải live Supabase → sai data nếu có thay đổi
2. **Email notifications:** Cần implement real email service (Supabase Edge Function hoặc Resend/SendGrid)
3. **Team module:** Cần sync từ `profiles` + `project_members` tables thay vì hardcode
4. **App.jsx monolith:** 1,950 LOC cần tách ra — rủi ro maintenance cao
5. **Trend chart:** Cần compute từ real issue dates thay vì static array
6. **Decision editing:** Cần form create/edit cho ADR workflow hoàn chỉnh
