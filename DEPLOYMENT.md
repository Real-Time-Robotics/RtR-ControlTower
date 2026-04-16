# Huong dan Deploy - RtR Control Tower

## 1. Tong quan

RtR Control Tower la bang dieu khien quan ly du an drone, xay dung tren nen tang React 19 SPA ket hop voi Supabase backend.

### Tinh nang chinh

- **Dashboard tong quan** — theo doi tien do du an, chi so KPI
- **Quan ly Issues** — tao, phan cong, theo doi van de phat sinh
- **Quality Gates** — kiem soat chat luong qua cac cong kiem tra
- **BOM (Bill of Materials)** — quan ly danh muc vat tu, linh kien
- **Quan ly Team** — phan quyen thanh vien, vai tro trong du an
- **Audit Log** — nhat ky hoat dong, truy vet moi thay doi
- **Real-time updates** — cap nhat tuc thoi qua Supabase Realtime
- **Xuat bao cao** — ho tro xuat PDF va Excel
- **Giao dien** — ho tro Dark / Light theme
- **Ngon ngu** — Tieng Viet (VI) va Tieng Anh (EN)

### Kien truc

```
Browser (React 19 + Vite 7 SPA)
        |
        v
Supabase (PostgreSQL + Auth + Realtime + Edge Functions)
```

---

## 2. Yeu cau he thong

| Thanh phan       | Phien ban toi thieu |
|------------------|---------------------|
| Node.js          | 20.x tro len        |
| npm              | 10.x tro len        |
| Supabase project | Free tier tro len   |

Kiem tra phien ban:

```bash
node --version   # v20.x.x tro len
npm --version    # 10.x.x tro len
```

---

## 3. Cai dat tung buoc

> **LUU Y QUAN TRONG:** Toan bo source code nam trong thu muc `rtr-app/`, KHONG phai thu muc goc cua repository.

### Buoc 1: Clone repository

```bash
git clone <repository-url> RtR-ControlTower
cd RtR-ControlTower
```

### Buoc 2: Cai dat dependencies

```bash
cd rtr-app
npm install
```

### Buoc 3: Cau hinh bien moi truong

```bash
cp .env.example .env
# Chinh sua file .env theo huong dan o muc 4
```

### Buoc 4: Chay thu o moi truong dev

```bash
npm run dev
```

Truy cap `http://localhost:5173` de kiem tra.

### Buoc 5: Build production

```bash
npm run build
```

Ket qua build nam trong `rtr-app/dist/`.

---

## 4. Bien moi truong

Tao file `.env` trong thu muc `rtr-app/` voi noi dung:

```env
# [BAT BUOC] URL cua Supabase project
VITE_SUPABASE_URL=https://your-project-id.supabase.co

# [BAT BUOC] Anon Key cua Supabase project
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# [TUY CHON] URL cua ung dung khi deploy (dung cho redirect sau login)
VITE_APP_URL=https://your-domain.com
```

| Bien                      | Bat buoc | Mo ta                                      |
|---------------------------|----------|--------------------------------------------|
| `VITE_SUPABASE_URL`       | Co       | URL cua Supabase project                   |
| `VITE_SUPABASE_ANON_KEY`  | Co       | Public anon key cua Supabase               |
| `VITE_APP_URL`            | Khong    | Domain production, dung cho email redirect  |

> **Bao mat:** KHONG commit file `.env` len git. Dam bao `.env` da co trong `.gitignore`.

---

## 5. Huong dan tao Supabase Project

### 5.1. Tao project moi

