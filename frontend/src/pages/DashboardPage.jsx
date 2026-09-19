import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { HabitCard } from "../components/HabitCard";

const COLORS = ["#d97706", "#0f766e", "#7c3aed", "#dc2626", "#2563eb"];

export function DashboardPage() {
  const { user, logout } = useAuth();
  const [habits, setHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");

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
      const color = COLORS[habits.length % COLORS.length];
      const data = await api.createHabit({ name, description, color });
      setHabits((prev) => [...prev, data.habit]);
      setName("");
      setDescription("");
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

  async function handleDelete(id) {
    if (!confirm("Xoá habit này? Toàn bộ lịch sử check-in sẽ mất.")) return;
    try {
      await api.deleteHabit(id);
      setHabits((prev) => prev.filter((h) => h.id !== id));
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
        <button className="link-btn" onClick={logout}>
          Đăng xuất
        </button>
      </header>

      <form className="new-habit-form" onSubmit={handleCreate}>
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
        <button type="submit">+ Thêm</button>
      </form>

      {error && <p className="form-error">{error}</p>}

      {loading ? (
        <p className="muted">Đang tải...</p>
      ) : habits.length === 0 ? (
        <p className="muted">Chưa có thói quen nào. Thêm cái đầu tiên ở trên nhé.</p>
      ) : (
        <div className="habit-list">
          {habits.map((habit) => (
            <HabitCard key={habit.id} habit={habit} onToggle={handleToggle} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
}
