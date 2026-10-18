import { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { joinGroup } from "../../store/action/group.action";
import { useNavigate } from "react-router-dom";

const JoinGroupModal = ({ modalId = "join_group_modal", onSuccess }) => {
  const dialogRef = useRef(null);
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

  const reset = () => {
    setCode("");
    setError(null);
    setSuccess(null);
    setLoading(false);
  };

  const open = () => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    reset();
    dialogRef.current?.showModal();
  };
  const close = () => dialogRef.current?.close();
  const dispatch = useDispatch();
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    const trimmed = code.trim();
    if (!trimmed) {
      setError("Invite code is required");
      return;
    }

    setLoading(true);

    try {
      const result = await dispatch(joinGroup(trimmed));

      setSuccess("You joined the group successfully!");
      onSuccess?.(result?.group);

      setTimeout(() => {
        close();
        reset();
        navigate(`/room/${result.group._id}`);
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to join group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={open}
        className="w-full h-10 min-h-0 text-sm font-bold btn btn-secondary rounded-xl"
      >
        → Join Group
      </button>

      <dialog
        ref={dialogRef}
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="w-full max-w-md p-0 overflow-hidden modal-box rounded-2xl">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-secondary text-secondary-content">
            <h3 className="text-2xl font-black">Join a Group</h3>
            <p className="mt-1 text-sm text-secondary-content/70">
              Enter an invite code shared by the group admin.
            </p>
          </div>

          {/* Body */}
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-4 px-6 py-5 bg-base-100"
          >
            {success && (
              <div className="alert alert-success rounded-xl">
                <span className="text-xl">✅</span>
                <p className="text-sm font-semibold">{success}</p>
              </div>
            )}

            {error && (
              <div className="alert alert-error rounded-xl">
                <span className="text-xl">❌</span>
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            {/* Invite Code */}
            <div className="gap-1 form-control">
              <label className="py-0 label">
                <span className="text-base font-bold label-text">
                  Invite Code <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. A1B2C3"
                className="w-full font-mono text-xl tracking-widest uppercase input input-bordered input-secondary"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={12}
                disabled={loading}
                autoComplete="off"
              />
              <p className="mt-1 text-xs text-base-content/40">
                Codes are case-insensitive. Ask your group admin for the code.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-3 mt-2 modal-action">
              <button
                type="button"
                onClick={close}
                className="flex-1 btn btn-ghost rounded-xl"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 font-bold btn btn-secondary rounded-xl"
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
