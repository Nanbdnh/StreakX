import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { calculateCurrentStreak, calculateLongestStreak, todayKey, toDateKey } from "../lib/streak.js";

const router = Router();
router.use(requireAuth); // mọi route trong file này đều cần đăng nhập

function serializeHabit(habit) {
  const streak = calculateCurrentStreak(habit.checkIns);
  const longestStreak = calculateLongestStreak(habit.checkIns);
  const checkedInToday = habit.checkIns.some((c) => toDateKey(c.date) === todayKey());
  return {
    id: habit.id,
    name: habit.name,
    description: habit.description,
    color: habit.color,
    createdAt: habit.createdAt,
    currentStreak: streak,
    longestStreak,
    checkedInToday,
    totalCheckIns: habit.checkIns.length,
  };
}

// GET /api/habits - danh sách habit của user kèm streak (dùng cho dashboard)
router.get("/", async (req, res) => {
  const habits = await prisma.habit.findMany({
    where: { userId: req.userId },
    include: { checkIns: true },
    orderBy: { createdAt: "asc" },
  });
  res.json({ habits: habits.map(serializeHabit) });
});

// POST /api/habits - tạo habit mới
router.post("/", async (req, res) => {
  const { name, description, color } = req.body ?? {};
  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Tên habit không được để trống" });
  }

  const habit = await prisma.habit.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      color: color || undefined,
      userId: req.userId,
    },
    include: { checkIns: true },
  });
  res.status(201).json({ habit: serializeHabit(habit) });
});

// Xác nhận habit thuộc về user đang đăng nhập, tránh user A sửa/xoá habit của user B.
async function loadOwnedHabit(habitId, userId) {
  const habit = await prisma.habit.findFirst({
    where: { id: habitId, userId },
    include: { checkIns: true },
  });
  return habit;
}

// PUT /api/habits/:id - sửa tên/mô tả/màu
router.put("/:id", async (req, res) => {
  const habit = await loadOwnedHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Không tìm thấy habit" });

  const { name, description, color } = req.body ?? {};
  const updated = await prisma.habit.update({
    where: { id: habit.id },
    data: {
      name: name?.trim() || habit.name,
      description: description?.trim() ?? habit.description,
      color: color || habit.color,
    },
    include: { checkIns: true },
  });
  res.json({ habit: serializeHabit(updated) });
});

// DELETE /api/habits/:id
router.delete("/:id", async (req, res) => {
  const habit = await loadOwnedHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Không tìm thấy habit" });

  await prisma.habit.delete({ where: { id: habit.id } });
  res.status(204).end();
});

// POST /api/habits/:id/checkin - toggle check-in cho hôm nay (bấm lần 2 sẽ bỏ check-in)
router.post("/:id/checkin", async (req, res) => {
  const habit = await loadOwnedHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Không tìm thấy habit" });

  const todayDate = new Date();
  const normalizedToday = new Date(
    Date.UTC(todayDate.getUTCFullYear(), todayDate.getUTCMonth(), todayDate.getUTCDate())
  );

  const existing = habit.checkIns.find((c) => toDateKey(c.date) === todayKey());

  if (existing) {
    await prisma.checkIn.delete({ where: { id: existing.id } });
  } else {
    await prisma.checkIn.create({
      data: { habitId: habit.id, date: normalizedToday },
    });
  }

  const refreshed = await loadOwnedHabit(habit.id, req.userId);
  res.json({ habit: serializeHabit(refreshed) });
});

// GET /api/habits/:id/checkins - lịch sử check-in, dùng để vẽ calendar/heatmap
router.get("/:id/checkins", async (req, res) => {
  const habit = await loadOwnedHabit(req.params.id, req.userId);
  if (!habit) return res.status(404).json({ error: "Không tìm thấy habit" });

  res.json({
    checkIns: habit.checkIns
      .map((c) => c.date.toISOString().slice(0, 10))
      .sort(),
  });
});

export default router;
