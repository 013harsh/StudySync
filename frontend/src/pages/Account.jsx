import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { login } from "../store/authSlice";

const API = import.meta.env.VITE_API_URL || "http://localhost:3000";

const Account = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();

  const firstName = user?.fullName?.firstName || "Guest";
  const lastName = user?.fullName?.lastName || "User";
  const email = user?.email || "guest@example.com";

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [formData, setFormData] = useState({
    fullName: `${firstName} ${lastName}`.trim(),
  });

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccessMsg("");
    setErrorMsg("");

    try {
      const nameParts = formData.fullName.trim().split(" ");
      const newFirstName = nameParts[0];
      const newLastName = nameParts.slice(1).join(" ") || " ";

      const res = await fetch(`${API}/api/auth/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update profile");

      // Cascade Redux & LocalStorage update
      dispatch(login(data.user));
      setSuccessMsg("Profile updated successfully!");
    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-16 bg-gradient-to-br from-base-200 via-base-100 to-base-300">
      {/* ── Header ── */}
      <div className="relative pt-16 pb-12 mb-10 overflow-hidden border-b shadow-sm bg-primary/5 border-primary/10">
        {/* Decorative subtle background circle */}
        <div className="absolute top-[-50%] right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl px-4 mx-auto sm:px-6 lg:px-8">
          <div className="flex flex-col items-center gap-6 md:flex-row md:gap-8">
            <div className="avatar indicator">
              <span className="p-2 border-2 shadow-md indicator-item badge badge-success border-base-100"></span>
              <div className="transition-transform rounded-full shadow-xl w-28 h-28 ring-4 ring-primary/20 ring-offset-base-100 ring-offset-4 hover:scale-105">
                <img
                  src={`https://ui-avatars.com/api/?name=${firstName}+${lastName}&background=random&size=150`}
                  alt="Avatar"
                />
              </div>
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-4xl font-extrabold tracking-tight text-base-content">
                {firstName} {lastName}
              </h1>
              <p className="flex items-center justify-center gap-2 mt-2 font-medium text-primary md:justify-start">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  className="w-5 h-5 opacity-80"
                >
                  <path d="M3 4a2 2 0 00-2 2v1.161l8.441 4.221a1.25 1.25 0 001.118 0L19 7.162V6a2 2 0 00-2-2H3z" />
                  <path d="M19 8.839l-7.77 3.885a2.75 2.75 0 01-2.46 0L1 8.839V14a2 2 0 002 2h14a2 2 0 002-2V8.839z" />
                </svg>
                {email}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl px-4 mx-auto space-y-8 sm:px-6 lg:px-8">
        {/* ── Main Layout (Grid) ── */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Left Column (Forms) */}
          <div className="space-y-8 lg:col-span-2">
            {/* Profile Settings Card */}
            <div className="transition-all border shadow-xl card bg-base-100 border-base-200/50 backdrop-blur-sm hover:shadow-2xl">
              <div className="card-body">
                <h2 className="flex items-center gap-3 mb-4 text-2xl font-bold card-title">
                  <span className="p-2 rounded-lg bg-primary/10 text-primary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM3.465 14.493a1.23 1.23 0 00.41 1.412A9.957 9.957 0 0010 18c2.31 0 4.438-.784 6.131-2.1.43-.333.604-.903.408-1.41a7.002 7.002 0 00-13.074.003z" />
                    </svg>
                  </span>
                  Personal Details
                </h2>

                <form className="space-y-5" onSubmit={handleSubmit}>
                  {successMsg && (
                    <div className="p-3 mb-4 shadow-sm alert alert-success rounded-box">
                      <span className="text-sm font-medium">{successMsg}</span>
                    </div>
                  )}
                  {errorMsg && (
                    <div className="p-3 mb-4 shadow-sm alert alert-error rounded-box">
                      <span className="text-sm font-medium">{errorMsg}</span>
                    </div>
                  )}
                  <div className="form-control">
                    <label className="font-semibold label text-base-content/80">
                      <span className="label-text">Full Name</span>
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full transition-shadow input input-bordered focus:input-primary bg-base-200/30"
                      required
                    />
                  </div>
                  <div className="form-control">
                    <label className="font-semibold label text-base-content/80">
                      <span className="label-text">Email Address</span>
                    </label>
                    <input
                      type="email"
                      defaultValue={email}
                      className="w-full cursor-not-allowed input input-bordered bg-base-200/50 text-base-content/60"
                      disabled
                    />
                    <label className="py-1 label">
                      <span className="label-text-alt text-base-content/50">
                        Your email cannot be changed at this time.
                      </span>
                    </label>
                  </div>

                  <div className="justify-end mt-6 card-actions">
                    <button
                      type="submit"
                      className="px-8 transition-all shadow-lg btn btn-primary shadow-primary/30 hover:shadow-xl"
                      disabled={loading}
                    >
                      {loading ? (
                        <span className="loading loading-spinner"></span>
                      ) : (
                        "Save Changes"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Application Preferences Card */}
            <div className="border shadow-xl card bg-base-100 border-base-200/50">
              <div className="card-body">
                <h2 className="flex items-center gap-3 mb-4 text-2xl font-bold card-title">
                  <span className="p-2 rounded-lg bg-secondary/10 text-secondary">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      className="w-5 h-5"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm-4.328-9.757l4.596 4.596a2 2 0 102.828-2.828l-4.596-4.596a2 2 0 00-2.828 2.828z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  Preferences
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 transition-colors border rounded-xl bg-base-200/30 border-base-200 hover:border-primary/30">
                    <div>
                      <h4 className="font-bold text-base-content">
                        Email Notifications
                      </h4>
                      <p className="text-sm text-base-content/60">
                        Receive alerts for upcoming due dates & group
                        activities.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-md"
                      defaultChecked
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 transition-colors border rounded-xl bg-base-200/30 border-base-200 hover:border-primary/30">
                    <div>
                      <h4 className="font-bold text-base-content">
                        Weekly Report
                      </h4>
                      <p className="text-sm text-base-content/60">
                        A summary of your study progress.
                      </p>
                    </div>
                    <input
                      type="checkbox"
                      className="toggle toggle-primary toggle-md"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column (Sidebar) */}
          <div className="space-y-8">
            {/* Quick Stats or Extra Info */}
            <div className="shadow-xl card bg-gradient-to-br from-primary to-primary-focus text-primary-content">
              <div className="card-body">
                <h2 className="card-title text-primary-content/90">
                  Premium Member
                </h2>
                <p className="mt-2 text-sm text-primary-content/80">
                  You currently have access to all StudySync tools, planners,
                  and collaboration features.
                </p>
                <div className="mt-4">
                  <button className="w-full border-none shadow-md btn btn-sm text-primary bg-primary-content hover:bg-base-100">
                    Manage Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="border shadow-md card bg-error/5 border-error/20">
              <div className="card-body">
                <h2 className="flex items-center gap-2 card-title text-error">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  Danger Zone
                </h2>
                <p className="mt-1 mb-4 text-sm text-base-content/70">
                  Permanently delete your account and remove all associated
                  data. This action cannot be undone.
                </p>
                <button className="w-full btn btn-outline btn-error">
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
