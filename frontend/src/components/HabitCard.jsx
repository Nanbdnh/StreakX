import { useState } from "react";
import { HabitHeatmap } from "./HabitHeatmap";
import { IconColorPicker } from "./IconColorPicker";

export function HabitCard({ habit, onToggle, onDelete, onUpdate, dragProps }) {
  const [editing, setEditing] = useState(false);
  const [showHeatmap, setShowHeatmap] = useState(false);
  const [form, setForm] = useState(() => toFormState(habit));
  const [saving, setSaving] = useState(false);

  function toFormState(h) {
    return {
      name: h.name,
      description: h.description || "",
      icon: h.icon,
      color: h.color,
      reminderTime: h.reminderTime || "",
    };
  }

  function startEdit() {
    setForm(toFormState(habit));
    setEditing(true);
  }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true);
    try {
      await onUpdate(habit.id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div
      className={`habit-card ${dragProps?.isDragging ? "habit-card--dragging" : ""}`}
      style={{ borderLeftColor: habit.color }}
      draggable={!editing}
      onDragStart={dragProps?.onDragStart}
      onDragOver={dragProps?.onDragOver}
      onDrop={dragProps?.onDrop}
      onDragEnd={dragProps?.onDragEnd}
    >
      {editing ? (
        <form className="habit-card__edit-form" onSubmit={handleSave}>
          <input
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="Tên habit"
            required
          />
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Mô tả (không bắt buộc)"
          />
          <label className="reminder-field">
            Nhắc lúc
            <input
              type="time"
              value={form.reminderTime}
              onChange={(e) => setForm({ ...form, reminderTime: e.target.value })}
            />
            {form.reminderTime && (
              <button type="button" className="link-btn-inline" onClick={() => setForm({ ...form, reminderTime: "" })}>
                Tắt nhắc
              </button>
            )}
          </label>
          <IconColorPicker
            icon={form.icon}
            color={form.color}
            onChangeIcon={(icon) => setForm({ ...form, icon })}
            onChangeColor={(color) => setForm({ ...form, color })}
          />
          <div className="habit-card__edit-actions">
            <button type="submit" disabled={saving}>
              {saving ? "Đang lưu..." : "Lưu"}
            </button>
            <button type="button" className="link-btn" onClick={() => setEditing(false)}>
              Huỷ
            </button>
          </div>
        </form>
      ) : (
        <>
          <span className="drag-handle" title="Kéo để sắp xếp">
            ⠿
          </span>
          <div className="habit-card__main">
            <div className="habit-card__title-row">
              <h3>
                <span aria-hidden="true">{habit.icon}</span> {habit.name}
              </h3>
              <button className="icon-btn" title="Sửa habit" onClick={startEdit}>
                ✎
              </button>
              <button className="icon-btn" title="Xoá habit" onClick={() => onDelete(habit.id)}>
                ×
              </button>
            </div>
            {habit.description && <p className="habit-card__desc">{habit.description}</p>}
            <div className="habit-card__stats">
              <span title="Streak hiện tại">🔥 {habit.currentStreak} ngày liên tiếp</span>
              <span title="Streak dài nhất">🏆 kỷ lục {habit.longestStreak}</span>
              <span title="Tổng số lần check-in">✅ {habit.totalCheckIns} lần</span>
              {habit.reminderTime && <span title="Giờ nhắc">⏰ {habit.reminderTime}</span>}
              <button className="link-btn-inline" onClick={() => setShowHeatmap((v) => !v)}>
                {showHeatmap ? "Ẩn lịch sử" : "Xem lịch sử"}
              </button>
            </div>
            {showHeatmap && <HabitHeatmap habitId={habit.id} color={habit.color} />}
          </div>
          <button
            className={`checkin-btn ${habit.checkedInToday ? "checkin-btn--done" : ""}`}
            onClick={() => onToggle(habit.id)}
          >
            {habit.checkedInToday ? "Đã check-in hôm nay" : "Check-in hôm nay"}
          </button>
        </>
      )}
    </div>
  );
}
