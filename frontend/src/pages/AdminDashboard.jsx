import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { Pagination, Box, Chip } from "@mui/material";
import { getDashboardStats, getAllUsers, deactivateUser, reactivateUser } from "../services/adminService";
import LoadingSpinner from "../components/loaders/LoadingSpinner";

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const pageSize = 10;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [statsData, usersData] = await Promise.all([
        getDashboardStats(),
        getAllUsers({ page, page_size: pageSize }),
      ]);
      setStats(statsData);
      setUsers(usersData.users);
      setTotal(usersData.total);
    } finally {
      setLoading(false);
    }
  }, [page]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleToggleActive(user) {
    try {
      if (user.is_active) {
        await deactivateUser(user.id);
        toast.success(`${user.full_name} deactivated`);
      } else {
        await reactivateUser(user.id);
        toast.success(`${user.full_name} reactivated`);
      }
      load();
    } catch (err) {
      toast.error("Action failed");
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  if (loading && !stats) {
    return <LoadingSpinner message="Loading dashboard..." />;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        <StatCard label="Total Users" value={stats.total_users} />
        <StatCard label="Total Items" value={stats.total_items} />
        <StatCard label="Lost" value={stats.total_lost} />
        <StatCard label="Found" value={stats.total_found} />
        <StatCard label="Active" value={stats.total_active} />
        <StatCard label="Resolved" value={stats.total_resolved} />
        <StatCard label="Total Claims" value={stats.total_claims} />
        <StatCard label="Pending Claims" value={stats.total_pending_claims} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Users</h2>
        <Chip label={`${total} total`} size="small" variant="outlined" />
      </div>

      <div className="bg-white rounded-lg border border-gray-100 shadow-sm overflow-x-auto">
        <table className="w-full text-sm min-w-[640px]">
          <thead className="bg-gray-50 text-gray-500 text-left">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Email</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-50">
                <td className="px-4 py-3 text-gray-800 whitespace-nowrap">{u.full_name}</td>
                <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{u.email}</td>
                <td className="px-4 py-3">
                  <span className="text-xs font-semibold px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                    {u.role}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded whitespace-nowrap ${
                    u.is_active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {u.is_active ? "Active" : "Deactivated"}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  {u.role !== "ADMIN" && (
                    <button
                      onClick={() => handleToggleActive(u)}
                      className="text-xs font-medium text-primary-600 hover:underline"
                    >
                      {u.is_active ? "Deactivate" : "Reactivate"}
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={(e, value) => setPage(value)}
            color="primary"
          />
        </Box>
      )}
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="bg-white rounded-lg border border-gray-100 shadow-sm p-4">
      <div className="text-2xl font-bold text-gray-800">{value}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
    </div>
  );
}
