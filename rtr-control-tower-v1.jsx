import { useState, useEffect, useCallback, useMemo, createContext, useContext } from "react";

// ═══════════════════════════════════════════════════════════════
// RtR CONTROL TOWER V1 — Full Interactive Prototype
// Based on Vibecode Kit v5.0 Blueprint
// 3 Core Modules: Dashboard, Issues, Phase & Gates
// ═══════════════════════════════════════════════════════════════

// --- i18n ---
const LANG = {
  vi: {
    appName: "RtR Control Tower",
    appSub: "Real-time Robotics • Quản lý Dự án Drone",
    tabs: { tower: "Bảng Điều Khiển", issues: "Vấn Đề", gates: "Cổng Phase", impact: "Bản Đồ Ảnh Hưởng", team: "Đội Ngũ", review: "Duyệt" },
    metrics: { activeProjects: "Dự án", openIssues: "Đang mở", critical: "Nghiêm trọng", blocked: "Bị chặn", closureRate: "Tỷ lệ đóng", cascadeAlerts: "Cảnh báo delay" },
    issue: { id: "Mã", title: "Tiêu đề", status: "Trạng thái", severity: "Mức độ", source: "Nguồn", owner: "Chịu TN", phase: "Phase", rootCause: "Nguyên nhân gốc", impactMap: "Bản đồ ảnh hưởng", activityLog: "Nhật ký hoạt động", create: "Tạo vấn đề", noIssues: "Không có vấn đề nào", description: "Mô tả", dueDate: "Hạn xử lý", all: "Tất cả" },
    gate: { ready: "SẴN SÀNG", blocked: "CHƯA ĐỦ", passed: "đã đạt", required: "BẮT BUỘC", transition: "Chuyển Phase", confirm: "Xác nhận chuyển", conditions: "Điều kiện cổng", testCategories: "Nhóm kiểm tra" },
    cascade: { title: "Cảnh Báo Cascade", ripple: "Hiệu ứng dây chuyền", delayBy: "Trễ", weeks: "tuần", autoShift: "tự động dịch" },
    status: { DRAFT: "Nháp", OPEN: "Mở", IN_PROGRESS: "Đang xử lý", BLOCKED: "Bị chặn", CLOSED: "Đã đóng" },
    severity: { CRITICAL: "Nghiêm trọng", HIGH: "Cao", MEDIUM: "Trung bình", LOW: "Thấp" },
    source: { INTERNAL: "Nội bộ", EXTERNAL: "Bên ngoài", CROSS_TEAM: "Liên nhóm" },
    role: { admin: "Quản trị", pm: "Quản lý DA", engineer: "Kỹ sư", viewer: "Xem" },
    review: { queue: "Hàng chờ duyệt", approve: "Duyệt", reject: "Trả lại", pending: "Chờ duyệt", noPending: "Không có vấn đề chờ duyệt" },
    team: { workload: "Khối lượng công việc", openTasks: "việc đang mở", member: "Thành viên" },
    notifications: "Thông báo",
    phaseOwner: "Chủ Phase",
    targetMP: "Mục tiêu MP",
    gateProgress: "Tiến độ cổng",
    milestoneRisk: "Rủi ro Milestone",
    blockingIssues: "vấn đề chặn",
    save: "Lưu", cancel: "Hủy", close: "Đóng", search: "Tìm kiếm...",
  },
  en: {
    appName: "RtR Control Tower",
    appSub: "Real-time Robotics • Drone Program Management",
    tabs: { tower: "Control Tower", issues: "Issues", gates: "Phase Gates", impact: "Impact Map", team: "Team", review: "Review" },
    metrics: { activeProjects: "Projects", openIssues: "Open", critical: "Critical", blocked: "Blocked", closureRate: "Closure", cascadeAlerts: "Cascade Alerts" },
    issue: { id: "ID", title: "Title", status: "Status", severity: "Severity", source: "Source", owner: "Owner", phase: "Phase", rootCause: "Root Cause", impactMap: "Impact Mapping", activityLog: "Activity Log", create: "Create Issue", noIssues: "No issues match filters", description: "Description", dueDate: "Due Date", all: "All" },
    gate: { ready: "GATE READY", blocked: "GATE BLOCKED", passed: "passed", required: "REQUIRED", transition: "Transition Phase", confirm: "Confirm Transition", conditions: "Gate Conditions", testCategories: "Test Categories" },
    cascade: { title: "Cascade Alerts", ripple: "Ripple Effect", delayBy: "Delay by", weeks: "weeks", autoShift: "auto-shift" },
    status: { DRAFT: "Draft", OPEN: "Open", IN_PROGRESS: "In Progress", BLOCKED: "Blocked", CLOSED: "Closed" },
    severity: { CRITICAL: "Critical", HIGH: "High", MEDIUM: "Medium", LOW: "Low" },
    source: { INTERNAL: "Internal", EXTERNAL: "External", CROSS_TEAM: "Cross-team" },
    role: { admin: "Admin", pm: "PM", engineer: "Engineer", viewer: "Viewer" },
    review: { queue: "Review Queue", approve: "Approve", reject: "Return", pending: "Pending Review", noPending: "No pending issues" },
    team: { workload: "Workload", openTasks: "open tasks", member: "Member" },
    notifications: "Notifications",
    phaseOwner: "Phase Owner",
    targetMP: "Target MP",
    gateProgress: "Gate Progress",
    milestoneRisk: "Milestone Risk",
    blockingIssues: "blocking issues",
    save: "Save", cancel: "Cancel", close: "Close", search: "Search...",
  },
};

// --- CONSTANTS ---
const PHASES = ["CONCEPT", "EVT", "DVT", "PVT", "MP"];
const PHASE_COLORS = { CONCEPT: "#6B7280", EVT: "#F59E0B", DVT: "#3B82F6", PVT: "#8B5CF6", MP: "#10B981" };
const STATUS_LIST = ["DRAFT", "OPEN", "IN_PROGRESS", "BLOCKED", "CLOSED"];
const STATUS_COLORS = { DRAFT: "#6B7280", OPEN: "#EF4444", IN_PROGRESS: "#F59E0B", BLOCKED: "#DC2626", CLOSED: "#10B981" };
const SEV_LIST = ["CRITICAL", "HIGH", "MEDIUM", "LOW"];
const SEV_COLORS = { CRITICAL: "#EF4444", HIGH: "#F59E0B", MEDIUM: "#3B82F6", LOW: "#6B7280" };
const SRC_LIST = ["INTERNAL", "EXTERNAL", "CROSS_TEAM"];
const SRC_COLORS = { INTERNAL: "#8B5CF6", EXTERNAL: "#F97316", CROSS_TEAM: "#06B6D4" };

