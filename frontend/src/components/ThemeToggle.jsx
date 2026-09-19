import { useEffect, useState } from "react";

function getInitialTheme() {
  try {
    return localStorage.getItem("theme") || "light";
  } catch {
    return "light";
  }
}

export function ThemeToggle() {
  const [theme, setTheme] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try {
      localStorage.setItem("theme", theme);
    } catch {
      // localStorage có thể bị chặn (private mode) - bỏ qua, chỉ mất lưu preference
    }
  }, [theme]);

  return (
    <button
      className="theme-toggle"
      onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
      title={theme === "dark" ? "Chuyển sang nền sáng" : "Chuyển sang nền tối"}
      aria-label="Đổi giao diện sáng/tối"
    >
      {theme === "dark" ? "☀️" : "🌙"}
    </button>
  );
}
