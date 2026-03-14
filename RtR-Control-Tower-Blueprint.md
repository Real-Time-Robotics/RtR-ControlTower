# ═══════════════════════════════════════════════════════════════
# RtR CONTROL TOWER — COMPLETE BLUEPRINT
# Vibecode Kit v5.0 | Chủ Thầu Output
# ═══════════════════════════════════════════════════════════════

---

# 📋 RRI REPORT: RtR Control Tower

Generated: 2026-02-24
RRI Rounds: 6 | Questions Asked: 18 | Auto-Answered: ~12

---

## REQUIREMENTS MATRIX

| REQ-ID  | Requirement | Source | Priority | Persona |
|---------|-------------|--------|----------|---------|
| REQ-001 | 4 Role-Based Views (Admin, PM, Engineer, Viewer) | R1-Q1 | P0 | End User |
| REQ-002 | Dashboard-first UX, load trong 3 giây | R1-Q2 | P0 | End User |
| REQ-003 | Desktop-optimized, data-dense layout | R1-Q3 | P0 | End User |
| REQ-004 | Engineers tự log issues, PM review queue | R2-Q1 | P0 | Business |
| REQ-005 | Chỉ PM/Lead có quyền chuyển phase | R2-Q2 | P0 | Business |
| REQ-006 | 4-tier notification engine (Critical/Impact/Gate/Overdue) | R2-Q3 | P0 | Business |
| REQ-007 | Multi-project portfolio (số lượng không giới hạn) | R3-Q1 | P0 | Business |
| REQ-008 | 6 data modules (Issues, Milestones, BOM, Flight Test, Suppliers, Decisions) | R3-Q2 | P1 | Business |
| REQ-009 | Excel Import Wizard cho dự án đang chạy | R3-Q3 | P1 | Business |
| REQ-010 | 5-phase lifecycle: Concept → EVT → DVT → PVT → MP | R4-Q1 | P0 | Domain |
| REQ-011 | DVT Gate: 4 mandatory test categories | R4-Q2 | P0 | Domain |
| REQ-012 | Auto-cascade delay detection engine | R4-Q3 | P0 | Domain |
| REQ-013 | Email + password authentication | R5-Q1 | P0 | QA |
| REQ-014 | RBAC 4 tầng + field-level permissions | R5-Q2 | P0 | QA |
| REQ-015 | Audit log mọi thao tác write | R5-Q2 | P1 | QA |
| REQ-016 | Support 50+ concurrent users | R5-Q3 | P1 | QA |
| REQ-017 | Cloud deployment (Vercel/Railway) | R6-Q1 | P0 | Operator |
| REQ-018 | Song ngữ Việt - Anh | R6-Q2 | P0 | End User |
| REQ-019 | Quality-first, không gấp timeline | R6-Q3 | P0 | Business |

## AUTO-ANSWERED (từ Pain Point Analysis + Domain)

- LIFECYCLE: 5 phases chuẩn hardware (Concept/EVT/DVT/PVT/MP)
- ISSUE FORMAT: Bắt buộc Title, Root Cause, Owner, Severity, Source, Impact
- STATUS MACHINE: OPEN → IN_PROGRESS → BLOCKED → CLOSED (+ DRAFT → REVIEWED)
- SOURCE CLASSIFICATION: Internal / External / Cross-team
- GATE MODEL: Phase gate = checklist conditions, required items phải pass

## DECISIONS LOG

| # | Decision | Options | Chosen | Rationale |
|---|----------|---------|--------|-----------|
| D-001 | Phân kỳ release | Full 6 modules vs Core 3 first | **V1: 3 core → V2: 6 full** | Quality > speed, validate core loop trước |
| D-002 | Auth strategy | SSO vs Email/Pass | **Email/Pass V1 → SSO V2** | Simple first, RtR chưa cần SSO |
| D-003 | Cascade engine | Auto-adjust vs Warning-only | **Auto-detect + Visual warning** | PM vẫn quyết định cuối, nhưng hệ thống phải hiện impact |
| D-004 | Language | Vi-only vs Bilingual | **Bilingual Vi-En** | RtR có thể mở rộng, team có thể dùng cả hai |
| D-005 | Deploy | Self-host vs Cloud | **Cloud (Vercel + Railway)** | Frontend Vercel, Backend Railway/Supabase |

