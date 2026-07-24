import api from "./api";

export async function registerUser(data) {
  const res = await api.post("/api/auth/register", data);
  return res.data;
}

export async function loginUser(email, password) {
  const res = await api.post("/api/auth/login", { email, password });
  return res.data; // { access_token, token_type }
}

export async function fetchCurrentUser() {
  const res = await api.get("/api/auth/me");
  return res.data;
}
