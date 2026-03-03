import { useState, useRef } from "react";

const API = "http://localhost:3000";

const CreateGroupModal = ({ modalId = "create_group_modal", onSuccess }) => {
  const dialogRef = useRef(null);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("study");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const reset = () => {
    setName("");
    setDescription("");
    setType("study");
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
    if (!name.trim()) {
      setError("Group name is required.");
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(`${API}/api/group/create`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim(),
          type,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message ?? "Something went wrong");

      setSuccess(
        `"${data.group.name}" created! Invite code: ${data.group.inviteCode}`,
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
        className="btn btn-primary btn-lg rounded-full font-bold w-full"
      >
        📚 Create Study Group
      </button>

      <dialog
        ref={dialogRef}
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="modal-box rounded-2xl p-0 overflow-hidden max-w-md w-full">
          {/* Header */}
          <div className="px-6 pt-6 pb-4 bg-primary text-primary-content">
            <h3 className="text-2xl font-black">Create a Group</h3>
            <p className="text-primary-content/70 text-sm mt-1">
              Start collaborating with your classmates.
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

            {/* Group Name */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text font-bold text-base">
                  Group Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Physics Batch 2025"
                className="input input-bordered input-primary w-full"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                disabled={loading}
              />
            </div>

            {/* Description */}
            <div className="form-control gap-1">
              <label className="label py-0">
                <span className="label-text font-bold text-base">
                  Description{" "}
                  <span className="text-base-content/40 font-normal">
                    (optional)
                  </span>
                </span>
              </label>
              <textarea
                placeholder="What is this group about?"
                className="textarea textarea-bordered textarea-primary w-full resize-none"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                disabled={loading}
              />
              <span className="text-xs text-base-content/40 text-right">
                {description.length}/200
              </span>
            </div>

            {/* Group Type */}
            <div className="form-control gap-2">
              <label className="label py-0">
                <span className="label-text font-bold text-base">
                  Group Type
                </span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {[
                  {
                    value: "study",
                    label: "📚 Study Group",
                    sub: "Academic focus",
                  },
                  {
                    value: "friend",
                    label: "👥 Friend Group",
                    sub: "Social circle",
                  },
                ].map((opt) => (
                  <label
                    key={opt.value}
                    className={`flex flex-col gap-1 p-3 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      type === opt.value
                        ? "border-primary bg-primary/10"
                        : "border-base-300 bg-base-100 hover:border-primary/40"
                    }`}
                  >
                    <input
                      type="radio"
                      name="group-type"
                      value={opt.value}
                      checked={type === opt.value}
                      onChange={() => setType(opt.value)}
                      className="hidden"
                      disabled={loading}
                    />
                    <span className="font-bold text-sm text-base-content">
                      {opt.label}
                    </span>
                    <span className="text-xs text-base-content/50">
                      {opt.sub}
                    </span>
                  </label>
                ))}
              </div>
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
                className="btn btn-primary flex-1 rounded-xl font-bold"
                disabled={loading}
              >
                {loading ? (
                  <span className="loading loading-spinner loading-sm" />
                ) : (
                  "Create Group"
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

export default CreateGroupModal;