## OPEN QUESTIONS (defer to V2)

- OQ-001: BOM module structure - cần RRI riêng cho BOM complexity
- OQ-002: Flight Test Log format - cần input từ test engineers
- OQ-003: Supplier rating criteria - cần business rule từ procurement
- OQ-004: Meeting notes structure - có thể integrate với existing tools

---

# 🎯 VISION: RtR Control Tower

## Product Statement

> **RtR Control Tower** là Single Source of Truth cho toàn bộ chương trình phát triển drone tại Real-time Robotics. Thay thế Excel fragmented bằng một hệ thống quản lý trạng thái dự án theo lifecycle chuẩn hardware, với gate rules, impact mapping, và cascade detection — giúp 70 nhân viên nhìn cùng một bức tranh, cùng một lúc.

## Pain Point → Feature Mapping

| # | Pain Point (Excel) | Control Tower Feature | Module |
|---|-------------------|----------------------|--------|
| 1 | Log theo người, không theo hệ thống | Project-level dashboard, portfolio view | Dashboard |
| 2 | Không có format chuẩn | Structured issue form (bắt buộc fields) | Issues |
| 3 | Không trạng thái mở/đóng | Status machine: DRAFT→OPEN→IN_PROGRESS→BLOCKED→CLOSED | Issues |
| 4 | Milestone không gắn điều kiện | Gate conditions per phase, checklist required items | Gates |
| 5 | Không tách internal/external | Source field: INTERNAL / EXTERNAL / CROSS_TEAM | Issues |
| 6 | Không có issue owner rõ | Owner field + PM Review Queue | Issues |
| 7 | Không có impact mapping | Impact chain visualization per issue | Impact |
| 8 | Không snapshot tổng thể | Control Tower dashboard + Project Snapshot | Dashboard |
| 9 | Không gate rule | Phase Gate system: conditions → approval → transition | Gates |
| 10 | Không control tower | Toàn bộ app = Single Source of Truth | All |

## V1 Scope (3 Core Modules)

```
MODULE 1: CONTROL TOWER (Dashboard)
├── Portfolio Overview (all projects at glance)
├── Project Snapshot (phase, metrics, health)
├── Team Workload Matrix
├── Notification Center
└── Cascade Alert Panel

MODULE 2: ISSUE MANAGEMENT
├── Structured Issue Creation (mandatory fields)
├── Issue List with Filters (status/severity/source/owner/phase)
├── Issue Detail with Activity Log
├── PM Review Queue (DRAFT → REVIEWED)
├── Impact Mapping per Issue
└── Root Cause tracking

MODULE 3: PHASE & GATE MANAGEMENT
├── 5-Phase Timeline Visualization
├── Gate Conditions per Phase (configurable)
├── DVT Special Gate (4 test categories)
├── Phase Transition (PM-only, audit logged)
├── Cascade Delay Engine
└── Milestone Calendar
```

## V2 Scope (Deferred)

```
MODULE 4: BOM MANAGEMENT
MODULE 5: FLIGHT TEST LOG
MODULE 6: SUPPLIER TRACKING
MODULE 7: DECISIONS LOG
MODULE 8: EXCEL IMPORT WIZARD
MODULE 9: SSO INTEGRATION
MODULE 10: REPORTING / EXPORT
```

---

# 📐 BLUEPRINT: RtR Control Tower V1

## PROJECT INFO

| Field | Value |
|-------|-------|
| Dự án | RtR Control Tower |
| Loại | SaaS Application + Dashboard (Internal Tool) |
| Company | Real-time Robotics (70 employees) |
| Users | 50+ (4 roles: Admin, PM, Engineer, Viewer) |
| Language | Bilingual Vietnamese - English |
| Ngày | 2026-02-24 |
| Phase | V1 — 3 Core Modules |

---

## STRUCTURE

### Information Architecture

