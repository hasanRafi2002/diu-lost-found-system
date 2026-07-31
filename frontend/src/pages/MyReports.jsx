import { useState, useEffect, useCallback } from "react";
import { getMyReports } from "../services/itemService";
import ItemCard from "../components/ItemCard";
import ItemCardSkeleton from "../components/loaders/ItemCardSkeleton";

export default function MyReports() {
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 12;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getMyReports({ page, page_size: pageSize });
      setItems(data.items);
      setTotal(data.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => { load(); }, [load]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">My Reports</h1>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => <ItemCardSkeleton key={i} />)}
        </div>
      ) : items.length === 0 ? (
        <p className="text-gray-400">You haven't reported any items yet.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => <ItemCard key={item.id} item={item} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-8">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={`w-9 h-9 rounded-md text-sm font-medium ${
                p === page ? "bg-primary-600 text-white" : "bg-white border border-gray-200 text-gray-600"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
