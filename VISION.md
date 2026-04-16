# RtR Control Tower — Vision Delta v0.1

**Status:** APPROVED by Human (Gate 1)  
**Date:** 2026-04-16  
**Supersedes (partially):** RtR-Control-Tower-Blueprint.md (26-Feb-2026) — giáng cấp thành "Historical V1"  
**Aligns with:** RtR-Control-Tower-XRay.md (09-Mar-2026) — living document

## North Star

Biến RtR Control Tower thành công cụ nội bộ đủ độ tin cậy để 5+ engineer/PM/management dùng hàng ngày mà không cần đội dev giám hộ.

## Sponsor Context

- **Audience:** Nội bộ mở rộng (engineer + PM + management)
- **Success metric:** Stability > features. Tốc độ dev + số bug giảm, không phải roadmap mới.
- **Budget:** Production-grade (security + performance mandatory), không deadline customer/audit.

## Delta vs Blueprint V1

| Khía cạnh | Blueprint V1 | Vision Delta v0.1 |
|---|---|---|
| Tech stack | Next.js 14 + Tailwind + Zustand | **Giữ React 19 + Vite 7 + inline CSS** |
| Scope modules | 3 (Dashboard, Issues, Gates) | **11 modules hiện tại**, không thêm mới |
| Theme | Dark only | **Giữ Dark/Light toggle** |
| Viewport | Desktop only | **Giữ responsive mobile/tablet** |
| Blueprint.md | North star | **Historical V1 (outdated)** |

## 3 Pillars

### Pillar 1 — DATA TRUTH
Mọi export và UI phải dùng live Supabase data, không static fallback.
- TD-H1: BOM export live data
- TD-H2: Flight Test export live data  
- TD-H3: PDF export aggregate live
- TD-M1: Team tab sync profiles + project_members
- TD-M2: Issue trend chart compute từ real issues

### Pillar 2 — ARCHITECTURE HEALTH
- TD-H4: App.jsx 1950 LOC → tách route-level, target ≤ 400 LOC
- Dead code audit (upsertToSupabase defensive check...)
- Per-module self-contained state + data fetching

### Pillar 3 — PRODUCTION HARDENING
- RLS audit 17 Supabase tables
- Secret management: fail-fast pattern mở rộng
- Error boundaries route-level
- Smoke test Playwright 10 scenarios (từ RRI test series)
- Bundle baseline: ≤ 422KB gzipped

## Anti-Scope

- KHÔNG rebuild theo Blueprint (Next.js/Tailwind/Zustand)
- KHÔNG đụng cross_app_data, mrp-sync.mjs logic
- KHÔNG build feature mới (SSO, email send thật, Decision CRUD...)
- KHÔNG đụng Intelligence/SignalHub
- KHÔNG đụng i18n, theme toggle, responsive
- KHÔNG move/delete rtr-control-tower-v1.jsx (giữ làm historical ref)

## Acceptance Criteria (sprint-level)

- AC-1: 6 HIGH tech debt → RESOLVED hoặc DEFER có justification
- AC-2: 5 MEDIUM tech debt → RESOLVED hoặc DEFER
- AC-3: Bundle gzipped ≤ 422KB
- AC-4: App.jsx ≤ 400 LOC
- AC-5: Smoke test Playwright 10 scenarios pass
- AC-6: RLS enabled tất cả 17 tables, audit pass
- AC-7: Grep secrets toàn codebase → 0 hit
- AC-8: Blueprint.md → Historical V1 + ARCHITECTURE.md living doc
- AC-9: Documentation drift fix (.gitmodules/monorepo decision)

## Estimate

~17 TIPs, 21-28h Claude Code total (tentative, refine ở Blueprint Delta).

## Dependencies

- Access rtr-app/ (hiện Option C — public only; sẽ cần reopen ở Blueprint)
- Supabase Ops check (Human task, pending)
- Approval Blueprint Delta (Gate 2, chưa tới)

## References

- RtR-Control-Tower-Blueprint.md — Historical V1 context
- RtR-Control-Tower-XRay.md — Actual implementation state
- DEPLOYMENT.md — Deploy architecture
- sync/mrp-sync.mjs — Integration touchpoint (out of scope)

---

*Vision này là contract. Thay đổi sau approval phải quay lại Vision phase.*
