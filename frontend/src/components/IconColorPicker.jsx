export const HABIT_ICONS = ["🔥", "💧", "📚", "🏃", "🧘", "💪", "🎯", "🛌", "🍎", "✍️", "🎸", "🧹", "💰", "🎨", "🧠", "🚶"];
export const HABIT_COLORS = [
  "#d97706",
  "#0f766e",
  "#7c3aed",
  "#dc2626",
  "#2563eb",
  "#db2777",
  "#059669",
  "#4b5563",
];

export function IconColorPicker({ icon, color, onChangeIcon, onChangeColor }) {
  return (
    <div className="icon-color-picker">
      <div className="icon-color-picker__row">
        {HABIT_ICONS.map((i) => (
          <button
            key={i}
            type="button"
            className={`icon-swatch ${icon === i ? "icon-swatch--active" : ""}`}
            onClick={() => onChangeIcon(i)}
            aria-label={`Chọn icon ${i}`}
          >
            {i}
          </button>
        ))}
      </div>
      <div className="icon-color-picker__row">
        {HABIT_COLORS.map((c) => (
          <button
            key={c}
            type="button"
            className={`color-swatch ${color === c ? "color-swatch--active" : ""}`}
            style={{ background: c }}
            onClick={() => onChangeColor(c)}
            aria-label={`Chọn màu ${c}`}
          />
        ))}
      </div>
    </div>
  );
}