```
RtR Control Tower
├── 🔐 Auth
│   ├── Login (email + password)
│   └── Register (admin invite-only)
│
├── 📊 Control Tower (Dashboard)
│   ├── Portfolio Overview
│   │   ├── All projects grid/list
│   │   ├── Global metrics (open issues, critical, blocked)
│   │   └── Cascade alerts
│   ├── Project Snapshot
│   │   ├── Phase timeline (5 phases visual)
│   │   ├── Issue metrics by severity
│   │   ├── Gate progress bar
│   │   └── Phase owner info
│   ├── Team Workload
│   │   ├── Per-person issue count
│   │   ├── Critical issue assignment
│   │   └── Capacity overview
│   └── Notification Center
│       ├── Critical new issues
│       ├── Milestone impacts
│       ├── Gate changes
│       └── Overdue issues
│
├── ⚠️ Issues
│   ├── Issue List
│   │   ├── Table view (data-dense)
│   │   ├── Filters: Status, Severity, Source, Owner, Phase
│   │   ├── Sort: Date, Severity, Status
│   │   └── Bulk actions (assign, status change)
│   ├── Issue Detail
│   │   ├── Header: ID, Title, Badges
│   │   ├── Metadata: Owner, Source, Phase, Created, Due
│   │   ├── Root Cause (mandatory)
│   │   ├── Impact Mapping (visual chain)
│   │   ├── Activity Log (timeline)
│   │   └── Actions: Update, Reassign, Close
│   ├── Create Issue
│   │   ├── Title (required)
│   │   ├── Description (required)
│   │   ├── Root Cause (required — can be "Investigating")
│   │   ├── Severity: CRITICAL / HIGH / MEDIUM / LOW
│   │   ├── Source: INTERNAL / EXTERNAL / CROSS_TEAM
│   │   ├── Owner (required)
│   │   ├── Phase (required)
│   │   ├── Impact Mapping (optional, expandable)
│   │   └── Attachments (optional)
│   └── PM Review Queue
│       ├── DRAFT issues pending review
│       ├── Approve → OPEN
│       └── Request changes → back to engineer
│
├── 🚪 Phase & Gates
│   ├── Phase Timeline (per project)
│   │   ├── 5 nodes: Concept → EVT → DVT → PVT → MP
│   │   ├── Current phase highlighted
│   │   ├── Dates (target vs actual)
│   │   └── Cascade delay indicators
│   ├── Gate Management
│   │   ├── Per-phase condition checklist
│   │   ├── Required vs Optional conditions
│   │   ├── DVT Special: 4 test category groups
│   │   ├── Gate readiness indicator
│   │   └── Transition button (PM-only)
│   ├── Cascade Engine
│   │   ├── Auto-detect: Issue impact → milestone delay
│   │   ├── Ripple calculation: DVT +2w → PVT +2w → MP +2w
│   │   ├── Visual timeline shift
│   │   └── Alert generation
│   └── Phase Transition
│       ├── Pre-check: All required gate conditions
│       ├── Confirmation dialog
│       ├── Audit log entry
│       └── Notification to all stakeholders
│
├── 🔔 Notifications
│   ├── In-app notification bell
│   ├── Priority levels (Critical/High/Medium/Low)
│   ├── Read/Unread state
│   └── V2: Email integration
│
├── 👤 User Management (Admin only)
│   ├── User list
│   ├── Role assignment
│   ├── Project assignment
│   └── Invite new users
│
└── ⚙️ Settings
    ├── Profile
    ├── Language toggle (Vi/En)
    ├── Notification preferences
    └── Project configuration (gate conditions)
```

### Screen Layout

