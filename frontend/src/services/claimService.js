import api from "./api";

export async function submitClaim(itemId, data) {
  const res = await api.post(`/api/items/${itemId}/claims`, data);
  return res.data;
}

export async function getItemClaims(itemId) {
  const res = await api.get(`/api/items/${itemId}/claims`);
  return res.data;
}

export async function approveClaim(claimId) {
  const res = await api.patch(`/api/claims/${claimId}/approve`);
  return res.data;
}

export async function rejectClaim(claimId) {
  const res = await api.patch(`/api/claims/${claimId}/reject`);
  return res.data;
}

export async function cancelClaim(claimId) {
  const res = await api.patch(`/api/claims/${claimId}/cancel`);
  return res.data;
}
