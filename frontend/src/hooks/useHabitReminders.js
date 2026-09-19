import { useEffect, useRef } from "react";

// Nhắc nhở kiểu "khi tab đang mở": dùng Notification API của trình duyệt, không
// phải push notification thật (không nhắc được khi đã đóng tab/trình duyệt).
// Làm push thật cần thêm service worker + server gửi qua VAPID, ngoài phạm vi bản này.
export function useHabitReminders(habits) {
  const notifiedRef = useRef(new Set());

  useEffect(() => {
    const hasReminder = habits.some((h) => h.reminderTime);
    if (hasReminder && "Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, [habits]);

  useEffect(() => {
    if (!("Notification" in window)) return;

    const interval = setInterval(() => {
      if (Notification.permission !== "granted") return;

      const now = new Date();
      const hh = String(now.getHours()).padStart(2, "0");
      const mm = String(now.getMinutes()).padStart(2, "0");
      const currentTime = `${hh}:${mm}`;
      const todayKey = now.toISOString().slice(0, 10);

      habits.forEach((habit) => {
        if (habit.reminderTime !== currentTime) return;
        if (habit.checkedInToday) return;

        const dedupeKey = `${habit.id}-${todayKey}-${currentTime}`;
        if (notifiedRef.current.has(dedupeKey)) return;
        notifiedRef.current.add(dedupeKey);

        new Notification(`Đến giờ: ${habit.name}`, {
          body: "Bạn chưa check-in hôm nay đó!",
          icon: "/favicon.svg",
        });
      });
    }, 20000);

    return () => clearInterval(interval);
  }, [habits]);
}
