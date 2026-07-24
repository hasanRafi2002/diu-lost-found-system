import { useState, useEffect, useCallback } from "react";
import { getItems } from "../services/itemService";
import { getCategories } from "../services/categoryService";

export function useItemList(itemType) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [loading, setLoading] = useState(true);

  const pageSize = 12;

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = { item_type: itemType, page, page_size: pageSize };
      if (search) params.search = search;
      if (categoryId) params.category_id = categoryId;

      const data = await getItems(params);
      setItems(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [itemType, page, search, categoryId]);

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  function handleSearchSubmit() {
    setPage(1);
    fetchItems();
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items, categories, total, page, setPage, totalPages,
    search, setSearch, categoryId, setCategoryId,
    loading, handleSearchSubmit,
  };
}