1. Truy cap [https://supabase.com](https://supabase.com) va dang nhap
2. Click **New Project**
3. Dien thong tin:
   - **Name:** `rtr-control-tower` (hoac ten tuy chon)
   - **Database Password:** dat mat khau manh, luu lai can than
   - **Region:** chon **Southeast Asia (Singapore)** de co do tre thap nhat
4. Click **Create new project**, doi 1-2 phut de khoi tao

### 5.2. Lay URL va Anon Key

1. Vao **Settings** (bieu tuong banh rang) → **API**
2. Sao chep:
   - **Project URL** → dien vao `VITE_SUPABASE_URL`
   - **anon / public key** → dien vao `VITE_SUPABASE_ANON_KEY`

### 5.3. Cai dat Supabase CLI va lien ket project

```bash
# Cai dat Supabase CLI (neu chua co)
npm install -g supabase

# Dang nhap
supabase login

# Lien ket voi project (chay tu thu muc goc repository)
supabase link --project-ref your-project-id
```

### 5.4. Push database migrations

```bash
# Tu thu muc goc repository
supabase db push
```

Lenh nay se tao toan bo bang, policies, va triggers can thiet trong database.

### 5.5. Deploy Edge Functions

```bash
supabase functions deploy send-email
supabase functions deploy send-digest
```

### 5.6. Cau hinh secrets cho Edge Functions

```bash
# API key cua Resend (dich vu gui email)
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx

# URL ung dung production (dung trong noi dung email)
supabase secrets set APP_URL=https://your-domain.com
```

### 5.7. Cau hinh Auth Redirect URLs

1. Vao **Authentication** → **URL Configuration**
2. Tai muc **Redirect URLs**, them:
   - `https://your-domain.com/**`
   - `http://localhost:5173/**` (cho moi truong dev)
3. Click **Save**

---

## 6. Build va chay Production

### 6.1. Build

```bash
cd rtr-app
npm run build
```

Thu muc output: `rtr-app/dist/`

### 6.2. Chay voi static server (cach nhanh)

```bash
# Cai dat serve (neu chua co)
npm install -g serve

# Chay tren port 5001
serve -s rtr-app/dist -l 5001
```

Truy cap: `http://your-server-ip:5001`

### 6.3. Chay voi Nginx (khuyen nghi cho production)

Xem cau hinh Nginx o muc 7.

---

## 7. Cau hinh Nginx

Tao file cau hinh tai `/etc/nginx/sites-available/rtr-control-tower`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /duong-dan-den/RtR-ControlTower/rtr-app/dist;
    index index.html;

    # SPA fallback — tat ca route deu tra ve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets (JS, CSS, images)
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Khong cache index.html (de luon lay phien ban moi)
    location = /index.html {
        expires -1;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml;
    gzip_min_length 1000;
}
```

Kich hoat va khoi dong lai Nginx:

```bash
sudo ln -s /etc/nginx/sites-available/rtr-control-tower /etc/nginx/sites-enabled/
sudo nginx -t          # Kiem tra cu phap
sudo systemctl reload nginx
```

> **HTTPS:** Khuyen nghi su dung Certbot de cai SSL mien phi:
> ```bash
> sudo certbot --nginx -d your-domain.com
> ```

---

## 8. Tai khoan demo (Offline Mode)

Khi khong ket noi Supabase, ung dung ho tro che do offline voi 4 tai khoan co san:

| Email                | Mat khau    | Vai tro    | Quyen han                          |
|----------------------|-------------|------------|------------------------------------|
| admin@demo.local     | admin123    | Admin      | Toan quyen, quan ly he thong       |
| pm@demo.local        | pm123       | PM         | Quan ly du an, phan cong cong viec |
| engineer@demo.local  | engineer123 | Engineer   | Cap nhat tien do, bao cao van de   |
| viewer@demo.local    | viewer123   | Viewer     | Chi xem, khong chinh sua           |

> **Luu y:** Tai khoan demo chi hoat dong trong offline mode. Khi da ket noi Supabase, su dung tai khoan thuc.

---

## 9. Supabase Edge Functions & Email

### Kich hoat email thong bao (4 buoc)

He thong email da co san code, chi can kich hoat:

**Buoc 1: Dang ky Resend (mien phi 3,000 email/thang)**
```
1. Truy cap https://resend.com → Sign up
2. Them domain rtr.vn (hoac dung domain san cua Resend de test)
3. Lay API Key tu Dashboard → API Keys
```

**Buoc 2: Enable extensions trong Supabase Dashboard**
```
Supabase Dashboard → Database → Extensions:
  - Tim "pg_net" → Enable (cho phep goi HTTP tu trigger)
  - Tim "pg_cron" → Enable (cho phep chay scheduled jobs)
```

**Buoc 3: Deploy Edge Functions va set secrets**
```bash
cd rtr-app

# Deploy functions
supabase functions deploy send-email
supabase functions deploy send-digest

# Set secrets
supabase secrets set RESEND_API_KEY=re_xxxxxxxxxxxx
supabase secrets set APP_URL=https://rtr-control.vercel.app
```

**Buoc 4: Chay migration kich hoat trigger**
```bash
supabase db push
# Migration 011_activate_email_dispatch.sql se:
# - Tao trigger tu dong goi send-email khi co notification moi
# - Cau hinh pg_cron: kiem tra issues qua han hang ngay 08:00 ICT
# - Cau hinh pg_cron: gui digest email hang ngay 08:15 ICT
# - Tu dong don dep notifications cu hon 90 ngay
```

### send-email

- **Chuc nang:** Gui email thong bao realtime khi co su kien quan trong
- **Trigger:** Tu dong qua pg_net trigger khi INSERT vao bang notifications
- **Kiem tra:** Tao mot CRITICAL issue → PM/Admin se nhan email trong vai giay
- **Yeu cau:** Secret `RESEND_API_KEY` da duoc cau hinh

### send-digest

- **Chuc nang:** Gui email tong hop hang ngay (gom cac thong bao DIGEST)
- **Trigger:** pg_cron chay tu dong luc 08:15 ICT moi ngay
- **Yeu cau:** Secret `RESEND_API_KEY` va `APP_URL` da duoc cau hinh

### Cac loai email thong bao

| Su kien | Khi nao | Gui cho ai | Mac dinh |
|---------|---------|------------|----------|
| CRITICAL_ISSUE_CREATED | Issue CRITICAL duoc tao | PM + Admin | Realtime |
| FLIGHT_TEST_FAIL | Bay thu FAIL | Tat ca members | Realtime |
| CASCADE_DELAY_DETECTED | Delay cascade >= 2 tuan | PM + Admin | Realtime |
| ISSUE_ASSIGNED | Gan issue cho nguoi moi | Owner moi | Digest |
| PHASE_TRANSITION | Chuyen phase du an | Tat ca members | Digest |
| ISSUE_OVERDUE | Issue qua han | Owner | Digest |
| DRAFT_PENDING_REVIEW | Issue DRAFT cho duyet | PM + Admin | Digest |

> Nguoi dung co the tuy chinh trong Settings → Email Preferences

### Kiem tra Edge Functions

```bash
# Goi thu function
supabase functions invoke send-email --body '{"to":"test@example.com","subject":"Test","html":"<p>Hello</p>"}'

# Xem log
supabase functions logs send-email
supabase functions logs send-digest
```

### Chay Edge Functions o local

```bash
supabase functions serve
```

---

## 10. Cap nhat phien ban moi

```bash
# Lay code moi nhat
cd /duong-dan-den/RtR-ControlTower
git pull origin main

# Cai dat lai dependencies (neu co thay doi)
cd rtr-app
npm install

# Build lai
npm run build

# Neu dung serve: khoi dong lai process
# Neu dung Nginx: khong can lam gi them (da tro vao thu muc dist/)
```

Neu co database migrations moi:

```bash
cd /duong-dan-den/RtR-ControlTower
supabase db push
```

Neu co thay doi Edge Functions:

```bash
supabase functions deploy send-email
supabase functions deploy send-digest
```

---

## 11. Production Checklist

### Truoc khi go-live

- [ ] **Database backup**: Supabase Dashboard → Settings → Database → Enable Point-in-Time Recovery
- [ ] **Email**: Kich hoat theo Section 9 (Resend + pg_net + Edge Functions)
- [ ] **Domain**: Cau hinh custom domain cho Vercel (vd: control.rtr.vn)
- [ ] **SSL**: Tu dong qua Vercel / Nginx
- [ ] **RLS policies**: Kiem tra tat ca tables co RLS enabled (migration 006)
- [ ] **Environment variables**: Dam bao VITE_SUPABASE_URL va VITE_SUPABASE_ANON_KEY duoc set

### Monitoring

- [ ] **Error tracking**: Cai dat Sentry (mien phi 5K events/thang)
  ```bash
  npm install @sentry/react
  ```
  Them vao main.jsx:
  ```javascript
  import * as Sentry from "@sentry/react";
  Sentry.init({ dsn: "https://xxx@sentry.io/xxx" });
  ```
- [ ] **Supabase monitoring**: Dashboard → Reports → xem query performance
- [ ] **Uptime**: Dung BetterUptime hoac UptimeRobot (mien phi) de theo doi

### Performance da toi uu

- Code-splitting: 15 lazy-loaded modules
- Gzip: Main bundle 422KB gzipped
- Error Boundaries: Moi tab co rieng, crash 1 tab khong anh huong tab khac
- Realtime: 7 WebSocket subscriptions cho du lieu quan trong
- Offline fallback: App van hoat dong khi mat mang (read-only)

### Backup strategy

| Muc | Tan suat | Cach thuc |
|-----|----------|-----------|
| Database | Lien tuc | Supabase Point-in-Time Recovery (Pro plan) |
| Database | Hang ngay | Supabase auto backup (Free plan) |
| Code | Moi commit | Git repository |
| .env secrets | Mot lan | Luu rieng ngoai repo (1Password / Vault) |

### Cron Environment Loading

Since `mrp-sync.mjs` uses fail-fast validation via `requireEnv()`,
the cron job must have access to environment variables. Standard
cron does NOT inherit user shell environment.

**Recommended pattern** — load .env explicitly in crontab entry:

    */30 * * * * set -a && . /path/to/.env && node /path/to/sync/mrp-sync.mjs >> /var/log/mrp-sync.log 2>&1

Alternative (if using systemd timer): use `EnvironmentFile=` directive
pointing to your .env file.

**Verification:** first scheduled run after deploy should either succeed
or fail with a clear "Missing required env var: X" message in the log.
Silent failure means cron env is not loaded correctly.

---

## 12. Xu ly su co

### Supabase cold start (request dau tien cham)

- **Trieu chung:** Lan truy cap dau tien sau thoi gian dai mat 5-10 giay
- **Nguyen nhan:** Supabase Free tier tu dong pause sau 7 ngay khong hoat dong
- **Giai phap:**
  - Nang cap len Pro plan, hoac
  - Dat cron job ping API moi 5 phut:
    ```bash
    */5 * * * * curl -s https://your-project-id.supabase.co/rest/v1/ -H "apikey: your-anon-key" > /dev/null
    ```

### Loi CORS

- **Trieu chung:** Console hien `Access-Control-Allow-Origin` error
- **Giai phap:**
  1. Kiem tra `VITE_SUPABASE_URL` dung chua (khong co dau `/` cuoi)
  2. Kiem tra domain da duoc them vao Supabase Dashboard → Settings → API → Allowed Origins
  3. Neu dung Nginx reverse proxy, them header CORS:
     ```nginx
     add_header Access-Control-Allow-Origin *;
     ```

### SPA 404 khi refresh trang

- **Trieu chung:** Refresh trang o bat ky route nao (vd: `/projects/123`) tra ve 404
- **Nguyen nhan:** Web server khong co cau hinh SPA fallback
- **Giai phap:** Dam bao Nginx co `try_files $uri $uri/ /index.html;` (xem muc 7)

### Build that bai

- **Giai phap:**
  ```bash
  # Xoa cache va cai lai
  rm -rf node_modules
  npm install
  npm run build
  ```

### Khong ket noi duoc Supabase

- Kiem tra bien moi truong trong `.env`
- Kiem tra Supabase project chua bi pause (vao Dashboard kiem tra)
- Kiem tra mang / firewall khong chan ket noi den `*.supabase.co`

---

## Lien he ho tro

Neu gap van de khong giai quyet duoc, lien he team phat trien kem theo:

1. Mo ta loi chi tiet
2. Screenshot console log (F12 → Console)
3. Phien ban dang su dung (`git log -1 --format="%H %s"`)