```
┌──────────────────────────────────────────────────────────────────────────┐
│  ┌─────┐  RtR Control Tower    [Vi|En] [🔔 3] [Minh Tuấn ▾]           │
│  │ R   │  Real-time Robotics                                            │
│  └─────┘                                                                 │
├──────────────────────────────────────────────────────────────────────────┤
│  ◉ Control Tower  │  ⚠ Issues  │  🚪 Gates  │  ⚡ Impact  │  👤 Team   │
├──────────┬───────────────────────────────────────────────────────────────┤
│          │                                                               │
│ PROJECTS │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │
│          │  │OPEN │ │CRIT │ │BLOCK│ │CLOSE│ │ GATE│ │DELAY│          │
│ ▸ X7     │  │  8  │ │  2  │ │  1  │ │  3  │ │ 67%│ │ ⚠2w│          │
│ ▸ A3     │  └─────┘ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘          │
│ ▸ M1     │                                                               │
│          │  ○───●───◉───○───○  Concept → EVT → [DVT] → PVT → MP       │
│          │                                                               │
│ ──────── │  ┌─────────────────────────────────────────────────┐         │
│ FILTERS  │  │ ISSUE TABLE                                      │         │
│          │  │ ID    Title         Status  Sev   Source  Owner  │         │
│ Status ▾ │  │ I-004 CAN timeout   OPEN   CRIT  INT    Đức Anh│         │
│ Sev    ▾ │  │ I-001 FC brownout   IN_PRG CRIT  INT    Đức Anh│         │
│ Owner  ▾ │  │ I-002 GPS cold      OPEN   HIGH  CROSS  T.Hà   │         │
│          │  └─────────────────────────────────────────────────┘         │
│          │                                                               │
│ ──────── │  ┌─ CASCADE ALERTS ─────────────────────────────────┐        │
│ CASCADE  │  │ ⚡ ISS-001 → DVT +2w → PVT +2w → MP +2w        │        │
│ ALERTS   │  │ ⚡ ISS-004 → DVT BLOCKED → PVT auto-shift       │        │
│ ⚡ 2     │  └──────────────────────────────────────────────────┘        │
│          │                                                               │
└──────────┴───────────────────────────────────────────────────────────────┘
```

---

## DESIGN SYSTEM

### Colors

```
// Core
--bg-primary:     #060A0F    // Deep space black
--bg-secondary:   #080C10    // Panel background
--bg-tertiary:    #0F1419    // Card/input background
--border:         #1E2A3A    // Borders
--border-active:  #3B82F6    // Active borders

// Text
--text-primary:   #E2E8F0    // Headings, primary
--text-secondary: #94A3B8    // Body text
--text-muted:     #475569    // Labels, captions
--text-dim:       #334155    // Disabled, timestamps

// Phase Colors
--phase-concept:  #6B7280    // Gray
--phase-evt:      #F59E0B    // Amber
--phase-dvt:      #3B82F6    // Blue
--phase-pvt:      #8B5CF6    // Purple
--phase-mp:       #10B981    // Emerald

// Status Colors
--status-open:    #EF4444    // Red
--status-progress:#F59E0B    // Amber
--status-blocked: #DC2626    // Deep red
--status-closed:  #10B981    // Green
--status-draft:   #6B7280    // Gray

// Severity
--sev-critical:   #EF4444
--sev-high:       #F59E0B
--sev-medium:     #3B82F6
--sev-low:        #6B7280

// Source
--src-internal:   #8B5CF6    // Purple
--src-external:   #F97316    // Orange
--src-crossteam:  #06B6D4    // Cyan

// Accent
--accent-blue:    #3B82F6    // Primary action
--accent-green:   #10B981    // Success
--accent-red:     #EF4444    // Danger
--accent-amber:   #F59E0B    // Warning
```

### Typography

```
Headings:  "Outfit" — 700/800 weight
Body:      "Outfit" — 400/500 weight
Mono:      "JetBrains Mono" — IDs, metrics, timestamps, code
```

### Aesthetic Direction

**Industrial Command Center** — inspired by Bloomberg Terminal + Mission Control
- Dark theme only (appropriate for data-dense monitoring)
- High information density (desktop-first)
- Accent color bars on top of cards (thin 2px gradients)
- Monospace for all data values (precision feel)
- Subtle glow effects on active/critical elements
- No rounded corners > 8px (sharp, precise)
- Grid-based layout with clear hierarchy

---

## TECH STACK

| Layer | Technology | Rationale |
|-------|-----------|-----------|
| Frontend | Next.js 14 (App Router) | SSR + RSC, tối ưu SEO & performance |
| Styling | Tailwind CSS 3 | Utility-first, dark theme easy |
| Components | Shadcn/ui + Custom | Enterprise-grade, accessible |
| State | Zustand | Lightweight, no boilerplate |
| Charts | Recharts | React-native, responsive |
| Backend | Supabase (PostgreSQL) | Auth + DB + Realtime + Storage |
| Auth | Supabase Auth | Email/password, RBAC via RLS |
| Realtime | Supabase Realtime | Live notifications, live updates |
| Deploy FE | Vercel | Zero-config Next.js hosting |
| Deploy BE | Supabase Cloud | Managed PostgreSQL |
| i18n | next-intl | Bilingual Vi-En |
| Testing | Vitest + Playwright | Unit + E2E |

