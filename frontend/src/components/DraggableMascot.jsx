import { useEffect, useRef, useState } from "react";
import { Mascot } from "page-mascot";

const STORAGE_KEY = "mascotPosition";
const DRAG_THRESHOLD = 6; // px di chuyển tối thiểu để tính là kéo, tránh nhầm với click "boop"
const MASCOT_SIZE = 110;
const SPEECH_DURATION_MS = 3200;
const IDLE_SPEECH_INTERVAL_MS = 45000;

const PHRASES = [
  "Bá khí trên từng hạt bí",
  "Cố lên bạn tôi ơi!",
  "Miễn dịch với lười biếng",
  "Hơn cả khu tự trị!",
  "Thuyệt hôm bà",
];

function pickPhrase() {
  return PHRASES[Math.floor(Math.random() * PHRASES.length)];
}

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
// giữ nguyên đó. Bấm nhẹ không kéo vẫn giữ nguyên hiệu ứng "boop" gốc của package,
// đồng thời hiện thêm một câu thoại ngẫu nhiên.
export function DraggableMascot() {
  const [position, setPosition] = useState(loadPosition);
  const [message, setMessage] = useState(null);
  const dragRef = useRef(null);
  const justDraggedRef = useRef(false);
  const hideTimerRef = useRef(null);

  function speak(text) {
    setMessage(text);
    clearTimeout(hideTimerRef.current);
    hideTimerRef.current = setTimeout(() => setMessage(null), SPEECH_DURATION_MS);
  }

  useEffect(() => {
    const interval = setInterval(() => {
      if (!dragRef.current) speak(pickPhrase());
    }, IDLE_SPEECH_INTERVAL_MS);
    return () => {
      clearInterval(interval);
      clearTimeout(hideTimerRef.current);
    };
  }, []);

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

  function handleClick() {
    speak(pickPhrase());
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
      onClick={handleClick}
    >
      {message && <div className="mascot-speech">{message}</div>}
      <Mascot
        directions="/mascots/skater-directions.webp"
        reactions="/mascots/skater-reactions.webp"
        size={MASCOT_SIZE}
        label="mascot cổ vũ giữ streak, kéo được để đổi chỗ"
      />
    </div>
  );
}
