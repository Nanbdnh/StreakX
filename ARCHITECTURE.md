# Architecture — Mini Habit Tracker

## Sơ đồ 3 lớp

```
┌─────────────────────────┐        ┌──────────────────────────┐        ┌─────────────────────┐
│        FRONTEND         │        │          BACKEND          │        │      DATABASE       │
│   React (Vite) + SPA    │        │   Express REST API        │        │     PostgreSQL       │
│                          │        │                            │        │                      │
│  - LoginPage/Register    │ HTTPS  │  /api/auth/*  (đăng ký,   │ SQL    │  User                │
│  - DashboardPage         │ ─────▶ │   đăng nhập, đăng xuất)   │ ─────▶ │  Habit               │
│  - AuthContext (state)   │ fetch  │  /api/habits/*            │ Prisma │  CheckIn             │
│  - api/client.js         │ ◀───── │   (CRUD + check-in)       │ ◀───── │                      │
│                          │ cookie │  middleware/auth.js        │        │                      │
│  Deploy: Vercel/Netlify  │        │  Deploy: Render/Railway    │        │  Deploy: Neon        │
└─────────────────────────┘        └──────────────────────────┘        └─────────────────────┘
```

## Chỗ kết nối giữa các lớp

**Frontend ↔ Backend**
- Kênh: `fetch()` tới `VITE_API_URL` (biến môi trường FE), mọi request gửi kèm `credentials: "include"`.
- Vì FE và BE là 2 domain khác nhau khi deploy, backend phải bật CORS với `origin` trỏ đúng domain FE và `credentials: true` (xem `backend/src/index.js`).
- Toàn bộ giao tiếp qua REST JSON, không dùng GraphQL/WebSocket ở bản này.

**Backend ↔ Database**
- Kênh: Prisma Client, kết nối qua `DATABASE_URL` (connection string Postgres).
- Backend không bao giờ để FE truy vấn DB trực tiếp — mọi thao tác đi qua route đã xác thực (`requireAuth`) và đã kiểm tra quyền sở hữu (`loadOwnedHabit`).

**Auth xuyên suốt 3 lớp**
- Đăng nhập/đăng ký ở BE tạo JWT, gắn vào cookie `httpOnly` trả về cho FE.
- FE không đọc/lưu token (không dùng localStorage) — trình duyệt tự đính kèm cookie ở mọi request sau đó.
- Mỗi request vào `/api/habits/*` đi qua middleware `requireAuth`, giải mã JWT để lấy `userId`, dùng `userId` đó lọc dữ liệu ở lớp DB.
- Token sống 7 ngày (`JWT_EXPIRES_IN`). Hết hạn → middleware trả 401 → FE tự điều hướng về `/login` (xử lý trong `AuthContext`/`ProtectedRoute`).

## Quyết định kiến trúc & lý do

| Quyết định | Vì sao |
|---|---|
| Tách FE (Vite) và BE (Express) thành 2 service riêng | Thể hiện rõ ranh giới 3 lớp, mỗi lớp deploy độc lập, đúng yêu cầu đề bài |
| CheckIn là bảng riêng, không nhét mảng ngày vào Habit | Không giới hạn số lần check-in, dễ tính streak/truy vấn theo ngày, ràng buộc `@@unique([habitId, date])` chống check-in trùng ngày |
| JWT lưu trong cookie `httpOnly`, không dùng `localStorage` | Giảm rủi ro XSS đọc trộm token; đánh đổi là phải cấu hình CORS `credentials` + `SameSite` cẩn thận khi FE/BE khác domain |
| Streak tính runtime từ danh sách CheckIn (không lưu sẵn) | Dữ liệu luôn nhất quán, không sợ lệch khi xoá/sửa check-in; chấp nhận đánh đổi tốn CPU hơn một chút cho dataset nhỏ của bài tập này |
| Kiểm tra quyền sở hữu (`userId`) ở mọi route habit | Chặn user A thao tác dữ liệu của user B dù biết `id` |
| Thứ tự habit lưu ở cột `order` (Int), cập nhật qua `POST /habits/reorder` trong 1 transaction | Kéo-thả ở FE chỉ cập nhật UI tạm thời rồi gọi 1 API duy nhất để lưu toàn bộ thứ tự, tránh N request riêng lẻ mỗi lần đổi vị trí |
| Nhắc nhở dùng Notification API của trình duyệt (không phải push thật) | Không cần thêm hạ tầng service worker/VAPID key cho bản MVP; đánh đổi là chỉ nhắc được khi tab đang mở |
| Vercel rewrite proxy `/api/*` sang Render thay vì FE gọi thẳng URL backend | Phát hiện lỗi thực tế: cookie đăng nhập bị trình duyệt chặn ở chế độ riêng tư (incognito/InPrivate) vì FE (`vercel.app`) và BE (`onrender.com`) là 2 domain khác nhau -> cookie bị coi là "bên thứ ba". Proxy khiến mọi request từ trình duyệt luôn same-origin, cookie thành first-party, không bị chặn nữa. Đánh đổi: phải hard-code URL backend trong `vercel.json` thay vì biến môi trường |

## Ghi chú cho người review

Phần "Vì sao chọn stack này" ở README được viết tay bởi tác giả dự án — không phải nội dung AI sinh ra — theo đúng yêu cầu đề bài.
