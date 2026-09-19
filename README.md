# Mini Habit Tracker

Ứng dụng theo dõi thói quen hằng ngày: đăng ký/đăng nhập, tạo habit, check-in mỗi ngày, xem streak (số ngày liên tiếp) và dashboard cá nhân.

## Tech stack

| Lớp | Công nghệ |
|---|---|
| Frontend | React 19 (Vite), React Router |
| Backend | Node.js, Express (REST API) |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT ký bằng `jsonwebtoken`, lưu trong cookie `httpOnly` |
| Deploy | Frontend → Vercel/Netlify · Backend → Render/Railway · DB → Neon |

Chi tiết sơ đồ 3 lớp và các điểm kết nối: xem [ARCHITECTURE.md](./ARCHITECTURE.md).

## Vì sao chọn stack này

> Phần này viết tay bằng lời của tác giả dự án (không paste từ AI) — nêu rõ tại sao chọn React+Express+PostgreSQL thay vì các phương án khác, đã đánh đổi những gì. Vài câu hỏi gợi ý để trả lời:
>
> - Vì sao tách FE/BE thành 2 service riêng thay vì gộp chung như Next.js?
> - Vì sao chọn PostgreSQL thay vì MongoDB cho dữ liệu habit/check-in?
> - Vì sao lưu token trong cookie httpOnly thay vì localStorage?
> - Đánh đổi lớn nhất của lựa chọn này là gì (thời gian setup, độ phức tạp deploy, v.v.)?
>
> *(Xoá đoạn ghi chú này sau khi viết xong.)*

## Cấu trúc thư mục

```
mini-habit-tracker/
├── backend/          # Express REST API
│   ├── prisma/schema.prisma
│   └── src/
│       ├── routes/   # auth.js, habits.js
│       ├── middleware/auth.js
│       └── lib/      # prisma client, tính streak
├── frontend/         # React (Vite) SPA
│   └── src/
│       ├── api/client.js
│       ├── context/AuthContext.jsx
│       └── pages/
├── ARCHITECTURE.md
└── README.md
```

## Chạy local

### 1. Chuẩn bị database

Tạo 1 project Postgres miễn phí trên [Neon](https://neon.tech) (hoặc dùng Postgres local nếu có). Lấy connection string dạng:

```
postgresql://user:password@host/dbname?sslmode=require
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Mở .env, dán DATABASE_URL thật vào, đổi JWT_SECRET thành chuỗi ngẫu nhiên
npm install
npm run prisma:migrate   # tạo bảng User, Habit, CheckIn
npm run dev              # chạy tại http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
cp .env.example .env     # mặc định đã trỏ về http://localhost:4000/api
npm install
npm run dev               # chạy tại http://localhost:5173
```

Mở `http://localhost:5173`, đăng ký tài khoản, tạo habit, bấm check-in.

## API endpoints

| Method | Route | Auth | Mô tả |
|---|---|---|---|
| POST | `/api/auth/register` | – | Tạo tài khoản, trả cookie JWT |
| POST | `/api/auth/login` | – | Đăng nhập, trả cookie JWT |
| POST | `/api/auth/logout` | – | Xoá cookie |
| GET | `/api/auth/me` | ✔ | Lấy thông tin user hiện tại |
| GET | `/api/habits` | ✔ | Danh sách habit + streak |
| POST | `/api/habits` | ✔ | Tạo habit mới |
| PUT | `/api/habits/:id` | ✔ | Sửa habit |
| DELETE | `/api/habits/:id` | ✔ | Xoá habit |
| POST | `/api/habits/:id/checkin` | ✔ | Toggle check-in hôm nay |
| GET | `/api/habits/:id/checkins` | ✔ | Lịch sử check-in |

Có thể test bằng Postman/Thunder Client: gọi `register` hoặc `login` trước để nhận cookie, sau đó các request khác trong cùng client sẽ tự gửi kèm cookie.

## Deploy

### Database — Neon
1. Tạo project tại neon.tech, copy connection string.

### Backend — Render
1. Push code lên GitHub.
2. Tạo **Web Service** mới trên Render, trỏ vào thư mục `backend`.
3. Build command: `npm install && npm run prisma:generate`
   Start command: `npm run prisma:deploy && npm start`
4. Thêm biến môi trường: `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGIN` (URL frontend sau khi deploy), `NODE_ENV=production`.

### Frontend — Vercel
1. Import repo trên Vercel, chọn thư mục gốc là `frontend`.
2. Thêm biến môi trường `VITE_API_URL` = URL backend Render + `/api`.
3. Sau khi deploy, quay lại Render cập nhật `FRONTEND_ORIGIN` = URL Vercel vừa có.

## Quyết định kỹ thuật đáng chú ý

Xem bảng "Quyết định kiến trúc & lý do" trong [ARCHITECTURE.md](./ARCHITECTURE.md).
