import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Registration = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setLoading(true);
    // Split full name into first and last name for backend requirements
    const nameParts = formData.name.trim().split(" ");
    const firstName = nameParts[0];
    const lastName = nameParts.slice(1).join(" ") || " ";

    try {
      const res = await fetch(`${API}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          fullName: { firstName, lastName },
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Registration failed");
      }

      // Dispatch Redux login state
      dispatch(login(data.user));
      // Navigate to Login page
      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-200">
      <div className="w-full max-w-md shadow-xl card bg-base-100">
        <div className="card-body">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-base-content">
              Create Account
            </h2>
            <p className="mt-2 text-base-content/70">
              Join us and start your journey
            </p>
          </div>

          {error && (
            <div className="p-3 mb-4 shadow-sm alert alert-error rounded-box">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 stroke-current shrink-0"
                fill="none"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="form-control">
              <label className="label" htmlFor="name">
                <span className="font-medium label-text">Full Name</span>
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="w-full input input-bordered"
                placeholder="John Doe"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="email">
                <span className="font-medium label-text">Email Address</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="w-full input input-bordered"
                placeholder="you@example.com"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="password">
                <span className="font-medium label-text">Password</span>
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="w-full input input-bordered"
                placeholder="••••••••"
              />
            </div>

            <div className="form-control">
              <label className="label" htmlFor="confirmPassword">
                <span className="font-medium label-text">Confirm Password</span>
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full input input-bordered"
                placeholder="••••••••"
              />
            </div>

            <div className="mt-6 form-control">
              <button
                type="submit"
                className="w-full btn btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner"></span>
                ) : (
                  "Create Account"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center text-base-content/70">
            Already have an account?{" "}
            <Link
              to="/login"
              className="font-medium link link-primary hover:text-primary-focus"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Registration;
