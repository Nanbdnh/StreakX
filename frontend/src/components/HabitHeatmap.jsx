import { useEffect, useState } from "react";
import { api } from "../api/client";

const WEEKS_TO_SHOW = 12;

function toDateStr(d) {
  return d.toISOString().slice(0, 10);
}

// Xây danh sách ô hiển thị: bắt đầu từ Chủ nhật của (hôm nay - 12 tuần), kết thúc hôm nay.
function buildCells() {
  const today = new Date();
  const todayUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), today.getDate()));
  const start = new Date(todayUTC);
  start.setUTCDate(start.getUTCDate() - WEEKS_TO_SHOW * 7);
  start.setUTCDate(start.getUTCDate() - start.getUTCDay()); // lùi về Chủ nhật gần nhất

  const cells = [];
  const cursor = new Date(start);
  while (cursor <= todayUTC) {
    cells.push(new Date(cursor));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return cells;
}

export function HabitHeatmap({ habitId, color }) {
  const [checkInSet, setCheckInSet] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.habitCheckIns(habitId).then((data) => {
      if (!cancelled) setCheckInSet(new Set(data.checkIns));
    });
    return () => {
      cancelled = true;
    };
  }, [habitId]);

  if (!checkInSet) return <p className="muted">Đang tải lịch sử...</p>;

  const cells = buildCells();
  const weeks = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }

  return (
    <div className="heatmap">
      <div className="heatmap__grid">
        {weeks.map((week, wi) => (
          <div className="heatmap__week" key={wi}>
            {week.map((day) => {
              const key = toDateStr(day);
              const active = checkInSet.has(key);
              return (
                <div
                  key={key}
                  className="heatmap__cell"
                  style={active ? { background: color } : undefined}
                  title={`${key}${active ? " — đã check-in" : ""}`}
                />
              );
            })}
          </div>
        ))}
      </div>
      <p className="muted heatmap__hint">{WEEKS_TO_SHOW} tuần gần nhất</p>
    </div>
  );
}
