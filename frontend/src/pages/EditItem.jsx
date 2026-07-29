import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import LoadingSpinner from "../components/loaders/LoadingSpinner";
import { getItem, updateItem } from "../services/itemService";
import { getCategories } from "../services/categoryService";
import ImageUpload from "../components/ImageUpload";

export default function EditItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState(null);

  useEffect(() => {
    Promise.all([getItem(id), getCategories()])
      .then(([item, cats]) => {
        setCategories(cats);
        setForm({
          title: item.title,
          description: item.description,
          category_id: item.category_id || "",
          brand: item.brand || "",
          color: item.color || "",
          building: item.building || "",
          floor: item.floor || "",
          room: item.room || "",
          specific_location: item.specific_location || "",
          lost_found_date: item.lost_found_date || "",
          user_id: item.user_id,
          image_url: item.image_url,
        });
      })
      .catch(() => {
        toast.error("Item not found");
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [id]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const { user_id, ...payload } = form;
      payload.category_id = payload.category_id ? Number(payload.category_id) : null;
      payload.lost_found_date = payload.lost_found_date || null;

      await updateItem(id, payload);
      toast.success("Report updated");
      navigate(`/items/${id}`);
    } catch (err) {
      const message = err.response?.data?.detail;
      toast.error(typeof message === "string" ? message : "Update failed");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading || !form) {
    return <LoadingSpinner message="Loading..." minHeight="300px" />;
  }

  if (user?.id !== form.user_id) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 text-red-500">
        You do not have permission to edit this report.
      </div>
    );
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Edit Report</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">
        <input name="title" required value={form.title} onChange={handleChange} className={inputClass} />
        <textarea name="description" required rows={4} value={form.description} onChange={handleChange} className={inputClass} />

        <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass}>
          <option value="">Select Category</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} className={inputClass} />
          <input name="color" placeholder="Color" value={form.color} onChange={handleChange} className={inputClass} />
        </div>

        <input name="building" placeholder="Building" value={form.building} onChange={handleChange} className={inputClass} />

        <div className="grid grid-cols-2 gap-4">
          <input name="floor" placeholder="Floor" value={form.floor} onChange={handleChange} className={inputClass} />
          <input name="room" placeholder="Room" value={form.room} onChange={handleChange} className={inputClass} />
        </div>

        <input name="specific_location" placeholder="Specific location" value={form.specific_location} onChange={handleChange} className={inputClass} />
        <input name="lost_found_date" type="date" value={form.lost_found_date} onChange={handleChange} className={inputClass} />

        <button
          type="submit" disabled={submitting}
          className="w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Saving..." : "Save Changes"}
        </button>
      </form>
      <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mt-4">
        <h3 className="font-semibold text-gray-800 mb-3">Update Photo</h3>
        <ImageUpload
          itemId={id}
          currentImageUrl={form.image_url}
          onUploaded={(updated) => setForm({ ...form, image_url: updated.image_url })}
        />
      </div>
    </div>
  );
}
