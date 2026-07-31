import { useState, useRef } from "react";
import toast from "react-hot-toast";
import { uploadItemImage, resolveImageUrl } from "../services/uploadService";

const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export default function ImageUpload({ itemId, currentImageUrl, onUploaded }) {
  const [preview, setPreview] = useState(resolveImageUrl(currentImageUrl));
  const [uploading, setUploading] = useState(false);
  const inputRef = useRef(null);

  function handleFileSelect(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_TYPES.includes(file.type)) {
      toast.error("Only JPG, PNG, or WEBP images are allowed");
      return;
    }
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      toast.error(`Image must be under ${MAX_SIZE_MB}MB`);
      return;
    }

    setPreview(URL.createObjectURL(file));
    handleUpload(file);
  }

  async function handleUpload(file) {
    setUploading(true);
    try {
      const updated = await uploadItemImage(itemId, file);
      toast.success("Image uploaded");
      onUploaded?.(updated);
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Upload failed");
      setPreview(resolveImageUrl(currentImageUrl));
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        className="h-48 bg-gray-50 border-2 border-dashed border-gray-200 rounded-lg flex items-center justify-center cursor-pointer hover:border-primary-400 overflow-hidden relative"
      >
        {preview ? (
          <img src={preview} alt="Item preview" className="w-full h-full object-cover" />
        ) : (
          <span className="text-gray-400 text-sm">Click to upload an image</span>
        )}

        {uploading && (
          <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm text-gray-600">
            Uploading...
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      <p className="text-xs text-gray-400 mt-1">JPG, PNG or WEBP. Max {MAX_SIZE_MB}MB.</p>
    </div>
  );
}