---

## RBAC (Role-Based Access Control)

| Action | Admin | PM | Engineer | Viewer |
|--------|-------|-----|----------|--------|
| View Dashboard | ✅ | ✅ | ✅ | ✅ |
| Create Issue | ✅ | ✅ | ✅ (DRAFT) | ❌ |
| Review/Approve Issue | ✅ | ✅ | ❌ | ❌ |
| Edit Any Issue | ✅ | ✅ | Own only | ❌ |
| Close Issue | ✅ | ✅ | Own only | ❌ |
| Transition Phase | ✅ | ✅ | ❌ | ❌ |
| Edit Gate Conditions | ✅ | ✅ | ❌ | ❌ |
| Toggle Gate Checks | ✅ | ✅ | ✅ | ❌ |
| View BOM Cost | ✅ | ✅ | ❌ | ❌ |
| Manage Users | ✅ | ❌ | ❌ | ❌ |
| Configure System | ✅ | ❌ | ❌ | ❌ |

---

## DATABASE SCHEMA (Supabase PostgreSQL)

```sql
-- Users & Auth
users (
  id UUID PK,
  email TEXT UNIQUE,
  full_name TEXT,
  role ENUM('admin','pm','engineer','viewer'),
  avatar_url TEXT,
  language ENUM('vi','en') DEFAULT 'vi',
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Projects
projects (
  id UUID PK,
  code TEXT UNIQUE,          -- 'PRJ-001'
  name TEXT,
  description TEXT,
  current_phase ENUM('CONCEPT','EVT','DVT','PVT','MP'),
  phase_owner_id UUID FK → users,
  start_date DATE,
  target_mp_date DATE,
  status ENUM('ACTIVE','ON_HOLD','COMPLETED','CANCELLED'),
  created_by UUID FK → users,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Project Members (many-to-many)
project_members (
  project_id UUID FK → projects,
  user_id UUID FK → users,
  role_in_project ENUM('lead','member','reviewer','observer'),
  PRIMARY KEY (project_id, user_id)
)

-- Milestones
milestones (
  id UUID PK,
  project_id UUID FK → projects,
  phase ENUM('CONCEPT','EVT','DVT','PVT','MP'),
  target_date DATE,
  actual_date DATE,
  adjusted_date DATE,           -- after cascade
  status ENUM('PLANNED','IN_PROGRESS','COMPLETED','DELAYED'),
  delay_days INTEGER DEFAULT 0,
  delay_reason TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Gate Conditions
gate_conditions (
  id UUID PK,
  project_id UUID FK → projects,
  phase ENUM('CONCEPT','EVT','DVT','PVT','MP'),
  category TEXT,                 -- 'flight_test', 'env_test', 'emc', 'mechanical'
  label TEXT,
  label_vi TEXT,
  is_required BOOLEAN DEFAULT true,
  sort_order INTEGER,
  created_at TIMESTAMPTZ
)

-- Gate Checks (actual completion)
gate_checks (
  id UUID PK,
  condition_id UUID FK → gate_conditions,
  is_passed BOOLEAN DEFAULT false,
  passed_by UUID FK → users,
  passed_at TIMESTAMPTZ,
  evidence_url TEXT,             -- link to test report
  notes TEXT,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Phase Transitions (audit trail)
phase_transitions (
  id UUID PK,
  project_id UUID FK → projects,
  from_phase ENUM,
  to_phase ENUM,
  transitioned_by UUID FK → users,
  gate_snapshot JSONB,           -- snapshot of gate state at transition
  notes TEXT,
  created_at TIMESTAMPTZ
)

-- Issues
issues (
  id UUID PK,
  project_id UUID FK → projects,
  code TEXT UNIQUE,              -- 'ISS-001'
  title TEXT,
  description TEXT,
  root_cause TEXT,
  status ENUM('DRAFT','OPEN','IN_PROGRESS','BLOCKED','CLOSED'),
  severity ENUM('CRITICAL','HIGH','MEDIUM','LOW'),
  source ENUM('INTERNAL','EXTERNAL','CROSS_TEAM'),
  phase ENUM('CONCEPT','EVT','DVT','PVT','MP'),
  owner_id UUID FK → users,
  reviewer_id UUID FK → users,  -- PM who reviews
  reviewed_at TIMESTAMPTZ,
  due_date DATE,
  closed_at TIMESTAMPTZ,
  closed_by UUID FK → users,
  created_by UUID FK → users,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
)

-- Issue Impact Mapping
issue_impacts (
  id UUID PK,
  issue_id UUID FK → issues,
  affected_milestone_id UUID FK → milestones,
  impact_description TEXT,
  delay_days INTEGER,
  is_cascade BOOLEAN DEFAULT false,  -- auto-generated cascade
  created_at TIMESTAMPTZ
)

-- Issue Activity Log
issue_activities (
  id UUID PK,
  issue_id UUID FK → issues,
  author_id UUID FK → users,
  action ENUM('CREATED','UPDATED','STATUS_CHANGED','ASSIGNED','COMMENTED','CLOSED'),
  old_value TEXT,
  new_value TEXT,
  comment TEXT,
  created_at TIMESTAMPTZ
)

-- Notifications
notifications (
  id UUID PK,
  user_id UUID FK → users,
  type ENUM('CRITICAL_ISSUE','MILESTONE_IMPACT','GATE_CHANGE','OVERDUE_ISSUE','PHASE_TRANSITION','REVIEW_REQUEST'),
  title TEXT,
  title_vi TEXT,
  body TEXT,
  body_vi TEXT,
  reference_type TEXT,           -- 'issue', 'milestone', 'gate'
  reference_id UUID,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ
)

-- Audit Log
audit_log (
  id UUID PK,
  user_id UUID FK → users,
  action TEXT,
  entity_type TEXT,
  entity_id UUID,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ
)
```

