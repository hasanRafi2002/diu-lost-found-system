import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { createItem } from "../services/itemService";
import { getCategories } from "../services/categoryService";
import ImageUpload from "../components/ImageUpload";

const BUILDINGS = [
  "AB-1", "AB-2", "AB-3", "AB-4", "AB-5",
  "Knowledge Valley", "Library", "Auditorium",
  "Cafeteria", "Playground", "Dormitory", "Other",
];

export default function ReportItem() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [createdItem, setCreatedItem] = useState(null);

  const [form, setForm] = useState({
    title: "",
    description: "",
    item_type: "LOST",
    category_id: "",
    brand: "",
    color: "",
    building: "",
    floor: "",
    room: "",
    specific_location: "",
    lost_found_date: "",
  });

  useEffect(() => {
    getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (form.description.trim().length < 10) {
      toast.error("Description must be at least 10 characters");
      return;
    }

    setSubmitting(true);
    try {
      // ✅ Trim and sanitize all input fields
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        item_type: form.item_type,
        category_id: form.category_id ? Number(form.category_id) : null,
        brand: form.brand.trim() || null,
        color: form.color.trim() || null,
        building: form.building.trim() || null,
        floor: form.floor.trim() || null,
        room: form.room.trim() || null,
        specific_location: form.specific_location.trim() || null,
        lost_found_date: form.lost_found_date || null,
      };
      
      const created = await createItem(payload);
      setCreatedItem(created);
      toast.success("Report submitted! Add a photo below (optional).");
    } catch (err) {
      const message = err.response?.data?.detail || "Failed to submit report";
      toast.error(typeof message === "string" ? message : "Validation error");
    } finally {
      setSubmitting(false);
    }
  }

  const inputClass =
    "w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Report an Item</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm space-y-4">

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setForm({ ...form, item_type: "LOST" })}
            className={`flex-1 py-2 rounded-md font-medium border ${
              form.item_type === "LOST"
                ? "bg-red-50 border-red-300 text-red-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, item_type: "FOUND" })}
            className={`flex-1 py-2 rounded-md font-medium border ${
              form.item_type === "FOUND"
                ? "bg-blue-50 border-blue-300 text-blue-600"
                : "border-gray-200 text-gray-500"
            }`}
          >
            I Found Something
          </button>
        </div>

        <input
          name="title" placeholder="Item Title (e.g. Black Wallet)" required
          value={form.title} onChange={handleChange} className={inputClass}
        />

        <textarea
          name="description" placeholder="Describe the item in detail..." required rows={4}
          value={form.description} onChange={handleChange} className={inputClass}
        />

        <select name="category_id" value={form.category_id} onChange={handleChange} className={inputClass}>
          <option value="">Select Category</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input name="brand" placeholder="Brand (optional)" value={form.brand} onChange={handleChange} className={inputClass} />
          <input name="color" placeholder="Color (optional)" value={form.color} onChange={handleChange} className={inputClass} />
        </div>

        <select name="building" value={form.building} onChange={handleChange} className={inputClass}>
          <option value="">Select Building</option>
          {BUILDINGS.map((b) => <option key={b} value={b}>{b}</option>)}
        </select>

        <div className="grid grid-cols-2 gap-4">
          <input name="floor" placeholder="Floor (optional)" value={form.floor} onChange={handleChange} className={inputClass} />
          <input name="room" placeholder="Room (optional)" value={form.room} onChange={handleChange} className={inputClass} />
        </div>

        <input
          name="specific_location" placeholder="Specific location (e.g. Outside SE Lab)"
          value={form.specific_location} onChange={handleChange} className={inputClass}
        />

        <input
          name="lost_found_date" type="date"
          value={form.lost_found_date} onChange={handleChange} className={inputClass}
        />

        <button
          type="submit" disabled={submitting || createdItem}
          className="w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Submitting..." : createdItem ? "Report Submitted" : "Submit Report"}
        </button>
      </form>

      {createdItem && (
        <div className="bg-white p-6 rounded-lg border border-gray-100 shadow-sm mt-4">
          <h3 className="font-semibold text-gray-800 mb-3">Add a Photo (optional)</h3>
          <ImageUpload
            itemId={createdItem.id}
            currentImageUrl={createdItem.image_url}
            onUploaded={(updated) => setCreatedItem(updated)}
          />
          <button
            onClick={() => navigate(`/items/${createdItem.id}`)}
            className="mt-4 w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700"
          >
            Done — View Report
          </button>
        </div>
      )}
    </div>
  );
}
