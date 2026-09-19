const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

// Wrapper fetch dùng chung: luôn gửi cookie (credentials: "include") vì
// token auth nằm trong cookie httpOnly, không phải header Authorization.
async function request(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new Error(data?.error || `Lỗi ${res.status}`);
  }
  return data;
}

export const api = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login: (body) => request("/auth/login", { method: "POST", body: JSON.stringify(body) }),
  logout: () => request("/auth/logout", { method: "POST" }),
  me: () => request("/auth/me"),

  listHabits: () => request("/habits"),
  createHabit: (body) => request("/habits", { method: "POST", body: JSON.stringify(body) }),
  updateHabit: (id, body) => request(`/habits/${id}`, { method: "PUT", body: JSON.stringify(body) }),
  deleteHabit: (id) => request(`/habits/${id}`, { method: "DELETE" }),
  toggleCheckIn: (id) => request(`/habits/${id}/checkin`, { method: "POST" }),
  habitCheckIns: (id) => request(`/habits/${id}/checkins`),
  reorderHabits: (orderedIds) =>
    request("/habits/reorder", { method: "POST", body: JSON.stringify({ orderedIds }) }),
};