// --- GATE CONDITIONS (DVT has 4 test categories) ---
const GATE_CONFIG = {
  CONCEPT: { conditions: [
    { id: "c1", label: "Product requirements defined", label_vi: "Yêu cầu sản phẩm đã xác định", required: true, cat: "general" },
    { id: "c2", label: "Feasibility study completed", label_vi: "Nghiên cứu khả thi hoàn tất", required: true, cat: "general" },
    { id: "c3", label: "Initial BOM estimated", label_vi: "BOM ước lượng ban đầu", required: false, cat: "general" },
  ]},
  EVT: { conditions: [
    { id: "e1", label: "Schematic review passed", label_vi: "Review sơ đồ mạch đạt", required: true, cat: "design" },
    { id: "e2", label: "PCB layout DRC clean", label_vi: "PCB layout DRC sạch", required: true, cat: "design" },
    { id: "e3", label: "BOM finalized & sourced", label_vi: "BOM đã chốt & tìm nguồn", required: true, cat: "supply" },
    { id: "e4", label: "First power-on successful", label_vi: "Bật nguồn lần đầu OK", required: true, cat: "test" },
    { id: "e5", label: "Basic flight test passed", label_vi: "Bay test cơ bản đạt", required: false, cat: "test" },
  ]},
  DVT: { conditions: [
    { id: "d1", label: "All EVT issues closed", label_vi: "Mọi vấn đề EVT đã đóng", required: true, cat: "prerequisite" },
    { id: "d2", label: "Flight endurance validated", label_vi: "Thời gian bay xác nhận", required: true, cat: "flight_test" },
    { id: "d3", label: "Stability test passed", label_vi: "Test ổn định đạt", required: true, cat: "flight_test" },
    { id: "d4", label: "Thermal test passed", label_vi: "Test nhiệt đạt", required: true, cat: "env_test" },
    { id: "d5", label: "Humidity test passed", label_vi: "Test ẩm đạt", required: true, cat: "env_test" },
    { id: "d6", label: "Dust ingress test passed", label_vi: "Test bụi đạt", required: true, cat: "env_test" },
    { id: "d7", label: "EMC pre-scan passed", label_vi: "EMC pre-scan đạt", required: true, cat: "emc_test" },
    { id: "d8", label: "EMI certification submitted", label_vi: "Đã nộp chứng nhận EMI", required: true, cat: "emc_test" },
    { id: "d9", label: "Drop test passed", label_vi: "Test rơi đạt", required: true, cat: "mech_test" },
    { id: "d10", label: "Vibration test passed", label_vi: "Test rung đạt", required: true, cat: "mech_test" },
    { id: "d11", label: "Design freeze approved", label_vi: "Đã phê duyệt đóng băng thiết kế", required: true, cat: "prerequisite" },
  ]},
  PVT: { conditions: [
    { id: "p1", label: "All DVT issues closed", label_vi: "Mọi vấn đề DVT đã đóng", required: true, cat: "prerequisite" },
    { id: "p2", label: "Production line validated", label_vi: "Dây chuyền sản xuất đã xác nhận", required: true, cat: "production" },
    { id: "p3", label: "QC process documented", label_vi: "Quy trình QC đã tài liệu hóa", required: true, cat: "production" },
    { id: "p4", label: "Yield > 95%", label_vi: "Yield > 95%", required: true, cat: "production" },
    { id: "p5", label: "Regulatory certification", label_vi: "Chứng nhận pháp quy", required: true, cat: "compliance" },
  ]},
  MP: { conditions: [
    { id: "m1", label: "All PVT issues closed", label_vi: "Mọi vấn đề PVT đã đóng", required: true, cat: "prerequisite" },
    { id: "m2", label: "Mass production BOM locked", label_vi: "BOM sản xuất hàng loạt đã khóa", required: true, cat: "production" },
    { id: "m3", label: "Supply chain confirmed", label_vi: "Chuỗi cung ứng đã xác nhận", required: true, cat: "supply" },
  ]},
};

const DVT_CATEGORIES = {
  flight_test: { label: "Flight Test", label_vi: "Bay Thử", icon: "✈", color: "#3B82F6" },
  env_test: { label: "Environmental", label_vi: "Môi Trường", icon: "🌡", color: "#10B981" },
  emc_test: { label: "EMC/EMI", label_vi: "EMC/EMI", icon: "📡", color: "#F59E0B" },
  mech_test: { label: "Mechanical", label_vi: "Cơ Khí", icon: "⚙", color: "#8B5CF6" },
};

// --- SAMPLE DATA ---
const PROJECTS = [
  { id: "PRJ-001", name: "RTR-X7 Surveyor", desc: "Enterprise survey drone with RTK GPS", descVi: "Drone khảo sát doanh nghiệp với RTK GPS", phase: "DVT", phaseOwner: "Minh Tuấn", startDate: "2025-06-01", targetMP: "2026-06-01",
    milestones: { CONCEPT: { target: "2025-06-30", actual: "2025-06-28", adjusted: null, status: "COMPLETED" }, EVT: { target: "2025-09-30", actual: "2025-10-15", adjusted: null, status: "COMPLETED" }, DVT: { target: "2026-01-31", actual: null, adjusted: "2026-02-14", status: "IN_PROGRESS" }, PVT: { target: "2026-04-15", actual: null, adjusted: "2026-04-29", status: "PLANNED" }, MP: { target: "2026-06-01", actual: null, adjusted: "2026-06-15", status: "PLANNED" } },
    gateChecks: { CONCEPT: { c1: true, c2: true, c3: true }, EVT: { e1: true, e2: true, e3: true, e4: true, e5: true }, DVT: { d1: false, d2: false, d3: false, d4: true, d5: true, d6: false, d7: false, d8: false, d9: true, d10: true, d11: false }, PVT: {}, MP: {} },
  },
  { id: "PRJ-002", name: "RTR-A3 Agri Sprayer", desc: "Agricultural spraying drone 20L payload", descVi: "Drone phun thuốc nông nghiệp tải 20L", phase: "EVT", phaseOwner: "Hồng Phúc", startDate: "2025-09-01", targetMP: "2026-09-01",
    milestones: { CONCEPT: { target: "2025-09-30", actual: "2025-09-25", adjusted: null, status: "COMPLETED" }, EVT: { target: "2026-01-15", actual: null, adjusted: "2026-02-01", status: "IN_PROGRESS" }, DVT: { target: "2026-04-01", actual: null, adjusted: "2026-04-15", status: "PLANNED" }, PVT: { target: "2026-07-01", actual: null, adjusted: "2026-07-15", status: "PLANNED" }, MP: { target: "2026-09-01", actual: null, adjusted: "2026-09-15", status: "PLANNED" } },
    gateChecks: { CONCEPT: { c1: true, c2: true, c3: true }, EVT: { e1: true, e2: true, e3: false, e4: false, e5: false }, DVT: {}, PVT: {}, MP: {} },
  },
];

