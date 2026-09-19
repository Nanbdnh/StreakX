import { useRef, useState } from "react";
import { Mascot } from "page-mascot";

const STORAGE_KEY = "mascotPosition";
const DRAG_THRESHOLD = 6; // px di chuyển tối thiểu để tính là kéo, tránh nhầm với click "boop"
const MASCOT_SIZE = 110;

function loadPosition() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved && Number.isFinite(saved.right) && Number.isFinite(saved.bottom)) {
      return saved;
    }
  } catch {
    // localStorage có thể bị chặn (private mode) - dùng vị trí mặc định
  }
  return { right: 20, bottom: 16 };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

// Mascot kéo-thả được: giữ chuột/ngón tay và di chuyển để đổi vị trí, thả ra để
// giữ nguyên đó. Bấm nhẹ không kéo vẫn giữ nguyên hiệu ứng "boop" gốc của package.
export function DraggableMascot() {
  const [position, setPosition] = useState(loadPosition);
  const dragRef = useRef(null);
  const justDraggedRef = useRef(false);

  function handlePointerDown(e) {
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startRight: position.right,
      startBottom: position.bottom,
      moved: false,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  }

  function handlePointerMove(e) {
    const drag = dragRef.current;
    if (!drag) return;

    const dx = e.clientX - drag.startX;
    const dy = e.clientY - drag.startY;
    if (!drag.moved && Math.hypot(dx, dy) < DRAG_THRESHOLD) return;

    drag.moved = true;
    const next = {
      right: clamp(drag.startRight - dx, 4, window.innerWidth - MASCOT_SIZE / 2),
      bottom: clamp(drag.startBottom - dy, 4, window.innerHeight - MASCOT_SIZE / 2),
    };
    dragRef.current.lastPosition = next;
    setPosition(next);
  }

  function handlePointerUp() {
    const drag = dragRef.current;
    if (drag?.moved) {
      justDraggedRef.current = true;
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(drag.lastPosition));
      } catch {
        // bỏ qua nếu không lưu được, mascot vẫn dùng được, chỉ là không nhớ vị trí
      }
    }
    dragRef.current = null;
  }

  // Chặn sự kiện click "boop" của Mascot ngay sau khi vừa kéo xong, để thả chuột
  // không bị hiểu nhầm thành một cú bấm.
  function handleClickCapture(e) {
    if (justDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      justDraggedRef.current = false;
    }
  }

  return (
    <div
      className="page-mascot-wrap"
      style={{ right: position.right, bottom: position.bottom }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onClickCapture={handleClickCapture}
    >
      <Mascot
        directions="/mascots/skater-directions.webp"
        reactions="/mascots/skater-reactions.webp"
        size={MASCOT_SIZE}
        label="mascot cổ vũ giữ streak, kéo được để đổi chỗ"
      />
    </div>
  );
}
