export default function SearchBar({ search, onSearchChange, categories, categoryId, onCategoryChange, onSubmit }) {
  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
      className="flex flex-col sm:flex-row gap-3 mb-6"
    >
      <input
        type="text"
        placeholder="Search by title or description..."
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        className="flex-1 border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <select
        value={categoryId}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      <button
        type="submit"
        className="bg-primary-600 text-white px-5 py-2 rounded-md font-medium hover:bg-primary-700"
      >
        Search
      </button>
    </form>
  );
}
