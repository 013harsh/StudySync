import { useState } from "react";
import { Link } from "react-router-dom";

const Registration = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
    console.log("Registration submitted", formData);
    // Add registration logic here
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
              <button type="submit" className="w-full btn btn-primary">
                Create Account
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
