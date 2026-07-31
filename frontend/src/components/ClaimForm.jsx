import { useState } from "react";
import toast from "react-hot-toast";
import { submitClaim } from "../services/claimService";

const COPY = {
  FOUND: {
    triggerLabel: "This is Mine — Submit a Claim",
    heading: "Submit a Claim",
    messagePlaceholder: "Explain why this item belongs to you...",
    proofPlaceholder: "Optional: proof details (serial number, distinguishing marks)",
    submitLabel: "Submit Claim",
    successToast: "Claim submitted. The reporter will review it.",
    minLengthError: "Please write at least 10 characters describing why this is yours",
  },
  LOST: {
    triggerLabel: "I Found This — Notify the Reporter",
    heading: "Let the Reporter Know",
    messagePlaceholder: "Where and when did you find it? Add any details that help confirm it's theirs...",
    proofPlaceholder: "Optional: additional details (condition, exact location, contents)",
    submitLabel: "Send Notification",
    successToast: "The reporter has been notified that you found their item.",
    minLengthError: "Please write at least 10 characters describing what you found",
  },
};

export default function ClaimForm({ itemId, itemType, onSubmitted }) {
  const copy = COPY[itemType] || COPY.FOUND;

  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [proofText, setProofText] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (message.trim().length < 10) {
      toast.error(copy.minLengthError);
      return;
    }
    setSubmitting(true);
    try {
      await submitClaim(itemId, { message, proof_text: proofText || null });
      toast.success(copy.successToast);
      setOpen(false);
      setMessage("");
      setProofText("");
      onSubmitted?.();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === "string" ? detail : "Failed to submit");
    } finally {
      setSubmitting(false);
    }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="bg-primary-600 text-white px-5 py-2.5 rounded-md font-medium hover:bg-primary-700"
      >
        {copy.triggerLabel}
      </button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-primary-50 border border-primary-100 rounded-lg p-4 space-y-3"
    >
      <h3 className="font-semibold text-gray-800">{copy.heading}</h3>

      <textarea
        rows={3}
        placeholder={copy.messagePlaceholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <textarea
        rows={2}
        placeholder={copy.proofPlaceholder}
        value={proofText}
        onChange={(e) => setProofText(e.target.value)}
        className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
      />

      <div className="flex gap-2">
        <button
          type="submit" disabled={submitting}
          className="bg-primary-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Sending..." : copy.submitLabel}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="bg-white border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
