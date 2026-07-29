import { useItemList } from "./useItemList";
import ItemCard from "../components/ItemCard";
import SearchBar from "../components/SearchBar";

export default function FoundItems() {
  const {
    items, categories, page, setPage, totalPages,
    search, setSearch, categoryId, setCategoryId,
    loading, handleSearchSubmit,
  } = useItemList("FOUND");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Found Items</h1>

      <SearchBar
        search={search} onSearchChange={setSearch}
        categories={categories} categoryId={categoryId} onCategoryChange={setCategoryId}
        onSubmit={handleSearchSubmit}
      />

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-400">No found items found.</p>
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
