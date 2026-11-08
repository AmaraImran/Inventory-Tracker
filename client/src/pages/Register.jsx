import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthLayout from "../components/AuthLayout";

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", shopName: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await register(form);
      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Create your account" subtitle="Set up your shop in a minute.">
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
        <label>Your name
          <input name="name" value={form.name} onChange={handleChange} required />
        </label>
        <label>Shop name
          <input name="shopName" value={form.shopName} onChange={handleChange} required />
        </label>
        <label>Email
          <input name="email" type="email" value={form.email} onChange={handleChange} required />
        </label>
        <label>Password
          <input name="password" type="password" placeholder="6+ characters" value={form.password} onChange={handleChange} required />
        </label>
        <button type="submit" disabled={loading}>{loading ? "Creating..." : "Create account"}</button>
      </form>
      <p className="switch">Have an account? <Link to="/login">Log in</Link></p>
    </AuthLayout>
  );
}