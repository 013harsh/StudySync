/* UserProfileCard — DaisyUI semantic tokens only */
const UserProfileCard = ({ firstName, lastName, email, role }) => {
  const initials =
    `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.toUpperCase();
  const isAdmin = role === "admin";

  return (
    <div className="rounded-2xl border border-base-300 bg-base-100 shadow-sm overflow-hidden">
      {/* Header strip using primary */}
      <div className="h-16 bg-primary" />

      <div className="flex flex-col items-center text-center px-5 pb-6 -mt-8 gap-3">
        {/* Avatar */}
        <div className="avatar placeholder">
          <div className="w-16 h-16 rounded-full bg-primary text-primary-content ring-4 ring-base-100 shadow-md flex items-center justify-center">
            <span className="text-2xl font-black">{initials || "?"}</span>
          </div>
        </div>

        {/* Name */}
        <div>
          <h2 className="text-xl font-black text-base-content">
            {firstName} {lastName}
          </h2>
          <p className="text-sm text-base-content/50 mt-0.5 break-all">
            {email}
          </p>
        </div>

        {/* Role badge */}
        <span
          className={`badge badge-lg font-bold ${isAdmin ? "badge-warning" : "badge-primary"}`}
        >
          {isAdmin ? "⭐ Administrator" : "🎓 Student"}
        </span>

        <div className="divider my-0 w-full" />

        {/* Info rows */}
        <ul className="w-full text-sm space-y-2 text-left">
          <li className="flex justify-between items-center">
            <span className="text-base-content/50 font-medium">Account</span>
            <span className="font-semibold text-base-content capitalize">
              {role}
            </span>
          </li>
          <li className="flex justify-between items-center">
            <span className="text-base-content/50 font-medium">Status</span>
            <span className="badge badge-success badge-sm font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-success-content/60 animate-pulse inline-block mr-1" />
              Active
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default UserProfileCard;
