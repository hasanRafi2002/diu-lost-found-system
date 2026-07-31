import api from "./api";

export async function updateProfile(data) {
  const res = await api.patch("/api/users/me", data);
  return res.data;
}

export async function uploadAvatar(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post("/api/users/me/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}
