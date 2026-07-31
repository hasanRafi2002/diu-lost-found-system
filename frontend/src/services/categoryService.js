import api from "./api";

export async function getCategories() {
  const res = await api.get("/api/categories");
  return res.data;
}
