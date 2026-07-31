import api from "./api";

export async function getNotifications(unreadOnly = false) {
  const res = await api.get("/api/notifications", { params: { unread_only: unreadOnly } });
  return res.data;
}

export async function getUnreadCount() {
  const res = await api.get("/api/notifications/unread-count");
  return res.data.unread_count;
}

export async function markAsRead(id) {
  const res = await api.patch(`/api/notifications/${id}/read`);
  return res.data;
}

export async function markAllAsRead() {
  await api.patch("/api/notifications/read-all");
}
