import api from "./api";

export async function getDashboardStats() {
  const res = await api.get("/api/admin/stats");
  return res.data;
}

export async function getAllUsers(params = {}) {
  const res = await api.get("/api/admin/users", { params });
  return res.data;
}

export async function getAllItemsAdmin(params = {}) {
  const res = await api.get("/api/admin/items", { params });
  return res.data;
}

export async function deactivateUser(id) {
  const res = await api.patch(`/api/admin/users/${id}/deactivate`);
  return res.data;
}

export async function reactivateUser(id) {
  const res = await api.patch(`/api/admin/users/${id}/reactivate`);
  return res.data;
}

export async function adminDeleteItem(id) {
  await api.delete(`/api/admin/items/${id}`);
}
