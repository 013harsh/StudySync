import { useState } from "react";
import { Link } from "react-router-dom";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Login submitted", formData);
    // Add login logic here
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
              <button type="submit" className="w-full btn btn-primary">
                Sign in
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