const ISSUES_DATA = [
  { id: "ISS-001", pid: "PRJ-001", title: "FC board brownout during high-G maneuver", titleVi: "Board FC mất nguồn khi cơ động G cao", desc: "Flight controller loses power during aggressive banking at >2G", rootCause: "Voltage regulator insufficient current capacity under transient load", status: "IN_PROGRESS", sev: "CRITICAL", src: "INTERNAL", owner: "Đức Anh", phase: "DVT", created: "2026-01-15", due: "2026-02-28",
    impacts: [{ phase: "DVT", desc: "Delay design freeze by 2 weeks", descVi: "Trì hoãn đóng băng thiết kế 2 tuần", days: 14 }, { phase: "PVT", desc: "Auto-shift PVT start by 2 weeks", descVi: "PVT tự động dịch 2 tuần", days: 14 }],
    updates: [{ date: "2026-01-15", author: "Đức Anh", text: "Identified brownout during flight test #47" }, { date: "2026-01-20", author: "Đức Anh", text: "Root cause: LDO max 500mA, peak draw 720mA" }, { date: "2026-02-10", author: "Minh Tuấn", text: "New regulator TPS62A02 sampled, testing next week" }],
  },
  { id: "ISS-002", pid: "PRJ-001", title: "GPS module cold start >45s", titleVi: "Module GPS khởi động lạnh >45 giây", desc: "RTK GPS takes too long for first fix in cold conditions", rootCause: "Antenna placement near motor EMI source", status: "OPEN", sev: "HIGH", src: "CROSS_TEAM", owner: "Thanh Hà", phase: "DVT", created: "2026-01-22", due: "2026-03-10",
    impacts: [{ phase: "DVT", desc: "May require PCB respin", descVi: "Có thể cần làm lại PCB", days: 21 }],
    updates: [{ date: "2026-01-22", author: "Thanh Hà", text: "Measured TTFF consistently >45s in field" }, { date: "2026-02-01", author: "Thanh Hà", text: "EMC scan shows noise at 1.575GHz from motor driver" }],
  },
  { id: "ISS-003", pid: "PRJ-001", title: "Battery connector arcing", titleVi: "Đầu nối pin phóng tia lửa", desc: "XT60 connector arcing after 50 connect cycles", rootCause: "Contact resistance increasing due to plating wear", status: "CLOSED", sev: "MEDIUM", src: "EXTERNAL", owner: "Văn Hùng", phase: "EVT", created: "2025-10-05", due: "2025-10-25",
    impacts: [],
    updates: [{ date: "2025-10-05", author: "Văn Hùng", text: "Arcing observed on unit #3" }, { date: "2025-10-12", author: "Văn Hùng", text: "Switched to gold-plated XT60H from supplier B" }, { date: "2025-10-20", author: "Văn Hùng", text: "100 cycle test passed. Closed." }],
  },
  { id: "ISS-004", pid: "PRJ-001", title: "ESC firmware CAN bus timeout", titleVi: "ESC firmware CAN bus hết thời gian", desc: "CAN messages from ESC #4 drop intermittently", rootCause: "Pending investigation", status: "OPEN", sev: "CRITICAL", src: "INTERNAL", owner: "Đức Anh", phase: "DVT", created: "2026-02-18", due: "2026-03-05",
    impacts: [{ phase: "DVT", desc: "Flight test program halted", descVi: "Chương trình bay test dừng", days: 14 }, { phase: "PVT", desc: "Cannot proceed without stable CAN", descVi: "Không thể tiến hành nếu CAN chưa ổn", days: 14 }],
    updates: [{ date: "2026-02-18", author: "Đức Anh", text: "CAN timeout errors in flight log, motor #4 stutter" }],
  },
  { id: "ISS-005", pid: "PRJ-001", title: "Thermal throttling at 45°C ambient", titleVi: "Giảm hiệu năng nhiệt ở 45°C", desc: "Processor thermal throttles in hot climate conditions", rootCause: "Heat sink undersized for tropical operation", status: "DRAFT", sev: "HIGH", src: "INTERNAL", owner: "Đức Anh", phase: "DVT", created: "2026-02-22", due: "2026-03-15",
    impacts: [{ phase: "DVT", desc: "Environmental test may fail", descVi: "Test môi trường có thể fail", days: 7 }],
    updates: [{ date: "2026-02-22", author: "Đức Anh", text: "Observed CPU freq drop from 1.8GHz to 1.2GHz at 45°C ambient in chamber" }],
  },
  { id: "ISS-006", pid: "PRJ-002", title: "Spray nozzle clogging at low flow", titleVi: "Vòi phun tắc ở lưu lượng thấp", desc: "Nozzle clogs when flow rate drops below 0.5L/min", rootCause: "Nozzle mesh filter too fine for pesticide viscosity", status: "IN_PROGRESS", sev: "HIGH", src: "EXTERNAL", owner: "Bảo Trâm", phase: "EVT", created: "2026-01-10", due: "2026-02-28",
    impacts: [{ phase: "EVT", desc: "Spray system redesign needed", descVi: "Cần thiết kế lại hệ thống phun", days: 14 }],
    updates: [{ date: "2026-01-10", author: "Bảo Trâm", text: "Clogging after 5 minutes of low-rate spray" }, { date: "2026-01-18", author: "Bảo Trâm", text: "Testing 200-mesh filter from supplier C" }],
  },
  { id: "ISS-007", pid: "PRJ-002", title: "Frame vibration at 40% throttle resonance", titleVi: "Khung rung cộng hưởng ở 40% ga", desc: "Structural resonance causes excessive vibration", rootCause: "Motor mount natural frequency matches prop RPM at 40%", status: "BLOCKED", sev: "HIGH", src: "INTERNAL", owner: "Hồng Phúc", phase: "EVT", created: "2026-02-05", due: "2026-03-01",
    impacts: [{ phase: "EVT", desc: "Cannot validate flight endurance", descVi: "Không thể xác nhận thời gian bay", days: 14 }, { phase: "DVT", desc: "May delay DVT entry by 2 weeks", descVi: "Có thể trì hoãn bắt đầu DVT 2 tuần", days: 14 }],
    updates: [{ date: "2026-02-05", author: "Hồng Phúc", text: "Vibration spike at 40% throttle on accelerometer" }, { date: "2026-02-12", author: "Hồng Phúc", text: "FEA analysis confirms resonance. Waiting for damper samples." }],
  },
];

const TEAM = [
  { name: "Minh Tuấn", role: "pm", projects: ["PRJ-001"] },
  { name: "Hồng Phúc", role: "pm", projects: ["PRJ-002"] },
  { name: "Đức Anh", role: "engineer", projects: ["PRJ-001"] },
  { name: "Thanh Hà", role: "engineer", projects: ["PRJ-001"] },
  { name: "Văn Hùng", role: "engineer", projects: ["PRJ-001", "PRJ-002"] },
  { name: "Bảo Trâm", role: "engineer", projects: ["PRJ-002"] },
  { name: "Quỳnh Anh", role: "admin", projects: ["PRJ-001", "PRJ-002"] },
];

const NOTIFICATIONS = [
  { id: 1, type: "CRITICAL_ISSUE", title: "New CRITICAL: ESC CAN bus timeout", titleVi: "CRITICAL mới: ESC CAN bus hết thời gian", ref: "ISS-004", time: "2h ago", timeVi: "2 giờ trước", read: false },
  { id: 2, type: "MILESTONE_IMPACT", title: "DVT milestone shifted +2 weeks (PRJ-001)", titleVi: "DVT milestone dịch +2 tuần (PRJ-001)", ref: "PRJ-001", time: "5h ago", timeVi: "5 giờ trước", read: false },
  { id: 3, type: "OVERDUE_ISSUE", title: "ISS-006 overdue by 3 days", titleVi: "ISS-006 quá hạn 3 ngày", ref: "ISS-006", time: "1d ago", timeVi: "1 ngày trước", read: true },
  { id: 4, type: "GATE_CHANGE", title: "DVT gate: Thermal test now passed", titleVi: "Cổng DVT: Test nhiệt đã đạt", ref: "PRJ-001", time: "2d ago", timeVi: "2 ngày trước", read: true },
];

// ═══════════════════════════════════════════════════════════════
// REUSABLE COMPONENTS
// ═══════════════════════════════════════════════════════════════

const mono = "'JetBrains Mono', 'Fira Code', monospace";
const sans = "'Outfit', 'Segoe UI', system-ui, sans-serif";

const Badge = ({ label, color, size = "sm", glow }) => (
  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: size === "sm" ? "1px 7px" : "3px 10px", borderRadius: 3, background: color + "15", color, fontSize: size === "sm" ? 9 : 10, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", border: `1px solid ${color}25`, fontFamily: mono, whiteSpace: "nowrap", boxShadow: glow ? `0 0 8px ${color}30` : "none" }}>
    <span style={{ width: 5, height: 5, borderRadius: "50%", background: color, flexShrink: 0 }} />
    {label}
  </span>
);

