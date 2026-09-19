import jwt from "jsonwebtoken";

const COOKIE_NAME = "habit_tracker_token";

// Quyết định: token sống trong cookie httpOnly (không phải localStorage) để JS
// phía client không đọc/ghi được -> giảm rủi ro XSS đánh cắp token.
// SameSite=Lax đủ dùng vì frontend proxy các request /api/* qua chính domain của nó
// (xem frontend/vercel.json) -> với trình duyệt, mọi request luôn là same-site, không
// cần SameSite=None (thứ hay bị trình duyệt chặn ở chế độ riêng tư/incognito).
export function issueAuthCookie(res, token) {
  const isProd = process.env.NODE_ENV === "production";
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    secure: isProd, // bắt buộc true khi deploy (https), false khi dev localhost http
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 ngày, khớp JWT_EXPIRES_IN mặc định
    path: "/",
  });
}

export function clearAuthCookie(res) {
  res.clearCookie(COOKIE_NAME, { path: "/" });
}

export function requireAuth(req, res, next) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: "Chưa đăng nhập" });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.sub;
    next();
  } catch {
    // Token hết hạn hoặc bị sửa -> coi như chưa đăng nhập, để FE tự redirect về /login.
    return res.status(401).json({ error: "Phiên đăng nhập đã hết hạn" });
  }
}

export { COOKIE_NAME };
