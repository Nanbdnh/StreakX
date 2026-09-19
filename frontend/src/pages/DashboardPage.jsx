import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { HabitCard } from "../components/HabitCard";
import { IconColorPicker, HABIT_ICONS, HABIT_COLORS } from "../components/IconColorPicker";
import { useHabitReminders } from "../hooks/useHabitReminders";

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState(HABIT_ICONS[0]);
  const [color, setColor] = useState(HABIT_COLORS[0]);
  const [reminderTime, setReminderTime] = useState("");
  const [error, setError] = useState("");
  const dragHabitId = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  useHabitReminders(habits);

  useEffect(() => {
    refresh();
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await api.listHabits();
      setHabits(data.habits);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCreate(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setError("");
    try {
      const data = await api.createHabit({ name, description, icon, color, reminderTime: reminderTime || undefined });
      setHabits((prev) => [...prev, data.habit]);
      setName("");
      setDescription("");
      setReminderTime("");
      setIcon(HABIT_ICONS[(HABIT_ICONS.indexOf(icon) + 1) % HABIT_ICONS.length]);
      setColor(HABIT_COLORS[(HABIT_COLORS.indexOf(color) + 1) % HABIT_COLORS.length]);
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleToggle(id) {
    try {
      const data = await api.toggleCheckIn(id);
      setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleUpdate(id, payload) {
    const data = await api.updateHabit(id, payload);
    setHabits((prev) => prev.map((h) => (h.id === id ? data.habit : h)));
  }

  async function handleDelete(id) {
    if (!confirm("Xoá habit này? Toàn bộ lịch sử check-in sẽ mất.")) return;
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  function handleDragStart(id) {
    dragHabitId.current = id;
    setDraggingId(id);
  }

  function handleDragOver(e, overId) {
    e.preventDefault();
    const draggedId = dragHabitId.current;
    if (!draggedId || draggedId === overId) return;

    setHabits((prev) => {
      const from = prev.findIndex((h) => h.id === draggedId);
      const to = prev.findIndex((h) => h.id === overId);
      if (from === -1 || to === -1) return prev;
      const next = [...prev];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return next;
    });
  }

  async function handleDragEnd() {
    dragHabitId.current = null;
    setDraggingId(null);
    try {
      await api.reorderHabits(habits.map((h) => h.id));
    } catch (err) {
      setError(err.message);
    }
  }

  const totalStreak = habits.reduce((sum, h) => sum + h.currentStreak, 0);
  const doneToday = habits.filter((h) => h.checkedInToday).length;

  return (
    <div className="dashboard">
      <header className="dashboard__header">
        <div>
          <h1>Xin chào, {user?.name}</h1>
          <p className="muted">
            {habits.length} thói quen · {doneToday}/{habits.length} đã check-in hôm nay · tổng streak {totalStreak}
          </p>
        </div>
        <div className="dashboard__header-actions">
          <Link className="link-btn" to="/stats">
            Thống kê
          </Link>
          <button className="link-btn" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

      <form className="new-habit-form" onSubmit={handleCreate}>
        <div className="new-habit-form__row">
          <input
            placeholder="Thói quen mới, vd: Đọc sách 20 phút"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            placeholder="Mô tả (không bắt buộc)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <label className="reminder-field">
            Nhắc lúc
            <input type="time" value={reminderTime} onChange={(e) => setReminderTime(e.target.value)} />
          </label>
          <button type="submit">+ Thêm</button>
        </div>
        <IconColorPicker icon={icon} color={color} onChangeIcon={setIcon} onChangeColor={setColor} />
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : habits.length === 0 ? (
        <p className="muted">Chưa có thói quen nào. Thêm cái đầu tiên ở trên nhé.</p>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={handleToggle}
              onDelete={handleDelete}
              onUpdate={handleUpdate}
              dragProps={{
                isDragging: draggingId === habit.id,
                onDragStart: () => handleDragStart(habit.id),
                onDragOver: (e) => handleDragOver(e, habit.id),
                onDrop: (e) => e.preventDefault(),
                onDragEnd: handleDragEnd,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
