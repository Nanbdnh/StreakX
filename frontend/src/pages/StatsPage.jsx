import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

function ratioInLastNDays(checkInDates, n) {
  const today = new Date();
  const todayUTC = Date.UTC(today.getFullYear(), today.getMonth(), today.getDate());
  const cutoff = todayUTC - (n - 1) * 24 * 60 * 60 * 1000;

  const count = checkInDates.filter((d) => {
    const t = Date.parse(d + "T00:00:00Z");
    return t >= cutoff && t <= todayUTC;
  }).length;

  return count / n;
}

export function StatsPage() {
  const [rows, setRows] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { habits } = await api.listHabits();
        const withCheckIns = await Promise.all(
          habits.map(async (habit) => {
            const { checkIns } = await api.habitCheckIns(habit.id);
            return {
              ...habit,
              week: ratioInLastNDays(checkIns, 7),
              month: ratioInLastNDays(checkIns, 30),
            };
          })
        );
        if (!cancelled) setRows(withCheckIns);
      } catch (err) {
        if (!cancelled) setError(err.message);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Thống kê</h1>
          <p className="muted">Tỷ lệ hoàn thành mỗi habit theo tuần/tháng gần nhất</p>
        </div>
        <Link className="link-btn" to="/">
          ← Về dashboard
        </Link>
      </header>

      {error && <p className="form-error">{error}</p>}
      {!rows ? (
        <p className="muted">Đang tải...</p>
      ) : rows.length === 0 ? (
        <p className="muted">Chưa có habit nào để thống kê.</p>
      ) : (
        <div className="stats-list">
          {rows.map((h) => (
            <div className="stats-row" key={h.id}>
              <div className="stats-row__label">
                <span aria-hidden="true">{h.icon}</span> {h.name}
              </div>
              <div className="stats-bar-group">
                <span className="stats-bar-caption">Tuần này {Math.round(h.week * 100)}%</span>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${h.week * 100}%`, background: h.color }} />
                </div>
              </div>
              <div className="stats-bar-group">
                <span className="stats-bar-caption">30 ngày {Math.round(h.month * 100)}%</span>
                <div className="stats-bar">
                  <div className="stats-bar__fill" style={{ width: `${h.month * 100}%`, background: h.color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
