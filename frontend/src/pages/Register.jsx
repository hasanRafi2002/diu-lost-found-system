import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { registerUser } from "../services/authService";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    student_id: "",
    department: "",
    phone: "",
    password: "",
  });
  const [submitting, setSubmitting] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await registerUser(form);
      toast.success("Account created! Please log in.");
      navigate("/login");
    } catch (err) {
      const message = err.response?.data?.detail || "Registration failed";
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-12 bg-white p-8 rounded-lg shadow-sm border border-gray-100">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Create Account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="full_name" placeholder="Full Name" required
          value={form.full_name} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          name="email" type="email" placeholder="DIU Email" required
          value={form.email} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          name="student_id" placeholder="Student ID (optional)"
          value={form.student_id} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          name="department" placeholder="Department (optional)"
          value={form.department} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          name="phone" placeholder="Phone (optional)"
          value={form.phone} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />
        <input
          name="password" type="password" placeholder="Password (min 8 characters)" required
          minLength={8}
          value={form.password} onChange={handleChange}
          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary-500"
        />

        <button
          type="submit" disabled={submitting}
          className="w-full bg-primary-600 text-white py-2.5 rounded-md font-medium hover:bg-primary-700 disabled:opacity-50"
        >
          {submitting ? "Creating account..." : "Register"}
        </button>
      </form>

      <p className="text-sm text-gray-500 mt-4 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-primary-600 font-medium">Login</Link>
      </p>
    </div>
  );
}
