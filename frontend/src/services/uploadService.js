import api from "./api";

export async function uploadItemImage(itemId, file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`/api/items/${itemId}/image`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return null;
  return `${import.meta.env.VITE_API_URL}${imageUrl}`;
}
