import api from './api';

export async function listItems({ page = 1, page_size = 12, item_type = null, category_id = null, status = null, building = null, search = null } = {}) {
  try {
    const params = new URLSearchParams({
      page,
      page_size,
    });

    if (item_type) params.append('item_type', item_type);
    if (category_id) params.append('category_id', category_id);
    if (status) params.append('status', status);
    if (building) params.append('building', building);
    if (search) params.append('search', search);

    const response = await api.get(`/api/items?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error listing items:', error);
    throw error;
  }
}

export async function getItem(itemId) {
  try {
    const response = await api.get(`/api/items/${itemId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching item:', error);
    throw error;
  }
}

export async function createItem(itemData) {
  try {
    const response = await api.post('/api/items', itemData);
    return response.data;
  } catch (error) {
    console.error('Error creating item:', error);
    throw error;
  }
}

export async function updateItem(itemId, itemData) {
  try {
    const response = await api.put(`/api/items/${itemId}`, itemData);
    return response.data;
  } catch (error) {
    console.error('Error updating item:', error);
    throw error;
  }
}

export async function deleteItem(itemId) {
  try {
    await api.delete(`/api/items/${itemId}`);
  } catch (error) {
    console.error('Error deleting item:', error);
    throw error;
  }
}

export async function updateItemStatus(itemId, status) {
  try {
    const response = await api.patch(`/api/items/${itemId}/status`, { status });
    return response.data;
  } catch (error) {
    console.error('Error updating item status:', error);
    throw error;
  }
}

export async function uploadItemImage(itemId, file) {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post(`/api/items/${itemId}/image`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export function resolveImageUrl(imageUrl) {
  if (!imageUrl) return '';
  if (imageUrl.startsWith('http')) return imageUrl;
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';
  return `${baseUrl}${imageUrl}`;
}

// Alias for listItems — keeps naming consistent with useItemList.js
export async function getItems(params = {}) {
  return listItems(params);
}

// Fetches the current user's own reported items (My Reports page)
export async function getMyReports({ page = 1, page_size = 12 } = {}) {
  try {
    const params = new URLSearchParams({ page, page_size });
    const response = await api.get(`/api/items/my-reports?${params.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching my reports:', error);
    throw error;
  }
}
