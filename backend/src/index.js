import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/auth.js";
import habitsRoutes from "./routes/habits.js";

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
    credentials: true, // bắt buộc để browser gửi/nhận cookie httpOnly giữa 2 domain khác nhau
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/api/health", (req, res) => res.json({ ok: true }));
app.use("/api/auth", authRoutes);
app.use("/api/habits", habitsRoutes);

// Error handler chung - bắt lỗi bất ngờ (vd Prisma) để không làm crash process
// và không rò rỉ stack trace ra client.
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: "Lỗi server, vui lòng thử lại sau" });
});

const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Backend đang chạy tại http://localhost:${port}`);
});