---

## TASK DECOMPOSITION PREVIEW

```
Estimated Tasks: 12 TIPs
Estimated Effort: ~8-10 hours Claude Code time

TIP-001: Project Scaffold + Config
TIP-002: Database Schema + Seed Data
TIP-003: Auth System (Login/Register/RBAC)
TIP-004: Control Tower Dashboard
TIP-005: Issue Management — List + Filters
TIP-006: Issue Management — Create + Detail
TIP-007: PM Review Queue
TIP-008: Phase Timeline + Gate System
TIP-009: Cascade Delay Engine
TIP-010: Notification System
TIP-011: i18n (Vietnamese + English)
TIP-012: Polish + Integration Test + Verify
```

---

## CHECKPOINT

Chủ nhà xác nhận:
- [ ] Structure đúng mong muốn
- [ ] Design System phù hợp (Industrial Command Center)
- [ ] Requirements đầy đủ (19 REQs từ 6 RRI rounds)
- [ ] RBAC 4 roles hợp lý
- [ ] Database schema đầy đủ
- [ ] V1/V2 scope split hợp lý
- [ ] Tech stack phù hợp
- [ ] Task decomposition hợp lý
- [ ] Không thiếu gì quan trọng

Reply **"APPROVED"** để nhận Task Graph đầy đủ với TIP specifications.

---

# 📊 TASK GRAPH — Dependency Map

```
TIP-001: Scaffold ─────────────────────────────────────┐
    │                                                    │
    ▼                                                    │
TIP-002: DB Schema + Seed ──────────────┐               │
    │                                    │               │
    ▼                                    │               │
TIP-003: Auth + RBAC                     │               │
    │                                    │               │
    ├────────────┬───────────┬──────────┤               │
    ▼            ▼           ▼          ▼               │
TIP-004:    TIP-005:    TIP-008:    TIP-010:            │
Dashboard   Issue List  Phase/Gate  Notif.              │
    │           │           │          │                │
    │           ▼           │          │                │
    │       TIP-006:        │          │                │
    │       Issue CRUD      │          │                │
    │           │           │          │                │
    │           ▼           ▼          │                │
    │       TIP-007:    TIP-009:       │                │
    │       Review Q    Cascade Eng    │                │
    │           │           │          │                │
    └───────────┴───────────┴──────────┘                │
                    │                                    │
                    ▼                                    │
               TIP-011: i18n ◄──────────────────────────┘
                    │
                    ▼
               TIP-012: Polish + VERIFY
```

