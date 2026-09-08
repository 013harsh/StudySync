import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { deleteGroup } from "../../store/action/group.action";

function TypeBadge({ type }) {
  return type === "study" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-primary bg-primary/10 border border-primary/20 rounded-full">📚 Study</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-secondary bg-secondary/10 border border-secondary/20 rounded-full">
      👥 Friend
    </span>
  );
}

function RoleBadge({ role }) {
  return role === "admin" ? (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-warning-content bg-warning/20 border border-warning/30 rounded-full">⭐ Admin</span>
  ) : (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold text-base-content/70 bg-base-300 border border-base-300 rounded-full">Member</span>
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
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleDelete = async (e, groupId) => {
    e.stopPropagation();
    dispatch(deleteGroup(groupId));
  };

  const handleRowClick = (groupId) => {
    navigate(`/room/${groupId}`);
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20">
        <span className="loading loading-spinner loading-lg text-primary" />
        <p className="text-base text-base-content/50">Loading your groups…</p>
      </div>
    );
  }

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
            <th className="font-bold">Delete</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr
              key={g._id}
              className="align-middle cursor-pointer hover"
              onClick={() => handleRowClick(g._id)}
            >
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
              <td className="flex items-center gap-2">
                {g.myRole === "admin" && (
                  <button
                    onClick={(e) => handleDelete(e, g._id)}
                    className="btn btn-error btn-sm"
                  >
                    Delete
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default GroupsTable;