const Metric = ({ label, value, color = "#E2E8F0", sub, icon }) => (
  <div style={{ background: "#0F1419", border: "1px solid #1E2A3A", borderRadius: 6, padding: "12px 14px", position: "relative", overflow: "hidden", flex: 1, minWidth: 0 }}>
    <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${color}, transparent)` }} />
    <div style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 600, fontFamily: sans }}>{icon} {label}</div>
    <div style={{ fontSize: 22, fontWeight: 800, color, fontFamily: mono, lineHeight: 1 }}>{value}</div>
    {sub && <div style={{ fontSize: 9, color: "#475569", marginTop: 3, fontFamily: sans }}>{sub}</div>}
  </div>
);

const Btn = ({ children, onClick, variant = "default", small, disabled }) => {
  const styles = { default: { bg: "#1E2A3A", border: "#2D3F54", color: "#CBD5E1" }, primary: { bg: "#1D4ED8", border: "#2563EB", color: "#fff" }, danger: { bg: "#7F1D1D", border: "#991B1B", color: "#FCA5A5" }, success: { bg: "#065F46", border: "#047857", color: "#6EE7B7" }, ghost: { bg: "transparent", border: "transparent", color: "#64748B" } };
  const s = styles[variant];
  return (
    <button onClick={onClick} disabled={disabled} style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 4, padding: small ? "3px 8px" : "6px 12px", color: s.color, fontSize: small ? 9 : 10, fontWeight: 600, cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.4 : 1, fontFamily: sans, transition: "all 0.15s", letterSpacing: "0.03em" }}>
      {children}
    </button>
  );
};

const Section = ({ title, children, actions, noPad }) => (
  <div style={{ background: "#080C10", border: "1px solid #1E2A3A", borderRadius: 8, overflow: "hidden" }}>
    {title && (
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: "1px solid #1E2A3A" }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0", fontFamily: sans }}>{title}</span>
        {actions && <div style={{ display: "flex", gap: 6 }}>{actions}</div>}
      </div>
    )}
    <div style={{ padding: noPad ? 0 : 16 }}>{children}</div>
  </div>
);

// ═══════════════════════════════════════════════════════════════
// MAIN APP
// ═══════════════════════════════════════════════════════════════

export default function App() {
  const [lang, setLang] = useState("vi");
  const [tab, setTab] = useState("tower");
  const [selProject, setSelProject] = useState("PRJ-001");
  const [selIssue, setSelIssue] = useState(null);
  const [filters, setFilters] = useState({ status: "ALL", sev: "ALL", src: "ALL" });
  const [projects, setProjects] = useState(PROJECTS);
  const [issues, setIssues] = useState(ISSUES_DATA);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [showNotif, setShowNotif] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [currentUser] = useState({ name: "Quỳnh Anh", role: "admin" });
  const [time, setTime] = useState(new Date());

  const t = LANG[lang];
  const project = projects.find(p => p.id === selProject);
  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => { const i = setInterval(() => setTime(new Date()), 1000); return () => clearInterval(i); }, []);

  // --- Filtered issues ---
  const filteredIssues = useMemo(() => {
    let f = issues.filter(i => i.pid === selProject);
    if (filters.status !== "ALL") f = f.filter(i => i.status === filters.status);
    if (filters.sev !== "ALL") f = f.filter(i => i.sev === filters.sev);
    if (filters.src !== "ALL") f = f.filter(i => i.src === filters.src);
    return f;
  }, [issues, selProject, filters]);

  // --- Computed metrics ---
  const projectIssues = issues.filter(i => i.pid === selProject);
  const allOpen = issues.filter(i => i.status !== "CLOSED");
  const allCrit = issues.filter(i => i.sev === "CRITICAL" && i.status !== "CLOSED");
  const allBlocked = issues.filter(i => i.status === "BLOCKED");
  const cascadeIssues = issues.filter(i => i.status !== "CLOSED" && i.impacts.length > 0);
  const draftIssues = issues.filter(i => i.pid === selProject && i.status === "DRAFT");

  // --- Gate helpers ---
  const getGateProgress = (proj, phase) => {
    const conds = GATE_CONFIG[phase]?.conditions || [];
    const checks = proj.gateChecks[phase] || {};
    const total = conds.length;
    const passed = conds.filter(c => checks[c.id]).length;
    const reqTotal = conds.filter(c => c.required).length;
    const reqPassed = conds.filter(c => c.required && checks[c.id]).length;
    return { total, passed, reqTotal, reqPassed, pct: total ? Math.round(passed / total * 100) : 0, canPass: reqPassed === reqTotal };
  };

  const toggleGate = (phase, condId) => {
    setProjects(prev => prev.map(p => {
      if (p.id !== selProject) return p;
      const gc = { ...p.gateChecks };
      gc[phase] = { ...gc[phase], [condId]: !gc[phase]?.[condId] };
      return { ...p, gateChecks: gc };
    }));
  };

  // --- Issue actions ---
  const updateIssueStatus = (issueId, newStatus) => {
    setIssues(prev => prev.map(i => i.id === issueId ? { ...i, status: newStatus } : i));
    if (selIssue?.id === issueId) setSelIssue(prev => ({ ...prev, status: newStatus }));
  };

  // --- Cascade calculation ---
  const getCascade = (proj) => {
    const pIssues = issues.filter(i => i.pid === proj.id && i.status !== "CLOSED");
    const cascades = [];
    pIssues.forEach(issue => {
      issue.impacts.forEach(imp => {
        const phaseIdx = PHASES.indexOf(imp.phase);
        const chain = [{ phase: imp.phase, days: imp.days, desc: lang === "vi" ? imp.descVi : imp.desc }];
        for (let i = phaseIdx + 1; i < PHASES.length; i++) {
          chain.push({ phase: PHASES[i], days: imp.days, desc: `${t.cascade.autoShift} +${Math.ceil(imp.days / 7)} ${t.cascade.weeks}` });
        }
        cascades.push({ issue, chain });
      });
    });
    return cascades;
  };

  // --- TABS ---
  const tabs = [
    { id: "tower", label: t.tabs.tower, icon: "◉" },
    { id: "issues", label: t.tabs.issues, icon: "⚠", badge: allOpen.filter(i => i.pid === selProject).length },
    { id: "gates", label: t.tabs.gates, icon: "🚪" },
    { id: "impact", label: t.tabs.impact, icon: "⚡", badge: cascadeIssues.filter(i => i.pid === selProject).length },
    { id: "team", label: t.tabs.team, icon: "👥" },
    { id: "review", label: t.tabs.review, icon: "📋", badge: draftIssues.length },
  ];

  return (
    <div style={{ minHeight: "100vh", background: "#060A0F", color: "#E2E8F0", fontFamily: sans, fontSize: 12 }}>
      <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700;800&display=swap" rel="stylesheet" />

      {/* ═══ HEADER ═══ */}
      <div style={{ background: "#080C10", borderBottom: "1px solid #1E2A3A", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 48, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 6, background: "linear-gradient(135deg, #1D4ED8, #7C3AED)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 900, color: "#fff" }}>R</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>{t.appName}</div>
            <div style={{ fontSize: 8, color: "#475569", letterSpacing: "0.1em", textTransform: "uppercase" }}>{t.appSub}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {/* Project selector */}
          <div style={{ display: "flex", gap: 3 }}>
            {projects.map(p => (
              <button key={p.id} onClick={() => { setSelProject(p.id); setSelIssue(null); setFilters({ status: "ALL", sev: "ALL", src: "ALL" }); }}
                style={{ background: selProject === p.id ? "#1E2A3A" : "transparent", border: `1px solid ${selProject === p.id ? "#3B82F6" : "#1E2A3A"}`, borderRadius: 4, padding: "3px 8px", color: selProject === p.id ? "#E2E8F0" : "#64748B", fontSize: 9, fontWeight: 600, cursor: "pointer" }}>
                {p.name.split(" ")[0]}
              </button>
            ))}
          </div>
          {/* Lang toggle */}
          <div style={{ display: "flex", border: "1px solid #1E2A3A", borderRadius: 4, overflow: "hidden" }}>
            {["vi", "en"].map(l => (
              <button key={l} onClick={() => setLang(l)} style={{ background: lang === l ? "#1E2A3A" : "transparent", border: "none", padding: "3px 8px", color: lang === l ? "#E2E8F0" : "#475569", fontSize: 9, fontWeight: 700, cursor: "pointer", textTransform: "uppercase" }}>{l}</button>
            ))}
          </div>
          {/* Notifications */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setShowNotif(!showNotif)} style={{ background: "none", border: "1px solid #1E2A3A", borderRadius: 4, padding: "3px 8px", color: "#94A3B8", cursor: "pointer", fontSize: 12, position: "relative" }}>
              🔔 {unreadCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: "#EF4444", color: "#fff", borderRadius: "50%", width: 14, height: 14, fontSize: 8, fontWeight: 800, display: "flex", alignItems: "center", justifyContent: "center" }}>{unreadCount}</span>}
            </button>
            {showNotif && (
              <div style={{ position: "absolute", top: "100%", right: 0, marginTop: 6, width: 320, background: "#0A0E13", border: "1px solid #1E2A3A", borderRadius: 8, boxShadow: "0 20px 40px #00000080", zIndex: 200, overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid #1E2A3A", fontSize: 11, fontWeight: 700 }}>{t.notifications}</div>
                {notifications.map(n => (
                  <div key={n.id} onClick={() => { setNotifications(prev => prev.map(nn => nn.id === n.id ? { ...nn, read: true } : nn)); }} style={{ padding: "8px 14px", borderBottom: "1px solid #1E2A3A10", cursor: "pointer", background: n.read ? "transparent" : "#1E2A3A20", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ fontSize: 10, marginTop: 2 }}>{n.type === "CRITICAL_ISSUE" ? "🔴" : n.type === "MILESTONE_IMPACT" ? "⚡" : n.type === "OVERDUE_ISSUE" ? "⏰" : "🚪"}</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 10, color: n.read ? "#64748B" : "#E2E8F0", fontWeight: n.read ? 400 : 600 }}>{lang === "vi" ? n.titleVi : n.title}</div>
                      <div style={{ fontSize: 9, color: "#475569", marginTop: 2 }}>{lang === "vi" ? n.timeVi : n.time}</div>
                    </div>
                    {!n.read && <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#3B82F6", marginTop: 4, flexShrink: 0 }} />}
                  </div>
                ))}
              </div>
            )}
          </div>
          {/* User */}
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#1E2A3A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, color: "#94A3B8" }}>{currentUser.name[0]}</div>
            <div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#CBD5E1", lineHeight: 1.1 }}>{currentUser.name}</div>
              <div style={{ fontSize: 8, color: "#475569", textTransform: "uppercase" }}>{t.role[currentUser.role]}</div>
            </div>
          </div>
          <div style={{ fontFamily: mono, fontSize: 10, color: "#334155" }}>{time.toLocaleTimeString("vi-VN")}</div>
        </div>
      </div>

      {/* ═══ NAV TABS ═══ */}
      <div style={{ background: "#080C10", borderBottom: "1px solid #1E2A3A", padding: "0 20px", display: "flex", gap: 0 }}>
        {tabs.map(tb => (
          <button key={tb.id} onClick={() => { setTab(tb.id); setSelIssue(null); }}
            style={{ background: "none", border: "none", borderBottom: tab === tb.id ? "2px solid #3B82F6" : "2px solid transparent", padding: "9px 14px", color: tab === tb.id ? "#E2E8F0" : "#64748B", fontSize: 10, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontFamily: sans }}>
            <span style={{ fontSize: 12 }}>{tb.icon}</span>
            {tb.label}
            {tb.badge > 0 && <span style={{ background: "#EF4444", color: "#fff", borderRadius: 8, padding: "0 5px", fontSize: 8, fontWeight: 800, minWidth: 14, textAlign: "center" }}>{tb.badge}</span>}
          </button>
        ))}
      </div>

      {/* ═══ CONTENT ═══ */}
      <div style={{ padding: "16px 20px", maxWidth: 1400, margin: "0 auto" }} onClick={() => showNotif && setShowNotif(false)}>

        {/* ═══ CONTROL TOWER ═══ */}
        {tab === "tower" && project && (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {/* Global Metrics */}
            <div style={{ display: "flex", gap: 8 }}>
              <Metric label={t.metrics.activeProjects} value={projects.length} color="#3B82F6" icon="📋" />
              <Metric label={t.metrics.openIssues} value={allOpen.length} color="#EF4444" icon="🔴" />
              <Metric label={t.metrics.critical} value={allCrit.length} color={allCrit.length > 0 ? "#EF4444" : "#10B981"} icon="⚡" />
              <Metric label={t.metrics.blocked} value={allBlocked.length} color={allBlocked.length > 0 ? "#DC2626" : "#10B981"} icon="🚫" />
              <Metric label={t.metrics.closureRate} value={`${Math.round(issues.filter(i => i.status === "CLOSED").length / issues.length * 100)}%`} color="#10B981" icon="✓" />
              <Metric label={t.metrics.cascadeAlerts} value={cascadeIssues.length} color={cascadeIssues.length > 0 ? "#F59E0B" : "#10B981"} icon="⚡" />
            </div>

            {/* Project Cards */}
            {projects.map(proj => {
              const pIssues = issues.filter(i => i.pid === proj.id);
              const pOpen = pIssues.filter(i => i.status !== "CLOSED");
              const pCrit = pOpen.filter(i => i.sev === "CRITICAL");
              const gp = getGateProgress(proj, proj.phase);
              const phaseIdx = PHASES.indexOf(proj.phase);
              return (
                <Section key={proj.id} title={null}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                        <span style={{ fontSize: 10, color: "#3B82F6", fontFamily: mono, fontWeight: 700 }}>{proj.id}</span>
                        <Badge label={proj.phase} color={PHASE_COLORS[proj.phase]} size="md" glow />
                      </div>
                      <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>{proj.name}</div>
                      <div style={{ fontSize: 10, color: "#64748B", marginTop: 1 }}>{lang === "vi" ? proj.descVi : proj.desc}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 8, color: "#475569", textTransform: "uppercase" }}>{t.phaseOwner}</div>
                      <div style={{ fontSize: 12, color: "#CBD5E1", fontWeight: 700 }}>{proj.phaseOwner}</div>
                      <div style={{ fontSize: 8, color: "#475569", marginTop: 4 }}>{t.targetMP}: {proj.targetMP}</div>
                    </div>
                  </div>
                  {/* Phase Timeline */}
                  <div style={{ display: "flex", alignItems: "center", gap: 0, width: "100%", marginBottom: 14 }}>
                    {PHASES.map((ph, i) => {
                      const active = i === phaseIdx;
                      const done = i < phaseIdx;
                      const c = PHASE_COLORS[ph];
                      const ms = proj.milestones[ph];
                      const shifted = ms.adjusted && ms.adjusted !== ms.target;
                      return (
                        <div key={ph} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", position: "relative" }}>
                          {i > 0 && <div style={{ position: "absolute", top: 11, right: "50%", width: "100%", height: 2, background: done ? c : "#1E2A3A", zIndex: 0 }} />}
                          <div style={{ width: active ? 24 : 18, height: active ? 24 : 18, borderRadius: "50%", background: done ? c : active ? c : "#0F1419", border: `2px solid ${done || active ? c : "#1E2A3A"}`, display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1, boxShadow: active ? `0 0 12px ${c}40` : "none" }}>
                            {done && <span style={{ color: "#000", fontSize: 10, fontWeight: 900 }}>✓</span>}
                            {active && <span style={{ color: "#000", fontSize: 8, fontWeight: 900 }}>●</span>}
                          </div>
                          <div style={{ marginTop: 4, fontSize: 9, fontWeight: active ? 800 : 600, color: active ? c : done ? "#94A3B8" : "#475569" }}>{ph}</div>
                          <div style={{ fontSize: 8, color: shifted ? "#F59E0B" : "#475569", marginTop: 1, fontFamily: mono }}>
                            {ms.status === "COMPLETED" ? `✓ ${ms.actual}` : shifted ? `⚠ ${ms.adjusted}` : ms.target}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {/* Mini Metrics */}
                  <div style={{ display: "flex", gap: 8 }}>
                    <Metric label={t.metrics.openIssues} value={pOpen.length} color={pOpen.length > 0 ? "#EF4444" : "#10B981"} icon="🔴" />
                    <Metric label={t.metrics.critical} value={pCrit.length} color={pCrit.length > 0 ? "#EF4444" : "#10B981"} icon="⚡" />
                    <Metric label={t.gateProgress} value={`${gp.pct}%`} color={gp.canPass ? "#10B981" : "#3B82F6"} icon="🚪" sub={`${gp.passed}/${gp.total} ${t.gate.passed}`} />
                    <Metric label={t.metrics.cascadeAlerts} value={getCascade(proj).length} color={getCascade(proj).length > 0 ? "#F59E0B" : "#10B981"} icon="⚡" />
                  </div>
                </Section>
              );
            })}

            {/* Cascade Alerts Panel */}
            {getCascade(projects.find(p => p.id === selProject)).length > 0 && (
              <Section title={`⚡ ${t.cascade.title}`}>
                {getCascade(projects.find(p => p.id === selProject)).map((c, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 0", borderBottom: idx < getCascade(projects.find(p => p.id === selProject)).length - 1 ? "1px solid #1E2A3A" : "none", flexWrap: "wrap" }}>
                    <Badge label={c.issue.id} color="#3B82F6" />
                    <Badge label={t.severity[c.issue.sev]} color={SEV_COLORS[c.issue.sev]} />
                    <span style={{ fontSize: 10, color: "#94A3B8", flex: "0 0 auto" }}>{c.issue.title.slice(0, 35)}…</span>
                    <span style={{ color: "#475569", fontSize: 14 }}>→</span>
                    {c.chain.map((step, si) => (
                      <span key={si} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                        <span style={{ background: `${PHASE_COLORS[step.phase]}15`, border: `1px solid ${PHASE_COLORS[step.phase]}25`, borderRadius: 3, padding: "2px 6px", fontSize: 9, color: PHASE_COLORS[step.phase], fontWeight: 700 }}>
                          {step.phase} +{Math.ceil(step.days / 7)}w
                        </span>
                        {si < c.chain.length - 1 && <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 12 }}>→</span>}
                      </span>
                    ))}
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}

        {/* ═══ ISSUES ═══ */}
        {tab === "issues" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {/* Filters */}
            <div style={{ display: "flex", gap: 10, alignItems: "center", background: "#080C10", padding: "8px 12px", borderRadius: 6, border: "1px solid #1E2A3A", flexWrap: "wrap" }}>
              {[{ key: "status", opts: ["ALL", ...STATUS_LIST], colors: { ALL: "#64748B", ...STATUS_COLORS }, labels: t.status },
                { key: "sev", opts: ["ALL", ...SEV_LIST], colors: { ALL: "#64748B", ...SEV_COLORS }, labels: t.severity },
                { key: "src", opts: ["ALL", ...SRC_LIST], colors: { ALL: "#64748B", ...SRC_COLORS }, labels: t.source },
              ].map(f => (
                <div key={f.key} style={{ display: "flex", gap: 2 }}>
                  {f.opts.map(o => (
                    <button key={o} onClick={() => setFilters(prev => ({ ...prev, [f.key]: o }))}
                      style={{ background: filters[f.key] === o ? "#1E2A3A" : "transparent", border: `1px solid ${filters[f.key] === o ? f.colors[o] || "#3B82F6" : "transparent"}`, borderRadius: 3, padding: "2px 7px", color: filters[f.key] === o ? "#E2E8F0" : "#475569", fontSize: 8, fontWeight: 600, cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {o === "ALL" ? t.issue.all : (f.labels[o] || o.replace("_", " "))}
                    </button>
                  ))}
                </div>
              ))}
              <div style={{ marginLeft: "auto", display: "flex", gap: 6, alignItems: "center" }}>
                <span style={{ fontSize: 9, color: "#475569" }}>{filteredIssues.length} issues</span>
                <Btn variant="primary" small onClick={() => setShowCreate(!showCreate)}>{t.issue.create}</Btn>
              </div>
            </div>

            {/* Create Form (simple inline) */}
            {showCreate && (
              <Section title={t.issue.create}>
                <CreateIssueForm t={t} lang={lang} selProject={selProject} onClose={() => setShowCreate(false)}
                  onCreate={(newIssue) => { setIssues(prev => [newIssue, ...prev]); setShowCreate(false); }} />
              </Section>
            )}

            {/* Table */}
            <div style={{ border: "1px solid #1E2A3A", borderRadius: 6, overflow: "hidden", background: "#080C10" }}>
              <div style={{ display: "grid", gridTemplateColumns: "64px 1fr 82px 72px 76px 80px 56px", gap: 6, padding: "7px 12px", background: "#0A0E13", borderBottom: "1px solid #1E2A3A" }}>
                {[t.issue.id, t.issue.title + " / " + t.issue.rootCause, t.issue.status, t.issue.severity, t.issue.source, t.issue.owner, t.issue.phase].map(h => (
                  <span key={h} style={{ fontSize: 8, color: "#475569", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em" }}>{h}</span>
                ))}
              </div>
              {filteredIssues.map(issue => (
                <div key={issue.id} onClick={() => setSelIssue(selIssue?.id === issue.id ? null : issue)}
                  style={{ display: "grid", gridTemplateColumns: "64px 1fr 82px 72px 76px 80px 56px", gap: 6, padding: "8px 12px", borderBottom: "1px solid #1E2A3A10", cursor: "pointer", background: selIssue?.id === issue.id ? "#1E2A3A" : "transparent", alignItems: "center", transition: "background 0.1s" }}
                  onMouseEnter={e => { if (selIssue?.id !== issue.id) e.currentTarget.style.background = "#0F1419" }}
                  onMouseLeave={e => { if (selIssue?.id !== issue.id) e.currentTarget.style.background = "transparent" }}>
                  <span style={{ fontSize: 9, color: "#3B82F6", fontFamily: mono, fontWeight: 600 }}>{issue.id}</span>
                  <div>
                    <div style={{ fontSize: 11, color: "#E2E8F0", fontWeight: 600, lineHeight: 1.2 }}>{lang === "vi" ? issue.titleVi : issue.title}</div>
                    <div style={{ fontSize: 9, color: "#475569", marginTop: 1 }}>{issue.rootCause}</div>
                  </div>
                  <Badge label={t.status[issue.status]} color={STATUS_COLORS[issue.status]} />
                  <Badge label={t.severity[issue.sev]} color={SEV_COLORS[issue.sev]} />
                  <Badge label={t.source[issue.src]} color={SRC_COLORS[issue.src]} />
                  <span style={{ fontSize: 10, color: "#94A3B8" }}>{issue.owner}</span>
                  <span style={{ fontSize: 9, color: "#475569", fontFamily: mono }}>{issue.phase}</span>
                </div>
              ))}
              {filteredIssues.length === 0 && <div style={{ padding: 30, textAlign: "center", color: "#475569", fontSize: 11 }}>{t.issue.noIssues}</div>}
            </div>

            {/* Issue Detail */}
            {selIssue && (
              <Section title={null}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 11, color: "#3B82F6", fontFamily: mono, fontWeight: 700 }}>{selIssue.id}</span>
                      <Badge label={t.status[selIssue.status]} color={STATUS_COLORS[selIssue.status]} size="md" />
                      <Badge label={t.severity[selIssue.sev]} color={SEV_COLORS[selIssue.sev]} size="md" />
                      <Badge label={t.source[selIssue.src]} color={SRC_COLORS[selIssue.src]} size="md" />
                    </div>
                    <div style={{ fontSize: 15, fontWeight: 700 }}>{lang === "vi" ? selIssue.titleVi : selIssue.title}</div>
                  </div>
                  <div style={{ display: "flex", gap: 4 }}>
                    {selIssue.status === "DRAFT" && <Btn variant="success" small onClick={() => updateIssueStatus(selIssue.id, "OPEN")}>{t.review.approve}</Btn>}
                    {selIssue.status === "OPEN" && <Btn variant="primary" small onClick={() => updateIssueStatus(selIssue.id, "IN_PROGRESS")}>Start</Btn>}
                    {selIssue.status !== "CLOSED" && <Btn variant="success" small onClick={() => updateIssueStatus(selIssue.id, "CLOSED")}>{t.close}</Btn>}
                    <Btn small onClick={() => setSelIssue(null)}>✕</Btn>
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 8, marginBottom: 14 }}>
                  {[[t.issue.owner, selIssue.owner], [t.issue.phase, selIssue.phase], [t.issue.dueDate, selIssue.due], ["Created", selIssue.created]].map(([k, v]) => (
                    <div key={k} style={{ background: "#0F1419", borderRadius: 4, padding: "6px 10px" }}>
                      <div style={{ fontSize: 8, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em" }}>{k}</div>
                      <div style={{ fontSize: 11, color: "#CBD5E1", fontWeight: 600, marginTop: 1 }}>{v}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 700 }}>{t.issue.rootCause}</div>
                  <div style={{ fontSize: 11, color: "#CBD5E1", background: "#0F1419", borderRadius: 4, padding: "6px 10px", borderLeft: "3px solid #F59E0B" }}>{selIssue.rootCause}</div>
                </div>
                {selIssue.impacts.length > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ fontSize: 9, color: "#EF4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4, fontWeight: 700 }}>⚡ {t.issue.impactMap}</div>
                    {selIssue.impacts.map((imp, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, padding: "5px 10px", marginBottom: 3, background: "#EF444410", borderRadius: 4, borderLeft: "3px solid #EF4444" }}>
                        <Badge label={imp.phase} color={PHASE_COLORS[imp.phase]} />
                        <span style={{ fontSize: 10, color: "#FCA5A5" }}>{lang === "vi" ? imp.descVi : imp.desc}</span>
                        <span style={{ fontSize: 9, color: "#F59E0B", fontFamily: mono, marginLeft: "auto" }}>+{Math.ceil(imp.days / 7)}w</span>
                      </div>
                    ))}
                  </div>
                )}
                <div>
                  <div style={{ fontSize: 9, color: "#475569", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6, fontWeight: 700 }}>{t.issue.activityLog}</div>
                  <div style={{ borderLeft: "2px solid #1E2A3A", paddingLeft: 14, display: "flex", flexDirection: "column", gap: 8 }}>
                    {selIssue.updates.map((u, i) => (
                      <div key={i} style={{ position: "relative" }}>
                        <div style={{ position: "absolute", left: -19, top: 3, width: 8, height: 8, borderRadius: "50%", background: i === selIssue.updates.length - 1 ? "#3B82F6" : "#1E2A3A", border: "2px solid #080C10" }} />
                        <div style={{ display: "flex", gap: 6, marginBottom: 1 }}>
                          <span style={{ fontSize: 9, color: "#3B82F6", fontFamily: mono }}>{u.date}</span>
                          <span style={{ fontSize: 9, color: "#94A3B8", fontWeight: 600 }}>{u.author}</span>
                        </div>
                        <div style={{ fontSize: 10, color: "#CBD5E1", lineHeight: 1.3 }}>{u.text}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ═══ GATES ═══ */}
        {tab === "gates" && project && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{project.name} — {t.gate.conditions}</div>

            {PHASES.filter(ph => ph !== "CONCEPT" || project.phase === "CONCEPT").map(phase => {
              const config = GATE_CONFIG[phase];
              if (!config) return null;
              const checks = project.gateChecks[phase] || {};
              const gp = getGateProgress(project, phase);
              const isDVT = phase === "DVT";
              const categories = isDVT ? Object.keys(DVT_CATEGORIES) : null;
              const phaseIdx = PHASES.indexOf(phase);
              const currentIdx = PHASES.indexOf(project.phase);
              const isCurrent = phaseIdx === currentIdx;
              const isPast = phaseIdx < currentIdx;

              return (
                <Section key={phase} title={
                  <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
                    <span style={{ color: PHASE_COLORS[phase], fontWeight: 800 }}>{phase}</span>
                    <span style={{ fontSize: 9, color: "#64748B" }}>{gp.passed}/{gp.total} {t.gate.passed}</span>
                    <div style={{ flex: 1, height: 4, background: "#1E2A3A", borderRadius: 2, marginLeft: 8 }}>
                      <div style={{ width: `${gp.pct}%`, height: "100%", background: gp.canPass ? "#10B981" : PHASE_COLORS[phase], borderRadius: 2, transition: "width 0.3s" }} />
                    </div>
                    <Badge label={isPast ? "PASSED" : gp.canPass ? t.gate.ready : t.gate.blocked} color={isPast ? "#10B981" : gp.canPass ? "#10B981" : "#EF4444"} glow={isCurrent} />
                  </div>
                } actions={isCurrent && gp.canPass ? <Btn variant="success" small>{t.gate.transition} →</Btn> : null}>
                  {isDVT ? (
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {/* Prerequisite */}
                      <div style={{ gridColumn: "1 / -1" }}>
                        {config.conditions.filter(c => c.cat === "prerequisite").map(cond => (
                          <GateItem key={cond.id} cond={cond} lang={lang} t={t} checked={checks[cond.id]} onClick={() => !isPast && toggleGate(phase, cond.id)} disabled={isPast} />
                        ))}
                      </div>
                      {/* 4 Test Categories */}
                      {Object.entries(DVT_CATEGORIES).map(([catKey, cat]) => {
                        const catConds = config.conditions.filter(c => c.cat === catKey);
                        const catPassed = catConds.filter(c => checks[c.id]).length;
                        return (
                          <div key={catKey} style={{ background: "#0A0E13", borderRadius: 6, border: "1px solid #1E2A3A", padding: 10 }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                              <span style={{ fontSize: 14 }}>{cat.icon}</span>
                              <span style={{ fontSize: 10, fontWeight: 700, color: cat.color }}>{lang === "vi" ? cat.label_vi : cat.label}</span>
                              <span style={{ fontSize: 9, color: "#64748B", marginLeft: "auto" }}>{catPassed}/{catConds.length}</span>
                            </div>
                            {catConds.map(cond => (
                              <GateItem key={cond.id} cond={cond} lang={lang} t={t} checked={checks[cond.id]} onClick={() => !isPast && toggleGate(phase, cond.id)} disabled={isPast} />
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                      {config.conditions.map(cond => (
                        <GateItem key={cond.id} cond={cond} lang={lang} t={t} checked={checks[cond.id]} onClick={() => !isPast && toggleGate(phase, cond.id)} disabled={isPast} />
                      ))}
                    </div>
                  )}
                </Section>
              );
            })}
          </div>
        )}

        {/* ═══ IMPACT MAP ═══ */}
        {tab === "impact" && project && (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 2 }}>{t.cascade.ripple} — {project.name}</div>

            {issues.filter(i => i.pid === selProject && i.status !== "CLOSED" && i.impacts.length > 0).map(issue => (
              <div key={issue.id} style={{ background: "#080C10", border: "1px solid #1E2A3A", borderRadius: 8, padding: 14, borderLeft: `4px solid ${SEV_COLORS[issue.sev]}` }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
                  <Badge label={issue.id} color="#3B82F6" />
                  <span style={{ fontSize: 12, color: "#E2E8F0", fontWeight: 700 }}>{lang === "vi" ? issue.titleVi : issue.title}</span>
                  <Badge label={t.severity[issue.sev]} color={SEV_COLORS[issue.sev]} />
                  <Badge label={t.status[issue.status]} color={STATUS_COLORS[issue.status]} />
                  <span style={{ fontSize: 9, color: "#64748B", marginLeft: "auto" }}>{t.issue.owner}: {issue.owner}</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  <div style={{ background: "#0F1419", borderRadius: 4, padding: "5px 8px", fontSize: 9, color: "#94A3B8", border: "1px solid #1E2A3A", maxWidth: 200 }}>
                    📍 {issue.rootCause}
                  </div>
                  <span style={{ color: "#475569", fontSize: 14 }}>→</span>
                  {issue.impacts.map((imp, idx) => {
                    const phaseIdx = PHASES.indexOf(imp.phase);
                    const downstream = PHASES.slice(phaseIdx + 1);
                    return (
                      <div key={idx} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <div style={{ background: `${PHASE_COLORS[imp.phase]}12`, border: `1px solid ${PHASE_COLORS[imp.phase]}25`, borderRadius: 4, padding: "5px 8px" }}>
                          <div style={{ fontSize: 8, color: PHASE_COLORS[imp.phase], fontWeight: 700 }}>{imp.phase}</div>
                          <div style={{ fontSize: 9, color: "#CBD5E1" }}>{lang === "vi" ? imp.descVi : imp.desc}</div>
                        </div>
                        {downstream.map(ds => (
                          <span key={ds} style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                            <span style={{ color: "#EF4444", fontWeight: 700, fontSize: 11 }}>→</span>
                            <span style={{ background: `${PHASE_COLORS[ds]}10`, border: `1px solid ${PHASE_COLORS[ds]}20`, borderRadius: 3, padding: "2px 6px", fontSize: 8, color: PHASE_COLORS[ds], fontWeight: 600 }}>
                              {ds} {t.cascade.autoShift}
                            </span>
                          </span>
                        ))}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Milestone Risk Summary */}
            <Section title={t.milestoneRisk}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 10 }}>
                {PHASES.map(phase => {
                  const count = issues.filter(i => i.pid === selProject && i.status !== "CLOSED" && i.impacts.some(imp => imp.phase === phase)).length;
                  return (
                    <div key={phase} style={{ background: "#0A0E13", borderRadius: 6, padding: 12, border: `1px solid ${count > 0 ? PHASE_COLORS[phase] + "40" : "#1E2A3A"}`, textAlign: "center" }}>
                      <div style={{ fontSize: 9, color: PHASE_COLORS[phase], fontWeight: 700, marginBottom: 3 }}>{phase}</div>
                      <div style={{ fontSize: 24, fontWeight: 900, color: count > 0 ? "#EF4444" : "#10B981", fontFamily: mono }}>{count}</div>
                      <div style={{ fontSize: 8, color: "#475569" }}>{t.blockingIssues}</div>
                    </div>
                  );
                })}
              </div>
            </Section>
          </div>
        )}

        {/* ═══ TEAM ═══ */}
        {tab === "team" && (
          <Section title={`👥 ${t.team.workload}`}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 10 }}>
              {TEAM.map(m => {
                const memberIssues = issues.filter(i => i.owner === m.name && i.status !== "CLOSED");
                const crit = memberIssues.filter(i => i.sev === "CRITICAL").length;
                const blocked = memberIssues.filter(i => i.status === "BLOCKED").length;
                return (
                  <div key={m.name} style={{ background: "#0A0E13", borderRadius: 6, padding: "12px 14px", border: `1px solid ${crit > 0 ? "#EF444430" : "#1E2A3A"}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#1E2A3A", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#94A3B8" }}>{m.name.split(" ").pop()[0]}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: "#E2E8F0" }}>{m.name}</div>
                        <div style={{ fontSize: 9, color: "#64748B" }}>{t.role[m.role]} • {m.projects.join(", ")}</div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      {crit > 0 && <Badge label={`${crit} CRIT`} color="#EF4444" />}
                      {blocked > 0 && <Badge label={`${blocked} BLOCK`} color="#DC2626" />}
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: 20, fontWeight: 800, color: memberIssues.length > 0 ? "#F59E0B" : "#10B981", fontFamily: mono }}>{memberIssues.length}</div>
                        <div style={{ fontSize: 7, color: "#475569", textTransform: "uppercase" }}>{t.team.openTasks}</div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>
        )}

        {/* ═══ REVIEW QUEUE ═══ */}
        {tab === "review" && (
          <Section title={`📋 ${t.review.queue} — ${project?.name}`}>
            {draftIssues.length === 0 ? (
              <div style={{ padding: 30, textAlign: "center", color: "#10B981", fontSize: 12 }}>✓ {t.review.noPending}</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {draftIssues.map(issue => (
                  <div key={issue.id} style={{ background: "#0A0E13", border: "1px solid #1E2A3A", borderRadius: 6, padding: 12, borderLeft: "4px solid #6B7280" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                          <Badge label={issue.id} color="#3B82F6" />
                          <Badge label={t.status.DRAFT} color={STATUS_COLORS.DRAFT} />
                          <Badge label={t.severity[issue.sev]} color={SEV_COLORS[issue.sev]} />
                        </div>
                        <div style={{ fontSize: 13, fontWeight: 700, color: "#E2E8F0", marginBottom: 2 }}>{lang === "vi" ? issue.titleVi : issue.title}</div>
                        <div style={{ fontSize: 10, color: "#64748B" }}>{t.issue.rootCause}: {issue.rootCause}</div>
                        <div style={{ fontSize: 9, color: "#475569", marginTop: 4 }}>{t.issue.owner}: {issue.owner} • Created: {issue.created}</div>
                      </div>
                      <div style={{ display: "flex", gap: 4 }}>
                        <Btn variant="success" small onClick={() => updateIssueStatus(issue.id, "OPEN")}>{t.review.approve}</Btn>
                        <Btn variant="danger" small onClick={() => updateIssueStatus(issue.id, "DRAFT")}>{t.review.reject}</Btn>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Section>
        )}
      </div>

      {/* ═══ FOOTER ═══ */}
      <div style={{ borderTop: "1px solid #1E2A3A", padding: "6px 20px", display: "flex", justifyContent: "space-between", fontSize: 8, color: "#1E2A3A", background: "#060A0F", marginTop: 20 }}>
        <span>RtR Control Tower V1 • Vibecode Kit v5.0 • Real-time Robotics © 2026</span>
        <span>Built for: 50+ users • 4 roles • Bilingual Vi-En • 5-phase lifecycle</span>
      </div>
    </div>
  );
}

// ═══ Gate Item Component ═══
function GateItem({ cond, lang, t, checked, onClick, disabled }) {
  return (
    <div onClick={disabled ? undefined : onClick}
      style={{ display: "flex", alignItems: "center", gap: 8, padding: "5px 8px", borderRadius: 4, background: checked ? "#10B98108" : "#1E2A3A08", cursor: disabled ? "default" : "pointer", border: `1px solid ${checked ? "#10B98120" : "transparent"}`, marginBottom: 3 }}>
      <div style={{ width: 15, height: 15, borderRadius: 3, border: `2px solid ${checked ? "#10B981" : "#475569"}`, background: checked ? "#10B981" : "transparent", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, color: "#000", fontWeight: 900, flexShrink: 0 }}>
        {checked && "✓"}
      </div>
      <span style={{ fontSize: 10, color: checked ? "#64748B" : "#CBD5E1", textDecoration: checked ? "line-through" : "none", flex: 1 }}>
        {lang === "vi" ? cond.label_vi : cond.label}
      </span>
      {cond.required && <span style={{ fontSize: 7, color: "#EF4444", fontWeight: 700, letterSpacing: "0.05em" }}>{t.gate.required}</span>}
    </div>
  );
}

// ═══ Create Issue Form ═══
function CreateIssueForm({ t, lang, selProject, onClose, onCreate }) {
  const [form, setForm] = useState({ title: "", titleVi: "", desc: "", rootCause: "Investigating", sev: "HIGH", src: "INTERNAL", owner: "", phase: "DVT", due: "" });
  const owners = TEAM.filter(m => m.role === "engineer").map(m => m.name);

  const handleCreate = () => {
    if (!form.title || !form.owner) return;
    const newIssue = {
      id: `ISS-${String(ISSUES_DATA.length + Math.floor(Math.random() * 100) + 1).padStart(3, "0")}`,
      pid: selProject, title: form.title, titleVi: form.titleVi || form.title, desc: form.desc,
      rootCause: form.rootCause, status: "DRAFT", sev: form.sev, src: form.src,
      owner: form.owner, phase: form.phase, created: new Date().toISOString().split("T")[0],
      due: form.due || "", impacts: [], updates: [{ date: new Date().toISOString().split("T")[0], author: form.owner, text: "Issue created" }],
    };
    onCreate(newIssue);
  };

  const inputStyle = { background: "#0F1419", border: "1px solid #1E2A3A", borderRadius: 4, padding: "6px 10px", color: "#E2E8F0", fontSize: 11, width: "100%", outline: "none", fontFamily: "'Outfit', sans-serif" };
  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };

  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.title} (EN) *</label>
        <input style={inputStyle} value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Issue title in English..." />
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.title} (VI)</label>
        <input style={inputStyle} value={form.titleVi} onChange={e => setForm(f => ({ ...f, titleVi: e.target.value }))} placeholder="Tiêu đề tiếng Việt..." />
      </div>
      <div>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.severity} *</label>
        <select style={selectStyle} value={form.sev} onChange={e => setForm(f => ({ ...f, sev: e.target.value }))}>
          {SEV_LIST.map(s => <option key={s} value={s}>{t.severity[s]}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.source} *</label>
        <select style={selectStyle} value={form.src} onChange={e => setForm(f => ({ ...f, src: e.target.value }))}>
          {SRC_LIST.map(s => <option key={s} value={s}>{t.source[s]}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.owner} *</label>
        <select style={selectStyle} value={form.owner} onChange={e => setForm(f => ({ ...f, owner: e.target.value }))}>
          <option value="">Select...</option>
          {owners.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.phase} *</label>
        <select style={selectStyle} value={form.phase} onChange={e => setForm(f => ({ ...f, phase: e.target.value }))}>
          {PHASES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </div>
      <div style={{ gridColumn: "1 / -1" }}>
        <label style={{ fontSize: 9, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", display: "block", marginBottom: 3 }}>{t.issue.rootCause}</label>
        <input style={inputStyle} value={form.rootCause} onChange={e => setForm(f => ({ ...f, rootCause: e.target.value }))} />
      </div>
      <div style={{ gridColumn: "1 / -1", display: "flex", gap: 6, justifyContent: "flex-end" }}>
        <Btn onClick={onClose}>{t.cancel}</Btn>
        <Btn variant="primary" onClick={handleCreate} disabled={!form.title || !form.owner}>{t.issue.create} (DRAFT)</Btn>
      </div>
    </div>
  );
}