---

## TIP-001: Project Scaffold + Configuration

### HEADER
- TIP-ID: TIP-001
- Project: RtR Control Tower
- Module: Foundation
- Depends on: None
- Priority: P0
- Estimated effort: 30 minutes

### CONTEXT
- Working directory: `~/rtr-control-tower`
- New project, no existing code
- Tech: Next.js 14 App Router + Tailwind + Supabase

### TASK
Scaffold Next.js 14 project với App Router, cấu hình Tailwind dark theme, setup Supabase client, cấu hình folder structure theo Blueprint.

### SPECIFICATIONS
```
Folder Structure:
src/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── page.tsx              // Control Tower
│   │   ├── issues/
│   │   │   ├── page.tsx          // Issue List
│   │   │   ├── new/page.tsx      // Create Issue
│   │   │   └── [id]/page.tsx     // Issue Detail
│   │   ├── gates/page.tsx        // Phase & Gate
│   │   ├── impact/page.tsx       // Impact Map
│   │   ├── team/page.tsx         // Team View
│   │   ├── review/page.tsx       // PM Review Queue
│   │   └── layout.tsx            // Dashboard layout (sidebar + header)
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── ui/                       // Shadcn base components
│   ├── dashboard/                // Dashboard-specific
│   ├── issues/                   // Issue-specific
│   ├── gates/                    // Gate-specific
│   └── layout/                   // Header, Sidebar, Nav
├── lib/
│   ├── supabase/
│   │   ├── client.ts
│   │   ├── server.ts
│   │   └── middleware.ts
│   ├── utils.ts
│   └── constants.ts
├── hooks/
│   ├── useAuth.ts
│   ├── useProject.ts
│   └── useNotifications.ts
├── stores/
│   └── useStore.ts               // Zustand
├── types/
│   └── index.ts                  // All TypeScript types
├── i18n/
│   ├── vi.json
│   └── en.json
└── middleware.ts                  // Auth guard
```

### ACCEPTANCE CRITERIA
```
Given: Fresh system
When: Run `npm run dev`
Then: Next.js starts on localhost:3000 with dark theme
  AND: Tailwind configured with custom colors from Design System
  AND: Supabase client initialized (env vars placeholder)
  AND: All folder structure exists
  AND: TypeScript strict mode enabled
  AND: ESLint configured
```

### CONSTRAINTS
- Next.js 14 App Router (NOT Pages Router)
- Tailwind CSS (NOT CSS modules)
- TypeScript strict: true
- Node.js 20+, pnpm
- Dark theme ONLY (no light mode toggle)

---

## TIP-002 through TIP-012: [Detailed specs available on request]

Mỗi TIP sẽ follow format tương tự với:
- Detailed SPECIFICATIONS
- Gherkin ACCEPTANCE CRITERIA
- CONSTRAINTS rõ ràng
- Dependency references

---

# CONTRACT: RtR Control Tower V1

## DELIVERABLES

| # | Item | Chi tiết | Requirements |
|---|------|----------|--------------|
| 1 | Control Tower Dashboard | Portfolio view, project snapshot, metrics, alerts | REQ-001,002,003,007,012,018 |
| 2 | Issue Management System | CRUD, filters, detail, activity log, impact mapping | REQ-004,005,006,014,015,018 |
| 3 | Phase & Gate System | Timeline, gate conditions, DVT special, cascade engine | REQ-010,011,012,005 |
| 4 | Auth + RBAC | Login, 4 roles, permissions, audit | REQ-013,014,015 |
| 5 | Notification System | In-app, 4 priority levels | REQ-006 |
| 6 | i18n Bilingual | Vietnamese + English toggle | REQ-018 |

## TECH STACK
Next.js 14 + Tailwind + Supabase + Zustand + Recharts + next-intl

## TASK GRAPH SUMMARY
12 TIPs, estimated 8-10 hours Claude Code time

## KHÔNG BAO GỒM (V2)
- BOM Management
- Flight Test Log
- Supplier Tracking
- Decisions Log
- Excel Import Wizard
- SSO Integration
- Email notifications
- Mobile responsive
- Reporting/Export

## CONFIRM
Reply **"CONFIRM"** để Chủ thầu bắt đầu giao TIP cho Thợ thi công.
