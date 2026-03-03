import { useState, useRef } from "react";

const API = "http://localhost:3000";

const JoinGroupModal = ({ modalId = "join_group_modal", onSuccess }) => {
  const dialogRef = useRef(null);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const reset = () => {
    setCode("");
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  const open = () => {
    reset();
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = code.trim().toUpperCase();
    if (!trimmed) {
      setError("Please enter an invite code.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API}/api/group/join`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ inviteCode: trimmed }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Something went wrong");

      setSuccess(
        `You joined "${data.group?.name ?? "the group"}" successfully!`,
      );
      onSuccess?.(data.group);
      setTimeout(() => {
        close();
        reset();
      }, 1800);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={open}
        className="btn btn-secondary btn-lg rounded-full font-bold w-full"
      >
        🔑 Join with Code
      </button>

      <dialog
        ref={dialogRef}
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box rounded-2xl p-0 overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-secondary text-secondary-content">
            <h3 className="text-2xl font-black">Join a Group</h3>
            <p className="text-secondary-content/70 text-sm mt-1">
              Enter an invite code shared by the group admin.
            </p>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="px-6 py-5 bg-base-100 flex flex-col gap-4"
          >
            {success && (
              <div className="alert alert-success rounded-xl">
                <span className="text-xl">✅</span>
                <p className="font-semibold text-sm">{success}</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error rounded-xl">
                <span className="text-xl">❌</span>
                <p className="font-semibold text-sm">{error}</p>
              </div>
            )}

            {/* Invite Code */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text font-bold text-base">
                  Invite Code <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. A1B2C3"
                className="input input-bordered input-secondary w-full text-xl tracking-widest font-mono uppercase"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                disabled={loading}
                autoComplete="off"
              />
              <p className="text-xs text-base-content/40 mt-1">
                Codes are case-insensitive. Ask your group admin for the code.
              </p>
            </div>

            {/* Actions */}
            <div className="modal-action mt-2 flex gap-3">
              <button
                type="button"
                onClick={close}
                className="btn btn-ghost flex-1 rounded-xl"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-secondary flex-1 rounded-xl font-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Join Group"
                )}
              </button>
            </div>
          </form>
        </div>

        <form method="dialog" className="modal-backdrop">
          <button onClick={reset}>close</button>
        </form>
      </dialog>
    </>
  );
};

export default JoinGroupModal;
