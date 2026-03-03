const Account = () => {
  return (
    <div className="min-h-screen px-4 py-12 bg-base-200 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-base-content">
            Account Settings
          </h1>
          <p className="mt-2 text-base-content/70">
            Manage your profile, preferences, and subscription.
          </p>
        </div>

        {/* Profile Card */}
        <div className="p-6 border shadow-xl bg-base-100 rounded-2xl border-base-300">
          <h2 className="mb-4 text-xl font-semibold text-base-content">
            Profile Details
          </h2>
          <div className="flex items-center gap-6 mb-6">
            <div className="avatar">
              <div className="w-24 rounded-full ring ring-primary ring-offset-base-100 ring-offset-2">
                <img
                  src="https://ui-avatars.com/api/?name=John+Doe&background=random"
                  alt="Avatar"
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-medium text-base-content">
                John Doe
              </h3>
              <p className="text-base-content/70">john.doe@example.com</p>
              <button className="mt-2 btn btn-sm btn-outline btn-primary">
                Change Avatar
              </button>
            </div>
          </div>

          <form className="max-w-md space-y-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Full Name</span>
              </label>
              <input
                type="text"
                defaultValue="John Doe"
                className="w-full input input-bordered"
              />
            </div>
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                type="email"
                defaultValue="john.doe@example.com"
                className="w-full input input-bordered"
                disabled
              />
            </div>
            <button className="mt-4 btn btn-primary">Save Changes</button>
          </form>
        </div>

        {/* Preferences Card */}
        <div className="p-6 border shadow-xl bg-base-100 rounded-2xl border-base-300">
          <h2 className="mb-4 text-xl font-semibold text-base-content">
            Preferences
          </h2>
          <div className="form-control">
            <label className="justify-start gap-4 cursor-pointer label">
              <input
                type="checkbox"
                className="toggle toggle-primary"
                defaultChecked
              />
              <span className="label-text">
                Receive email notifications for due dates
              </span>
            </label>
          </div>
          <div className="mt-2 form-control">
            <label className="justify-start gap-4 cursor-pointer label">
              <input type="checkbox" className="toggle toggle-primary" />
              <span className="label-text">
                Weekly progress report newsletter
              </span>
            </label>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="p-6 border shadow-xl bg-base-100 rounded-2xl border-error/20">
          <h2 className="mb-4 text-xl font-semibold text-error">Danger Zone</h2>
          <p className="mb-4 text-base-content/70">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button className="btn btn-error btn-outline">Delete Account</button>
        </div>
      </div>
    </div>
  );
};

export default Account;
