import { useState, useRef } from "react";
import { useDispatch } from "react-redux";
import { createGroup } from "../../store/action/group.action";
import { useNavigate } from "react-router-dom";

const CreateGroupModal = ({ modalId = "create_group_modal", onSuccess }) => {
  const dialogRef = useRef(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState("study");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const navigate = useNavigate();

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
  const dispatch = useDispatch();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const group = await dispatch(
        createGroup({
          name: name.trim(),
          description: description.trim(),
          type,
        }),
      );

      setSuccess(`Group created successfully!`);
      onSuccess?.();
      setTimeout(() => {
        close();
        reset();
        navigate(`/room/${group._id}`);
      }, 100);
    } catch (err) {
      setError(err.message || "Failed to create group");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={open}
        className="w-full h-10 min-h-0 text-sm font-bold btn btn-primary rounded-xl"
      >
        + Create Group
      </button>

      <dialog
        ref={dialogRef}
        id={modalId}
        className="modal modal-bottom sm:modal-middle"
      >
        <div className="w-full max-w-md p-0 overflow-hidden modal-box rounded-2xl">
          <div className="px-6 pt-6 pb-4 bg-primary text-primary-content">
            <h3 className="text-2xl font-black">Create a Group</h3>
            <p className="mt-1 text-sm text-primary-content/70">
              Start collaborating with your classmates.
            </p>
          </div>

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

            <div className="gap-1 form-control">
              <label className="py-0 label">
                <span className="text-base font-bold label-text">
                  Group Name <span className="text-error">*</span>
                </span>
              </label>
              <input
                type="text"
                placeholder="e.g. Physics Batch 2025"
                className="w-full input input-bordered input-primary"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={60}
                disabled={loading}
              />
            </div>

            <div className="gap-1 form-control">
              <label className="py-0 label">
                <span className="text-base font-bold label-text">
                  Description{" "}
                  <span className="font-normal text-base-content/40">
                    (optional)
                  </span>
                </span>
              </label>
              <textarea
                placeholder="What is this group about?"
                className="w-full resize-none textarea textarea-bordered textarea-primary"
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={200}
                disabled={loading}
              />
              <span className="text-xs text-right text-base-content/40">
                {description.length}/200
              </span>
            </div>

            <div className="gap-2 form-control">
              <label className="py-0 label">
                <span className="text-base font-bold label-text">
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
                    <span className="text-sm font-bold text-base-content">
                      {opt.label}
                    </span>
                    <span className="text-xs text-base-content/50">
                      {opt.sub}
                    </span>
                  </label>
                ))}
              </div>
            </div>

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
                className="flex-1 font-bold btn btn-primary rounded-xl"
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
