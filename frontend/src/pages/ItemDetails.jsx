import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/loaders/LoadingSpinner";
import { getItem, deleteItem, updateItemStatus } from "../services/itemService";
import { getItemClaims } from "../services/claimService";
import ClaimForm from "../components/ClaimForm";
import ClaimsPanel from "../components/ClaimsPanel";
import { resolveImageUrl } from "../services/uploadService";

export default function ItemDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [item, setItem] = useState(null);
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  const isOwner = isAuthenticated && item && user?.id === item.user_id;

  // ✅ FIX: Separate function to load item
  const loadItem = useCallback(async () => {
    try {
      const data = await getItem(id);
      setItem(data);
      return data;
    } catch (err) {
      toast.error("Item not found");
      navigate("/");
      return null;
    }
  }, [id, navigate]);

  // ✅ FIX: Separate function to load claims (always try)
  const loadClaims = useCallback(async (itemData) => {
    if (!itemData) return;
    if (!isAuthenticated || user?.id !== itemData.user_id) return;
    
    try {
      const data = await getItemClaims(itemData.id);
      setClaims(data);
    } catch (err) {
      // Silently fail if not owner
      setClaims([]);
    }
  }, [isAuthenticated, user?.id]);

  // ✅ FIX: Load on mount with proper dependencies
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const data = await loadItem();
      if (data) {
        await loadClaims(data);
      }
      setLoading(false);
    };
    
    loadData();
  }, [id, loadItem, loadClaims]);

  async function refreshAfterClaimChange() {
    const data = await loadItem();
    if (data) await loadClaims(data);
  }

  async function handleDelete() {
    if (!window.confirm("Delete this report? This cannot be undone.")) return;
    setActionLoading(true);
    try {
      await deleteItem(item.id);
      toast.success("Report deleted");
      navigate("/my-reports");
    } catch (err) {
      toast.error("Failed to delete");
    } finally {
      setActionLoading(false);
    }
  }

  async function handleMarkResolved() {
    setActionLoading(true);
    try {
      const updated = await updateItemStatus(item.id, "RESOLVED");
      setItem(updated);
      toast.success("Marked as resolved");
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <LoadingSpinner message="Loading..." minHeight="300px" />;
  }

  if (!item) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-64 bg-gray-100 flex items-center justify-center text-gray-300">
          {item.image_url ? (
            <img src={resolveImageUrl(item.image_url)} alt={item.title} className="w-full h-full object-cover" />
          ) : (
            "No Image Provided"
          )}
        </div>

        <div className="p-6">
          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs font-semibold px-2 py-1 rounded ${
              item.item_type === "LOST" ? "bg-red-50 text-red-600 border border-red-200" : "bg-blue-50 text-blue-600 border border-blue-200"
            }`}>
              {item.item_type}
            </span>
            <span className="text-xs font-semibold px-2 py-1 rounded bg-gray-100 text-gray-600">
              {item.status}
            </span>
          </div>

          <h1 className="text-2xl font-bold text-gray-800">{item.title}</h1>
          <p className="text-gray-600 mt-3 whitespace-pre-line">{item.description}</p>

          <div className="grid grid-cols-2 gap-4 mt-6 text-sm">
            {item.brand && <Detail label="Brand" value={item.brand} />}
            {item.color && <Detail label="Color" value={item.color} />}
            {item.building && <Detail label="Building" value={item.building} />}
            {item.floor && <Detail label="Floor" value={item.floor} />}
            {item.room && <Detail label="Room" value={item.room} />}
            {item.specific_location && <Detail label="Specific Location" value={item.specific_location} />}
            {item.lost_found_date && <Detail label="Date" value={item.lost_found_date} />}
            <Detail label="Views" value={item.view_count} />
          </div>

          {isOwner && (
            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
              {item.status !== "RESOLVED" && (
                <button
                  onClick={handleMarkResolved} disabled={actionLoading}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                >
                  Mark as Resolved
                </button>
              )}
              <Link
                to={`/items/${item.id}/edit`}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200"
              >
                Edit
              </Link>
              <button
                onClick={handleDelete} disabled={actionLoading}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-red-100 disabled:opacity-50"
              >
                Delete
              </button>
            </div>
          )}

          {!isOwner && isAuthenticated && item.status === "ACTIVE" && (
            <div className="mt-8 pt-6 border-t border-gray-100">
              <ClaimForm itemId={item.id} itemType={item.item_type} onSubmitted={refreshAfterClaimChange} />
            </div>
          )}

          {!isAuthenticated && item.status === "ACTIVE" && (
            <div className="mt-8 pt-6 border-t border-gray-100 text-sm text-gray-500">
              <Link to="/login" className="text-primary-600 font-medium">Log in</Link> to claim this item.
            </div>
          )}
        </div>
      </div>

      {isOwner && (
        <div className="mt-6">
          <h2 className="font-semibold text-gray-800 mb-3">
            {item.item_type === "LOST" ? "People who say they found this" : "Claims on this item"}
          </h2>
          {claims.length > 0 ? (
            <ClaimsPanel claims={claims} itemType={item.item_type} onChanged={refreshAfterClaimChange} />
          ) : (
            <p className="text-gray-500 text-sm">No claims yet</p>
          )}
        </div>
      )}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div className="text-gray-400 text-xs uppercase tracking-wide">{label}</div>
      <div className="text-gray-700 font-medium">{value}</div>
    </div>
  );
}
