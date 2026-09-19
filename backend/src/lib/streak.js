// Chuẩn hoá một Date về 00:00:00 UTC, dùng làm khoá so sánh ngày.
export function toDateKey(date) {
  const d = new Date(date);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}

export function todayKey() {
  return toDateKey(new Date());
}

// checkIns: mảng { date } đã sắp xếp bất kỳ thứ tự.
// Streak hiện tại = số ngày liên tiếp tính từ hôm nay (hoặc hôm qua nếu hôm nay
// chưa check-in) lùi về quá khứ, không đứt quãng ngày nào.
export function calculateCurrentStreak(checkIns) {
  const dateKeys = new Set(checkIns.map((c) => toDateKey(c.date)));
  const oneDayMs = 24 * 60 * 60 * 1000;
  const today = todayKey();
  const yesterday = today - oneDayMs;

  let cursor;
  if (dateKeys.has(today)) {
    cursor = today;
  } else if (dateKeys.has(yesterday)) {
    // Chưa check-in hôm nay nhưng hôm qua có -> streak vẫn còn "sống" đến hết hôm nay.
    cursor = yesterday;
  } else {
    return 0;
  }

  let streak = 0;
  while (dateKeys.has(cursor)) {
    streak += 1;
    cursor -= oneDayMs;
  }
  return streak;
}

export function calculateLongestStreak(checkIns) {
  if (checkIns.length === 0) return 0;
  const oneDayMs = 24 * 60 * 60 * 1000;
  const sortedKeys = [...new Set(checkIns.map((c) => toDateKey(c.date)))].sort(
    (a, b) => a - b
  );

  let longest = 1;
  let current = 1;
  for (let i = 1; i < sortedKeys.length; i++) {
    if (sortedKeys[i] - sortedKeys[i - 1] === oneDayMs) {
      current += 1;
    } else {
      current = 1;
    }
    longest = Math.max(longest, current);
  }
  return longest;
}
