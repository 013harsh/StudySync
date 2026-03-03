/* GroupsTable — DaisyUI semantic tokens only */

function TypeBadge({ type }) {
  return type === "study" ? (
    <span className="font-semibold badge badge-primary badge-sm">📚 Study</span>
  ) : (
    <span className="font-semibold badge badge-secondary badge-sm">
      👥 Friend
    </span>
  );
}

function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className="font-semibold badge badge-warning badge-sm">⭐ Admin</span>
  ) : (
    <span className="badge badge-ghost badge-sm">Member</span>
  );
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

const GroupsTable = ({ groups, loading, error }) => {
  /* Loading */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base text-base-content/50">Loading your groups…</p>
      </div>
    );
  }

  /* Error */
  if (error) {
    return (
      <div className="flex items-start gap-3 alert alert-error rounded-xl">
        <span className="text-xl">❌</span>
        <div>
          <p className="text-base font-bold">Failed to load groups</p>
          <p className="text-sm opacity-80 mt-0.5">{error}</p>
        </div>
      </div>
    );
  }

  /* Empty */
  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <span className="text-6xl">📭</span>
        <p className="text-xl font-bold text-base-content/60">No groups yet</p>
        <p className="text-base text-base-content/40">
          Create or join a group to get started.
        </p>
      </div>
    );
  }

  /* Table */
  return (
    <div className="overflow-x-auto border rounded-xl border-base-300">
      <table className="table w-full text-base table-zebra">
        <thead className="text-xs tracking-widest uppercase bg-primary/10 text-primary">
          <tr>
            <th className="font-bold">Group</th>
            <th className="font-bold">Type</th>
            <th className="font-bold">Role</th>
            <th className="font-bold">Members</th>
            <th className="hidden font-bold sm:table-cell">Created</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g._id} className="align-middle cursor-pointer hover">
              <td>
                <p className="font-bold text-base-content">{g.name}</p>
                {g.description && (
                  <p className="text-sm text-base-content/40 mt-0.5 line-clamp-1 hidden sm:block">
                    {g.description}
                  </p>
                )}
              </td>
              <td>
                <TypeBadge type={g.type} />
              </td>
              <td>
                <RoleBadge role={g.myRole} />
              </td>
              <td>
                <span className="font-bold text-primary">{g.memberCount}</span>
                <span className="hidden ml-1 text-xs text-base-content/40 sm:inline">
                  {g.memberCount === 1 ? "member" : "members"}
                </span>
              </td>
              <td className="hidden text-sm sm:table-cell text-base-content/40">
                {formatDate(g.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupsTable;
