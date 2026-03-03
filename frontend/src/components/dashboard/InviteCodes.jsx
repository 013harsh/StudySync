/* InviteCodes — DaisyUI semantic tokens only */
const InviteCodes = ({ adminGroups }) => {
  if (!adminGroups || adminGroups.length === 0) return null;

  const copy = (code) => navigator.clipboard.writeText(code);

  return (
    <div className="rounded-2xl border border-success/30 bg-success/5 shadow-sm p-5 flex flex-col gap-4">
      <div>
        <h3 className="font-black text-xl text-success">
          📋 Your Invite Codes
        </h3>
        <p className="text-sm text-base-content/50 mt-0.5">
          Share these codes so others can join your groups.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {adminGroups.map((g) => (
          <div
            key={g._id}
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-xl bg-base-100 border border-success/20 shadow-sm"
          >
            <div className="min-w-0">
              <p className="font-semibold text-sm text-base-content truncate">
                {g.name}
              </p>
              <code className="text-success font-mono text-lg tracking-widest font-black">
                {g.inviteCode}
              </code>
            </div>
            <button
              onClick={() => copy(g.inviteCode)}
              title="Copy invite code"
              className="btn btn-ghost btn-sm btn-square text-success hover:bg-success/10"
            >
              📋
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InviteCodes;
