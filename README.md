# RtR Control Tower

Bảng điều khiển trung tâm cho dự án phát triển drone — theo dõi tiến độ, vấn đề, chất lượng và đội ngũ trong thời gian thực.

## Tổng quan

RtR Control Tower là ứng dụng web quản lý toàn diện vòng đời phát triển sản phẩm drone. Hệ thống tập trung dữ liệu từ nhiều module (issues, gates, BOM, flight tests, suppliers, finance...) vào một giao diện thống nhất, hỗ trợ ra quyết định nhanh cho đội ngũ kỹ thuật và quản lý.

## Công nghệ

| Thành phần | Công nghệ |
|------------|-----------|
| Frontend | React 19, Vite 7 |
| Backend / DB | Supabase (Auth + Realtime + PostgreSQL) |
| Biểu đồ | Recharts 3 |
| Icons | Lucide React |
| Export | jsPDF, html2canvas, SheetJS (xlsx) |

## Tính năng chính

- **Dashboard** — Tổng quan KPI, biểu đồ tiến độ, radar gates
- **Issues** — Quản lý vấn đề với bộ lọc, biểu đồ phân tích
- **Quality Gates** — Theo dõi các cổng chất lượng dự án
- **BOM** — Cây cấu trúc Bill of Materials
- **Team** — Phân quyền (Admin / Engineer / Viewer), quản lý thành viên
- **Audit Log** — Nhật ký hoạt động tự động
- **Real-time** — Cập nhật dữ liệu trực tiếp qua Supabase Realtime
- **Export** — Xuất PDF, Excel, slides tổng hợp
- **Dark / Light mode** — Chuyển đổi giao diện
- **Đa ngôn ngữ** — Tiếng Việt & English

## Cài đặt nhanh

```bash
cd rtr-app
npm ci

# Tạo file .env
cp .env.example .env   # hoặc tạo thủ công
# VITE_SUPABASE_URL=https://xxx.supabase.co
# VITE_SUPABASE_ANON_KEY=eyJ...

npm run dev      # Development: http://localhost:5173
npm run build    # Production build
npm run preview  # Xem bản build
```

## Cấu trúc dự án

```
rtr-app/src/
├── App.jsx                  # Router & layout chính
├── main.jsx                 # Entry point
├── components/              # UI components
│   ├── LoginScreen.jsx
│   ├── BomModule.jsx
│   ├── ExportEngine.jsx
│   ├── FlightTestModule.jsx
│   ├── GateRadar.jsx
│   ├── IssueCharts.jsx
│   └── ...
├── contexts/                # React Context
│   ├── AuthContext.jsx      # Xác thực & phân quyền
│   └── AuditContext.jsx     # Ghi log hoạt động
├── hooks/                   # Custom hooks
│   ├── useProjectData.js
│   ├── useRealtime.js
│   ├── usePermission.js
│   └── ...
├── services/                # Supabase service layer
│   ├── supabaseService.js
│   ├── issueService.js
│   ├── bomService.js
│   └── ...
├── intelligence/            # AI/Risk analysis
├── data/                    # Static data & translations
├── lib/                     # Utilities
└── utils/                   # Helper functions
```

## Tài liệu

- [Hướng dẫn triển khai (DEPLOYMENT.md)](./DEPLOYMENT.md)

## Giấy phép

Private — Không phân phối công khai.
