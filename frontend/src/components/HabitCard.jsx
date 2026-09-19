export function HabitCard({ habit, onToggle, onDelete }) {
  return (
    <div className="habit-card" style={{ borderLeftColor: habit.color }}>
      <div className="habit-card__main">
        <div className="habit-card__title-row">
          <h3>{habit.name}</h3>
          <button className="icon-btn" title="Xoá habit" onClick={() => onDelete(habit.id)}>
            ×
          </button>
        </div>
        {habit.description && <p className="habit-card__desc">{habit.description}</p>}
        <div className="habit-card__stats">
          <span title="Streak hiện tại">🔥 {habit.currentStreak} ngày liên tiếp</span>
          <span title="Streak dài nhất">🏆 kỷ lục {habit.longestStreak}</span>
          <span title="Tổng số lần check-in">✅ {habit.totalCheckIns} lần</span>
        </div>
      </div>
      <button
        className={`checkin-btn ${habit.checkedInToday ? "checkin-btn--done" : ""}`}
        onClick={() => onToggle(habit.id)}
      >
        {habit.checkedInToday ? "Đã check-in hôm nay" : "Check-in hôm nay"}
      </button>
    </div>
  );
}
