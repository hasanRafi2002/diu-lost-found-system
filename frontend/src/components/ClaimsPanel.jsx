import { useState } from "react";
import toast from "react-hot-toast";
import { approveClaim, rejectClaim } from "../services/claimService";

const STATUS_STYLES = {
  PENDING: "bg-yellow-100 text-yellow-700",
  APPROVED: "bg-green-100 text-green-700",
  REJECTED: "bg-red-100 text-red-600",
  CANCELLED: "bg-gray-100 text-gray-400",
};

const COPY = {
  FOUND: {
    panelTitle: "Claims on this item",
    approveConfirm: (name) =>
      `Confirm ${name} is the true owner? This resolves the item and rejects other pending claims.`,
    approveToast: "Claim approved — item marked resolved",
    approveLabel: "Approve",
    rejectLabel: "Reject",
  },
  LOST: {
    panelTitle: "People who say they found this",
    approveConfirm: (name) =>
      `Confirm ${name} found your item? This resolves the item, notifies them, and rejects other responses.`,
    approveToast: "Confirmed — item marked resolved, finder notified",
    approveLabel: "Confirm & Resolve",
    rejectLabel: "Not a Match",
  },
};

export default function ClaimsPanel({ claims, itemType, onChanged }) {
  const copy = COPY[itemType] || COPY.FOUND;
  const [busyId, setBusyId] = useState(null);

  async function handleApprove(claim) {
    if (!window.confirm(copy.approveConfirm(claim.claimant.full_name))) return;
    setBusyId(claim.id);
    try {
      await approveClaim(claim.id);
      toast.success(copy.approveToast);
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to approve");
    } finally {
      setBusyId(null);
    }
  }

  async function handleReject(claim) {
    setBusyId(claim.id);
    try {
      await rejectClaim(claim.id);
      toast.success("Marked as not a match");
      onChanged?.();
    } catch (err) {
      toast.error(err.response?.data?.detail || "Failed to reject");
    } finally {
      setBusyId(null);
    }
  }

  if (claims.length === 0) {
    return <p className="text-gray-400 text-sm">Nothing submitted yet.</p>;
  }

  return (
    <div className="space-y-3">
      {claims.map((claim) => (
        <div key={claim.id} className="border border-gray-100 rounded-lg p-4 bg-white">
          <div className="flex items-center justify-between mb-2">
            <span className="font-medium text-gray-800">{claim.claimant.full_name}</span>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded ${STATUS_STYLES[claim.status]}`}>
              {claim.status}
            </span>
          </div>

          <p className="text-sm text-gray-600">{claim.message}</p>
          {claim.proof_text && (
            <p className="text-sm text-gray-500 mt-1 italic">{claim.proof_text}</p>
          )}

          {claim.status === "APPROVED" && (
            <div className="text-sm text-gray-500 mt-2 border-t border-gray-50 pt-2">
              Contact: {claim.claimant.email}
              {claim.claimant.phone && ` • ${claim.claimant.phone}`}
            </div>
          )}

          {claim.status === "PENDING" && (
            <div className="flex gap-2 mt-3">
              <button
                onClick={() => handleApprove(claim)}
                disabled={busyId === claim.id}
                className="bg-green-600 text-white px-3 py-1.5 rounded-md text-xs font-medium hover:bg-green-700 disabled:opacity-50"
              >
                {copy.approveLabel}
              </button>
              <button
                onClick={() => handleReject(claim)}
                disabled={busyId === claim.id}
                className="bg-red-50 text-red-600 px-3 py-1.5 rounded-md text-xs font-medium hover:bg-red-100 disabled:opacity-50"
              >
                {copy.rejectLabel}
              </button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
