import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login } from "../store/authSlice";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch(`${API}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "Login failed");
      }

      // Dispatch Redux login state
      dispatch(login(data.user));
      // Navigate to Dashboard
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4 bg-base-200">
      <div className="w-full max-w-sm shadow-xl card bg-base-100">
        <div className="card-body">
          <div className="mb-6 text-center">
            <h2 className="text-3xl font-bold text-base-content">
              Welcome Back
            </h2>
            <p className="mt-2 text-base-content/70">Sign in to continue</p>
          </div>

          {error && (
            <div className="alert alert-error mb-4 rounded-box p-3 shadow-sm">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="stroke-current shrink-0 h-6 w-6"
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
              <label className="justify-end pb-0 label">
                <a
                  href="#"
                  className="mt-1 font-medium label-text-alt link link-hover text-primary"
                >
                  Forgot password?
                </a>
              </label>
            </div>

            <div className="form-control">
              <label className="justify-start gap-2 cursor-pointer label">
                <input
                  id="remember_me"
                  name="remember_me"
                  type="checkbox"
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <span className="label-text">Remember me</span>
              </label>
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
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-sm text-center text-base-content/70">
            Not a member?{" "}
            <Link
              to="/register"
              className="font-medium link link-primary hover:text-primary-focus"
            >
              Register now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
