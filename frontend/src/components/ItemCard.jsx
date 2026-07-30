import { Link } from "react-router-dom";
import { resolveImageUrl } from "../services/uploadService";

const STATUS_STYLES = {
  ACTIVE: "bg-green-100 text-green-700",
  CLAIMED: "bg-yellow-100 text-yellow-700",
  RESOLVED: "bg-gray-200 text-gray-600",
  ARCHIVED: "bg-gray-100 text-gray-400",
};

const TYPE_STYLES = {
  LOST: "bg-red-50 text-red-600 border border-red-200",
  FOUND: "bg-blue-50 text-blue-600 border border-blue-200",
};

export default function ItemCard({ item }) {
  return (
    <Link
      to={`/items/${item.id}`}
      className="block bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden"
    >
      <div className="h-40 bg-gray-100 flex items-center justify-center text-gray-300 text-sm">
        {item.image_url ? (
          <img
            src={resolveImageUrl(item.image_url)}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        ) : (
          "No Image"
        )}
      </div>

      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${TYPE_STYLES[item.item_type]}`}>
            {item.item_type}
          </span>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[item.status]}`}>
            {item.status}
          </span>
        </div>

        <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 mt-1 line-clamp-2">{item.description}</p>

        <div className="flex items-center justify-between mt-3 text-xs text-gray-400">
          <span>{item.building || "Location N/A"}</span>
          <span>{new Date(item.created_at).toLocaleDateString()}</span>
        </div>
      </div>
    </Link>
  );
}
